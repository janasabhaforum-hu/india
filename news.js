// news.js

// --- Safety check (firebase.js must define db) ---
if (typeof db === "undefined") {
  const el = document.getElementById("newsList");
  if (el) el.innerHTML = "<div class='error'>Error: db is not defined. firebase.js not loaded.</div>";
  throw new Error("db is not defined");
}

const newsList = document.getElementById("newsList");
const communityFilter = document.getElementById("communityFilter"); // <select id="communityFilter">
const searchBox = document.getElementById("searchBox");             // <input id="searchBox">

let allItems = [];

// --- Helpers ---
function formatDate(ts) {
  if (!ts) return "";
  try {
    // Firestore Timestamp
    if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
    // JS Date or date string
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  } catch {
    return "";
  }
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Make URLs clickable (safe)
function linkifySafe(text) {
  // text is already escaped; we only turn http(s) into links
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return String(text).replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

function extractYouTubeId(url) {
  const m = String(url || "").match(/(?:v=|\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

/**
 * Convert some Google Drive links into direct-view image links.
 * Facebook photo links generally cannot be embedded as <img>.
 */
function normalizeImageUrl(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) return "";

  const driveMatch = u.match(/drive\.google\.com\/file\/d\/([^\/]+)\//i);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  const openId = u.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (openId && openId[1]) {
    return `https://drive.google.com/uc?export=view&id=${openId[1]}`;
  }
  return u;
}

function renderMedia(n) {
  const type = (n.mediaType || "").toLowerCase();
  const rawUrl = (n.mediaUrl || "").trim();
  if (!rawUrl) return "";

  if (type === "image") {
    const url = normalizeImageUrl(rawUrl);
    if (!url) return "";
    return `
      <div style="margin-top:10px;">
        <img src="${escapeHtml(url)}"
             alt="news image"
             style="max-width:100%; border-radius:12px; border:1px solid #eee;">
      </div>
    `;
  }

  if (type === "youtube") {
    const id = extractYouTubeId(rawUrl);
    if (!id) return "";
    return `
      <div style="margin-top:10px; aspect-ratio:16/9;">
        <iframe
          width="100%" height="100%"
          style="border:0;border-radius:12px;"
          src="https://www.youtube.com/embed/${id}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
    `;
  }

  return "";
}

// --- Render UI ---
function render() {
  const selectedCommunity = communityFilter ? communityFilter.value : "ALL";
  const q = searchBox ? searchBox.value.trim().toLowerCase() : "";

  let items = [...allItems];

  // ✅ Community filter (matches your dropdown values)
  if (selectedCommunity !== "ALL") {
    items = items.filter(n => String(n.community || "").trim() === selectedCommunity);
  }

  // ✅ Search (title/content/reporter/community/category)
  if (q) {
    items = items.filter(n => {
      const title = String(n.title || "").toLowerCase();
      const content = String(n.content || "").toLowerCase();
      const reporter = String(n.reporterName || "").toLowerCase();
      const community = String(n.community || "").toLowerCase();
      const category = String(n.category || "").toLowerCase();
      return (
        title.includes(q) ||
        content.includes(q) ||
        reporter.includes(q) ||
        community.includes(q) ||
        category.includes(q)
      );
    });
  }

  if (!items.length) {
    newsList.innerHTML = "<div class='error'>No news found.</div>";
    return;
  }

  newsList.innerHTML = items.map(n => {
    const safeTitle = escapeHtml(n.title || "");
    const safeCategory = escapeHtml(n.category || "General");
    const safeCommunity = escapeHtml(n.community || "All Communities");
    const safeReporter = escapeHtml(n.reporterName || "Admin");

    // date field fallback: date -> createdAt
    const dateValue = n.date || n.createdAt;
    const safeDate = escapeHtml(formatDate(dateValue));

    const safeContent = escapeHtml(n.content || "");
    const contentHtml = linkifySafe(safeContent).replace(/\n/g, "<br>");

    return `
      <article class="post">
        <h2 class="title">${safeTitle}</h2>

        <div class="meta">
          <span class="badge">${safeCategory}</span>
          <span class="badge">${safeCommunity}</span>
          <span><b>Date:</b> ${safeDate}</span>
          <span><b>Reporter:</b> ${safeReporter}</span>
        </div>

        <div class="content">${contentHtml}</div>

        ${renderMedia(n)}
      </article>
    `;
  }).join("");
}

// --- Load from Firestore ---
async function loadNews() {
  if (newsList) newsList.innerHTML = "<div class='loading'>Loading…</div>";

  try {
    // Prefer createdAt, fallback to date if your old docs use date.
    // If your collection has BOTH, keep using createdAt going forward.
    let snap;

    try {
      snap = await db.collection("news")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
    } catch (err) {
      // fallback (older schema)
      snap = await db.collection("news")
        .orderBy("date", "desc")
        .limit(50)
        .get();
    }

    allItems = [];
    snap.forEach(doc => allItems.push({ id: doc.id, ...doc.data() }));

    render();
  } catch (e) {
    if (newsList) newsList.innerHTML = "<div class='error'>Error: " + escapeHtml(e.message) + "</div>";
  }
}

// Events
if (communityFilter) communityFilter.addEventListener("change", render);
if (searchBox) searchBox.addEventListener("input", render);

// Start
loadNews();

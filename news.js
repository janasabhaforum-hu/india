// news.js

// --- Safety check (firebase.js must define db) ---
if (typeof db === "undefined") {
  const el = document.getElementById("newsList");
  if (el) el.innerHTML = "<div class='error'>Error: db is not defined. firebase.js not loaded.</div>";
  throw new Error("db is not defined");
}

console.log("firebase loaded?", typeof firebase);
console.log("db loaded?", typeof db);

const newsList = document.getElementById("newsList");
const communityFilter = document.getElementById("communityFilter");
const searchBox = document.getElementById("searchBox");

let allItems = [];

// --- Helpers ---
function formatDate(ts) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleString();
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

// Make URLs clickable
function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return String(text).replace(urlRegex, (url) => {
    const safe = escapeHtml(url);
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
  });
}

function extractYouTubeId(url) {
  const m = String(url || "").match(/(?:v=|\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function renderMedia(n) {
  const type = (n.mediaType || "").toLowerCase();
  const url = (n.mediaUrl || "").trim();
  if (!url) return "";

  if (type === "image") {
    return `
      <div style="margin-top:10px;">
        <img src="${escapeHtml(url)}"
             alt="news image"
             style="max-width:100%; border-radius:12px; border:1px solid #eee;">
      </div>
    `;
  }

  if (type === "youtube") {
    const id = extractYouTubeId(url);
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

  let items = allItems;

  // Filter by community
  if (selectedCommunity !== "ALL") {
    items = items.filter(n => (n.community || "") === selectedCommunity);
  }

  // Search
  if (q) {
    items = items.filter(n =>
      (n.title || "").toLowerCase().includes(q) ||
      (n.content || "").toLowerCase().includes(q) ||
      (n.reporterName || "").toLowerCase().includes(q) ||
      (n.community || "").toLowerCase().includes(q)
    );
  }

  if (!items.length) {
    newsList.innerHTML = "<div class='error'>No news found.</div>";
    return;
  }

  newsList.innerHTML = items.map(n => `
    <article class="post">
      <h2 class="title">${escapeHtml(n.title || "")}</h2>

      <div class="meta">
        <span class="badge">${escapeHtml(n.category || "General")}</span>
        <span class="badge">${escapeHtml(n.community || "All Communities")}</span>
        <span><b>Date:</b> ${escapeHtml(formatDate(n.date))}</span>
        <span><b>Reporter:</b> ${escapeHtml(n.reporterName || "Admin")}</span>
      </div>

      <div class="content">${linkify(escapeHtml(n.content || "")).replace(/\n/g, "<br>")}</div>

      ${renderMedia(n)}
    </article>
  `).join("");
}

// --- Load from Firestore ---
async function loadNews() {
  newsList.innerHTML = "<div class='loading'>Loading…</div>";

  try {
    const snap = await db.collection("news")
      .orderBy("date", "desc")
      .limit(50)
      .get();

    allItems = [];
    snap.forEach(doc => allItems.push({ id: doc.id, ...doc.data() }));

    render();
  } catch (e) {
    newsList.innerHTML = "<div class='error'>Error: " + escapeHtml(e.message) + "</div>";
  }
}

// Events
if (communityFilter) communityFilter.addEventListener("change", render);
if (searchBox) searchBox.addEventListener("input", render);

// Start
loadNews();

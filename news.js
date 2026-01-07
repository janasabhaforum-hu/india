// news.js

// Safety check (shows a clear message if firebase.js failed)
if (typeof db === "undefined") {
  const el = document.getElementById("newsList");
  if (el) {
    el.innerHTML = "<div class='error'>Error: db is not defined. firebase.js not loaded.</div>";
  }
  throw new Error("db is not defined");
}

console.log("firebase loaded?", typeof firebase);
console.log("db loaded?", typeof db);

const newsList = document.getElementById("newsList");
const categoryFilter = document.getElementById("categoryFilter");
const communityFilter = document.getElementById("communityFilter"); // ✅ NEW
const searchBox = document.getElementById("searchBox");

let allItems = [];

function formatDate(ts) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleString();
  } catch {
    return "";
  }
}

// Basic HTML escaping
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  const selectedCategory = categoryFilter ? categoryFilter.value : "ALL";
  const selectedCommunity = communityFilter ? communityFilter.value : "ALL"; // ✅ NEW
  const q = searchBox ? searchBox.value.trim().toLowerCase() : "";

  let items = allItems;

  // ✅ Filter by category
  if (selectedCategory !== "ALL") {
    items = items.filter(n => (n.category || "General") === selectedCategory);
  }

  // ✅ Filter by community
  if (selectedCommunity !== "ALL") {
    items = items.filter(n => (n.community || "") === selectedCommunity);
  }

  // ✅ Search
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

  // ✅ Render
  newsList.innerHTML = items.map(n => `
  <article class="post">
    <h2 class="title">${escapeHtml(n.title || "")}</h2>

    <div class="meta">
      <span class="badge">${escapeHtml(n.category || "General")}</span>
      <span class="badge">${escapeHtml(n.community || "All Communities")}</span>
      <span><b>Date:</b> ${escapeHtml(formatDate(n.date))}</span>
      <span><b>Reporter:</b> ${escapeHtml(n.reporterName || "Admin")}</span>
    </div>

    <div class="content">${linkify(escapeHtml(n.content || ""))}</div>

    ${renderMedia(n)}   <!-- ✅ THIS LINE IS REQUIRED -->
  </article>
`).join("");



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
      </div>`;
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
      </div>`;
  }

  return "";
}


function extractYouTubeId(url) {
  const m = url.match(/(?:v=|\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}



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
if (categoryFilter) categoryFilter.addEventListener("change", render);
if (communityFilter) communityFilter.addEventListener("change", render); // ✅ NEW
if (searchBox) searchBox.addEventListener("input", render);

// Load on start
loadNews();

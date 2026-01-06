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
const searchBox = document.getElementById("searchBox"); // exists in your blog HTML

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
  const selected = categoryFilter ? categoryFilter.value : "ALL";
  const q = searchBox ? searchBox.value.trim().toLowerCase() : "";

  let items = allItems;

  if (selected !== "ALL") {
    items = items.filter(n => (n.category || "General") === selected);
  }

  if (q) {
    items = items.filter(n =>
      (n.title || "").toLowerCase().includes(q) ||
      (n.content || "").toLowerCase().includes(q) ||
      (n.reporterName || "").toLowerCase().includes(q)
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
        <span><b>Date:</b> ${escapeHtml(formatDate(n.date))}</span>
        <span><b>Reporter:</b> ${escapeHtml(n.reporterName || "Admin")}</span>
      </div>

      <div class="content">${escapeHtml(n.content || "")}</div>
    </article>
  `).join("");
}

async function loadNews() {
  newsList.innerHTML = "<div class='loading'>Loading…</div>";

  try {
    const snap = await db.collection("news")
      .orderBy("date", "desc")
      .limit(30)
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
if (searchBox) searchBox.addEventListener("input", render);

// Load on start
loadNews();

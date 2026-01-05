// news.js


if (typeof db === "undefined") {
  document.getElementById("newsList").innerHTML =
    "<p style='color:red;'>Error: db is not defined. firebase.js not loaded.</p>";
  throw new Error("db is not defined");
}




const newsList = document.getElementById("newsList");
const categoryFilter = document.getElementById("categoryFilter");

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate(); // Firestore Timestamp -> JS Date
  return d.toLocaleString(); // shows date+time in local format
}

async function loadNews() {
  newsList.innerHTML = "Loading...";

  try {
    // Always get latest first
    const snap = await db.collection("news")
      .orderBy("date", "desc")
      .limit(10)
      .get();

    const selected = categoryFilter.value;

    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

    const filtered = (selected === "ALL")
      ? items
      : items.filter(n => n.category === selected);

    if (filtered.length === 0) {
      newsList.innerHTML = "<p>No news found.</p>";
      return;
    }

    newsList.innerHTML = filtered.map(n => `
      <div style="border:1px solid #ddd; padding:12px; margin-bottom:10px;">
        <h3 style="margin:0 0 6px 0;">${escapeHtml(n.title || "")}</h3>
        <div style="font-size:13px; color:#555; margin-bottom:8px;">
          <b>Category:</b> ${escapeHtml(n.category || "General")} |
          <b>Date:</b> ${escapeHtml(formatDate(n.date))} |
          <b>Reporter:</b> ${escapeHtml(n.reporterName || "Admin")}
        </div>
        <div>${escapeHtml(n.content || "").replace(/\n/g, "<br>")}</div>
      </div>
    `).join("");

  } catch (e) {
    newsList.innerHTML = "<p style='color:red;'>Error: " + escapeHtml(e.message) + "</p>";
  }
}

// Basic HTML escaping for safety
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

categoryFilter.addEventListener("change", loadNews);

loadNews();





  console.log("firebase.js loaded?", typeof firebase);
  console.log("db loaded?", typeof db);



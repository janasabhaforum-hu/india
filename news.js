// news.js

const communityFilter = document.getElementById("communityFilter");
const categoryFilter = document.getElementById("categoryFilter");
const magCommunity = document.getElementById("magCommunity");
const searchBox = document.getElementById("searchBox");

const featuredWrap = document.getElementById("featuredWrap");
const postsGrid = document.getElementById("postsGrid");
const emptyState = document.getElementById("emptyState");
const latestWrap = document.getElementById("latestWrap");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const pageInfo = document.getElementById("pageInfo");

let allNews = [];
let currentPage = 1;
const PAGE_SIZE = 6;

/* ---------- HELPERS ---------- */
const safe = v => (v || "").toString();

const formatDate = ts =>
  ts?.toDate ? ts.toDate().toLocaleDateString() : "";

const imgUrl = url => {
  const m = safe(url).match(/file\/d\/([^/]+)/);
  return m ? `https://drive.google.com/uc?id=${m[1]}` : url;
};

/* ---------- DROPDOWNS ---------- */
function buildCommunityDropdown() {
  const set = new Set(allNews.map(n => n.community).filter(Boolean));
  const list = ["ALL", ...Array.from(set)];

  communityFilter.innerHTML = "";
  magCommunity.innerHTML = "";

  list.forEach(c => {
    const o1 = new Option(c === "ALL" ? "All" : c, c);
    const o2 = new Option(c === "ALL" ? "All" : c, c);
    communityFilter.add(o1);
    magCommunity.add(o2);
  });
}

function buildCategoryDropdown() {
  const set = new Set(allNews.map(n => n.category).filter(Boolean));
  categoryFilter.innerHTML = `<option value="ALL">All</option>`;
  set.forEach(c => categoryFilter.add(new Option(c, c)));
}

/* ---------- FILTER ---------- */
function getFiltered() {
  const c = communityFilter.value;
  const k = categoryFilter.value;
  const q = searchBox.value.toLowerCase();

  return allNews.filter(n =>
    (c === "ALL" || n.community === c) &&
    (k === "ALL" || n.category === k) &&
    (!q || safe(n.title + n.content).toLowerCase().includes(q))
  );
}

/* ---------- RENDER ---------- */
function render() {
  const items = getFiltered();
  emptyState.style.display = items.length ? "none" : "block";

  if (!items.length) return;

  renderFeatured(items[0]);
  renderCards(items.slice(1));
  renderLatest(items);
}

function renderFeatured(n) {
  featuredWrap.innerHTML = `
    <div class="featured" onclick="openModal('${n.id}')">
      <img src="${imgUrl(n.mediaUrl || '')}">
      <h2>${n.title}</h2>
      <p>${n.content.slice(0,150)}</p>
    </div>`;
}

function renderCards(list) {
  postsGrid.innerHTML = "";
  list.slice(0, PAGE_SIZE).forEach(n => {
    postsGrid.innerHTML += `
      <div class="post" onclick="openModal('${n.id}')">
        <img src="${imgUrl(n.mediaUrl || '')}">
        <h3>${n.title}</h3>
      </div>`;
  });
}

function renderLatest(list) {
  latestWrap.innerHTML = "";
  list.slice(0,5).forEach(n => {
    latestWrap.innerHTML += `<div>${n.title}</div>`;
  });
}

/* ---------- MODAL ---------- */
function openModal(id) {
  const n = allNews.find(x => x.id === id);
  document.getElementById("modal").classList.add("open");
  modalTitle.textContent = n.title;
  modalContent.textContent = n.content;
}
function closeModal(){
  document.getElementById("modal").classList.remove("open");
}

/* ---------- LOAD ---------- */
async function loadNews(){
  const snap = await db.collection("news").orderBy("date","desc").get();
  allNews = snap.docs.map(d => ({ id:d.id, ...d.data() }));

  buildCommunityDropdown();
  buildCategoryDropdown();
  render();
}

/* ---------- EVENTS ---------- */
communityFilter.onchange = categoryFilter.onchange = searchBox.oninput = render;
document.getElementById("btnRefresh").onclick = loadNews;

loadNews();

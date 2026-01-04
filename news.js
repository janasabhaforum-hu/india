// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCqxQKxSaNORdePg8xP6-ePmMr40DisFW0",
  authDomain: "janasabha-app.firebaseapp.com",
  projectId: "janasabha-app",
  storageBucket: "janasabha-app.firebasestorage.app",
  messagingSenderId: "596563440786",
  appId: "1:596563440786:web:4b8264e45afecc411aa24b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔹 Load News
db.collection("news")
  .orderBy("date", "desc")
  .onSnapshot(snapshot => {
    let html = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      html += `
        <article>
          <h3>${data.title}</h3>
          <p>${data.content}</p>
          <hr>
        </article>
      `;
    });

    document.getElementById("news").innerHTML =
      html || "<p>No news published yet.</p>";
  });


function linkify(text) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
}

db.collection("news")
  .orderBy("date", "desc")
  .onSnapshot(snapshot => {
    let html = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      html += `
        <article>
          <h3>${data.title}</h3>
          <p>${linkify(data.content)}</p>
          <hr>
        </article>
      `;
    });

    document.getElementById("news").innerHTML = html;
  });



/* ✏️ Edit News */
function editNews(id) {
  const contentP = document.getElementById(`content-${id}`);
  const oldText = contentP.innerText;

  const newText = prompt("Edit news content:", oldText);
  if (!newText) return;

  db.collection("news").doc(id).update({
    content: newText
  });
}

/* 🗑 Delete News */
function deleteNews(id) {
  if (!confirm("Are you sure you want to delete this news?")) return;

  db.collection("news").doc(id).delete();
}



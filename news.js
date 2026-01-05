// Firebase Config
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
const auth = firebase.auth();

/* Convert links to clickable */
function linkify(text) {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );
}

// 🔹 Detect admin page
const isAdminPage = window.location.pathname.includes("admin.html");

// 🔹 Load news for PUBLIC + ADMIN
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
      `;

      if (isAdminPage) {
        html += `
          <button onclick="editNews('${doc.id}')">Edit</button>
          <button onclick="deleteNews('${doc.id}')">Delete</button>
        `;
      }

      html += `<hr></article>`;
    });

    document.getElementById("news").innerHTML =
      html || "<p>No news available</p>";
  });

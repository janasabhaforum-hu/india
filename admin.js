// 🔹 Firebase Config (paste your own)
const firebaseConfig = {
  apiKey: "AIzaSyCqxQKxSaNORdePg8xP6-ePmMr40DisFW0",
  authDomain: "janasabha-app.firebaseapp.com",
  databaseURL: "https://janasabha-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "janasabha-app",
  storageBucket: "janasabha-app.firebasestorage.app",
  messagingSenderId: "596563440786",
  appId: "1:596563440786:web:4b8264e45afecc411aa24b"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/* 🔐 Login */
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "admin.html")
    .catch(err => alert(err.message));
}

/* 🔒 Protect Admin Page */
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("admin.html")) {
    window.location.href = "login.html";
  }
});

/* 📰 Add News */
function addNews() {
  db.collection("news").add({
    title: document.getElementById("title").value,
    content: document.getElementById("content").value,
    date: new Date()
  }).then(() => {
    alert("News published");
  });
}

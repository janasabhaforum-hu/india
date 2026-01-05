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

const auth = firebase.auth();
const db = firebase.firestore();

/* 🔐 Protect page */
auth.onAuthStateChanged(user => {
  if (!user) window.location.href = "login.html";
});

/* 📰 Publish News */
function publishNews() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const user = auth.currentUser;

  if (!user) return alert("Not logged in");

  db.collection("volunteers").doc(user.uid).get()
    .then(doc => {
      if (!doc.exists) return alert("Volunteer profile missing");

      const reporterName = doc.data().name;

      return db.collection("news").add({
        title,
        content,
        reporter: reporterName,
        date: new Date()
      });
    })
    .then(() => {
      alert("News published");
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";
    });
}




auth.onAuthStateChanged(user => {
  if (!user) return window.location.href = "login.html";

  db.collection("users").doc(user.uid).get()
    .then(doc => {
      if (doc.data().role !== "volunteer") {
        alert("Access denied");
        window.location.href = "login.html";
      }
    });
});


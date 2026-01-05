

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



auth.onAuthStateChanged(user => {
  if (!user) return window.location.href = "login.html";

  db.collection("users").doc(user.uid).get()
    .then(doc => {
      if (doc.data().role !== "admin") {
        alert("Access denied");
        window.location.href = "login.html";
      }
    });
});


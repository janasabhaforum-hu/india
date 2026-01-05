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

/* 🔐 Login */
function login() {
  const email = emailInput();
  const password = passwordInput();

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => {
      document.getElementById("error").innerText = err.message;
    });
}

/* 🔄 Role Redirect */
auth.onAuthStateChanged(user => {
  if (!user) return;

  db.collection("users").doc(user.uid).get()
    .then(doc => {
      if (!doc.exists) {
        alert("User role not assigned");
        return;
      }

      const role = doc.data().role;

      if (role === "admin") {
        window.location.href = "admin.html";
      } else if (role === "volunteer") {
        window.location.href = "volunteer.html";
      } else {
        alert("Invalid role");
      }
    });
});

/* Helpers */
function emailInput() {
  return document.getElementById("email").value;
}
function passwordInput() {
  return document.getElementById("password").value;
}

// firebase.js

var firebaseConfig = {
  apiKey: "AIzaSyCqxQKxSaNORdePg8xP6-ePmMr40DisFW0",
  authDomain: "janasabha-app.firebaseapp.com",
  projectId: "janasabha-app",
  storageBucket: "janasabha-app.firebasestorage.app",
  messagingSenderId: "596563440786",
  appId: "1:596563440786:web:4b8264e45afecc411aa24b"
};

// Prevent duplicate init
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firestore (always needed)
var db = firebase.firestore();

// Auth (needed for admin/login pages)
var auth = firebase.auth();

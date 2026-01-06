// firebase.js
var firebaseConfig = {
  apiKey: "AIzaSyCqxQKxSaNORdePg8xP6-ePmMr40DisFW0",
  authDomain: "janasabha-app.firebaseapp.com",
  projectId: "janasabha-app",
  storageBucket: "janasabha-app.firebasestorage.app",
  messagingSenderId: "596563440786",
  appId: "1:596563440786:web:4b8264e45afecc411aa24b"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ✅ Always create db
var db = firebase.firestore();

// ✅ Only create auth if auth SDK is loaded
var auth = (firebase.auth ? firebase.auth() : null);

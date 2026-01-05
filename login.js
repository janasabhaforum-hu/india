/* 🔐 Login */
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  document.getElementById("error").innerText = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // redirect happens in onAuthStateChanged
  } catch (err) {
    document.getElementById("error").innerText = err.message;
  }
}

/* 🔄 Role Redirect */
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  try {
    const doc = await db.collection("users").doc(user.uid).get();

    if (!doc.exists) {
      document.getElementById("error").innerText =
        "User profile not found in Firestore users/" + user.uid;

      await auth.signOut(); // ✅ important
      return;
    }

    const role = doc.data().role;

    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "volunteer") {
      window.location.href = "volunteer.html";
    } else {
      document.getElementById("error").innerText = "Invalid role in Firestore";
      await auth.signOut(); // ✅ important
    }

  } catch (e) {
    document.getElementById("error").innerText = e.message;
  }
});

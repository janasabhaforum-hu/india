// admin.js

let currentUserData = null;

// Protect page + load reporter info
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const doc = await db.collection("users").doc(user.uid).get();

    if (!doc.exists) {
      alert("User profile not found in Firestore: users/" + user.uid);
      await auth.signOut();
      window.location.href = "login.html";
      return;
    }

    currentUserData = doc.data();

    if (currentUserData.role !== "admin") {
      alert("Access denied (admin only)");
      await auth.signOut();
      window.location.href = "login.html";
      return;
    }

    // Show reporter name (fallback to email if name missing)
    document.getElementById("reporterName").innerText =
      currentUserData.name || user.email;

    document.getElementById("publishBtn").disabled = false;

  } catch (e) {
    alert("Error loading profile: " + e.message);
  }
});

// Publish news
async function addNews() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const category = document.getElementById("category").value;

  if (!title || !content) {
    alert("Please enter title and content");
    return;
  }

  const user = auth.currentUser;
  if (!user || !currentUserData) {
    alert("Not logged in properly. Please login again.");
    window.location.href = "login.html";
    return;
  }

  try {
    const community = document.getElementById("community").value;
    await db.collection("news").add({
  title,
  content,
  category,
  community, // ✅ add this
  reporterName: currentUserData.name || user.email,
  reporterUid: user.uid,
  date: firebase.firestore.FieldValue.serverTimestamp()
});

    alert("News published!");

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

  } catch (e) {
    alert("Publish failed: " + e.message);
  }
}

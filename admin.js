let currentUserData = null;

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

    if ((currentUserData.role || "").toLowerCase() !== "admin") {
      alert("Access denied (admin only)");
      await auth.signOut();
      window.location.href = "login.html";
      return;
    }

    document.getElementById("reporterName").innerText =
      currentUserData.name || user.email;

    document.getElementById("publishBtn").disabled = false;

  } catch (e) {
    alert("Error loading profile: " + e.message);
  }
});

async function addNews() {
  const btn = document.getElementById("publishBtn");
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const category = document.getElementById("category")?.value || "Community News";

  const communityEl = document.getElementById("community");
  const community = communityEl ? communityEl.value : ""; // safe

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
    btn.disabled = true;
    btn.innerText = "Publishing...";

    await db.collection("news").add({
      title,
      content,
      category,
      community,
      reporterName: currentUserData.name || user.email,
      reporterUid: user.uid,
      date: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("News published!");

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

  } catch (e) {
    alert("Publish failed: " + e.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Publish";
  }
}

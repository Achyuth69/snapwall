import { auth, db, FieldValue } from "../src/firebase.js";

/* =========================
   CREATE PROFILE (AFTER EMAIL VERIFIED)
========================= */
export const createProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email;
    const { username, instagram, imageUrl, acceptedTerms } = req.body;

    if (!req.user.email_verified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    if (!username || !imageUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!acceptedTerms) {
      return res.status(400).json({ message: "You must accept Terms and Privacy Policy" });
    }

    await db.collection("users").doc(uid).set({
      email,
      username,
      instagram: instagram || "",
      imageUrl,
      acceptedTerms: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("CREATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    await auth.getUserByEmail(email);

    const resetLink = await auth.generatePasswordResetLink(email);

    res.json({ success: true, resetLink });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);

    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ message: "No account found with this email" });
    }

    res.status(500).json({ message: "Failed to generate reset link" });
  }
};

export const checkUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    res.json({ exists: userDoc.exists });
  } catch (err) {
    console.error("CHECK USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

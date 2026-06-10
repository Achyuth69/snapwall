import { db, FieldValue } from "../src/firebase.js";

export const submitPromotion = async (req, res) => {
  try {
    const { fullName, email, contact, address, message } = req.body;

    if (!fullName || !email || !contact || !address || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await db.collection("promotions").add({
      fullName,
      email,
      contact,
      address,
      message,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Promotion submitted successfully" });
  } catch (error) {
    console.error("PROMOTION ERROR:", error);
    res.status(500).json({ message: "Failed to submit promotion" });
  }
};

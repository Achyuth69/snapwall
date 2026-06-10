import React, { useEffect, useState } from "react";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // 🔄 Auto check when page loads
  useEffect(() => {
    checkVerification();

    // Optional: keep checking every 5 seconds
    const interval = setInterval(checkVerification, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Check email verification status
  const checkVerification = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      navigate("/signup");
      return;
    }

    try {
      setChecking(true);

      await user.reload(); // 🔥 refresh from Firebase

      if (user.emailVerified) {
        await user.getIdToken(true); // 🔥 force refresh token
        navigate("/profile-details");
      } else {
        toast.error("Email not verified yet. Please check your inbox.");
      }
    } catch (err) {
      console.error("Verification check failed:", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  };

  // 📩 Resend verification email
  const resendEmail = async () => {
    if (cooldown) return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please login again.");
      return;
    }

    if (user.emailVerified) {
      toast.error("Email already verified.");
      return;
    }

    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent. Check spam if not in inbox.");

      setCooldown(true);
      setTimeout(() => setCooldown(false), 30000); // 60s cooldown
    } catch (err) {
      console.error("Resend failed:", err);
      toast.error("Failed to send email. Try again later.");
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <h2>Verify your email</h2>
        <p>Please check your inbox and click the verification link.</p>

        <button onClick={checkVerification} disabled={checking}>
          {checking ? "Checking..." : "I have verified"}
        </button>

        <button onClick={resendEmail} disabled={cooldown} className="resend-btn">
          {cooldown ? "Wait 30s..." : "Resend Email"}
        </button>

      </div>
    </div>
  );
};

export default VerifyEmail;

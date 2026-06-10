import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import toast from "react-hot-toast";
import "./Forgot.css";

import img1 from "../assets/image-1.png";
import img2 from "../assets/image-2.png";
import img3 from "../assets/image-3.png";
import img4 from "../assets/image-4.png";
import img5 from "../assets/image-5.png";

const images = [img1, img2, img3, img4, img5];

// Email validation
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // image slider
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => {
        setIndex(nextIndex);
        setNextIndex((nextIndex + 1) % images.length);
        setAnimate(false);
      }, 350);
    }, 6000);

    return () => clearInterval(interval);
  }, [nextIndex]);

  const handleSubmit = async () => {

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }


    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      toast.success("Password reset link sent to your email");

      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else {
        toast.error("Failed to send reset link. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-image">
        <img
          src={images[index]}
          className={`slide-image current ${animate ? "slide-out" : ""}`}
          alt=""
        />
        <img
          src={images[nextIndex]}
          className={`slide-image next ${animate ? "slide-in" : ""}`}
          alt=""
        />
      </div>

      <div className="login-form">
        <h1 className="hero-title">Forgot Password</h1>

        <p className="hero-subtitle">
          Enter your email to reset your password
        </p>
        <div className="form-box">
        <input
          type="email"
          placeholder="Enter email"
          className="input-box"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          disabled={loading}
        />

        <button
          className="verify-btn"
          onClick={handleSubmit}
          disabled={!email || !isValidEmail(email) || loading}
        >
          {loading ? "Sending..." : "Send Link"}
        </button>

        <p className="signup-text">
          Remembered your password?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

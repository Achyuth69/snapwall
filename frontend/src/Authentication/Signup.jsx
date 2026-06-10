import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";


import img1 from "../assets/image-1.png";
import img2 from "../assets/image-2.png";
import img3 from "../assets/image-3.png";
import img4 from "../assets/image-4.png";
import img5 from "../assets/image-5.png";

const images = [img1, img2, img3, img4, img5];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/.test(value);

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result._tokenResponse.isNewUser) {
        toast.success("Account created with Google");
        navigate("/profile-details");
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (err) {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (loading) return;

    if (!email || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must include uppercase, lowercase, number & special character");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCred.user);

      toast.success("Verification email sent. Check your inbox.");
      navigate("/verify-email");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already registered. Please login.");
      } else {
        toast.error("Signup failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    isValidEmail(email) &&
    validatePassword(password) &&
    password === confirmPassword;

  return (
    <div className="login-wrapper">
      {/* LEFT IMAGE */}
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

      {/* RIGHT FORM */}
      <div className="login-form">
        <h1 className="hero-title">
          Capture. Share.
          <br />
          Enjoy.
        </h1>

        <h2 className="login-title">Signup</h2>
        <p className="login-desc">Create your account to continue</p>

        <div className="form-box">
        <input
          type="email"
          placeholder="Enter email"
          className="input-box"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          disabled={loading}
        />
        <div className="password-field">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          className="input-box"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <span
          className="eye-icon"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <div className="password-field">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          className="input-box"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
        <span
          className="eye-icon"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
        >
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
        <p className="password-hint">
          Min 7 chars, with uppercase, lowercase, number & special character.
        </p>

        <button
          className="verify-btn"
          onClick={handleSignup}
          disabled={!isFormValid || loading}
        >
          {loading ? "Sending Verification Email..." : "Verify Email"}
        </button>

        <p className="signup-text">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>


      <button
        className="google-btn"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="google"
        />
        Continue with Google
      </button>
      </div>
      </div>
    </div>
  );
};

export default Signup;

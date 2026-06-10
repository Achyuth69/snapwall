import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";



import img1 from "../assets/image-1.png";
import img2 from "../assets/image-2.png";
import img3 from "../assets/image-3.png";
import img4 from "../assets/image-4.png";
import img5 from "../assets/image-5.png";

const images = [img1, img2, img3, img4, img5];

// ✅ Email validation function
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Image slider states
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

  const handleGoogleLogin = async () => {

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔥 Check if user profile exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // 🚀 New user → needs profile setup
        navigate("/profile-details");
      } else {
        // ✅ Existing user
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("Google sign-in failed. Try again.");
    }
  };


  const handleLogin = async () => {

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }


    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      toast.error("Invalid email or password");
    }
  };

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

        <p className="hero-subtitle">
          Start sharing your moments with the world
        </p>

        <h2 className="login-title">Login</h2>
        <p className="login-desc">Enter your details to continue</p>
        <div className="form-box">
        <input
          type="email"
          placeholder="Enter email"
          className="input-box"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="input-box"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>


        <div className="forgot" onClick={() => navigate("/forgot")}>
          Forgot password?
        </div>

        <button
          className="verify-btn"
          onClick={handleLogin}
          disabled={!email || !password}
        >
          Login
        </button>


        <p className="signup-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/signup")}>Signup</span>
        </p>

        <button className="google-btn" onClick={handleGoogleLogin}>
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

export default Login;

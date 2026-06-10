import { useState } from "react";
import "./Authentication.css";

const Authentication = ({ onClose }) => {
  const [mode, setMode] = useState("login"); // login | signup

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="auth-avatar"></div>

        {mode === "login" ? (
          <>
            <h2>Login</h2>

            <input
              type="text"
              placeholder="Email or Username"
              className="auth-input"
            />

            <input
              type="password"
              placeholder="Password"
              className="auth-input"
            />

            <button className="primary-btn">Login</button>

            <p className="switch-text">
              Don’t have an account?{" "}
              <span onClick={() => setMode("signup")}>Sign up</span>
            </p>
          </>
        ) : (
          <>
            <h2>Sign Up</h2>

            <input
              type="text"
              placeholder="Username"
              className="auth-input"
            />

            <input
              type="email"
              placeholder="Email"
              className="auth-input"
            />

            <input
              type="password"
              placeholder="Password"
              className="auth-input"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="auth-input"
            />

            <button className="primary-btn">Get OTP</button>

            <p className="switch-text">
              Already have an account?{" "}
              <span onClick={() => setMode("login")}>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Authentication;

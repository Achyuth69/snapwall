import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Promotions.css";

const Promotions = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    address: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "promotions"), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      setShowSuccess(true);
      setShowError(false);

      setFormData({
        fullName: "",
        email: "",
        contact: "",
        address: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      setShowError(true);
      setShowSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="promo-page">
      <div className="promo-card">
        <h1>Promotions</h1>
        <p>Fill the form below to promote your brand</p>

        <form onSubmit={handleSubmit}>
          <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} required />
          <textarea name="address" placeholder="Address" rows="3" value={formData.address} onChange={handleChange} required />
          <textarea name="message" placeholder="Promotion Message" rows="4" value={formData.message} onChange={handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Promotion Submitted Successfully</h2>
            <button className="home-btn" onClick={() => navigate("/")}>
              Home
            </button>
          </div>
        </div>
      )}

      {showError && (
        <div className="success-overlay">
          <div className="success-modal error-modal">
            <div className="success-icon error-icon">✕</div>
            <h2>Submission Failed</h2>
            <p className="error-text">
              Something went wrong. Please try again.
            </p>
            <button className="home-btn error-btn" onClick={() => setShowError(false)}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;

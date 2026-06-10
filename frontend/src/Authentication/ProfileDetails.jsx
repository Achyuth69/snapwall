import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileDetails.css";
import { getAuth } from "firebase/auth";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

import img1 from "../assets/image-1.png";
import img2 from "../assets/image-2.png";
import img3 from "../assets/image-3.png";
import img4 from "../assets/image-4.png";
import img5 from "../assets/image-5.png";

const images = [img1, img2, img3, img4, img5];

const ProfileDetails = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [instagram, setInstagram] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // image slider
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => {
        setIndex(nextIndex);
        setNextIndex((prev) => (prev + 1) % images.length);
        setAnimate(false);
      }, 350);
    }, 6000);
    return () => clearInterval(interval);
  }, [nextIndex]);

  useEffect(() => {
    const checkUser = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        navigate("/signup");
        return;
      }

      await user.reload();
      const freshToken = await user.getIdToken(true);

      if (!user.emailVerified) {
        navigate("/verify-email");
        return;
      }

      setToken(freshToken);
    };

    checkUser();
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!imageFile) return toast.error("Profile image is required");
    if (!username.trim()) return toast.error("Username is required");
    if (!instagram.trim()) return toast.error("Instagram ID is required");
    if (!acceptedTerms) return toast.error("You must accept Terms & Privacy Policy");

    try {
      setLoading(true);

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        navigate("/signup");
        return;
      }

      await user.reload();

      if (!user.emailVerified) {
        toast.error("Please verify your email before continuing");
        setLoading(false);
        return;
      }

      const freshToken = await user.getIdToken(true);
      const uid = user.uid;

      // ── Upload profile photo to Supabase Storage ────────────
      const filePath = `${uid}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: true, // overwrite if user re-uploads
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      // ────────────────────────────────────────────────────────

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/create-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
          body: JSON.stringify({
            username,
            instagram,
            imageUrl,
            acceptedTerms: true,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      navigate("/success");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    username.trim() && instagram.trim() && imageFile && acceptedTerms && !loading;

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

      <div className="profile-wrapper">
        <h2 className="profile-title">Profile Details</h2>
        <p className="profile-subtitle">Enter your details to continue</p>

        <div className="avatar-section">
          <div className="avatar-circle">
            {preview ? <img src={preview} alt="avatar" /> : <span>+</span>}
          </div>
          <label className="upload-btn">
            Upload Image *
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>
        </div>

        <input
          type="text"
          placeholder="Create SnapWall Username *"
          className="input-box"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Instagram Id *"
          className="input-box"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />

        <div className="terms-box">
          <label className="terms-label">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span>
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        <button className="verify-btn" onClick={handleSave} disabled={!isFormValid}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ProfileDetails;

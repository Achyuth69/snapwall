import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Success.css";

import success from "../assets/success.svg";
import img1 from "../assets/image-1.png";
import img2 from "../assets/image-2.png";
import img3 from "../assets/image-3.png";
import img4 from "../assets/image-4.png";
import img5 from "../assets/image-5.png";

const images = [img1, img2, img3, img4, img5];

const Success = () => {
  const navigate = useNavigate();

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

      {/* RIGHT CONTENT */}
      <div className="success-wrapper">
        <div className="success-card">
          <img
            src={success}
            alt="Success"
            className="success-image"
          />

          <h2 className="success-title">Profile Created Successfully</h2>

          <button
            className="success-btn"
            onClick={() => navigate("/")}
          >
            Explore now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;

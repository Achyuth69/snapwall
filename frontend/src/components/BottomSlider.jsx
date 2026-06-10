import { useEffect, useRef, useState } from "react";
import "./BottomSlider.css";
import bannar from "../assets/bannar.jpg";

const SLIDE_DURATION = 20000;

const slides = [
  { type: "ad" },
  { type: "image", src: bannar, link: "https://yourbrand.com" },
  { type: "ad" },
  { type: "image", src: bannar, link: "https://offerpage.com" },
  { type: "ad" }
];

const BottomSlider = () => {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const intervalRef = useRef(null);
  const startX = useRef(0);
  const pausedRef = useRef(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto slide (desktop)
  useEffect(() => {
    if (isMobile) return;
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setIndex(prev => (prev + 1) % slides.length);
      }
    }, SLIDE_DURATION);
    return () => clearInterval(intervalRef.current);
  }, [isMobile]);

  // Push ads when slide changes
  useEffect(() => {
    if (slides[index].type === "ad") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, [index]);

  // MOBILE → show slider too (not just banner)
  return (
    <div
      className="bottom-slider"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={e => (startX.current = e.touches[0].clientX)}
      onTouchEnd={e => {
        const diff = startX.current - e.changedTouches[0].clientX;
        if (diff > 50) setIndex(i => (i + 1) % slides.length);
        if (diff < -50) setIndex(i => (i - 1 + slides.length) % slides.length);
      }}
    >
      <div
        className="slider-track"
        style={{ transform: `translateX(-${index * 100}vw)` }}
      >
        {slides.map((slide, i) => (
          <div className="slide" key={i}>
            {slide.type === "image" ? (
              <a
                href={slide.link}
                target="_blank"
                rel="noopener noreferrer"
                className="banner-link"
              >
                <img src={slide.src} alt={`slide-${i}`} />
              </a>
            ) : (
              <div className="ad-container">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block" }}
                  data-ad-format="fluid"
                  data-ad-layout-key="-fl+4t-1g-6t+hi"
                  data-ad-client="ca-pub-6632739105153503"
                  data-ad-slot="5786031640"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomSlider;

import { FaMapMarkerAlt, FaShareAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useMemo, useState, useCallback } from "react";
import ShareMemoryModal from "./ShareMemoryModal.jsx";
import "./Card.css";

const Card = ({ memory, isHighlighted }) => {
  const rotation = useMemo(() => Math.random() * 8 - 4, []);
  const offsetY = useMemo(() => Math.random() * 24 - 12, []);
  const [showShare, setShowShare] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [sliding, setSliding] = useState(null); // 'left' | 'right' | null

  const shareLink = `${window.location.origin}/?memory=${memory.id}`;
  const images = memory.imageUrls?.length > 0 ? memory.imageUrls : [memory.imageUrl];
  const hasMultiple = images.length > 1;

  const goTo = useCallback((dir) => {
    setSliding(dir);
    setTimeout(() => {
      setSlideIdx((prev) => {
        if (dir === "right") return (prev + 1) % images.length;
        return (prev - 1 + images.length) % images.length;
      });
      setSliding(null);
    }, 220);
  }, [images.length]);

  // Touch swipe support
  const touchStart = useMemo(() => ({ x: 0 }), []);
  const handleTouchStart = (e) => { touchStart.x = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStart.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? "right" : "left");
  };

  return (
    <>
      <div
        className={`polaroid-card ${isHighlighted ? "highlight" : ""}`}
        style={{ "--rotate": `${rotation}deg`, "--offsetY": `${offsetY}px` }}
      >
        <div className="pin-dot" />

        {/* IMAGE / SLIDESHOW */}
        <div
          className="polaroid-image"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[slideIdx]}
            alt="memory"
            className={sliding ? `slide-${sliding}` : ""}
          />

          {/* Prev / Next arrows */}
          {hasMultiple && (
            <>
              <button className="slide-arrow left" onClick={(e) => { e.stopPropagation(); goTo("left"); }}>
                <FaChevronLeft />
              </button>
              <button className="slide-arrow right" onClick={(e) => { e.stopPropagation(); goTo("right"); }}>
                <FaChevronRight />
              </button>

              {/* Dot indicators */}
              <div className="slide-dots">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`dot ${i === slideIdx ? "active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setSlideIdx(i); }}
                  />
                ))}
              </div>

              {/* Counter */}
              <span className="slide-counter">{slideIdx + 1}/{images.length}</span>
            </>
          )}

          {/* Share button */}
          <button
            className="card-share-btn"
            onClick={(e) => { e.stopPropagation(); setShowShare(true); }}
            title="Share"
          >
            <FaShareAlt />
          </button>
        </div>

        <div className="polaroid-content">
          <div className="user-row">
            <img className="avatar" src={memory.profileImage} alt={memory.username} />
            <span className="username">{memory.username || "Anonymous"}</span>
          </div>
          <p className="caption">"{memory.caption}"</p>
          <div className="location-chip">
            <FaMapMarkerAlt />
            {memory.city}, {memory.country}
          </div>
          <div className="date-text">Pinned on {memory.postedDate}</div>
        </div>
      </div>

      {showShare && (
        <ShareMemoryModal
          imageUrl={images[slideIdx]}
          shareLink={shareLink}
          showSuccess={false}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
};

export default Card;

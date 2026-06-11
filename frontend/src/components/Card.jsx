import { FaMapMarkerAlt, FaShareAlt, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { useMemo, useState, useCallback, useRef } from "react";
import ShareMemoryModal from "./ShareMemoryModal.jsx";
import "./Card.css";

const Card = ({ memory, isHighlighted }) => {
  const rotation = useMemo(() => Math.random() * 8 - 4, []);
  const offsetY = useMemo(() => Math.random() * 24 - 12, []);
  const floatDelay = useMemo(() => Math.random() * 4, []);
  const floatDuration = useMemo(() => 3 + Math.random() * 2, []);

  const [showShare, setShowShare] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [sliding, setSliding] = useState(null);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const dragMoved = useRef(false);

  const shareLink = `${window.location.origin}/?memory=${memory.id}`;
  const images = memory.imageUrls?.length > 0 ? memory.imageUrls : [memory.imageUrl];
  const hasMultiple = images.length > 1;

  const goTo = useCallback((dir) => {
    setSliding(dir);
    setTimeout(() => {
      setSlideIdx((prev) => dir === "right" ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length);
      setSliding(null);
    }, 220);
  }, [images.length]);

  // Touch swipe
  const touchStart = useRef({ x: 0 });
  const handleTouchStart = (e) => { touchStart.current.x = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStart.current.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? "right" : "left");
  };

  // ── Drag handlers ──────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    dragMoved.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
    e.preventDefault();
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true;
    setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleCardClick = () => {
    if (!dragMoved.current) setLightbox(true);
  };

  return (
    <>
      <div
        className={`polaroid-card ${isHighlighted ? "highlight" : ""} ${dragging ? "is-dragging" : ""}`}
        style={{
          "--rotate": `${rotation}deg`,
          "--offsetY": `${offsetY}px`,
          "--float-delay": `${floatDelay}s`,
          "--float-duration": `${floatDuration}s`,
          transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg) translateY(${offsetY}px)`,
          transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease",
          zIndex: dragging ? 999 : undefined,
          cursor: dragging ? "grabbing" : "grab",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={handleCardClick}
      >
        <div className="pin-dot" />

        <div className="polaroid-image" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <img src={images[slideIdx]} alt="memory" className={sliding ? `slide-${sliding}` : ""} />

          {hasMultiple && (
            <>
              <button className="slide-arrow left" onClick={(e) => { e.stopPropagation(); goTo("left"); }}><FaChevronLeft /></button>
              <button className="slide-arrow right" onClick={(e) => { e.stopPropagation(); goTo("right"); }}><FaChevronRight /></button>
              <div className="slide-dots">
                {images.map((_, i) => <span key={i} className={`dot ${i === slideIdx ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setSlideIdx(i); }} />)}
              </div>
              <span className="slide-counter">{slideIdx + 1}/{images.length}</span>
            </>
          )}

          <button className="card-share-btn" onClick={(e) => { e.stopPropagation(); setShowShare(true); }} title="Share"><FaShareAlt /></button>
        </div>

        <div className="polaroid-content">
          <div className="user-row">
            <img className="avatar" src={memory.profileImage} alt={memory.username} />
            <span className="username">{memory.username || "Anonymous"}</span>
          </div>
          <p className="caption">"{memory.caption}"</p>
          <div className="location-chip"><FaMapMarkerAlt />{memory.city}, {memory.country}</div>
          <div className="date-text">Pinned on {memory.postedDate}</div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(false)}><FaTimes /></button>

            <div className="lightbox-image-wrap" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <img src={images[slideIdx]} alt="memory" className={sliding ? `slide-${sliding}` : ""} />
              {hasMultiple && (
                <>
                  <button className="slide-arrow left" onClick={() => goTo("left")}><FaChevronLeft /></button>
                  <button className="slide-arrow right" onClick={() => goTo("right")}><FaChevronRight /></button>
                  <div className="slide-dots">
                    {images.map((_, i) => <span key={i} className={`dot ${i === slideIdx ? "active" : ""}`} onClick={() => setSlideIdx(i)} />)}
                  </div>
                </>
              )}
            </div>

            <div className="lightbox-info">
              <div className="user-row" style={{justifyContent:"center", marginBottom:8}}>
                <img className="avatar" src={memory.profileImage} alt="" />
                <span className="username">{memory.username}</span>
              </div>
              <p className="caption" style={{fontSize:20}}>"{memory.caption}"</p>
              <div className="location-chip" style={{justifyContent:"center", margin:"8px auto"}}>
                <FaMapMarkerAlt />{memory.city}, {memory.country}
              </div>
              <div className="date-text">Pinned on {memory.postedDate}</div>
              <button className="lightbox-share-btn" onClick={() => setShowShare(true)}><FaShareAlt /> Share</button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <ShareMemoryModal imageUrl={images[slideIdx]} shareLink={shareLink} showSuccess={false} onClose={() => setShowShare(false)} />
      )}
    </>
  );
};

export default Card;

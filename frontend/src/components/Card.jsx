import {
  FaMapMarkerAlt, FaShareAlt, FaChevronLeft, FaChevronRight,
  FaTimes, FaHeart, FaRegHeart, FaComment, FaDownload
} from "react-icons/fa";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  doc, updateDoc, arrayUnion, arrayRemove, onSnapshot,
  collection, addDoc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ShareMemoryModal from "./ShareMemoryModal.jsx";
import "./Card.css";

const Card = ({ memory, isHighlighted }) => {
  const navigate = useNavigate();
  const rotation = useMemo(() => Math.random() * 8 - 4, []);
  const offsetY = useMemo(() => Math.random() * 24 - 12, []);
  const floatDelay = useMemo(() => Math.random() * 4, []);
  const floatDuration = useMemo(() => 3 + Math.random() * 2, []);

  const [showShare, setShowShare] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [sliding, setSliding] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [heartBurst, setHeartBurst] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const pos = useRef({ x: 0, y: 0 });
  const [posState, setPosState] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const dragMoved = useRef(false);

  const shareLink = `${window.location.origin}/?memory=${memory.id}`;
  const images = memory.imageUrls?.length > 0 ? memory.imageUrls : [memory.imageUrl];
  const hasMultiple = images.length > 1;
  const user = auth.currentUser;

  // ── Likes realtime ──────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "memories", memory.id), (snap) => {
      if (!snap.exists()) return;
      const likes = snap.data().likes || [];
      setLikeCount(likes.length);
      if (user) setLiked(likes.includes(user.uid));
    });
    return () => unsub();
  }, [memory.id, user]);

  // ── Comments realtime ────────────────────────────────
  useEffect(() => {
    if (!lightbox) return;
    const q = query(collection(db, "memories", memory.id, "comments"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [lightbox, memory.id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    const ref = doc(db, "memories", memory.id);
    if (liked) {
      await updateDoc(ref, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(ref, { likes: arrayUnion(user.uid) });
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 600);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user) return;
    setCommentLoading(true);
    await addDoc(collection(db, "memories", memory.id, "comments"), {
      text: newComment.trim(),
      userId: user.uid,
      username: user.displayName || auth.currentUser?.email?.split("@")[0] || "User",
      avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}`,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
    setCommentLoading(false);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(images[slideIdx]);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "snapwall-memory.jpg"; a.click();
      URL.revokeObjectURL(url);
    } catch { window.open(images[slideIdx], "_blank"); }
  };

  const goTo = useCallback((dir) => {
    setSliding(dir);
    setTimeout(() => {
      setSlideIdx(p => dir === "right" ? (p + 1) % images.length : (p - 1 + images.length) % images.length);
      setSliding(null);
    }, 220);
  }, [images.length]);

  const touchStart = useRef({ x: 0 });
  const handleTouchStart = (e) => { touchStart.current.x = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStart.current.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? "right" : "left");
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    dragMoved.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: posState.x, py: posState.y };
    setDragging(true);
    e.preventDefault();
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true;
    setPosState({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
  }, [dragging]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  return (
    <>
      <div
        className={`polaroid-card ${isHighlighted ? "highlight" : ""} ${dragging ? "is-dragging" : ""}`}
        style={{
          "--float-delay": `${floatDelay}s`,
          "--float-duration": `${floatDuration}s`,
          transform: `translate(${posState.x}px, ${posState.y}px) rotate(${rotation}deg) translateY(${offsetY}px)`,
          transition: dragging ? "none" : "transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease",
          zIndex: dragging ? 999 : undefined,
          cursor: dragging ? "grabbing" : "grab",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={() => { if (!dragMoved.current) setLightbox(true); }}
      >
        <div className="pin-dot" />

        <div className="polaroid-image" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <img src={images[slideIdx]} alt="memory" className={sliding ? `slide-${sliding}` : ""} />
          {hasMultiple && (
            <>
              <button className="slide-arrow left" onClick={(e) => { e.stopPropagation(); goTo("left"); }}><FaChevronLeft /></button>
              <button className="slide-arrow right" onClick={(e) => { e.stopPropagation(); goTo("right"); }}><FaChevronRight /></button>
              <div className="slide-dots">{images.map((_, i) => <span key={i} className={`dot ${i === slideIdx ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setSlideIdx(i); }} />)}</div>
              <span className="slide-counter">{slideIdx + 1}/{images.length}</span>
            </>
          )}
          <button className="card-share-btn" onClick={(e) => { e.stopPropagation(); setShowShare(true); }}><FaShareAlt /></button>
          {heartBurst && <div className="heart-burst">❤️</div>}
        </div>

        <div className="polaroid-content">
          <div className="user-row">
            <img className="avatar" src={memory.profileImage} alt="" />
            <span className="username" onClick={(e) => { e.stopPropagation(); navigate(`/user/${memory.userId}`); }} style={{cursor:"pointer"}}>{memory.username || "Anonymous"}</span>
          </div>
          <p className="caption">"{memory.caption}"</p>
          <div className="location-chip"><FaMapMarkerAlt />{memory.city}, {memory.country}</div>
          <div className="date-text">Pinned on {memory.postedDate}</div>
          <div className="card-actions">
            <button className={`action-btn like-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
              {liked ? <FaHeart /> : <FaRegHeart />} <span>{likeCount}</span>
            </button>
            <button className="action-btn" onClick={(e) => { e.stopPropagation(); setLightbox(true); }}>
              <FaComment /> <span>{comments.length}</span>
            </button>
            <button className="action-btn" onClick={handleDownload}><FaDownload /></button>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>

            {/* Sticky close row — always visible at top while scrolling */}
            <div className="lightbox-header">
              <button className="lightbox-close" onClick={() => setLightbox(false)}><FaTimes /></button>
            </div>

            <div className="lightbox-image-wrap" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <img src={images[slideIdx]} alt="" className={sliding ? `slide-${sliding}` : ""} />
              {hasMultiple && (
                <>
                  <button className="slide-arrow left" onClick={() => goTo("left")}><FaChevronLeft /></button>
                  <button className="slide-arrow right" onClick={() => goTo("right")}><FaChevronRight /></button>
                  <div className="slide-dots">{images.map((_, i) => <span key={i} className={`dot ${i === slideIdx ? "active" : ""}`} onClick={() => setSlideIdx(i)} />)}</div>
                </>
              )}
            </div>

            <div className="lightbox-info">
              <div className="user-row" style={{justifyContent:"center"}}>
                <img className="avatar" src={memory.profileImage} alt="" />
                <span className="username" style={{cursor:"pointer"}} onClick={() => navigate(`/user/${memory.userId}`)}>{memory.username}</span>
              </div>
              <p className="caption" style={{fontSize:18}}>"{memory.caption}"</p>
              <div className="location-chip" style={{margin:"6px auto", justifyContent:"center"}}><FaMapMarkerAlt />{memory.city}, {memory.country}</div>
              <div className="date-text" style={{marginBottom:12}}>Pinned on {memory.postedDate}</div>

              <div className="lightbox-actions">
                <button className={`action-btn like-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
                  {liked ? <FaHeart /> : <FaRegHeart />} {likeCount}
                </button>
                <button className="lightbox-share-btn" onClick={() => setShowShare(true)}><FaShareAlt /> Share</button>
                <button className="action-btn" onClick={handleDownload}><FaDownload /></button>
              </div>

              {/* Comments */}
              <div className="comments-section">
                <h4>Comments {comments.length > 0 && `(${comments.length})`}</h4>
                <div className="comments-list">
                  {comments.length === 0 && <p className="no-comments">Be the first to comment!</p>}
                  {comments.map(c => (
                    <div key={c.id} className="comment-item">
                      <img src={c.avatar} alt="" className="comment-avatar" />
                      <div>
                        <span className="comment-user">{c.username}</span>
                        <span className="comment-text">{c.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {user ? (
                  <div className="comment-input-row">
                    <input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleComment()}
                      maxLength={200}
                    />
                    <button onClick={handleComment} disabled={!newComment.trim() || commentLoading}>Post</button>
                  </div>
                ) : (
                  <p className="login-to-comment" onClick={() => navigate("/login")}>Login to comment</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showShare && <ShareMemoryModal imageUrl={images[slideIdx]} shareLink={shareLink} showSuccess={false} onClose={() => setShowShare(false)} />}
    </>
  );
};

export default Card;

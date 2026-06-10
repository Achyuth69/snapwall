import { FaMapMarkerAlt, FaShareAlt } from "react-icons/fa";
import { useMemo, useState } from "react";
import ShareMemoryModal from "./ShareMemoryModal.jsx";
import "./Card.css";

const Card = ({ memory, isHighlighted }) => {
  const rotation = useMemo(() => Math.random() * 8 - 4, []);
  const offsetY = useMemo(() => Math.random() * 24 - 12, []);
  const [showShare, setShowShare] = useState(false);

  const shareLink = `${window.location.origin}/?memory=${memory.id}`;

  return (
    <>
      <div
        className={`polaroid-card ${isHighlighted ? "highlight" : ""}`}
        style={{
          "--rotate": `${rotation}deg`,
          "--offsetY": `${offsetY}px`,
        }}
      >
        {/* PIN */}
        <div className="pin-dot" />

        {/* IMAGE */}
        <div className="polaroid-image">
          <img src={memory.imageUrl} alt="memory" />

          {/* Share button overlay */}
          <button
            className="card-share-btn"
            onClick={(e) => { e.stopPropagation(); setShowShare(true); }}
            title="Share this memory"
          >
            <FaShareAlt />
          </button>
        </div>

        {/* CONTENT */}
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
          imageUrl={memory.imageUrl}
          shareLink={shareLink}
          showSuccess={false}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
};

export default Card;

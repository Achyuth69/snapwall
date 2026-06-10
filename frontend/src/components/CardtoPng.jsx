import { FaMapMarkerAlt } from "react-icons/fa";
import { useMemo, forwardRef } from "react";
import "./CardtoPng.css";

const CardtoPng = forwardRef(({ memory, isHighlighted, exportMode }, ref) => {
  const rotation = useMemo(() => Math.random() * 8 - 4, []);
  const offsetY = useMemo(() => Math.random() * 24 - 12, []);

  return (
    <div
      ref={ref}
      className={`polaroid-card-1 ${isHighlighted ? "highlight" : ""}`}
      style={{
        "--rotate": exportMode ? "0deg" : `${rotation}deg`,
        "--offsetY": exportMode ? "0px" : `${offsetY}px`
      }}
    >
      <div className="pin-dot" />

      <div className="polaroid-image">
        <img src={memory.imageUrl} alt="memory" crossOrigin="anonymous" />
      </div>

      <div className="polaroid-content">
        <div className="user-row">
          <img
            className="avatar"
            src={memory.profileImage}
            alt={memory.username}
            crossOrigin="anonymous"
          />
          <span className="username">{memory.username || "Anonymous"}</span>
        </div>

        <p className="caption">“{memory.caption}”</p>

        <div className="location-chip">
          <FaMapMarkerAlt />
          {memory.city}, {memory.country}
        </div>

        <div className="date-text">Pinned on {memory.postedDate}</div>
      </div>
    </div>
  );
});

export default CardtoPng;

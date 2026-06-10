import "./MemoryShareCard.css";

const MemoryShareCard = ({ imageUrl, caption, location, date }) => {
  return (
    <div id="memory-share-card" className="share-card">
      <div className="share-card-header">ONE SNAP | SNAP WALL</div>

      <h1 className="share-card-title">My Memory on Earth</h1>

      <div className="share-card-photo-wrapper">
        <img src={imageUrl} alt="memory" className="share-card-photo" />
        <div className="pin">📍</div>
        <div className="pin-text">Pinned on Earth — {date}</div>
      </div>

      <h2 className="share-card-caption">{caption}</h2>
      <p className="share-card-location">📍 {location}</p>

      <div className="share-card-footer">
        Pin your memory on Snap Wall
      </div>
    </div>
  );
};

export default MemoryShareCard;

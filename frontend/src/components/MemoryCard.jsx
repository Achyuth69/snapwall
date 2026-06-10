import { useState, useRef, useEffect } from "react";
import { FaMapMarkerAlt, FaEllipsisV, FaEdit, FaTrash } from "react-icons/fa";
import "./MemoryCard.css";

const MemoryCard = ({
  memory,
  onEdit,
  onDelete
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
  <div className="memory-snap-card">
    <div className="snap-image-wrap">
      <img src={memory.imageUrl} alt="memory" />

      <div className="menu-container" ref={menuRef}>
        <button
          className="snap-menu-btn"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <FaEllipsisV />
        </button>

        {openMenu && (
          <div className="menu-dropdown">
            <button onClick={() => onEdit(memory)}>
              <FaEdit /> Edit
            </button>
            <button className="danger" onClick={() => onDelete(memory)}>
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
    </div>

    <div className="snap-content">
      <p className="snap-caption">“{memory.caption}”</p>

      <div className="snap-location">
        <FaMapMarkerAlt />
        {memory.city}, {memory.country}
      </div>

      <div className="snap-date">
        Pinned on {memory.postedDate}
      </div>
    </div>
  </div>
);
};

export default MemoryCard;



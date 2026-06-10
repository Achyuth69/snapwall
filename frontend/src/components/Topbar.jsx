import React, { useEffect, useState } from "react";
import { FaBullhorn, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";
import AddMemoryModal from "./AddMemoryModal.jsx";

const Topbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) setProfileImage(snap.data().imageUrl);
      }
    });
    return () => unsub();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    onSearch(value);
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left" onClick={() => navigate("/")}>
            <h1>SnapWall</h1>
            <span>My Memory on Earth</span>
          </div>

          {/* DESKTOP SEARCH */}
          <div className="topbar-center">
            <FaSearch />
            <input
              value={searchText}
              placeholder="Search by username, city or country..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="topbar-right">
            {/* MOBILE SEARCH ICON */}
            <button
              className="search-icon"
              onClick={() => setShowSearch(true)}
            >
              <FaSearch />
            </button>

            <button className="promo-btn" onClick={() => navigate("/promotions")}>
              <FaBullhorn /> <span>Promotions</span>
            </button>

            {user ? (
              <>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                  <FaPlus /> Add Memory
                </button>

                <img
                  src={profileImage}
                  alt="profile"
                  className="profile-img"
                  onClick={() => navigate("/profile")}
                />
              </>
            ) : (
              <button className="login-btn" onClick={() => navigate("/login")}>
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ADD MEMORY MODAL */}
      {showModal && <AddMemoryModal onClose={() => setShowModal(false)} />}

      {/* MOBILE SEARCH MODAL */}
      {showSearch && (
        <div className="search-modal">
          <div className="search-header">
            <input
              autoFocus
              value={searchText}
              placeholder="Search by username, city or country..."
              onChange={(e) => handleSearch(e.target.value)}
            />
            <FaTimes onClick={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc, getDoc, collection, query, where, getDocs, orderBy,
} from "firebase/firestore";
import { FaInstagram, FaArrowLeft, FaImages } from "react-icons/fa";
import Card from "../components/Card.jsx";
import Footer from "../components/Footer.jsx";
import "./Profile.css";
import "./UserProfile.css";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        // Load user doc
        const userSnap = await getDoc(doc(db, "users", userId));
        if (!userSnap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setUserData(userSnap.data());

        // Load their public memories
        const q = query(
          collection(db, "memories"),
          where("userId", "==", userId)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by date descending client-side (avoids needing composite index)
        docs.sort((a, b) => {
          const da = a.createdAt?.toDate?.() || new Date(0);
          const db2 = b.createdAt?.toDate?.() || new Date(0);
          return db2 - da;
        });
        setMemories(docs);
      } catch (err) {
        console.error("UserProfile load error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="up-spinner" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="up-not-found">
        <h2>User not found</h2>
        <button className="up-back-btn" onClick={() => navigate("/")}>
          <FaArrowLeft /> Back to Wall
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="profile-page up-page">
        {/* Back button */}
        <button className="up-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        {/* Header */}
        <div className="profile-header" style={{ marginTop: 16 }}>
          <div className="profile-left">
            <img
              src={
                userData.imageUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userData.username || "U"
                )}&size=100`
              }
              className="profile-avatar"
              alt="avatar"
            />
            <div className="profile-text">
              <div className="username-row">
                <h2>{userData.username || "Anonymous"}</h2>
              </div>
              {userData.instagram && (
                <a
                  className="instagram-chip"
                  href={`https://www.instagram.com/${userData.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="instagram-icon" />
                  @{userData.instagram}
                </a>
              )}
            </div>
          </div>

          <div className="up-stats">
            <div className="up-stat">
              <span className="up-stat-num">{memories.length}</span>
              <span className="up-stat-label">
                <FaImages style={{ marginRight: 4 }} />
                Memories
              </span>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Memories wall preview */}
        {memories.length === 0 ? (
          <div className="up-empty">
            <p>No memories shared yet.</p>
          </div>
        ) : (
          <div className="up-wall">
            {memories.map((memory) => (
              <Card key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;

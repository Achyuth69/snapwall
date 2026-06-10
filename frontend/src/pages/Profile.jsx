import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import EditMemoryModal from "../components/EditMemoryModal.jsx";
import MemoryCard from "../components/MemoryCard.jsx";
import { FaPencilAlt, FaInstagram } from "react-icons/fa";
import EditProfileModal from "../components/EditProfileModal.jsx";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { signOut } from "firebase/auth";
import "./Profile.css";
import GoogleAd from "../components/GoogleAd";
import Footer from "../components/Footer.jsx";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editMemory, setEditMemory] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);


  const [editCaption, setEditCaption] = useState("");

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // USER DATA
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      // USER MEMORIES
      const q = query(
        collection(db, "memories"),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);


  const handleMemoryUpdate = (updated) => {
  setMemories(memories.map(m => m.id === updated.id ? updated : m));
};


  const handleDelete = async (memory) => {
    if (!window.confirm("Delete this memory?")) return;

    try {
      await deleteDoc(doc(db, "memories", memory.id));

      const imgRef = ref(storage, memory.imageUrl);
      await deleteObject(imgRef);

      setMemories(memories.filter(m => m.id !== memory.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async (id) => {
    await updateDoc(doc(db, "memories", id), {
      caption: editCaption
    });

    setMemories(memories.map(m =>
      m.id === id ? { ...m, caption: editCaption } : m
    ));

    setEditing(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (!userData) return <div>No user data found</div>;

  return (
    <><div className="profile-page">
      <div className="ad-banner">
        <GoogleAd slot="1234567890" />
      </div>

      <h1 className="profile-title">Profile</h1>

      <div className="profile-header">
        <div className="profile-left">
          <img src={userData.imageUrl} className="profile-avatar" />
          <div className="profile-text">
            <div className="username-row">
              <h2>{userData.username}</h2>
              <FaPencilAlt
                className="edit-icon"
                onClick={() => setShowEditProfile(true)}
                title="Edit Profile" />
            </div>
            <div className="instagram-chip">
              <FaInstagram className="instagram-icon" />
              @{userData.instagram}
            </div>

          </div>

        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <hr className="divider" />

      {/* MEMORIES */}
      <div className="profile-posts">
        {memories.map(memory => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            onEdit={setEditMemory}
            onDelete={handleDelete} />
        ))}
      </div>
      {editMemory && (
        <EditMemoryModal
          memory={editMemory}
          onClose={() => setEditMemory(null)}
          onSave={handleMemoryUpdate} />
      )}
      {showEditProfile && (
        <EditProfileModal
          user={userData}
          onClose={() => setShowEditProfile(false)}
          onUpdate={(updatedUser) => setUserData(updatedUser)} />
      )}
    </div><Footer /></>
  );
};

export default Profile;

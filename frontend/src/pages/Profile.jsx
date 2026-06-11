import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { supabase } from "../supabase";
import EditMemoryModal from "../components/EditMemoryModal.jsx";
import MemoryCard from "../components/MemoryCard.jsx";
import { FaPencilAlt, FaInstagram, FaArrowLeft } from "react-icons/fa";
import EditProfileModal from "../components/EditProfileModal.jsx";
import { useNavigate } from "react-router-dom";
import {
  doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./Profile.css";
import Footer from "../components/Footer.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMemory, setEditMemory] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          // New Google user — create a basic profile from their Google account
          const basicProfile = {
            email: user.email,
            username: user.displayName || user.email?.split("@")[0] || "User",
            instagram: "",
            imageUrl: user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName || "User"),
            acceptedTerms: true,
            createdAt: new Date(),
          };
          await setDoc(doc(db, "users", user.uid), basicProfile);
          setUserData(basicProfile);
        }
        const q = query(collection(db, "memories"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        setMemories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const handleMemoryUpdate = (updated) =>
    setMemories(memories.map((m) => (m.id === updated.id ? updated : m)));

  const handleDelete = async (memory) => {
    if (!window.confirm("Delete this memory?")) return;
    try {
      await deleteDoc(doc(db, "memories", memory.id));
      const bucketPath = memory.imageUrl.split("/storage/v1/object/public/memories/")[1];
      if (bucketPath) await supabase.storage.from("memories").remove([bucketPath]);
      setMemories(memories.filter((m) => m.id !== memory.id));
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (!userData) return <div className="profile-loading">No user data</div>;

  return (
    <>
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-left">
            <img
              src={userData.imageUrl || "https://ui-avatars.com/api/?name=User"}
              className="profile-avatar"
              alt="avatar"
            />
            <div className="profile-text">
              <div className="username-row">
                <h2>{userData.username || "User"}</h2>
                <FaPencilAlt
                  className="edit-icon"
                  onClick={() => setShowEditProfile(true)}
                  title="Edit Profile"
                />
              </div>
              {userData.instagram && (
                <div className="instagram-chip">
                  <FaInstagram className="instagram-icon" />
                  @{userData.instagram}
                </div>
              )}
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <hr className="divider" />

        <div className="profile-posts">
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={setEditMemory}
              onDelete={handleDelete}
            />
          ))}
          {memories.length === 0 && (
            <p className="no-memories">No memories yet. Add your first one!</p>
          )}
        </div>

        {editMemory && (
          <EditMemoryModal
            memory={editMemory}
            onClose={() => setEditMemory(null)}
            onSave={handleMemoryUpdate}
          />
        )}

        {showEditProfile && (
          <EditProfileModal
            user={userData}
            onClose={() => setShowEditProfile(false)}
            onUpdate={(u) => setUserData(u)}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default Profile;

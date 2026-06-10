import { useState } from "react";
import { db, storage, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./EditProfileModal.css";

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [instagram, setInstagram] = useState(user.instagram);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user.imageUrl);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ Allow only images
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file only");
    return;
  }

  setImage(file);
  setPreview(URL.createObjectURL(file));
};


  const handleSave = async () => {
    try {
      setLoading(true);
      let imageUrl = user.imageUrl;

      if (image) {
        const imgRef = ref(
          storage,
          `profileImages/${auth.currentUser.uid}`
        );
        await uploadBytes(imgRef, image);
        imageUrl = await getDownloadURL(imgRef);
      }

      const updatedData = {
        username,
        instagram,
        imageUrl
      };

      await updateDoc(
        doc(db, "users", auth.currentUser.uid),
        updatedData
      );

      onUpdate({ ...user, ...updatedData });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Edit Profile</h2>

        <div className="avatar-section">
          <img src={preview} alt="preview" />
          <label className="upload-btn-1">
            Change Photo
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </label>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="text"
          placeholder="Instagram ID"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

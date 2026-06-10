import { useState } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { Country, State, City } from "country-state-city";
import { getAuth } from "firebase/auth";
import { db, storage } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "./AddMemoryModal.css";
import ShareMemoryModal from "./ShareMemoryModal.jsx";

const AddMemoryModal = ({ onClose }) => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("form");
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");
  const [shareLink, setShareLink] = useState("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

  const getCroppedImg = async (imageSrc, crop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((file) => resolve(file), "image/jpeg");
    });
  };

  const handleSubmit = async () => {
    if (!image || !caption || !countryCode || !stateCode || !city) {
      alert("Please fill all fields");
      return;
    }

    if (!croppedAreaPixels) {
      alert("Adjust the image before posting");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) throw new Error("User profile not found");

      const userData = userSnap.data();
      const username = userData.username || "Anonymous";
      const profileImage =
        userData.imageUrl || "https://ui-avatars.com/api/?name=User";

      const croppedBlob = await getCroppedImg(
        URL.createObjectURL(image),
        croppedAreaPixels
      );

      const imageRef = ref(storage, `memories/${user.uid}/${Date.now()}`);
      await uploadBytes(imageRef, croppedBlob);
      const imageUrl = await getDownloadURL(imageRef);

      const now = new Date();
      const postedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${now.getFullYear()}`;

      const docRef = await addDoc(collection(db, "memories"), {
        imageUrl,
        caption,
        country: Country.getCountryByCode(countryCode)?.name,
        state: State.getStateByCodeAndCountry(stateCode, countryCode)?.name,
        city,
        userId: user.uid,
        username,
        profileImage,
        createdAt: serverTimestamp(),
        postedDate,
      });

      const shareUrl = `${window.location.origin}/?memory=${docRef.id}`;
      setUploadedImage(imageUrl);
      setShareLink(shareUrl);
      setStep("share");
    } catch (err) {
      console.error("POST ERROR:", err);
      alert("Failed to post memory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === "form" && (
        <div className="memory-overlay">
          <div className="memory-modal-ui">
            <FaTimes
              className="close-icon"
              onClick={!loading ? onClose : undefined}
            />
            <h2>Add Memory</h2>

            {!image && (
              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <div className="upload-icon">
                  <FaCloudUploadAlt size={24} />
                </div>
                <p>Upload the image</p>
              </label>
            )}

            {image && (
              <>
                <div className="crop-container">
                  <Cropper
                    image={URL.createObjectURL(image)}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 19}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(c, p) => setCroppedAreaPixels(p)}
                  />
                </div>

                <p className="zoom-label">Zoom & adjust</p>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="zoom-slider"
                />
              </>
            )}

            <textarea
              className="gradient-input caption-box"
              placeholder="Caption"
              maxLength={60}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <select
              className="gradient-input"
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setStateCode("");
                setCity("");
              }}
            >
              <option value="">Country</option>
              {Country.getAllCountries().map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="gradient-input"
              disabled={!countryCode}
              value={stateCode}
              onChange={(e) => {
                setStateCode(e.target.value);
                setCity("");
              }}
            >
              <option value="">State</option>
              {State.getStatesOfCountry(countryCode).map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              className="gradient-input"
              disabled={!stateCode}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">City</option>
              {City.getCitiesOfState(countryCode, stateCode).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <button className="post-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {step === "share" && (
        <ShareMemoryModal
          imageUrl={uploadedImage}
          shareLink={shareLink}
          onClose={() => {
            onClose();
            navigate("/");
          }}
        />
      )}
    </>
  );
};

export default AddMemoryModal;

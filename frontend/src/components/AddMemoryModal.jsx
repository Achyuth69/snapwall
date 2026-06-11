import { useState } from "react";
import { FaTimes, FaCloudUploadAlt, FaPlus, FaTrash } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { Country, State, City } from "country-state-city";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./AddMemoryModal.css";
import ShareMemoryModal from "./ShareMemoryModal.jsx";

const MAX_IMAGES = 6;

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
  canvas.width = crop.width;
  canvas.height = crop.height;
  canvas.getContext("2d").drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg"));
};

const AddMemoryModal = ({ onClose }) => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("form");
  const [images, setImages] = useState([]); // [{file, preview, crop, zoom, croppedPixels}]
  const [activeIdx, setActiveIdx] = useState(0);
  const [caption, setCaption] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleFilesAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedPixels: null,
    }));
    const updated = [...images, ...toAdd];
    setImages(updated);
    setActiveIdx(updated.length - 1);
  };

  const updateActive = (field, value) => {
    setImages((prev) => prev.map((img, i) => i === activeIdx ? { ...img, [field]: value } : img));
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    setActiveIdx(Math.min(activeIdx, updated.length - 1));
  };

  const handleSubmit = async () => {
    if (images.length === 0 || !caption || !countryCode || !stateCode || !city) {
      alert("Please fill all fields and add at least one image");
      return;
    }
    if (images.some((img) => !img.croppedPixels)) {
      alert("Please adjust all images before posting");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};
      const username = userData.username || user.displayName || "Anonymous";
      const profileImage = userData.imageUrl || user.photoURL || "https://ui-avatars.com/api/?name=User";

      // Upload all images
      const imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${images.length}...`);
        const blob = await getCroppedImg(images[i].preview, images[i].croppedPixels);
        const filePath = `${user.uid}/${Date.now()}_${i}.jpg`;
        const { error } = await supabase.storage.from("memories").upload(filePath, blob, { contentType: "image/jpeg" });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from("memories").getPublicUrl(filePath);
        imageUrls.push(data.publicUrl);
      }

      const now = new Date();
      const postedDate = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

      const docRef = await addDoc(collection(db, "memories"), {
        imageUrl: imageUrls[0],       // backward compat — first image
        imageUrls,                     // all images for slideshow
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

      setUploadedImages(imageUrls);
      setShareLink(`${window.location.origin}/?memory=${docRef.id}`);
      setStep("share");
    } catch (err) {
      console.error(err);
      alert("Failed to post: " + err.message);
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  const active = images[activeIdx];

  return (
    <>
      {step === "form" && (
        <div className="memory-overlay">
          <div className="memory-modal-ui">
            <FaTimes className="close-icon" onClick={!loading ? onClose : undefined} />
            <h2>Add Memory</h2>

            {/* Image thumbnails row */}
            {images.length > 0 && (
              <div className="img-thumb-row">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`img-thumb ${i === activeIdx ? "active" : ""}`}
                    onClick={() => setActiveIdx(i)}
                  >
                    <img src={img.preview} alt="" />
                    <button className="thumb-remove" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="thumb-add">
                    <FaPlus />
                    <input type="file" accept="image/*" multiple hidden onChange={handleFilesAdd} />
                  </label>
                )}
              </div>
            )}

            {/* Upload box if no images yet */}
            {images.length === 0 && (
              <label className="upload-box">
                <input type="file" accept="image/*" multiple hidden onChange={handleFilesAdd} />
                <div className="upload-icon"><FaCloudUploadAlt size={24} /></div>
                <p>Upload up to {MAX_IMAGES} images</p>
              </label>
            )}

            {/* Cropper for active image */}
            {active && (
              <>
                <div className="crop-container">
                  <Cropper
                    image={active.preview}
                    crop={active.crop}
                    zoom={active.zoom}
                    aspect={16 / 19}
                    onCropChange={(c) => updateActive("crop", c)}
                    onZoomChange={(z) => updateActive("zoom", z)}
                    onCropComplete={(_, p) => updateActive("croppedPixels", p)}
                  />
                </div>
                <p className="zoom-label">Zoom & adjust — image {activeIdx + 1} of {images.length}</p>
                <input
                  type="range" min={1} max={3} step={0.1}
                  value={active.zoom}
                  onChange={(e) => updateActive("zoom", Number(e.target.value))}
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

            <select className="gradient-input" value={countryCode}
              onChange={(e) => { setCountryCode(e.target.value); setStateCode(""); setCity(""); }}>
              <option value="">Country</option>
              {Country.getAllCountries().map((c) => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
            </select>

            <select className="gradient-input" disabled={!countryCode} value={stateCode}
              onChange={(e) => { setStateCode(e.target.value); setCity(""); }}>
              <option value="">State</option>
              {State.getStatesOfCountry(countryCode).map((s) => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
            </select>

            <select className="gradient-input" disabled={!stateCode} value={city}
              onChange={(e) => setCity(e.target.value)}>
              <option value="">City</option>
              {City.getCitiesOfState(countryCode, stateCode).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>

            <button className="post-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? uploadProgress || "Uploading..." : `Post ${images.length > 1 ? `(${images.length} photos)` : ""}`}
            </button>
          </div>
        </div>
      )}

      {step === "share" && (
        <ShareMemoryModal
          imageUrl={uploadedImages[0]}
          shareLink={shareLink}
          onClose={() => { onClose(); navigate("/"); }}
        />
      )}
    </>
  );
};

export default AddMemoryModal;

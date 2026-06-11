import { useState, useRef } from "react";
import { FaTimes, FaCloudUploadAlt, FaPlus } from "react-icons/fa";
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
  if (!crop) return null;
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  canvas.getContext("2d").drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
};

const AddMemoryModal = ({ onClose }) => {
  const auth = getAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const addMoreRef = useRef();

  const [step, setStep] = useState("form");
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [caption, setCaption] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (files) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_IMAGES - images.length;
    const toAdd = imageFiles.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedPixels: null,
    }));
    if (toAdd.length === 0) return;
    setImages((prev) => {
      const updated = [...prev, ...toAdd];
      setActiveIdx(updated.length - 1);
      return updated;
    });
  };

  const handleFileInput = (e) => addFiles(Array.from(e.target.files));

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const updateActive = (field, value) =>
    setImages((prev) => prev.map((img, i) => i === activeIdx ? { ...img, [field]: value } : img));

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
    setActiveIdx(Math.max(0, Math.min(activeIdx, updated.length - 1)));
  };

  const handleSubmit = async () => {
    if (images.length === 0) return alert("Add at least one image");
    if (!caption || !countryCode || !stateCode || !city) return alert("Please fill all fields");

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};
      const username = userData.username || user.displayName || "Anonymous";
      const profileImage = userData.imageUrl || user.photoURL || "https://ui-avatars.com/api/?name=User";

      const imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${images.length}...`);
        const blob = await getCroppedImg(images[i].preview, images[i].croppedPixels);
        if (!blob) continue;
        const filePath = `${user.uid}/${Date.now()}_${i}.jpg`;
        const { error } = await supabase.storage.from("memories").upload(filePath, blob, { contentType: "image/jpeg" });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from("memories").getPublicUrl(filePath);
        imageUrls.push(data.publicUrl);
      }

      if (imageUrls.length === 0) throw new Error("No images uploaded");

      const now = new Date();
      const postedDate = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

      const docRef = await addDoc(collection(db, "memories"), {
        imageUrl: imageUrls[0],
        imageUrls,
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

            {/* Thumbnail row */}
            {images.length > 0 && (
              <div className="img-thumb-row">
                {images.map((img, i) => (
                  <div key={i} className={`img-thumb ${i === activeIdx ? "active" : ""}`} onClick={() => setActiveIdx(i)}>
                    <img src={img.preview} alt="" />
                    <button className="thumb-remove" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                      <FaTimes />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <div className="thumb-add" onClick={() => addMoreRef.current?.click()}>
                    <FaPlus />
                    <input ref={addMoreRef} type="file" accept="image/*" multiple hidden onChange={handleFileInput} />
                  </div>
                )}
              </div>
            )}

            {/* Drop zone — only shown when no images */}
            {images.length === 0 && (
              <div
                className={`upload-box ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileInput} />
                <div className="upload-icon"><FaCloudUploadAlt size={24} /></div>
                <p>Drop images here or tap to upload</p>
                <span className="upload-hint">Up to {MAX_IMAGES} images</span>
              </div>
            )}

            {/* Also allow drop on whole modal when images exist */}
            {images.length > 0 && images.length < MAX_IMAGES && (
              <div
                className={`drop-more ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                Drop more images here
              </div>
            )}

            {/* Cropper */}
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
                <p className="zoom-label">Image {activeIdx + 1} of {images.length} — pinch or drag to adjust</p>
                <input type="range" min={1} max={3} step={0.1} value={active.zoom}
                  onChange={(e) => updateActive("zoom", Number(e.target.value))}
                  className="zoom-slider"
                />
              </>
            )}

            <textarea className="gradient-input caption-box" placeholder="Caption" maxLength={60}
              value={caption} onChange={(e) => setCaption(e.target.value)} />

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

            <button className="post-btn" onClick={handleSubmit} disabled={loading || images.length === 0}>
              {loading ? uploadProgress || "Uploading..." : `Post${images.length > 1 ? ` (${images.length} photos)` : ""}`}
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

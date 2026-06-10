import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import Card from "./Card.jsx";
import ShareMemoryModal from "./ShareMemoryModal.jsx";

const MemoryPostWrapper = ({ memory }) => {
  const cardRef = useRef(null);
  const [shareImage, setShareImage] = useState(null);
  const [openShare, setOpenShare] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateShareImage = async () => {
    if (!cardRef.current) return;

    try {
      setLoading(true);

      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });

      setShareImage(dataUrl);
      setOpenShare(true);
    } catch (err) {
      console.error("Image generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const shareLink = `${window.location.origin}/?memory=${memory.id}`;

  return (
    <>
      {/* Hidden card clone ONLY for image generation */}
      <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
        <Card ref={cardRef} memory={memory} />
      </div>

      {/* Your normal UI card (visible on wall) */}
      <Card memory={memory} />

      <button className="share-btn" onClick={generateShareImage}>
        {loading ? "Preparing..." : "Share"}
      </button>

      {openShare && (
        <ShareMemoryModal
          imageUrl={shareImage}
          shareLink={shareLink}
          onClose={() => setOpenShare(false)}
        />
      )}
    </>
  );
};

export default MemoryPostWrapper;

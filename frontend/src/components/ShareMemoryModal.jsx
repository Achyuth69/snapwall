import { useState } from "react";
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebookF,
  FaTwitter,
  FaLink,
  FaDownload,
  FaShareAlt,
  FaTimes,
} from "react-icons/fa";
import "./ShareMemoryModal.css";

const ShareMemoryModal = ({ imageUrl, shareLink, onClose, showSuccess = true }) => {
  const [copied, setCopied] = useState(false);

  const text = encodeURIComponent("Check out this memory on SnapWall! 📸");
  const url = encodeURIComponent(shareLink);

  // ── Native share (mobile) ──────────────────────────────────────────
  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      // Try to share with image blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "snapwall-memory.jpg", { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My Memory on SnapWall",
          text: "Check out this memory on SnapWall! 📸",
          url: shareLink,
          files: [file],
        });
      } else {
        await navigator.share({
          title: "My Memory on SnapWall",
          text: "Check out this memory on SnapWall! 📸",
          url: shareLink,
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Share failed:", err);
    }
  };

  // ── Copy link ──────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = shareLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Download image ─────────────────────────────────────────────────
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "snapwall-memory.jpg";
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const socialLinks = [
    {
      name: "WhatsApp",
      className: "whatsapp",
      icon: <FaWhatsapp />,
      href: `https://wa.me/?text=${text}%20${url}`,
    },
    {
      name: "Telegram",
      className: "telegram",
      icon: <FaTelegramPlane />,
      href: `https://t.me/share/url?url=${url}&text=${text}`,
    },
    {
      name: "Facebook",
      className: "facebook",
      icon: <FaFacebookF />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      name: "Twitter / X",
      className: "twitter",
      icon: <FaTwitter />,
      href: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    },
  ];

  return (
    <div className="share-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="share-container">

        {/* Header */}
        <div className="share-header">
          <h2>Share Memory</h2>
          <button className="share-x-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {showSuccess && (
          <p className="share-success-text">✓ Memory posted successfully</p>
        )}

        {/* Image preview */}
        <div className="share-preview-wrapper">
          <img src={imageUrl} alt="memory preview" className="share-preview-image" />
        </div>

        {/* Native share button — shown on mobile / supported browsers */}
        {navigator.share && (
          <button className="share-native-btn" onClick={handleNativeShare}>
            <FaShareAlt />
            Share via…
          </button>
        )}

        {/* Social links */}
        <p className="share-with-text">Share on</p>
        <div className="share-icons-row">
          {socialLinks.map((s) => (
            <a
              key={s.name}
              className={`share-icon ${s.className}`}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.name}
            >
              {s.icon}
              <span className="share-icon-label">{s.name}</span>
            </a>
          ))}
        </div>

        {/* Action row */}
        <div className="share-action-row">
          <button className="share-action-btn" onClick={handleCopy} title="Copy link">
            <FaLink />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button className="share-action-btn" onClick={handleDownload} title="Download image">
            <FaDownload />
            Download
          </button>
        </div>

        <button className="share-close-btn" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

export default ShareMemoryModal;

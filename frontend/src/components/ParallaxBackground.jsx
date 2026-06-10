import { useRef, useEffect, useState, useMemo } from "react";

// Color preset — Midnight Velvet (matches SnapWall purple theme)
const PRESET = {
  bgGradient: "linear-gradient(to bottom, #030113, #0a0a2e, #1a0533, #0d1b4b)",
  skyOverlay: "rgba(26, 5, 51, 0.35)",
  auroraColors: [
    "rgba(139, 92, 246, 0.55)",
    "rgba(168, 85, 247, 0.45)",
    "rgba(56, 189, 248, 0.5)",
  ],
};

const CONFIG = {
  starCount: 1200,
  twinkleSpeed: 1.6,
  starColorMode: "cosmic",
  auroraIntensity: 0.85,
  auroraSpeed: 1.0,
  cloudSpeed: 1.2,
  cloudOpacity: 0.75,
  meteorFrequency: 3,
};

export default function ParallaxBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const dustRef = useRef([]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dampedOffset, setDampedOffset] = useState({ x: 0, y: 0 });
  const [cloudOffset1, setCloudOffset1] = useState(0);
  const [cloudOffset2, setCloudOffset2] = useState(25);
  const [cloudOffset3, setCloudOffset3] = useState(60);

  // Generate mountain + pine data once
  const mountains = useMemo(() => {
    const farPoints = [];
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * 100;
      let y = 60 + Math.sin(i * 1.5) * 12 + Math.cos(i * 2.8) * 6;
      if (i === 0 || i === 12) y = 100;
      farPoints.push({ x, y });
    }
    const nearPoints = [];
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * 100;
      let y = 68 + Math.cos(i * 1.2) * 15 + Math.sin(i * 3.1) * 8;
      if (i === 0 || i === 10) y = 100;
      nearPoints.push({ x, y });
    }
    const pines = [];
    for (let i = 0; i < 48; i++) {
      const x = (i / 48) * 105 + (Math.random() * 2 - 1);
      const baseHeight = 70 + Math.cos((x / 100) * 10 * 1.2) * 11 + Math.sin((x / 100) * 10 * 3.1) * 6;
      const height = 14 + Math.random() * 12;
      const scaleX = 0.75 + Math.random() * 0.5;
      const skew = Math.random() * 1.5 - 0.75;
      pines.push({ x, baseHeight, height, scaleX, skew });
    }
    return { farPoints, nearPoints, pines };
  }, []);

  // Mouse parallax tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Damped parallax interpolation
  useEffect(() => {
    let active = true;
    const update = () => {
      if (!active) return;
      setDampedOffset((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.05,
        y: prev.y + (mousePos.y - prev.y) * 0.05,
      }));
      requestAnimationFrame(update);
    };
    update();
    return () => { active = false; };
  }, [mousePos]);

  // Cloud drifting
  useEffect(() => {
    let active = true;
    let lastTime = performance.now();
    const tick = (time) => {
      if (!active) return;
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      const s = CONFIG.cloudSpeed * 1.5;
      setCloudOffset1((p) => (p + s * 0.8 * delta) % 100);
      setCloudOffset2((p) => (p + s * 0.5 * delta) % 100);
      setCloudOffset3((p) => (p + s * 1.2 * delta) % 100);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { active = false; };
  }, []);

  // Star init + canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = ["#bae6fd","#cbd5e1","#c084fc","#818cf8","#a78bfa","#ffffff"];

    const initStars = (w, h) => {
      starsRef.current = Array.from({ length: CONFIG.starCount }, (_, i) => ({
        id: i,
        x: Math.random() * w,
        y: Math.random() * (h * 0.75),
        size: Math.random() * 1.5 + (Math.random() > 0.96 ? 1.0 : 0.3),
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: Math.random(),
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: (Math.random() * 0.02 + 0.005) * CONFIG.twinkleSpeed,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    window.addEventListener("resize", handleResize);
    setTimeout(handleResize, 50);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;

    const triggerShootStar = () => {
      shootingStarsRef.current.push({
        id: Math.random(),
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.35),
        length: Math.random() * 70 + 40,
        speed: Math.random() * 6 + 7,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        alpha: 1.0,
        width: Math.random() * 1.6 + 0.8,
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      starsRef.current.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed;
        star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * (star.baseAlpha * 0.85);
        ctx.beginPath();
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.size > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, star.alpha));
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Shooting stars
      shootingStarsRef.current.forEach((m, i) => {
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.015;
        if (m.alpha <= 0) { shootingStarsRef.current.splice(i, 1); return; }
        ctx.globalAlpha = m.alpha;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(m.angle) * m.length, m.y - Math.sin(m.angle) * m.length);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, "rgba(139,92,246,0.4)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - Math.cos(m.angle) * m.length, m.y - Math.sin(m.angle) * m.length);
        ctx.stroke();
      });

      // Auto meteor spawn
      if (CONFIG.meteorFrequency > 0 && Math.random() > 0.9995 - CONFIG.meteorFrequency * 0.0005) {
        triggerShootStar();
      }

      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, []);

  const farStr = mountains.farPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const nearStr = mountains.nearPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -2,
        overflow: "hidden",
        background: PRESET.bgGradient,
      }}
    >
      {/* Nebula overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: PRESET.skyOverlay, mixBlendMode: "color-dodge", pointerEvents: "none" }} />

      {/* Aurora */}
      <div style={{
        position: "absolute", inset: 0, top: 0, height: "65%", pointerEvents: "none", zIndex: 1,
        opacity: CONFIG.auroraIntensity,
        transform: `translate3d(${dampedOffset.x * -8}px, ${dampedOffset.y * -6}px, 0)`,
      }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "screen", filter: "blur(24px)", opacity: 0.85 }} viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={PRESET.auroraColors[0]} />
              <stop offset="50%" stopColor={PRESET.auroraColors[1]} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ag2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={PRESET.auroraColors[2]} stopOpacity="0.7" />
              <stop offset="60%" stopColor={PRESET.auroraColors[0]} stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M -100 200 Q 200 120, 500 220 T 1100 150 L 1100 450 L -100 450 Z" fill="url(#ag1)"
            style={{ animation: `auroraWave ${28 / CONFIG.auroraSpeed}s infinite ease-in-out alternate` }} />
          <path d="M -150 140 Q 250 250, 600 120 T 1150 220 L 1150 480 L -150 480 Z" fill="url(#ag2)"
            style={{ animation: `auroraWave ${18 / CONFIG.auroraSpeed}s infinite ease-in-out alternate-reverse`, animationDelay: "2s" }} />
        </svg>
      </div>

      {/* Star canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2 }} />

      {/* Cloud 1 */}
      <div style={{
        position: "absolute", top: "18%", pointerEvents: "none", zIndex: 3,
        opacity: CONFIG.cloudOpacity * 0.75,
        transform: `translate3d(calc(${cloudOffset1}% - 100px - ${dampedOffset.x * 12}px), ${dampedOffset.y * -8}px, 0)`,
      }}>
        <svg viewBox="0 0 450 160" style={{ width: 300, height: 120, filter: "blur(3px)" }}>
          <defs><linearGradient id="cg1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.32" />
            <stop offset="35%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient></defs>
          <path d="M 70 80 Q 90 40 140 50 Q 180 20 230 40 Q 280 15 320 50 Q 370 40 380 80 Q 410 100 390 120 Q 300 140 100 130 Q 50 120 70 80 Z" fill="url(#cg1)" />
        </svg>
      </div>

      {/* Cloud 2 */}
      <div style={{
        position: "absolute", top: "26%", pointerEvents: "none", zIndex: 3,
        opacity: CONFIG.cloudOpacity,
        transform: `translate3d(calc(${cloudOffset2}% - 150px - ${dampedOffset.x * 15}px), ${dampedOffset.y * -10}px, 0)`,
      }}>
        <svg viewBox="0 0 550 180" style={{ width: 480, height: 160 }}>
          <defs><linearGradient id="cg2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
            <stop offset="12%" stopColor="#a78bfa" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.14" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient></defs>
          <path d="M 60 100 Q 100 40 160 50 Q 230 10 320 40 Q 400 10 440 60 Q 490 50 510 100 Q 540 130 500 155 Q 360 175 140 165 Q 20 150 60 100 Z" fill="url(#cg2)" style={{ filter: "blur(4px)" }} />
        </svg>
      </div>

      {/* Cloud 3 */}
      <div style={{
        position: "absolute", top: "42%", pointerEvents: "none", zIndex: 3,
        opacity: CONFIG.cloudOpacity * 0.65,
        transform: `translate3d(calc(${cloudOffset3}% - 200px - ${dampedOffset.x * 20}px), ${dampedOffset.y * -14}px, 0)`,
      }}>
        <svg viewBox="0 0 600 200" style={{ width: 520, height: 180, filter: "blur(8px)" }}>
          <defs><linearGradient id="cg3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.22" />
            <stop offset="40%" stopColor="#1e1b4b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient></defs>
          <path d="M 100 100 Q 150 50 220 60 Q 300 20 380 60 Q 440 30 480 80 Q 530 80 540 110 Q 550 140 500 160 Q 300 180 150 160 Q 50 140 100 100 Z" fill="url(#cg3)" />
        </svg>
      </div>

      {/* Far mountains */}
      <div style={{
        position: "absolute", bottom: -5, left: 0, right: 0, height: "40%", pointerEvents: "none", zIndex: 4,
        transform: `translate3d(${dampedOffset.x * -25}px, ${dampedOffset.y * -18}px, 0)`,
      }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
          <defs><linearGradient id="mfg" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1e1e4f" />
            <stop offset="6%" stopColor="#0a0a25" />
            <stop offset="100%" stopColor="#040212" />
          </linearGradient></defs>
          <polygon points={`0,100 ${farStr} 100,100`} fill="url(#mfg)" stroke="#2e2e6f" strokeWidth="0.15" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Near mountains + pines */}
      <div style={{
        position: "absolute", bottom: -15, left: 0, right: 0, height: "32%", pointerEvents: "none", zIndex: 5,
        transform: `translate3d(${dampedOffset.x * -42}px, ${dampedOffset.y * -30}px, 0)`,
      }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="mng" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#0a081f" />
              <stop offset="25%" stopColor="#050314" />
              <stop offset="100%" stopColor="#010103" />
            </linearGradient>
            <g id="pine">
              <rect x="-0.3" y="0" width="0.6" height="5" fill="#010105" />
              <polygon points="0,-16 -3.5,-10 3.5,-10" fill="#020208" />
              <polygon points="0,-11 -4.4,-5 4.4,-5" fill="#03030b" />
              <polygon points="0,-6 -5.2,1 5.2,1" fill="#020206" />
            </g>
          </defs>
          <polygon points={`0,100 ${nearStr} 100,100`} fill="url(#mng)" />
          {mountains.pines.map((t, i) => (
            <use key={i} href="#pine" x={t.x} y={t.baseHeight}
              transform={`scale(${t.height * 0.057}, ${t.height * 0.055}) skewX(${t.skew})`} />
          ))}
        </svg>
      </div>

      {/* Floor mist */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 100, pointerEvents: "none", zIndex: 6,
        background: "linear-gradient(to top, #010103, rgba(4,2,18,0.3), transparent)",
      }} />

      {/* Aurora animation keyframes */}
      <style>{`
        @keyframes auroraWave {
          0% { transform: translateY(0) scaleY(1); }
          33% { transform: translateY(-20px) scaleY(1.08); }
          66% { transform: translateY(12px) scaleY(0.92); }
          100% { transform: translateY(-5px) scaleY(1.03); }
        }
      `}</style>
    </div>
  );
}

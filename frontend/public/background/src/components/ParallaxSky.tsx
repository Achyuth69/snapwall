/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { SkyConfig, Star, ShootingStar, CosmicDustParticle } from '../types';
import { COLOR_PRESETS } from '../data/presets';

interface ParallaxSkyProps {
  config: SkyConfig;
  onTriggerChime: (freq?: number) => void;
}

export const ParallaxSky: React.FC<ParallaxSkyProps> = ({ config, onTriggerChime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax dampening states
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dampedOffset, setDampedOffset] = useState({ x: 0, y: 0 });

  // Floating clouds offset states
  const [cloudOffset1, setCloudOffset1] = useState(0);
  const [cloudOffset2, setCloudOffset2] = useState(25);
  const [cloudOffset3, setCloudOffset3] = useState(60);

  // Lists of stars and shooting stars
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const dustParticlesRef = useRef<CosmicDustParticle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Static procedural assets to prevent re-generation flashes
  const [mountainsBase] = useState(() => {
    // Generate far mountain peak polygon points
    const farPoints = [];
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const x = (i / count) * 100;
      let y = 60 + Math.sin(i * 1.5) * 12 + Math.cos(i * 2.8) * 6;
      if (i === 0 || i === count) y = 100;
      farPoints.push({ x, y });
    }
    
    // Generate near mountain peaks
    const nearPoints = [];
    const nearCount = 10;
    for (let i = 0; i <= nearCount; i++) {
      const x = (i / nearCount) * 100;
      let y = 68 + Math.cos(i * 1.2) * 15 + Math.sin(i * 3.1) * 8;
      if (i === 0 || i === nearCount) y = 100;
      nearPoints.push({ x, y });
    }

    // Generate pine tree layout (percentage-based positions and scales)
    const pines = [];
    const treeCount = 48;
    for (let i = 0; i < treeCount; i++) {
      const x = (i / treeCount) * 105 + (Math.random() * 2 - 1);
      // Place trees slightly offset from mountain elevation line
      const baseHeight = 70 + Math.cos((x / 100) * nearCount * 1.2) * 11 + Math.sin((x / 100) * nearCount * 3.1) * 6;
      const height = 14 + Math.random() * 12;
      const scaleX = 0.75 + Math.random() * 0.5;
      const skew = Math.random() * 1.5 - 0.75;
      pines.push({ x, baseHeight, height, scaleX, skew });
    }

    return { farPoints, nearPoints, pines };
  });

  const preset = COLOR_PRESETS.find(p => p.id === config.visualPreset) || COLOR_PRESETS[0];

  // 1. Mouse moving tracks for Parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Normalize position from -1 to 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x, y });

      // If interactive breeze is on, spawn celestial dust
      if (config.interactiveBreeze && Math.random() > 0.4) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        const spawnX = e.clientX - canvasRect.left;
        const spawnY = e.clientY - canvasRect.top;
        spawnDustParticle(spawnX, spawnY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x, y });

      if (config.interactiveBreeze) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        spawnDustParticle(touch.clientX - canvasRect.left, touch.clientY - canvasRect.top);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchmove', handleTouchMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [config.interactiveBreeze]);

  // 2. Parallax damping interpolator loop
  useEffect(() => {
    let active = true;
    const updateDamp = () => {
      if (!active) return;
      setDampedOffset(prev => {
        const targetX = mousePos.x;
        const targetY = mousePos.y;
        return {
          x: prev.x + (targetX - prev.x) * 0.05, // smooth easing delay
          y: prev.y + (targetY - prev.y) * 0.05,
        };
      });
      requestAnimationFrame(updateDamp);
    };
    updateDamp();
    return () => {
      active = false;
    };
  }, [mousePos]);

  // 3. Clouds horizontal drifting loop
  useEffect(() => {
    let active = true;
    let lastTime = performance.now();

    const tickClouds = (time: number) => {
      if (!active) return;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Cloud speeds are configurable
      const speedMult = config.cloudSpeed * 1.5;

      setCloudOffset1(prev => (prev + speedMult * 0.8 * delta) % 100);
      setCloudOffset2(prev => (prev + speedMult * 0.5 * delta) % 100);
      setCloudOffset3(prev => (prev + speedMult * 1.2 * delta) % 100);

      requestAnimationFrame(tickClouds);
    };

    requestAnimationFrame(tickClouds);
    return () => {
      active = false;
    };
  }, [config.cloudSpeed]);

  // 4. Star initialization & Canvas physics update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initStars(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);
    // Trigger initial sizing after next frame loop to get precise bounding boxes
    setTimeout(handleResize, 50);

    const colors = {
      white: ['#ffffff', '#f1f5f9', '#e2e8f0'],
      multicolor: ['#ffffff', '#bae6fd', '#fed7aa', '#fbcfe8', '#ddd6fe'],
      cosmic: ['#bae6fd', '#cbd5e1', '#c084fc', '#818cf8', '#a78bfa', '#ffffff'],
    };

    const initStars = (width: number, height: number) => {
      const list: Star[] = [];
      const mode = config.starColorMode;
      const palette = colors[mode] || colors.white;

      for (let i = 0; i < config.starCount; i++) {
        list.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * (height * 0.75), // focus stars on upper part of sky
          size: Math.random() * 1.5 + (Math.random() > 0.96 ? 1.0 : 0.3), // some beautiful big stars
          baseAlpha: Math.random() * 0.6 + 0.2,
          alpha: Math.random(),
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: (Math.random() * 0.02 + 0.005) * config.twinkleSpeed,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
      starsRef.current = list;
    };

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [config.starCount, config.starColorMode, config.twinkleSpeed]);

  // Spawns a physical comet particle
  const triggerShootStar = (customX?: number, customY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const startX = customX !== undefined ? customX : Math.random() * canvas.width;
    const startY = customY !== undefined ? customY : Math.random() * (canvas.height * 0.35);
    const speed = Math.random() * 6 + 7;
    const angle = customX !== undefined && customY !== undefined 
      ? Math.PI / 4 + (Math.random() * 0.2 - 0.1) // aim downwards-right
      : Math.PI / 4 + (Math.random() * 0.2 - 0.1); 

    const comet: ShootingStar = {
      id: Date.now() + Math.random(),
      startX,
      startY,
      x: startX,
      y: startY,
      length: Math.random() * 70 + 40,
      speed,
      angle,
      alpha: 1.0,
      width: Math.random() * 1.6 + 0.8,
    };

    shootingStarsRef.current.push(comet);
  };

  // Click on canvas triggers custom shooting star and audio synth chime!
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Trigger meteor aiming near client click point
    triggerShootStar(clickX - 40, clickY - 40);

    // Play chime soundscape tuned exactly to the height percentage clicked
    const percentHeight = 1.0 - (clickY / canvas.height); // highest stars get higher tones
    const chimesScale = [330, 440, 550, 660, 880, 990, 1100, 1320];
    const pickedScaleIndex = Math.floor(percentHeight * chimesScale.length);
    const resolvedFreq = chimesScale[Math.max(0, Math.min(chimesScale.length - 1, pickedScaleIndex))];
    
    onTriggerChime(resolvedFreq);

    // Instantly spawn explosive cosmic dust ripples
    for (let i = 0; i < 15; i++) {
      spawnDustParticle(clickX, clickY, true);
    }
  };

  // Helper to spawn celestial dust particles
  const spawnDustParticle = (x: number, y: number, isExplosion = false) => {
    const dustColors = preset.auroraColors;
    const angle = Math.random() * Math.PI * 2;
    const speed = isExplosion ? Math.random() * 3 + 1 : Math.random() * 0.6 + 0.1;
    const maxLife = isExplosion ? Math.random() * 40 + 30 : Math.random() * 60 + 50;

    dustParticlesRef.current.push({
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isExplosion ? 0.3 : 0.4), // drift up slightly
      size: Math.random() * 2 + (isExplosion ? 1.5 : 0.5),
      color: dustColors[Math.floor(Math.random() * dustColors.length)],
      alpha: 1.0,
      life: maxLife,
      maxLife,
    });
  };

  // Primary requestAnimationFrame renderer for stars overlay, shooting stars, and breeze dust
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particleFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // A. DRAW STARS
      starsRef.current.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * (star.baseAlpha * 0.85);
        
        ctx.beginPath();
        ctx.fillStyle = star.color;
        ctx.shadowBlur = star.size > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        
        // Draw star
        ctx.globalAlpha = Math.max(0.05, Math.min(1.0, star.alpha));
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0; // reset shadow effects

      // B. DRAW AND UPDATE CELESTIAL BREZZE PARTICLES
      dustParticlesRef.current.forEach((dust, idx) => {
        dust.x += dust.vx;
        dust.y += dust.vy;
        dust.life--;
        dust.alpha = dust.life / dust.maxLife;

        ctx.beginPath();
        ctx.fillStyle = dust.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = dust.color;
        ctx.globalAlpha = Math.max(0, dust.alpha);
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove dead particles
        if (dust.life <= 0) {
          dustParticlesRef.current.splice(idx, 1);
        }
      });
      
      ctx.shadowBlur = 0; // reset shadow

      // C. DRAW AND UPDATE METEORS (SHOOTING STARS)
      shootingStarsRef.current.forEach((meteor, idx) => {
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.alpha -= 0.015; // gradual drag fade

        if (meteor.alpha <= 0) {
          shootingStarsRef.current.splice(idx, 1);
          return;
        }

        // Draw meteor trail (tapered line)
        ctx.globalAlpha = meteor.alpha;
        const grad = ctx.createLinearGradient(
          meteor.x, 
          meteor.y, 
          meteor.x - Math.cos(meteor.angle) * meteor.length, 
          meteor.y - Math.sin(meteor.angle) * meteor.length
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, preset.auroraColors[0] || 'rgba(139, 92, 246, 0.4)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = meteor.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - Math.cos(meteor.angle) * meteor.length, meteor.y - Math.sin(meteor.angle) * meteor.length);
        ctx.stroke();
      });

      // D. PERIODIC SPONTANEOUS SHOOTING STAR SPAWN
      if (config.meteorFrequency > 0) {
        const threshold = 0.9995 - (config.meteorFrequency * 0.0005); // high frequencies spawn more comets
        if (Math.random() > threshold) {
          triggerShootStar();
        }
      }

      ctx.globalAlpha = 1.0; // reset canvas opacity
      particleFrame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(particleFrame);
    };
  }, [config.meteorFrequency, config.visualPreset]);

  // Utility calculation for mountain points mapping
  const farPointsStr = mountainsBase.farPoints
    .map(p => `${p.x},${p.y}`)
    .join(' ');
  
  const nearPointsStr = mountainsBase.nearPoints
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div
      id="living_canvas_container"
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden transition-all duration-1000 ease-in-out"
      style={{ background: preset.bgGradient }}
    >
      {/* BACKGROUND NEBULA OVERLAY LAYER */}
      <div 
        id="nebula_backdrop_overlay"
        className="absolute inset-0 mix-blend-color-dodge transition-all duration-[1500ms] pointer-events-none"
        style={{
          backgroundColor: preset.skyOverlay,
          opacity: 0.8,
        }}
      />

      {/* DYNAMIC NORTHERN LIGHTS (AURORA BOREALIS) LAYER */}
      <div
        id="aurora_waving_layer"
        className="absolute inset-x-0 top-0 h-[65%] pointer-events-none transition-transform duration-300 ease-out z-10 select-none overflow-hidden"
        style={{
          transform: `translate3d(${dampedOffset.x * -8}px, ${dampedOffset.y * -6}px, 0)`,
          opacity: config.auroraIntensity,
        }}
      >
        <svg 
          className="absolute inset-0 w-full h-full mix-blend-screen overflow-visible filter blur-2xl opacity-85" 
          viewBox="0 0 1000 600" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="auroraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={preset.auroraColors[0]} stopOpacity="0.8" />
              <stop offset="50%" stopColor={preset.auroraColors[1]} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="auroraGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={preset.auroraColors[2]} stopOpacity="0.7" />
              <stop offset="60%" stopColor={preset.auroraColors[0]} stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="auroraGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={preset.auroraColors[1]} stopOpacity="0.65" />
              <stop offset="40%" stopColor={preset.auroraColors[2]} stopOpacity="0.4" />
              <stop offset="85%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            {/* Simulated waving pattern filters */}
            <filter id="auroraTurbulence">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.05" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* Scrolling aurora waves */}
          <g filter="url(#auroraTurbulence)" className="w-full h-full">
            {/* Wave 1 */}
            <path
              d="M -100 200 Q 200 120, 500 220 T 1100 150 L 1100 450 L -100 450 Z"
              fill="url(#auroraGrad1)"
              className="animate-[wave_24s_infinite_ease-in-out_alternate]"
              style={{
                animationDuration: `${28 / config.auroraSpeed}s`,
              }}
            />
            {/* Wave 2 */}
            <path
              d="M -150 140 Q 250 250, 600 120 T 1150 220 L 1150 480 L -150 480 Z"
              fill="url(#auroraGrad2)"
              className="animate-[wave_17s_infinite_ease-in-out_alternate-reverse]"
              style={{
                animationDuration: `${18 / config.auroraSpeed}s`,
                animationDelay: '2s',
              }}
            />
            {/* Wave 3 */}
            <path
              d="M -50 180 Q 300 80, 550 260 T 1050 140 L 1050 420 L -50 420 Z"
              fill="url(#auroraGrad3)"
              className="animate-[wave_33s_infinite_ease-in-out_alternate]"
              style={{
                animationDuration: `${32 / config.auroraSpeed}s`,
                animationDelay: '-3s',
              }}
            />
          </g>
        </svg>
      </div>



      {/* STAR ENGINE CANVAS LAYER (STARS & DUST & COMETS) */}
      <canvas
        id="canvas_celestial_renderer"
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full z-20 cursor-pointer"
      />

      {/* MID-GROUND FLOATING ETHEREAL GLOWING CLOUDS */}
      {/* Drifting Cloud Layer 1 */}
      <div
        id="cloud_layer_1"
        className="absolute inset-x-0 h-[280px] top-[18%] pointer-events-none transition-transform duration-300 ease-out z-25 opacity-70"
        style={{
          transform: `translate3d(calc(${cloudOffset1}% - 100px - ${dampedOffset.x * 12}px), ${dampedOffset.y * -8}px, 0)`,
          opacity: config.cloudOpacity * 0.75,
        }}
      >
        <svg viewBox="0 0 450 160" className="w-[300px] h-[120px] fill-current text-white filter blur-[3px]">
          <defs>
            <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.32" /> {/* Lavender catching moon light */}
              <stop offset="35%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 70 80 Q 90 40 140 50 Q 180 20 230 40 Q 280 15 320 50 Q 370 40 380 80 Q 410 100 390 120 Q 300 140 100 130 Q 50 120 70 80 Z" fill="url(#cloudGrad1)" />
        </svg>
      </div>

      {/* Drifting Cloud Layer 2 */}
      <div
        id="cloud_layer_2"
        className="absolute inset-x-0 h-[330px] top-[26%] pointer-events-none transition-transform duration-300 ease-out z-25"
        style={{
          transform: `translate3d(calc(${cloudOffset2}% - 150px - ${dampedOffset.x * 15}px), ${dampedOffset.y * -10}px, 0)`,
          opacity: config.cloudOpacity,
        }}
      >
        <svg viewBox="0 0 550 180" className="w-[480px] h-[160px] fill-current text-white overflow-visible">
          <defs>
            <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" /> {/* Silver edge catching moonlight */}
              <stop offset="12%" stopColor="#a78bfa" stopOpacity="0.28" /> {/* Ethereal purple soft violet inner glow */}
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.14" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Misty glowing cloud path */}
          <path d="M 60 100 Q 100 40 160 50 Q 230 10 320 40 Q 400 10 440 60 Q 490 50 510 100 Q 540 130 500 155 Q 360 175 140 165 Q 20 150 60 100 Z" fill="url(#cloudGrad2)" className="filter blur-[4px]" />
        </svg>
      </div>

      {/* Drifting Cloud Layer 3 (Lower slow mist) */}
      <div
        id="cloud_layer_3"
        className="absolute inset-x-0 h-[220px] top-[42%] pointer-events-none transition-transform duration-300 ease-out z-25"
        style={{
          transform: `translate3d(calc(${cloudOffset3}% - 200px - ${dampedOffset.x * 20}px), ${dampedOffset.y * -14}px, 0)`,
          opacity: config.cloudOpacity * 0.65,
        }}
      >
        <svg viewBox="0 0 600 200" className="w-[520px] h-[180px] fill-current text-white filter blur-[8px]">
          <defs>
            <linearGradient id="cloudGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.22" />
              <stop offset="40%" stopColor="#1e1b4b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 100 100 Q 150 50 220 60 Q 300 20 380 60 Q 440 30 480 80 Q 530 80 540 110 Q 550 140 500 160 Q 300 180 150 160 Q 50 140 100 100 Z" fill="url(#cloudGrad3)" />
        </svg>
      </div>

      {/* FOREGROUND LAYER 1: DEEP SILHOUETTED FAR MOUNTAIN RANGE */}
      <div
        id="mountain_layer_far"
        className="absolute inset-x-0 bottom-[-5px] h-[40%] pointer-events-none transition-transform duration-300 ease-out z-30"
        style={{
          transform: `translate3d(${dampedOffset.x * -25}px, ${dampedOffset.y * -18}px, 0)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountainFarGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              {/* Silver/indigo outline fading to deep navy */}
              <stop offset="0%" stopColor="#1e1e4f" />
              <stop offset="6%" stopColor="#0a0a25" />
              <stop offset="100%" stopColor="#040212" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,100 ${farPointsStr} 100,100`}
            fill="url(#mountainFarGrad)"
            stroke="#2e2e6f"
            strokeWidth="0.15"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* FOREGROUND LAYER 2: SHARP RECENT MOUNTAINS & LAYERED PINE FORESTS */}
      <div
        id="mountain_layer_near_pines"
        className="absolute inset-x-0 bottom-[-15px] h-[32%] pointer-events-none transition-transform duration-300 ease-out z-45"
        style={{
          transform: `translate3d(${dampedOffset.x * -42}px, ${dampedOffset.y * -30}px, 0)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountainNearGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              {/* Very dark midnight peak transition to absolute pitch dark forest base */}
              <stop offset="0%" stopColor="#0a081f" />
              <stop offset="25%" stopColor="#050314" />
              <stop offset="100%" stopColor="#010103" />
            </linearGradient>

            {/* Reusable geometric high-def Pine tree components */}
            <g id="pine_tree">
              {/* Trunk */}
              <rect x="-0.3" y="0" width="0.6" height="5" fill="#010105" />
              {/* Branch Layers */}
              <polygon points="0,-16 -3.5,-10 3.5,-10" fill="#020208" />
              <polygon points="0,-11 -4.4,-5 4.4,-5" fill="#03030b" stroke="#060613" strokeWidth="0.1" />
              <polygon points="0,-6 -5.2,1 5.2,1" fill="#020206" />
            </g>
          </defs>

          {/* Near mountain polygon line */}
          <polygon
            points={`0,100 ${nearPointsStr} 100,100`}
            fill="url(#mountainNearGrad)"
            stroke="#100b2e"
            strokeWidth="0.25"
            strokeOpacity="0.4"
          />

          {/* Procedural dense silhouetted lines of towering Pine Trees */}
          {mountainsBase.pines.map((t, idx) => (
            <use
              key={idx}
              href="#pine_tree"
              x={t.x}
              y={t.baseHeight}
              transform={`scale(${t.height * 0.057}, ${t.height * 0.055}) skewX(${t.skew})`}
              className="transition-all duration-300 pointer-events-none"
            />
          ))}
        </svg>
      </div>

      {/* Atmospheric misty lighting fading in right from the bottom */}
      <div 
        id="atmospheric_floor_mist"
        className="absolute bottom-0 inset-x-0 h-[100px] pointer-events-none bg-gradient-to-t from-[#010103] via-[#040212]/30 to-transparent z-40"
      />
    </div>
  );
};

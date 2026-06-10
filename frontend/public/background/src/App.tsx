/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  Eye, 
  Sparkles, 
  HelpCircle,
  X,
  Compass,
  Monitor,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SkyConfig } from './types';
import { ParallaxSky } from './components/ParallaxSky';
import { SettingsPanel } from './components/SettingsPanel';
import { soundscape } from './utils/soundscape';
import { COLOR_PRESETS } from './data/presets';

const DEFAULT_CONFIG: SkyConfig = {
  starCount: 1400,
  twinkleSpeed: 1.6,
  starColorMode: 'cosmic',
  auroraIntensity: 0.85,
  auroraSpeed: 1.0,
  auroraColorIndex: 0,
  cloudSpeed: 1.2,
  cloudOpacity: 0.75,
  meteorFrequency: 4,
  interactiveBreeze: true,
  audioVolume: 0.35,
  audioPreset: 'space_drone',
  visualPreset: 'midnight_velvet', // default is the custom midnight navy/purple/midnight requested
  isTheaterMode: true, // starts in theater mode config, keeping it completely 100% clean of text/UI
};

export default function App() {
  const [config, setConfig] = useState<SkyConfig>(DEFAULT_CONFIG);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [meteorTrigger, setMeteorTrigger] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isWidescreenFit, setIsWidescreenFit] = useState(true); // letterbox container toggle

  // Ref to handle volume dynamic sync
  const soundscapeInitialized = useRef(false);

  // Sync state changes with our synth engine
  useEffect(() => {
    soundscape.setVolume(config.audioVolume);
  }, [config.audioVolume]);

  useEffect(() => {
    soundscape.setPreset(config.audioPreset);
  }, [config.audioPreset]);

  // Handle hotkeys for immersive wallpaper interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case 'c':
          // Toggle controls
          setConfig(prev => ({ ...prev, isTheaterMode: !prev.isTheaterMode }));
          break;
        case 't':
          // Force theater mode
          setConfig(prev => ({ ...prev, isTheaterMode: true }));
          break;
        case 'm':
          // Toggle audio
          toggleAudio();
          break;
        case ' ':
          // Spacebar launches comet
          e.preventDefault();
          launchMeteor();
          break;
        case 'l':
          // Toggle letterbox frame
          setIsWidescreenFit(prev => !prev);
          break;
        case 'h':
          // Show hotkeys info modal
          setShowInfo(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioIsPlaying, config]);

  const toggleAudio = () => {
    if (!audioIsPlaying) {
      soundscape.start();
      soundscape.setVolume(config.audioVolume);
      soundscape.setPreset(config.audioPreset);
      setAudioIsPlaying(true);
    } else {
      soundscape.stop();
      setAudioIsPlaying(false);
    }
  };

  const handleTriggerChime = (freq?: number) => {
    // If audio is muted, click still activates a tiny sound effect context optionally
    // but we respect global state: if audio is active, synthesize high fidelity stellar chime
    if (audioIsPlaying) {
      soundscape.triggerChime(freq);
    }
  };

  const launchMeteor = () => {
    setMeteorTrigger(prev => prev + 1);
    if (audioIsPlaying) {
      // play a deep atmospheric comet sound shimmer (low pentatonic chime)
      soundscape.triggerChime(220);
    }
  };

  const selectedPreset = COLOR_PRESETS.find(p => p.id === config.visualPreset) || COLOR_PRESETS[0];

  return (
    <div 
      className="relative w-screen h-screen bg-[#030113] flex items-center justify-center overflow-hidden font-sans select-none"
      style={{
        transition: 'background-color 1.5s ease-in-out',
      }}
    >
      {/* GLOWING AMBIENT OUTER OR COUCH BACKGROUND FOR LETTERBOX MODE */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-[2000ms] ease-in-out"
        style={{
          background: selectedPreset.bgGradient,
          opacity: isWidescreenFit ? 0.35 : 1,
          filter: 'blur(80px)',
          transform: 'scale(1.2)'
        }}
      />

      {/* VIEWPORT CONTROLLER - EITHER LETTERBOX SHAPE OR FULL EDGE-TO-EDGE */}
      <div
        id="cinema_screen_frame"
        className={`relative transition-all duration-1000 ease-in-out shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden rounded-none ${
          isWidescreenFit 
            ? 'w-full h-full max-w-none max-h-none border-none' 
            : 'aspect-video w-[90vw] max-w-[1920px] max-h-[85vh] rounded-2xl border border-white/5'
        }`}
      >
        <ParallaxSky 
          config={{
            ...config,
            meteorFrequency: config.meteorFrequency + (meteorTrigger > 0 ? 0 : 0) // trigger state listener implicitly
          }} 
          onTriggerChime={handleTriggerChime}
        />

        {/* METEOR LAUNCH LISTENER INJECTOR */}
        {meteorTrigger > 0 && (
          <div className="hidden" key={`meteor-${meteorTrigger}`} />
        )}
      </div>

      {/* MINIMAL FLOATING OVERLAY: ULTRA-CLEAN TRACE ELEMENTS */}
      {/* 1. IMMERSIVE COMPASS HUD OR APP DESIGN CONCEPTS */}
      <AnimatePresence>
        {!config.isTheaterMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-6 z-50 pointer-events-auto flex items-center gap-3 bg-slate-950/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10"
          >
            <Compass className="w-4 h-4 text-indigo-400 animate-[spin_20s_linear_infinite]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase font-sans">
                {selectedPreset.name} Landscape
              </span>
              <span className="text-[8px] font-mono text-slate-400">
                Parallax: Active • Audio: {audioIsPlaying ? 'Synthesizing' : 'Muted'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PERSISTENT FLOATER TRIGGER FOR BRINGING BACK THE CONTROLS */}
      {config.isTheaterMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          whileHover={{ opacity: 0.95 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-6 inset-x-0 mx-auto z-50 w-fit flex items-center justify-center gap-3 bg-slate-950/70 border border-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.5)] pointer-events-auto"
        >
          <button
            onClick={() => setConfig(prev => ({ ...prev, isTheaterMode: false }))}
            className="flex items-center gap-2.5 text-xs text-white tracking-wider font-semibold cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Open Customizer Control Hub</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <button
            onClick={toggleAudio}
            className="text-slate-300 hover:text-white transition-all cursor-pointer"
            title={audioIsPlaying ? "Mute Ambient Synth" : "Play Ambient Synth"}
          >
            {audioIsPlaying ? <Volume2 className="w-4 h-4 text-violet-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <button
            onClick={() => setShowInfo(true)}
            className="text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Keyboard Shortcuts Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 3. SETTINGS SLIDERS CONTROL DRAWER PANEL (FLOATING AND ROTATING) */}
      <SettingsPanel
        config={config}
        onChange={(newConfig) => setConfig(newConfig)}
        onTriggerMeteor={launchMeteor}
        audioIsPlaying={audioIsPlaying}
        onToggleAudio={toggleAudio}
      />

      {/* 4. UTILITIES TOP ROW - LETTERS BARS AND INFORMATION MODALS */}
      <AnimatePresence>
        {!config.isTheaterMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 right-6 z-50 pointer-events-auto flex items-center gap-2"
          >
            {/* Guide overlay click */}
            <button
              onClick={() => setShowInfo(true)}
              className="p-2.5 rounded-xl border border-white/5 bg-slate-950/40 backdrop-blur-md text-slate-350 hover:text-white hover:bg-slate-950/60 hover:border-white/10 transition-all cursor-pointer"
              title="Keyboard Shortcuts & Interactive Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Letterbox / Aspect ratio toggle */}
            <button
              onClick={() => setIsWidescreenFit(prev => !prev)}
              className="p-2.5 rounded-xl border border-white/5 bg-slate-950/40 backdrop-blur-md text-slate-350 hover:text-white hover:bg-slate-950/60 hover:border-white/10 transition-all cursor-pointer flex items-center gap-2 text-xs"
              title={isWidescreenFit ? "Switch to Cinematic 16:9 Letterbox" : "Switch to Fullscreen Borderless"}
            >
              {isWidescreenFit ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="font-mono text-[10px] tracking-widest uppercase hidden md:inline">
                {isWidescreenFit ? 'Fill Screen' : '16:9 Frame'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. USER HELPER SHORTCUTS DIALOG (INTERACTION OVERLAY) */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfo(false)}
            className="absolute inset-0 z-55 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 pointer-events-auto cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} // stop click bubbling
              className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 cursor-default relative"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-white text-base font-semibold">Living Wallpaper Interaction Guide</h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Step into a living digital painting designed for deep presence and meditation. Complete with physical parallax and a procedural audio synth.
              </p>

              {/* Hotkeys catalog list */}
              <div className="flex flex-col gap-3 my-1">
                <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Hotkeys Shortcuts</span>
                
                <div className="flex flex-col gap-2 font-mono text-xs text-slate-300">
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                    <span>Toggle Controls Drawer</span>
                    <span className="bg-slate-800 text-white border border-white/10 px-2 py-0.5 rounded shadow text-[11px] font-mono">C</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                    <span>Enter Pure Theater Mode</span>
                    <span className="bg-slate-800 text-white border border-white/10 px-2 py-0.5 rounded shadow text-[11px] font-mono">T</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                    <span>Synthesize Space Soundscape</span>
                    <span className="bg-slate-800 text-white border border-white/10 px-2 py-0.5 rounded shadow text-[11px] font-mono">M</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                    <span>Launch Random Comet</span>
                    <span className="bg-slate-800 text-white border border-white/10 px-2.5 py-0.5 rounded shadow text-[11px] font-mono">Space</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                    <span>Letterbox / Display Frame</span>
                    <span className="bg-slate-800 text-white border border-white/10 px-2 py-0.5 rounded shadow text-[11px] font-mono">L</span>
                  </div>
                </div>
              </div>

              {/* Interactive mouse highlights */}
              <div className="bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-xl flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-indigo-400 tracking-wider uppercase font-bold">Touch Interactive</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Moving your cursor pulls the layers in physical 3D and blows glowing cosmic dust. Click inside the stars to play starry bells and shoot comets at that point!
                </p>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-sans text-xs font-semibold text-white tracking-wide transition-all shadow-lg cursor-pointer"
              >
                Return to Cosmos
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

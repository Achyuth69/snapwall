/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  X, 
  Sparkles, 
  Wind, 
  Eye, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Flame,
  Palette
} from 'lucide-react';
import { SkyConfig } from '../types';
import { COLOR_PRESETS } from '../data/presets';

interface SettingsPanelProps {
  config: SkyConfig;
  onChange: (newConfig: SkyConfig) => void;
  onTriggerMeteor: () => void;
  audioIsPlaying: boolean;
  onToggleAudio: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onChange,
  onTriggerMeteor,
  audioIsPlaying,
  onToggleAudio,
}) => {
  const updateKey = <K extends keyof SkyConfig>(key: K, value: SkyConfig[K]) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const selectedPreset = COLOR_PRESETS.find(p => p.id === config.visualPreset) || COLOR_PRESETS[0];

  return (
    <div className="absolute right-6 top-6 bottom-6 z-50 flex items-start justify-end pointer-events-none select-none">
      <AnimatePresence>
        {!config.isTheaterMode && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 120, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[380px] max-h-full overflow-y-auto pointer-events-auto flex flex-col gap-6 p-6 rounded-2xl border border-white/10 backdrop-blur-xl bg-slate-950/70 shadow-[0_20px_50px_rgba(0,0,0,0.8)] scrollbar-thin scrollbar-thumb-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span className="font-sans font-semibold tracking-wide text-white text-lg">Cosmic Controls</span>
              </div>
              <button
                onClick={() => updateKey('isTheaterMode', true)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Enter Theater Mode (Pure Wallpaper)"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 tracking-wider uppercase">
                <Palette className="w-3.5 h-3.5" />
                <span>Sky Palette Presets</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateKey('visualPreset', preset.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.visualPreset === preset.id
                        ? 'bg-white/10 border-white/20 shadow-inner'
                        : 'bg-white/5 border-transparent hover:bg-white/8 hover:border-white/5'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-full border border-white/20 shadow-sm"
                      style={{ background: preset.bgGradient }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">{preset.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {preset.id === 'midnight_velvet' ? 'Original requested palette' : 'Celestial color grading'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Northern Lights / Aurora Parameters */}
            <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 tracking-wider uppercase">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aurora Borealis</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold">{Math.round(config.auroraIntensity * 100)}%</span>
              </div>

              {/* Intensity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-400">Glow Luminance</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.auroraIntensity}
                  onChange={(e) => updateKey('auroraIntensity', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Waving Speed */}
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Solar Wind Motion</span>
                  <span className="text-slate-300 font-mono text-[10px]">{config.auroraSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={config.auroraSpeed}
                  onChange={(e) => updateKey('auroraSpeed', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>



            {/* Cosmic Particles & Stars */}
            <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 tracking-wider uppercase">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Starry Depths</span>
                </div>
                <span className="text-[11px] text-indigo-300 font-bold">{config.starCount} stars</span>
              </div>

              {/* Star Count */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="range"
                  min="100"
                  max="2200"
                  step="50"
                  value={config.starCount}
                  onChange={(e) => updateKey('starCount', parseInt(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>

              {/* Twinkle speed */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">Twinkle Animation Rate</span>
                  <span className="text-slate-300 font-mono text-[10px]">{config.twinkleSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="4"
                  step="0.1"
                  value={config.twinkleSpeed}
                  onChange={(e) => updateKey('twinkleSpeed', parseFloat(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>

              {/* Star Palette options */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-slate-400">Star Color Profile</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['white', 'multicolor', 'cosmic'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateKey('starColorMode', mode)}
                      className={`py-1 text-[10px] font-mono capitalize rounded-md border transition-all cursor-pointer ${
                        config.starColorMode === mode
                          ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-200'
                          : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clouds and Meteor controls */}
            <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 tracking-wider uppercase">
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <span>Atmosphere</span>
                </div>
              </div>

              {/* Wind Speed (cloud drifting) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-sans">Cloud Drifting Speed</span>
                  <span className="text-slate-300 font-mono text-[10px]">{config.cloudSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={config.cloudSpeed}
                  onChange={(e) => updateKey('cloudSpeed', parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Cloud Opacity */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-slate-400">Misty Cloud Density</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.cloudOpacity}
                  onChange={(e) => updateKey('cloudOpacity', parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Meteor Frequency */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Shooting Stars / Comets</span>
                  <span className="text-[10px] font-mono text-amber-300">
                    {config.meteorFrequency === 0 ? 'Disabled' : `${config.meteorFrequency}/10 Frequency`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={config.meteorFrequency}
                  onChange={(e) => updateKey('meteorFrequency', parseInt(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* Manual Meteor launch trigger */}
              <button
                onClick={onTriggerMeteor}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 shadow-lg text-white font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Launch Shooting Star!
              </button>
            </div>

            {/* Ambient Soundscapes */}
            <div className="flex flex-col gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 tracking-wider uppercase">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Synthesized soundscape</span>
                </div>
              </div>

              {/* Playback Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleAudio}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    audioIsPlaying 
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-md' 
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-md'
                  }`}
                >
                  {audioIsPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Mute Soundscape
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play Ambient Pads
                    </>
                  )}
                </button>
              </div>

              {audioIsPlaying && (
                <>
                  {/* Drone Preset */}
                  <div className="grid grid-cols-3 gap-1">
                    {(['space_drone', 'lunar_solace', 'aurora_pulse'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateKey('audioPreset', p)}
                        className={`py-1 px-1.5 text-[9px] font-mono tracking-tighter truncate rounded border transition-all cursor-pointer ${
                          config.audioPreset === p
                            ? 'bg-violet-600/25 border-violet-500/40 text-violet-200'
                            : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-3">
                    {config.audioVolume === 0 ? (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-violet-400" />
                    )}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.audioVolume}
                      onChange={(e) => updateKey('audioVolume', parseFloat(e.target.value))}
                      className="flex-1 accent-violet-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-slate-300 w-6 text-right">
                      {Math.round(config.audioVolume * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Interactivity Breeze */}
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 text-sm">
              <span className="text-slate-300 text-xs">Dynamic Pointer Winds:</span>
              <button
                onClick={() => updateKey('interactiveBreeze', !config.interactiveBreeze)}
                className={`py-1 px-3 rounded-full text-[11px] font-sans font-semibold transition-all cursor-pointer ${
                  config.interactiveBreeze 
                    ? 'bg-indigo-600/25 border border-indigo-400/30 text-indigo-200' 
                    : 'bg-white/5 border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {config.interactiveBreeze ? 'ON (Mouse Trails)' : 'OFF'}
              </button>
            </div>

            {/* Explanatory notice */}
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              * Click anywhere on the sky to launch customized shooting stars and generate starry resonant bells tuned to where you touch.
            </p>

            {/* Footer / Exit */}
            <button
              onClick={() => updateKey('isTheaterMode', true)}
              className="w-full mt-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-sans text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Enter Pure Wallpaper Mode
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

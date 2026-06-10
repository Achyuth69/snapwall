/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorPreset {
  id: string;
  name: string;
  bgGradient: string; // Tailwind linear classes or direct CSS gradients
  skyOverlay: string; // Nebula background overlay color
  auroraColors: string[]; // Gradient stops for the auroras
  accentColor: string; // Primary button / highlight color
}

export interface SkyConfig {
  starCount: number;
  twinkleSpeed: number;
  starColorMode: 'white' | 'multicolor' | 'cosmic';
  auroraIntensity: number;
  auroraSpeed: number;
  auroraColorIndex: number; // custom palette index
  cloudSpeed: number;
  cloudOpacity: number;
  meteorFrequency: number; // 0 (off) to 10 (storm)
  interactiveBreeze: boolean; // Mouse movement creates star dust
  audioVolume: number;
  audioPreset: 'space_drone' | 'lunar_solace' | 'aurora_pulse';
  visualPreset: string; // ID of the ColorPreset
  isTheaterMode: boolean; // hides all UI
}

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

export interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  width: number;
}

export interface CosmicDustParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

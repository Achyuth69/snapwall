/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColorPreset } from '../types';

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'midnight_velvet',
    name: 'Midnight Velvet',
    bgGradient: 'linear-gradient(to bottom, #030113, #0a0a2e, #1a0533, #0d1b4b)',
    skyOverlay: 'rgba(26, 5, 51, 0.35)', // soft purple nebula mist
    auroraColors: ['rgba(139, 92, 246, 0.55)', 'rgba(168, 85, 247, 0.45)', 'rgba(56, 189, 248, 0.5)'], // violet, purple, teal arcs
    accentColor: 'indigo',
  },
  {
    id: 'emerald_northern',
    name: 'Emerald Northern',
    bgGradient: 'linear-gradient(to bottom, #020617, #070f2b, #0c1844, #1b1a55)',
    skyOverlay: 'rgba(12, 24, 68, 0.25)',
    auroraColors: ['rgba(34, 197, 94, 0.6)', 'rgba(20, 184, 166, 0.5)', 'rgba(16, 185, 129, 0.4)'], // rich emerald teal wave
    accentColor: 'emerald',
  },
  {
    id: 'cosmic_nebula',
    name: 'Neon Nebula',
    bgGradient: 'linear-gradient(to bottom, #050515, #0f0c20, #2b0c36, #150c40)',
    skyOverlay: 'rgba(139, 10, 160, 0.3)',
    auroraColors: ['rgba(236, 72, 153, 0.5)', 'rgba(139, 92, 246, 0.5)', 'rgba(244, 63, 94, 0.45)'], // hot pink, violet, rose
    accentColor: 'pink',
  }
];

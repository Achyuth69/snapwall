/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundscapeSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private chimeTimer: ReturnType<typeof setInterval> | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.3;
  private currentPreset: 'space_drone' | 'lunar_solace' | 'aurora_pulse' = 'space_drone';

  constructor() {
    // Lazy initialize to respect browser user interaction laws and prevent start-up warnings
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public setPreset(preset: 'space_drone' | 'lunar_solace' | 'aurora_pulse') {
    this.currentPreset = preset;
    if (this.isPlaying) {
      // Re-trigger with new frequencies
      this.stop();
      this.start();
    }
  }

  public start() {
    this.init();
    if (!this.ctx || this.isPlaying) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;

    // 1. Core drone oscillators
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneFilter = this.ctx.createBiquadFilter();

    let freq1 = 68.0; // low C#
    let freq2 = 136.0; // C#2
    let waveType: OscillatorType = 'triangle';

    if (this.currentPreset === 'lunar_solace') {
      freq1 = 55.0; // low A
      freq2 = 110.0;
      waveType = 'sine';
    } else if (this.currentPreset === 'aurora_pulse') {
      freq1 = 73.42; // low D
      freq2 = 146.83;
      waveType = 'sawtooth';
    }

    this.droneOsc1.type = waveType;
    this.droneOsc1.frequency.setValueAtTime(freq1, this.ctx.currentTime);
    
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(freq2, this.ctx.currentTime);
    this.droneOsc2.detune.setValueAtTime(12, this.ctx.currentTime); // detuning for rich chorus chorus

    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(4, this.ctx.currentTime);

    // Filter modulation LFO
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // super slow breathing
    lfoGain.gain.setValueAtTime(80, this.ctx.currentTime); // oscillate by 80 Hz

    this.lfo.connect(lfoGain);
    if (this.droneFilter && this.droneFilter.frequency) {
      lfoGain.connect(this.droneFilter.frequency);
    }

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    // Connections
    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(droneGain);
    if (this.masterGain) {
      droneGain.connect(this.masterGain);
    }

    // Start oscillators
    this.droneOsc1.start();
    this.droneOsc2.start();
    this.lfo.start();

    // 2. Star chimes sequence
    this.startChimes();
  }

  public triggerChime(customFreq?: number) {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;

    // Pick a pentatonic starry scale frequency
    const pentatonicScale = [220, 247.5, 275, 330, 366.7, 440, 495, 550, 660, 733.3, 880, 990, 1100, 1320];
    const baseFreq = customFreq || pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];

    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    const chimeFilter = this.ctx.createBiquadFilter();

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // FM metallic color addition
    if (this.currentPreset === 'aurora_pulse') {
      chimeOsc.type = 'triangle';
    }

    chimeFilter.type = 'lowpass';
    chimeFilter.frequency.setValueAtTime(2000, this.ctx.currentTime);

    chimeGain.gain.setValueAtTime(0, this.ctx.currentTime);
    // Sudden attack, long dreamy fade
    chimeGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

    chimeOsc.connect(chimeFilter);
    chimeFilter.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    chimeOsc.start();
    chimeOsc.stop(this.ctx.currentTime + 5);
  }

  private startChimes() {
    if (this.chimeTimer) clearInterval(this.chimeTimer);
    
    this.chimeTimer = setInterval(() => {
      // Gentle random twinkling chimes
      if (Math.random() > 0.4) {
        this.triggerChime();
      }
    }, 3500);
  }

  public stop() {
    if (this.droneOsc1) {
      try { this.droneOsc1.stop(); this.droneOsc1.disconnect(); } catch (e) {}
      this.droneOsc1 = null;
    }
    if (this.droneOsc2) {
      try { this.droneOsc2.stop(); this.droneOsc2.disconnect(); } catch (e) {}
      this.droneOsc2 = null;
    }
    if (this.lfo) {
      try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) {}
      this.lfo = null;
    }
    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    this.isPlaying = false;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const soundscape = new SoundscapeSynthesizer();

/**
 * CORE AMBIENCE CLASS (Theme-Agnostic)
 * 
 * Generic ambience engine for managing audio layers.
 * Theme-specific presets are in themes/[theme]/ambience.ts
 */

import { getAudioContext, getMasterGain, resumeAudioContext } from '../shared/audio-context';

export interface AmbienceOptions {
  intensity?: number;     // 0-1, overall volume/presence
  depth?: number;         // Meters, affects frequencies
  mystery?: number;       // 0-1, ethereal elements
  interval?: number;       // Seconds between events (for sonar, etc.)
  fadeIn?: number;        // Seconds to fade in
}

export interface ActiveLayer {
  name: string;
  oscillators: OscillatorNode[];
  gains: GainNode[];
  intervals: number[];
  noiseSource?: AudioBufferSourceNode;
}

export type PresetHandler = (ambience: Ambience, options: AmbienceOptions) => void;

/**
 * Core Ambience class - manages audio layers generically
 */
export class Ambience {
  protected layers: ActiveLayer[] = [];
  protected masterGain: GainNode;
  protected isPlaying: boolean = false;
  private presetHandlers: Map<string, PresetHandler> = new Map();
  
  // Expose masterGain for preset handlers
  getMasterGain(): GainNode {
    return this.masterGain;
  }
  
  // Expose isPlaying for preset handlers
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
  
  // Expose layers for preset handlers
  getLayers(): ActiveLayer[] {
    return this.layers;
  }
  
  constructor() {
    this.masterGain = getMasterGain();
  }
  
  /**
   * Register a preset handler
   */
  registerPreset(name: string, handler: PresetHandler): void {
    this.presetHandlers.set(name, handler);
  }
  
  /**
   * Play a preset by name
   */
  async play(preset: string, options: AmbienceOptions = {}): Promise<void> {
    await resumeAudioContext();
    
    const opts: AmbienceOptions = {
      intensity: 0.5,
      depth: 2000,
      mystery: 0.3,
      interval: 5,
      fadeIn: 2,
      ...options
    };
    
    this.isPlaying = true;
    
    const handler = this.presetHandlers.get(preset);
    if (handler) {
      handler(this, opts);
    } else {
      console.warn(`Preset "${preset}" not found. Register it with registerPreset().`);
    }
  }
  
  /**
   * Add another layer on top of existing ambience
   */
  async addLayer(preset: string, options: AmbienceOptions = {}): Promise<void> {
    await this.play(preset, options);
  }
  
  /**
   * Stop all ambience
   */
  stop(fadeOut: number = 1): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    this.isPlaying = false;
    
    for (const layer of this.layers) {
      // Fade out gains
      for (const gain of layer.gains) {
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + fadeOut);
      }
      
      // Stop oscillators after fade
      setTimeout(() => {
        for (const osc of layer.oscillators) {
          try { osc.stop(); } catch {}
        }
        if (layer.noiseSource) {
          try { layer.noiseSource.stop(); } catch {}
        }
        for (const interval of layer.intervals) {
          clearInterval(interval);
        }
      }, fadeOut * 1000);
    }
    
    this.layers = [];
  }
  
  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    const ctx = getAudioContext();
    this.masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  }
  
  /**
   * Helper: Add filtered noise to a layer
   * Public so preset handlers can use it
   */
  addFilteredNoise(layer: ActiveLayer, volume: number, lowFreq: number, highFreq: number, fadeIn: number): void {
    const ctx = getAudioContext();
    
    const bufferSize = ctx.sampleRate * 10;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = highFreq;
    
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = lowFreq;
    
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn);
    
    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    
    layer.noiseSource = noise;
    layer.gains.push(gain);
  }
}

/**
 * LIVING OS THEME - Sound Effects
 * 
 * Plant biology research OS sound effects with growth-level adaptation.
 */

import { SoundEffect } from '../../core/sound-effect.js';
import { getAudioContext } from '../../shared/audio-context.js';

export interface LivingOsSoundEffectOptions {
  growthLevel?: number;  // 0-100, affects sound character
  volume?: number;       // Override default volume
}

export type LivingOsSoundEffectType = 
  | 'fileConsume'        // Organic file consumption sound
  | 'systemNotification' // System notification (adapts to growth level)
  | 'growth'            // Subtle organic growth sound
  | 'glitch';           // System glitch (advanced stages)

/**
 * LivingOsSoundEffect - SoundEffect class with living OS sounds
 */
export class LivingOsSoundEffect extends SoundEffect {
  private growthLevel: number = 0;
  
  constructor(volume: number = 0.5) {
    super(volume);
    
    // Register all living OS sound effects
    this.registerSound('fileConsume', this.playFileConsume.bind(this));
    this.registerSound('systemNotification', this.playSystemNotification.bind(this));
    this.registerSound('growth', this.playGrowth.bind(this));
    this.registerSound('glitch', this.playGlitch.bind(this));
  }
  
  /**
   * Set growth level for adaptive sounds
   */
  setGrowthLevel(level: number): void {
    this.growthLevel = Math.max(0, Math.min(100, level));
  }
  
  /**
   * Get current growth level
   */
  getGrowthLevel(): number {
    return this.growthLevel;
  }
  
  /**
   * Play a sound effect with options
   */
  async play(type: LivingOsSoundEffectType, options: LivingOsSoundEffectOptions = {}): Promise<void> {
    if (options.growthLevel !== undefined) {
      this.growthLevel = Math.max(0, Math.min(100, options.growthLevel));
    }
    
    const originalVolume = this.getVolume();
    if (options.volume !== undefined) {
      this.setVolume(options.volume);
    }
    
    await super.play(type);
    
    // Restore original volume
    if (options.volume !== undefined) {
      this.setVolume(originalVolume);
    }
  }
  
  /**
   * Play file consumption sound (organic crunching)
   */
  private playFileConsume(sfx: SoundEffect): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const stage = this.getStage(this.growthLevel);
    
    // Create organic crunching sound using filtered noise
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Organic crunch pattern
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Multiple crunch events
      const crunch1 = Math.sin(t * Math.PI * 8) * Math.exp(-t * 5);
      const crunch2 = Math.sin(t * Math.PI * 12) * Math.exp(-(t - 0.3) * 8);
      const crunch3 = Math.sin(t * Math.PI * 6) * Math.exp(-(t - 0.6) * 6);
      data[i] = (crunch1 + crunch2 * 0.5 + crunch3 * 0.3) * 0.3;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter to sound like plant matter
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = stage >= 2 ? 800 : 1200; // Darker in advanced stages
    filter.Q.value = 3;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.4, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    noise.start(now);
    
    // Add subtle rustling layer
    setTimeout(() => {
      this.playRustleLayer(sfx, stage);
    }, 50);
  }
  
  /**
   * Play system notification (adapts to growth level)
   */
  private playSystemNotification(sfx: SoundEffect): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const stage = this.getStage(this.growthLevel);
    
    // Base notification frequencies
    const frequencies = stage >= 2 ? [440, 523] : [440, 554, 659]; // Fewer notes in advanced stages
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      
      // Distort frequency in advanced stages
      const finalFreq = stage >= 2 ? freq * (0.95 + Math.random() * 0.1) : freq;
      osc.frequency.value = finalFreq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.25, now + i * 0.05 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
      
      // Add subtle distortion in advanced stages
      if (stage >= 2) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = stage === 3 ? 400 : 600;
        
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }
      
      gain.connect(sfx.getMasterGain());
      
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.3);
    });
    
    // Add organic undertone in advanced stages
    if (stage >= 2) {
      setTimeout(() => {
        this.playOrganicUndertone(sfx, stage);
      }, 100);
    }
  }
  
  /**
   * Play growth sound (subtle leaf unfurling/root extending)
   */
  private playGrowth(sfx: SoundEffect): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Very subtle, organic sound
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 1);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.15, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now);
    osc.stop(now + 1.5);
    
    // Add subtle texture layer
    setTimeout(() => {
      this.playGrowthTexture(sfx);
    }, 200);
  }
  
  /**
   * Play glitch sound (subtle system error)
   */
  private playGlitch(sfx: SoundEffect): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Brief audio glitch - very subtle
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.setValueAtTime(150, now + 0.02);
    osc.frequency.setValueAtTime(250, now + 0.04);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sfx.getVolume() * 0.2, now);
    gain.gain.setValueAtTime(0, now + 0.06);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now);
    osc.stop(now + 0.06);
  }
  
  /**
   * Helper: Get stage from growth level
   */
  private getStage(growthLevel: number): number {
    if (growthLevel < 20) return 0; // Normal
    if (growthLevel < 50) return 1; // Slightly off
    if (growthLevel < 80) return 2; // Unsettling
    return 3; // Eerie
  }
  
  /**
   * Helper: Play rustling layer for file consume
   */
  private playRustleLayer(sfx: SoundEffect, _stage: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.random() * 0.2;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sfx.getVolume() * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    noise.start();
  }
  
  /**
   * Helper: Play organic undertone for notifications
   */
  private playOrganicUndertone(sfx: SoundEffect, _stage: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 100;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.08, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now);
    osc.stop(now + 0.4);
  }
  
  /**
   * Helper: Play growth texture
   */
  private playGrowthTexture(sfx: SoundEffect): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.random() * 0.1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 2;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sfx.getVolume() * 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    noise.start();
  }
}

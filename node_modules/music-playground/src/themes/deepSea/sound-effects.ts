/**
 * DEEP SEA THEME - Sound Effects
 * 
 * Deep-sea specific sound effects for marine biology projects.
 */

import { SoundEffect } from '../../core/sound-effect.js';
import { getAudioContext } from '../../shared/audio-context.js';

export type DeepSeaSoundEffectType = 
  | 'sonarPing'       // Classic sonar ping
  | 'sonarReturn'     // Echo/return ping
  | 'notification'    // Gentle alert
  | 'error'           // Error tone
  | 'success'         // Success chime
  | 'click'           // UI click
  | 'hover'           // UI hover
  | 'open'            // Window/file open
  | 'close'           // Window/file close
  | 'discovery'       // Something found
  | 'warning'         // Warning alert
  | 'transmit'        // Data transmission
  | 'receive'         // Data received
  | 'depth'           // Depth change indicator
  | 'pressure'        // Pressure warning
  | 'creature';       // Creature detected

/**
 * DeepSeaSoundEffect - SoundEffect class with deep-sea sounds pre-registered
 */
export class DeepSeaSoundEffect extends SoundEffect {
  constructor(volume: number = 0.5) {
    super(volume);
    
    // Register all deep-sea sound effects
    this.registerSound('sonarPing', playSonarPing);
    this.registerSound('sonarReturn', playSonarReturn);
    this.registerSound('notification', playNotification);
    this.registerSound('error', playError);
    this.registerSound('success', playSuccess);
    this.registerSound('click', playClick);
    this.registerSound('hover', playHover);
    this.registerSound('open', playOpen);
    this.registerSound('close', playClose);
    this.registerSound('discovery', playDiscovery);
    this.registerSound('warning', playWarning);
    this.registerSound('transmit', playTransmit);
    this.registerSound('receive', playReceive);
    this.registerSound('depth', playDepth);
    this.registerSound('pressure', playPressure);
    this.registerSound('creature', playCreature);
  }
  
  /**
   * Play a deep-sea sound effect (type-safe)
   */
  async play(type: DeepSeaSoundEffectType): Promise<void> {
    return super.play(type);
  }
}

// ============================================
// SOUND EFFECT HANDLERS
// ============================================

function playSonarPing(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 2);
}

function playSonarReturn(sfx: SoundEffect): void {
  // Delayed, quieter ping
  setTimeout(() => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sfx.getVolume() * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    
    osc.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start();
    osc.stop(ctx.currentTime + 1);
  }, 800);
}

function playNotification(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  [440, 554, 659].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.3, now + i * 0.1 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
    
    osc.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.4);
  });
}

function playError(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.setValueAtTime(150, now + 0.1);
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.3, now);
  gain.gain.setValueAtTime(sfx.getVolume() * 0.3, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 0.3);
}

function playSuccess(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.25, now + i * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
    
    osc.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.5);
  });
}

function playClick(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 800;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 0.05);
}

function playHover(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 600;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 0.03);
}

function playOpen(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 0.2);
}

function playClose(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 0.2);
}

function playDiscovery(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Magical ascending arpeggio
  [261, 329, 392, 523, 659].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.2, now + i * 0.1 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1);
    
    osc.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 1);
  });
}

function playWarning(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 440;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sfx.getVolume() * 0.25, now + i * 0.3);
    gain.gain.setValueAtTime(0, now + i * 0.3 + 0.15);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now + i * 0.3);
    osc.stop(now + i * 0.3 + 0.15);
  }
}

function playTransmit(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  for (let i = 0; i < 5; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1000 + Math.random() * 500;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(sfx.getVolume() * 0.15, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.05);
    
    osc.connect(gain);
    gain.connect(sfx.getMasterGain());
    
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.05);
  }
}

function playReceive(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.linearRampToValueAtTime(800, now + 0.1);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 0.15);
}

function playDepth(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(sfx.getVolume() * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 0.5);
}

function playPressure(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Deep rumble
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 40;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.4, now + 0.2);
  gain.gain.linearRampToValueAtTime(0, now + 1);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 1);
}

function playCreature(sfx: SoundEffect): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Eerie whale-like sound
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
  osc.frequency.exponentialRampToValueAtTime(120, now + 1.5);
  osc.frequency.exponentialRampToValueAtTime(180, now + 2);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(sfx.getVolume() * 0.2, now + 0.3);
  gain.gain.setValueAtTime(sfx.getVolume() * 0.2, now + 1.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
  
  osc.connect(gain);
  gain.connect(sfx.getMasterGain());
  
  osc.start(now);
  osc.stop(now + 2.5);
}

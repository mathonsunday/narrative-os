/**
 * SOUND EFFECTS - One-shot sounds for specific moments
 * 
 * Usage:
 * ```typescript
 * import { SoundEffect } from './audio-engine';
 * 
 * const sfx = new SoundEffect();
 * 
 * // Play a single effect
 * sfx.play('sonarPing');
 * sfx.play('notification');
 * sfx.play('error');
 * ```
 */

import { getAudioContext, getMasterGain, resumeAudioContext } from '../shared/audio-context';

export type SoundEffectType = 
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

export class SoundEffect {
  private masterGain: GainNode;
  private volume: number = 0.5;
  
  constructor(volume: number = 0.5) {
    this.masterGain = getMasterGain();
    this.volume = volume;
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  async play(type: SoundEffectType): Promise<void> {
    await resumeAudioContext();
    
    switch (type) {
      case 'sonarPing':
        this.playSonarPing();
        break;
      case 'sonarReturn':
        this.playSonarReturn();
        break;
      case 'notification':
        this.playNotification();
        break;
      case 'error':
        this.playError();
        break;
      case 'success':
        this.playSuccess();
        break;
      case 'click':
        this.playClick();
        break;
      case 'hover':
        this.playHover();
        break;
      case 'open':
        this.playOpen();
        break;
      case 'close':
        this.playClose();
        break;
      case 'discovery':
        this.playDiscovery();
        break;
      case 'warning':
        this.playWarning();
        break;
      case 'transmit':
        this.playTransmit();
        break;
      case 'receive':
        this.playReceive();
        break;
      case 'depth':
        this.playDepth();
        break;
      case 'pressure':
        this.playPressure();
        break;
      case 'creature':
        this.playCreature();
        break;
    }
  }
  
  private playSonarPing(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 2);
  }
  
  private playSonarReturn(): void {
    // Delayed, quieter ping (uses setTimeout for delay)
    setTimeout(() => {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    }, 800);
  }
  
  private playNotification(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [440, 554, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }
  
  private playError(): void {
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
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.setValueAtTime(this.volume * 0.3, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }
  
  private playSuccess(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }
  
  private playClick(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }
  
  private playHover(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 600;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }
  
  private playOpen(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }
  
  private playClose(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }
  
  private playDiscovery(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Magical ascending arpeggio
    [261, 329, 392, 523, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 1);
    });
  }
  
  private playWarning(): void {
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
      gain.gain.setValueAtTime(this.volume * 0.25, now + i * 0.3);
      gain.gain.setValueAtTime(0, now + i * 0.3 + 0.15);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.15);
    }
  }
  
  private playTransmit(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1000 + Math.random() * 500;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.05);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.05);
    }
  }
  
  private playReceive(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.1);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }
  
  private playDepth(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }
  
  private playPressure(): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Deep rumble
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 40;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.2);
    gain.gain.linearRampToValueAtTime(0, now + 1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 1);
  }
  
  private playCreature(): void {
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
    gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.3);
    gain.gain.setValueAtTime(this.volume * 0.2, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 2.5);
  }
}

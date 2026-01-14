/**
 * AMBIENCE - Main class for generating atmospheric soundscapes
 * 
 * Usage:
 * ```typescript
 * const ambience = new Ambience();
 * 
 * // Play a preset
 * await ambience.play('deepSea');
 * 
 * // Play with options
 * await ambience.play('deepSea', { 
 *   intensity: 0.8,    // 0-1, how prominent the sounds are
 *   depth: 2847,       // meters, affects low frequency content
 *   mystery: 0.5       // 0-1, adds ethereal/unknown elements
 * });
 * 
 * // Layer multiple presets
 * await ambience.play('deepSea');
 * await ambience.addLayer('sonar', { interval: 8 });
 * 
 * // Stop all
 * ambience.stop();
 * ```
 */

import { getAudioContext, getMasterGain, resumeAudioContext } from '../shared/audio-context';

export type AmbiencePreset = 
  | 'deepSea'           // Low drones, pressure, darkness
  | 'rov'               // Mechanical hums, servos, hydraulics
  | 'sonar'             // Periodic pings fading into distance
  | 'bioluminescence'   // Ethereal creature encounter tones
  | 'hydrophone'        // Underwater static, radio texture
  | 'discovery'         // Tension/wonder for important moments
  | 'lab'               // Research station, equipment hums
  | 'surface'           // Ocean surface, waves, wind
  | 'tension';          // Building suspense

export interface AmbienceOptions {
  intensity?: number;     // 0-1, overall volume/presence
  depth?: number;         // Meters, affects frequencies
  mystery?: number;       // 0-1, ethereal elements
  interval?: number;      // Seconds between events (for sonar, etc.)
  fadeIn?: number;        // Seconds to fade in
}

interface ActiveLayer {
  name: string;
  oscillators: OscillatorNode[];
  gains: GainNode[];
  intervals: number[];
  noiseSource?: AudioBufferSourceNode;
}

export class Ambience {
  private layers: ActiveLayer[] = [];
  private masterGain: GainNode;
  private isPlaying: boolean = false;
  
  constructor() {
    this.masterGain = getMasterGain();
  }
  
  /**
   * Play an ambience preset
   */
  async play(preset: AmbiencePreset, options: AmbienceOptions = {}): Promise<void> {
    await resumeAudioContext();
    
    const opts = {
      intensity: 0.5,
      depth: 2000,
      mystery: 0.3,
      interval: 5,
      fadeIn: 2,
      ...options
    };
    
    this.isPlaying = true;
    
    switch (preset) {
      case 'deepSea':
        this.createDeepSeaAmbience(opts);
        break;
      case 'rov':
        this.createROVAmbience(opts);
        break;
      case 'sonar':
        this.createSonarAmbience(opts);
        break;
      case 'bioluminescence':
        this.createBioluminescenceAmbience(opts);
        break;
      case 'hydrophone':
        this.createHydrophoneAmbience(opts);
        break;
      case 'discovery':
        this.createDiscoveryAmbience(opts);
        break;
      case 'lab':
        this.createLabAmbience(opts);
        break;
      case 'surface':
        this.createSurfaceAmbience(opts);
        break;
      case 'tension':
        this.createTensionAmbience(opts);
        break;
    }
  }
  
  /**
   * Add another layer on top of existing ambience
   */
  async addLayer(preset: AmbiencePreset, options: AmbienceOptions = {}): Promise<void> {
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
  
  // === PRESET IMPLEMENTATIONS ===
  
  private createDeepSeaAmbience(opts: AmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'deepSea', oscillators: [], gains: [], intervals: [] };
    
    // Deep pressure drone - lower frequency for deeper depths
    const baseFreq = Math.max(20, 60 - (opts.depth! / 100));
    
    // Main drone oscillator
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = baseFreq;
    
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0;
    droneGain.gain.linearRampToValueAtTime(opts.intensity! * 0.3, ctx.currentTime + opts.fadeIn!);
    
    // Sub-bass layer
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = baseFreq / 2;
    
    const subGain = ctx.createGain();
    subGain.gain.value = 0;
    subGain.gain.linearRampToValueAtTime(opts.intensity! * 0.2, ctx.currentTime + opts.fadeIn!);
    
    // Slow LFO modulation for movement
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05; // Very slow
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5; // Subtle pitch wobble
    
    lfo.connect(lfoGain);
    lfoGain.connect(droneOsc.frequency);
    
    // Connect
    droneOsc.connect(droneGain);
    subOsc.connect(subGain);
    droneGain.connect(this.masterGain);
    subGain.connect(this.masterGain);
    
    // Start
    droneOsc.start();
    subOsc.start();
    lfo.start();
    
    layer.oscillators.push(droneOsc, subOsc, lfo);
    layer.gains.push(droneGain, subGain);
    
    // Add filtered noise for texture
    this.addFilteredNoise(layer, opts.intensity! * 0.1, 100, 400, opts.fadeIn!);
    
    // Mystery elements - occasional low tones
    if (opts.mystery! > 0.2) {
      const mysteryInterval = window.setInterval(() => {
        if (!this.isPlaying) return;
        if (Math.random() < opts.mystery!) {
          this.playMysteryTone(opts.intensity! * 0.15);
        }
      }, 8000);
      layer.intervals.push(mysteryInterval);
    }
    
    this.layers.push(layer);
  }
  
  private createROVAmbience(opts: AmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'rov', oscillators: [], gains: [], intervals: [] };
    
    // Main motor hum
    const motorOsc = ctx.createOscillator();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.value = 60;
    
    const motorFilter = ctx.createBiquadFilter();
    motorFilter.type = 'lowpass';
    motorFilter.frequency.value = 200;
    motorFilter.Q.value = 2;
    
    const motorGain = ctx.createGain();
    motorGain.gain.value = 0;
    motorGain.gain.linearRampToValueAtTime(opts.intensity! * 0.15, ctx.currentTime + opts.fadeIn!);
    
    // Secondary motor harmonic
    const motor2Osc = ctx.createOscillator();
    motor2Osc.type = 'triangle';
    motor2Osc.frequency.value = 120;
    
    const motor2Gain = ctx.createGain();
    motor2Gain.gain.value = 0;
    motor2Gain.gain.linearRampToValueAtTime(opts.intensity! * 0.08, ctx.currentTime + opts.fadeIn!);
    
    // Connect
    motorOsc.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(this.masterGain);
    
    motor2Osc.connect(motor2Gain);
    motor2Gain.connect(this.masterGain);
    
    // Start
    motorOsc.start();
    motor2Osc.start();
    
    layer.oscillators.push(motorOsc, motor2Osc);
    layer.gains.push(motorGain, motor2Gain);
    
    // Occasional servo sounds
    const servoInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      if (Math.random() < 0.3) {
        this.playServoSound(opts.intensity! * 0.2);
      }
    }, 4000);
    layer.intervals.push(servoInterval);
    
    this.layers.push(layer);
  }
  
  private createSonarAmbience(opts: AmbienceOptions): void {
    const layer: ActiveLayer = { name: 'sonar', oscillators: [], gains: [], intervals: [] };
    
    // Periodic sonar pings
    const pingInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.playSonarPing(opts.intensity! * 0.4);
    }, (opts.interval || 5) * 1000);
    
    layer.intervals.push(pingInterval);
    
    // Play one immediately
    setTimeout(() => this.playSonarPing(opts.intensity! * 0.4), 500);
    
    this.layers.push(layer);
  }
  
  private createBioluminescenceAmbience(opts: AmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'bioluminescence', oscillators: [], gains: [], intervals: [] };
    
    // Ethereal pad - multiple sine waves
    const frequencies = [220, 330, 440, 554];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(opts.intensity! * 0.08, ctx.currentTime + opts.fadeIn! + i * 0.5);
      
      // Slow tremolo
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2 + i * 0.1;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = opts.intensity! * 0.02;
      
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      lfo.start();
      
      layer.oscillators.push(osc, lfo);
      layer.gains.push(gain);
    });
    
    // Occasional shimmer sounds
    const shimmerInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      if (Math.random() < 0.4) {
        this.playShimmer(opts.intensity! * 0.15);
      }
    }, 3000);
    layer.intervals.push(shimmerInterval);
    
    this.layers.push(layer);
  }
  
  private createHydrophoneAmbience(opts: AmbienceOptions): void {
    const layer: ActiveLayer = { name: 'hydrophone', oscillators: [], gains: [], intervals: [] };
    
    // Filtered noise for static
    this.addFilteredNoise(layer, opts.intensity! * 0.15, 200, 2000, opts.fadeIn!);
    
    // Occasional crackles
    const crackleInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      if (Math.random() < 0.5) {
        this.playCrackle(opts.intensity! * 0.1);
      }
    }, 2000);
    layer.intervals.push(crackleInterval);
    
    this.layers.push(layer);
  }
  
  private createDiscoveryAmbience(opts: AmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'discovery', oscillators: [], gains: [], intervals: [] };
    
    // Rising tension tone
    const tensionOsc = ctx.createOscillator();
    tensionOsc.type = 'sine';
    tensionOsc.frequency.value = 80;
    tensionOsc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 10);
    
    const tensionFilter = ctx.createBiquadFilter();
    tensionFilter.type = 'lowpass';
    tensionFilter.frequency.value = 300;
    
    const tensionGain = ctx.createGain();
    tensionGain.gain.value = 0;
    tensionGain.gain.linearRampToValueAtTime(opts.intensity! * 0.2, ctx.currentTime + opts.fadeIn!);
    
    // Wonder harmonics
    const wonderOsc = ctx.createOscillator();
    wonderOsc.type = 'sine';
    wonderOsc.frequency.value = 440;
    
    const wonderGain = ctx.createGain();
    wonderGain.gain.value = 0;
    wonderGain.gain.linearRampToValueAtTime(opts.intensity! * 0.1, ctx.currentTime + opts.fadeIn! + 2);
    
    // Connect
    tensionOsc.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    tensionGain.connect(this.masterGain);
    
    wonderOsc.connect(wonderGain);
    wonderGain.connect(this.masterGain);
    
    tensionOsc.start();
    wonderOsc.start();
    
    layer.oscillators.push(tensionOsc, wonderOsc);
    layer.gains.push(tensionGain, wonderGain);
    
    this.layers.push(layer);
  }
  
  private createLabAmbience(opts: AmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'lab', oscillators: [], gains: [], intervals: [] };
    
    // Fluorescent light hum (60Hz)
    const lightOsc = ctx.createOscillator();
    lightOsc.type = 'sine';
    lightOsc.frequency.value = 60;
    
    const lightGain = ctx.createGain();
    lightGain.gain.value = 0;
    lightGain.gain.linearRampToValueAtTime(opts.intensity! * 0.05, ctx.currentTime + opts.fadeIn!);
    
    // Equipment hum
    const equipOsc = ctx.createOscillator();
    equipOsc.type = 'triangle';
    equipOsc.frequency.value = 120;
    
    const equipGain = ctx.createGain();
    equipGain.gain.value = 0;
    equipGain.gain.linearRampToValueAtTime(opts.intensity! * 0.03, ctx.currentTime + opts.fadeIn!);
    
    lightOsc.connect(lightGain);
    lightGain.connect(this.masterGain);
    
    equipOsc.connect(equipGain);
    equipGain.connect(this.masterGain);
    
    lightOsc.start();
    equipOsc.start();
    
    layer.oscillators.push(lightOsc, equipOsc);
    layer.gains.push(lightGain, equipGain);
    
    // Occasional beeps
    const beepInterval = window.setInterval(() => {
      if (!this.isPlaying) return;
      if (Math.random() < 0.3) {
        this.playBeep(opts.intensity! * 0.15);
      }
    }, 5000);
    layer.intervals.push(beepInterval);
    
    this.layers.push(layer);
  }
  
  private createSurfaceAmbience(opts: AmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'surface', oscillators: [], gains: [], intervals: [] };
    
    // Wind/wave noise
    this.addFilteredNoise(layer, opts.intensity! * 0.2, 100, 800, opts.fadeIn!);
    
    // Gentle wave rhythm
    const waveOsc = ctx.createOscillator();
    waveOsc.type = 'sine';
    waveOsc.frequency.value = 0.1; // Very slow
    
    const waveGain = ctx.createGain();
    waveGain.gain.value = 0;
    waveGain.gain.linearRampToValueAtTime(opts.intensity! * 0.1, ctx.currentTime + opts.fadeIn!);
    
    waveOsc.connect(waveGain);
    waveGain.connect(this.masterGain);
    
    waveOsc.start();
    
    layer.oscillators.push(waveOsc);
    layer.gains.push(waveGain);
    
    this.layers.push(layer);
  }
  
  private createTensionAmbience(opts: AmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'tension', oscillators: [], gains: [], intervals: [] };
    
    // Low rumble
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.value = 30;
    
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0;
    rumbleGain.gain.linearRampToValueAtTime(opts.intensity! * 0.25, ctx.currentTime + opts.fadeIn!);
    
    // Dissonant interval
    const dissonantOsc = ctx.createOscillator();
    dissonantOsc.type = 'sine';
    dissonantOsc.frequency.value = 233; // Slightly off from 220
    
    const dissonantGain = ctx.createGain();
    dissonantGain.gain.value = 0;
    dissonantGain.gain.linearRampToValueAtTime(opts.intensity! * 0.08, ctx.currentTime + opts.fadeIn! + 3);
    
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    
    dissonantOsc.connect(dissonantGain);
    dissonantGain.connect(this.masterGain);
    
    rumbleOsc.start();
    dissonantOsc.start();
    
    layer.oscillators.push(rumbleOsc, dissonantOsc);
    layer.gains.push(rumbleGain, dissonantGain);
    
    this.layers.push(layer);
  }
  
  // === HELPER SOUND METHODS ===
  
  private addFilteredNoise(layer: ActiveLayer, volume: number, lowFreq: number, highFreq: number, fadeIn: number): void {
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
  
  private playSonarPing(volume: number): void {
    const ctx = getAudioContext();
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(ctx.currentTime + 2);
  }
  
  private playMysteryTone(volume: number): void {
    const ctx = getAudioContext();
    
    const frequencies = [55, 82.5, 110, 165];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 6);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(ctx.currentTime + 6);
  }
  
  private playServoSound(volume: number): void {
    const ctx = getAudioContext();
    
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 200 + Math.random() * 100;
    osc.frequency.linearRampToValueAtTime(150 + Math.random() * 50, ctx.currentTime + 0.3);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 5;
    
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
  
  private playShimmer(volume: number): void {
    const ctx = getAudioContext();
    
    const baseFreq = 800 + Math.random() * 400;
    
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * (1 + i * 0.5);
      
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(volume * (1 - i * 0.3), ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + 1.5);
    }
  }
  
  private playCrackle(volume: number): void {
    const ctx = getAudioContext();
    
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.random();
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }
  
  private playBeep(volume: number): void {
    const ctx = getAudioContext();
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;
    
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.gain.setValueAtTime(volume, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
}

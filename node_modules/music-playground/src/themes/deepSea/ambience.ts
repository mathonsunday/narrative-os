/**
 * DEEP SEA THEME - Ambience Presets
 * 
 * Deep-sea specific ambience presets for marine biology projects.
 */

import { Ambience, type AmbienceOptions, type ActiveLayer } from '../../core/ambience.js';
import { getAudioContext } from '../../shared/audio-context.js';

export type DeepSeaPreset = 
  | 'deepSea'           // Low drones, pressure, darkness
  | 'rov'               // Mechanical hums, servos, hydraulics
  | 'sonar'             // Periodic pings fading into distance
  | 'bioluminescence'   // Ethereal creature encounter tones
  | 'hydrophone'        // Underwater static, radio texture
  | 'discovery'         // Tension/wonder for important moments
  | 'lab'               // Research station, equipment hums
  | 'surface'           // Ocean surface, waves, wind
  | 'tension';          // Building suspense

/**
 * DeepSeaAmbience - Ambience class with deep-sea presets pre-registered
 */
export class DeepSeaAmbience extends Ambience {
  constructor() {
    super();
    
    // Register all deep-sea presets
    this.registerPreset('deepSea', createDeepSeaAmbience);
    this.registerPreset('rov', createROVAmbience);
    this.registerPreset('sonar', createSonarAmbience);
    this.registerPreset('bioluminescence', createBioluminescenceAmbience);
    this.registerPreset('hydrophone', createHydrophoneAmbience);
    this.registerPreset('discovery', createDiscoveryAmbience);
    this.registerPreset('lab', createLabAmbience);
    this.registerPreset('surface', createSurfaceAmbience);
    this.registerPreset('tension', createTensionAmbience);
  }
  
  /**
   * Play a deep-sea preset (type-safe)
   */
  async play(preset: DeepSeaPreset, options: AmbienceOptions = {}): Promise<void> {
    return super.play(preset, options);
  }
  
  /**
   * Add another layer
   */
  async addLayer(preset: DeepSeaPreset, options: AmbienceOptions = {}): Promise<void> {
    return super.addLayer(preset, options);
  }
}

// ============================================
// PRESET HANDLERS
// ============================================

function createDeepSeaAmbience(ambience: Ambience, opts: AmbienceOptions): void {
  const ctx = getAudioContext();
  const layer: ActiveLayer = { name: 'deepSea', oscillators: [], gains: [], intervals: [] };
  
  // Deep pressure drone - lower frequency for deeper depths
  const baseFreq = Math.max(20, 60 - ((opts.depth || 2000) / 100));
  
  // Main drone oscillator
  const droneOsc = ctx.createOscillator();
  droneOsc.type = 'sine';
  droneOsc.frequency.value = baseFreq;
  
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0;
  droneGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.3, ctx.currentTime + (opts.fadeIn || 2));
  
  // Sub-bass layer
  const subOsc = ctx.createOscillator();
  subOsc.type = 'sine';
  subOsc.frequency.value = baseFreq / 2;
  
  const subGain = ctx.createGain();
  subGain.gain.value = 0;
  subGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.2, ctx.currentTime + (opts.fadeIn || 2));
  
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
  droneGain.connect(ambience.getMasterGain());
  subGain.connect(ambience.getMasterGain());
  
  // Start
  droneOsc.start();
  subOsc.start();
  lfo.start();
  
  layer.oscillators.push(droneOsc, subOsc, lfo);
  layer.gains.push(droneGain, subGain);
  
  // Add filtered noise for texture
  ambience.addFilteredNoise(layer, (opts.intensity || 0.5) * 0.1, 100, 400, opts.fadeIn || 2);
  
  // Mystery elements - occasional low tones
  if ((opts.mystery || 0.3) > 0.2) {
    const mysteryInterval = window.setInterval(() => {
      if (!ambience.getIsPlaying()) return;
      if (Math.random() < (opts.mystery || 0.3)) {
        playMysteryTone(ambience, (opts.intensity || 0.5) * 0.15);
      }
    }, 8000);
    layer.intervals.push(mysteryInterval);
  }
  
  ambience.getLayers().push(layer);
}

function createROVAmbience(ambience: Ambience, opts: AmbienceOptions): void {
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
  motorGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.15, ctx.currentTime + (opts.fadeIn || 2));
  
  // Secondary motor harmonic
  const motor2Osc = ctx.createOscillator();
  motor2Osc.type = 'triangle';
  motor2Osc.frequency.value = 120;
  
  const motor2Gain = ctx.createGain();
  motor2Gain.gain.value = 0;
  motor2Gain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.08, ctx.currentTime + (opts.fadeIn || 2));
  
  // Connect
  motorOsc.connect(motorFilter);
  motorFilter.connect(motorGain);
  motorGain.connect((ambience as any).masterGain);
  
  motor2Osc.connect(motor2Gain);
  motor2Gain.connect((ambience as any).masterGain);
  
  // Start
  motorOsc.start();
  motor2Osc.start();
  
  layer.oscillators.push(motorOsc, motor2Osc);
  layer.gains.push(motorGain, motor2Gain);
  
  // Occasional servo sounds
  const servoInterval = window.setInterval(() => {
    if (!(ambience as any).isPlaying) return;
    if (Math.random() < 0.3) {
      playServoSound(ambience, (opts.intensity || 0.5) * 0.2);
    }
  }, 4000);
  layer.intervals.push(servoInterval);
  
  (ambience as any).layers.push(layer);
}

function createSonarAmbience(ambience: Ambience, opts: AmbienceOptions): void {
  const layer: ActiveLayer = { name: 'sonar', oscillators: [], gains: [], intervals: [] };
  
  // Periodic sonar pings
  const pingInterval = window.setInterval(() => {
    if (!(ambience as any).isPlaying) return;
    playSonarPing(ambience, (opts.intensity || 0.5) * 0.4);
  }, ((opts.interval || 5) * 1000));
  
  layer.intervals.push(pingInterval);
  
  // Play one immediately
  setTimeout(() => playSonarPing(ambience, (opts.intensity || 0.5) * 0.4), 500);
  
  (ambience as any).layers.push(layer);
}

function createBioluminescenceAmbience(ambience: Ambience, opts: AmbienceOptions): void {
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
    gain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.08, ctx.currentTime + (opts.fadeIn || 2) + i * 0.5);
    
    // Slow tremolo
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2 + i * 0.1;
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = (opts.intensity || 0.5) * 0.02;
    
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc.connect(gain);
    gain.connect((ambience as any).masterGain);
    
    osc.start();
    lfo.start();
    
    layer.oscillators.push(osc, lfo);
    layer.gains.push(gain);
  });
  
  // Occasional shimmer sounds
  const shimmerInterval = window.setInterval(() => {
    if (!(ambience as any).isPlaying) return;
    if (Math.random() < 0.4) {
      playShimmer(ambience, (opts.intensity || 0.5) * 0.15);
    }
  }, 3000);
  layer.intervals.push(shimmerInterval);
  
  (ambience as any).layers.push(layer);
}

function createHydrophoneAmbience(ambience: Ambience, opts: AmbienceOptions): void {
  const layer: ActiveLayer = { name: 'hydrophone', oscillators: [], gains: [], intervals: [] };
  
  // Filtered noise for static
  (ambience as any).addFilteredNoise(layer, (opts.intensity || 0.5) * 0.15, 200, 2000, opts.fadeIn || 2);
  
  // Occasional crackles
  const crackleInterval = window.setInterval(() => {
    if (!(ambience as any).isPlaying) return;
    if (Math.random() < 0.5) {
      playCrackle(ambience, (opts.intensity || 0.5) * 0.1);
    }
  }, 2000);
  layer.intervals.push(crackleInterval);
  
  (ambience as any).layers.push(layer);
}

function createDiscoveryAmbience(ambience: Ambience, opts: AmbienceOptions): void {
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
  tensionGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.2, ctx.currentTime + (opts.fadeIn || 2));
  
  // Wonder harmonics
  const wonderOsc = ctx.createOscillator();
  wonderOsc.type = 'sine';
  wonderOsc.frequency.value = 440;
  
  const wonderGain = ctx.createGain();
  wonderGain.gain.value = 0;
  wonderGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.1, ctx.currentTime + (opts.fadeIn || 2) + 2);
  
  // Connect
  tensionOsc.connect(tensionFilter);
  tensionFilter.connect(tensionGain);
  tensionGain.connect((ambience as any).masterGain);
  
  wonderOsc.connect(wonderGain);
  wonderGain.connect((ambience as any).masterGain);
  
  tensionOsc.start();
  wonderOsc.start();
  
  layer.oscillators.push(tensionOsc, wonderOsc);
  layer.gains.push(tensionGain, wonderGain);
  
  (ambience as any).layers.push(layer);
}

function createLabAmbience(ambience: Ambience, opts: AmbienceOptions): void {
  const ctx = getAudioContext();
  const layer: ActiveLayer = { name: 'lab', oscillators: [], gains: [], intervals: [] };
  
  // Fluorescent light hum (60Hz)
  const lightOsc = ctx.createOscillator();
  lightOsc.type = 'sine';
  lightOsc.frequency.value = 60;
  
  const lightGain = ctx.createGain();
  lightGain.gain.value = 0;
  lightGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.05, ctx.currentTime + (opts.fadeIn || 2));
  
  // Equipment hum
  const equipOsc = ctx.createOscillator();
  equipOsc.type = 'triangle';
  equipOsc.frequency.value = 120;
  
  const equipGain = ctx.createGain();
  equipGain.gain.value = 0;
  equipGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.03, ctx.currentTime + (opts.fadeIn || 2));
  
  lightOsc.connect(lightGain);
  lightGain.connect((ambience as any).masterGain);
  
  equipOsc.connect(equipGain);
  equipGain.connect((ambience as any).masterGain);
  
  lightOsc.start();
  equipOsc.start();
  
  layer.oscillators.push(lightOsc, equipOsc);
  layer.gains.push(lightGain, equipGain);
  
  // Occasional beeps
  const beepInterval = window.setInterval(() => {
    if (!(ambience as any).isPlaying) return;
    if (Math.random() < 0.3) {
      playBeep(ambience, (opts.intensity || 0.5) * 0.15);
    }
  }, 5000);
  layer.intervals.push(beepInterval);
  
  (ambience as any).layers.push(layer);
}

function createSurfaceAmbience(ambience: Ambience, opts: AmbienceOptions): void {
  const ctx = getAudioContext();
  const layer: ActiveLayer = { name: 'surface', oscillators: [], gains: [], intervals: [] };
  
  // Wind/wave noise
  (ambience as any).addFilteredNoise(layer, (opts.intensity || 0.5) * 0.2, 100, 800, opts.fadeIn || 2);
  
  // Gentle wave rhythm
  const waveOsc = ctx.createOscillator();
  waveOsc.type = 'sine';
  waveOsc.frequency.value = 0.1; // Very slow
  
  const waveGain = ctx.createGain();
  waveGain.gain.value = 0;
  waveGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.1, ctx.currentTime + (opts.fadeIn || 2));
  
  waveOsc.connect(waveGain);
  waveGain.connect((ambience as any).masterGain);
  
  waveOsc.start();
  
  layer.oscillators.push(waveOsc);
  layer.gains.push(waveGain);
  
  (ambience as any).layers.push(layer);
}

function createTensionAmbience(ambience: Ambience, opts: AmbienceOptions): void {
  const ctx = getAudioContext();
  const layer: ActiveLayer = { name: 'tension', oscillators: [], gains: [], intervals: [] };
  
  // Low rumble
  const rumbleOsc = ctx.createOscillator();
  rumbleOsc.type = 'sine';
  rumbleOsc.frequency.value = 30;
  
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0;
  rumbleGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.25, ctx.currentTime + (opts.fadeIn || 2));
  
  // Dissonant interval
  const dissonantOsc = ctx.createOscillator();
  dissonantOsc.type = 'sine';
  dissonantOsc.frequency.value = 233; // Slightly off from 220
  
  const dissonantGain = ctx.createGain();
  dissonantGain.gain.value = 0;
  dissonantGain.gain.linearRampToValueAtTime((opts.intensity || 0.5) * 0.08, ctx.currentTime + (opts.fadeIn || 2) + 3);
  
  rumbleOsc.connect(rumbleGain);
  rumbleGain.connect((ambience as any).masterGain);
  
  dissonantOsc.connect(dissonantGain);
  dissonantGain.connect((ambience as any).masterGain);
  
  rumbleOsc.start();
  dissonantOsc.start();
  
  layer.oscillators.push(rumbleOsc, dissonantOsc);
  layer.gains.push(rumbleGain, dissonantGain);
  
  (ambience as any).layers.push(layer);
}

// ============================================
// HELPER SOUND FUNCTIONS
// ============================================

function playSonarPing(ambience: Ambience, volume: number): void {
  const ctx = getAudioContext();
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 1200;
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
  
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  
  osc.connect(gain);
  gain.connect((ambience as any).masterGain);
  
  osc.start();
  osc.stop(ctx.currentTime + 2);
}

function playMysteryTone(ambience: Ambience, volume: number): void {
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
  gain.connect((ambience as any).masterGain);
  
  osc.start();
  osc.stop(ctx.currentTime + 6);
}

function playServoSound(ambience: Ambience, volume: number): void {
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
  gain.connect((ambience as any).masterGain);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

function playShimmer(ambience: Ambience, volume: number): void {
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
    gain.connect((ambience as any).masterGain);
    
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + 1.5);
  }
}

function playCrackle(ambience: Ambience, volume: number): void {
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
  gain.connect((ambience as any).masterGain);
  
  noise.start();
}

function playBeep(ambience: Ambience, volume: number): void {
  const ctx = getAudioContext();
  
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 880;
  
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.gain.setValueAtTime(volume, ctx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect((ambience as any).masterGain);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

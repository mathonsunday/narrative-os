/**
 * LIVING OS THEME - Ambience Presets
 * 
 * Plant biology research OS theme with growth-level progression.
 * Starts pleasant and professional, gradually becomes unsettling as organic growth spreads.
 */

import { Ambience, type AmbienceOptions, type ActiveLayer } from '../../core/ambience.js';
import { getAudioContext } from '../../shared/audio-context.js';

export interface LivingOsAmbienceOptions extends AmbienceOptions {
  growthLevel?: number;  // 0-100, controls progression from normal to eerie
}

export type LivingOsPreset = 
  | 'fieldStation'      // Main ambience that responds to growthLevel
  | 'researchLab';      // Alternative lab-focused ambience

/**
 * LivingOsAmbience - Ambience class with living OS presets
 * Supports growth-level progression for gradual transformation
 */
export class LivingOsAmbience extends Ambience {
  private growthLevel: number = 0;
  private activeFieldStationLayer: ActiveLayer | null = null;
  
  constructor() {
    super();
    
    // Register presets
    this.registerPreset('fieldStation', this.createFieldStationAmbience.bind(this));
    this.registerPreset('researchLab', this.createResearchLabAmbience.bind(this));
  }
  
  /**
   * Update growth level and adjust active ambience
   */
  updateGrowthLevel(level: number): void {
    this.growthLevel = Math.max(0, Math.min(100, level));
    
    // If fieldStation is active, recreate it with new growth level
    if (this.activeFieldStationLayer) {
      // Clean up timeouts
      this.cleanupLayerTimeouts(this.activeFieldStationLayer);
      
      // Stop current layer
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      for (const gain of this.activeFieldStationLayer.gains) {
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
      }
      
      // Start new layer with updated growth level
      setTimeout(() => {
        const opts: LivingOsAmbienceOptions = {
          intensity: 0.18, // Lower default intensity
          growthLevel: this.growthLevel,
          fadeIn: 1,
        };
        this.createFieldStationAmbience(this, opts);
      }, 500);
    }
  }
  
  /**
   * Override stop to clean up timeouts
   */
  stop(fadeOut: number = 1): void {
    // Clean up all layer timeouts
    for (const layer of this.getLayers()) {
      this.cleanupLayerTimeouts(layer);
    }
    
    // Call parent stop
    super.stop(fadeOut);
  }
  
  /**
   * Clean up timeouts for a layer
   */
  private cleanupLayerTimeouts(layer: ActiveLayer): void {
    // Clean up bird timeouts
    if ((layer as any).birdTimeouts) {
      (layer as any).birdTimeouts.forEach((id: number) => clearTimeout(id));
      (layer as any).birdTimeouts = [];
    }
    
    // Clean up rustle timeouts
    if ((layer as any).rustleTimeouts) {
      (layer as any).rustleTimeouts.forEach((id: number) => clearTimeout(id));
      (layer as any).rustleTimeouts = [];
    }
    
    // Clean up organic timeouts
    if ((layer as any).organicTimeouts) {
      (layer as any).organicTimeouts.forEach((id: number) => clearTimeout(id));
      (layer as any).organicTimeouts = [];
    }
  }
  
  /**
   * Get current growth level
   */
  getGrowthLevel(): number {
    return this.growthLevel;
  }
  
  /**
   * Play a preset (type-safe)
   */
  async play(preset: LivingOsPreset, options: LivingOsAmbienceOptions = {}): Promise<void> {
    if (options.growthLevel !== undefined) {
      this.growthLevel = Math.max(0, Math.min(100, options.growthLevel));
    }
    return super.play(preset, options);
  }
  
  /**
   * Create field station ambience that responds to growth level
   */
  private createFieldStationAmbience(ambience: Ambience, opts: LivingOsAmbienceOptions): void {
    const layer: ActiveLayer = { name: 'fieldStation', oscillators: [], gains: [], intervals: [] };
    
    const growthLevel = opts.growthLevel ?? this.growthLevel;
    const intensity = opts.intensity || 0.3;
    const fadeIn = opts.fadeIn || 2;
    
    // Determine stage based on growth level
    const stage = this.getStage(growthLevel);
    
    // Base layer: gentle nature sounds (birds, wind)
    this.addNatureLayer(layer, ambience, stage, intensity, fadeIn);
    
    // Lab/equipment layer
    this.addLabLayer(layer, ambience, stage, intensity, fadeIn);
    
    // Organic growth layer (only in advanced stages)
    if (stage >= 2) {
      this.addOrganicLayer(layer, ambience, stage, intensity, fadeIn);
    }
    
    this.activeFieldStationLayer = layer;
    ambience.getLayers().push(layer);
  }
  
  /**
   * Create research lab ambience
   */
  private createResearchLabAmbience(ambience: Ambience, opts: LivingOsAmbienceOptions): void {
    const ctx = getAudioContext();
    const layer: ActiveLayer = { name: 'researchLab', oscillators: [], gains: [], intervals: [] };
    
    const growthLevel = opts.growthLevel ?? this.growthLevel;
    const intensity = opts.intensity || 0.18; // Lower default
    const fadeIn = opts.fadeIn || 2;
    const stage = this.getStage(growthLevel);
    
    // Equipment hum
    const equipOsc = ctx.createOscillator();
    equipOsc.type = 'triangle';
    equipOsc.frequency.value = 60;
    
    const equipFilter = ctx.createBiquadFilter();
    equipFilter.type = 'lowpass';
    equipFilter.frequency.value = stage >= 2 ? 150 : 200; // Darker in advanced stages
    
    const equipGain = ctx.createGain();
    equipGain.gain.value = 0;
    equipGain.gain.linearRampToValueAtTime(intensity * 0.08, ctx.currentTime + fadeIn);
    
    // Breathing/pulsing effect in advanced stages
    if (stage >= 2) {
      const breathLfo = ctx.createOscillator();
      breathLfo.type = 'sine';
      breathLfo.frequency.value = 0.3; // Slow breathing
      
      const breathGain = ctx.createGain();
      breathGain.gain.value = intensity * 0.02;
      
      breathLfo.connect(breathGain);
      breathGain.connect(equipGain.gain);
      
      breathLfo.start();
      layer.oscillators.push(breathLfo);
    }
    
    equipOsc.connect(equipFilter);
    equipFilter.connect(equipGain);
    equipGain.connect(ambience.getMasterGain());
    
    equipOsc.start();
    layer.oscillators.push(equipOsc);
    layer.gains.push(equipGain);
    
    ambience.getLayers().push(layer);
  }
  
  /**
   * Get stage (0-3) based on growth level
   */
  private getStage(growthLevel: number): number {
    if (growthLevel < 20) return 0; // Normal
    if (growthLevel < 50) return 1; // Slightly off
    if (growthLevel < 80) return 2; // Unsettling
    return 3; // Eerie
  }
  
  /**
   * Add nature sounds layer (birds, wind) - Organic and non-repetitive
   */
  private addNatureLayer(layer: ActiveLayer, ambience: Ambience, stage: number, intensity: number, fadeIn: number): void {
    const ctx = getAudioContext();
    
    // Wind through leaves - Longer buffer for less repetition, with subtle drift
    const windNoise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 45; // 45 second buffer (much longer)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pink noise with subtle variation over time
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      // Add subtle drift - wind intensity varies slowly over the buffer
      const drift = 0.9 + 0.2 * Math.sin(t * Math.PI * 2); // Slow cycle
      data[i] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 0.5) * drift;
    }
    
    windNoise.buffer = buffer;
    windNoise.loop = true;
    
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = stage >= 2 ? 400 : 800;
    
    // Add subtle pitch/volume variation LFO for organic feel
    const windVariationLfo = ctx.createOscillator();
    windVariationLfo.type = 'sine';
    windVariationLfo.frequency.value = 0.02; // Very slow variation (50 second cycle)
    
    const windVariationGain = ctx.createGain();
    windVariationGain.gain.value = intensity * 0.03; // Subtle variation
    
    windVariationLfo.connect(windVariationGain);
    
    // Distortion in advanced stages
    if (stage >= 2) {
      const distortion = ctx.createWaveShaper();
      distortion.curve = this.makeDistortionCurve(stage === 3 ? 30 : 15) as any;
      distortion.oversample = '4x';
      
      windNoise.connect(distortion);
      distortion.connect(windFilter);
    } else {
      windNoise.connect(windFilter);
    }
    
    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    windGain.gain.linearRampToValueAtTime(intensity * 0.12, ctx.currentTime + fadeIn);
    
    // Connect variation LFO to gain
    windVariationGain.connect(windGain.gain);
    
    windFilter.connect(windGain);
    windGain.connect(ambience.getMasterGain());
    
    windNoise.start();
    windVariationLfo.start();
    layer.noiseSource = windNoise;
    layer.oscillators.push(windVariationLfo);
    layer.gains.push(windGain);
    
    // Bird chirps - Multiple independent "voices" with exponential distribution timing
    // Create 3-4 independent bird patterns that don't sync
    const birdVoiceCount = stage >= 2 ? 2 : 4;
    for (let voiceIndex = 0; voiceIndex < birdVoiceCount; voiceIndex++) {
      // Each voice starts at a random offset and has its own timing
      const initialDelay = Math.random() * 5000; // Random start (0-5 seconds)
      
      setTimeout(() => {
        this.scheduleNextBirdChirp(ambience, layer, stage, intensity, voiceIndex);
      }, initialDelay);
    }
  }
  
  /**
   * Schedule next bird chirp using exponential distribution for organic timing
   */
  private scheduleNextBirdChirp(ambience: Ambience, layer: ActiveLayer, stage: number, intensity: number, voiceIndex: number): void {
    if (!ambience.getIsPlaying()) return;
    
    // Exponential distribution for natural timing
    // Average interval: 8-15 seconds (varies by stage and voice)
    const baseInterval = stage >= 2 ? 12000 : 8000;
    const voiceVariation = 0.7 + (voiceIndex * 0.2); // Each voice has different timing
    const averageInterval = baseInterval * voiceVariation;
    
    // Exponential distribution: -ln(random) * average
    const nextInterval = -Math.log(Math.random()) * averageInterval;
    
    // Clamp to reasonable range (2-60 seconds)
    const clampedInterval = Math.max(2000, Math.min(60000, nextInterval));
    
    // Add occasional longer silences (birds don't chirp constantly)
    // 10% chance of extra long pause (30-90 seconds)
    const hasLongPause = Math.random() < 0.1;
    const finalInterval = hasLongPause 
      ? clampedInterval + (30000 + Math.random() * 60000)
      : clampedInterval;
    
    const timeoutId = window.setTimeout(() => {
      if (!ambience.getIsPlaying()) return;
      
      // Vary chirp characteristics
      const chirpVolume = intensity * 0.08 * (0.7 + Math.random() * 0.3); // 70-100% variation
      this.playBirdChirp(ambience, stage, chirpVolume);
      
      // Schedule next chirp
      this.scheduleNextBirdChirp(ambience, layer, stage, intensity, voiceIndex);
    }, finalInterval);
    
    // Store timeout ID for cleanup (we'll track these in a new array)
    if (!(layer as any).birdTimeouts) {
      (layer as any).birdTimeouts = [];
    }
    (layer as any).birdTimeouts.push(timeoutId);
  }
  
  /**
   * Add lab/equipment layer
   */
  private addLabLayer(layer: ActiveLayer, ambience: Ambience, stage: number, intensity: number, fadeIn: number): void {
    const ctx = getAudioContext();
    
    // Equipment hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 60;
    
    const humGain = ctx.createGain();
    humGain.gain.value = 0;
    humGain.gain.linearRampToValueAtTime(intensity * 0.05, ctx.currentTime + fadeIn);
    
    // Breathing effect in advanced stages
    if (stage >= 2) {
      const breathLfo = ctx.createOscillator();
      breathLfo.type = 'sine';
      breathLfo.frequency.value = 0.4; // Breathing rate
      
      const breathGain = ctx.createGain();
      breathGain.gain.value = intensity * 0.02;
      
      breathLfo.connect(breathGain);
      breathGain.connect(humGain.gain);
      
      breathLfo.start();
      layer.oscillators.push(breathLfo);
    }
    
    humOsc.connect(humGain);
    humGain.connect(ambience.getMasterGain());
    
    humOsc.start();
    layer.oscillators.push(humOsc);
    layer.gains.push(humGain);
    
    // Paper rustling (occasional) - Organic timing
    this.scheduleNextRustle(ambience, layer, stage, intensity);
  }
  
  /**
   * Add organic growth layer (advanced stages only)
   */
  private addOrganicLayer(layer: ActiveLayer, ambience: Ambience, stage: number, intensity: number, fadeIn: number): void {
    const ctx = getAudioContext();
    
    // Subtle root/plant movement sounds - Organic timing
    this.scheduleNextOrganicGrowth(ambience, layer, stage, intensity);
    
    // Low organic drone in final stage
    if (stage === 3) {
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.value = 40;
      
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0;
      droneGain.gain.linearRampToValueAtTime(intensity * 0.08, ctx.currentTime + fadeIn);
      
      droneOsc.connect(droneGain);
      droneGain.connect(ambience.getMasterGain());
      
      droneOsc.start();
      layer.oscillators.push(droneOsc);
      layer.gains.push(droneGain);
    }
  }
  
  /**
   * Play bird chirp (varies by stage) - More organic with micro-variations
   */
  private playBirdChirp(ambience: Ambience, stage: number, volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Base frequency with more variation
    const baseFreq = 700 + Math.random() * 500; // Wider range: 700-1200 Hz
    const freq = stage >= 2 ? baseFreq * (stage === 3 ? 0.5 : 0.7) : baseFreq;
    
    // Add subtle pitch variation (±5%)
    const pitchVariation = freq * (1 + (Math.random() - 0.5) * 0.1);
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = pitchVariation;
    
    // Vary chirp length (0.15-0.25 seconds)
    const chirpLength = 0.15 + Math.random() * 0.1;
    
    // More organic frequency curve
    if (stage === 3) {
      // Eerie: reversed/distorted
      osc.frequency.setValueAtTime(pitchVariation, now);
      osc.frequency.exponentialRampToValueAtTime(pitchVariation * 1.5, now + chirpLength * 0.5);
    } else {
      // Normal: natural chirp curve with variation
      const startFreq = pitchVariation * (1.15 + Math.random() * 0.1); // Start slightly higher
      const endFreq = pitchVariation * (0.95 + Math.random() * 0.1); // End slightly lower
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + chirpLength);
    }
    
    // Volume variation (80-100% of base volume)
    const volumeVariation = volume * (0.8 + Math.random() * 0.2);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volumeVariation, now + chirpLength * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + chirpLength);
    
    osc.connect(gain);
    gain.connect(ambience.getMasterGain());
    
    osc.start(now);
    osc.stop(now + chirpLength);
  }
  
  /**
   * Schedule next rustle sound with organic timing
   */
  private scheduleNextRustle(ambience: Ambience, layer: ActiveLayer, stage: number, intensity: number): void {
    if (!ambience.getIsPlaying()) return;
    
    // Exponential distribution: average 15-25 seconds
    const averageInterval = 15000 + Math.random() * 10000;
    const nextInterval = -Math.log(Math.random()) * averageInterval;
    const clampedInterval = Math.max(5000, Math.min(45000, nextInterval));
    
    const timeoutId = window.setTimeout(() => {
      if (!ambience.getIsPlaying()) return;
      
      // 30% chance of rustle happening
      if (Math.random() < 0.3) {
        const rustleVolume = intensity * 0.08 * (0.8 + Math.random() * 0.2);
        this.playRustle(ambience, stage, rustleVolume);
      }
      
      // Schedule next check
      this.scheduleNextRustle(ambience, layer, stage, intensity);
    }, clampedInterval);
    
    if (!(layer as any).rustleTimeouts) {
      (layer as any).rustleTimeouts = [];
    }
    (layer as any).rustleTimeouts.push(timeoutId);
  }
  
  /**
   * Schedule next organic growth sound with organic timing
   */
  private scheduleNextOrganicGrowth(ambience: Ambience, layer: ActiveLayer, stage: number, intensity: number): void {
    if (!ambience.getIsPlaying()) return;
    
    // Exponential distribution: average 8-15 seconds (varies by stage)
    const baseInterval = stage === 3 ? 8000 : 12000;
    const averageInterval = baseInterval + Math.random() * 7000;
    const nextInterval = -Math.log(Math.random()) * averageInterval;
    const clampedInterval = Math.max(3000, Math.min(30000, nextInterval));
    
    const timeoutId = window.setTimeout(() => {
      if (!ambience.getIsPlaying()) return;
      
      // Probability varies by stage
      const probability = stage === 3 ? 0.5 : 0.3;
      if (Math.random() < probability) {
        const growthVolume = intensity * 0.1 * (0.7 + Math.random() * 0.3);
        this.playOrganicGrowth(ambience, stage, growthVolume);
      }
      
      // Schedule next check
      this.scheduleNextOrganicGrowth(ambience, layer, stage, intensity);
    }, clampedInterval);
    
    if (!(layer as any).organicTimeouts) {
      (layer as any).organicTimeouts = [];
    }
    (layer as any).organicTimeouts.push(timeoutId);
  }
  
  /**
   * Play rustling sound
   */
  private playRustle(ambience: Ambience, stage: number, volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.random() * 0.5;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = stage >= 2 ? 2000 : 3000;
    filter.Q.value = 2;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ambience.getMasterGain());
    
    noise.start();
  }
  
  /**
   * Play organic growth sound
   */
  private playOrganicGrowth(ambience: Ambience, _stage: number, volume: number): void {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Very subtle, like leaf unfurling
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ambience.getMasterGain());
    
    osc.start(now);
    osc.stop(now + 0.8);
  }
  
  /**
   * Create distortion curve for wave shaper
   */
  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }
}

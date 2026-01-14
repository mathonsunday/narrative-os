// Physical modeling synthesis using Karplus-Strong algorithm
// Simulates plucked strings by using a delay line with filtering

import { getAudioContext, getMasterGain, getSampleRate } from '../shared/audio-context';

export interface PhysicalModelOptions {
  damping: number;      // 0-1, how quickly the string decays
  brightness: number;   // 0-1, filter cutoff for the feedback loop
  pluckPosition: number; // 0-1, where on the string we pluck (affects harmonics)
}

const defaultOptions: PhysicalModelOptions = {
  damping: 0.5,
  brightness: 0.8,
  pluckPosition: 0.5,
};

export class PhysicalModel {
  private options: PhysicalModelOptions;
  private outputNode: GainNode;
  private activeVoices: Map<number, AudioBufferSourceNode> = new Map();
  
  constructor(options: Partial<PhysicalModelOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
    
    const ctx = getAudioContext();
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.7;
    this.outputNode.connect(getMasterGain());
  }
  
  connect(destination: AudioNode): void {
    this.outputNode.disconnect();
    this.outputNode.connect(destination);
  }
  
  // Generate Karplus-Strong plucked string sound
  private generateKarplusStrong(frequency: number, duration: number): AudioBuffer {
    const ctx = getAudioContext();
    const sampleRate = getSampleRate();
    const numSamples = Math.ceil(sampleRate * duration);
    
    // Period in samples
    const period = Math.round(sampleRate / frequency);
    
    // Create buffer for the delay line
    const delayLine = new Float32Array(period);
    
    // Initialize delay line with noise (the "pluck" excitation)
    // Pluck position affects the harmonic content
    const pluckWidth = Math.max(1, Math.floor(period * this.options.pluckPosition));
    for (let i = 0; i < period; i++) {
      if (i < pluckWidth) {
        // Shaped noise burst
        const envelope = Math.sin((Math.PI * i) / pluckWidth);
        delayLine[i] = (Math.random() * 2 - 1) * envelope;
      } else {
        delayLine[i] = 0;
      }
    }
    
    // Output buffer
    const outputBuffer = ctx.createBuffer(1, numSamples, sampleRate);
    const output = outputBuffer.getChannelData(0);
    
    // Damping factor (controls decay rate)
    const dampingFactor = 0.5 + (1 - this.options.damping) * 0.499;
    
    // Brightness controls low-pass filtering in feedback
    const brightnessCoeff = this.options.brightness;
    
    // Previous sample for simple one-pole lowpass in feedback
    let prevSample = 0;
    
    // Current position in delay line
    let delayIndex = 0;
    
    // Karplus-Strong algorithm
    for (let i = 0; i < numSamples; i++) {
      // Read from delay line
      const currentSample = delayLine[delayIndex];
      output[i] = currentSample;
      
      // Get next sample in delay line (with wrap-around)
      const nextIndex = (delayIndex + 1) % period;
      const nextSample = delayLine[nextIndex];
      
      // Simple averaging filter with damping
      let newSample = dampingFactor * (currentSample + nextSample) / 2;
      
      // Additional brightness control (one-pole lowpass)
      newSample = brightnessCoeff * newSample + (1 - brightnessCoeff) * prevSample;
      prevSample = newSample;
      
      // Write back to delay line
      delayLine[delayIndex] = newSample;
      
      // Advance delay line position
      delayIndex = nextIndex;
    }
    
    return outputBuffer;
  }
  
  // Play a plucked string note
  playNote(frequency: number, startTime?: number, duration: number = 2): void {
    const ctx = getAudioContext();
    const time = startTime ?? ctx.currentTime;
    
    // Generate the Karplus-Strong buffer
    const buffer = this.generateKarplusStrong(frequency, duration);
    
    // Create source node
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputNode);
    source.start(time);
    
    // Store for potential cleanup
    const voiceId = frequency * 1000 + Math.random();
    this.activeVoices.set(voiceId, source);
    
    // Auto-cleanup
    source.onended = () => {
      this.activeVoices.delete(voiceId);
    };
  }
  
  // Start a sustained note (for real-time playing)
  // Note: Physical modeling naturally decays, so this creates a new pluck
  startNote(frequency: number): number {
    const ctx = getAudioContext();
    const buffer = this.generateKarplusStrong(frequency, 4); // Longer duration for manual control
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputNode);
    source.start(ctx.currentTime);
    
    const voiceId = Math.random() * 100000;
    this.activeVoices.set(voiceId, source);
    
    source.onended = () => {
      this.activeVoices.delete(voiceId);
    };
    
    return voiceId;
  }
  
  releaseNote(voiceId: number): void {
    const source = this.activeVoices.get(voiceId);
    if (source) {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
      this.activeVoices.delete(voiceId);
    }
  }
  
  // Update parameters
  setDamping(damping: number): void {
    this.options.damping = Math.max(0, Math.min(1, damping));
  }
  
  setBrightness(brightness: number): void {
    this.options.brightness = Math.max(0, Math.min(1, brightness));
  }
  
  setPluckPosition(position: number): void {
    this.options.pluckPosition = Math.max(0.1, Math.min(0.9, position));
  }
  
  getOptions(): PhysicalModelOptions {
    return { ...this.options };
  }
  
  stopAll(): void {
    this.activeVoices.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
    });
    this.activeVoices.clear();
  }
}

// Additional physical model: Simple membrane/drum synthesis
export class DrumSynth {
  private outputNode: GainNode;
  
  constructor() {
    const ctx = getAudioContext();
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.7;
    this.outputNode.connect(getMasterGain());
  }
  
  connect(destination: AudioNode): void {
    this.outputNode.disconnect();
    this.outputNode.connect(destination);
  }
  
  // Kick drum - sine wave with pitch envelope
  playKick(startTime?: number): void {
    const ctx = getAudioContext();
    const time = startTime ?? ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
    
    osc.connect(gain);
    gain.connect(this.outputNode);
    
    osc.start(time);
    osc.stop(time + 0.5);
  }
  
  // Snare - noise burst + tone
  playSnare(startTime?: number): void {
    const ctx = getAudioContext();
    const time = startTime ?? ctx.currentTime;
    
    // Noise component
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.outputNode);
    
    // Tone component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    
    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(this.outputNode);
    
    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.2);
  }
  
  // Hi-hat - filtered noise
  playHiHat(open: boolean = false, startTime?: number): void {
    const ctx = getAudioContext();
    const time = startTime ?? ctx.currentTime;
    const duration = open ? 0.3 : 0.08;
    
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.outputNode);
    
    noise.start(time);
  }
}

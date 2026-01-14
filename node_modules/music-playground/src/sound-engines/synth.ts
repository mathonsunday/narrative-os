// Subtractive synthesizer engine
// Oscillators + Filter + ADSR Envelope

import { getAudioContext, getMasterGain } from '../shared/audio-context';

export interface ADSREnvelope {
  attack: number;  // seconds
  decay: number;   // seconds
  sustain: number; // 0-1 level
  release: number; // seconds
}

export interface SynthVoice {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
  isPlaying: boolean;
}

export interface SynthOptions {
  waveform: OscillatorType;
  filterCutoff: number;
  filterResonance: number;
  envelope: ADSREnvelope;
  detune: number; // cents for oscillator detuning
  numOscillators: number;
}

const defaultOptions: SynthOptions = {
  waveform: 'sawtooth',
  filterCutoff: 2000,
  filterResonance: 2,
  envelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.5,
    release: 0.3,
  },
  detune: 10,
  numOscillators: 2,
};

export class Synth {
  private options: SynthOptions;
  private activeVoices: Map<number, SynthVoice> = new Map();
  private outputNode: GainNode;
  
  constructor(options: Partial<SynthOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
    
    const ctx = getAudioContext();
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 0.5;
    this.outputNode.connect(getMasterGain());
  }
  
  // Connect to a different output (for effects chain)
  connect(destination: AudioNode): void {
    this.outputNode.disconnect();
    this.outputNode.connect(destination);
  }
  
  // Play a note at a specific frequency
  playNote(frequency: number, startTime?: number, duration?: number): void {
    const ctx = getAudioContext();
    const time = startTime ?? ctx.currentTime;
    const { envelope, waveform, filterCutoff, filterResonance, detune, numOscillators } = this.options;
    
    // Create oscillators
    const oscillators: OscillatorNode[] = [];
    for (let i = 0; i < numOscillators; i++) {
      const osc = ctx.createOscillator();
      osc.type = waveform;
      osc.frequency.setValueAtTime(frequency, time);
      
      // Detune each oscillator slightly for thickness
      if (i > 0) {
        const detuneAmount = (i % 2 === 0 ? 1 : -1) * detune * Math.ceil(i / 2);
        osc.detune.setValueAtTime(detuneAmount, time);
      }
      
      oscillators.push(osc);
    }
    
    // Create filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoff, time);
    filter.Q.setValueAtTime(filterResonance, time);
    
    // Create gain for envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, time);
    
    // Connect: oscillators -> filter -> gain -> output
    oscillators.forEach(osc => osc.connect(filter));
    filter.connect(gainNode);
    gainNode.connect(this.outputNode);
    
    // Apply ADSR envelope
    const attackEnd = time + envelope.attack;
    const decayEnd = attackEnd + envelope.decay;
    
    gainNode.gain.linearRampToValueAtTime(1, attackEnd);
    gainNode.gain.linearRampToValueAtTime(envelope.sustain, decayEnd);
    
    // Start oscillators
    oscillators.forEach(osc => osc.start(time));
    
    // If duration specified, schedule release
    if (duration) {
      const releaseStart = time + duration;
      const releaseEnd = releaseStart + envelope.release;
      
      gainNode.gain.setValueAtTime(envelope.sustain, releaseStart);
      gainNode.gain.linearRampToValueAtTime(0, releaseEnd);
      
      oscillators.forEach(osc => osc.stop(releaseEnd));
    }
    
    // Store voice for potential early release
    const voiceId = frequency * 1000 + time;
    this.activeVoices.set(voiceId, {
      oscillators,
      gainNode,
      filterNode: filter,
      isPlaying: true,
    });
    
    // Cleanup after release
    const cleanupTime = duration 
      ? (time + duration + envelope.release + 0.1) * 1000
      : undefined;
    
    if (cleanupTime) {
      setTimeout(() => {
        this.activeVoices.delete(voiceId);
      }, cleanupTime - Date.now());
    }
  }
  
  // Play a note with manual release (for real-time playing)
  startNote(frequency: number): number {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    const { envelope, waveform, filterCutoff, filterResonance, detune, numOscillators } = this.options;
    
    const oscillators: OscillatorNode[] = [];
    for (let i = 0; i < numOscillators; i++) {
      const osc = ctx.createOscillator();
      osc.type = waveform;
      osc.frequency.setValueAtTime(frequency, time);
      
      if (i > 0) {
        const detuneAmount = (i % 2 === 0 ? 1 : -1) * detune * Math.ceil(i / 2);
        osc.detune.setValueAtTime(detuneAmount, time);
      }
      
      oscillators.push(osc);
    }
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterCutoff, time);
    filter.Q.setValueAtTime(filterResonance, time);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, time);
    
    oscillators.forEach(osc => osc.connect(filter));
    filter.connect(gainNode);
    gainNode.connect(this.outputNode);
    
    // Attack and decay
    const attackEnd = time + envelope.attack;
    const decayEnd = attackEnd + envelope.decay;
    
    gainNode.gain.linearRampToValueAtTime(1, attackEnd);
    gainNode.gain.linearRampToValueAtTime(envelope.sustain, decayEnd);
    
    oscillators.forEach(osc => osc.start(time));
    
    const voiceId = Math.random() * 100000;
    this.activeVoices.set(voiceId, {
      oscillators,
      gainNode,
      filterNode: filter,
      isPlaying: true,
    });
    
    return voiceId;
  }
  
  // Release a note that was started with startNote
  releaseNote(voiceId: number): void {
    const voice = this.activeVoices.get(voiceId);
    if (!voice || !voice.isPlaying) return;
    
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    const { envelope } = this.options;
    
    voice.isPlaying = false;
    
    // Release envelope
    voice.gainNode.gain.cancelScheduledValues(time);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, time);
    voice.gainNode.gain.linearRampToValueAtTime(0, time + envelope.release);
    
    // Stop oscillators after release
    voice.oscillators.forEach(osc => osc.stop(time + envelope.release));
    
    // Cleanup
    setTimeout(() => {
      this.activeVoices.delete(voiceId);
    }, (envelope.release + 0.1) * 1000);
  }
  
  // Update filter cutoff in real-time
  setFilterCutoff(cutoff: number): void {
    this.options.filterCutoff = cutoff;
    const ctx = getAudioContext();
    
    this.activeVoices.forEach(voice => {
      voice.filterNode.frequency.setValueAtTime(cutoff, ctx.currentTime);
    });
  }
  
  // Update filter resonance in real-time
  setFilterResonance(resonance: number): void {
    this.options.filterResonance = resonance;
    const ctx = getAudioContext();
    
    this.activeVoices.forEach(voice => {
      voice.filterNode.Q.setValueAtTime(resonance, ctx.currentTime);
    });
  }
  
  // Change waveform
  setWaveform(waveform: OscillatorType): void {
    this.options.waveform = waveform;
  }
  
  // Update envelope
  setEnvelope(envelope: Partial<ADSREnvelope>): void {
    this.options.envelope = { ...this.options.envelope, ...envelope };
  }
  
  // Get current options
  getOptions(): SynthOptions {
    return { ...this.options };
  }
  
  // Stop all playing notes
  stopAll(): void {
    this.activeVoices.forEach((_, id) => {
      this.releaseNote(id);
    });
  }
}

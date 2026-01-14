// Delay effect with feedback
import { getAudioContext, getMasterGain } from '../shared/audio-context';

export interface DelayOptions {
  time: number;      // seconds, delay time
  feedback: number;  // 0-1, how much signal feeds back
  wet: number;       // 0-1, mix of wet/dry signal
}

const defaultOptions: DelayOptions = {
  time: 0.3,
  feedback: 0.4,
  wet: 0.3,
};

export class Delay {
  private options: DelayOptions;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private delayNode: DelayNode;
  private feedbackNode: GainNode;
  private filterNode: BiquadFilterNode;
  
  constructor(options: Partial<DelayOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
    
    const ctx = getAudioContext();
    
    // Create nodes
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.delayNode = ctx.createDelay(5); // Max 5 seconds delay
    this.feedbackNode = ctx.createGain();
    this.filterNode = ctx.createBiquadFilter();
    
    // Set initial values
    this.wetGain.gain.value = this.options.wet;
    this.dryGain.gain.value = 1 - this.options.wet;
    this.delayNode.delayTime.value = this.options.time;
    this.feedbackNode.gain.value = this.options.feedback;
    
    // Filter in feedback loop (prevents harsh buildup)
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 4000;
    
    // Connect: input -> dry -> output
    //          input -> delay -> filter -> wet -> output
    //                      ^                |
    //                      +-- feedback <---+
    
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);
    
    this.inputNode.connect(this.delayNode);
    this.delayNode.connect(this.filterNode);
    this.filterNode.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);
    
    // Feedback loop
    this.filterNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);
    
    // Connect to master by default
    this.outputNode.connect(getMasterGain());
  }
  
  getInput(): GainNode {
    return this.inputNode;
  }
  
  getOutput(): GainNode {
    return this.outputNode;
  }
  
  connect(destination: AudioNode): void {
    this.outputNode.disconnect();
    this.outputNode.connect(destination);
  }
  
  setTime(time: number): void {
    this.options.time = Math.max(0.01, Math.min(5, time));
    const ctx = getAudioContext();
    this.delayNode.delayTime.setValueAtTime(this.options.time, ctx.currentTime);
  }
  
  setFeedback(feedback: number): void {
    this.options.feedback = Math.max(0, Math.min(0.95, feedback)); // Cap at 0.95 to prevent runaway
    const ctx = getAudioContext();
    this.feedbackNode.gain.setValueAtTime(this.options.feedback, ctx.currentTime);
  }
  
  setWet(wet: number): void {
    this.options.wet = Math.max(0, Math.min(1, wet));
    const ctx = getAudioContext();
    
    this.wetGain.gain.setValueAtTime(this.options.wet, ctx.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.options.wet, ctx.currentTime);
  }
  
  // Sync delay time to tempo (quarter note, eighth note, etc.)
  syncToTempo(bpm: number, subdivision: number = 1): void {
    // subdivision: 1 = quarter, 2 = eighth, 4 = sixteenth
    const quarterNoteTime = 60 / bpm;
    const delayTime = quarterNoteTime / subdivision;
    this.setTime(delayTime);
  }
  
  getOptions(): DelayOptions {
    return { ...this.options };
  }
}

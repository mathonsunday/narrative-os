// Combined effects chain for routing audio through multiple effects
import { getAudioContext, getMasterGain } from '../shared/audio-context';
import { Reverb } from './reverb';
import type { ReverbOptions } from './reverb';
import { Delay } from './delay';
import type { DelayOptions } from './delay';

export interface EffectsChainOptions {
  reverb?: Partial<ReverbOptions>;
  delay?: Partial<DelayOptions>;
  reverbEnabled?: boolean;
  delayEnabled?: boolean;
}

const defaultOptions: EffectsChainOptions = {
  reverbEnabled: true,
  delayEnabled: true,
};

export class EffectsChain {
  private options: EffectsChainOptions;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private reverb: Reverb;
  private delay: Delay;
  private reverbBypass: GainNode;
  private delayBypass: GainNode;
  
  constructor(options: EffectsChainOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    
    const ctx = getAudioContext();
    
    // Create input/output
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    
    // Create effects
    this.reverb = new Reverb(options.reverb);
    this.delay = new Delay(options.delay);
    
    // Create bypass nodes
    this.reverbBypass = ctx.createGain();
    this.delayBypass = ctx.createGain();
    
    // Set up routing
    this.setupRouting();
    
    // Connect output to master
    this.outputNode.connect(getMasterGain());
  }
  
  private setupRouting(): void {
    const ctx = getAudioContext();
    
    // Disconnect existing connections
    this.inputNode.disconnect();
    this.reverb.getOutput().disconnect();
    this.delay.getOutput().disconnect();
    
    // Signal flow: input -> delay -> reverb -> output
    // With bypass options for each
    
    if (this.options.delayEnabled) {
      this.inputNode.connect(this.delay.getInput());
      this.delayBypass.gain.setValueAtTime(0, ctx.currentTime);
    } else {
      this.inputNode.connect(this.delayBypass);
      this.delayBypass.gain.setValueAtTime(1, ctx.currentTime);
    }
    
    // Connect delay output or bypass to reverb input
    const delayOutput = this.options.delayEnabled 
      ? this.delay.getOutput() 
      : this.delayBypass;
    
    if (this.options.reverbEnabled) {
      delayOutput.connect(this.reverb.getInput());
      this.reverbBypass.gain.setValueAtTime(0, ctx.currentTime);
      this.reverb.connect(this.outputNode);
    } else {
      delayOutput.connect(this.reverbBypass);
      this.reverbBypass.gain.setValueAtTime(1, ctx.currentTime);
      this.reverbBypass.connect(this.outputNode);
    }
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
  
  // Enable/disable reverb
  setReverbEnabled(enabled: boolean): void {
    this.options.reverbEnabled = enabled;
    this.setupRouting();
  }
  
  // Enable/disable delay
  setDelayEnabled(enabled: boolean): void {
    this.options.delayEnabled = enabled;
    this.setupRouting();
  }
  
  // Get reverb for parameter adjustment
  getReverb(): Reverb {
    return this.reverb;
  }
  
  // Get delay for parameter adjustment
  getDelay(): Delay {
    return this.delay;
  }
  
  // Convenience methods for common adjustments
  setReverbWet(wet: number): void {
    this.reverb.setWet(wet);
  }
  
  setReverbDecay(decay: number): void {
    this.reverb.setDecay(decay);
  }
  
  setDelayTime(time: number): void {
    this.delay.setTime(time);
  }
  
  setDelayFeedback(feedback: number): void {
    this.delay.setFeedback(feedback);
  }
  
  setDelayWet(wet: number): void {
    this.delay.setWet(wet);
  }
}

// Reverb effect using convolution or algorithmic approach
import { getAudioContext, getMasterGain, getSampleRate } from '../shared/audio-context';

export interface ReverbOptions {
  decay: number;     // seconds, how long the reverb tail lasts
  wet: number;       // 0-1, mix of wet/dry signal
  preDelay: number;  // seconds, delay before reverb starts
}

const defaultOptions: ReverbOptions = {
  decay: 1.5,
  wet: 0.3,
  preDelay: 0.01,
};

export class Reverb {
  private options: ReverbOptions;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private convolver: ConvolverNode;
  private preDelayNode: DelayNode;
  
  constructor(options: Partial<ReverbOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
    
    const ctx = getAudioContext();
    
    // Create nodes
    this.inputNode = ctx.createGain();
    this.outputNode = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.convolver = ctx.createConvolver();
    this.preDelayNode = ctx.createDelay(1);
    
    // Set initial values
    this.wetGain.gain.value = this.options.wet;
    this.dryGain.gain.value = 1 - this.options.wet;
    this.preDelayNode.delayTime.value = this.options.preDelay;
    
    // Generate impulse response
    this.generateImpulseResponse();
    
    // Connect: input -> dry -> output
    //          input -> preDelay -> convolver -> wet -> output
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);
    
    this.inputNode.connect(this.preDelayNode);
    this.preDelayNode.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);
    
    // Connect to master by default
    this.outputNode.connect(getMasterGain());
  }
  
  // Generate algorithmic impulse response
  private generateImpulseResponse(): void {
    const ctx = getAudioContext();
    const sampleRate = getSampleRate();
    const length = Math.ceil(sampleRate * this.options.decay);
    
    // Stereo impulse response
    const impulseBuffer = ctx.createBuffer(2, length, sampleRate);
    const leftChannel = impulseBuffer.getChannelData(0);
    const rightChannel = impulseBuffer.getChannelData(1);
    
    // Generate exponentially decaying noise
    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-3 * i / length);
      // Add some randomness for a more natural sound
      const diffusion = Math.random() * 0.2 + 0.9;
      
      leftChannel[i] = (Math.random() * 2 - 1) * decay * diffusion;
      rightChannel[i] = (Math.random() * 2 - 1) * decay * diffusion;
    }
    
    this.convolver.buffer = impulseBuffer;
  }
  
  // Get input node for connecting sources
  getInput(): GainNode {
    return this.inputNode;
  }
  
  // Get output node for chaining effects
  getOutput(): GainNode {
    return this.outputNode;
  }
  
  // Connect output to a destination
  connect(destination: AudioNode): void {
    this.outputNode.disconnect();
    this.outputNode.connect(destination);
  }
  
  // Set wet/dry mix
  setWet(wet: number): void {
    this.options.wet = Math.max(0, Math.min(1, wet));
    const ctx = getAudioContext();
    
    this.wetGain.gain.setValueAtTime(this.options.wet, ctx.currentTime);
    this.dryGain.gain.setValueAtTime(1 - this.options.wet, ctx.currentTime);
  }
  
  // Set decay time (regenerates impulse response)
  setDecay(decay: number): void {
    this.options.decay = Math.max(0.1, Math.min(10, decay));
    this.generateImpulseResponse();
  }
  
  // Set pre-delay
  setPreDelay(preDelay: number): void {
    this.options.preDelay = Math.max(0, Math.min(0.5, preDelay));
    const ctx = getAudioContext();
    this.preDelayNode.delayTime.setValueAtTime(this.options.preDelay, ctx.currentTime);
  }
  
  getOptions(): ReverbOptions {
    return { ...this.options };
  }
}

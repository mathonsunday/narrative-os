// Tempo-synced scheduler for sequenced playback
import { getAudioContext, getCurrentTime } from './audio-context';

export interface SchedulerOptions {
  tempo: number; // BPM
  stepsPerBeat: number; // Usually 4 for 16th notes
  totalSteps: number; // Total steps in pattern (e.g., 16)
  onStep: (step: number, time: number) => void;
}

export class Scheduler {
  private tempo: number;
  private stepsPerBeat: number;
  private totalSteps: number;
  private onStep: (step: number, time: number) => void;
  
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private nextStepTime: number = 0;
  private schedulerInterval: number | null = null;
  
  // How far ahead to schedule (seconds)
  private readonly lookahead = 0.1;
  // How often to check for scheduling (ms)
  private readonly scheduleInterval = 25;
  
  constructor(options: SchedulerOptions) {
    this.tempo = options.tempo;
    this.stepsPerBeat = options.stepsPerBeat;
    this.totalSteps = options.totalSteps;
    this.onStep = options.onStep;
  }
  
  private get stepDuration(): number {
    // Duration of one step in seconds
    return 60.0 / this.tempo / this.stepsPerBeat;
  }
  
  start(): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextStepTime = getCurrentTime();
    
    this.schedulerInterval = window.setInterval(() => {
      this.schedule();
    }, this.scheduleInterval);
  }
  
  stop(): void {
    this.isPlaying = false;
    if (this.schedulerInterval !== null) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.currentStep = 0;
  }
  
  pause(): void {
    this.isPlaying = false;
    if (this.schedulerInterval !== null) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }
  
  private schedule(): void {
    const ctx = getAudioContext();
    
    // Schedule all steps that fall within the lookahead window
    while (this.nextStepTime < ctx.currentTime + this.lookahead) {
      this.onStep(this.currentStep, this.nextStepTime);
      
      // Advance to next step
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
      this.nextStepTime += this.stepDuration;
    }
  }
  
  setTempo(tempo: number): void {
    this.tempo = tempo;
  }
  
  getTempo(): number {
    return this.tempo;
  }
  
  getCurrentStep(): number {
    return this.currentStep;
  }
  
  isRunning(): boolean {
    return this.isPlaying;
  }
}

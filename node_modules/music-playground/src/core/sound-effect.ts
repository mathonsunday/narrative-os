/**
 * CORE SOUND EFFECT CLASS (Theme-Agnostic)
 * 
 * Generic sound effect engine for managing one-shot sounds.
 * Theme-specific sounds are in themes/[theme]/sound-effects.ts
 */

import { getMasterGain, resumeAudioContext } from '../shared/audio-context';

export type SoundEffectHandler = (sfx: SoundEffect) => void;

/**
 * Core SoundEffect class - manages one-shot sounds generically
 */
export class SoundEffect {
  protected masterGain: GainNode;
  protected volume: number = 0.5;
  private soundHandlers: Map<string, SoundEffectHandler> = new Map();
  
  constructor(volume: number = 0.5) {
    this.masterGain = getMasterGain();
    this.volume = volume;
  }
  
  /**
   * Register a sound effect handler
   */
  registerSound(name: string, handler: SoundEffectHandler): void {
    this.soundHandlers.set(name, handler);
  }
  
  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Play a sound effect by name
   */
  async play(type: string): Promise<void> {
    await resumeAudioContext();
    
    const handler = this.soundHandlers.get(type);
    if (handler) {
      handler(this);
    } else {
      console.warn(`Sound effect "${type}" not found. Register it with registerSound().`);
    }
  }
  
  /**
   * Get master gain node (for preset handlers)
   */
  getMasterGain(): GainNode {
    return this.masterGain;
  }
  
  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

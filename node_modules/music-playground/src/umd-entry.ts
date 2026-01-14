/**
 * UMD/IIFE Entry Point
 * 
 * This file exposes all exports on a global object for vanilla JS usage.
 * It's used as the entry point for all builds (ESM, UMD, IIFE).
 */

// Re-export everything from main index
export * from './index.js';

// Import specific items for global exposure
import {
  CoreAmbience,
  CoreSoundEffect,
  Ambience,
  SoundEffect,
  Synth,
  PhysicalModel,
  DrumSynth,
  Sampler,
  INSTRUMENTS,
  EffectsChain,
  Reverb,
  Delay,
  registerTheme,
  getTheme,
  getThemeNames,
  themes,
  DeepSeaAmbience,
  DeepSeaSoundEffect,
  LivingOsAmbience,
  LivingOsSoundEffect,
} from './index.js';

// Expose on global object for browser (UMD/IIFE builds)
if (typeof window !== 'undefined') {
  (window as any).MusicPlayground = {
    // Core API
    CoreAmbience,
    CoreSoundEffect,
    Ambience, // Backward compat (DeepSeaAmbience)
    SoundEffect, // Backward compat (DeepSeaSoundEffect)
    
    // Sound engines
    Synth,
    PhysicalModel,
    DrumSynth,
    Sampler,
    INSTRUMENTS,
    
    // Effects
    EffectsChain,
    Reverb,
    Delay,
    
    // Theme system
    registerTheme,
    getTheme,
    getThemeNames,
    themes,
    
    // Theme classes (direct access)
    DeepSeaAmbience,
    DeepSeaSoundEffect,
    LivingOsAmbience,
    LivingOsSoundEffect,
  };
}

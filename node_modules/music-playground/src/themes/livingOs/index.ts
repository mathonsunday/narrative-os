/**
 * LIVING OS THEME
 * 
 * Plant biology research OS theme with growth-level progression.
 * Starts pleasant and professional, gradually becomes unsettling as organic growth spreads.
 */

import { registerTheme } from '../index.js';
import { LivingOsAmbience, type LivingOsPreset, type LivingOsAmbienceOptions } from './ambience.js';
import { LivingOsSoundEffect, type LivingOsSoundEffectType, type LivingOsSoundEffectOptions } from './sound-effects.js';

// Register the living OS theme
registerTheme('livingOs', {
  Ambience: LivingOsAmbience,
  SoundEffect: LivingOsSoundEffect,
});

// Export everything for direct access
export {
  LivingOsAmbience,
  LivingOsSoundEffect,
  type LivingOsPreset,
  type LivingOsAmbienceOptions,
  type LivingOsSoundEffectType,
  type LivingOsSoundEffectOptions,
};

/**
 * DEEP SEA THEME
 * 
 * Complete deep-sea marine biology theme with ambience and sound effects.
 */

import { registerTheme } from '../index.js';
import { DeepSeaAmbience, type DeepSeaPreset } from './ambience.js';
import { DeepSeaSoundEffect, type DeepSeaSoundEffectType } from './sound-effects.js';

// Register the deep-sea theme
registerTheme('deepSea', {
  Ambience: DeepSeaAmbience,
  SoundEffect: DeepSeaSoundEffect,
});

// Export everything for direct access
export {
  DeepSeaAmbience,
  DeepSeaSoundEffect,
  type DeepSeaPreset,
  type DeepSeaSoundEffectType,
};

// Re-export as Ambience/SoundEffect for convenience
export { DeepSeaAmbience as Ambience, DeepSeaSoundEffect as SoundEffect };

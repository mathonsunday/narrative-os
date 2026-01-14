/**
 * AMBIENT AUDIO ENGINE
 * 
 * A library for generating atmospheric soundscapes programmatically.
 * Designed to be used by AI agents to add ambient audio to web projects.
 * 
 * Architecture: Core API (theme-agnostic) + Themes (presets)
 * 
 * QUICK START:
 * ```typescript
 * // New API (recommended)
 * import { themes } from 'music-playground';
 * const ambience = new themes.deepSea.Ambience();
 * await ambience.play('deepSea', { intensity: 0.7, depth: 3000 });
 * 
 * // Old API (backward compatible)
 * import { Ambience } from 'music-playground';
 * const ambience = new Ambience();
 * await ambience.play('deepSea', { intensity: 0.7, depth: 3000 });
 * ```
 */

// ============================================
// CORE API (Theme-Agnostic)
// ============================================

export { Ambience as CoreAmbience, type AmbienceOptions, type ActiveLayer, type PresetHandler } from './core/ambience.js';
export { SoundEffect as CoreSoundEffect, type SoundEffectHandler } from './core/sound-effect.js';

// Sound engines (generic)
export { Synth } from './sound-engines/synth.js';
export { PhysicalModel, DrumSynth } from './sound-engines/physical.js';
export { Sampler, INSTRUMENTS } from './sound-engines/sampler.js';

// Effects (generic)
export { EffectsChain } from './effects/effects-chain.js';
export { Reverb } from './effects/reverb.js';
export { Delay } from './effects/delay.js';

// ============================================
// THEME SYSTEM
// ============================================

export {
  registerTheme,
  getTheme,
  getThemeNames,
  themes,
  type Theme,
} from './themes/index.js';

// Import themes to auto-register them
import './themes/deepSea/index.js';
import './themes/livingOs/index.js';

// ============================================
// BACKWARD COMPATIBILITY
// ============================================
// Re-export deep-sea theme classes as default for backward compatibility
// Note: These shadow the core exports above, which is intentional for backward compat

export {
  DeepSeaAmbience,
  DeepSeaSoundEffect,
  type DeepSeaPreset,
  type DeepSeaSoundEffectType,
} from './themes/deepSea/index.js';

// Export with old names for backward compatibility
export { DeepSeaAmbience as Ambience, DeepSeaSoundEffect as SoundEffect } from './themes/deepSea/index.js';
export type { DeepSeaPreset as AmbiencePreset, DeepSeaSoundEffectType as SoundEffectType } from './themes/deepSea/index.js';

// Export Living OS theme classes
export {
  LivingOsAmbience,
  LivingOsSoundEffect,
  type LivingOsPreset,
  type LivingOsAmbienceOptions,
  type LivingOsSoundEffectType,
  type LivingOsSoundEffectOptions,
} from './themes/livingOs/index.js';

/**
 * THEME REGISTRATION SYSTEM
 * 
 * Allows registering custom themes and accessing built-in themes.
 */

export interface Theme {
  ambience?: any;
  soundEffects?: any;
  [key: string]: any; // Allow any theme-specific properties
}

const registeredThemes: Record<string, Theme> = {};

/**
 * Register a custom theme
 * 
 * @example
 * registerTheme('jungle', {
 *   ambience: {
 *     play: (preset, options) => { // implementation
 *     },
 *   },
 *   soundEffects: {
 *     play: (sound) => { // implementation
 *     },
 *   },
 * });
 */
export function registerTheme(name: string, theme: Theme): void {
  if (registeredThemes[name]) {
    console.warn(`Theme "${name}" is already registered. Overwriting.`);
  }
  registeredThemes[name] = theme;
}

/**
 * Get a registered theme
 */
export function getTheme(name: string): Theme | undefined {
  return registeredThemes[name];
}

/**
 * Get all registered theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(registeredThemes);
}

/**
 * Themes object - access registered themes
 * 
 * @example
 * import { themes } from 'music-playground';
 * const ambience = new themes.deepSea.Ambience();
 * ambience.play('deepSea', { intensity: 0.5 });
 */
export const themes: Record<string, Theme> = new Proxy({} as Record<string, Theme>, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    return registeredThemes[prop];
  },
  ownKeys() {
    return Object.keys(registeredThemes);
  },
  has(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return false;
    return prop in registeredThemes;
  },
});

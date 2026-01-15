import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CORE_PATH = join(process.cwd(), 'frontend/core/os-core.js');
const OS_PATH = join(process.cwd(), 'frontend/os.js');
const THEME_CONFIG_PATH = join(process.cwd(), 'frontend/themes/deep-sea/config.js');

const coreExists = existsSync(CORE_PATH);
const themeConfigExists = existsSync(THEME_CONFIG_PATH);

/**
 * Integration tests for theme loading.
 *
 * Tests that the Deep Sea theme configuration loads correctly
 * and integrates with the core infrastructure.
 */

describe('Theme Loading Integration', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="desktop">
        <div class="greeting">
          <div id="greeting-text">Loading...</div>
          <div id="greeting-sub" class="greeting-sub">Please wait</div>
        </div>
        <div id="files-container"></div>
        <div id="windows-container"></div>
        <div id="toast-container" style="position: absolute; top: 30px; left: 50%; transform: translateX(-50%);"></div>
        <div id="journal-window" class="window">
          <div class="window-header">
            <div class="window-title">Journal</div>
          </div>
          <div id="journal-entries"></div>
        </div>
        <div class="taskbar">
          <div class="clock">
            <div id="clock-time">00:00</div>
            <div id="clock-date">Monday</div>
          </div>
        </div>
      </div>
    `;

    global.WebSocket = class MockWebSocket {
      constructor() { this.readyState = 0; }
      send() {}
      close() {}
    };
    global.WebSocket.OPEN = 1;
    global.WebSocket.CLOSED = 3;

    window.AudioEngine = {
      Ambience: class {
        play() {}
        addLayer() {}
        setVolume() {}
        stop() {}
      },
      SoundEffect: class {
        constructor() {}
        play() {}
        setVolume() {}
      }
    };

    window.VisualToolkit = {
      scenes: {
        deepSea: {
          wall: () => ({ cleanup: () => {} }),
          seekers: () => ({ cleanup: () => {} }),
          leviathan: () => ({ cleanup: () => {} }),
        }
      }
    };
  });

  afterEach(() => {
    delete window.OSCore;
    delete window.DeepSeaTheme;
    delete window.NarrativeOS;
    delete window.closeWindow;
    delete window.AudioEngine;
    delete window.VisualToolkit;
    document.body.innerHTML = '';
  });

  describe.skipIf(!themeConfigExists)('Deep Sea Theme Config', () => {

    it('should load theme config and expose DeepSeaTheme', () => {
      // Load core first
      if (coreExists) {
        const coreScript = readFileSync(CORE_PATH, 'utf-8');
        new Function(coreScript)();
      }

      // Load theme config
      const themeScript = readFileSync(THEME_CONFIG_PATH, 'utf-8');
      new Function(themeScript)();

      expect(window.DeepSeaTheme).toBeDefined();
    });

    it('should have character data in theme config', () => {
      if (coreExists) {
        const coreScript = readFileSync(CORE_PATH, 'utf-8');
        new Function(coreScript)();
      }

      const themeScript = readFileSync(THEME_CONFIG_PATH, 'utf-8');
      new Function(themeScript)();

      expect(window.DeepSeaTheme.CHARACTER_NAMES).toBeDefined();
      expect(Array.isArray(window.DeepSeaTheme.CHARACTER_NAMES)).toBe(true);
      expect(window.DeepSeaTheme.CHARACTER_NAMES).toContain('Dr. Petrovic');
    });

    it('should have greetings in theme config', () => {
      if (coreExists) {
        const coreScript = readFileSync(CORE_PATH, 'utf-8');
        new Function(coreScript)();
      }

      const themeScript = readFileSync(THEME_CONFIG_PATH, 'utf-8');
      new Function(themeScript)();

      expect(window.DeepSeaTheme.GREETINGS).toBeDefined();
      expect(Array.isArray(window.DeepSeaTheme.GREETINGS)).toBe(true);
      expect(window.DeepSeaTheme.GREETINGS.length).toBeGreaterThan(0);
      expect(window.DeepSeaTheme.GREETINGS[0]).toHaveProperty('text');
      expect(window.DeepSeaTheme.GREETINGS[0]).toHaveProperty('sub');
    });

    it('should have initial files in theme config', () => {
      if (coreExists) {
        const coreScript = readFileSync(CORE_PATH, 'utf-8');
        new Function(coreScript)();
      }

      const themeScript = readFileSync(THEME_CONFIG_PATH, 'utf-8');
      new Function(themeScript)();

      expect(window.DeepSeaTheme.INITIAL_FILES).toBeDefined();
      expect(Array.isArray(window.DeepSeaTheme.INITIAL_FILES)).toBe(true);

      // Should have the iconic dive footage
      const diveFile = window.DeepSeaTheme.INITIAL_FILES.find(f =>
        f.name.includes('Dive_4847')
      );
      expect(diveFile).toBeDefined();
    });

    it('should have IT messages in theme config', () => {
      if (coreExists) {
        const coreScript = readFileSync(CORE_PATH, 'utf-8');
        new Function(coreScript)();
      }

      const themeScript = readFileSync(THEME_CONFIG_PATH, 'utf-8');
      new Function(themeScript)();

      expect(window.DeepSeaTheme.IT_MESSAGES).toBeDefined();
      expect(window.DeepSeaTheme.IT_MESSAGES.security).toBeDefined();
      expect(window.DeepSeaTheme.IT_MESSAGES.compliance).toBeDefined();
    });

    it('should have audio config in theme', () => {
      if (coreExists) {
        const coreScript = readFileSync(CORE_PATH, 'utf-8');
        new Function(coreScript)();
      }

      const themeScript = readFileSync(THEME_CONFIG_PATH, 'utf-8');
      new Function(themeScript)();

      expect(window.DeepSeaTheme.AUDIO_CONFIG).toBeDefined();
      expect(window.DeepSeaTheme.AUDIO_CONFIG.ambience).toBeDefined();
    });
  });

  describe('Original os.js still works (backwards compatibility)', () => {

    it('should load os.js without theme config', () => {
      if (coreExists) {
        const coreScript = readFileSync(CORE_PATH, 'utf-8');
        new Function(coreScript)();
      }

      const osScript = readFileSync(OS_PATH, 'utf-8');

      expect(() => {
        new Function(osScript)();
      }).not.toThrow();

      expect(window.NarrativeOS).toBeDefined();
    });
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CORE_PATH = join(process.cwd(), 'frontend/core/os-core.js');
const OS_PATH = join(process.cwd(), 'frontend/os.js');
const coreExists = existsSync(CORE_PATH);

/**
 * Integration test for core-theme separation.
 *
 * This test simulates how the browser loads the scripts by:
 * 1. Setting up the DOM that os.js expects
 * 2. Loading os-core.js first (sets window.OSCore)
 * 3. Loading os.js second (uses window.OSCore)
 * 4. Verifying the integration works
 *
 * If this test fails, the browser will fail too.
 */

describe('Core-Theme Script Loading Integration', () => {

  beforeEach(() => {
    // Set up the DOM elements that os.js expects
    document.body.innerHTML = `
      <div class="desktop">
        <div class="greeting">
          <div id="greeting-text">Loading...</div>
          <div id="greeting-sub" class="greeting-sub">Please wait</div>
        </div>
        <div id="files-container"></div>
        <div id="windows-container"></div>
        <div id="toast-container"></div>
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

    // Mock WebSocket
    global.WebSocket = class MockWebSocket {
      constructor() {
        this.readyState = 0; // CONNECTING
      }
      send() {}
      close() {}
    };
    global.WebSocket.OPEN = 1;
    global.WebSocket.CLOSED = 3;

    // Mock AudioEngine
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

    // Mock VisualToolkit
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
    // Clean up
    delete window.OSCore;
    delete window.NarrativeOS;
    delete window.closeWindow;
    delete window.AudioEngine;
    delete window.VisualToolkit;
    document.body.innerHTML = '';
  });

  describe.skipIf(!coreExists)('When os-core.js exists', () => {

    it('should load os-core.js and expose window.OSCore', async () => {
      // Load os-core.js
      const coreScript = readFileSync(CORE_PATH, 'utf-8');

      // Execute it
      const coreFunc = new Function(coreScript);
      coreFunc();

      // Verify OSCore is exposed
      expect(window.OSCore).toBeDefined();
      expect(typeof window.OSCore.randomChoice).toBe('function');
      expect(typeof window.OSCore.randomInt).toBe('function');
      expect(typeof window.OSCore.generateId).toBe('function');
      expect(typeof window.OSCore.showToast).toBe('function');
      expect(typeof window.OSCore.addJournalEntry).toBe('function');
      expect(typeof window.OSCore.connectWebSocket).toBe('function');
      expect(typeof window.OSCore.makeDraggable).toBe('function');
      expect(typeof window.OSCore.makeResizable).toBe('function');
      expect(typeof window.OSCore.updateClock).toBe('function');
    });

    it('should load os.js after os-core.js without errors', async () => {
      // Load os-core.js first
      const coreScript = readFileSync(
        CORE_PATH,
        'utf-8'
      );
      const coreFunc = new Function(coreScript);
      coreFunc();

      // Then load os.js
      const osScript = readFileSync(
        OS_PATH,
        'utf-8'
      );

      // This should NOT throw an error
      expect(() => {
        const osFunc = new Function(osScript);
        osFunc();
      }).not.toThrow();
    });

    it('should expose NarrativeOS after both scripts load', async () => {
      // Load os-core.js first
      const coreScript = readFileSync(
        CORE_PATH,
        'utf-8'
      );
      const coreFunc = new Function(coreScript);
      coreFunc();

      // Then load os.js
      const osScript = readFileSync(
        OS_PATH,
        'utf-8'
      );
      const osFunc = new Function(osScript);
      osFunc();

      // Verify NarrativeOS is exposed with expected functions
      expect(window.NarrativeOS).toBeDefined();
      expect(typeof window.NarrativeOS.addFile).toBe('function');
      expect(typeof window.NarrativeOS.removeFile).toBe('function');
      expect(typeof window.NarrativeOS.showToast).toBe('function');
      expect(typeof window.NarrativeOS.runChaosEvent).toBe('function');
    });

    it('should have working utility functions from core', async () => {
      // Load os-core.js
      const coreScript = readFileSync(
        CORE_PATH,
        'utf-8'
      );
      const coreFunc = new Function(coreScript);
      coreFunc();

      // Test utilities
      const arr = [1, 2, 3];
      const choice = window.OSCore.randomChoice(arr);
      expect(arr).toContain(choice);

      const num = window.OSCore.randomInt(1, 10);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);

      const id = window.OSCore.generateId('test');
      expect(id).toMatch(/^test-\d+-[a-z0-9]+$/);
    });

    it('should update clock correctly from core', async () => {
      // Load os-core.js
      const coreScript = readFileSync(
        CORE_PATH,
        'utf-8'
      );
      const coreFunc = new Function(coreScript);
      coreFunc();

      // Call updateClock
      window.OSCore.updateClock();

      // Check that clock elements were updated
      const clockTime = document.getElementById('clock-time');
      const clockDate = document.getElementById('clock-date');

      expect(clockTime.textContent).toMatch(/^\d{2}:\d{2}$/);
      expect(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
        .toContain(clockDate.textContent);
    });

    it('should show toast notifications from core', async () => {
      // Load os-core.js
      const coreScript = readFileSync(
        CORE_PATH,
        'utf-8'
      );
      const coreFunc = new Function(coreScript);
      coreFunc();

      // Show a toast
      window.OSCore.showToast('Test message', 1000);

      // Check that toast was added
      const container = document.getElementById('toast-container');
      const toasts = container.querySelectorAll('.toast');
      expect(toasts.length).toBe(1);
      expect(toasts[0].textContent).toBe('Test message');
    });

    it('should add journal entries from core', async () => {
      // Load os-core.js
      const coreScript = readFileSync(
        CORE_PATH,
        'utf-8'
      );
      const coreFunc = new Function(coreScript);
      coreFunc();

      // Add a journal entry
      window.OSCore.addJournalEntry('Test journal entry');

      // Check that entry was added
      const container = document.getElementById('journal-entries');
      const entries = container.querySelectorAll('.journal-entry');
      expect(entries.length).toBe(1);
      expect(entries[0].textContent).toContain('Test journal entry');
    });
  });

  describe('When os-core.js does NOT exist (original behavior)', () => {

    it('should load standalone os.js without errors', async () => {
      // Load only os.js (the original, non-refactored version)
      const osScript = readFileSync(
        OS_PATH,
        'utf-8'
      );

      // This should NOT throw an error
      expect(() => {
        const osFunc = new Function(osScript);
        osFunc();
      }).not.toThrow();

      // NarrativeOS should still be exposed
      expect(window.NarrativeOS).toBeDefined();
    });
  });
});

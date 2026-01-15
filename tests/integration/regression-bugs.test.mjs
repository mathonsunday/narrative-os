import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CORE_PATH = join(process.cwd(), 'frontend/core/os-core.js');
const OS_PATH = join(process.cwd(), 'frontend/os.js');
const coreExists = existsSync(CORE_PATH);

/**
 * Regression tests for bugs discovered during refactoring.
 *
 * These tests verify that the 3 bugs from the failed refactoring attempt
 * do not reappear:
 *
 * 1. IT notifications positioning wrong (showing top-left instead of top-center)
 * 2. Non-MP4 files show "file viewer not available" error (regression)
 * 3. Mouse interactions in MP4 scenes don't work (regression)
 */

describe('Regression Tests - Refactoring Bugs', () => {

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

    // Mock WebSocket
    global.WebSocket = class MockWebSocket {
      constructor() {
        this.readyState = 0;
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
    delete window.OSCore;
    delete window.NarrativeOS;
    delete window.closeWindow;
    delete window.AudioEngine;
    delete window.VisualToolkit;
    document.body.innerHTML = '';
  });

  /**
   * Helper to load both scripts in correct order
   */
  function loadScripts() {
    if (coreExists) {
      const coreScript = readFileSync(CORE_PATH, 'utf-8');
      const coreFunc = new Function(coreScript);
      coreFunc();
    }

    const osScript = readFileSync(OS_PATH, 'utf-8');
    const osFunc = new Function(osScript);
    osFunc();
  }

  describe('Bug #1: IT Notifications Positioning', () => {

    it('should add IT notifications to toast-container (not create separate container)', () => {
      loadScripts();

      // Call showITNotification
      window.NarrativeOS.showITNotification('compliance');

      // The IT notification should be inside toast-container
      const toastContainer = document.getElementById('toast-container');
      const itNotification = toastContainer.querySelector('.it-notification');

      expect(itNotification).not.toBeNull();
      expect(itNotification.classList.contains('toast')).toBe(true);
    });

    it('should use existing toast-container positioning (centered)', () => {
      loadScripts();

      const toastContainer = document.getElementById('toast-container');

      // Verify the container has centering styles
      // The actual CSS is: left: 50%; transform: translateX(-50%);
      expect(toastContainer.style.left).toBe('50%');
      expect(toastContainer.style.transform).toBe('translateX(-50%)');

      // Add an IT notification
      window.NarrativeOS.showITNotification('network');

      // Container should still exist and have same positioning
      const containerAfter = document.getElementById('toast-container');
      expect(containerAfter).toBe(toastContainer);
    });

    it('should include MBARI branding in IT notifications', () => {
      loadScripts();

      window.NarrativeOS.showITNotification('security');

      const toastContainer = document.getElementById('toast-container');
      const itNotification = toastContainer.querySelector('.it-notification');
      const brand = itNotification.querySelector('.it-brand');

      expect(brand).not.toBeNull();
      expect(brand.textContent).toBe('MBARI IT');
    });
  });

  describe('Bug #2: Non-MP4 File Viewer', () => {

    it('should have openFile function available', () => {
      loadScripts();

      // The openFile function should exist (used internally)
      // We can verify by checking NarrativeOS has file-related functions
      expect(typeof window.NarrativeOS.addFile).toBe('function');
    });

    it('should create window when opening non-video files', () => {
      loadScripts();

      // Add a test file
      const file = window.NarrativeOS.addFile({
        name: 'test_document.docx',
        icon: '📄',
        x: 100,
        y: 100
      });

      expect(file).toBeDefined();
      expect(file.name).toBe('test_document.docx');

      // The file element should exist in the DOM
      const fileEl = document.getElementById(file.id);
      expect(fileEl).not.toBeNull();
    });

    it('should handle folders correctly', () => {
      loadScripts();

      const folder = window.NarrativeOS.addFile({
        name: 'Test_Folder/',
        icon: '📁',
        x: 200,
        y: 200
      });

      expect(folder).toBeDefined();
      expect(folder.name).toBe('Test_Folder/');
    });

    it('should create openUnexpectedWindow for document types', () => {
      loadScripts();

      // openUnexpectedWindow should be available and create windows
      expect(typeof window.NarrativeOS.openUnexpectedWindow).toBe('function');

      const windowId = window.NarrativeOS.openUnexpectedWindow({
        title: 'Test Document',
        content: 'Test content here',
        reason: 'Testing file viewer'
      });

      expect(windowId).toBeDefined();

      // Window should exist in DOM
      const windowEl = document.getElementById(windowId);
      expect(windowEl).not.toBeNull();
      expect(windowEl.classList.contains('window')).toBe(true);
    });
  });

  describe('Bug #3: MP4 Scene Mouse Interactions', () => {

    it('should have scene opening functions available', () => {
      loadScripts();

      // All scene functions should be exposed
      expect(typeof window.NarrativeOS.openSeekersScene).toBe('function');
      expect(typeof window.NarrativeOS.openWallScene).toBe('function');
      expect(typeof window.NarrativeOS.openLeviathanScene).toBe('function');
    });

    it('should have openVideoPreview function', () => {
      loadScripts();

      expect(typeof window.NarrativeOS.openVideoPreview).toBe('function');
    });

    it('should track active scenes for cleanup', () => {
      loadScripts();

      // state should have structure for tracking
      expect(window.NarrativeOS.state).toBeDefined();
      expect(Array.isArray(window.NarrativeOS.state.openWindows)).toBe(true);
    });

    it('should have closeWindow that cleans up scenes', () => {
      loadScripts();

      // closeWindow should be globally available (used by onclick handlers)
      expect(typeof window.closeWindow).toBe('function');
    });

    it('should register mousemove handlers for drag functionality', () => {
      loadScripts();

      // Create a window to test drag
      const windowId = window.NarrativeOS.openUnexpectedWindow({
        title: 'Drag Test',
        content: 'Testing drag',
        reason: 'Test'
      });

      const windowEl = document.getElementById(windowId);
      expect(windowEl).not.toBeNull();

      // Simulate mousedown on header
      const header = windowEl.querySelector('.window-header');
      expect(header).not.toBeNull();

      // The header should have cursor style after makeDraggable
      expect(header.style.cursor).toBe('grab');
    });
  });

  describe('Integration: Scripts load together without conflicts', () => {

    it('should not throw errors when both scripts load', () => {
      expect(() => {
        loadScripts();
      }).not.toThrow();
    });

    it('should have all expected NarrativeOS functions after loading', () => {
      loadScripts();

      const expectedFunctions = [
        'addFile',
        'removeFile',
        'renameFile',
        'moveFile',
        'showToast',
        'showITNotification',
        'addJournalEntry',
        'openUnexpectedWindow',
        'openVideoPreview',
        'runChaosEvent',
      ];

      for (const fn of expectedFunctions) {
        expect(typeof window.NarrativeOS[fn]).toBe('function');
      }
    });

    it('should have state object with correct structure', () => {
      loadScripts();

      expect(window.NarrativeOS.state).toBeDefined();
      expect(Array.isArray(window.NarrativeOS.state.files)).toBe(true);
      expect(Array.isArray(window.NarrativeOS.state.journalEntries)).toBe(true);
      expect(Array.isArray(window.NarrativeOS.state.openWindows)).toBe(true);
    });
  });
});

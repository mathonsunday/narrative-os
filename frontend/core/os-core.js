// ============================================
// NARRATIVE OS - CORE INFRASTRUCTURE
// Theme-agnostic functionality
// Wrapped in IIFE to avoid polluting global scope
// ============================================

(function() {
  'use strict';

  // ============================================
  // SCENE MANAGEMENT
  // ============================================

  const activeScenes = new Map();

  // ============================================
  // STATE
  // ============================================

  const state = {
    files: [],
    journalEntries: [],
    openWindows: [],
    toasts: [],
  };

  // ============================================
  // UTILITIES
  // ============================================

  function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // WEBSOCKET CONNECTION
  // ============================================

  const WS_URL = 'ws://localhost:8765';
  let ws = null;
  let wsConnected = false;
  let wsReconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  let backendEventHandler = null;

  function setBackendEventHandler(handler) {
    backendEventHandler = handler;
  }

  function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    console.log('[WS] Connecting to backend...');

    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[WS] Connected to Narrative OS backend');
        wsConnected = true;
        wsReconnectAttempts = 0;
        showToast("System connected. Real-time updates enabled.", 3000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (backendEventHandler) {
            backendEventHandler(data);
          }
        } catch (e) {
          console.error('[WS] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Connection closed');
        wsConnected = false;

        if (wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          wsReconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, wsReconnectAttempts), 30000);
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${wsReconnectAttempts})`);
          setTimeout(connectWebSocket, delay);
        } else {
          console.log('[WS] Max reconnect attempts reached. Running in standalone mode.');
        }
      };

      ws.onerror = (error) => {
        console.log('[WS] Connection error - backend may not be running');
      };

    } catch (e) {
      console.log('[WS] WebSocket not available, running in standalone mode');
    }
  }

  function sendToBackend(type, data = {}) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...data }));
    }
  }

  function isWebSocketConnected() {
    return wsConnected;
  }

  // ============================================
  // DRAG & DROP
  // ============================================

  let dragState = {
    element: null,
    offsetX: 0,
    offsetY: 0,
    zIndex: 100,
  };

  let resizeState = {
    element: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  };

  function makeDraggable(element, handle = null) {
    const dragHandle = handle || element;

    dragHandle.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('window-control')) return;

      e.preventDefault();

      const rect = element.getBoundingClientRect();
      dragState.element = element;
      dragState.offsetX = e.clientX - rect.left;
      dragState.offsetY = e.clientY - rect.top;
      dragState.zIndex++;

      element.style.zIndex = dragState.zIndex;
      element.style.cursor = 'grabbing';
      if (handle) handle.style.cursor = 'grabbing';
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (dragState.element) {
      const newX = e.clientX - dragState.offsetX;
      const newY = e.clientY - dragState.offsetY;

      dragState.element.style.left = `${Math.max(0, newX)}px`;
      dragState.element.style.top = `${Math.max(0, newY)}px`;
      dragState.element.style.transition = 'none';
    }

    if (resizeState.element) {
      const dx = e.clientX - resizeState.startX;
      const dy = e.clientY - resizeState.startY;

      const newWidth = Math.max(280, resizeState.startWidth + dx);
      const newHeight = Math.max(200, resizeState.startHeight + dy);

      resizeState.element.style.width = `${newWidth}px`;
      resizeState.element.style.height = `${newHeight}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (dragState.element) {
      dragState.element.style.cursor = '';
      const handle = dragState.element.querySelector('.window-header');
      if (handle) handle.style.cursor = 'grab';
      dragState.element = null;
    }

    if (resizeState.element) {
      resizeState.element = null;
    }
  });

  // ============================================
  // WINDOW RESIZE
  // ============================================

  function makeResizable(windowEl) {
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'window-resize';
    windowEl.appendChild(resizeHandle);

    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      resizeState.element = windowEl;
      resizeState.startX = e.clientX;
      resizeState.startY = e.clientY;
      resizeState.startWidth = windowEl.offsetWidth;
      resizeState.startHeight = windowEl.offsetHeight;

      dragState.zIndex++;
      windowEl.style.zIndex = dragState.zIndex;
    });
  }

  // ============================================
  // CLOCK
  // ============================================

  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    document.getElementById('clock-time').textContent = `${hours}:${minutes}`;
    document.getElementById('clock-date').textContent = days[now.getDay()];
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  function showToast(message, duration = 4000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('exiting');
      setTimeout(() => {
        toast.remove();
        addJournalEntry(message);
      }, 400);
    }, duration);
  }

  // ============================================
  // JOURNAL
  // ============================================

  function addJournalEntry(message) {
    const container = document.getElementById('journal-entries');
    const entry = document.createElement('div');
    entry.className = 'journal-entry new';

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    entry.innerHTML = `
      <span class="time">${timeStr}</span>
      ${message}
    `;

    container.insertBefore(entry, container.firstChild);

    setTimeout(() => {
      entry.classList.remove('new');
    }, 500);

    while (container.children.length > 10) {
      container.removeChild(container.lastChild);
    }

    state.journalEntries.unshift({ message, time: now });
  }

  // ============================================
  // EXPORTS
  // ============================================

  window.OSCore = {
    // State
    state,
    activeScenes,
    dragState,

    // Utilities
    randomChoice,
    randomInt,
    generateId,

    // WebSocket
    connectWebSocket,
    sendToBackend,
    isWebSocketConnected,
    setBackendEventHandler,

    // Drag & Drop
    makeDraggable,
    makeResizable,

    // Clock
    updateClock,

    // UI
    showToast,
    addJournalEntry,
  };

})();

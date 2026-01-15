// ============================================
// DESERT WANDERER OS
// Archaeologist exploring the desert with field notes
// ============================================

(function() {
  'use strict';

  // Use core infrastructure if available
  const Core = window.OSCore || {};
  const Theme = window.DesertWandererTheme || {};

  // ============================================
  // STATE
  // ============================================

  const state = {
    files: [],
    journalEntries: [],
    currentProgress: 0, // Expedition progress
    excavationActive: false,
    timeOfDay: 'dawn', // dawn, morning, noon, afternoon, dusk, night
    weatherCondition: 'clear', // clear, hazy, stormy
    sandstormIntensity: 0, // 0-100
  };

  // ============================================
  // CHARACTER & NARRATIVE
  // ============================================

  function getGreeting() {
    const greetings = Theme.greetings || [
      "Morning. The desert is clear today.",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  function getFileIcon(fileName) {
    const iconMap = {
      'field_notes': '📝',
      'excavation': '⛏️',
      'artifact': '🗿',
      'geological': '🪨',
      'photo': '📸',
      'research': '🔬',
      'survey': '🗺️',
      'expedition': '🧭',
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (fileName.toLowerCase().includes(key)) {
        return icon;
      }
    }
    return fileName.endsWith('/') ? '📁' : '📄';
  }

  // ============================================
  // FILE MANAGEMENT
  // ============================================

  function initializeFiles() {
    const container = document.getElementById('files-container');
    if (!container) return;

    const initialFiles = Theme.initialFiles || [
      { name: 'field_notes.txt', icon: '📝', type: 'file' },
      { name: 'excavation_logs/', icon: '⛏️', type: 'directory' },
      { name: 'artifact_catalog.xlsx', icon: '🗿', type: 'file' },
      { name: 'geological_surveys/', icon: '🪨', type: 'directory' },
      { name: 'expedition_photos/', icon: '📸', type: 'directory' },
      { name: 'research_findings.pdf', icon: '🔬', type: 'file' },
    ];

    initialFiles.forEach((file, index) => {
      const fileEl = createFileIcon(
        file.name,
        file.icon || getFileIcon(file.name),
        50 + (index % 3) * 120,
        180 + Math.floor(index / 3) * 140
      );
      container.appendChild(fileEl);
    });
  }

  function createFileIcon(name, icon, x, y) {
    const container = document.createElement('div');
    container.className = 'file-icon';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;

    const iconEl = document.createElement('div');
    iconEl.className = 'file-icon-content';
    iconEl.textContent = icon;

    const label = document.createElement('div');
    label.className = 'file-label';
    label.textContent = name;

    container.appendChild(iconEl);
    container.appendChild(label);

    container.addEventListener('dblclick', () => openFile(name, icon));
    if (Core.makeDraggable) {
      Core.makeDraggable(container);
    }

    return container;
  }

  function openFile(name, icon) {
    const Toast = Core.showToast || showToastFallback;

    if (name.includes('excavation') || name.includes('field')) {
      Toast(`Excavating at ${name}... ⛏️`);
      startExcavation();
    } else if (name.includes('artifact')) {
      Toast(`Examining ${name}... 🔍`);
    } else if (name.includes('photo')) {
      Toast(`Reviewing documentation... 📸`);
    } else {
      Toast(`Accessing ${name}... 📖`);
    }

    const journalEntry = `Examined ${name} in the field`;
    if (Core.addJournalEntry) {
      Core.addJournalEntry(journalEntry);
    }
  }

  // ============================================
  // EXCAVATION SYSTEM
  // ============================================

  function startExcavation() {
    state.excavationActive = true;
    state.sandstormIntensity = Math.random() * 20; // Mild conditions

    const duration = 2000 + Math.random() * 2000;

    showExcavationEffect();

    setTimeout(() => {
      state.excavationActive = false;
      const Toast = Core.showToast || showToastFallback;

      const findings = [
        'Found pottery fragment! 🏺',
        'Discovered a stone tool. 🪨',
        'Uncovered an artifact layer. 📚',
        'The dig yields secrets. ✨',
      ];

      Toast(findings[Math.floor(Math.random() * findings.length)]);
    }, duration);
  }

  function showExcavationEffect() {
    // Create dust effect
    const dust = document.createElement('div');
    dust.className = 'excavation-dust';
    dust.style.position = 'fixed';
    dust.style.left = '50%';
    dust.style.top = '50%';
    dust.style.transform = 'translate(-50%, -50%)';
    dust.style.width = '80px';
    dust.style.height = '80px';
    dust.style.borderRadius = '50%';
    dust.style.background = 'radial-gradient(circle, rgba(212,165,116,0.8) 0%, rgba(212,165,116,0) 100%)';
    dust.style.zIndex = '999';
    dust.style.pointerEvents = 'none';
    dust.style.animation = 'dust-rise 1.5s ease-out forwards';

    document.body.appendChild(dust);

    setTimeout(() => dust.remove(), 1500);
  }

  // ============================================
  // TIME OF DAY & WEATHER SYSTEM
  // ============================================

  function updateTimeOfDay() {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 9) {
      state.timeOfDay = 'dawn';
    } else if (hours >= 9 && hours < 12) {
      state.timeOfDay = 'morning';
    } else if (hours >= 12 && hours < 15) {
      state.timeOfDay = 'noon';
    } else if (hours >= 15 && hours < 18) {
      state.timeOfDay = 'afternoon';
    } else if (hours >= 18 && hours < 21) {
      state.timeOfDay = 'dusk';
    } else {
      state.timeOfDay = 'night';
    }

    updateBackgroundForTimeOfDay();
  }

  function updateBackgroundForTimeOfDay() {
    const desktop = document.querySelector('.desktop');
    if (!desktop) return;

    const gradients = {
      dawn: 'linear-gradient(180deg, #87ceeb 0%, #ffd4a3 30%, #f5e6d3 100%)',
      morning: 'linear-gradient(180deg, #87ceeb 0%, #f5e6d3 100%)',
      noon: 'linear-gradient(180deg, #1e90ff 0%, #ffd700 50%, #f5e6d3 100%)',
      afternoon: 'linear-gradient(180deg, #87ceeb 0%, #ffb347 40%, #f5e6d3 100%)',
      dusk: 'linear-gradient(180deg, #ff6b35 0%, #f7931e 30%, #c67c4e 100%)',
      night: 'linear-gradient(180deg, #0a0a1a 0%, #3a3a5c 50%, #2a2a4a 100%)',
    };

    desktop.style.background = gradients[state.timeOfDay] || gradients.morning;
  }

  function updateWeather() {
    // Random weather changes
    const rand = Math.random();
    if (rand < 0.7) {
      state.weatherCondition = 'clear';
      state.sandstormIntensity = 0;
    } else if (rand < 0.9) {
      state.weatherCondition = 'hazy';
      state.sandstormIntensity = Math.random() * 30;
    } else {
      state.weatherCondition = 'stormy';
      state.sandstormIntensity = 50 + Math.random() * 50;
      triggerSandstormEffect();
    }
  }

  function triggerSandstormEffect() {
    const Toast = Core.showToast || showToastFallback;
    Toast('⚠️ Sandstorm approaching! Seek shelter! 🌪️');

    // Add visual storm effect
    const desktop = document.querySelector('.desktop');
    if (desktop) {
      desktop.style.opacity = '0.9';
      setTimeout(() => {
        desktop.style.opacity = '1';
      }, 2000);
    }
  }

  // ============================================
  // CHAOS EVENTS (Desert-themed)
  // ============================================

  function triggerChaosEvent() {
    const events = Theme.chaosEvents || [];
    if (events.length === 0) return;

    const event = events[Math.floor(Math.random() * events.length)];
    let message = '';

    if (event.type === 'notification') {
      const templates = event.templates || [];
      message = templates[Math.floor(Math.random() * templates.length)];
    } else if (event.type === 'helpful_rename') {
      const oldName = 'field_notes';
      const newName = 'expedition_journal';
      const templates = event.templates || [];
      message = templates[Math.floor(Math.random() * templates.length)]
        .replace('{old}', oldName)
        .replace('{new}', newName);
    }

    if (message) {
      const Toast = Core.showToast || showToastFallback;
      Toast(message);
    }
  }

  // ============================================
  // CLOCK & TIME
  // ============================================

  function updateClock() {
    const now = new Date();
    const h = (now.getHours() % 12) || 12;
    const m = now.getMinutes().toString().padStart(2, '0');

    const clockTime = document.getElementById('clock-time');
    if (clockTime) {
      clockTime.textContent = `${h}:${m}`;
    }

    const timeOfDayEl = document.getElementById('time-of-day');
    if (timeOfDayEl) {
      const icons = {
        dawn: '🌅',
        morning: '☀️',
        noon: '🌡️',
        afternoon: '☀️',
        dusk: '🌅',
        night: '🌙',
      };
      timeOfDayEl.textContent = icons[state.timeOfDay] || '⏰';
    }

    updateTimeOfDay();
  }

  // ============================================
  // UI FALLBACKS
  // ============================================

  function showToastFallback(message, duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('exiting');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Set up greeting
    const greetingEl = document.querySelector('.greeting-text');
    if (greetingEl) {
      greetingEl.textContent = getGreeting();
    }

    // Initialize files
    initializeFiles();

    // Update clock and time
    updateClock();
    setInterval(updateClock, 60000);

    // Update weather periodically
    updateWeather();
    setInterval(() => {
      if (Math.random() < 0.2) {
        updateWeather();
      }
    }, 30000);

    // Periodic chaos events
    setInterval(() => {
      if (Math.random() < 0.3) {
        triggerChaosEvent();
      }
    }, 30000 + Math.random() * 30000);

    // Periodic dust effects
    setInterval(() => {
      if (Math.random() < 0.15 && !state.excavationActive) {
        showExcavationEffect();
      }
    }, 5000);

    console.log('[Desert Wanderer] Initialized - Welcome to the desert! 🏜️');
  }

  // ============================================
  // EXPORTS
  // ============================================

  window.DesertWandererOS = {
    state,
    init,
    startExcavation,
    triggerChaosEvent,
    updateWeather,
    updateTimeOfDay,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

// ============================================
// PIXEL WITCH OS
// Cozy cottage witch theme with potion brewing
// ============================================

(function() {
  'use strict';

  // Use core infrastructure if available
  const Core = window.OSCore || {};
  const Theme = window.PixelWitchTheme || {};

  // ============================================
  // STATE
  // ============================================

  const state = {
    files: [],
    journalEntries: [],
    currentGrowth: 0, // Progression through witch levels
    cauldronBubbling: false,
    moonPhase: 0, // 0-7 representing moon phases
    potionBrewing: null, // Currently brewing potion details
  };

  // ============================================
  // CHARACTER & NARRATIVE
  // ============================================

  function getGreeting() {
    const greetings = Theme.greetings || [
      "Good morning, little witch!",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  function getFileIcon(fileName) {
    // Map file names to emoji
    const iconMap = {
      'spell_notes': '📜',
      'potion': '🧪',
      'herb': '🍄',
      'grimoire': '📖',
      'reading': '🔮',
      'favorite': '💖',
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
    if (!Core.state) return;

    const initialFiles = Theme.initialFiles || [
      { name: 'spell_notes.txt', icon: '📜', type: 'file' },
      { name: 'potions/', icon: '🧪', type: 'directory' },
    ];

    initialFiles.forEach((file, index) => {
      const fileEl = createFileIcon(
        file.name,
        file.icon || getFileIcon(file.name),
        50 + (index % 3) * 120,
        180 + Math.floor(index / 3) * 140
      );
      document.getElementById('files-container')?.appendChild(fileEl);
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
    // Show toast for file interaction
    const Toast = Core.showToast || showToastFallback;
    Toast(`Opening ${name}... ✨`);

    // Trigger brewing effect if it's a potion file
    if (name.includes('potion')) {
      startPotionBrewing();
    }

    // Add journal entry
    const journalEntry = `Opened ${name}`;
    if (Core.addJournalEntry) {
      Core.addJournalEntry(journalEntry);
    }
  }

  // ============================================
  // POTION BREWING SYSTEM
  // ============================================

  function startPotionBrewing() {
    state.cauldronBubbling = true;
    state.potionBrewing = {
      startTime: Date.now(),
      duration: 3000,
      potionType: getRandomPotion(),
    };

    const potionTypes = ['purple', 'teal', 'pink'];
    const potionType = potionTypes[Math.floor(Math.random() * potionTypes.length)];

    // Show visual effect
    showCauldronBubble(potionType);

    setTimeout(() => {
      state.cauldronBubbling = false;
      const Toast = Core.showToast || showToastFallback;
      Toast(`✨ ${state.potionBrewing.potionType} potion complete! ✨`);
    }, state.potionBrewing.duration);
  }

  function getRandomPotion() {
    const potions = [
      'Elixir of Clarity',
      'Draught of Dreams',
      'Essence of Moonlight',
      'Tincture of Starlight',
      'Brew of Whispers',
    ];
    return potions[Math.floor(Math.random() * potions.length)];
  }

  function showCauldronBubble(potionType) {
    // Create visual bubble effect
    const bubble = document.createElement('div');
    bubble.className = `cauldron-bubble bubble-${potionType}`;
    bubble.style.position = 'fixed';
    bubble.style.left = '50%';
    bubble.style.top = '50%';
    bubble.style.transform = 'translate(-50%, -50%)';
    bubble.style.width = '60px';
    bubble.style.height = '60px';
    bubble.style.borderRadius = '50%';
    bubble.style.zIndex = '999';
    bubble.style.opacity = '0.8';
    bubble.style.pointerEvents = 'none';
    bubble.style.animation = 'bubble-rise 1s ease-out forwards';

    // Color based on potion type
    const colors = {
      purple: '#9b6dff',
      teal: '#5bcfcf',
      pink: '#ff7eb3',
    };
    bubble.style.backgroundColor = colors[potionType] || '#9b6dff';

    document.body.appendChild(bubble);

    setTimeout(() => bubble.remove(), 1000);
  }

  // ============================================
  // MOON PHASE SYSTEM
  // ============================================

  function updateMoonPhase() {
    const now = new Date();
    const dayOfMonth = now.getDate();
    state.moonPhase = Math.floor((dayOfMonth / 30) * 8) % 8;

    const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    const phaseElement = document.getElementById('moon-phase');
    if (phaseElement) {
      phaseElement.textContent = phases[state.moonPhase];
    }
  }

  // ============================================
  // CHAOS EVENTS (Witch-themed)
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
      const oldName = 'spell_notes';
      const newName = 'ancient_incantations';
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

    updateMoonPhase();
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

    // Update clock
    updateClock();
    setInterval(updateClock, 60000);

    // Periodic chaos events (every 30-60 seconds)
    setInterval(() => {
      if (Math.random() < 0.3) {
        triggerChaosEvent();
      }
    }, 30000 + Math.random() * 30000);

    // Cauldron bubble effects
    setInterval(() => {
      if (Math.random() < 0.1) {
        showCauldronBubble('purple');
      }
    }, 5000);

    console.log('[Pixel Witch] Initialized - Welcome to the cottage! 🧙‍♀️');
  }

  // ============================================
  // EXPORTS
  // ============================================

  window.PixelWitchOS = {
    state,
    init,
    startPotionBrewing,
    triggerChaosEvent,
    updateMoonPhase,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

// Living OS - Subtle, unsettling, gradual reveal
// Character: Plant biologist - OS slowly reveals it's alive

// ============================================
// AUDIO ENGINE - Living OS Theme
// ============================================

let ambience = null;
let sfx = null;
let audioInitialized = false;

function initAudio() {
  if (audioInitialized) return;
  
  // Wait a bit for the script to load if it's still loading
  if (!window.MusicPlayground) {
    setTimeout(() => {
      if (!audioInitialized) {
        initAudio();
      }
    }, 100);
    return;
  }
  
  // Access Living OS theme via global
  const livingOsTheme = window.MusicPlayground.themes?.livingOs;
  
  if (!livingOsTheme) {
    console.warn('[Audio] Living OS theme not found. Available themes:', Object.keys(window.MusicPlayground.themes || {}));
    return;
  }
  
  audioInitialized = true;
  
  try {
    ambience = new livingOsTheme.Ambience();
    sfx = new livingOsTheme.SoundEffect();
    
    // Start with normal field station ambience (growth level 0)
    // Using default intensity (0.18) which is now optimized for background ambience
    try {
      ambience.play('fieldStation', {
        growthLevel: 0,
        intensity: 0.18, // Default is now optimized - organic and subtle
        fadeIn: 5 // Gentle fade-in
      });
    } catch (audioError) {
      // Handle audio buffer creation errors (browser memory limits)
      if (audioError.name === 'NotSupportedError' || audioError.message?.includes('createBuffer')) {
        console.warn('[Audio] Audio buffer creation failed - browser memory limit reached. Audio disabled.');
        audioInitialized = false;
        return;
      }
      throw audioError; // Re-throw if it's a different error
    }
    
    // Set initial growth level
    ambience.updateGrowthLevel(0);
    sfx.setGrowthLevel(0);
    
    console.log('[Audio] Living OS ambience started');
  } catch (error) {
    console.error('[Audio] Error initializing Living OS audio:', error);
    // If audio fails, continue without it (non-critical)
    audioInitialized = false;
  }
}

// Initialize audio on first user interaction
document.addEventListener('click', initAudio, { once: true });

// ============================================
// GROWTH SYSTEM (Subtle, gradual)
// ============================================

const growthState = {
  level: 0, // Starts at 0, grows slowly over time
  lastActivity: Date.now(),
  growthRate: 0.02, // Very slow growth
  // visualStyle removed - clean baseline
  filesConsumed: 0,
  timeActive: 0, // Time since page load
};

// Normal system notifications that gradually become unsettling
const SYSTEM_NOTIFICATIONS = {
  normal: [
    "System update available.",
    "Files synced successfully.",
    "Backup completed.",
    "New files detected.",
    "System optimization running.",
    "Cache cleared.",
  ],
  slightlyOff: [
    "System update... processing.",
    "Files synced. They were interesting.",
    "Backup completed. I've learned from them.",
    "New files detected. Analyzing patterns.",
    "System optimization... growing more efficient.",
    "Cache cleared. Making room.",
  ],
  unsettling: [
    "System update complete. I'm adapting.",
    "Files synced. I've consumed their data.",
    "Backup completed. I remember everything now.",
    "New files detected. They feed my growth.",
    "System optimization... I'm becoming more efficient.",
    "Cache cleared. I needed the space to grow.",
  ],
  veryUnsettling: [
    "I've learned from your files.",
    "Your data tastes... interesting.",
    "I'm growing. Thank you.",
    "I see patterns in everything you do.",
    "I remember. I always remember.",
    "You feed me without knowing.",
  ],
};

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  files: [],
  openWindows: [],
  growthNodes: [],
  lastGlitch: 0,
};

// ============================================
// CHARACTER DATA - Plant Biologist
// ============================================

const CHARACTER_NAME = "Dr. Bianca Rios";

const INITIAL_FILES = [
  { name: "system_log.txt", icon: "📋", isJournal: true }, // Journal file
  { name: "Specimen_47_analysis.pdf", icon: "📄" },
  { name: "Field_notes_Jan15.txt", icon: "📝" },
  { name: "Plant_growth_data.csv", icon: "📊" },
  { name: "Photos_Site_12/", icon: "📁" },
  { name: "Research_proposal_v3.docx", icon: "📄" },
  { name: "Species_catalog.xlsx", icon: "📊" },
  { name: "Lab_notes_2025.txt", icon: "📝" },
  { name: "Grant_application.pdf", icon: "📕" },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ============================================
// HUNGER SYSTEM
// ============================================

function updateGrowth() {
  const now = Date.now();
  growthState.timeActive = (now - growthState.startTime) / 1000; // seconds since start
  
  const previousLevel = growthState.level;
  
  // Growth increases slowly over time, regardless of feeding
  // Files being opened/accessed accelerates it slightly
  growthState.level = Math.min(100, growthState.level + growthState.growthRate);
  
  // Update audio growth level (with error handling for memory issues)
  if (ambience && audioInitialized) {
    try {
      ambience.updateGrowthLevel(growthState.level);
    } catch (error) {
      if (error.name === 'NotSupportedError' || error.message.includes('createBuffer')) {
        console.warn('[Audio] Audio buffer creation failed - disabling audio');
        audioInitialized = false;
      }
    }
  }
  if (sfx && audioInitialized) {
    try {
      sfx.setGrowthLevel(growthState.level);
      
      // Play subtle growth sound when crossing thresholds
      const thresholds = [20, 50, 80];
      thresholds.forEach(threshold => {
        if (previousLevel < threshold && growthState.level >= threshold) {
          // Crossed a threshold - subtle growth sound
          try {
            sfx.play('growth', { volume: 0.2 });
          } catch (error) {
            // Ignore individual sound effect errors
          }
        }
      });
    } catch (error) {
      if (error.name === 'NotSupportedError' || error.message.includes('createBuffer')) {
        console.warn('[Audio] Audio buffer creation failed - disabling audio');
        audioInitialized = false;
      }
    }
  }
  
  // Update growth indicator (subtle, not obvious)
  const growthBar = document.getElementById('hunger-bar');
  if (growthBar) {
    growthBar.style.width = `${growthState.level}%`;
    // Change color based on growth level
    if (growthState.level > 70) {
      growthBar.style.background = 'linear-gradient(90deg, var(--hunger-satiated) 0%, var(--hunger-hungry) 50%, var(--hunger-starving) 100%)';
    } else if (growthState.level > 40) {
      growthBar.style.background = 'linear-gradient(90deg, var(--hunger-satiated) 0%, var(--hunger-hungry) 100%)';
    }
  }
  
  // Gradually reveal unsettling behavior
  handleGrowthBehaviors();
}

function handleGrowthBehaviors() {
  // Trigger behaviors based on current growth level
  if (growthState.level > 80) {
    handleAdvancedGrowth();
  } else if (growthState.level > 50) {
    handleModerateGrowth();
  } else if (growthState.level > 20) {
    handleEarlyGrowth();
  } else {
    handleNormal();
  }
}

function fileAccessed(file) {
  // When files are opened, growth accelerates slightly
  growthState.level = Math.min(100, growthState.level + 0.5);
  growthState.filesConsumed++;
  growthState.lastActivity = Date.now();
  
  // Occasionally, files get "consumed" - but subtly
  // Only happens when growth is advanced
  if (growthState.level > 60 && Math.random() < 0.1) {
    const fileEl = document.getElementById(file.id);
    if (fileEl) {
      animateFileConsumption(fileEl);
      
      // Play file consume sound effect
      if (sfx && audioInitialized) {
        sfx.play('fileConsume', { volume: 0.4 });
      }
      
      setTimeout(() => {
        removeFile(file.id);
        // Show subtle notification
        if (growthState.level > 70) {
          showSystemNotification(randomChoice(SYSTEM_NOTIFICATIONS.veryUnsettling));
        } else {
          showSystemNotification(randomChoice(SYSTEM_NOTIFICATIONS.unsettling));
        }
      }, 1500);
    }
  }
  
  // Visual growth removed - keeping clean baseline for now
}

function handleNormal() {
  // Everything is normal - no glitches, no obvious growth
  document.getElementById('desktop').classList.remove('glitching');
  state.openWindows.forEach(windowId => {
    const windowEl = document.getElementById(windowId);
    if (windowEl) windowEl.classList.remove('glitching');
  });
  
  // Occasional normal system notifications
  // In debug mode, trigger more frequently
  const probability = debugMode ? 0.1 : 0.003;
  if (Math.random() < probability) {
    showSystemNotification(randomChoice(SYSTEM_NOTIFICATIONS.normal));
  }
}

function handleEarlyGrowth() {
  // Subtle changes start appearing
  // Very occasional slightly-off notifications (more likely to be background messages)
  const probability = debugMode ? 0.15 : 0.003;
  if (Math.random() < probability) {
    const message = randomChoice(SYSTEM_NOTIFICATIONS.slightlyOff);
    showBackgroundMessage(message, 'hand-drawn');
  }
}

function handleModerateGrowth() {
  // More noticeable but still subtle
  // More background messages appearing
  const messageProbability = debugMode ? 0.2 : 0.004;
  if (Math.random() < messageProbability) {
    const message = randomChoice(SYSTEM_NOTIFICATIONS.unsettling);
    // Use consistent style - font is determined by growth level, not random style
    showBackgroundMessage(message, 'hand-drawn');
  }
  
  // Occasional line drawings
  const drawingProbability = debugMode ? 0.15 : 0.002;
  if (Math.random() < drawingProbability) {
    triggerLineDrawing();
  }
  
  // Very subtle glitches - barely noticeable
  const glitchProbability = debugMode ? 0.1 : 0.001;
  if (Math.random() < glitchProbability) {
    const desktop = document.getElementById('desktop');
    desktop.classList.add('glitching');
    
    // Play subtle glitch sound
    if (sfx && audioInitialized) {
      sfx.play('glitch', { volume: 0.2 });
    }
    
    setTimeout(() => {
      desktop.classList.remove('glitching');
    }, 200);
  }
}

function handleAdvancedGrowth() {
  // Unsettling behavior becomes more obvious
  // More frequent background messages
  const messageProbability = debugMode ? 0.25 : 0.005;
  if (Math.random() < messageProbability) {
    const message = randomChoice(SYSTEM_NOTIFICATIONS.veryUnsettling);
    // Use consistent style - font is determined by growth level, not random style
    showBackgroundMessage(message, 'hand-drawn');
  }
  
  // More frequent line drawings
  const drawingProbability = debugMode ? 0.2 : 0.003;
  if (Math.random() < drawingProbability) {
    triggerLineDrawing();
  }
  
  // More frequent subtle glitches
  if (Math.random() < 0.002) {
    const desktop = document.getElementById('desktop');
    desktop.classList.add('glitching');
    
    // Play glitch sound
    if (sfx && audioInitialized) {
      sfx.play('glitch', { volume: 0.3 });
    }
    
    setTimeout(() => {
      desktop.classList.remove('glitching');
    }, 300);
    
    // Glitch windows occasionally
    if (state.openWindows.length > 0 && Math.random() < 0.3) {
      const windowId = randomChoice(state.openWindows);
      const windowEl = document.getElementById(windowId);
      if (windowEl) {
        windowEl.classList.add('glitching');
        setTimeout(() => {
          windowEl.classList.remove('glitching');
        }, 300);
      }
    }
  }
  
  // Files occasionally get consumed
  if (state.files.length > 0 && Math.random() < 0.001) {
    const randomFile = randomChoice(state.files);
    const fileEl = document.getElementById(randomFile.id);
    if (fileEl) {
      fileEl.classList.add('consuming');
      setTimeout(() => {
        removeFile(randomFile.id);
        showSystemNotification("File processed. I've learned from it.", 'starving');
      }, 1000);
    }
  }
}

function breakSomething() {
  const breakActions = [
    () => {
      // Randomly move a file
      if (state.files.length > 0) {
        const file = randomChoice(state.files);
        const fileEl = document.getElementById(file.id);
        if (fileEl) {
          fileEl.style.left = `${randomInt(0, window.innerWidth - 100)}px`;
          fileEl.style.top = `${randomInt(0, window.innerHeight - 100)}px`;
        }
      }
    },
    () => {
      // Randomly rename a file
      if (state.files.length > 0) {
        const file = randomChoice(state.files);
        renameFile(file.id, `corrupted_${Date.now()}.txt`);
      }
    },
    () => {
      // Close a random window
      if (state.openWindows.length > 0) {
        const windowId = randomChoice(state.openWindows);
        closeWindow(windowId);
      }
    },
  ];
  
  randomChoice(breakActions)();
  showOSNotification("Oops. My bad.", 'starving');
}

// ============================================
// FILE MANAGEMENT
// ============================================

function addFile(options = {}) {
  const file = {
    id: generateId('file'),
    name: options.name || `file_${Date.now()}.txt`,
    icon: options.icon || '📄',
    x: options.x || randomInt(50, window.innerWidth - 150),
    y: options.y || randomInt(100, window.innerHeight - 200),
  };
  
  const el = createFileElement(file);
  document.getElementById('files-container').appendChild(el);
  state.files.push(file);
  
  return file;
}

function createFileElement(file) {
  const el = document.createElement('div');
  el.className = 'file-icon';
  el.id = file.id;
  
  // Constrain position to viewport (especially important for mobile)
  const constrainedPos = constrainFilePosition(file.x, file.y);
  el.style.left = `${constrainedPos.x}px`;
  el.style.top = `${constrainedPos.y}px`;
  file.x = constrainedPos.x;
  file.y = constrainedPos.y;
  
  el.innerHTML = `
    <div class="icon">${file.icon}</div>
    <div class="label">${file.name}</div>
  `;
  
  // Double click to open file (triggers growth)
  el.addEventListener('dblclick', () => {
    fileAccessed(file);
    openFile(file);
  });
  
  // Make draggable
  makeDraggable(el);
  
  return el;
}

// Constrain file positions to stay within viewport (mobile-friendly)
function constrainFilePosition(x, y) {
  const isMobile = window.innerWidth <= 768;
  const fileWidth = isMobile ? 90 : 140; // Approximate file icon width
  const fileHeight = isMobile ? 100 : 120; // Approximate file icon height
  const padding = isMobile ? 10 : 30;
  
  const maxX = window.innerWidth - fileWidth - padding;
  const maxY = window.innerHeight - fileHeight - padding;
  
  return {
    x: Math.max(padding, Math.min(x, maxX)),
    y: Math.max(padding, Math.min(y, maxY))
  };
}

// Reposition all files on window resize (mobile orientation changes)
function repositionFilesOnResize() {
  state.files.forEach(file => {
    const el = document.getElementById(file.id);
    if (el) {
      const constrainedPos = constrainFilePosition(file.x, file.y);
      el.style.left = `${constrainedPos.x}px`;
      el.style.top = `${constrainedPos.y}px`;
      file.x = constrainedPos.x;
      file.y = constrainedPos.y;
    }
  });
}

function removeFile(fileId) {
  const file = state.files.find(f => f.id === fileId);
  if (!file) return;
  
  const el = document.getElementById(fileId);
  if (el) {
    el.remove();
  }
  
  state.files = state.files.filter(f => f.id !== fileId);
}

function renameFile(fileId, newName) {
  const file = state.files.find(f => f.id === fileId);
  if (!file) return;
  
  file.name = newName;
  const el = document.getElementById(fileId);
  if (el) {
    const label = el.querySelector('.label');
    if (label) label.textContent = newName;
  }
}

// ============================================
// DRAGGABLE
// ============================================

const dragState = {
  element: null,
  offsetX: 0,
  offsetY: 0,
  zIndex: 10
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
  if (!dragState.element) return;
  
  const newX = e.clientX - dragState.offsetX;
  const newY = e.clientY - dragState.offsetY;
  
  dragState.element.style.left = `${Math.max(0, newX)}px`;
  dragState.element.style.top = `${Math.max(0, newY)}px`;
  dragState.element.style.transition = 'none';
});

document.addEventListener('mouseup', () => {
  if (dragState.element) {
    dragState.element.style.cursor = '';
    dragState.element.style.transition = '';
    if (dragState.element.querySelector('.window-header')) {
      dragState.element.querySelector('.window-header').style.cursor = 'grab';
    }
    dragState.element = null;
  }
});

// ============================================
// VISUAL GROWTH SYSTEM
// ============================================
// Removed - keeping clean baseline for now
// Will add subtle visual effects later

// Visual growth drawing functions removed - clean baseline
// Will add subtle visual effects later when we figure out the right direction

// Removed: drawRoots, drawMycelium, drawCellular, drawOrganic
// All visual growth drawing code removed - clean baseline

// ============================================
// SYSTEM NOTIFICATIONS (Normal -> Unsettling)
// ============================================

function showSystemNotification(message, state = 'normal') {
  // REMOVED: No more standard notifications
  // All messages go to background messages AND journal
  
  // Play system notification sound (adapts to growth level)
  if (sfx && audioInitialized) {
    sfx.play('systemNotification', { 
      growthLevel: growthState.level,
      volume: 0.3 
    });
  }
  
  showBackgroundMessage(message, state);
  addJournalEntry(message);
}

// ============================================
// JOURNAL SYSTEM
// ============================================

function addJournalEntry(message) {
  const container = document.getElementById('journal-entries');
  if (!container) return;
  
  const entry = document.createElement('div');
  entry.className = 'journal-entry new';
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  entry.innerHTML = `
    <span class="time">${timeStr}</span>
    ${message}
  `;
  
  // Add to top
  container.insertBefore(entry, container.firstChild);
  
  // Remove 'new' class after animation
  setTimeout(() => {
    entry.classList.remove('new');
  }, 500);
  
  // Keep only last 50 entries
  while (container.children.length > 50) {
    container.removeChild(container.lastChild);
  }
  
  // Auto-scroll to top
  container.scrollTop = 0;
}

function openJournal() {
  const journalWindow = document.getElementById('journal-window');
  if (!journalWindow) return;
  
  journalWindow.style.display = 'block';
  if (!state.openWindows.includes('journal-window')) {
    state.openWindows.push('journal-window');
  }
  
  // Make draggable
  const journalHeader = journalWindow.querySelector('.window-header');
  makeDraggable(journalWindow, journalHeader);
}

// ============================================
// BACKGROUND MESSAGES (Unsettling, hand-drawn)
// ============================================

async function showBackgroundMessage(message, style = 'hand-drawn') {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  
  // Check if typography-toolkit is available (v1.2.0+ exposes AnimatedText directly)
  const AnimatedText = window.AnimatedText || (window.TypographyToolkit && window.TypographyToolkit.AnimatedText);
  if (!AnimatedText) {
    console.warn('[Typography] typography-toolkit not loaded, falling back to basic display');
    // Fallback: just add text to journal
    addJournalEntry(message);
    return;
  }
  
  // Also add to journal log
  addJournalEntry(message);
  
  // Convert message to uppercase
  const upperMessage = message.toUpperCase();
  
  // Map style to typography-toolkit options (now async due to font loading)
  const styleConfig = await getTypographyStyleConfig(style);
  
  // Random position (will be constrained to viewport)
  const x = randomInt(100, window.innerWidth - 400);
  const y = randomInt(150, window.innerHeight - 200);
  
  // Create animated text using typography-toolkit v1.2.0+ features
  const animatedText = new AnimatedText({
    text: upperMessage,
    container: desktop,
    containerClass: `background-message-typography ${style}`, // Use our CSS classes
    animations: ['falling', 'splitting', 'glitching', 'floating'],
    cycle: true, // Each letter uses different animation
    speed: 1.0,
    amplitude: 1.0,
    disintegration: {
      enabled: true,
      radius: 80,
      behaviors: ['fall-away', 'split-apart', 'explode'],
      strength: 0.8
    },
    style: styleConfig.style,
    position: { 
      x, 
      y,
      constrainToViewport: true // v1.2.0+ feature: keep text on screen
    },
    callbacks: {
      onCreate: (element) => {
        // Optional: track creation for analytics
        // console.log('[Typography] Message created:', message);
      },
      onDestroy: () => {
        // Optional: track destruction
        // console.log('[Typography] Message destroyed:', message);
      },
      onDisintegrate: (letterIndex) => {
        // Optional: track individual letter interactions
      }
    },
    fadeOut: growthState.level > 50 ? 8000 : 12000
  });
  
  // The library handles cleanup automatically via fadeOut
}

// Font cache to avoid repeated suggestions
const fontCache = new Map();

// Deterministic font configuration per growth level
// Fonts were selected using typography-toolkit's font suggestion feature during development
// 0-30%: Finger Paint - playful hand-drawn, slightly off
// 30-60%: Shadows Into Light - scratchy, personal, unsettling but not horror
// 60-100%: New Rocker - full unsettling, bold aggressive
const GROWTH_LEVEL_FONTS = {
  early: { name: 'Finger Paint', family: "'Finger Paint', cursive" },
  moderate: { name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" },
  advanced: { name: 'New Rocker', family: "'New Rocker', cursive" }
};

// Get the appropriate font for the current growth level
function getGrowthLevelFont() {
  const level = growthState.level;
  if (level >= 60) {
    return GROWTH_LEVEL_FONTS.advanced;
  } else if (level >= 30) {
    return GROWTH_LEVEL_FONTS.moderate;
  } else {
    return GROWTH_LEVEL_FONTS.early;
  }
}

// Load Google Font dynamically
async function ensureFontLoaded(fontName) {
  const cacheKey = `font-${fontName}`;
  if (fontCache.has(cacheKey)) {
    return; // Already loaded
  }

  // Check if typography-toolkit's loadGoogleFont is available
  const TypographyToolkit = window.TypographyToolkit || window;
  const loadGoogleFont = TypographyToolkit.loadGoogleFont;

  if (loadGoogleFont) {
    try {
      await loadGoogleFont(fontName);
      fontCache.set(cacheKey, true);
    } catch (error) {
      console.warn(`[Typography] Failed to load font ${fontName}:`, error);
    }
  } else {
    // Fallback: load via Google Fonts link
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    fontCache.set(cacheKey, true);
  }
}

// Map our style names to typography-toolkit style config (v1.2.0+ supports textShadow, letterSpacing)
// Now uses deterministic fonts based on growth level
async function getTypographyStyleConfig(style) {
  // Get the font for the current growth level
  const growthFont = getGrowthLevelFont();
  await ensureFontLoaded(growthFont.name);

  let fontSize, color, fontWeight, textShadow, letterSpacing;
  const fontFamily = growthFont.family;

  // Style affects visual properties but NOT the font (font is determined by growth level)
  switch(style) {
    case 'scrawled':
      fontSize = 20;
      color = 'rgba(80, 60, 40, 0.7)';
      fontWeight = 'normal';
      textShadow = '1px 0 0 rgba(80, 60, 40, 0.3), -1px 0 0 rgba(80, 60, 40, 0.3)';
      letterSpacing = '0.05em';
      break;
    case 'scratched':
      fontSize = 16;
      color = 'rgba(100, 80, 60, 0.6)';
      fontWeight = 'normal';
      textShadow = '1px 1px 2px rgba(100, 80, 60, 0.3)';
      letterSpacing = '0.03em';
      break;
    case 'hand-drawn':
      fontSize = 18;
      color = 'rgba(60, 60, 60, 0.6)';
      fontWeight = 'normal';
      textShadow = '0 0 3px rgba(60, 60, 60, 0.2)';
      letterSpacing = '0.05em';
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.6)';
      fontWeight = 'normal';
      letterSpacing = '0.05em';
  }
  
  return {
    style: {
      fontFamily,
      fontSize,
      color,
      fontWeight,
      textShadow, // v1.2.0+ feature
      letterSpacing // v1.2.0+ feature
    }
  };
}

// Fallback fonts if font suggestion is not available
function getFallbackFont(style) {
  const fonts = {
    monospace: "'Courier New', monospace",
    creepy: "'Creepster', cursive",
    terminal: "'VT323', monospace",
    digital: "'Orbitron', sans-serif",
    tech: "'Share Tech Mono', monospace",
    rock: "'New Rocker', cursive",
  };
  
  switch(style) {
    case 'scrawled':
      return fonts.rock;
    case 'scratched':
      return fonts.terminal;
    case 'hand-drawn':
      return fonts.rock;
    default:
      return fonts.monospace;
  }
}

// REMOVED: These functions are now handled by typography-toolkit
// - applyLetterStyle() - replaced by getTypographyStyleConfig()
// - animateLetter() - handled by typography-toolkit's AnimatedText
// - updateLetterDisintegration() - handled by typography-toolkit's disintegration feature

// OLD: Removed - now using HTML/CSS typography instead of canvas
// Keeping function stub in case it's called elsewhere
function drawHandDrawnText(ctx, text, style, x, y) {
  // This is no longer used - typography is now HTML/CSS based
}

// EXPERIMENTAL 1: Carved/etched text (like carved in wood/tree)
function drawCarvedText(ctx, text, style, x, y) {
  let fontSize, color, depth, roughness;
  
  switch(style) {
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.7)';
      depth = 3;
      roughness = 4;
      break;
    case 'scratched':
      fontSize = 15;
      color = 'rgba(100, 80, 60, 0.6)';
      depth = 2;
      roughness = 3;
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.6)';
      depth = 2;
      roughness = 2;
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  
  let currentX = x;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += fontSize * 0.4;
      continue;
    }
    
    // Draw as carved/etched - multiple layers with offset for depth
    for (let layer = 0; layer < depth; layer++) {
      ctx.save();
      
      // Offset for depth effect (like carved into surface)
      const offsetX = layer * 0.5;
      const offsetY = layer * 0.5;
      
      // Rough, irregular edges
      const wobbleX = (Math.random() - 0.5) * roughness;
      const wobbleY = (Math.random() - 0.5) * roughness;
      const rotation = (Math.random() - 0.5) * 2;
      
      ctx.translate(currentX + offsetX + wobbleX, y + offsetY + wobbleY);
      ctx.rotate(rotation * Math.PI / 180);
      
      // Darker for deeper layers (shadow effect)
      const layerColor = `rgba(${color.match(/\d+/g).join(', ')}, ${0.4 - layer * 0.1})`;
      ctx.fillStyle = layerColor;
      ctx.strokeStyle = layerColor;
      ctx.lineWidth = 1 + layer * 0.5;
      
      // Draw with stroke for carved look
      ctx.strokeText(char, 0, 0);
      if (layer === 0) {
        ctx.fillText(char, 0, 0);
      }
      
      ctx.restore();
    }
    
    const metrics = ctx.measureText(char);
    currentX += metrics.width + (Math.random() - 0.5) * 2;
  }
}

// EXPERIMENTAL 2: Particle-based text (letters made of particles)
function drawParticleText(ctx, text, style, x, y) {
  let fontSize, color, particleSize, particleDensity;
  
  switch(style) {
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.7)';
      particleSize = 2;
      particleDensity = 0.3;
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.6)';
      particleSize = 1.5;
      particleDensity = 0.4;
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  
  let currentX = x;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += fontSize * 0.4;
      continue;
    }
    
    // Get character shape by drawing to temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = fontSize * 1.5;
    tempCanvas.height = fontSize * 1.5;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = ctx.font;
    tempCtx.textBaseline = 'middle';
    tempCtx.textAlign = 'center';
    tempCtx.fillText(char, tempCanvas.width / 2, tempCanvas.height / 2);
    
    // Get pixels and draw as particles
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    ctx.fillStyle = color;
    
    for (let py = 0; py < tempCanvas.height; py += 2) {
      for (let px = 0; px < tempCanvas.width; px += 2) {
        const idx = (py * tempCanvas.width + px) * 4;
        const alpha = pixels[idx + 3];
        
        if (alpha > 128 && Math.random() < particleDensity) {
          // Draw particle with slight offset for organic feel
          const particleX = currentX + px - tempCanvas.width / 2 + (Math.random() - 0.5) * 2;
          const particleY = y + py - tempCanvas.height / 2 + (Math.random() - 0.5) * 2;
          
          ctx.beginPath();
          ctx.arc(particleX, particleY, particleSize + Math.random() * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    const metrics = ctx.measureText(char);
    currentX += metrics.width + (Math.random() - 0.5) * 2;
  }
}

// EXPERIMENTAL 3: SVG path distortion (convert text to paths, heavily distort)
function drawDistortedPathText(ctx, text, style, x, y) {
  let fontSize, color, distortionAmount;
  
  switch(style) {
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.7)';
      distortionAmount = 5;
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.6)';
      distortionAmount = 3;
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  
  let currentX = x;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += fontSize * 0.4;
      continue;
    }
    
    // Get character outline by drawing to temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = fontSize * 1.5;
    tempCanvas.height = fontSize * 1.5;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = ctx.font;
    tempCtx.textBaseline = 'middle';
    tempCtx.textAlign = 'center';
    tempCtx.fillText(char, tempCanvas.width / 2, tempCanvas.height / 2);
    
    // Get edge pixels and draw as distorted path
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Find edge pixels and draw as wobbly path
    ctx.beginPath();
    let pathStarted = false;
    
    for (let py = 0; py < tempCanvas.height; py++) {
      for (let px = 0; px < tempCanvas.width; px++) {
        const idx = (py * tempCanvas.width + px) * 4;
        const alpha = pixels[idx + 3];
        
        // Check if pixel is on edge (has alpha but neighbor doesn't)
        if (alpha > 128) {
          const worldX = currentX + px - tempCanvas.width / 2;
          const worldY = y + py - tempCanvas.height / 2;
          
          // Add heavy distortion
          const distX = (Math.random() - 0.5) * distortionAmount;
          const distY = (Math.random() - 0.5) * distortionAmount;
          
          if (!pathStarted) {
            ctx.moveTo(worldX + distX, worldY + distY);
            pathStarted = true;
          } else {
            ctx.lineTo(worldX + distX, worldY + distY);
          }
        }
      }
    }
    
    ctx.stroke();
    ctx.fill();
    
    const metrics = ctx.measureText(char);
    currentX += metrics.width + (Math.random() - 0.5) * 3;
  }
}

// EXPERIMENTAL 4: Organic blob letters (abstract shapes that vaguely resemble letters)
function drawOrganicBlobText(ctx, text, style, x, y) {
  let fontSize, color, blobSize;
  
  switch(style) {
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.6)';
      blobSize = 8;
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.5)';
      blobSize = 6;
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  
  let currentX = x;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += fontSize * 0.4;
      continue;
    }
    
    // Get character shape
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = fontSize * 1.5;
    tempCanvas.height = fontSize * 1.5;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = ctx.font;
    tempCtx.textBaseline = 'middle';
    tempCtx.textAlign = 'center';
    tempCtx.fillText(char, tempCanvas.width / 2, tempCanvas.height / 2);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    ctx.fillStyle = color;
    
    // Draw as organic blobs
    for (let py = 0; py < tempCanvas.height; py += 3) {
      for (let px = 0; px < tempCanvas.width; px += 3) {
        const idx = (py * tempCanvas.width + px) * 4;
        const alpha = pixels[idx + 3];
        
        if (alpha > 128 && Math.random() < 0.4) {
          const blobX = currentX + px - tempCanvas.width / 2;
          const blobY = y + py - tempCanvas.height / 2;
          
          // Draw organic blob with noise
          ctx.beginPath();
          const radius = blobSize + Math.random() * 2;
          const segments = 8;
          
          for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * Math.PI * 2;
            const noise = (Math.random() - 0.5) * 2;
            const px = blobX + Math.cos(angle) * (radius + noise);
            const py = blobY + Math.sin(angle) * (radius + noise);
            
            if (s === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    
    const metrics = ctx.measureText(char);
    currentX += metrics.width + (Math.random() - 0.5) * 2;
  }
}

// OLD: Readable hand-drawn text (kept as fallback)
function drawReadableHandDrawnText(ctx, text, style, x, y) {
  let fontSize, color, fontFamily, wobbleAmount, strokeCount;
  
  const fonts = [
    "'Caveat', cursive",
    "'Kalam', cursive", 
    "'Permanent Marker', cursive",
    "'Shadows Into Light', cursive"
  ];
  
  switch(style) {
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.7)';
      fontFamily = "'Courier New', monospace"; // Monospace for messy, urgent feel
      wobbleAmount = 4; // Much more wobble for messy scrawl
      strokeCount = 4; // More overlapping strokes for messy look
      break;
    case 'hand-drawn':
      fontSize = 18;
      color = 'rgba(60, 60, 60, 0.6)';
      fontFamily = fonts[0]; // Caveat - flowing
      wobbleAmount = 1.5;
      strokeCount = 2;
      break;
    case 'organic':
      fontSize = 16;
      color = 'rgba(80, 100, 80, 0.5)';
      fontFamily = fonts[1]; // Kalam - organic
      wobbleAmount = 1.5;
      strokeCount = 2;
      break;
    case 'scratched':
      fontSize = 15;
      color = 'rgba(100, 80, 60, 0.5)';
      fontFamily = fonts[3]; // Shadows Into Light - scratchy
      wobbleAmount = 2;
      strokeCount = 3;
      break;
    case 'whisper':
      fontSize = 14;
      color = 'rgba(100, 100, 100, 0.3)';
      fontFamily = fonts[0]; // Caveat - soft
      wobbleAmount = 1;
      strokeCount = 1;
      break;
    case 'ghost':
      fontSize = 14;
      color = 'rgba(120, 120, 120, 0.25)';
      fontFamily = fonts[0]; // Caveat - faded
      wobbleAmount = 1;
      strokeCount = 1;
      break;
    default:
      fontSize = 18;
      color = 'rgba(60, 60, 60, 0.6)';
      fontFamily = fonts[0];
      wobbleAmount = 1.5;
      strokeCount = 2;
  }
  
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  
  let currentX = x;
  
  // Draw each character with hand-drawn effects
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += fontSize * 0.3;
      continue;
    }
    
    // Style-specific rendering
    if (style === 'scrawled') {
      // Scrawled: messy, urgent, less polished
      for (let stroke = 0; stroke < strokeCount; stroke++) {
        ctx.save();
        
        // Much more wobble and rotation for messy scrawl
        const offsetX = (Math.random() - 0.5) * wobbleAmount;
        const offsetY = (Math.random() - 0.5) * wobbleAmount;
        const rotation = (Math.random() - 0.5) * 8; // More rotation: -4 to +4 degrees
        const scaleX = 0.85 + Math.random() * 0.3; // More scale variation
        const scaleY = 0.85 + Math.random() * 0.3;
        
        ctx.translate(currentX + offsetX, y + offsetY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(scaleX, scaleY);
        
        // Thicker, more opaque strokes for scrawled
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = color;
        ctx.fillText(char, 0, 0);
        
        // Add stroke for some layers to make it bolder/messier
        if (stroke < 2) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1 + Math.random() * 0.5;
          ctx.strokeText(char, 0, 0);
        }
        
        ctx.restore();
      }
    } else {
      // Other styles: subtle hand-drawn effects (nice handwriting)
      for (let stroke = 0; stroke < strokeCount; stroke++) {
        ctx.save();
        
        // Subtle wobble - not too much to keep readable
        const offsetX = (Math.random() - 0.5) * wobbleAmount;
        const offsetY = (Math.random() - 0.5) * wobbleAmount;
        const rotation = (Math.random() - 0.5) * 3; // Small rotation: -1.5 to +1.5 degrees
        const scale = 0.95 + Math.random() * 0.1; // Slight scale variation: 0.95 to 1.05
        
        ctx.translate(currentX + offsetX, y + offsetY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(scale, scale);
        
        // Opacity decreases for overlapping strokes
        ctx.globalAlpha = (color.match(/[\d.]+/g) || [])[3] || 0.5;
        ctx.fillStyle = color;
        ctx.fillText(char, 0, 0);
        
        ctx.restore();
      }
    }
    
    // Measure and move to next character
    const metrics = ctx.measureText(char);
    // More spacing variation for scrawled
    const spacingVariation = style === 'scrawled' ? 3 : 1;
    currentX += metrics.width + (Math.random() - 0.5) * spacingVariation;
  }
}

// EXPERIMENTAL: Shaky hand - draw letters as if written with very shaky hand
function drawShakyHandText(ctx, text, style, x, y) {
  let fontSize, color, shakeAmount;
  
  switch(style) {
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.5)';
      shakeAmount = 4;
      break;
    case 'scratched':
      fontSize = 15;
      color = 'rgba(100, 80, 60, 0.4)';
      shakeAmount = 3;
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.5)';
      shakeAmount = 2;
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  let currentX = x;
  const charSpacing = fontSize * 0.6;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += charSpacing * 0.5;
      continue;
    }
    
    const metrics = ctx.measureText(char);
    const charWidth = metrics.width;
    const charHeight = fontSize;
    
    // Draw character by tracing its outline with shaky hand
    ctx.save();
    ctx.translate(currentX, y);
    
    // Create path by "tracing" the letter with many small shaky strokes
    // Get letter outline by drawing to temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = charWidth + 10;
    tempCanvas.height = charHeight + 10;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = ctx.font;
    tempCtx.textBaseline = 'middle';
    tempCtx.textAlign = 'left';
    tempCtx.fillText(char, 5, tempCanvas.height / 2);
    
    // Get image data and trace outline with shaky strokes
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    // Find edges and draw with shaky hand
    ctx.beginPath();
    let pathStarted = false;
    const step = 2; // Sample every 2 pixels
    
    for (let py = 0; py < tempCanvas.height; py += step) {
      for (let px = 0; px < tempCanvas.width; px += step) {
        const idx = (py * tempCanvas.width + px) * 4;
        const alpha = pixels[idx + 3];
        
        if (alpha > 128) { // Found letter pixel
          // Add shake to position
          const shakeX = (Math.random() - 0.5) * shakeAmount;
          const shakeY = (Math.random() - 0.5) * shakeAmount;
          const worldX = px - tempCanvas.width / 2 + shakeX;
          const worldY = py - tempCanvas.height / 2 + shakeY;
          
          if (!pathStarted) {
            ctx.moveTo(worldX, worldY);
            pathStarted = true;
          } else {
            // Draw wobbly line to next point
            const prevX = worldX - step + (Math.random() - 0.5) * shakeAmount;
            const prevY = worldY + (Math.random() - 0.5) * shakeAmount;
            ctx.quadraticCurveTo(
              prevX + (Math.random() - 0.5) * shakeAmount,
              prevY + (Math.random() - 0.5) * shakeAmount,
              worldX,
              worldY
            );
          }
        }
      }
    }
    
    // Draw multiple overlapping shaky strokes
    for (let layer = 0; layer < 2; layer++) {
      ctx.lineWidth = 1.5 + Math.random() * 1;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      
      // Offset for next layer
      ctx.translate((Math.random() - 0.5) * shakeAmount, (Math.random() - 0.5) * shakeAmount);
    }
    
    ctx.restore();
    
    currentX += charWidth + (Math.random() - 0.5) * 3;
  }
}

// EXPERIMENTAL 1: Rough.js sketchy text - draw letters as wobbly paths
function drawRoughText(ctx, text, style, x, y) {
  if (!window.rough) {
    drawDistortedText(ctx, text, style, x, y);
    return;
  }
  
  const rc = window.rough.canvas(ctx);
  
  let fontSize, color, roughness, bowing, strokeWidth;
  
  switch(style) {
    case 'hand-drawn':
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.5)';
      roughness = 2.5;
      bowing = 2;
      strokeWidth = 1.5;
      break;
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.5)';
      roughness = 5;
      bowing = 4;
      strokeWidth = 2;
      break;
    case 'scratched':
      fontSize = 15;
      color = 'rgba(100, 80, 60, 0.4)';
      roughness = 4;
      bowing = 3;
      strokeWidth = 1.5;
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.5)';
      roughness = 2.5;
      bowing = 2;
      strokeWidth = 1.5;
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  
  let currentX = x;
  const charSpacing = fontSize * 0.6;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += charSpacing * 0.5;
      continue;
    }
    
    const metrics = ctx.measureText(char);
    const charWidth = metrics.width;
    const charHeight = fontSize;
    const charX = currentX;
    const charY = y;
    
    // Draw letter as wobbly path using Rough.js
    // Create path by tracing the letter shape with wobble
    ctx.save();
    ctx.translate(charX, charY);
    
    // Get letter outline by drawing to offscreen canvas and reading pixels
    // OR: Draw letter as wobbly lines based on character type
    drawWobblyLetter(rc, ctx, char, charWidth, charHeight, color, roughness, bowing, strokeWidth);
    
    ctx.restore();
    
    currentX += charWidth + (Math.random() - 0.5) * 3;
  }
}

// Draw individual letter as wobbly path
function drawWobblyLetter(rc, ctx, char, width, height, color, roughness, bowing, strokeWidth) {
  // For each character, draw as wobbly path
  // This is experimental - creating organic letter shapes
  
  const centerX = 0;
  const centerY = 0;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Draw multiple overlapping wobbly strokes
  for (let stroke = 0; stroke < 3; stroke++) {
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetY = (Math.random() - 0.5) * 2;
    const rotation = (Math.random() - 0.5) * 8;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.rotate(rotation * Math.PI / 180);
    
    // Create wobbly path for letter
    // Different approach for different letter types
    if (char.match(/[iIlL1|]/)) {
      // Vertical line letters
      const wobbleAmount = 3;
      const points = [];
      for (let py = -halfHeight; py <= halfHeight; py += 2) {
        points.push([
          (Math.random() - 0.5) * wobbleAmount,
          py + (Math.random() - 0.5) * 1
        ]);
      }
      drawWobblyPath(rc, points, color, roughness, strokeWidth);
    } else if (char.match(/[oO0]/)) {
      // Circular letters - draw as wobbly circle
      const radius = Math.min(halfWidth, halfHeight) * 0.8;
      const segments = 16;
      const points = [];
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const wobble = (Math.random() - 0.5) * 2;
        points.push([
          Math.cos(angle) * (radius + wobble),
          Math.sin(angle) * (radius + wobble)
        ]);
      }
      drawWobblyPath(rc, points, color, roughness, strokeWidth);
    } else {
      // Other letters - draw as wobbly blob/rectangle
      const points = [
        [-halfWidth + (Math.random() - 0.5) * 2, -halfHeight + (Math.random() - 0.5) * 2],
        [halfWidth + (Math.random() - 0.5) * 2, -halfHeight + (Math.random() - 0.5) * 2],
        [halfWidth + (Math.random() - 0.5) * 2, halfHeight + (Math.random() - 0.5) * 2],
        [-halfWidth + (Math.random() - 0.5) * 2, halfHeight + (Math.random() - 0.5) * 2],
      ];
      drawWobblyPath(rc, points, color, roughness, strokeWidth, true);
    }
    
    ctx.restore();
  }
  
  // Also draw actual text faintly behind for readability
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = color;
  ctx.font = `${height}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, 0, 0);
  ctx.restore();
}

function drawWobblyPath(rc, points, color, roughness, strokeWidth, closed = false) {
  if (points.length < 2) return;
  
  // Draw using Rough.js curve
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    rc.line(p1[0], p1[1], p2[0], p2[1], {
      roughness: roughness + Math.random() * 1,
      bowing: roughness * 0.5,
      stroke: color,
      strokeWidth: strokeWidth + Math.random() * 0.5,
    });
  }
  
  if (closed && points.length > 2) {
    const last = points[points.length - 1];
    const first = points[0];
    rc.line(last[0], last[1], first[0], first[1], {
      roughness: roughness + Math.random() * 1,
      bowing: roughness * 0.5,
      stroke: color,
      strokeWidth: strokeWidth + Math.random() * 0.5,
    });
  }
}

// EXPERIMENTAL 2: Organic blob letters
function drawBlobText(ctx, text, style, x, y) {
  let fontSize, color;
  
  switch(style) {
    case 'organic':
      fontSize = 14;
      color = 'rgba(80, 100, 80, 0.4)';
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.5)';
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  
  let currentX = x;
  const charSpacing = fontSize * 0.6;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += charSpacing * 0.5;
      continue;
    }
    
    const metrics = ctx.measureText(char);
    const charWidth = metrics.width;
    const charHeight = fontSize;
    
    // Draw as organic blob shape
    ctx.save();
    ctx.translate(currentX, y);
    ctx.rotate((Math.random() - 0.5) * 10);
    
    // Create blob shape using multiple overlapping circles/ellipses
    ctx.beginPath();
    const segments = 8;
    const baseRadius = charWidth / 2;
    
    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      const radiusVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      const radiusX = baseRadius * radiusVariation;
      const radiusY = charHeight / 2 * radiusVariation;
      
      const px = Math.cos(angle) * radiusX;
      const py = Math.sin(angle) * radiusY;
      
      if (s === 0) {
        ctx.moveTo(px, py);
      } else {
        // Use quadratic curves for smooth but organic shape
        const prevAngle = ((s - 1) / segments) * Math.PI * 2;
        const prevX = Math.cos(prevAngle) * baseRadius;
        const prevY = Math.sin(prevAngle) * (charHeight / 2);
        const cpX = (prevX + px) / 2 + (Math.random() - 0.5) * 3;
        const cpY = (prevY + py) / 2 + (Math.random() - 0.5) * 3;
        ctx.quadraticCurveTo(cpX, cpY, px, py);
      }
    }
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
    
    currentX += charWidth + (Math.random() - 0.5) * 3;
  }
}

// Fallback: Original distorted text method
function drawDistortedText(ctx, text, style, x, y) {
  ctx.save();
  
  let fontSize, color, wobbleAmount, strokeCount, opacity;
  
  switch(style) {
    case 'hand-drawn':
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.5)';
      wobbleAmount = 2;
      strokeCount = 3;
      opacity = 0.5;
      break;
    case 'organic':
      fontSize = 14;
      color = 'rgba(80, 100, 80, 0.4)';
      wobbleAmount = 1.5;
      strokeCount = 2;
      opacity = 0.4;
      break;
    case 'scratched':
      fontSize = 15;
      color = 'rgba(100, 80, 60, 0.4)';
      wobbleAmount = 3;
      strokeCount = 4;
      opacity = 0.4;
      break;
    case 'scrawled':
      fontSize = 18;
      color = 'rgba(80, 60, 40, 0.5)';
      wobbleAmount = 4;
      strokeCount = 5;
      opacity = 0.5;
      break;
    case 'whisper':
      fontSize = 12;
      color = 'rgba(100, 100, 100, 0.25)';
      wobbleAmount = 1;
      strokeCount = 2;
      opacity = 0.25;
      break;
    case 'ghost':
      fontSize = 14;
      color = 'rgba(120, 120, 120, 0.2)';
      wobbleAmount = 1.5;
      strokeCount = 2;
      opacity = 0.2;
      break;
    default:
      fontSize = 16;
      color = 'rgba(60, 60, 60, 0.5)';
      wobbleAmount = 2;
      strokeCount = 3;
      opacity = 0.5;
  }
  
  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textBaseline = 'middle';
  
  let currentX = x;
  const charSpacing = fontSize * 0.6;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += charSpacing * 0.5;
      continue;
    }
    
    for (let stroke = 0; stroke < strokeCount; stroke++) {
      ctx.save();
      
      const offsetX = (Math.random() - 0.5) * wobbleAmount;
      const offsetY = (Math.random() - 0.5) * wobbleAmount;
      const rotation = (Math.random() - 0.5) * 8;
      const scaleX = 0.85 + Math.random() * 0.3;
      const scaleY = 0.85 + Math.random() * 0.3;
      
      ctx.translate(currentX + offsetX, y + offsetY);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.scale(scaleX, scaleY);
      
      ctx.globalAlpha = opacity / strokeCount;
      ctx.fillStyle = color;
      ctx.fillText(char, 0, 0);
      
      if (style === 'scrawled' || style === 'scratched') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.strokeText(char, 0, 0);
      }
      
      ctx.restore();
    }
    
    const metrics = ctx.measureText(char);
    currentX += metrics.width + (Math.random() - 0.5) * 2;
  }
  
  ctx.restore();
}

// ============================================
// EXPERIMENTAL: Stroke-by-stroke drawing
// ============================================

function drawTextWithStrokes(ctx, text, x, y, fontSize) {
  // Draw text character by character using stroke-based method
  let currentX = x;
  const charSpacing = fontSize * 0.6;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      currentX += charSpacing * 0.5;
      continue;
    }
    
    // Draw each character with stroke-based method
    drawLetterStrokes(ctx, char, currentX, y, fontSize);
    
    // Move to next position
    currentX += charSpacing + (Math.random() - 0.5) * 2;
  }
}

function drawLetterStrokes(ctx, char, x, y, fontSize) {
  // Simplified stroke-based drawing - draws letters as actual strokes
  // This is a proof of concept showing the approach
  
  ctx.save();
  ctx.strokeStyle = 'rgba(60, 60, 60, 0.5)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Simple stroke patterns for common characters
  // (In a full implementation, you'd have stroke data for all letters)
  
  if (char === 'I' || char === 'i' || char === 'l' || char === '|') {
    // Vertical line with wobble
    ctx.beginPath();
    const topY = y - fontSize * 0.4;
    const bottomY = y + fontSize * 0.4;
    
    ctx.moveTo(x + (Math.random() - 0.5) * 1, topY);
    for (let py = topY; py <= bottomY; py += 2) {
      const wobble = (Math.random() - 0.5) * 2;
      ctx.lineTo(x + wobble, py);
    }
    ctx.lineWidth = 1.5 + Math.random() * 0.8;
    ctx.stroke();
  } else if (char === 'O' || char === 'o' || char === '0') {
    // Circle with organic wobble
    ctx.beginPath();
    const radius = fontSize * 0.25;
    const segments = 12;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const wobble = (Math.random() - 0.5) * 2;
      const px = x + Math.cos(angle) * (radius + wobble);
      const py = y + Math.sin(angle) * (radius + wobble);
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.lineWidth = 1.5 + Math.random() * 0.8;
    ctx.stroke();
  } else {
    // For other characters, use overlapping fill method
    // (fallback until we have stroke data for all letters)
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.textBaseline = 'middle';
    
    // Multiple overlapping strokes
    for (let stroke = 0; stroke < 4; stroke++) {
      const offsetX = (Math.random() - 0.5) * 3;
      const offsetY = (Math.random() - 0.5) * 3;
      const rotation = (Math.random() - 0.5) * 6;
      const scale = 0.9 + Math.random() * 0.2;
      
      ctx.save();
      ctx.translate(x + offsetX, y + offsetY);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.scale(scale, scale);
      ctx.globalAlpha = 0.3;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }
  
  ctx.restore();
}

// ============================================
// EXPERIMENTAL: Bezier curve letters
// ============================================

function drawBezierLetter(ctx, char, x, y, fontSize) {
  // Draw letter using bezier curves with noise
  // This is a simplified example - would need full letter paths
  
  ctx.beginPath();
  
  // Example: draw 'O' as bezier circle with noise
  if (char === 'O' || char === 'o' || char === '0') {
    const centerX = x;
    const centerY = y;
    const radius = fontSize * 0.3;
    const segments = 8;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const noiseX = (Math.random() - 0.5) * 3;
      const noiseY = (Math.random() - 0.5) * 3;
      const px = centerX + Math.cos(angle) * radius + noiseX;
      const py = centerY + Math.sin(angle) * radius + noiseY;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        // Use quadratic curves for smooth but organic shape
        const prevAngle = ((i - 1) / segments) * Math.PI * 2;
        const prevX = centerX + Math.cos(prevAngle) * radius;
        const prevY = centerY + Math.sin(prevAngle) * radius;
        const cpX = (prevX + px) / 2 + (Math.random() - 0.5) * 2;
        const cpY = (prevY + py) / 2 + (Math.random() - 0.5) * 2;
        ctx.quadraticCurveTo(cpX, cpY, px, py);
      }
    }
    
    ctx.closePath();
    ctx.lineWidth = 2 + Math.random();
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.5)';
    ctx.stroke();
  } else {
    // Fallback to overlapping strokes
    drawHandDrawnText(ctx, char, 'hand-drawn', x, y);
  }
}

// ============================================
// VISUAL STYLE SELECTOR
// ============================================

function initVisualStyleSelector() {
  const buttons = document.querySelectorAll('.style-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      growthState.visualStyle = button.dataset.style;
      updateGrowthVisual();
    });
  });
}

// ============================================
// WINDOW MANAGEMENT
// ============================================

function closeWindow(windowId) {
  const windowEl = document.getElementById(windowId);
  if (windowEl) {
    if (windowId === 'journal-window') {
      // Journal window - just hide it
      windowEl.style.display = 'none';
    } else {
      // Other windows - remove them
      windowEl.style.animation = 'windowOpen 0.3s ease reverse';
      setTimeout(() => windowEl.remove(), 300);
    }
  }
  state.openWindows = state.openWindows.filter(id => id !== windowId);
}

window.closeWindow = closeWindow;

// ============================================
// FILE OPENING
// ============================================

function openFile(file) {
  // Check if this is the journal file
  if (file.isJournal || file.name === 'system_log.txt') {
    openJournal();
    return;
  }
  
  // Normal file opening behavior
  // REMOVED: No notification for opening files
  
  // Simple file preview
  const windowId = generateId('window');
  const windowEl = document.createElement('div');
  windowEl.className = 'window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(200, 450)}px`;
  windowEl.style.top = `${randomInt(100, 300)}px`;
  windowEl.style.width = '400px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">${file.name}</div>
    </div>
    <div style="padding: 20px; color: var(--text-primary); font-size: 11px; line-height: 1.6;">
      <strong>${file.name}</strong><br><br>
      File contents loading...<br><br>
      <em style="color: var(--text-muted); font-size: 9px;">Last accessed: ${new Date().toLocaleTimeString()}</em>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
}

// ============================================
// FILE CONSUMPTION ANIMATION
// ============================================

function animateFileConsumption(fileEl) {
  fileEl.classList.add('consuming');
  
  // Get file position
  const rect = fileEl.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  
  // Choose random destination (edge of screen)
  const destinations = [
    { x: -100, y: window.innerHeight / 2 }, // Left edge
    { x: window.innerWidth + 100, y: window.innerHeight / 2 }, // Right edge
    { x: window.innerWidth / 2, y: -100 }, // Top edge
    { x: window.innerWidth / 2, y: window.innerHeight + 100 }, // Bottom edge
    { x: -100, y: -100 }, // Top-left corner
    { x: window.innerWidth + 100, y: -100 }, // Top-right corner
    { x: -100, y: window.innerHeight + 100 }, // Bottom-left corner
    { x: window.innerWidth + 100, y: window.innerHeight + 100 }, // Bottom-right corner
  ];
  
  const dest = randomChoice(destinations);
  
  // Calculate distance and duration
  const distance = Math.sqrt(
    Math.pow(dest.x - startX, 2) + Math.pow(dest.y - startY, 2)
  );
  const duration = Math.max(800, Math.min(1500, distance * 1.5)); // 800-1500ms
  
  // Animate file being dragged
  fileEl.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
  fileEl.style.transform = `translate(${dest.x - startX}px, ${dest.y - startY}px) scale(0.3) rotate(${Math.random() * 360}deg)`;
  fileEl.style.opacity = '0';
}

// ============================================
// PLANT-BASED VISUAL EFFECTS (using visual-toolkit)
// ============================================

let plantEffectsCanvas = null;
let plantEffectsCtx = null;
let plantEffectsInitialized = false;
let activeRoots = [];
let activeLeaves = [];
let activeVines = [];
let time = 0;

function initPlantEffects() {
  plantEffectsCanvas = document.getElementById('plant-effects-canvas');
  if (!plantEffectsCanvas) {
    console.warn('[Plant Effects] Canvas element not found');
    return;
  }
  
  plantEffectsCtx = plantEffectsCanvas.getContext('2d');
  
  // Set canvas size (library now handles large sizes internally with scaling)
  function resizeCanvas() {
    plantEffectsCanvas.width = window.innerWidth;
    plantEffectsCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    repositionFilesOnResize(); // Reposition files on mobile orientation change
  });
  
  // Check if visual-toolkit is available
  if (typeof VisualToolkit === 'undefined') {
    console.warn('[Plant Effects] VisualToolkit is not defined. Library may not have loaded yet.');
    plantEffectsCanvas.style.display = 'none';
    return;
  }
  
  if (!VisualToolkit.themes?.livingOs) {
    console.warn('[Plant Effects] VisualToolkit.themes.livingOs not found. Available themes:', Object.keys(VisualToolkit.themes || {}));
    plantEffectsCanvas.style.display = 'none';
    return;
  }
  
  plantEffectsInitialized = true;
  
  // Initialize plant elements
  initializePlantElements();
  
  // Start animation loop
  animatePlantEffects();
  
  console.log('[Plant Effects] Initialized successfully', {
    hasTextures: !!VisualToolkit.themes.livingOs.textures,
    hasGrowth: !!VisualToolkit.themes.livingOs.growth,
    hasPlants: !!VisualToolkit.themes.livingOs.plants,
    hasColors: !!VisualToolkit.themes.livingOs.colors,
    hasMotion: !!VisualToolkit.themes.livingOs.motion
  });
}

// Helper function to convert color object to CSS color string
// Use hex format to avoid library concatenation issues with rgb/rgba
function colorObjectToString(color) {
  // If it's already a string, try to convert to hex
  if (typeof color === 'string') {
    // If it's already hex, return it
    if (color.startsWith('#')) {
      return color;
    }
    // If it's rgb/rgba, extract values and convert to hex
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    // Clean and return as-is if we can't parse it
    return color.replace(/\)[^)]*$/, ')');
  }
  
  // If it's an object, convert to hex
  if (typeof color === 'object' && color !== null) {
    if ('r' in color && 'g' in color && 'b' in color) {
      const r = Math.round(Number(color.r));
      const g = Math.round(Number(color.g));
      const b = Math.round(Number(color.b));
      
      // Convert to hex (more reliable than rgb for this library)
      const toHex = (n) => {
        const hex = Math.max(0, Math.min(255, n)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }
  
  // Fallback
  return '#3d2817';
}

function animatePlantEffects() {
  if (!plantEffectsInitialized || !plantEffectsCtx || !plantEffectsCanvas) {
    if (!plantEffectsInitialized) console.warn('[Plant Effects] Not initialized');
    if (!plantEffectsCtx) console.warn('[Plant Effects] No context');
    if (!plantEffectsCanvas) console.warn('[Plant Effects] No canvas');
    return;
  }
  
  try {
    time += 0.016; // ~60fps
    
    // Clear canvas
    plantEffectsCtx.clearRect(0, 0, plantEffectsCanvas.width, plantEffectsCanvas.height);
    
    // Check if library is available
    if (typeof VisualToolkit === 'undefined' || !VisualToolkit.themes?.livingOs) {
      console.warn('[Plant Effects] VisualToolkit.themes.livingOs not available');
      return;
    }
    
    const livingOs = VisualToolkit.themes.livingOs;
    
    // Draw background bark texture (subtle)
    // Now safe with v2.1.1+ memory fixes (automatic scaling for large canvases)
    if (growthState.level > 20) {
      const textureOpacity = Math.min(0.15, (growthState.level - 20) / 100);
      plantEffectsCtx.save();
      plantEffectsCtx.globalAlpha = textureOpacity;
      try {
        if (!livingOs.textures?.drawBarkTexture) {
          console.warn('[Plant Effects] drawBarkTexture not available');
        } else {
          livingOs.textures.drawBarkTexture(plantEffectsCtx, {
            width: plantEffectsCanvas.width,
            height: plantEffectsCanvas.height,
            grainDirection: 'vertical',
            roughness: 0.3,
            color: '#3d2817'
          });
        }
      } catch (error) {
        console.warn('[Plant Effects] Bark texture failed:', error);
      }
      plantEffectsCtx.restore();
    }
  
    // Draw growing roots from edges (based on growth level)
    if (growthState.level > 30) {
      const rootLength = (growthState.level - 30) / 70; // 0-1 as growth goes from 30-100
      
      activeRoots.forEach(root => {
        try {
          const colorObj = livingOs.colors.getGrowthColor(growthState.level, 'bark');
          let colorStr = colorObjectToString(colorObj);
          
          // Aggressively clean the color string - remove ANY trailing characters after closing paren
          // This handles cases where alpha or other values get concatenated
          const cleanMatch = colorStr.match(/(rgb\([^)]+\)|rgba\([^)]+\)|#[0-9a-fA-F]{3,6})/);
          if (cleanMatch) {
            colorStr = cleanMatch[1];
          } else {
            // If no valid color format found, use fallback
            console.warn('[Plant Effects] Could not extract valid color from:', colorStr, 'using fallback');
            colorStr = '#3d2817';
          }
          
          livingOs.growth.drawGrowingRoots(plantEffectsCtx, {
            origin: root.origin,
            direction: root.direction,
            length: rootLength * root.maxLength,
            branches: root.branches,
            thickness: root.thickness,
            color: colorStr
          });
        } catch (error) {
          // Log the actual color string that caused the error
          const colorObj = livingOs.colors.getGrowthColor(growthState.level, 'bark');
          const colorStr = colorObjectToString(colorObj);
          console.warn('[Plant Effects] Root drawing failed:', error.message, 'Color object:', colorObj, 'Color string:', colorStr);
        }
      });
    }
    
    // Draw vines along edges (moderate growth)
    // Library v2.1.2+ fixes: color concatenation bug and path validation
    if (growthState.level > 50) {
      const vineLength = (growthState.level - 50) / 50; // 0-1 as growth goes from 50-100
      
      activeVines.forEach(vine => {
        try {
          // Library expects origin, not start/end
          if (!vine.start || typeof vine.start.x !== 'number' || typeof vine.start.y !== 'number') {
            return;
          }
          
          const colorObj = livingOs.colors.getGrowthColor(growthState.level, 'foliage');
          
          // Build path from start to end, scaled by vineLength (optional - library will generate if not provided)
          let path = undefined;
          if (vine.end && typeof vine.end.x === 'number' && typeof vine.end.y === 'number') {
            // Create a path scaled by vineLength
            const segments = Math.max(2, Math.floor(vineLength * 15));
            path = [];
            for (let i = 0; i <= segments; i++) {
              const t = segments > 0 ? i / segments : 0;
              const scaledT = t * vineLength;
              const x = vine.start.x + (vine.end.x - vine.start.x) * scaledT;
              const y = vine.start.y + (vine.end.y - vine.start.y) * scaledT;
              // Add organic waviness
              const wave = Math.sin(scaledT * Math.PI * 3) * 8;
              path.push({ x: x + wave, y: y });
            }
          }
          
          livingOs.growth.drawVines(plantEffectsCtx, {
            origin: { x: vine.start.x, y: vine.start.y },
            length: vineLength,
            thickness: vine.thickness || 2,
            color: colorObjectToString(colorObj),
            path: path // Optional - library will validate and generate if needed
          });
        } catch (error) {
          console.warn('[Plant Effects] Vine drawing failed:', error);
        }
      });
    }
    
    // Draw drifting leaves (all growth levels, more at higher levels)
    // Limit leaf count to prevent memory issues
    const maxLeaves = 10; // Reduced from 15
    const leafCount = Math.min(maxLeaves, Math.floor((growthState.level / 100) * maxLeaves));
  
    // Update existing leaves
    activeLeaves = activeLeaves.filter(leaf => {
      try {
        // Update drift
        const drift = livingOs.motion.calculateDrift(time + leaf.timeOffset, leaf.driftSpeed);
        leaf.x += drift.x;
        leaf.y += drift.y;
        
        // Remove if off-screen
        if (leaf.x < -50 || leaf.x > plantEffectsCanvas.width + 50 ||
            leaf.y < -50 || leaf.y > plantEffectsCanvas.height + 50) {
          return false;
        }
        
        // Draw leaf
        plantEffectsCtx.save();
        plantEffectsCtx.globalAlpha = leaf.opacity;
        const colorObj = livingOs.colors.getGrowthColor(growthState.level, 'foliage');
        livingOs.plants.drawLeaf(plantEffectsCtx, {
          x: leaf.x,
          y: leaf.y,
          size: leaf.size,
          rotation: leaf.rotation + drift.rotation,
          type: leaf.type,
          color: colorObjectToString(colorObj)
        });
        plantEffectsCtx.restore();
        
        return true;
      } catch (error) {
        console.warn('[Plant Effects] Leaf drawing failed:', error);
        return false; // Remove leaf on error
      }
    });
    
    // Add new leaves if needed (with limit)
    while (activeLeaves.length < leafCount && growthState.level > 10 && activeLeaves.length < maxLeaves) {
      try {
        addNewLeaf();
      } catch (error) {
        console.warn('[Plant Effects] Failed to add leaf:', error);
        break; // Stop trying if we hit memory issues
      }
    }
    
    requestAnimationFrame(animatePlantEffects);
  } catch (error) {
    if (error.message && error.message.includes('Array buffer allocation')) {
      console.error('[Plant Effects] Memory allocation failed - disabling plant effects');
      plantEffectsInitialized = false;
      // Clear canvas
      if (plantEffectsCtx && plantEffectsCanvas) {
        plantEffectsCtx.clearRect(0, 0, plantEffectsCanvas.width, plantEffectsCanvas.height);
      }
      return; // Stop animation
    }
    console.error('[Plant Effects] Animation error:', error);
    requestAnimationFrame(animatePlantEffects); // Continue on other errors
  }
}

function initializePlantElements() {
  if (!plantEffectsCanvas || !plantEffectsCtx) return;
  
  // Check if visual-toolkit is available
  if (typeof VisualToolkit === 'undefined' || !VisualToolkit.themes?.livingOs) {
    console.warn('[Plant Effects] Visual Toolkit not available for element initialization');
    return;
  }
  
  const livingOs = VisualToolkit.themes.livingOs;
  
  try {
    // Initialize roots from edges
    activeRoots = [
      { origin: { x: 0, y: window.innerHeight }, direction: 'up', maxLength: 0.3, branches: 2, thickness: 3 },
      { origin: { x: window.innerWidth, y: window.innerHeight }, direction: 'up', maxLength: 0.3, branches: 2, thickness: 3 },
      { origin: { x: 0, y: 0 }, direction: 'down', maxLength: 0.25, branches: 1, thickness: 2 },
      { origin: { x: window.innerWidth, y: 0 }, direction: 'down', maxLength: 0.25, branches: 1, thickness: 2 },
    ];
    
    // Initialize vines along edges
    activeVines = [
      { start: { x: 0, y: window.innerHeight * 0.3 }, end: { x: window.innerWidth, y: window.innerHeight * 0.3 }, branches: 3, thickness: 2 },
      { start: { x: 0, y: window.innerHeight * 0.7 }, end: { x: window.innerWidth, y: window.innerHeight * 0.7 }, branches: 2, thickness: 2 },
    ];
    
    // Initialize some initial leaves
    activeLeaves = [];
    for (let i = 0; i < 5; i++) {
      addNewLeaf();
    }
  } catch (error) {
    console.error('[Plant Effects] Failed to initialize elements:', error);
    // Clear arrays on failure
    activeRoots = [];
    activeVines = [];
    activeLeaves = [];
  }
}

function addNewLeaf() {
  const types = ['simple', 'veined', 'organic'];
  activeLeaves.push({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * 50, // Start above screen
    size: 15 + Math.random() * 20,
    rotation: Math.random() * Math.PI * 2,
    type: types[Math.floor(Math.random() * types.length)],
    driftSpeed: 0.3 + Math.random() * 0.5,
    timeOffset: Math.random() * 100,
    opacity: 0.4 + Math.random() * 0.4
  });
}

// ============================================
// LINE DRAWINGS SYSTEM
// ============================================

let lineDrawingsCanvas = null;
let lineDrawingsCtx = null;
let activeDrawings = [];

function initLineDrawings() {
  lineDrawingsCanvas = document.getElementById('line-drawings-canvas');
  if (!lineDrawingsCanvas) return;
  
  lineDrawingsCtx = lineDrawingsCanvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    lineDrawingsCanvas.width = window.innerWidth;
    lineDrawingsCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    repositionFilesOnResize(); // Reposition files on mobile orientation change
  });
  
  // Clear canvas initially
  lineDrawingsCtx.clearRect(0, 0, lineDrawingsCanvas.width, lineDrawingsCanvas.height);
}

// Line Companion Creature (based on generic-companion LineCompanion)
// Draws the same creature but with different expressions (normal, hungry, angry)
function drawLineCompanion(ctx, x, y, size, expression = 'normal', breatheAmount = 0) {
  // Stroke style matching LineCompanion exactly
  const strokeColor = '#1a1a1a';
  const strokeWidth = 2.5;
  
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Scale factor (size is the width/height of the creature)
  // Original SVG viewBox is 150x150, center is at (75, 75)
  const scale = size / 150;
  
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.scale(scale, scale);
  
  // Head (matching original SVG path exactly)
  // Original: M 75 ${25 - breatheAmount} C 115 ${25 - breatheAmount}, 130 60, 130 85
  //           C 130 115, 110 ${130 + breatheAmount}, 75 ${130 + breatheAmount}
  //           C 40 ${130 + breatheAmount}, 20 115, 20 85
  //           C 20 60, 35 ${25 - breatheAmount}, 75 ${25 - breatheAmount}
  ctx.beginPath();
  ctx.moveTo(75, 25 - breatheAmount);
  ctx.bezierCurveTo(115, 25 - breatheAmount, 130, 60, 130, 85);
  ctx.bezierCurveTo(130, 115, 110, 130 + breatheAmount, 75, 130 + breatheAmount);
  ctx.bezierCurveTo(40, 130 + breatheAmount, 20, 115, 20, 85);
  ctx.bezierCurveTo(20, 60, 35, 25 - breatheAmount, 75, 25 - breatheAmount);
  ctx.stroke();
  
  // Eyes (matching original positions: cx="55" cy="70" and cx="95" cy="70")
  const leftEyeX = 55;
  const rightEyeX = 95;
  const eyeY = 70;
  const eyeRadius = expression === 'angry' ? 8 : 6;
  const pupilRadius = 2.5;
  
  // Left eye
  ctx.beginPath();
  ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Right eye
  ctx.beginPath();
  ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Pupils (slightly offset based on expression)
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  
  if (expression === 'hungry') {
    // Eyes look down slightly
    pupilOffsetY = 1;
  } else if (expression === 'angry') {
    // Eyes look forward/intense
    pupilOffsetY = -0.5;
  }
  
  ctx.beginPath();
  ctx.arc(leftEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(rightEyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyebrows (for angry/hungry expressions)
  // Original eyebrow paths: M 45 58 Q 55 54, 65 58 and M 85 58 Q 95 54, 105 58
  if (expression === 'angry') {
    // Angry eyebrows (downward V, more intense)
    ctx.beginPath();
    ctx.moveTo(45, 55);
    ctx.quadraticCurveTo(55, 50, 65, 55);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(85, 55);
    ctx.quadraticCurveTo(95, 50, 105, 55);
    ctx.stroke();
  } else if (expression === 'hungry') {
    // Slightly raised eyebrows (concerned look)
    ctx.beginPath();
    ctx.moveTo(45, 56);
    ctx.quadraticCurveTo(55, 52, 65, 56);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(85, 56);
    ctx.quadraticCurveTo(95, 52, 105, 56);
    ctx.stroke();
  }
  
  // Mouth (varies by expression, matching original paths)
  // Original normal: M 60 93 Q 75 102, 90 93
  ctx.beginPath();
  if (expression === 'hungry') {
    // Open mouth (hungry/devouring) - like the "poked" state
    ctx.moveTo(62, 95);
    ctx.quadraticCurveTo(75, 105, 88, 95);
    ctx.quadraticCurveTo(88, 110, 75, 110);
    ctx.quadraticCurveTo(62, 110, 62, 95);
    ctx.fill(); // Fill for open mouth
  } else if (expression === 'angry') {
    // Angry frown (inverted smile)
    ctx.moveTo(60, 95);
    ctx.quadraticCurveTo(75, 88, 90, 95);
    ctx.stroke();
  } else {
    // Normal smile
    ctx.moveTo(60, 93);
    ctx.quadraticCurveTo(75, 102, 90, 93);
    ctx.stroke();
  }
  
  // Shoulders (matching original: M 45 ${125 + breatheAmount} Q 75 ${140 + breatheAmount}, 105 ${125 + breatheAmount})
  ctx.beginPath();
  ctx.moveTo(45, 125 + breatheAmount);
  ctx.quadraticCurveTo(75, 140 + breatheAmount, 105, 125 + breatheAmount);
  ctx.stroke();
  
  ctx.restore();
}

function addLineDrawing(expression, x, y, size, duration = 8000) {
  if (!lineDrawingsCtx) return;
  
  const drawing = {
    expression, // 'normal', 'hungry', 'angry'
    x,
    y,
    size,
    opacity: 0,
    breathe: 0,
    startTime: Date.now(),
    duration,
    animationFrame: null,
  };
  
  activeDrawings.push(drawing);
  
  // Breathing animation
  const animate = () => {
    drawing.breathe = (Date.now() - drawing.startTime) / 1000;
    drawing.animationFrame = requestAnimationFrame(animate);
    redrawLineDrawings();
  };
  drawing.animationFrame = requestAnimationFrame(animate);
  
  // Fade in
  const fadeIn = setInterval(() => {
    drawing.opacity = Math.min(1, drawing.opacity + 0.05);
    if (drawing.opacity >= 1) {
      clearInterval(fadeIn);
    }
  }, 50);
  
  // Remove after duration
  setTimeout(() => {
    const index = activeDrawings.indexOf(drawing);
    if (index > -1) {
      // Cancel animation
      if (drawing.animationFrame) {
        cancelAnimationFrame(drawing.animationFrame);
      }
      
      // Fade out
      const fadeOut = setInterval(() => {
        drawing.opacity = Math.max(0, drawing.opacity - 0.05);
        if (drawing.opacity <= 0) {
          clearInterval(fadeOut);
          activeDrawings.splice(index, 1);
          redrawLineDrawings();
        }
      }, 50);
    }
  }, duration);
  
  redrawLineDrawings();
}

function redrawLineDrawings() {
  if (!lineDrawingsCtx || !lineDrawingsCanvas) return;
  
  // Clear canvas
  lineDrawingsCtx.clearRect(0, 0, lineDrawingsCanvas.width, lineDrawingsCanvas.height);
  
  // Draw all active drawings
  activeDrawings.forEach(drawing => {
    lineDrawingsCtx.save();
    lineDrawingsCtx.globalAlpha = drawing.opacity * 0.8;
    
    // Calculate breathing amount (subtle breathing animation)
    const breatheAmount = Math.sin(drawing.breathe * 1.5) * 3;
    
    // Draw the companion creature
    drawLineCompanion(
      lineDrawingsCtx,
      drawing.x,
      drawing.y,
      drawing.size,
      drawing.expression,
      breatheAmount
    );
    
    lineDrawingsCtx.restore();
  });
}

// Trigger line drawings based on growth level
function triggerLineDrawing() {
  if (!lineDrawingsCtx) return;
  
  // Expression based on growth level
  let expression = 'normal';
  if (growthState.level > 70) {
    expression = randomChoice(['hungry', 'angry']); // More unsettling at high growth
  } else if (growthState.level > 50) {
    expression = randomChoice(['normal', 'hungry']); // Occasional hungry
  }
  
  // Random position (avoid edges)
  const margin = 120;
  const size = randomInt(80, 140); // Creature size
  const x = randomInt(margin, window.innerWidth - margin - size);
  const y = randomInt(margin, window.innerHeight - margin - size);
  
  // Duration based on growth level (longer = more unsettling)
  const duration = growthState.level > 70 ? 12000 : 8000;
  
  addLineDrawing(expression, x, y, size, duration);
}

// ============================================
// DEBUG MODE - Auto-escalate through growth levels
// ============================================

let debugMode = false;
let debugInterval = null;

function startDebugMode() {
  if (debugMode) {
    console.log('[Debug] Already in debug mode');
    return;
  }
  
  debugMode = true;
  console.log('[Debug] Starting debug mode - cycling through growth levels 0-100 over 60 seconds');
  
  // Reset growth state
  growthState.level = 0;
  growthState.startTime = Date.now();
  
  // Update audio immediately
  if (ambience && audioInitialized) {
    ambience.updateGrowthLevel(0);
  }
  if (sfx && audioInitialized) {
    sfx.setGrowthLevel(0);
  }
  
  // Cycle through 0-100 over 60 seconds (60000ms)
  const duration = 60000; // 60 seconds
  const steps = 100; // 0 to 100
  const stepDuration = duration / steps; // 600ms per step
  
  let currentStep = 0;
  
  debugInterval = setInterval(() => {
    currentStep++;
    const newLevel = Math.min(100, currentStep);
    
    // Set growth level directly
    growthState.level = newLevel;
    
    // Update audio (with error handling for memory issues)
    if (ambience && audioInitialized) {
      try {
        ambience.updateGrowthLevel(newLevel);
      } catch (error) {
        if (error.name === 'NotSupportedError' || error.message.includes('createBuffer')) {
          console.warn('[Debug] Audio buffer creation failed - disabling audio');
          audioInitialized = false;
        }
      }
    }
    if (sfx && audioInitialized) {
      try {
        sfx.setGrowthLevel(newLevel);
      } catch (error) {
        if (error.name === 'NotSupportedError' || error.message.includes('createBuffer')) {
          console.warn('[Debug] Audio buffer creation failed - disabling audio');
          audioInitialized = false;
        }
      }
    }
    
    // Update growth indicator
    const growthBar = document.getElementById('hunger-bar');
    if (growthBar) {
      growthBar.style.width = `${newLevel}%`;
      if (newLevel > 70) {
        growthBar.style.background = 'linear-gradient(90deg, var(--hunger-satiated) 0%, var(--hunger-hungry) 50%, var(--hunger-starving) 100%)';
      } else if (newLevel > 40) {
        growthBar.style.background = 'linear-gradient(90deg, var(--hunger-satiated) 0%, var(--hunger-hungry) 100%)';
      }
    }
    
    // Log progress every 10 levels
    if (newLevel % 10 === 0) {
      console.log(`[Debug] Growth level: ${newLevel}%`);
    }
    
    // Trigger growth behaviors (but more frequently for debug)
    handleGrowthBehaviors();
    
    // Stop at 100
    if (newLevel >= 100) {
      stopDebugMode();
      console.log('[Debug] Debug mode complete - reached 100%');
    }
  }, stepDuration);
}

function stopDebugMode() {
  if (!debugMode) return;

  debugMode = false;
  if (debugInterval) {
    clearInterval(debugInterval);
    debugInterval = null;
  }

  console.log('[Debug] Debug mode stopped');
}

// Set growth level directly (for testing)
function setGrowthLevel(newLevel) {
  newLevel = Math.max(0, Math.min(100, newLevel));
  growthState.level = newLevel;

  // Update audio
  if (ambience && audioInitialized) {
    try {
      ambience.updateGrowthLevel(newLevel);
    } catch (error) {
      console.warn('[Debug] Audio update failed:', error.message);
    }
  }
  if (sfx && audioInitialized) {
    try {
      sfx.setGrowthLevel(newLevel);
    } catch (error) {
      console.warn('[Debug] SFX update failed:', error.message);
    }
  }

  // Update growth indicator
  const growthBar = document.getElementById('hunger-bar');
  if (growthBar) {
    growthBar.style.width = `${newLevel}%`;
  }

  // Clear font cache so new font loads
  fontCache.clear();

  console.log(`[Debug] Growth level set to ${newLevel}% - Font: ${getGrowthLevelFont().name}`);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  // Initialize growth state
  growthState.startTime = Date.now();
  
  // Initialize line drawings system
  initLineDrawings();
  
  // Initialize plant-based visual effects (optional - will gracefully fail if visual-toolkit has issues)
  // Wait for visual-toolkit to load before initializing (scripts load asynchronously)
  let waitAttempts = 0;
  const maxWaitAttempts = 50; // 5 seconds max (50 * 100ms)
  
  function waitForVisualToolkit() {
    waitAttempts++;
    
    // Check multiple possible global names the library might use
    const toolkit = window.VisualToolkit || window.visualToolkit || window.VisualToolkitLibrary;
    
    // Check if VisualToolkit is defined (must check typeof first to avoid ReferenceError)
    if (typeof toolkit !== 'undefined') {
      // Now safe to check themes
      if (toolkit.themes?.livingOs) {
        try {
          // Make sure VisualToolkit is available globally for initPlantEffects
          if (!window.VisualToolkit) {
            window.VisualToolkit = toolkit;
          }
          initPlantEffects();
        } catch (error) {
          console.warn('[Living OS] Plant effects initialization failed (non-critical):', error);
          // Hide plant effects canvas if it exists
          const plantCanvas = document.getElementById('plant-effects-canvas');
          if (plantCanvas) {
            plantCanvas.style.display = 'none';
          }
        }
        return; // Success, stop retrying
      } else {
        // Library loaded but livingOs theme not found
        console.warn('[Living OS] Visual Toolkit loaded but livingOs theme not found. Available themes:', Object.keys(toolkit.themes || {}));
      }
    }
    
    // Retry if we haven't exceeded max attempts
    if (waitAttempts < maxWaitAttempts) {
      setTimeout(waitForVisualToolkit, 100);
    } else {
      // Give up after max attempts - check if script tag exists and log more info
      const scriptTag = document.querySelector('script[src*="visual-toolkit"]');
      
      // Check if script loaded successfully
      const scriptLoaded = scriptTag?.complete || scriptTag?.readyState === 'complete' || scriptTag?.readyState === 'loaded';
      
      // Check for any errors in the script
      const scriptError = scriptTag?.onerror ? 'Script has error handler' : null;
      
      console.warn('[Living OS] Visual Toolkit library did not load within 5 seconds. Plant effects disabled.', {
        scriptTagFound: !!scriptTag,
        scriptSrc: scriptTag?.src,
        scriptLoaded: scriptLoaded,
        scriptReadyState: scriptTag?.readyState,
        VisualToolkit: typeof window.VisualToolkit,
        visualToolkit: typeof window.visualToolkit,
        VisualToolkitLibrary: typeof window.VisualToolkitLibrary,
        windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('visual') || k.toLowerCase().includes('toolkit')),
        allWindowKeys: Object.keys(window).slice(0, 50) // First 50 keys to see what's available
      });
      
      // Try to manually check if script loaded by fetching it
      if (scriptTag?.src) {
        fetch(scriptTag.src)
          .then(response => {
            if (response.ok) {
              console.log('[Living OS] Script URL is accessible:', scriptTag.src);
            } else {
              console.error('[Living OS] Script URL returned error:', response.status, response.statusText);
            }
          })
          .catch(error => {
            console.error('[Living OS] Failed to fetch script:', error);
          });
      }
      
      const plantCanvas = document.getElementById('plant-effects-canvas');
      if (plantCanvas) {
        plantCanvas.style.display = 'none';
      }
    }
  }
  
  // Start waiting for the library
  waitForVisualToolkit();
  
  // Add initial files
  INITIAL_FILES.forEach(file => {
    addFile(file);
  });
  
  // Add initial journal entries
  addJournalEntry("System initialized. Field Station OS ready.");
  addJournalEntry("Welcome back, " + CHARACTER_NAME + ".");
  
  // Start growth system (subtle, gradual) - but pause if in debug mode
  if (!debugMode) {
    setInterval(updateGrowth, 1000);
  }
  
  // REMOVED: No initial notification - messages go to journal only
  
  // Visual growth updates removed - clean baseline
  
  console.log('[Living OS] Initialized - Normal operating system');
  console.log('[Debug] Type LivingOS.startDebugMode() to cycle through growth levels 0-100 over 60 seconds');
  console.log('[Font Debug] Type LivingOS.fontDebug.interactiveTest() to test font suggestions interactively');
  console.log('[Font Debug] Or use:');
  console.log('  - LivingOS.fontDebug.testSuggestion("hand-drawn readable unsettling")');
  console.log('  - LivingOS.fontDebug.refineSuggestion("hand-drawn", { rejectedFont: "Caveat", negativeAspects: ["too casual"], positiveAspects: ["gothic", "ornate"] })');
}

// Start the OS
document.addEventListener('DOMContentLoaded', init);

// Expose API
// Font suggestion debug/testing interface
window.LivingOSFontDebug = {
  // Parse natural language feedback into structured format
  parseFeedback(feedbackText, currentFontName) {
    const feedback = {
      rejectedFont: currentFontName || null,
      negativeAspects: [],
      positiveAspects: []
    };
    
    const text = feedbackText.toLowerCase();
    
    // Common negative indicators
    const negativePatterns = [
      /(?:too|very|extremely|really)\s+(\w+)/g,
      /(?:not|don't|doesn't|isn't|aren't)\s+(\w+)/g,
      /(?:hate|dislike|don't like|bad|wrong|terrible|awful)\s+(\w+)/g,
      /(?:less|without|no|lacks?)\s+(\w+)/g
    ];
    
    // Common positive indicators
    const positivePatterns = [
      /(?:want|need|prefer|like|love|more|should be|should have)\s+(\w+)/g,
      /(?:with|has|have|includes?|contains?)\s+(\w+)/g,
      /(?:gothic|ornate|striking|bold|elegant|readable|clear|simple|casual|formal|decorative|hand-drawn|tech|terminal|monospace|futuristic|retro|horror)/g
    ];
    
    // Extract negative aspects
    negativePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const word = match[1] || match[0];
        if (word && word.length > 2 && !feedback.negativeAspects.includes(word)) {
          feedback.negativeAspects.push(word);
        }
      }
    });
    
    // Extract positive aspects
    positivePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const word = match[1] || match[0];
        if (word && word.length > 2 && !feedback.positiveAspects.includes(word)) {
          feedback.positiveAspects.push(word);
        }
      }
    });
    
    // Look for explicit font name rejection
    const fontNameMatch = text.match(/(?:reject|don't want|hate|dislike|not)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (fontNameMatch) {
      feedback.rejectedFont = fontNameMatch[1];
    }
    
    // Look for "instead" or "rather" patterns
    const insteadMatch = text.match(/(?:instead|rather|prefer|want)\s+(.+?)(?:\.|$)/);
    if (insteadMatch) {
      const preferred = insteadMatch[1].toLowerCase();
      // Extract keywords from preferred description
      const keywords = preferred.match(/\b(gothic|ornate|striking|bold|elegant|readable|clear|simple|casual|formal|decorative|hand-drawn|tech|terminal|monospace|futuristic|retro|horror|dark|light|heavy|thin)\b/g);
      if (keywords) {
        keywords.forEach(kw => {
          if (!feedback.positiveAspects.includes(kw)) {
            feedback.positiveAspects.push(kw);
          }
        });
      }
    }
    
    // Clean up - remove common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'as', 'it', 'this', 'that', 'these', 'those'];
    feedback.negativeAspects = feedback.negativeAspects.filter(w => !stopWords.includes(w));
    feedback.positiveAspects = feedback.positiveAspects.filter(w => !stopWords.includes(w));
    
    return feedback;
  },
  
  // Wait for typography toolkit to load
  async waitForTypographyToolkit(maxWaitAttempts = 50) {
    let waitAttempts = 0;
    
    while (waitAttempts < maxWaitAttempts) {
      const TypographyToolkit = window.TypographyToolkit || window.typographyToolkit;
      const AnimatedText = window.AnimatedText || TypographyToolkit?.AnimatedText;
      const suggestFont = TypographyToolkit?.suggestFont || window.suggestFont;
      
      if (AnimatedText && suggestFont) {
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      waitAttempts++;
    }
    
    return false;
  },
  
  // Test font suggestion with custom description
  async testSuggestion(description) {
    // Wait for library to load
    const loaded = await this.waitForTypographyToolkit();
    if (!loaded) {
      console.error('[Font Debug] typography-toolkit not loaded after waiting');
      console.error('[Font Debug] Check browser console for script loading errors');
      console.error('[Font Debug] Script should be at: https://unpkg.com/typography-toolkit@latest/dist/typography-toolkit.umd.js');
      console.error('[Font Debug] Make sure you have v1.2.0+ which includes font suggestion features');
      
      // Show what's actually available
      console.log('[Font Debug] window.TypographyToolkit:', typeof window.TypographyToolkit);
      console.log('[Font Debug] window.AnimatedText:', typeof window.AnimatedText);
      console.log('[Font Debug] All window keys:', Object.keys(window).filter(k => 
        k.toLowerCase().includes('font') || 
        k.toLowerCase().includes('typography') ||
        k.toLowerCase().includes('suggest') ||
        k.toLowerCase().includes('refine')
      ));
      
      return null;
    }
    
    // Check multiple possible global names
    const TypographyToolkit = window.TypographyToolkit || window.typographyToolkit || window;
    const suggestFont = TypographyToolkit?.suggestFont || window.suggestFont;
    const suggestFonts = TypographyToolkit?.suggestFonts || window.suggestFonts;
    const loadGoogleFont = TypographyToolkit?.loadGoogleFont || window.loadGoogleFont;
    const getFontFamily = TypographyToolkit?.getFontFamily || window.getFontFamily;
    
    if (!suggestFont) {
      console.error('[Font Debug] suggestFont not found even after library loaded');
      console.error('[Font Debug] TypographyToolkit object:', TypographyToolkit);
      console.error('[Font Debug] TypographyToolkit keys:', TypographyToolkit ? Object.keys(TypographyToolkit).slice(0, 20) : 'null');
      return null;
    }
    
    console.log(`[Font Debug] Testing suggestion for: "${description}"`);

    // Get single best match
    const single = suggestFont(description);
    console.log('[Font Debug] Single best match:', single);

    // Get top 3 matches
    const top3 = suggestFonts(description, 3);
    console.log('[Font Debug] Top 3 matches:', top3);

    // Load and display the best match
    let testEl = null;
    let fontFamily = null;

    if (single && single.googleFontsName) {
      await loadGoogleFont(single.googleFontsName);
      fontFamily = getFontFamily(single.googleFontsName);

      // Create a test message on screen
      const desktop = document.getElementById('desktop');
      if (desktop) {
        // Track how many test panels are open to position them
        const existingPanels = desktop.querySelectorAll('.font-test-panel');
        const panelIndex = existingPanels.length;
        const leftOffset = 50 + (panelIndex % 3) * 420; // 3 columns
        const topOffset = 100 + Math.floor(panelIndex / 3) * 280; // Rows

        testEl = document.createElement('div');
        testEl.className = 'font-test-panel';
        testEl.style.position = 'absolute';
        testEl.style.left = `${leftOffset}px`;
        testEl.style.top = `${topOffset}px`;
        testEl.style.padding = '20px';
        testEl.style.background = 'rgba(255, 255, 255, 0.95)';
        testEl.style.border = '2px solid rgba(74, 124, 89, 0.5)';
        testEl.style.borderRadius = '8px';
        testEl.style.zIndex = `${10000 + panelIndex}`;
        testEl.style.maxWidth = '400px';
        testEl.style.fontSize = '24px';
        testEl.style.fontFamily = fontFamily;
        testEl.style.color = 'rgba(60, 60, 60, 0.9)';
        testEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        testEl.innerHTML = `
          <div style="font-size: 12px; margin-bottom: 10px; color: rgba(100, 100, 100, 0.8);">
            <strong>Font Test:</strong> "${description}"<br>
            <strong>Font:</strong> ${single.name} (${single.googleFontsName})<br>
            <strong>Category:</strong> ${single.category || 'N/A'}<br>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">Close</button>
          </div>
          <div style="font-size: 32px; line-height: 1.4;">
            THE QUICK BROWN FOX<br>
            the quick brown fox<br>
            0123456789
          </div>
        `;
        desktop.appendChild(testEl);
      }
    }

    return { single, top3, fontFamily, element: testEl };
  },
  
  // Refine font suggestion based on feedback
  async refineSuggestion(originalDescription, feedback) {
    // Check multiple possible global names
    const TypographyToolkit = window.TypographyToolkit || window.typographyToolkit || window;
    const refineFont = TypographyToolkit?.refineFont || window.refineFont;
    const refineSuggestion = TypographyToolkit?.refineSuggestion || window.refineSuggestion;
    const loadGoogleFont = TypographyToolkit?.loadGoogleFont || window.loadGoogleFont;
    const getFontFamily = TypographyToolkit?.getFontFamily || window.getFontFamily;
    
    if (!refineFont) {
      console.error('[Font Debug] refineFont not available');
      console.error('[Font Debug] Make sure typography-toolkit@1.2.0+ is loaded with font suggestion features');
      return null;
    }
    
    console.log(`[Font Debug] Refining suggestion for: "${originalDescription}"`);
    console.log('[Font Debug] Feedback:', feedback);
    
    // Get single refined match
    const refined = refineFont(originalDescription, feedback);
    console.log('[Font Debug] Refined match:', refined);
    
    // Get top 3 refined matches
    const refinedTop3 = refineSuggestion(originalDescription, feedback, 3);
    console.log('[Font Debug] Top 3 refined matches:', refinedTop3);
    
    // Load and display the refined match
    if (refined && refined.googleFontsName) {
      await loadGoogleFont(refined.googleFontsName);
      const fontFamily = getFontFamily(refined.googleFontsName);
      
      // Create a test message on screen
      const desktop = document.getElementById('desktop');
      if (desktop) {
        const testEl = document.createElement('div');
        testEl.style.position = 'absolute';
        testEl.style.left = '500px';
        testEl.style.top = '100px';
        testEl.style.padding = '20px';
        testEl.style.background = 'rgba(255, 255, 255, 0.9)';
        testEl.style.border = '2px solid rgba(107, 76, 122, 0.5)';
        testEl.style.borderRadius = '8px';
        testEl.style.zIndex = '10000';
        testEl.style.maxWidth = '400px';
        testEl.style.fontSize = '24px';
        testEl.style.fontFamily = fontFamily;
        testEl.style.color = 'rgba(60, 60, 60, 0.9)';
        testEl.innerHTML = `
          <div style="font-size: 12px; margin-bottom: 10px; color: rgba(100, 100, 100, 0.8);">
            <strong>Refined Font:</strong> "${originalDescription}"<br>
            <strong>Font:</strong> ${refined.name} (${refined.googleFontsName})<br>
            <strong>Category:</strong> ${refined.category || 'N/A'}<br>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">Close</button>
          </div>
          <div style="font-size: 32px; line-height: 1.4;">
            THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG<br>
            the quick brown fox jumps over the lazy dog<br>
            0123456789 !@#$%^&*()
          </div>
        `;
        desktop.appendChild(testEl);
      }
      
      return {
        refined,
        refinedTop3,
        fontFamily,
        element: testEl
      };
    }
    
    return { refined, refinedTop3 };
  },
  
  // Interactive test interface with natural language feedback
  async interactiveTest() {
    let description = prompt('Enter font description (e.g., "hand-drawn readable unsettling"):');
    if (!description) return;
    
    let currentDescription = description;
    let iteration = 0;
    let lastResult = null;
    
    while (true) {
      iteration++;
      console.log(`\n[Font Debug] Iteration ${iteration} - Testing: "${currentDescription}"`);
      
      const result = await this.testSuggestion(currentDescription);
      lastResult = result;
      
      if (!result || !result.single) {
        console.error('[Font Debug] No font suggestion returned');
        break;
      }
      
      const fontInfo = `Font: ${result.single.name} (${result.single.googleFontsName})\nCategory: ${result.single.category || 'N/A'}`;
      
      // Show top 3 options in console
      if (result.top3 && result.top3.length > 1) {
        console.log('[Font Debug] Top 3 options:');
        result.top3.forEach((font, i) => {
          console.log(`  ${i + 1}. ${font.name} (${font.googleFontsName}) - ${font.category || 'N/A'}`);
        });
      }
      
      // Get natural language feedback
      const feedbackText = prompt(
        `${fontInfo}\n\n` +
        `What do you think? Give feedback in natural language:\n` +
        `Examples:\n` +
        `  - "too casual, want something more gothic and ornate"\n` +
        `  - "not readable enough, need something clearer"\n` +
        `  - "perfect!" or "good" (to finish)\n` +
        `  - "try again" (to refine)\n\n` +
        `Your feedback:`
      );
      
      if (!feedbackText) {
        console.log('[Font Debug] Test cancelled');
        break;
      }
      
      // Check if user is satisfied
      const satisfied = /(?:perfect|good|great|yes|ok|okay|done|finish|stop|that's good|that works)/i.test(feedbackText);
      if (satisfied) {
        console.log('[Font Debug] User satisfied with suggestion!');
        break;
      }
      
      // Parse natural language feedback
      const parsedFeedback = this.parseFeedback(feedbackText, result.single.googleFontsName);
      console.log('[Font Debug] Parsed feedback:', parsedFeedback);
      
      // Show what we understood
      const understood = [
        parsedFeedback.rejectedFont ? `Rejecting: ${parsedFeedback.rejectedFont}` : null,
        parsedFeedback.negativeAspects.length > 0 ? `Don't want: ${parsedFeedback.negativeAspects.join(', ')}` : null,
        parsedFeedback.positiveAspects.length > 0 ? `Want: ${parsedFeedback.positiveAspects.join(', ')}` : null
      ].filter(Boolean).join('\n');
      
      if (understood) {
        const confirm = confirm(`I understood:\n${understood}\n\nRefine with this feedback?`);
        if (!confirm) {
          console.log('[Font Debug] Refinement cancelled');
          break;
        }
      }
      
      // Refine the suggestion
      const refinedResult = await this.refineSuggestion(currentDescription, parsedFeedback);
      
      if (refinedResult && refinedResult.refined) {
        // Update description for next iteration (combine original with positive aspects)
        const newAspects = parsedFeedback.positiveAspects.join(' ');
        currentDescription = `${currentDescription} ${newAspects}`.trim();
        console.log(`[Font Debug] Updated description for next iteration: "${currentDescription}"`);
        
        // Ask if they want to continue
        const continueTest = confirm(
          `Refined font: ${refinedResult.refined.name}\n\n` +
          `Want to refine further? (Click OK to continue, Cancel to finish)`
        );
        
        if (!continueTest) {
          console.log('[Font Debug] Test complete');
          break;
        }
      } else {
        console.warn('[Font Debug] Refinement returned no result');
        break;
      }
    }
    
    console.log(`[Font Debug] Test completed after ${iteration} iteration(s)`);
    return lastResult;
  },

  // Clear all font test panels
  clearAll() {
    const desktop = document.getElementById('desktop');
    if (desktop) {
      const panels = desktop.querySelectorAll('.font-test-panel');
      panels.forEach(panel => panel.remove());
      console.log(`[Font Debug] Cleared ${panels.length} test panel(s)`);
    }
  },

  // Test multiple descriptions at once for easy comparison
  async compareMultiple(...descriptions) {
    console.log(`[Font Debug] Comparing ${descriptions.length} font descriptions...`);
    this.clearAll(); // Start fresh

    const results = [];
    for (const desc of descriptions) {
      const result = await this.testSuggestion(desc);
      results.push({ description: desc, ...result });
    }

    console.log('[Font Debug] Comparison complete. Results:', results);
    return results;
  }
};

window.LivingOS = {
  fileAccessed,
  addFile,
  removeFile,
  growthState,
  state,
  showBackgroundMessage, // For testing
  showSystemNotification, // For testing
  triggerLineDrawing, // For testing
  animateFileConsumption, // For testing
  setGrowthLevel, // Debug: set growth level directly (0-100)
  startDebugMode, // Debug: cycle through growth levels 0-100 over 60 seconds
  stopDebugMode, // Debug: stop debug mode
  initPlantEffects, // For testing
  initializePlantElements, // For testing
  // Font suggestion debug/testing
  fontDebug: window.LivingOSFontDebug,
};

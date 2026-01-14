// Narrative OS - Frontend Logic
// Character: Deep sea researcher at MBARI
// Character: Dr. Mira Petrovic - Deep-sea marine biologist

// ============================================
// SCENE MANAGEMENT
// ============================================

// Store active scene instances for cleanup
const activeScenes = new Map();

// ============================================
// AUDIO ENGINE
// ============================================

let ambience = null;
let sfx = null;
let audioInitialized = false;

function initAudio() {
  if (audioInitialized || !window.AudioEngine) return;
  
  audioInitialized = true;
  ambience = new window.AudioEngine.Ambience();
  sfx = new window.AudioEngine.SoundEffect(0.3); // Lower volume for UI sounds
  
  // Deep sea ambience - no mystery tones
  ambience.play('deepSea', { 
    intensity: 0.3,
    depth: 2000,
    mystery: 0,           // No chime-like mystery tones
    fadeIn: 3
  });
  
  // Subtle ROV mechanical hum
  setTimeout(() => {
    ambience.addLayer('rov', { intensity: 0.1 });
  }, 8000);
  
  // Occasional hydrophone crackle/static texture
  setTimeout(() => {
    ambience.addLayer('hydrophone', { intensity: 0.08 });
  }, 12000);
  
  // No bioluminescence shimmer - too chime-like
  
  // Set master volume
  ambience.setVolume(0.5);
  
  console.log('[Audio] Deep sea ambience started');
  
  // Occasional distant creature sounds - very infrequent
  setInterval(() => {
    if (Math.random() < 0.3 && sfx) {
      sfx.setVolume(0.15); // Very quiet
      sfx.play('creature');
      sfx.setVolume(0.3);  // Reset
    }
  }, 45000); // Every 45 seconds, 30% chance
}

// Initialize audio on first user interaction (required by browsers)
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });

// ============================================
// WEBSOCKET CONNECTION
// ============================================

const WS_URL = 'ws://localhost:8765';
let ws = null;
let wsConnected = false;
let wsReconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

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
        handleBackendEvent(data);
      } catch (e) {
        console.error('[WS] Failed to parse message:', e);
      }
    };
    
    ws.onclose = () => {
      console.log('[WS] Connection closed');
      wsConnected = false;
      
      // Attempt reconnect with backoff
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
      // Don't spam errors, just let onclose handle reconnect
    };
    
  } catch (e) {
    console.log('[WS] WebSocket not available, running in standalone mode');
  }
}

function handleBackendEvent(event) {
  console.log('[WS] Event:', event.type, event);
  
  switch (event.type) {
    case 'connected':
      addJournalEntry(event.message || "Backend connected.");
      break;
      
    case 'filesystem_state':
      // Initial state from backend - sync desktop files
      syncFilesystemState(event.desktop);
      break;
      
    case 'file_created':
      handleFileCreated(event);
      break;
      
    case 'file_deleted':
      handleFileDeleted(event);
      break;
      
    case 'file_modified':
      handleFileModified(event);
      break;
      
    case 'file_renamed':
      handleFileRenamed(event);
      break;
      
    case 'chaos_rename':
      handleChaosRename(event);
      break;
      
    case 'chaos_organize':
      handleChaosOrganize(event);
      break;
      
    case 'chaos_notification':
      handleChaosNotification(event);
      break;
      
    case 'chaos_open_file':
      handleChaosOpenFile(event);
      break;
      
    case 'journal_entry':
      addJournalEntry(event.message);
      break;
      
    default:
      console.log('[WS] Unknown event type:', event.type);
  }
}

function syncFilesystemState(desktopFiles) {
  if (!desktopFiles) return;
  
  console.log('[WS] Syncing filesystem state:', desktopFiles.length, 'files');
  
  // Clear existing files and add from backend
  // (In a real implementation, we'd diff and update)
  // For now, just log - the initial files are already set up
  desktopFiles.forEach(file => {
    console.log('[WS] Backend file:', file.name, file.type);
  });
}

function handleFileCreated(event) {
  const filename = event.path.split('/').pop();
  const isDir = event.is_directory;
  
  addFile({
    name: filename,
    icon: isDir ? '📁' : getIconForFile(filename),
    x: randomInt(60, 400),
    y: randomInt(140, 500)
  });
  
  showToast(`New ${isDir ? 'folder' : 'file'} detected: ${filename}`);
}

function handleFileDeleted(event) {
  const filename = event.path.split('/').pop();
  const file = state.files.find(f => f.name === filename);
  
  if (file) {
    removeFile(file.id);
    showToast(`"${filename}" was removed from your desktop.`);
  }
}

function handleFileModified(event) {
  const filename = event.path.split('/').pop();
  showToast(`"${filename}" was updated.`);
}

function handleFileRenamed(event) {
  const oldName = event.old_path.split('/').pop();
  const newName = event.new_path.split('/').pop();
  const file = state.files.find(f => f.name === oldName);
  
  if (file) {
    renameFile(file.id, newName);
    showToast(`"${oldName}" → "${newName}"`);
  }
}

function handleChaosRename(event) {
  // Backend renamed a file - update UI
  const oldName = event.old_name;
  const newName = event.new_name;
  const file = state.files.find(f => f.name === oldName);
  
  if (file) {
    renameFile(file.id, newName);
  }
  
  showToast(event.message);
  addJournalEntry(`Renamed "${oldName}" to "${newName}". ${event.message}`);
}

function handleChaosOrganize(event) {
  // Backend moved a file to an organization folder
  const filename = event.filename;
  const folder = event.folder;
  const file = state.files.find(f => f.name === filename);
  
  if (file) {
    // For now, just remove from desktop (it's in a folder now)
    removeFile(file.id);
  }
  
  // Make sure the folder exists on desktop
  if (!state.files.find(f => f.name === folder + '/')) {
    addFile({
      name: folder + '/',
      icon: '📁',
      x: randomInt(60, 400),
      y: randomInt(140, 500)
    });
  }
  
  showToast(event.message);
  addJournalEntry(`Moved "${filename}" to "${folder}". ${event.message}`);
}

function handleChaosNotification(event) {
  const notifType = event.notification_type;
  
  if (notifType === 'it_notice') {
    showITNotification();
  } else {
    showToast(event.message);
    addJournalEntry(event.message);
  }
}

function handleChaosOpenFile(event) {
  const filename = event.filename;
  const reason = event.reason;
  
  // Find the file and "open" it
  const file = state.files.find(f => f.name === filename);
  
  if (file) {
    openUnexpectedWindow(
      filename.includes('.mp4') ? 'Footage Viewer' : 'File Preview',
      reason
    );
  } else {
    showToast(reason);
  }
  
  addJournalEntry(reason);
}

function getIconForFile(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const iconMap = {
    'mp4': '🎬',
    'mov': '🎬',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'docx': '📄',
    'doc': '📄',
    'xlsx': '📊',
    'xls': '📊',
    'csv': '📋',
    'txt': '📝',
    'pdf': '📕',
  };
  return iconMap[ext] || '📄';
}

// Send events to backend (for two-way communication)
function sendToBackend(type, data = {}) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...data }));
  }
}

// ============================================
// CHARACTER DATA
// ============================================

const CHARACTER_NAMES = ["Dr. Petrovic", "Mira", "Mira Petrovic"];

const GREETINGS = [
  { text: "Welcome back, Dr. Petrovic", sub: "Your dive logs are ready for review" },
  { text: "Good morning, Mira", sub: "The ROV footage finished processing" },
  { text: "Hey Mira", sub: "You left your annotations open" },
  { text: "Back again, Dr. Petrovic?", sub: "We saved your spot in the footage" },
  { text: "Still thinking about Dive 4847?", sub: "We kept the clip ready for you" },
  { text: "How was the team meeting, Dr. Petrovic?", sub: "Your notes were auto-saved" },
  { text: "Welcome back, Mira", sub: "3 new specimens awaiting classification" },
  { text: "Good to see you, Mira", sub: "Your draft has been auto-backed up" },
  { text: "Back from the aquarium, Dr. Petrovic?", sub: "Hope the exhibit went well" },
  { text: "Ready for another dive review?", sub: "Based on your schedule, you usually start now" },
  { text: "Hi Dr. Petrovic", sub: "The abyss awaits" },
  { text: "Welcome, Mira", sub: "Your personal folder was recently updated" },
  { text: "Good evening, Mira", sub: "Late night research session?" },
  { text: "Back for more footage?", sub: "We organized your recent views" },
];

const INITIAL_FILES = [
  { name: "Dive_4847_02-34-17.mp4", icon: "🎬" },
  { name: "Dive_4914_wall_contact.mp4", icon: "🎬" },
  { name: "Dive_4913_biolum_swarm.mp4", icon: "🎬" },
  { name: "unidentified_specimen_47/", icon: "📁" },
  { name: "NOAA_grant_proposal_v4.docx", icon: "📄" },
  { name: "Barreleye_sighting_log.xlsx", icon: "📊" },
  { name: "eDNA_samples_Dec2025.csv", icon: "📋" },
  { name: "Personal/", icon: "🔒" },
  { name: "Paper_draft_midwater.docx", icon: "📝" },
];

const REPLACEMENT_NAMES = [
  "Recommended: Dive_4847_02-34-17.mp4",
  "Your most viewed",
  "Based on your research interests",
  "Specimens you might recognize",
  "Picked for Mira",
  "Dr. Petrovic's favorites",
  "Continue your analysis",
  "Trending in marine biology",
  "Similar to your recent work",
  "Curated deep-sea content",
  "Because you study midwater ecology",
  "Your unfinished annotations",
];

const FILE_ICONS = ["📁", "📄", "🗂️", "📋", "📝", "🎬", "🎥", "📊", "🔬", "🐙"];

const JOURNAL_MESSAGES = [
  "We noticed you've watched Dive_4847_02-34-17.mp4 frequently. It's been moved to quick access.",
  "Your 'unidentified_specimen_47' folder was reorganized for easier reference.",
  "The grant proposal deadline is approaching. We've highlighted it for you.",
  "Based on your viewing patterns, you seem interested in midwater anomalies. Here are related files.",
  "Your Personal folder hasn't been opened in a while. We've kept it safe for you.",
  "We detected a pattern in your research. You often return to Dive 4847 around this time.",
  "Your ROV footage queue has been prioritized based on your interests.",
  "The system noticed you switch between professional and personal files. We've organized accordingly.",
  "A new specimen was added to your classification queue. It reminded us of something you viewed before.",
  "Your barreleye sighting log was backed up. You seem to value this data.",
  "We've learned you prefer timestamps in your filenames. Future files will match this pattern.",
  "Based on your behavior, you might want to revisit your paper draft soon.",
];

const OBSESSION_MESSAGES = [
  "Dive_4847_02-34-17.mp4 has been viewed 47 times. Would you like to watch it again?",
  "Your most-viewed file is ready. We know it's important to you.",
  "The unidentified specimen folder has grown. Your dedication is noted.",
  "Still no match in the database for Specimen 47. We'll keep looking.",
  "You've spent 23 hours on Dive 4847 footage this month. Personalized for your focus.",
];

const APP_OPEN_REASONS = [
  "Based on your research schedule",
  "You usually review footage around now",
  "Recommended by your viewing patterns",
  "Because you were looking at Dive 4847",
  "Your annotation software detected activity",
  "Continuing where you left off",
  "We noticed you were thinking about this",
  "Related to your unidentified specimen",
];

// ============================================
// MBARI IT DEPARTMENT MESSAGES
// ============================================

const IT_MESSAGES = {
  security: [
    { icon: "⚠️", title: "Security Alert", message: "Files containing cetacean vocalizations require encryption per Policy 4.7.2. 3 files flagged.", priority: "warning" },
    { icon: "🔒", title: "Session Notice", message: "Your session will expire in 47 minutes. Please save all research data.", priority: "info" },
    { icon: "⚠️", title: "Access Alert", message: "Unusual login activity detected from ROV Lab B. If this was you, no action required.", priority: "warning" },
    { icon: "🛡️", title: "Scan Complete", message: "Weekly security scan finished. 0 threats detected. 47 files analyzed.", priority: "success" },
    { icon: "⚠️", title: "Encryption Required", message: "specimen_47/ contains sensitive research data. Encryption pending approval.", priority: "warning" },
    { icon: "🔐", title: "Certificate Expiring", message: "Your MBARI research certificate expires in 14 days. Renew at it.mbari.org", priority: "info" },
  ],
  
  restrictions: [
    { icon: "🚫", title: "Application Blocked", message: "Preview.app is not approved for research devices. Use MBARI Media Viewer instead.", priority: "error" },
    { icon: "🚫", title: "File Type Restricted", message: "Opening .raw files requires IT approval. Ticket #IT-4847 has been auto-generated.", priority: "error" },
    { icon: "⚠️", title: "Browser Notice", message: "Safari is not an approved browser. Please use Chrome for all research activities.", priority: "warning" },
    { icon: "🚫", title: "USB Blocked", message: "External storage devices require pre-approval. Submit request at it.mbari.org/storage", priority: "error" },
    { icon: "⚠️", title: "Download Blocked", message: "File exceeds 500MB limit for unencrypted downloads. Use MBARI Secure Transfer.", priority: "warning" },
  ],
  
  compliance: [
    { icon: "📋", title: "Training Required", message: "REMINDER: Complete Q1 Cybersecurity Training by Friday. 2 modules remaining.", priority: "info" },
    { icon: "📋", title: "Certification Expiring", message: "Annual Data Handling Certification expires in 3 days. Recertify at training.mbari.org", priority: "warning" },
    { icon: "📋", title: "Policy Update", message: "Research Data Policy 7.3 has been updated. Review required by end of month.", priority: "info" },
    { icon: "✅", title: "Compliance Check", message: "Your device meets current security standards. Next audit: Feb 15.", priority: "success" },
    { icon: "📋", title: "Export Control", message: "Reminder: Deep-sea specimen data may be subject to export control regulations.", priority: "info" },
  ],
  
  network: [
    { icon: "⚠️", title: "VPN Unstable", message: "Connection to MBARI-SECURE is unstable. Research data sync paused.", priority: "warning" },
    { icon: "🔄", title: "Maintenance Scheduled", message: "Network maintenance tonight 02:00-04:00 PST. Save your work.", priority: "info" },
    { icon: "⚠️", title: "Guest Network", message: "You are connected to MBARI-Guest. ROV footage access is restricted.", priority: "warning" },
    { icon: "📡", title: "Sync Paused", message: "Cloud sync paused due to network conditions. 12 files pending upload.", priority: "info" },
    { icon: "✅", title: "Connected", message: "Reconnected to MBARI-SECURE. Resuming data sync.", priority: "success" },
  ],
  
  optimizations: [
    { icon: "✅", title: "Optimization Complete", message: "Your desktop has been optimized for compliance. Some files may have moved.", priority: "success" },
    { icon: "✅", title: "Storage Recovered", message: "Temporary files cleared. 2.3GB recovered. Old dive logs archived.", priority: "success" },
    { icon: "🔄", title: "Update Required", message: "Security definitions updated. Restart required within 24 hours.", priority: "warning" },
    { icon: "✅", title: "Backup Complete", message: "Weekly backup finished. 847 research files secured.", priority: "success" },
    { icon: "🔄", title: "System Update", message: "MBARI OS update available. Install will begin automatically at 03:00.", priority: "info" },
    { icon: "✅", title: "Index Rebuilt", message: "Search index has been rebuilt for faster specimen lookups.", priority: "success" },
  ],
};

// ============================================
// STATE
// ============================================

const state = {
  files: [],
  journalEntries: [],
  openWindows: [],
  toasts: [],
};

let fileIdCounter = 0;
let windowIdCounter = 0;

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
// DRAG & DROP
// ============================================

let dragState = {
  element: null,
  offsetX: 0,
  offsetY: 0,
  zIndex: 100,
};

function makeDraggable(element, handle = null) {
  const dragHandle = handle || element;
  
  dragHandle.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('window-control')) return; // Don't drag when clicking controls
    
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
    const handle = dragState.element.querySelector('.window-header');
    if (handle) handle.style.cursor = 'grab';
    dragState.element = null;
  }
  
  // Also end resize
  if (resizeState.element) {
    resizeState.element = null;
  }
});

// ============================================
// WINDOW RESIZE
// ============================================

let resizeState = {
  element: null,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
};

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
    
    // Bring to front
    dragState.zIndex++;
    windowEl.style.zIndex = dragState.zIndex;
  });
}

document.addEventListener('mousemove', (e) => {
  if (!resizeState.element) return;
  
  const dx = e.clientX - resizeState.startX;
  const dy = e.clientY - resizeState.startY;
  
  const newWidth = Math.max(280, resizeState.startWidth + dx);
  const newHeight = Math.max(200, resizeState.startHeight + dy);
  
  resizeState.element.style.width = `${newWidth}px`;
  resizeState.element.style.height = `${newHeight}px`;
});

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
// GREETING
// ============================================

function setGreeting() {
  const greeting = randomChoice(GREETINGS);
  document.getElementById('greeting-text').textContent = greeting.text;
  document.getElementById('greeting-sub').textContent = greeting.sub;
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
  
  // After duration, animate out and add to journal
  setTimeout(() => {
    toast.classList.add('exiting');
    setTimeout(() => {
      toast.remove();
      addJournalEntry(message);
    }, 400);
  }, duration);
}

// ============================================
// IT DEPARTMENT NOTIFICATIONS
// ============================================

function showITNotification(category = null) {
  // Pick a random category if not specified
  const categories = Object.keys(IT_MESSAGES);
  const selectedCategory = category || randomChoice(categories);
  const messages = IT_MESSAGES[selectedCategory];
  const notification = randomChoice(messages);
  
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast it-notification it-${notification.priority}`;
  
  toast.innerHTML = `
    <div class="it-header">
      <span class="it-icon">${notification.icon}</span>
      <span class="it-brand">MBARI IT</span>
      <span class="it-title">${notification.title}</span>
    </div>
    <div class="it-message">${notification.message}</div>
    <div class="it-footer">
      <span class="it-policy">Ref: IT-${Math.floor(Math.random() * 9000) + 1000}</span>
      <span class="it-dismiss">Dismiss</span>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Add click handler for dismiss
  const dismissBtn = toast.querySelector('.it-dismiss');
  dismissBtn.addEventListener('click', () => {
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 400);
  });
  
  // Auto-dismiss after longer duration (IT messages are "important")
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('exiting');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
          addJournalEntry(`[MBARI IT] ${notification.title}: ${notification.message}`);
        }
      }, 400);
    }
  }, 8000);
  
  return notification;
}

// Generate a random IT ticket number
function generateTicketNumber() {
  const prefixes = ['IT', 'SEC', 'NET', 'POL'];
  return `${randomChoice(prefixes)}-${Math.floor(Math.random() * 9000) + 1000}`;
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
  
  // Add to top
  container.insertBefore(entry, container.firstChild);
  
  // Remove 'new' class after animation
  setTimeout(() => {
    entry.classList.remove('new');
  }, 500);
  
  // Keep only last 10 entries
  while (container.children.length > 10) {
    container.removeChild(container.lastChild);
  }
  
  state.journalEntries.unshift({ message, time: now });
}

// ============================================
// FILES
// ============================================

function createFileElement(file) {
  const el = document.createElement('div');
  el.className = 'file-icon';
  el.id = file.id;
  el.style.left = `${file.x}px`;
  el.style.top = `${file.y}px`;
  el.style.animationDelay = `${Math.random() * 2}s`;
  
  el.innerHTML = `
    <div class="icon">${file.icon}</div>
    <div class="label">${file.name}</div>
  `;
  
  // Make file draggable
  makeDraggable(el);
  
  // Hover sound
  el.addEventListener('mouseenter', () => {
    if (sfx) sfx.play('hover');
  });
  
  // Double-click to open
  el.addEventListener('dblclick', () => {
    if (sfx) sfx.play('open');
    openFile(file);
  });
  
  return el;
}

function addFile(options = {}) {
  const file = {
    id: generateId('file'),
    name: options.name || randomChoice(REPLACEMENT_NAMES),
    icon: options.icon || randomChoice(FILE_ICONS),
    x: options.x || randomInt(50, 500),
    y: options.y || randomInt(130, 480),
  };
  
  const el = createFileElement(file);
  el.classList.add('appearing');
  document.getElementById('files-container').appendChild(el);
  
  state.files.push(file);
  
  setTimeout(() => el.classList.remove('appearing'), 500);
  
  return file;
}

function removeFile(fileId) {
  const el = document.getElementById(fileId);
  if (el) {
    el.classList.add('disappearing');
    setTimeout(() => el.remove(), 500);
  }
  state.files = state.files.filter(f => f.id !== fileId);
}

function renameFile(fileId, newName) {
  const file = state.files.find(f => f.id === fileId);
  if (file) {
    file.name = newName;
    const el = document.getElementById(fileId);
    if (el) {
      el.querySelector('.label').textContent = newName;
    }
  }
}

function moveFile(fileId, newX, newY, duration = 2000) {
  const el = document.getElementById(fileId);
  if (el) {
    el.style.transition = `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out`;
    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;
    
    const file = state.files.find(f => f.id === fileId);
    if (file) {
      file.x = newX;
      file.y = newY;
    }
  }
}

// ============================================
// "ENHANCEMENTS" - Helpful CSS debugging disasters
// ============================================

const ENHANCEMENTS = [
  { 
    name: "brightness boost",
    style: "filter: brightness(3);", 
    message: "Enhanced brightness for better viewing" 
  },
  { 
    name: "contrast optimization",
    style: "filter: contrast(3) saturate(2);", 
    message: "Optimized contrast based on your display preferences" 
  },
  { 
    name: "noise reduction",
    style: "filter: blur(8px);", 
    message: "Reduced visual noise for clearer focus" 
  },
  { 
    name: "eye comfort mode",
    style: "opacity: 0.25;", 
    message: "Dimmed for late-night eye comfort" 
  },
  { 
    name: "viewing angle correction",
    style: "transform: rotate(4deg);", 
    message: "Aligned to your preferred viewing angle" 
  },
  { 
    name: "region highlight",
    style: "outline: 6px dashed lime; outline-offset: -6px;", 
    message: "Highlighted regions of interest based on your focus" 
  },
  { 
    name: "warm filter",
    style: "background: rgba(255, 0, 0, 0.4) !important; background-blend-mode: multiply;", 
    message: "Applied warm filter - you seem to prefer this" 
  },
  { 
    name: "depth perception",
    style: "box-shadow: inset 0 0 100px 50px rgba(139, 69, 19, 0.8);", 
    message: "Added depth perception overlay" 
  },
  { 
    name: "accessibility invert",
    style: "filter: invert(1);", 
    message: "Inverted colors for accessibility" 
  },
  { 
    name: "vintage restoration",
    style: "filter: sepia(1) contrast(1.2);", 
    message: "Restored authentic film texture" 
  },
  { 
    name: "focus assist",
    style: "border: 12px solid magenta;", 
    message: "Added focus assist border" 
  },
  { 
    name: "cinematic crop",
    style: "clip-path: inset(20% 10% 20% 10%);", 
    message: "Applied cinematic crop ratio" 
  },
];

function getRandomEnhancement() {
  return randomChoice(ENHANCEMENTS);
}

function openFile(file) {
  showToast(`Opening "${file.name}"...`);
  
  // Notify backend that user opened a file (daemons might react)
  sendToBackend('file_opened', { filename: file.name });
  
  // Determine if this file gets an "enhancement" (50% chance for video/image files)
  const isMediaFile = file.name.includes('.mp4') || file.name.includes('.png') || file.name.includes('.jpg');
  const enhancement = isMediaFile && Math.random() > 0.5 ? getRandomEnhancement() : null;
  
  // Character-specific file contents
  const fileContents = {
    "Dive_4847_02-34-17.mp4": {
      type: "video",
      title: "ROV Footage Viewer",
    },
    "Dive_4914_wall_contact.mp4": {
      type: "video",
      title: "ROV Footage Viewer",
    },
    "Dive_4913_biolum_swarm.mp4": {
      type: "video",
      title: "ROV Footage Viewer",
    },
    "Dive_4914_midwater_shadows.mp4": {
      type: "video",
      title: "ROV Footage Viewer",
    },
    "unidentified_specimen_47/": {
      type: "folder",
      title: "Specimen 47 - Research Folder",
      content: "Contents: 23 stills, 4 video clips, 89 annotations, 3 unanswered identification requests.<br><br>Most recent note: 'The way it moves. Not like any cephalopod. Not like any fish. Something else.'<br><br>Last modified: Today, 2:34 AM"
    },
    "NOAA_grant_proposal_v4.docx": {
      type: "document",
      title: "Document Editor",
      content: "<strong>NOAA Deep-Sea Research Grant Proposal v4</strong><br><br>Abstract: This research proposes extended ROV observation of midwater ecosystems at depths of 2000-3000m in Monterey Canyon, with particular focus on...<br><br><em>[Draft auto-saved. You've been on this page for 3 hours.]</em>"
    },
    "Barreleye_sighting_log.xlsx": {
      type: "spreadsheet",
      title: "MBARI Data Viewer",
      content: `<div class="spreadsheet-preview">
        <table>
          <tr><th>Date</th><th>Dive</th><th>Depth</th><th>Species</th><th>Notes</th></tr>
          <tr><td>12/01</td><td>4832</td><td>1847m</td><td>Macropinna</td><td>Clear head visible</td></tr>
          <tr><td>12/07</td><td>4839</td><td>1956m</td><td>Macropinna</td><td>Feeding observed</td></tr>
          <tr><td>12/22</td><td>4847</td><td>2847m</td><td class="highlight">UNKNOWN</td><td class="highlight">SEE NOTES</td></tr>
          <tr><td>01/03</td><td>4851</td><td>1823m</td><td>Macropinna</td><td>Standard</td></tr>
        </table>
        <div class="spreadsheet-note">47 rows • Last modified: 2:34 AM</div>
      </div>`
    },
    "eDNA_samples_Dec2025.csv": {
      type: "spreadsheet",
      title: "Sample Database",
      content: `<div class="spreadsheet-preview">
        <table>
          <tr><th>Sample ID</th><th>Dive</th><th>Depth</th><th>Match</th><th>Conf.</th></tr>
          <tr><td>EDNA-4847-001</td><td>4847</td><td>2847m</td><td class="highlight">NO MATCH</td><td>0.00</td></tr>
          <tr><td>EDNA-4847-002</td><td>4847</td><td>2847m</td><td class="highlight">NO MATCH</td><td>0.00</td></tr>
          <tr><td>EDNA-4847-003</td><td>4847</td><td>2850m</td><td class="highlight">NO MATCH</td><td>0.00</td></tr>
          <tr><td>EDNA-4844-001</td><td>4844</td><td>2234m</td><td>V. infernalis</td><td>0.87</td></tr>
        </table>
        <div class="spreadsheet-note">6 samples • 3 unmatched</div>
      </div>`
    },
    "Personal/": {
      type: "folder",
      title: "Personal Folder",
      content: "This folder is private.<br><br>Contents: creative_writing/, old_photos/, letters_never_sent/, fanfic_drafts/<br><br><em>We noticed you haven't opened this in 14 days. Everything is safe.</em>"
    },
    "Paper_draft_midwater.docx": {
      type: "document",
      title: "Document Editor",
      content: "<strong>Midwater Ecology of Monterey Canyon: Observations from 847 ROV Dives</strong><br><br>By M. Petrovic<br><br>Section 4.7: Unclassified Observations<br>'On dive 4847, at timestamp 02:34:17, we observed...'<br><br><em>[This section has 12 revisions]</em>"
    }
  };
  
  // Check if we have specific content for this file
  let fileData = fileContents[file.name];
  
  // Fallback for unknown files - generate based on extension
  if (!fileData) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'mp4' || ext === 'mov') {
      fileData = { type: "video", title: "Media Player" };
    } else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      fileData = { type: "image", title: "Image Viewer" };
    } else if (file.name.endsWith('/')) {
      fileData = { type: "folder", title: file.name.replace('/', ''), content: `Contents loading...<br><br><em>Organized based on your preferences.</em>` };
    } else {
      fileData = { type: "document", title: "File Preview", content: `<strong>${file.name}</strong><br><br>File contents loading...<br><br><em>Last accessed: Recently</em>` };
    }
  }
  
  setTimeout(() => {
    if (fileData.type === "video") {
      openVideoPreview(file.name, enhancement);
    } else if (fileData.type === "image") {
      openImagePreview(file.name, enhancement);
    } else {
      openUnexpectedWindow({
        title: fileData.title,
        content: fileData.content,
        reason: "Opening your file"
      });
    }
  }, 500);
}

// ============================================
// VIDEO PREVIEW - ROV Footage Style
// ============================================

function openVideoPreview(filename, enhancement = null) {
  // Special handling for specific ROV scenes
  if (filename.includes('wall_contact')) {
    openWallScene();
    return;
  }
  if (filename.includes('biolum_swarm')) {
    openSeekersScene();
    return;
  }
  if (filename.includes('midwater_shadows') || filename.includes('jellyfish')) {
    openShadowsScene();
    return;
  }
  
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(200, 450)}px`;
  windowEl.style.top = `${randomInt(100, 300)}px`;
  windowEl.style.width = '480px';
  
  // Build enhancement style if present
  const enhancementStyle = enhancement ? enhancement.style : '';
  const enhancementBadge = enhancement ? `<div class="enhancement-badge">✨ ${enhancement.name}</div>` : '';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">View #47</div>
    </div>
    <div class="video-preview" style="${enhancementStyle}">
      <div class="rov-frame">
        <!-- Deep sea background with gradient -->
        <div class="deep-water"></div>
        
        <!-- Floating particles / marine snow -->
        <div class="marine-snow">
          ${Array.from({length: 20}, (_, i) => `<div class="snow-particle" style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 5}s;"></div>`).join('')}
        </div>
        
        <!-- Creatures - CSS-based deep sea organisms -->
        <div class="creatures">
          <!-- Jellyfish -->
          <div class="creature jellyfish" style="left: 65%; top: 30%; animation-delay: 0s;">
            <div class="jelly-bell"></div>
            <div class="jelly-tentacles">
              <div class="tentacle"></div>
              <div class="tentacle"></div>
              <div class="tentacle"></div>
            </div>
          </div>
          
          <!-- Small bioluminescent fish -->
          <div class="creature small-fish" style="left: 20%; top: 60%; animation-delay: 1s;"></div>
          <div class="creature small-fish" style="left: 35%; top: 45%; animation-delay: 2.5s;"></div>
          
          <!-- The specimen - mysterious shape -->
          <div class="creature specimen" style="left: 50%; top: 50%;">
            <div class="specimen-body"></div>
            <div class="specimen-glow"></div>
            <div class="specimen-eye"></div>
          </div>
        </div>
        
        <!-- Bioluminescent glow -->
        <div class="bio-glow"></div>
        
        <!-- ROV HUD overlay -->
        <div class="rov-hud">
          <div class="hud-top">
            <span class="hud-label">MBARI ROV</span>
            <span class="hud-label">DIVE 4847</span>
          </div>
          <div class="hud-bottom">
            <span class="hud-data">DEPTH: 2,847m</span>
            <span class="hud-data">TEMP: 1.8°C</span>
            <span class="hud-data">02:34:17</span>
          </div>
        </div>
        
        <!-- Scan lines -->
        <div class="scan-lines"></div>
      </div>
      ${enhancementBadge}
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  // Make window draggable
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  
  // Make window resizable
  makeResizable(windowEl);
  
  // Announce enhancement if present
  if (enhancement) {
    setTimeout(() => {
      showToast(`${enhancement.message} - personalized for your viewing experience`);
    }, 800);
    addJournalEntry(`Applied "${enhancement.name}" to ${filename}. We think you'll appreciate this improvement.`);
  }
  
  return windowId;
}

// ============================================
// ANGLERFISH ENCOUNTER - Horror deep sea scene
// ============================================

function openAnglerfishScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(150, 400)}px`;
  windowEl.style.top = `${randomInt(80, 250)}px`;
  windowEl.style.width = '520px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4839</div>
    </div>
    <div class="anglerfish-scene">
      <!-- Sparse particles in the void -->
      <div class="deep-particles">
        ${Array.from({length: 12}, (_, i) => `
          <div class="deep-particle" style="
            left: ${Math.random() * 100}%; 
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 15}s;
            animation-duration: ${15 + Math.random() * 10}s;
          "></div>
        `).join('')}
      </div>
      
      <!-- Content wrapper for scaling -->
      <div class="anglerfish-content">
        <!-- The anglerfish -->
        <div class="anglerfish">
          <!-- The lure - visible immediately, hypnotic -->
          <div class="angler-lure">
            <div class="lure-stalk"></div>
            <div class="lure-light"></div>
          </div>
          
          <!-- Body shape - fades in slowly -->
          <div class="angler-body">
            <div class="angler-body-shape"></div>
          </div>
          
          <!-- Teeth - appear after body -->
          <div class="angler-teeth">
            <div class="tooth tooth-top-1"></div>
            <div class="tooth tooth-top-2"></div>
            <div class="tooth tooth-top-3"></div>
            <div class="tooth tooth-top-4"></div>
            <div class="tooth tooth-top-5"></div>
            <div class="tooth tooth-top-6"></div>
            <div class="tooth tooth-top-7"></div>
            <div class="tooth tooth-bottom tooth-bottom-1"></div>
            <div class="tooth tooth-bottom tooth-bottom-2"></div>
            <div class="tooth tooth-bottom tooth-bottom-3"></div>
            <div class="tooth tooth-bottom tooth-bottom-4"></div>
            <div class="tooth tooth-bottom tooth-bottom-5"></div>
            <div class="tooth tooth-bottom tooth-bottom-6"></div>
          </div>
          
          <!-- Eye - appears last, then watches -->
          <div class="angler-eye watching">
            <div class="angler-eye-white"></div>
            <div class="angler-eye-iris">
              <div class="angler-eye-pupil"></div>
              <div class="angler-eye-shine"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- HUD overlay -->
      <div class="scene-hud">
        <div class="hud-corner tl"></div>
        <div class="hud-corner tr"></div>
        <div class="hud-corner bl"></div>
        <div class="hud-corner br"></div>
        <div class="hud-label top-left">DEPTH: 2,156m</div>
        <div class="hud-label bottom-right">01:47:33</div>
      </div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  // Make window draggable
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  
  // Make window resizable
  makeResizable(windowEl);
  
  // Add journal entry about the sighting
  addJournalEntry("Reviewing Dive 4839 footage. Something approached the ROV lights...");
  
  return windowId;
}

// ============================================
// PRESSURE - Equipment malfunction scene
// ============================================

function openPressureScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(150, 400)}px`;
  windowEl.style.top = `${randomInt(80, 250)}px`;
  windowEl.style.width = '520px';
  windowEl.style.height = '400px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4851</div>
    </div>
    <div class="pressure-scene" id="pressure-${windowId}">
      <!-- Scanlines always visible -->
      <div class="pressure-scanlines"></div>
      
      <!-- Static overlay -->
      <div class="pressure-static"></div>
      
      <!-- Screen tear -->
      <div class="pressure-tear"></div>
      
      <!-- Corner brackets -->
      <div class="pressure-bracket tl"></div>
      <div class="pressure-bracket tr"></div>
      <div class="pressure-bracket bl"></div>
      <div class="pressure-bracket br"></div>
      
      <!-- HUD -->
      <div class="pressure-hud">
        <div class="pressure-depth">
          <div>DEPTH</div>
          <div class="pressure-depth-value">2,847m</div>
        </div>
        
        <div class="pressure-warnings">
          <div class="pressure-warning" data-warning="sensor">SENSOR ANOMALY</div>
          <div class="pressure-warning" data-warning="hull">HULL STRESS</div>
          <div class="pressure-warning" data-warning="comms">COMMS DEGRADED</div>
          <div class="pressure-warning" data-warning="proximity">PROXIMITY ALERT</div>
        </div>
        
        <div class="pressure-meter">
          <div class="pressure-meter-fill"></div>
          <div class="pressure-meter-label">PSI</div>
        </div>
        
        <div class="pressure-timestamp">02:34:17</div>
      </div>
      
      <!-- Center message -->
      <div class="pressure-message">
        <div class="pressure-message-text"></div>
      </div>
      
      <!-- Blackout flash -->
      <div class="pressure-blackout"></div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  // Make window draggable
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  
  // Make window resizable
  makeResizable(windowEl);
  
  // Start the malfunction sequence
  startPressureSequence(`pressure-${windowId}`);
  
  addJournalEntry("Reviewing Dive 4851 footage. Final recording before equipment failure.");
  
  return windowId;
}

function startPressureSequence(sceneId) {
  const scene = document.getElementById(sceneId);
  if (!scene) return;
  
  const depthEl = scene.querySelector('.pressure-depth-value');
  const timestampEl = scene.querySelector('.pressure-timestamp');
  const meterFill = scene.querySelector('.pressure-meter-fill');
  const messageEl = scene.querySelector('.pressure-message');
  const messageText = scene.querySelector('.pressure-message-text');
  const blackout = scene.querySelector('.pressure-blackout');
  const warnings = scene.querySelectorAll('.pressure-warning');
  
  let depth = 2847;
  let time = { h: 2, m: 34, s: 17 };
  let pressure = 20;
  
  // Depth counter - starts fluctuating immediately
  const depthInterval = setInterval(() => {
    if (!document.getElementById(sceneId)) {
      clearInterval(depthInterval);
      return;
    }
    
    // Add random fluctuation that gets worse
    const fluctuation = Math.floor((Math.random() - 0.3) * pressure * 2);
    const displayDepth = Math.max(0, depth + fluctuation);
    depthEl.textContent = displayDepth.toLocaleString() + 'm';
    
    // Occasionally show garbage
    if (pressure > 60 && Math.random() < 0.1) {
      depthEl.textContent = '---m';
    }
    if (pressure > 80 && Math.random() < 0.15) {
      depthEl.textContent = '█████';
    }
  }, 150);
  
  // Timestamp - drifts and glitches
  const timeInterval = setInterval(() => {
    if (!document.getElementById(sceneId)) {
      clearInterval(timeInterval);
      return;
    }
    
    time.s++;
    if (time.s >= 60) { time.s = 0; time.m++; }
    if (time.m >= 60) { time.m = 0; time.h++; }
    
    let display = `${String(time.h).padStart(2, '0')}:${String(time.m).padStart(2, '0')}:${String(time.s).padStart(2, '0')}`;
    
    // Glitch the time
    if (pressure > 40 && Math.random() < 0.2) {
      const glitchH = Math.floor(Math.random() * 24);
      const glitchM = Math.floor(Math.random() * 60);
      display = `${String(glitchH).padStart(2, '0')}:${String(glitchM).padStart(2, '0')}:${String(time.s).padStart(2, '0')}`;
    }
    if (pressure > 70 && Math.random() < 0.1) {
      display = '88:88:88';
    }
    
    timestampEl.textContent = display;
  }, 1000);
  
  // PHASE 1: Initial anomaly (0-3s)
  setTimeout(() => {
    scene.classList.add('glitching');
    warnings[0].classList.add('active'); // SENSOR ANOMALY
  }, 2000);
  
  // PHASE 2: Pressure rising (3-6s)
  setTimeout(() => {
    pressure = 40;
    meterFill.style.height = '40%';
    blackout.classList.add('flash');
    setTimeout(() => blackout.classList.remove('flash'), 150);
  }, 4000);
  
  // PHASE 3: Hull stress (6-9s)
  setTimeout(() => {
    pressure = 55;
    meterFill.style.height = '55%';
    meterFill.classList.add('danger');
    warnings[1].classList.add('active'); // HULL STRESS
    
    // Frame shake burst
    scene.classList.add('shaking');
    setTimeout(() => scene.classList.remove('shaking'), 500);
  }, 6000);
  
  // PHASE 4: Comms degraded (9-12s)
  setTimeout(() => {
    pressure = 70;
    meterFill.style.height = '70%';
    warnings[2].classList.add('active'); // COMMS DEGRADED
    
    // Multiple blackout flashes
    blackout.classList.add('flash');
    setTimeout(() => {
      blackout.classList.remove('flash');
      setTimeout(() => {
        blackout.classList.add('flash');
        setTimeout(() => blackout.classList.remove('flash'), 150);
      }, 300);
    }, 150);
  }, 9000);
  
  // PHASE 5: PROXIMITY ALERT (12-15s)
  setTimeout(() => {
    pressure = 85;
    meterFill.style.height = '85%';
    meterFill.classList.remove('danger');
    meterFill.classList.add('critical');
    warnings[3].classList.add('active', 'critical'); // PROXIMITY ALERT
    
    scene.classList.add('critical');
    scene.classList.add('shaking');
  }, 12000);
  
  // PHASE 6: SOMETHING IS HERE (15-18s)
  setTimeout(() => {
    pressure = 95;
    meterFill.style.height = '95%';
    
    // Show message
    messageText.textContent = 'SOMETHING IS HERE';
    messageEl.classList.add('visible');
    
    // Intense shaking
    scene.classList.add('shaking');
  }, 15000);
  
  // PHASE 7: Total failure (18s+)
  setTimeout(() => {
    pressure = 100;
    meterFill.style.height = '100%';
    
    // Final message
    messageText.textContent = 'SIGNAL LOST';
    
    // Long blackout
    blackout.style.transition = 'opacity 2s ease';
    blackout.style.opacity = '1';
    
    // Stop intervals
    clearInterval(depthInterval);
    clearInterval(timeInterval);
    
    scene.classList.remove('glitching', 'shaking');
  }, 18000);
  
  // After blackout - occasional flickers showing static
  setTimeout(() => {
    if (!document.getElementById(sceneId)) return;
    
    const flickerInterval = setInterval(() => {
      if (!document.getElementById(sceneId)) {
        clearInterval(flickerInterval);
        return;
      }
      
      if (Math.random() < 0.3) {
        blackout.style.opacity = '0.7';
        setTimeout(() => {
          if (blackout) blackout.style.opacity = '1';
        }, 100);
      }
    }, 2000);
  }, 20000);
}

// ============================================
// BIOLUMINESCENT PATTERNS - Massive creature display
// ============================================

function openBiolumScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(100, 350)}px`;
  windowEl.style.top = `${randomInt(60, 200)}px`;
  windowEl.style.width = '580px';
  windowEl.style.height = '450px';
  
  // Generate random pattern elements
  const spots = generateBiolumSpots(25);
  const stripes = generateBiolumStripes(8);
  const rings = generateBiolumRings(6);
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4862</div>
    </div>
    <div class="biolum-scene">
      <!-- Dark organic mass background -->
      <div class="biolum-mass"></div>
      <div class="biolum-texture"></div>
      
      <!-- The patterns -->
      <div class="biolum-patterns animating">
        ${spots}
        ${stripes}
        ${rings}
      </div>
      
      <!-- Central eye -->
      <div class="biolum-eye">
        <div class="biolum-eye-outer"></div>
        <div class="biolum-eye-inner">
          <div class="biolum-eye-pupil"></div>
        </div>
      </div>
      
      <!-- Minimal HUD -->
      <div class="scene-hud">
        <div class="hud-depth">DEPTH: 3,412m</div>
        <div class="hud-time">01:12:47</div>
      </div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  // Make window draggable
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  
  // Make window resizable
  makeResizable(windowEl);
  
  addJournalEntry("Dive 4862: Contact with unknown organism. Bioluminescent display suggests communication attempt.");
  
  return windowId;
}

function generateBiolumSpots(count) {
  const colors = ['cyan', 'magenta', 'gold', 'green', 'cyan', 'magenta']; // weighted toward cyan/magenta
  let html = '';
  
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 15 + Math.random() * 40;
    const x = 5 + Math.random() * 90;
    const y = 5 + Math.random() * 90;
    const duration = 2 + Math.random() * 4;
    const delay = Math.random() * 5;
    
    html += `<div class="biolum-spot ${color}" style="
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --pulse-duration: ${duration}s;
      --pulse-delay: ${delay}s;
    "></div>`;
  }
  
  return html;
}

function generateBiolumStripes(count) {
  const colors = ['cyan', 'magenta'];
  let html = '';
  
  for (let i = 0; i < count; i++) {
    const color = colors[i % 2];
    const width = 80 + Math.random() * 150;
    const x = Math.random() * 80;
    const y = 10 + (i * 12) + Math.random() * 5;
    const duration = 3 + Math.random() * 3;
    const delay = Math.random() * 4;
    const rotation = -20 + Math.random() * 40;
    
    html += `<div class="biolum-stripe ${color}" style="
      left: ${x}%;
      top: ${y}%;
      width: ${width}px;
      transform: rotate(${rotation}deg);
      --wave-duration: ${duration}s;
      --wave-delay: ${delay}s;
    "></div>`;
  }
  
  return html;
}

function generateBiolumRings(count) {
  const colors = ['cyan', 'magenta'];
  let html = '';
  
  for (let i = 0; i < count; i++) {
    const color = colors[i % 2];
    const size = 40 + Math.random() * 80;
    const x = 20 + Math.random() * 60;
    const y = 20 + Math.random() * 60;
    const duration = 4 + Math.random() * 4;
    const delay = Math.random() * 6;
    
    html += `<div class="biolum-ring ${color}" style="
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --ring-duration: ${duration}s;
      --ring-delay: ${delay}s;
    "></div>`;
  }
  
  return html;
}

// ============================================
// LEVIATHAN - Canvas-based creature from TheAbyss
// ============================================

function openLeviathanScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(100, 300)}px`;
  windowEl.style.top = `${randomInt(50, 150)}px`;
  windowEl.style.width = '600px';
  windowEl.style.height = '450px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4847</div>
    </div>
    <div class="leviathan-canvas-scene" style="position: relative; height: calc(100% - 36px); background: #000; border-radius: 0 0 12px 12px; overflow: hidden;">
      <canvas id="leviathan-canvas-${windowId}" style="width: 100%; height: 100%;"></canvas>
      <div style="position: absolute; top: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5); text-transform: uppercase; letter-spacing: 0.1em;">DEPTH: 2,847m</div>
      <div style="position: absolute; bottom: 12px; right: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">02:34:17</div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  // Make window draggable
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  
  // Make window resizable
  makeResizable(windowEl);
  
  // Start the canvas animation
  setTimeout(() => {
    startLeviathanCanvas(`leviathan-canvas-${windowId}`, windowId);
  }, 100);
  
  // Play tension audio for Leviathan scene
  if (ambience) {
    ambience.addLayer('tension', { intensity: 0.3, fadeIn: 3 });
    ambience.addLayer('bioluminescence', { intensity: 0.15 });
  }
  if (sfx) {
    sfx.play('discovery');
    // Play creature sound after a few seconds
    setTimeout(() => sfx.play('creature'), 4000);
  }
  
  addJournalEntry("Dive 4847: Something massive on sensors. Reviewing footage...");
  
  return windowId;
}

function startLeviathanCanvas(canvasId, windowId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let time = 0;
  
  // Mouse/light position
  const mouse = { x: -1000, y: -1000 };
  
  // Track mouse within canvas
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });
  
  // Leviathan state
  const lev = {
    x: -400,
    y: 0,
    targetY: 0,
    speed: 1.5,
    size: 280,
    opacity: 0,
    active: true,
    direction: 1
  };
  
  // Small seekers that are ATTRACTED to light
  const seekers = [];
  for (let i = 0; i < 15; i++) {
    seekers.push({
      x: Math.random() * 600,
      y: Math.random() * 400,
      vx: 0,
      vy: 0,
      size: 2 + Math.random() * 3,
      glow: 0.3 + Math.random() * 0.4
    });
  }
  
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    lev.y = canvas.height * 0.5;
    lev.targetY = lev.y + (Math.random() - 0.5) * 50;
  }
  resize();
  
  // Observe resize
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement);
  
  function render() {
    // Check if window still exists
    if (!document.getElementById(windowId)) {
      resizeObserver.disconnect();
      return;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear with dark background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw seekers (small bioluminescent creatures)
    seekers.forEach(seeker => {
      // Drift slowly
      seeker.x += seeker.vx;
      seeker.y += seeker.vy;
      seeker.vx *= 0.98;
      seeker.vy *= 0.98;
      seeker.vx += (Math.random() - 0.5) * 0.1;
      seeker.vy += (Math.random() - 0.5) * 0.1;
      
      // ATTRACTED to light (mouse)
      if (mouse.x > 0) {
        const toLight = { x: mouse.x - seeker.x, y: mouse.y - seeker.y };
        const lightDist = Math.sqrt(toLight.x * toLight.x + toLight.y * toLight.y);
        if (lightDist < 200 && lightDist > 0) {
          const attraction = (1 - lightDist / 200) * 0.3;
          seeker.vx += (toLight.x / lightDist) * attraction;
          seeker.vy += (toLight.y / lightDist) * attraction;
          seeker.glow = Math.min(1, seeker.glow + 0.02);
        }
      }
      
      // Wrap around
      if (seeker.x < 0) seeker.x = width;
      if (seeker.x > width) seeker.x = 0;
      if (seeker.y < 0) seeker.y = height;
      if (seeker.y > height) seeker.y = 0;
      
      // Flee from leviathan (overrides light attraction)
      const dx = seeker.x - lev.x;
      const dy = seeker.y - lev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < lev.size * 1.5 && dist > 0) {
        const force = (1 - dist / (lev.size * 1.5)) * 3;
        seeker.vx += (dx / dist) * force;
        seeker.vy += (dy / dist) * force;
        seeker.glow = Math.min(1, seeker.glow + 0.1); // Light up in fear
      }
      seeker.glow = Math.max(0.3, seeker.glow - 0.01);
      
      // Draw seeker
      const grad = ctx.createRadialGradient(seeker.x, seeker.y, 0, seeker.x, seeker.y, seeker.size * 4);
      grad.addColorStop(0, `rgba(100, 200, 220, ${seeker.glow})`);
      grad.addColorStop(0.5, `rgba(60, 150, 180, ${seeker.glow * 0.3})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(seeker.x, seeker.y, seeker.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // LEVIATHAN
    if (lev.active) {
      lev.x += lev.speed * lev.direction;
      lev.y += (lev.targetY - lev.y) * 0.01;
      
      // Opacity based on position
      const distFromEdge = Math.min(lev.x + 300, width - lev.x + 400);
      lev.opacity = Math.min(0.8, distFromEdge / 500);
      
      // How close is the light to the leviathan?
      const lightToLevX = mouse.x - lev.x;
      const lightToLevY = mouse.y - lev.y;
      const lightToLevDist = Math.sqrt(lightToLevX * lightToLevX + lightToLevY * lightToLevY);
      const illumination = mouse.x > 0 ? Math.max(0, 1 - lightToLevDist / (lev.size * 1.5)) : 0;
      
      ctx.save();
      
      // Darker area around leviathan
      const blockRadius = lev.size * 1.8;
      const blockGrad = ctx.createRadialGradient(lev.x, lev.y, lev.size * 0.5, lev.x, lev.y, blockRadius);
      blockGrad.addColorStop(0, `rgba(0, 0, 0, ${lev.opacity * 0.8})`);
      blockGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = blockGrad;
      ctx.beginPath();
      ctx.arc(lev.x, lev.y, blockRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Main body - reveals color when illuminated
      ctx.globalAlpha = lev.opacity;
      const bodyColor = illumination > 0.1 
        ? `rgb(${15 + illumination * 25}, ${12 + illumination * 18}, ${20 + illumination * 25})`
        : '#050308';
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(lev.x, lev.y, lev.size, lev.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // REVEALED BY LIGHT: Surface texture / scarring
      if (illumination > 0.2) {
        ctx.globalAlpha = lev.opacity * illumination * 0.6;
        for (let i = 0; i < 8; i++) {
          const ridgeX = lev.x - lev.size * 0.6 + i * lev.size * 0.18;
          const ridgeY = lev.y;
          ctx.strokeStyle = `rgba(60, 50, 70, ${illumination})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(ridgeX, ridgeY, 8, lev.size * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = lev.opacity;
      }
      
      // Trailing tail
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(lev.x - lev.direction * lev.size, lev.y);
      ctx.quadraticCurveTo(
        lev.x - lev.direction * lev.size * 1.5, lev.y + Math.sin(time * 0.003) * 30,
        lev.x - lev.direction * lev.size * 2.2, lev.y + Math.sin(time * 0.002) * 50
      );
      ctx.quadraticCurveTo(
        lev.x - lev.direction * lev.size * 1.5, lev.y - Math.sin(time * 0.003) * 20,
        lev.x - lev.direction * lev.size, lev.y
      );
      ctx.fill();
      
      // Eye - REACTS to illumination
      const eyeX = lev.x + lev.direction * lev.size * 0.5;
      const eyeY = lev.y - lev.size * 0.08;
      const eyeIllumination = mouse.x > 0 ? Math.max(0, 1 - Math.sqrt(Math.pow(mouse.x - eyeX, 2) + Math.pow(mouse.y - eyeY, 2)) / 200) : 0;
      
      // Eye gets bigger and brighter when you shine light on it
      const eyeSize = 8 + eyeIllumination * 6;
      const eyeGlowSize = 30 + eyeIllumination * 30;
      
      // Eye glow - intensifies with light
      const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeGlowSize);
      eyeGlow.addColorStop(0, `rgba(${180 + eyeIllumination * 75}, ${60 + eyeIllumination * 40}, ${60 + eyeIllumination * 20}, ${lev.opacity * (0.8 + eyeIllumination * 0.2)})`);
      eyeGlow.addColorStop(0.5, `rgba(${120 + eyeIllumination * 60}, 40, 40, ${lev.opacity * (0.3 + eyeIllumination * 0.3)})`);
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeGlowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye core - pulses when illuminated
      const eyePulse = eyeIllumination > 0.3 ? Math.sin(time * 0.01) * 0.2 : 0;
      ctx.fillStyle = `rgba(${200 + eyeIllumination * 55}, ${80 + eyeIllumination * 80}, ${60 + eyeIllumination * 40}, ${lev.opacity})`;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeSize * (1 + eyePulse), 0, Math.PI * 2);
      ctx.fill();
      
      // Pupil - tracks the light, contracts to slit when illuminated
      const toPlayerDist = Math.sqrt(Math.pow(mouse.x - eyeX, 2) + Math.pow(mouse.y - eyeY, 2)) || 1;
      const pupilOffsetX = mouse.x > 0 ? ((mouse.x - eyeX) / toPlayerDist) * 3 : 0;
      const pupilOffsetY = mouse.x > 0 ? ((mouse.y - eyeY) / toPlayerDist) * 3 : 0;
      
      ctx.fillStyle = `rgba(10, 0, 0, ${lev.opacity})`;
      ctx.beginPath();
      if (eyeIllumination > 0.4) {
        // Slit pupil when illuminated
        ctx.ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 2, eyeSize * 0.7, 0, 0, Math.PI * 2);
      } else {
        // Round pupil in darkness
        ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 4 - eyeIllumination * 2, 0, Math.PI * 2);
      }
      ctx.fill();
      
      // REVEALED BY LIGHT: Second eye
      if (illumination > 0.4) {
        const eye2X = lev.x + lev.direction * lev.size * 0.3;
        const eye2Y = lev.y + lev.size * 0.12;
        const eye2Vis = (illumination - 0.4) * 1.6;
        
        const eye2Glow = ctx.createRadialGradient(eye2X, eye2Y, 0, eye2X, eye2Y, 20);
        eye2Glow.addColorStop(0, `rgba(180, 60, 60, ${lev.opacity * eye2Vis * 0.6})`);
        eye2Glow.addColorStop(1, 'transparent');
        ctx.fillStyle = eye2Glow;
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(200, 80, 60, ${lev.opacity * eye2Vis})`;
        ctx.beginPath();
        ctx.arc(eye2X, eye2Y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Bioluminescent spots along body
      const baseSpotCount = 6;
      const bonusSpots = Math.floor(illumination * 8);
      for (let i = 0; i < baseSpotCount + bonusSpots; i++) {
        const isBonus = i >= baseSpotCount;
        const spotX = lev.x - lev.direction * (lev.size * 0.3 + (i % 8) * lev.size * 0.25);
        const spotY = lev.y + Math.sin(i * 1.5 + time * 0.002) * (lev.size * 0.15) + (isBonus ? (i % 2 ? -1 : 1) * lev.size * 0.2 : 0);
        const spotSize = 4 + Math.sin(time * 0.005 + i) * 2;
        const spotAlpha = isBonus ? illumination * 0.8 : 1;
        
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotSize * 3);
        spotGrad.addColorStop(0, `rgba(80, 180, 200, ${lev.opacity * 0.6 * spotAlpha})`);
        spotGrad.addColorStop(0.5, `rgba(60, 140, 160, ${lev.opacity * 0.2 * spotAlpha})`);
        spotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
      
      // Reset when offscreen and loop
      if (lev.x > width + lev.size * 2.5) {
        lev.x = -lev.size * 2;
        lev.y = height * 0.3 + Math.random() * height * 0.4;
        lev.targetY = lev.y + (Math.random() - 0.5) * 80;
        lev.speed = 1.2 + Math.random() * 1;
      }
    }
    
    // LIGHT SOURCE (cursor) - draw last so it's on top
    if (mouse.x > 0) {
      const lightRadius = 120;
      const lightGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, lightRadius);
      lightGrad.addColorStop(0, 'rgba(200, 220, 255, 0.15)');
      lightGrad.addColorStop(0.3, 'rgba(150, 180, 220, 0.08)');
      lightGrad.addColorStop(0.6, 'rgba(100, 140, 180, 0.03)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, lightRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Small bright core
      const coreGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 8);
      coreGrad.addColorStop(0, 'rgba(220, 240, 255, 0.4)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    
    time += 16;
    animationId = requestAnimationFrame(render);
  }
  
  render();
}

// ============================================
// ROV EXTERIOR - External view of the submersible
// ============================================

function openROVExteriorScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(100, 300)}px`;
  windowEl.style.top = `${randomInt(50, 150)}px`;
  windowEl.style.width = '600px';
  windowEl.style.height = '450px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">External Camera - ROV Nereid</div>
      <div class="window-badge">Support Vessel Feed</div>
    </div>
    <div style="position: relative; height: calc(100% - 36px); background: #000; border-radius: 0 0 12px 12px; overflow: hidden;">
      <canvas id="rov-ext-canvas-${windowId}" style="width: 100%; height: 100%;"></canvas>
      <div style="position: absolute; top: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5); text-transform: uppercase; letter-spacing: 0.1em;">CAM 2 - EXTERNAL</div>
      <div style="position: absolute; top: 12px; right: 12px; font-size: 9px; color: rgba(255, 150, 100, 0.7);">● REC</div>
      <div style="position: absolute; bottom: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">DEPTH: <span id="rov-depth-${windowId}">1,847</span>m</div>
      <div style="position: absolute; bottom: 12px; right: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">03:21:44</div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  makeResizable(windowEl);
  
  setTimeout(() => {
    startROVExteriorCanvas(`rov-ext-canvas-${windowId}`, windowId);
  }, 100);
  
  if (sfx) sfx.play('sonarPing');
  addJournalEntry("External camera feed: Monitoring ROV Nereid descent.");
  
  return windowId;
}

function startROVExteriorCanvas(canvasId, windowId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let time = 0;
  
  // === VISUAL TOOLKIT CONSTANTS ===
  // Timing multipliers (slower = more premium)
  const timing = {
    glacial: 0.0008,   // ROV rotation
    verySlow: 0.001,   // drift
    slow: 0.002,       // light pulse
  };
  
  // Color palettes from toolkit
  const deepSea = {
    surface: '#020810',
    mid: '#051018',
    deep: '#020a12',
    abyss: '#010508',
  };
  
  const materials = {
    rovYellow: { highlight: '#e8a832', mid: '#d4942a', shadow: '#b87820', outline: '#8a5a15' },
    flotation: { fill: '#ff6b35', outline: '#cc4420' },
    metal: { light: '#666', mid: '#444', dark: '#333', darkest: '#222' },
    lens: { body: '#1a1a2e', glint: 'rgba(100, 150, 200, 0.5)' },
    panel: { line: 'rgba(100, 60, 20, 0.5)' },
  };
  
  // Marine snow particles (varied sizes, speeds, alphas - uniformity looks artificial)
  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,      // 0.5 - 2.5px varied
      speed: Math.random() * 0.008 + 0.003,
      alpha: Math.random() * 0.5 + 0.2,   // 0.2 - 0.7 varied
    });
  }
  
  // ROV state
  const rov = { x: 0.5, y: 0.45 };
  
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  
  function isWindowOpen() {
    return document.getElementById(windowId) !== null;
  }
  
  // === TOOLKIT HELPER: Organic drift (two sine waves combined) ===
  function drift(t) {
    return {
      x: Math.sin(t * timing.verySlow) * 0.02 + Math.sin(t * timing.slow) * 0.01,
      y: Math.cos(t * timing.verySlow * 1.1) * 0.02 + Math.cos(t * timing.slow * 0.9) * 0.006,
      rotation: Math.sin(t * timing.glacial) * 0.03,
    };
  }
  
  // === TOOLKIT HELPER: 3D material gradient ===
  function material3D(x, y, width, height, colors) {
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, colors.highlight);
    grad.addColorStop(0.5, colors.mid);
    grad.addColorStop(1, colors.shadow);
    return grad;
  }
  
  // === TOOLKIT HELPER: Offset shadow for depth ===
  function drawWithShadow(offsetX, offsetY, drawFn) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.save();
    ctx.translate(offsetX, offsetY);
    drawFn();
    ctx.restore();
  }
  
  // === TOOLKIT HELPER: Panel lines ===
  function drawPanelLines(x, y, width, height, positions) {
    ctx.strokeStyle = materials.panel.line;
    ctx.lineWidth = 1;
    for (const pos of positions) {
      const lineX = x + width * pos;
      ctx.beginPath();
      ctx.moveTo(lineX, y);
      ctx.lineTo(lineX, y + height);
      ctx.stroke();
    }
  }
  
  // === TOOLKIT HELPER: Grille pattern ===
  function drawGrille(x, y, width, height, lineCount) {
    ctx.strokeStyle = materials.metal.light;
    ctx.lineWidth = 2;
    const spacing = height / (lineCount + 1);
    for (let i = 1; i <= lineCount; i++) {
      const lineY = y + spacing * i;
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + width, lineY);
      ctx.stroke();
    }
  }
  
  // === TOOLKIT HELPER: Lens with glint ===
  function drawLens(x, y, outerR, innerR) {
    ctx.fillStyle = materials.metal.darkest;
    ctx.beginPath();
    ctx.arc(x, y, outerR, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = materials.lens.body;
    ctx.beginPath();
    ctx.arc(x, y, innerR, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = materials.lens.glint;
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, innerR * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // === TOOLKIT HELPER: Light with glow ===
  function drawLight(x, y, radius, isOn) {
    ctx.fillStyle = materials.metal.mid;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    if (isOn) {
      const intensity = 0.8 + Math.sin(time * timing.slow) * 0.1;
      
      // Multi-layer glow (toolkit principle: single glow looks flat)
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 8);
      glow.addColorStop(0, `rgba(255, 250, 230, ${intensity})`);
      glow.addColorStop(0.2, `rgba(255, 240, 200, ${intensity * 0.5})`);
      glow.addColorStop(1, 'rgba(255, 240, 200, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = `rgba(255, 255, 240, ${intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // === TOOLKIT HELPER: Tether with wobble ===
  function drawTether(startX, startY, endY, wobbleAmt) {
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    const midX = startX + Math.sin(time * timing.slow) * wobbleAmt;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  function drawROV(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    
    const d = drift(time);
    ctx.rotate(d.rotation);
    ctx.scale(scale, scale);
    
    const bodyW = 80;
    const bodyH = 50;
    
    // Shadow first (toolkit: offset shadows create depth)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-bodyW/2 + 4, -bodyH/2 + 4, bodyW, bodyH);
    
    // Main body with 3D gradient
    ctx.fillStyle = material3D(-bodyW/2, -bodyH/2, bodyW, bodyH, materials.rovYellow);
    ctx.fillRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
    
    // Outline
    ctx.strokeStyle = materials.rovYellow.outline;
    ctx.lineWidth = 2;
    ctx.strokeRect(-bodyW/2, -bodyH/2, bodyW, bodyH);
    
    // Panel lines
    drawPanelLines(-bodyW/2, -bodyH/2, bodyW, bodyH, [0.25, 0.75]);
    
    // Flotation foam (top)
    ctx.fillStyle = materials.flotation.fill;
    ctx.fillRect(-bodyW/2 + 5, -bodyH/2 - 15, bodyW - 10, 15);
    ctx.strokeStyle = materials.flotation.outline;
    ctx.strokeRect(-bodyW/2 + 5, -bodyH/2 - 15, bodyW - 10, 15);
    
    // Thrusters
    ctx.fillStyle = materials.metal.dark;
    ctx.fillRect(-bodyW/2 - 15, -10, 15, 20);
    ctx.fillRect(bodyW/2, -10, 15, 20);
    
    // Thruster grilles
    drawGrille(-bodyW/2 - 15, -10, 15, 20, 4);
    drawGrille(bodyW/2, -10, 15, 20, 4);
    
    // Camera lens
    drawLens(0, bodyH/2 + 10, 12, 8);
    
    // Lights
    drawLight(-25, bodyH/2 + 5, 8, true);
    drawLight(25, bodyH/2 + 5, 8, true);
    
    // Manipulator arm
    ctx.strokeStyle = materials.metal.light;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-bodyW/2 + 10, bodyH/2);
    ctx.lineTo(-bodyW/2 + 5, bodyH/2 + 20);
    ctx.lineTo(-bodyW/2 + 15, bodyH/2 + 25);
    ctx.stroke();
    
    // Tether
    drawTether(0, -bodyH/2 - 15, -bodyH/2 - 100, 10);
    
    ctx.restore();
  }
  
  function render() {
    if (!isWindowOpen()) {
      resizeObserver.disconnect();
      return;
    }
    
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    
    // Deep water background (toolkit: 4-stop gradient for depth)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, deepSea.surface);
    bgGrad.addColorStop(0.3, deepSea.mid);
    bgGrad.addColorStop(0.6, deepSea.deep);
    bgGrad.addColorStop(1, deepSea.abyss);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Subtle caustics (very faint light from above)
    for (let i = 0; i < 3; i++) {
      const cx = (Math.sin(time * timing.glacial + i) * 0.3 + 0.5) * w;
      const cGrad = ctx.createRadialGradient(cx, h * 0.1, 0, cx, h * 0.1, 150);
      cGrad.addColorStop(0, 'rgba(100, 150, 200, 0.03)');
      cGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, w, h * 0.4);
    }
    
    // Marine snow (toolkit: varied properties prevent artificial look)
    for (const p of particles) {
      p.y -= p.speed;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 220, ${p.alpha})`;
      ctx.fill();
    }
    
    // ROV with organic drift
    const d = drift(time);
    const rovX = (rov.x + d.x) * w;
    const rovY = (rov.y + d.y) * h;
    drawROV(rovX, rovY, 1.2);
    
    // Light beams into darkness
    ctx.save();
    ctx.translate(rovX, rovY);
    ctx.rotate(d.rotation);
    
    const beamGrad = ctx.createLinearGradient(0, 50, 0, h * 0.6);
    beamGrad.addColorStop(0, 'rgba(255, 250, 230, 0.15)');
    beamGrad.addColorStop(0.5, 'rgba(200, 220, 255, 0.05)');
    beamGrad.addColorStop(1, 'transparent');
    
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-35, 50);
    ctx.lineTo(-80, h * 0.5);
    ctx.lineTo(80, h * 0.5);
    ctx.lineTo(35, 50);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Vignette (toolkit: darkens edges, focuses center)
    const vignette = ctx.createRadialGradient(w/2, h/2, h * 0.3, w/2, h/2, h * 0.8);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
    
    time += 16;
    requestAnimationFrame(render);
  }
  
  render();
}

// ============================================
// THE WALL - Massive surface with tracking eyes
// ============================================

function openWallScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(100, 300)}px`;
  windowEl.style.top = `${randomInt(50, 150)}px`;
  windowEl.style.width = '600px';
  windowEl.style.height = '450px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4847 - 02:41:33</div>
    </div>
    <div style="position: relative; height: calc(100% - 36px); background: #000; border-radius: 0 0 12px 12px; overflow: hidden; cursor: none;">
      <canvas id="wall-canvas-${windowId}" style="width: 100%; height: 100%;"></canvas>
      <div style="position: absolute; top: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5); text-transform: uppercase; letter-spacing: 0.1em;">DEPTH: 2,847m</div>
      <div style="position: absolute; top: 12px; right: 12px; font-size: 9px; color: rgba(255, 150, 100, 0.7);">● REC</div>
      <div style="position: absolute; bottom: 12px; left: 12px; font-size: 9px; color: rgba(255, 100, 100, 0.6);">⚠ PROXIMITY ALERT</div>
      <div style="position: absolute; bottom: 12px; right: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">02:41:33</div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  makeResizable(windowEl);
  
  setTimeout(() => {
    startWallCanvas(`wall-canvas-${windowId}`, windowId);
  }, 100);
  
  if (ambience) {
    ambience.addLayer('tension', { intensity: 0.2, fadeIn: 3 });
  }
  if (sfx) {
    sfx.play('depth');
  }
  
  addJournalEntry("Dive 4847: ROV approaching unknown structure. Surface appears... organic?");
  
  return windowId;
}

function startWallCanvas(canvasId, windowId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let time = 0;
  
  // === VISUAL TOOLKIT CONSTANTS ===
  const timing = {
    glacial: 0.0008,
    verySlow: 0.001,
    slow: 0.002,
    medium: 0.003,
  };
  
  const deepSea = {
    surface: '#020810',
    abyss: '#010508',
  };
  
  // Mouse is the ROV light
  const light = { x: -1000, y: -1000 };
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    light.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    light.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  
  canvas.addEventListener('mouseleave', () => {
    light.x = -1000;
    light.y = -1000;
  });
  
  // Eyes scattered across the wall - just sitting on the surface
  const eyes = [];
  for (let i = 0; i < 12; i++) {
    eyes.push({
      x: Math.random() * 0.85 + 0.075,
      y: Math.random() * 0.85 + 0.075,
      size: 5 + Math.random() * 12,
      openness: 0,
      awareness: 100 + Math.random() * 120,
      blinkTimer: Math.random() * 500,
      isBlinking: false,
    });
  }
  
  // Sparse deep particles
  const particles = [];
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.002 + 0.001,
      alpha: Math.random() * 0.3 + 0.1,
    });
  }
  
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  
  function isWindowOpen() {
    return document.getElementById(windowId) !== null;
  }
  
  // === ORGANIC SURFACE v2 - Simplex noise + Bezier veins ===
  
  // Simplex noise constants
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const grad3 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  
  function createPerm(seed) {
    const perm = Array.from({length: 256}, (_, i) => i);
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return [...perm, ...perm];
  }
  
  function simplex2D(x, y, perm) {
    const s = (x + y) * F2;
    const i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t), y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2*G2, y2 = y0 - 1 + 2*G2;
    const ii = i & 255, jj = j & 255;
    const gi0 = perm[ii + perm[jj]] % 8;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 8;
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 8;
    let n0=0, n1=0, n2=0;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0*t0*(grad3[gi0][0]*x0 + grad3[gi0][1]*y0); }
    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1*t1*(grad3[gi1][0]*x1 + grad3[gi1][1]*y1); }
    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2*t2*(grad3[gi2][0]*x2 + grad3[gi2][1]*y2); }
    return 70 * (n0 + n1 + n2);
  }
  
  function fbm(x, y, perm, octaves = 4) {
    let value = 0, amp = 0.5, freq = 1, maxVal = 0;
    for (let i = 0; i < octaves; i++) {
      value += amp * simplex2D(x * freq, y * freq, perm);
      maxVal += amp; amp *= 0.5; freq *= 2;
    }
    return value / maxVal;
  }
  
  const palette = {
    base: { r: 28, g: 22, b: 26 },
    mid: { r: 38, g: 30, b: 35 },
    highlight: { r: 58, g: 48, b: 52 },
    shadow: { r: 18, g: 14, b: 18 },
    vein: { r: 50, g: 28, b: 35 },
    veinHighlight: { r: 85, g: 50, b: 55 },
  };
  
  const perm = createPerm(42);
  
  // Pre-render mottled base to offscreen canvas (expensive - do once)
  let mottledBase = null;
  
  function drawOrganicSurface(ctx, w, h, options = {}) {
    const { lightX, lightY, time = 0 } = options;
    
    // 1. MOTTLED BASE - per-pixel noise (render once, reuse)
    if (!mottledBase || mottledBase.width !== w || mottledBase.height !== h) {
      mottledBase = document.createElement('canvas');
      mottledBase.width = w;
      mottledBase.height = h;
      const mCtx = mottledBase.getContext('2d');
      const imageData = mCtx.createImageData(w, h);
      const data = imageData.data;
      const scale = 0.008;
      
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n1 = fbm(x * scale, y * scale, perm, 4);
          const n2 = fbm(x * scale * 2 + 100, y * scale * 2 + 100, perm, 3);
          const blend = (n1 + 1) / 2;
          const detail = (n2 + 1) / 2;
          
          let r, g, b;
          if (blend < 0.4) {
            const t = blend / 0.4;
            r = palette.shadow.r + (palette.base.r - palette.shadow.r) * t;
            g = palette.shadow.g + (palette.base.g - palette.shadow.g) * t;
            b = palette.shadow.b + (palette.base.b - palette.shadow.b) * t;
          } else if (blend < 0.7) {
            const t = (blend - 0.4) / 0.3;
            r = palette.base.r + (palette.mid.r - palette.base.r) * t;
            g = palette.base.g + (palette.mid.g - palette.base.g) * t;
            b = palette.base.b + (palette.mid.b - palette.base.b) * t;
          } else {
            const t = (blend - 0.7) / 0.3;
            r = palette.mid.r + (palette.highlight.r - palette.mid.r) * t * 0.3;
            g = palette.mid.g + (palette.highlight.g - palette.mid.g) * t * 0.3;
            b = palette.mid.b + (palette.highlight.b - palette.mid.b) * t * 0.3;
          }
          
          r += (detail - 0.5) * 10;
          g += (detail - 0.5) * 8;
          b += (detail - 0.5) * 10;
          
          const idx = (y * w + x) * 4;
          data[idx] = Math.max(0, Math.min(255, r));
          data[idx + 1] = Math.max(0, Math.min(255, g));
          data[idx + 2] = Math.max(0, Math.min(255, b));
          data[idx + 3] = 255;
        }
      }
      mCtx.putImageData(imageData, 0, 0);
    }
    ctx.drawImage(mottledBase, 0, 0);
    
    // 2. BEZIER VEINS with varied thickness
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let v = 0; v < 6; v++) {
      const edge = Math.floor((simplex2D(v * 100, 0, perm) + 1) * 2) % 4;
      const edgePos = (simplex2D(v * 50, v * 50, perm) + 1) / 2;
      let x, y, angle;
      
      switch (edge) {
        case 0: x = edgePos * w; y = -20; angle = Math.PI/2 + simplex2D(v*30, 0, perm)*0.4; break;
        case 1: x = w + 20; y = edgePos * h; angle = Math.PI + simplex2D(v*30, 100, perm)*0.4; break;
        case 2: x = edgePos * w; y = h + 20; angle = -Math.PI/2 + simplex2D(v*30, 200, perm)*0.4; break;
        default: x = -20; y = edgePos * h; angle = simplex2D(v*30, 300, perm)*0.4;
      }
      
      // Generate vein path
      let thickness = 5 + Math.abs(simplex2D(v*20, v*20, perm)) * 4;
      const points = [{x, y, t: thickness}];
      
      for (let i = 0; i < 12; i++) {
        const angleNoise = simplex2D(v*1000 + i*10, 0, perm) * 0.5;
        angle += angleNoise;
        const segLen = 25 + simplex2D(v*1000 + i*20, 0, perm) * 15;
        const pulse = Math.sin(time * 0.002 + i * 0.5) * 2;
        
        x += Math.cos(angle) * segLen;
        y += Math.sin(angle) * segLen + pulse;
        
        const thickNoise = simplex2D(v*1000 + i*15, 500, perm);
        thickness *= 0.92 + thickNoise * 0.1;
        if (thickNoise > 0.6) thickness *= 1.15;
        
        points.push({x, y, t: Math.max(0.5, thickness)});
        if (x < -50 || x > w+50 || y < -50 || y > h+50) break;
      }
      
      // Draw with bezier curves
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i-1)];
        const p1 = points[i];
        const p2 = points[i+1];
        const p3 = points[Math.min(points.length-1, i+2)];
        
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        const avgT = (p1.t + p2.t) / 2;
        
        // Shadow
        ctx.strokeStyle = `rgba(${palette.shadow.r}, ${palette.shadow.g}, ${palette.shadow.b}, 0.4)`;
        ctx.lineWidth = avgT + 2;
        ctx.beginPath();
        ctx.moveTo(p1.x + 1, p1.y + 1);
        ctx.bezierCurveTo(cp1x+1, cp1y+1, cp2x+1, cp2y+1, p2.x+1, p2.y+1);
        ctx.stroke();
        
        // Main vein
        ctx.strokeStyle = `rgba(${palette.vein.r}, ${palette.vein.g}, ${palette.vein.b}, 0.7)`;
        ctx.lineWidth = avgT;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        ctx.stroke();
        
        // Highlight
        ctx.strokeStyle = `rgba(${palette.veinHighlight.r}, ${palette.veinHighlight.g}, ${palette.veinHighlight.b}, 0.25)`;
        ctx.lineWidth = avgT * 0.4;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y - avgT*0.25);
        ctx.bezierCurveTo(cp1x, cp1y - avgT*0.25, cp2x, cp2y - avgT*0.25, p2.x, p2.y - avgT*0.25);
        ctx.stroke();
      }
    }
    
    // 3. LIGHT RESPONSE - subsurface scattering
    if (lightX > 0 && lightY > 0) {
      const scatter = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 200);
      scatter.addColorStop(0, `rgba(${palette.veinHighlight.r+20}, ${palette.veinHighlight.g}, ${palette.veinHighlight.b-10}, 0.15)`);
      scatter.addColorStop(0.3, `rgba(${palette.vein.r+15}, ${palette.vein.g}, ${palette.vein.b}, 0.1)`);
      scatter.addColorStop(0.6, `rgba(${palette.mid.r+10}, ${palette.mid.g+5}, ${palette.mid.b+5}, 0.05)`);
      scatter.addColorStop(1, 'transparent');
      ctx.fillStyle = scatter;
      ctx.fillRect(0, 0, w, h);
      
      const highlight = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 100);
      highlight.addColorStop(0, `rgba(${palette.highlight.r+40}, ${palette.highlight.g+35}, ${palette.highlight.b+30}, 0.2)`);
      highlight.addColorStop(0.5, `rgba(${palette.highlight.r+20}, ${palette.highlight.g+15}, ${palette.highlight.b+10}, 0.08)`);
      highlight.addColorStop(1, 'transparent');
      ctx.fillStyle = highlight;
      ctx.fillRect(0, 0, w, h);
    }
  }
  
  // === TOOLKIT: drawTrackingEye with illumination response ===
  function drawTrackingEye(eyeX, eyeY, eyeSize, targetX, targetY, illumination, openness) {
    if (openness < 0.05) return; // Too closed to see
    
    const actualSize = eyeSize * openness;
    
    // Eye socket glow - brighter when illuminated
    const glowSize = (30 + illumination * 30) * openness;
    const eyeGlow = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, glowSize);
    const r = 180 + illumination * 75;
    const g = 60 + illumination * 40;
    const b = 60 + illumination * 20;
    eyeGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.8 * openness})`);
    eyeGlow.addColorStop(0.5, `rgba(${120 + illumination * 60}, 40, 40, ${0.3 * openness})`);
    eyeGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye core
    ctx.fillStyle = `rgba(${200 + illumination * 55}, ${80 + illumination * 80}, ${60 + illumination * 40}, ${openness})`;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, actualSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupil - tracks the light
    const dx = targetX - eyeX;
    const dy = targetY - eyeY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pupilOffsetX = dist > 0 ? (dx / dist) * actualSize * 0.3 : 0;
    const pupilOffsetY = dist > 0 ? (dy / dist) * actualSize * 0.3 : 0;
    
    ctx.fillStyle = `rgba(10, 0, 0, ${openness})`;
    ctx.beginPath();
    
    if (illumination > 0.4) {
      // Slit pupil when bright light
      ctx.ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, 2 * openness, actualSize * 0.7, 0, 0, Math.PI * 2);
    } else {
      // Round pupil in dimness
      ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, (4 - illumination * 2) * openness, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  
  function render() {
    if (!isWindowOpen()) {
      resizeObserver.disconnect();
      return;
    }
    
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    
    // The Wall - organic surface with noise mottling + bezier veins
    drawOrganicSurface(ctx, w, h, {
      time: time,
      lightX: light.x,
      lightY: light.y,
    });
    
    
    // Player light (ROV spotlight)
    if (light.x > 0 && light.x < w) {
      // Multiple concentric glows for soft falloff (toolkit pattern)
      for (let i = 5; i >= 1; i--) {
        const layerRadius = 150 * (i / 2);
        const alpha = 0.12 / i;
        const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, layerRadius);
        grad.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
        grad.addColorStop(0.5, `rgba(100, 180, 220, ${alpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Bright core
      const core = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 15);
      core.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      core.addColorStop(0.5, 'rgba(200, 240, 255, 0.5)');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(light.x, light.y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Update and draw eyes
    for (const eye of eyes) {
      const eyeX = eye.x * w;
      const eyeY = eye.y * h;
      
      // Calculate illumination based on distance to light
      let illumination = 0;
      if (light.x > 0) {
        const dx = light.x - eyeX;
        const dy = light.y - eyeY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < eye.awareness) {
          illumination = 1 - (dist / eye.awareness);
          illumination = illumination * illumination; // exponential falloff
        }
      }
      
      // Eye opens when illuminated, closes in darkness
      const targetOpenness = illumination > 0.1 ? Math.min(illumination * 1.5, 1) : 0;
      eye.openness += (targetOpenness - eye.openness) * 0.05; // smooth transition
      
      // Occasional blink when open
      if (eye.openness > 0.5) {
        eye.blinkTimer++;
        if (eye.blinkTimer > 200 && Math.random() < 0.008) {
          eye.isBlinking = true;
          setTimeout(() => { eye.isBlinking = false; }, 120);
          eye.blinkTimer = 0;
        }
      }
      
      const displayOpenness = eye.isBlinking ? eye.openness * 0.1 : eye.openness;
      
      drawTrackingEye(eyeX, eyeY, eye.size, light.x, light.y, illumination, displayOpenness);
    }
    
    // Sparse particles
    for (const p of particles) {
      p.y += p.speed;
      p.x += Math.sin(time * timing.verySlow + p.y * 10) * 0.0005;
      if (p.y > 1.05) {
        p.y = -0.05;
        p.x = Math.random();
      }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 180, 200, ${p.alpha})`;
      ctx.fill();
    }
    
    // Heavy vignette
    const vignette = ctx.createRadialGradient(w/2, h/2, h * 0.2, w/2, h/2, h * 0.9);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
    
    time += 16;
    requestAnimationFrame(render);
  }
  
  render();
}

// ============================================
// SEEKERS - Bioluminescent swarm reacting to light
// ============================================

function openSeekersScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(100, 300)}px`;
  windowEl.style.top = `${randomInt(50, 150)}px`;
  windowEl.style.width = '600px';
  windowEl.style.height = '450px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4913</div>
    </div>
    <div class="seekers-canvas-scene" style="position: relative; height: calc(100% - 36px); background: #010508; border-radius: 0 0 12px 12px; overflow: hidden;">
      <canvas id="seekers-canvas-${windowId}" style="width: 100%; height: 100%;"></canvas>
      <div style="position: absolute; top: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5); text-transform: uppercase; letter-spacing: 0.1em;">DEPTH: 890m</div>
      <div style="position: absolute; top: 12px; right: 12px; font-size: 9px; color: rgba(255, 150, 100, 0.7);">● REC</div>
      <div style="position: absolute; bottom: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">BIOLUM ACTIVITY: HIGH</div>
      <div style="position: absolute; bottom: 12px; right: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">02:14:07</div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  makeResizable(windowEl);
  
  setTimeout(() => {
    startSeekersCanvas(`seekers-canvas-${windowId}`, windowId);
  }, 100);
  
  if (ambience) {
    ambience.addLayer('bioluminescence', { intensity: 0.15, fadeIn: 3 });
  }
  
  addJournalEntry("Dive 4913: Encountered dense swarm of bioluminescent organisms. Species unidentified. They seem... curious about the ROV light.");
  
  return windowId;
}

function startSeekersCanvas(canvasId, windowId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let time = 0;
  
  // Mouse is the ROV light
  const light = { x: -1000, y: -1000, prevX: -1000, prevY: -1000 };
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    light.prevX = light.x;
    light.prevY = light.y;
    light.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    light.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  
  canvas.addEventListener('mouseleave', () => {
    light.x = -1000;
    light.y = -1000;
  });
  
  // Use visual-toolkit for seekers
  const VT = window.VisualToolkit;
  let seekers = [];
  
  // Marine snow particles
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 1.5,
      speed: 0.0005 + Math.random() * 0.001,
      alpha: 0.1 + Math.random() * 0.2,
    });
  }
  
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const oldW = canvas.width / window.devicePixelRatio || rect.width;
    const oldH = canvas.height / window.devicePixelRatio || rect.height;
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const w = rect.width;
    const h = rect.height;
    
    // Initialize seekers using toolkit (center-biased spawn)
    if (seekers.length === 0) {
      seekers = VT.createSeekerSwarm(50, w, h, { spawnBias: 'center' });
    }
  }
  resize();
  
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  
  function isWindowOpen() {
    return document.getElementById(windowId) !== null;
  }
  
  // Using toolkit's updateSeekerWithDrift and drawSeekerSwarm
  
  function render() {
    if (!isWindowOpen()) {
      resizeObserver.disconnect();
      return;
    }
    
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    
    // Deep water background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#020810');
    bgGrad.addColorStop(0.5, '#010508');
    bgGrad.addColorStop(1, '#000305');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Calculate light speed
    const lightSpeed = Math.sqrt(
      (light.x - light.prevX) ** 2 + (light.y - light.prevY) ** 2
    );
    
    // Update seekers using toolkit (with center drift to prevent edge clustering)
    VT.updateSeekerSwarm(seekers, light.x, light.y, lightSpeed, w, h, 0.02);
    
    // Draw seekers using toolkit (handles sorting and glow rendering)
    VT.drawSeekerSwarm(ctx, seekers, {
      lightX: light.x,
      lightY: light.y,
      lightRadius: 120,
      time: time,
    });
    
    // Marine snow
    for (const p of particles) {
      p.y += p.speed;
      p.x += Math.sin(time * 0.001 + p.y * 5) * 0.0003;
      if (p.y > 1.05) {
        p.y = -0.05;
        p.x = Math.random();
      }
      ctx.fillStyle = `rgba(150, 180, 200, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Player light (ROV spotlight) - dimmer than other scenes to let seekers shine
    if (light.x > 0 && light.x < w) {
      for (let i = 3; i >= 1; i--) {
        const layerRadius = 100 * (i / 2);
        const alpha = 0.08 / i;
        const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, layerRadius);
        grad.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
        grad.addColorStop(0.5, `rgba(100, 180, 220, ${alpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Small bright core
      const core = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 10);
      core.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      core.addColorStop(0.5, 'rgba(200, 240, 255, 0.3)');
      core.addColorStop(1, 'transparent');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(light.x, light.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Soft vignette
    const vignette = ctx.createRadialGradient(w/2, h/2, h * 0.3, w/2, h/2, h * 0.85);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
    
    time += 16;
    requestAnimationFrame(render);
  }
  
  render();
}

// ============================================
// TENDRIL - Single organic tendril reaching toward light
// ============================================

async function openShadowsScene() {
  const windowId = generateId('window');

  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(100, 300)}px`;
  windowEl.style.top = `${randomInt(50, 150)}px`;
  windowEl.style.width = '600px';
  windowEl.style.height = '450px';

  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4914</div>
    </div>
    <div class="shadows-canvas-scene" style="position: relative; height: calc(100% - 36px); background: #010508; border-radius: 0 0 12px 12px; overflow: hidden;">
      <canvas id="shadows-canvas-${windowId}" style="width: 100%; height: 100%;"></canvas>
      <div style="position: absolute; top: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5); text-transform: uppercase; letter-spacing: 0.1em;">DEPTH: 1,450m</div>
      <div style="position: absolute; top: 12px; right: 12px; font-size: 9px; color: rgba(255, 150, 100, 0.7);">● REC</div>
      <div style="position: absolute; bottom: 12px; left: 12px; font-size: 9px; color: rgba(255, 100, 100, 0.6);">⚠ PROXIMITY WARNING</div>
      <div style="position: absolute; bottom: 12px; right: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">03:22:18</div>
    </div>
  `;

  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);

  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  makeResizable(windowEl);

  // Initialize visual-toolkit Shadows scene
  setTimeout(async () => {
    const canvas = document.getElementById(`shadows-canvas-${windowId}`);
    if (!canvas) return;

    // Access scene from VisualToolkit global bundle
    const ShadowsScene = window.VisualToolkit?.scenes?.deepSea?.shadows;
    if (!ShadowsScene) {
      console.error('[Scene] Shadows scene not available from VisualToolkit');
      return;
    }

    // Initialize scene
    await ShadowsScene.init(canvas, { intensity: 0.5, duration: Infinity });

    // Store scene for cleanup
    activeScenes.set(windowId, ShadowsScene);
  }, 100);

  if (ambience) {
    ambience.addLayer('tension', { intensity: 0.3, fadeIn: 2 });
  }

  addJournalEntry("Dive 4914: Shadows moving across the seafloor. Multiple appendages detected. Origin unknown.");

  return windowId;
}

// ============================================
// GIANT SQUID - Tentacles from the darkness
// ============================================

function openGiantSquidScene() {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window video-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(100, 300)}px`;
  windowEl.style.top = `${randomInt(50, 150)}px`;
  windowEl.style.width = '600px';
  windowEl.style.height = '450px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">ROV Footage Viewer</div>
      <div class="window-badge">Dive 4912</div>
    </div>
    <div class="squid-canvas-scene" style="position: relative; height: calc(100% - 36px); background: #000; border-radius: 0 0 12px 12px; overflow: hidden;">
      <canvas id="squid-canvas-${windowId}" style="width: 100%; height: 100%;"></canvas>
      <div style="position: absolute; top: 12px; left: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5); text-transform: uppercase; letter-spacing: 0.1em;">DEPTH: 1,200m</div>
      <div style="position: absolute; top: 12px; right: 12px; font-size: 9px; color: rgba(255, 150, 100, 0.7);">● REC</div>
      <div style="position: absolute; bottom: 12px; right: 12px; font-size: 9px; color: rgba(77, 208, 225, 0.5);">01:47:33</div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  makeResizable(windowEl);
  
  setTimeout(() => {
    startGiantSquidCanvas(`squid-canvas-${windowId}`, windowId);
  }, 100);
  
  // Audio for squid encounter
  if (ambience) {
    ambience.addLayer('tension', { intensity: 0.25, fadeIn: 2 });
  }
  if (sfx) {
    sfx.play('discovery');
    setTimeout(() => sfx.play('creature'), 3000);
  }
  
  addJournalEntry("Dive 4912: Massive cephalopod passing. Estimate 12+ meters. Architeuthis?");
  
  return windowId;
}

function startGiantSquidCanvas(canvasId, windowId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let time = 0;
  
  // Mouse/light position
  const mouse = { x: -1000, y: -1000 };
  
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });
  
  // Particles floating in water
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.0003 + 0.0001,
      drift: Math.random() * 0.0002 - 0.0001,
      alpha: Math.random() * 0.3 + 0.1
    });
  }
  
  // ONE massive tentacle that drags across the screen
  const tentacle = {
    // Control points for a bezier-like path
    progress: 0,        // 0 to 1, how far across the screen
    yCenter: 0.5,       // Vertical center position
    thickness: 120,     // HUGE
    phase: 0
  };
  
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  
  function isWindowOpen() {
    return document.getElementById(windowId) !== null;
  }
  
  function drawMassiveTentacle() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    
    // Tentacle moves from left to right across frame
    const headX = -w * 0.3 + tentacle.progress * w * 1.6;
    const wave = time * 0.0008;
    
    // Build the tentacle as a series of segments
    const segments = 50;
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
      const ratio = i / segments;
      
      // X position trails behind the "head"
      const segmentX = headX - ratio * w * 0.8;
      
      // Y position with organic wave motion
      const baseY = h * tentacle.yCenter;
      const waveY = Math.sin(wave + ratio * 3) * h * 0.15;
      const slowWave = Math.sin(wave * 0.3 + ratio * 1.5) * h * 0.08;
      const segmentY = baseY + waveY + slowWave;
      
      // Thickness tapers toward the tip (which is offscreen left)
      const segmentThickness = tentacle.thickness * (1 - ratio * 0.6);
      
      points.push({ x: segmentX, y: segmentY, thickness: segmentThickness });
    }
    
    // Draw the tentacle body (thick fleshy arm)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      
      // Skip if completely off screen
      if (p0.x < -100 && p1.x < -100) continue;
      if (p0.x > w + 100 && p1.x > w + 100) continue;
      
      // Color gradient - deep red/maroon flesh
      const ratio = i / points.length;
      const r = 70 + ratio * 30;
      const g = 20 + ratio * 15;
      const b = 35 + ratio * 15;
      
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = (p0.thickness + p1.thickness) / 2;
      
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    
    // Draw suction cups along the underside
    for (let i = 2; i < points.length - 2; i += 3) {
      const p = points[i];
      
      // Skip if off screen
      if (p.x < -50 || p.x > w + 50) continue;
      
      const cupSize = p.thickness * 0.25;
      
      // Get angle of tentacle at this point
      const dx = points[i + 1].x - points[i - 1].x;
      const dy = points[i + 1].y - points[i - 1].y;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      
      // Place cup on the "underside"
      const cupX = p.x + Math.cos(angle) * p.thickness * 0.35;
      const cupY = p.y + Math.sin(angle) * p.thickness * 0.35;
      
      // Outer ring (rim of sucker)
      ctx.beginPath();
      ctx.arc(cupX, cupY, cupSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(50, 15, 25, 0.9)';
      ctx.fill();
      
      // Inner dark center
      ctx.beginPath();
      ctx.arc(cupX, cupY, cupSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 5, 10, 0.95)';
      ctx.fill();
      
      // Highlight ring
      ctx.beginPath();
      ctx.arc(cupX, cupY, cupSize * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 40, 50, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Bioluminescent chromatophores - sparse, pulsing
    for (let i = 5; i < points.length - 5; i += 8) {
      const p = points[i];
      if (p.x < 0 || p.x > w) continue;
      
      const pulsePhase = time * 0.002 + i * 0.3;
      const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;
      const spotSize = 4 + pulse * 3;
      const alpha = 0.3 + pulse * 0.4;
      
      // Main spot
      ctx.beginPath();
      ctx.arc(p.x, p.y, spotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80, 180, 220, ${alpha})`;
      ctx.fill();
      
      // Glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, spotSize * 4);
      glow.addColorStop(0, `rgba(80, 180, 220, ${alpha * 0.4})`);
      glow.addColorStop(1, 'rgba(80, 180, 220, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, spotSize * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Texture/detail lines along the flesh
    ctx.strokeStyle = 'rgba(40, 10, 20, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 4; i < points.length - 4; i += 6) {
      const p = points[i];
      if (p.x < 0 || p.x > w) continue;
      
      const dx = points[i + 1].x - points[i - 1].x;
      const dy = points[i + 1].y - points[i - 1].y;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      
      ctx.beginPath();
      ctx.moveTo(
        p.x + Math.cos(angle) * p.thickness * 0.4,
        p.y + Math.sin(angle) * p.thickness * 0.4
      );
      ctx.lineTo(
        p.x - Math.cos(angle) * p.thickness * 0.4,
        p.y - Math.sin(angle) * p.thickness * 0.4
      );
      ctx.stroke();
    }
  }
  
  function render() {
    if (!isWindowOpen()) {
      resizeObserver.disconnect();
      return;
    }
    
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    
    // Dark abyss background
    ctx.fillStyle = '#020306';
    ctx.fillRect(0, 0, w, h);
    
    // Subtle blue depth gradient
    const depthGrad = ctx.createLinearGradient(0, 0, 0, h);
    depthGrad.addColorStop(0, 'rgba(5, 15, 30, 0.4)');
    depthGrad.addColorStop(1, 'rgba(0, 5, 15, 0.2)');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Draw particles (marine snow)
    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
      
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 180, 200, ${p.alpha})`;
      ctx.fill();
    }
    
    // ROV light follows mouse
    if (mouse.x > 0 && mouse.x < w) {
      const lightGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
      lightGrad.addColorStop(0, 'rgba(200, 220, 255, 0.12)');
      lightGrad.addColorStop(0.5, 'rgba(150, 180, 220, 0.04)');
      lightGrad.addColorStop(1, 'rgba(100, 150, 200, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Animate tentacle progress (slowly drags across)
    if (time > 1000) {
      tentacle.progress = Math.min((time - 1000) / 12000, 1.2);
    }
    
    // Draw the massive tentacle
    drawMassiveTentacle();
    
    // Heavy vignette for depth
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
    
    time += 16;
    animationId = requestAnimationFrame(render);
  }
  
  render();
}

// ============================================
// IMAGE PREVIEW - Specimen photos
// ============================================

function openImagePreview(filename, enhancement = null) {
  const windowId = generateId('window');
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window image-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(200, 450)}px`;
  windowEl.style.top = `${randomInt(100, 300)}px`;
  windowEl.style.width = '420px';
  
  const enhancementStyle = enhancement ? enhancement.style : '';
  const enhancementBadge = enhancement ? `<div class="enhancement-badge">✨ ${enhancement.name}</div>` : '';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">Image Viewer</div>
    </div>
    <div class="image-preview" style="${enhancementStyle}">
      <!-- Deep water background -->
      <div class="deep-water"></div>
      
      <!-- Marine snow -->
      <div class="marine-snow">
        ${Array.from({length: 15}, (_, i) => `<div class="snow-particle" style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 5}s;"></div>`).join('')}
      </div>
      
      <!-- Creature in frame - could be jellyfish, fish, or specimen -->
      <div class="creatures">
        <div class="creature jellyfish centered" style="left: 50%; top: 40%;">
          <div class="jelly-bell"></div>
          <div class="jelly-tentacles">
            <div class="tentacle"></div>
            <div class="tentacle"></div>
            <div class="tentacle"></div>
            <div class="tentacle"></div>
          </div>
        </div>
      </div>
      
      <!-- Photo metadata overlay -->
      <div class="photo-metadata">
        <div class="photo-label">${filename}</div>
        <div class="photo-info">Frame capture • Enhanced</div>
      </div>
      
      ${enhancementBadge}
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  makeResizable(windowEl);
  
  if (enhancement) {
    setTimeout(() => {
      showToast(`${enhancement.message} - personalized for your viewing experience`);
    }, 800);
  }
  
  return windowId;
}

// ============================================
// WINDOWS
// ============================================

// Character-specific apps that might "helpfully" open
const CHARACTER_APPS = [
  { 
    title: "ROV Footage Viewer", 
    content: "Dive 4847 is queued for playback. Timestamp 02:34:17 has been bookmarked based on your viewing history.",
    reason: "You usually review footage around now"
  },
  { 
    title: "Specimen Database", 
    content: "Query: 'unidentified deep-sea organism'. 0 matches found. Would you like to submit another identification request?",
    reason: "Based on your recent searches"
  },
  { 
    title: "Grant Tracker", 
    content: "NOAA proposal deadline: 14 days. Your draft has been auto-saved 47 times. Progress appears to be... ongoing.",
    reason: "Your schedule shows this is urgent"
  },
  { 
    title: "Field Notes", 
    content: "Your most recent annotation: 'Movement pattern inconsistent with known species. Bioluminescence irregular. Need better footage.' [Dive 4847]",
    reason: "Continuing where you left off"
  },
  { 
    title: "Email: MBARI Team", 
    content: "You have 3 unread messages from the research team. Subject: 'Re: Specimen 47 Review Request (3rd submission)'",
    reason: "Based on your communication patterns"
  },
  { 
    title: "Creative Writing.app", 
    content: "Draft: 'Untitled Project' — Last edited 2 weeks ago. 12,847 words. We kept it safe for you.",
    reason: "Your personal projects miss you"
  },
  { 
    title: "Dive Log", 
    content: "Total ROV hours reviewed this month: 127. Most viewed: Dive 4847 (23 hours). Average depth of interest: 2,400m.",
    reason: "Your weekly summary is ready"
  },
  { 
    title: "Species Catalog", 
    content: "Recently viewed: Barreleye fish, Giant isopod, Dumbo octopus, [UNIDENTIFIED - Dive 4847]. Based on your interests.",
    reason: "Recommended for your research"
  },
];

function openUnexpectedWindow(options = {}) {
  const windowId = generateId('window');
  const app = options.app || randomChoice(CHARACTER_APPS);
  const reason = options.reason || app.reason;
  const title = options.title || app.title;
  const content = options.content || app.content;
  
  const windowEl = document.createElement('div');
  windowEl.className = 'window unexpected-window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(250, 500)}px`;
  windowEl.style.top = `${randomInt(150, 350)}px`;
  windowEl.style.width = '360px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">${title}</div>
      <div class="window-badge">${reason}</div>
    </div>
    <div class="window-content">
      <p style="color: rgba(150, 200, 230, 0.8); line-height: 1.6;">${content}</p>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  // Make window draggable by header
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
  
  // Make window resizable
  makeResizable(windowEl);
  
  // Add to journal
  addJournalEntry(`A window opened: "${title}" - ${reason.toLowerCase()}.`);
  
  return windowId;
}

function closeWindow(windowId) {
  // Clean up active scene if it exists
  if (activeScenes.has(windowId)) {
    const scene = activeScenes.get(windowId);
    scene.cleanup();
    activeScenes.delete(windowId);
  }

  const el = document.getElementById(windowId);
  if (el) {
    if (sfx) sfx.play('close');
    el.style.transition = 'opacity 0.3s, transform 0.3s';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.95)';
    setTimeout(() => el.remove(), 300);
  }
  state.openWindows = state.openWindows.filter(id => id !== windowId);
}

// ============================================
// CHAOS ENGINE
// ============================================

function runChaosEvent() {
  const events = [
    // Add new character-related file
    { weight: 2, action: () => {
      const newFiles = [
        { name: "Dive_4848_preview.mp4", icon: "🎬" },
        { name: "Dive_4914_midwater_shadows.mp4", icon: "🎬" },
        { name: "specimen_comparison.png", icon: "🖼️" },
        { name: "bioluminescence_patterns.xlsx", icon: "📊" },
        { name: "MBARI_meeting_notes.docx", icon: "📄" },
        { name: "pressure_calculations.py", icon: "📋" },
        { name: "Recommended for Dr. Petrovic/", icon: "📁" },
        { name: "fanfic_draft_ch3.docx", icon: "📝" },
      ];
      const newFile = randomChoice(newFiles);
      const file = addFile({ 
        name: newFile.name, 
        icon: newFile.icon
      });
      if (newFile.name.includes('midwater_shadows')) {
        showToast(`New footage processed: "${file.name}" - midwater contact logged`);
        addJournalEntry("Dive 4914: Additional midwater footage processed. Shadow patterns suggest multiple organisms.");
      } else {
        showToast(`New file appeared: "${file.name}" - based on your recent activity`);
      }
    }},
    
    // Rename file to personalized name
    { weight: 2, action: () => {
      if (state.files.length > 0) {
        const file = randomChoice(state.files);
        const oldName = file.name;
        const newName = randomChoice(REPLACEMENT_NAMES);
        renameFile(file.id, newName);
        showToast(`"${oldName}" was renamed to "${newName}" - organized for you`);
      }
    }},
    
    // Remove file (moved somewhere "better")
    { weight: 1, action: () => {
      if (state.files.length > 4) {
        const file = randomChoice(state.files);
        showToast(`"${file.name}" was archived - we detected you weren't using it frequently`);
        removeFile(file.id);
      }
    }},
    
    // Move file around
    { weight: 2, action: () => {
      if (state.files.length > 0) {
        const file = randomChoice(state.files);
        moveFile(file.id, randomInt(50, 500), randomInt(130, 480));
        showToast(`"${file.name}" relocated - optimized for your workflow`);
      }
    }},
    
    // Open unexpected app window
    { weight: 2, action: () => {
      openUnexpectedWindow();
    }},
    
    // Journal message about their research
    { weight: 2, action: () => {
      showToast(randomChoice(JOURNAL_MESSAGES));
    }},
    
    // Obsession-specific message (higher weight - this is important!)
    { weight: 3, action: () => {
      showToast(randomChoice(OBSESSION_MESSAGES));
    }},
    
    // Change greeting (name confusion)
    { weight: 1, action: () => {
      setGreeting();
      showToast("Your personalized greeting has been updated.");
    }},
    
    // "Enhance" a media file with helpful debugging CSS
    { weight: 2, action: () => {
      const mediaFiles = state.files.filter(f => 
        f.name.includes('.mp4') || f.name.includes('.png') || f.name.includes('.jpg')
      );
      if (mediaFiles.length > 0) {
        const file = randomChoice(mediaFiles);
        const enhancement = getRandomEnhancement();
        showToast(`"${file.name}" was enhanced: ${enhancement.message}`);
        addJournalEntry(`Applied "${enhancement.name}" to ${file.name}. Your media has been optimized.`);
      }
    }},
    
    // IT Department notification (security)
    { weight: 2, action: () => {
      showITNotification('security');
    }},
    
    // IT Department notification (restrictions)
    { weight: 1, action: () => {
      showITNotification('restrictions');
    }},
    
    // IT Department notification (compliance)
    { weight: 2, action: () => {
      showITNotification('compliance');
    }},
    
    // IT Department notification (network)
    { weight: 1, action: () => {
      showITNotification('network');
    }},
    
    // IT Department notification (optimizations) - IT "helpfully" did something
    { weight: 2, action: () => {
      showITNotification('optimizations');
    }},
  ];
  
  // Weighted random selection
  const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const event of events) {
    random -= event.weight;
    if (random <= 0) {
      event.action();
      break;
    }
  }
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  // Set greeting
  setGreeting();
  
  // Start clock
  updateClock();
  setInterval(updateClock, 1000);
  
  // Make journal window draggable and resizable
  const journalWindow = document.getElementById('journal-window');
  const journalHeader = journalWindow.querySelector('.window-header');
  makeDraggable(journalWindow, journalHeader);
  journalHeader.style.cursor = 'grab';
  makeResizable(journalWindow);
  
  // Try to connect to backend (will fall back to standalone mode if unavailable)
  connectWebSocket();
  
  // Add character's initial files (the marine biologist's desktop)
  // These show immediately; backend will sync/override if connected
  const filePositions = [
    { x: 50, y: 140 },
    { x: 50, y: 290 },
    { x: 50, y: 440 },
    { x: 220, y: 140 },
    { x: 220, y: 290 },
    { x: 220, y: 440 },
    { x: 390, y: 140 },
    { x: 390, y: 290 },
  ];
  
  INITIAL_FILES.forEach((file, i) => {
    const pos = filePositions[i] || { x: randomInt(60, 340), y: randomInt(140, 420) };
    addFile({ 
      name: file.name, 
      icon: file.icon, 
      x: pos.x, 
      y: pos.y 
    });
  });
  
  // Add character-specific journal entries
  addJournalEntry(`Welcome back, ${randomChoice(CHARACTER_NAMES)}. Your research files are ready.`);
  addJournalEntry("ROV footage queue updated. 12 new clips based on your depth preferences.");
  addJournalEntry("We noticed you've been thinking about Dive 4847. Here's the timestamp you bookmarked.");
  addJournalEntry("Dive 4914: Multiple contacts detected. Wall structure and midwater shadows logged. Review footage when ready.");
  addJournalEntry("Dive 4913: Bioluminescent swarm behavior documented. Organisms showed unusual light-seeking patterns.");
  
  // Start local chaos events (these run regardless of backend connection)
  // When backend is connected, it will ALSO send chaos events
  // This creates layered chaos - local UI quirks + real filesystem changes
  setTimeout(() => {
    runChaosEvent();
    // Slightly longer interval when backend might also be sending events
    const interval = wsConnected ? randomInt(15000, 25000) : randomInt(10000, 18000);
    setInterval(runChaosEvent, interval);
  }, 10000);
}

// Start the OS
document.addEventListener('DOMContentLoaded', init);

// Expose functions globally (needed for onclick handlers)
window.closeWindow = closeWindow;

// Expose functions for console debugging
window.NarrativeOS = {
  addFile,
  removeFile,
  renameFile,
  moveFile,
  showToast,
  showITNotification,
  addJournalEntry,
  openUnexpectedWindow,
  openVideoPreview,
  openAnglerfishScene,
  openPressureScene,
  openBiolumScene,
  openLeviathanScene,
  openGiantSquidScene,
  openROVExteriorScene,
  openSeekersScene,
  openShadowsScene,
  openWallScene,
  runChaosEvent,
  state,
  // WebSocket functions
  connectWebSocket,
  sendToBackend,
  get wsConnected() { return wsConnected; },
  // Audio controls
  get audio() { return { ambience, sfx, initialized: audioInitialized }; },
  playSound: (type) => sfx && sfx.play(type),
  stopAmbience: (fadeOut = 2) => ambience && ambience.stop(fadeOut),
};

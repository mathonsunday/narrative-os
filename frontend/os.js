// Narrative OS - Frontend Logic
// Character: Deep sea researcher at MBARI
// Names: Dr. Petrovic / M. Petrovic / Mira / Rem

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

const CHARACTER_NAMES = ["Dr. Petrovic", "M. Petrovic", "Mira", "Rem"];

const GREETINGS = [
  { text: "Welcome back, Dr. Petrovic", sub: "Your dive logs are ready for review" },
  { text: "Good morning, Mira", sub: "The ROV footage finished processing" },
  { text: "Hey Rem", sub: "You left your annotations open" },
  { text: "Back again, M. Petrovic?", sub: "We saved your spot in the footage" },
  { text: "Still thinking about Dive 4847?", sub: "We kept the clip ready for you" },
  { text: "How was the team meeting, Dr. Petrovic?", sub: "Your notes were auto-saved" },
  { text: "Welcome back, Mira", sub: "3 new specimens awaiting classification" },
  { text: "Good to see you, Rem", sub: "Your draft has been auto-backed up" },
  { text: "Back from the aquarium, M. Petrovic?", sub: "Hope the exhibit went well" },
  { text: "Ready for another dive review?", sub: "Based on your schedule, you usually start now" },
  { text: "Hi Dr. Petrovic", sub: "Or do you prefer Mira today?" },
  { text: "Welcome, Mira", sub: "Your personal folder was recently updated" },
  { text: "Hey there", sub: "We weren't sure which name to use" },
  { text: "Good evening, Rem", sub: "Your creative project misses you" },
  { text: "Back for more footage?", sub: "We organized your recent views" },
];

const INITIAL_FILES = [
  { name: "Dive_4847_02-34-17.mp4", icon: "🎬" },
  { name: "unidentified_specimen_47/", icon: "📁" },
  { name: "NOAA_grant_proposal_v4.docx", icon: "📄" },
  { name: "Barreleye_sighting_log.xlsx", icon: "📊" },
  { name: "eDNA_samples_Dec2025.csv", icon: "📋" },
  { name: "Personal/", icon: "🔒" },
  { name: "ROV_footage_queue/", icon: "🎥" },
  { name: "Paper_draft_midwater.docx", icon: "📝" },
];

const REPLACEMENT_NAMES = [
  "Recommended: Dive_4847_02-34-17.mp4",
  "Your most viewed",
  "Based on your research interests",
  "Specimens you might recognize",
  "Picked for Dr. Petrovic",
  "Mira's favorites",
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
  
  // Double-click to open
  el.addEventListener('dblclick', () => openFile(file));
  
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
    "ROV_footage_queue/": {
      type: "folder",
      title: "ROV Queue",
      content: "Pending review: 12 clips<br><br>• Dive_4852_09-12-33.mp4 (new)<br>• Dive_4851_14-22-10.mp4<br>• Dive_4850_03-45-01.mp4<br>• ... 9 more<br><br><em>Sorted by relevance to your interests.</em>"
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
  const el = document.getElementById(windowId);
  if (el) {
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
      showToast(`New file appeared: "${file.name}" - based on your recent activity`);
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
  runChaosEvent,
  state,
  // WebSocket functions
  connectWebSocket,
  sendToBackend,
  get wsConnected() { return wsConnected; },
};

// Narrative OS - Desert Geology Theme
// Character: Dr. Alex Chen - Field Geologist

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
  sfx = new window.AudioEngine.SoundEffect(0.3);
  
  // Desert wind ambience - will need to adapt audio engine for desert sounds
  // For now, using placeholder - will need desert theme audio
  ambience.play('deepSea', { 
    intensity: 0.2,
    depth: 1000,
    mystery: 0,
    fadeIn: 3
  });
  
  // Set master volume
  ambience.setVolume(0.4);
  
  console.log('[Audio] Desert ambience started');
}

// Initialize audio on first user interaction
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });

// ============================================
// WEBSOCKET CONNECTION
// ============================================

const WS_URL = 'ws://localhost:8765';
let ws = null;
let wsConnected = false;

function connectWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  
  try {
    ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      wsConnected = true;
      showToast("Field station connected. Real-time updates enabled.", 3000);
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
      wsConnected = false;
    };
    
    ws.onerror = () => {
      console.log('[WS] Connection error - backend may not be running');
    };
  } catch (e) {
    console.log('[WS] WebSocket not available, running in standalone mode');
  }
}

function handleBackendEvent(event) {
  switch (event.type) {
    case 'connected':
      addJournalEntry(event.message || "Field station connected.");
      break;
    case 'filesystem_state':
      syncFilesystemState(event.desktop);
      break;
    case 'file_created':
      handleFileCreated(event);
      break;
    case 'journal_entry':
      addJournalEntry(event.message);
      break;
  }
}

function syncFilesystemState(desktopFiles) {
  if (!desktopFiles) return;
  desktopFiles.forEach(file => {
    console.log('[WS] Backend file:', file.name);
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

function sendToBackend(type, data = {}) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...data }));
  }
}

// ============================================
// CHARACTER DATA - Geologist
// ============================================

const CHARACTER_NAMES = ["Dr. Chen", "Alex", "Dr. Alex Chen"];

const GREETINGS = [
  { text: "Welcome back, Dr. Chen", sub: "Your field notes are ready for review" },
  { text: "Good morning, Alex", sub: "The survey data finished processing" },
  { text: "Hey Alex", sub: "You left your GPS coordinates open" },
  { text: "Back again, Dr. Chen?", sub: "We saved your spot in the rock samples" },
  { text: "Still thinking about Site 47?", sub: "We kept the formation data ready" },
  { text: "How was the field work, Dr. Chen?", sub: "Your notes were auto-saved" },
  { text: "Welcome back, Alex", sub: "3 new samples awaiting classification" },
  { text: "Good to see you, Alex", sub: "Your draft has been auto-backed up" },
  { text: "Back from the dig site, Dr. Chen?", sub: "Hope the survey went well" },
  { text: "Ready for another sample review?", sub: "Based on your schedule, you usually start now" },
  { text: "Hi Dr. Chen", sub: "The desert awaits" },
  { text: "Welcome, Alex", sub: "Your personal folder was recently updated" },
  { text: "Good evening, Alex", sub: "Late night research session?" },
  { text: "Back for more survey data?", sub: "We organized your recent views" },
];

const INITIAL_FILES = [
  { name: "Site_47_formation_analysis.pdf", icon: "📄" },
  { name: "GPS_coordinates_Jan2025.csv", icon: "📋" },
  { name: "Rock_samples_catalog.xlsx", icon: "📊" },
  { name: "unidentified_formation_12/", icon: "📁" },
  { name: "NSF_grant_proposal_v3.docx", icon: "📄" },
  { name: "Stratigraphy_log_2025.xlsx", icon: "📊" },
  { name: "Field_notes_Jan15.txt", icon: "📝" },
  { name: "Personal/", icon: "🔒" },
  { name: "Paper_draft_geology.docx", icon: "📝" },
];

const REPLACEMENT_NAMES = [
  "Recommended: Site_47_formation_analysis.pdf",
  "Your most viewed",
  "Based on your research interests",
  "Formations you might recognize",
  "Picked for Alex",
  "Dr. Chen's favorites",
  "Continue your analysis",
  "Trending in geology",
  "Similar to your recent work",
  "Curated geological content",
  "Because you study desert formations",
  "Your unfinished annotations",
];

const FILE_ICONS = ["📁", "📄", "🗂️", "📋", "📝", "📊", "🗺️", "🔬", "⛏️", "🪨"];

const JOURNAL_MESSAGES = [
  "We noticed you've accessed Site_47_formation_analysis.pdf frequently. It's been moved to quick access.",
  "Your 'unidentified_formation_12' folder was reorganized for easier reference.",
  "The grant proposal deadline is approaching. We've highlighted it for you.",
  "Based on your viewing patterns, you seem interested in stratigraphic anomalies. Here are related files.",
  "Your Personal folder hasn't been opened in a while. We've kept it safe for you.",
  "We detected a pattern in your research. You often return to Site 47 around this time.",
  "Your survey data queue has been prioritized based on your interests.",
  "The system noticed you switch between professional and personal files. We've organized accordingly.",
  "A new sample was added to your classification queue. It reminded us of something you analyzed before.",
  "Your stratigraphy log was backed up. You seem to value this data.",
  "We've learned you prefer GPS coordinates in your filenames. Future files will match this pattern.",
  "Based on your behavior, you might want to revisit your paper draft soon.",
];

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  files: [],
  openWindows: [],
};

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
// FILE MANAGEMENT
// ============================================

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
  
  return file;
}

function createFileElement(file) {
  const el = document.createElement('div');
  el.className = 'file-icon';
  el.id = file.id;
  el.style.left = `${file.x}px`;
  el.style.top = `${file.y}px`;
  
  el.innerHTML = `
    <div class="icon">${file.icon}</div>
    <div class="label">${file.name}</div>
  `;
  
  el.addEventListener('dblclick', () => {
    openFile(file);
  });
  
  makeDraggable(el);
  
  return el;
}

function removeFile(fileId) {
  const file = state.files.find(f => f.id === fileId);
  if (!file) return;
  
  const el = document.getElementById(fileId);
  if (el) {
    el.classList.add('disappearing');
    setTimeout(() => el.remove(), 500);
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

function getIconForFile(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': '📄',
    'docx': '📄',
    'doc': '📄',
    'xlsx': '📊',
    'xls': '📊',
    'csv': '📋',
    'txt': '📝',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
  };
  return iconMap[ext] || '📄';
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
// FILE OPENING
// ============================================

function openFile(file) {
  showToast(`Opening "${file.name}"...`);
  sendToBackend('file_opened', { filename: file.name });
  
  const fileContents = {
    "Site_47_formation_analysis.pdf": {
      type: "document",
      title: "PDF Viewer",
      content: "<strong>Site 47 Formation Analysis</strong><br><br>Stratigraphic layers indicate significant geological activity. Sample 12-A shows unusual mineral composition...<br><br><em>Last accessed: Today, 3:22 PM</em>"
    },
    "GPS_coordinates_Jan2025.csv": {
      type: "spreadsheet",
      title: "Data Viewer",
      content: `<div class="spreadsheet-preview">
        <table>
          <tr><th>Date</th><th>Site</th><th>Lat</th><th>Lon</th><th>Notes</th></tr>
          <tr><td>01/15</td><td>47</td><td>36.234</td><td>-116.891</td><td>Formation detected</td></tr>
          <tr><td>01/18</td><td>48</td><td>36.198</td><td>-116.923</td><td>Sample collected</td></tr>
          <tr><td>01/22</td><td>47</td><td>36.234</td><td>-116.891</td><td class="highlight">ANOMALY</td></tr>
        </table>
        <div class="spreadsheet-note">47 rows • Last modified: 3:22 PM</div>
      </div>`
    },
    "Rock_samples_catalog.xlsx": {
      type: "spreadsheet",
      title: "Sample Database",
      content: `<div class="spreadsheet-preview">
        <table>
          <tr><th>Sample ID</th><th>Site</th><th>Type</th><th>Status</th></tr>
          <tr><td>R-47-001</td><td>47</td><td>Sedimentary</td><td>Analyzed</td></tr>
          <tr><td>R-47-002</td><td>47</td><td class="highlight">UNKNOWN</td><td class="highlight">PENDING</td></tr>
          <tr><td>R-48-001</td><td>48</td><td>Igneous</td><td>Analyzed</td></tr>
        </table>
        <div class="spreadsheet-note">23 samples • 1 unidentified</div>
      </div>`
    },
    "unidentified_formation_12/": {
      type: "folder",
      title: "Formation 12 - Research Folder",
      content: "Contents: 15 photos, 8 analysis files, 12 GPS waypoints, 3 unanswered identification requests.<br><br>Most recent note: 'The way it layers. Not like any sedimentary formation. Not like any igneous intrusion. Something else.'<br><br>Last modified: Today, 3:22 PM"
    },
    "NSF_grant_proposal_v3.docx": {
      type: "document",
      title: "Document Editor",
      content: "<strong>NSF Desert Geology Research Grant Proposal v3</strong><br><br>Abstract: This research proposes extended field observation of desert formations in the Mojave, with particular focus on...<br><br><em>[Draft auto-saved. You've been on this page for 3 hours.]</em>"
    },
    "Stratigraphy_log_2025.xlsx": {
      type: "spreadsheet",
      title: "Stratigraphy Database",
      content: `<div class="spreadsheet-preview">
        <table>
          <tr><th>Layer</th><th>Depth</th><th>Composition</th><th>Age Est.</th></tr>
          <tr><td>A</td><td>0-2m</td><td>Sandstone</td><td>Recent</td></tr>
          <tr><td>B</td><td>2-5m</td><td>Limestone</td><td>Pleistocene</td></tr>
          <tr><td class="highlight">C</td><td>5-8m</td><td class="highlight">UNKNOWN</td><td class="highlight">?</td></tr>
        </table>
        <div class="spreadsheet-note">12 layers logged</div>
      </div>`
    },
    "Field_notes_Jan15.txt": {
      type: "document",
      title: "Field Notes",
      content: "<strong>Field Notes - January 15, 2025</strong><br><br>Site 47: Formation shows unusual layering pattern. GPS: 36.234, -116.891<br><br>Sample R-47-002 doesn't match any known mineral composition. Sending for lab analysis.<br><br><em>[Auto-saved]</em>"
    },
    "Personal/": {
      type: "folder",
      title: "Personal Folder",
      content: "This folder is private.<br><br>Contents: photos/, letters/, creative_writing/<br><br><em>We noticed you haven't opened this in 14 days. Everything is safe.</em>"
    },
    "Paper_draft_geology.docx": {
      type: "document",
      title: "Document Editor",
      content: "<strong>Desert Formations of the Mojave: Observations from 47 Field Sites</strong><br><br>By A. Chen<br><br>Section 4.7: Unclassified Formations<br>'At site 47, GPS coordinates 36.234, -116.891, we observed...'<br><br><em>[This section has 12 revisions]</em>"
    }
  };
  
  let fileData = fileContents[file.name];
  
  if (!fileData) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      fileData = { type: "document", title: "PDF Viewer" };
    } else if (file.name.endsWith('/')) {
      fileData = { type: "folder", title: file.name.replace('/', ''), content: `Contents loading...<br><br><em>Organized based on your preferences.</em>` };
    } else {
      fileData = { type: "document", title: "File Preview", content: `<strong>${file.name}</strong><br><br>File contents loading...<br><br><em>Last accessed: Recently</em>` };
    }
  }
  
  setTimeout(() => {
    if (fileData.type === "spreadsheet") {
      openSpreadsheetPreview(file.name, fileData.content);
    } else if (fileData.type === "image") {
      openImagePreview(file.name);
    } else {
      openUnexpectedWindow({
        title: fileData.title,
        content: fileData.content,
        reason: "Opening your file"
      });
    }
  }, 300);
}

function openSpreadsheetPreview(filename, content) {
  const windowId = generateId('window');
  const windowEl = document.createElement('div');
  windowEl.className = 'window opening';
  windowEl.id = windowId;
  windowEl.style.left = `${randomInt(200, 450)}px`;
  windowEl.style.top = `${randomInt(100, 300)}px`;
  windowEl.style.width = '500px';
  
  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <div class="window-control control-close" onclick="closeWindow('${windowId}')"></div>
        <div class="window-control control-minimize"></div>
        <div class="window-control control-maximize"></div>
      </div>
      <div class="window-title">Data Viewer</div>
      <div class="window-badge">${filename}</div>
    </div>
    <div style="padding: 20px; color: var(--text-primary); font-size: 11px;">
      ${content}
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
}

function openImagePreview(filename) {
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
      <div class="window-title">Image Viewer</div>
      <div class="window-badge">${filename}</div>
    </div>
    <div style="padding: 20px; background: rgba(220, 210, 195, 0.5); text-align: center; color: var(--text-secondary);">
      <div style="font-size: 48px; margin: 40px 0;">🖼️</div>
      <div>${filename}</div>
      <div style="font-size: 9px; margin-top: 10px; color: var(--text-muted);">Field photo • GPS tagged</div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
}

function openUnexpectedWindow({ title, content, reason }) {
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
      <div class="window-title">${title}</div>
      <div class="window-badge">Field Station</div>
    </div>
    <div style="padding: 20px; color: var(--text-primary); font-size: 11px; line-height: 1.6;">
      ${content}
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(139, 115, 85, 0.3); font-size: 9px; color: var(--text-muted);">
        ${reason}
      </div>
    </div>
  `;
  
  document.getElementById('windows-container').appendChild(windowEl);
  state.openWindows.push(windowId);
  
  const header = windowEl.querySelector('.window-header');
  makeDraggable(windowEl, header);
  header.style.cursor = 'grab';
}

// ============================================
// WINDOW MANAGEMENT
// ============================================

function closeWindow(windowId) {
  const windowEl = document.getElementById(windowId);
  if (windowEl) {
    windowEl.style.animation = 'windowOpen 0.3s ease reverse';
    setTimeout(() => windowEl.remove(), 300);
  }
  state.openWindows = state.openWindows.filter(id => id !== windowId);
}

window.closeWindow = closeWindow;

// ============================================
// JOURNAL
// ============================================

function addJournalEntry(message) {
  const container = document.getElementById('journal-entries');
  const entry = document.createElement('div');
  entry.className = 'journal-entry new';
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  entry.innerHTML = `<div style="color: var(--text-muted); font-size: 9px; margin-bottom: 4px;">${timeStr}</div>${message}`;
  
  container.insertBefore(entry, container.firstChild);
  
  // Keep only last 20 entries
  while (container.children.length > 20) {
    container.removeChild(container.lastChild);
  }
  
  // Auto-scroll to top
  container.scrollTop = 0;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastSlide 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// SAND PARTICLES
// ============================================

function createSandParticles() {
  const container = document.getElementById('sand-particles');
  if (!container) return;
  
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'sand-particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 20}s`;
    container.appendChild(particle);
  }
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  // Set greeting
  const greeting = randomChoice(GREETINGS);
  const greetingEl = document.querySelector('.greeting');
  if (greetingEl) {
    greetingEl.querySelector('div').textContent = greeting.text;
    const subEl = greetingEl.querySelector('.greeting-sub');
    if (subEl) subEl.textContent = greeting.sub;
  }
  
  // Create sand particles
  createSandParticles();
  
  // Add initial files
  INITIAL_FILES.forEach(file => {
    addFile(file);
  });
  
  // Add initial journal entries
  addJournalEntry(`Welcome back, ${randomChoice(CHARACTER_NAMES)}. Your field data is ready.`);
  addJournalEntry("Survey data queue updated. 12 new files based on your site preferences.");
  addJournalEntry("We noticed you've been thinking about Site 47. Here's the formation data you bookmarked.");
  
  // Connect WebSocket
  connectWebSocket();
  
  console.log('[Narrative OS] Desert Geology theme initialized');
}

// Start the OS
document.addEventListener('DOMContentLoaded', init);

// Expose functions globally
window.NarrativeOS = {
  addFile,
  removeFile,
  renameFile,
  showToast,
  addJournalEntry,
  state,
  connectWebSocket,
  sendToBackend,
  get wsConnected() { return wsConnected; },
};

# Library Extraction Roadmap

## 📊 Code Categorization Matrix

### By Reusability vs. Effort

```
                        HIGH EFFORT
                             ▲
                             │
            Canvas Primitives │  ╔════════════════════╗
            Library            │  ║ Low Priority       ║
            (complex)          │  ║ High Effort        ║
                             │  ║ Medium Reuse       ║
                             │  ╚════════════════════╝
                             │
                             │
        ─────────────────────┼───────────────────────────
                             │
                             │
    UI Primitives            │
    (skip - use libs)        │  ╔════════════════════╗
                             │  ║ Narrative Engine   ║
                             │  ║ HIGH PRIORITY      ║
                             │  ║ Medium Effort      ║
                             │  ║ HIGH Reuse        ║
                             │  ╚════════════════════╝
    File System              │
    (keep in app)            │
                             │
                             │  ╔════════════════════╗
                             │  ║ Audio Engine       ║
                             │  ║ DO THIS FIRST      ║
                             │  ║ Low Effort         ║
                             │  ║ HIGH Reuse        ║
                             │  ╚════════════════════╝
                             │
                             ▼
                        LOW EFFORT
             ─────────────────────────────────
                          LOW ──────► HIGH
                             REUSABILITY
```

---

## 🚀 Extraction Timeline

### Phase 0: Testing (2-3 weeks)
- ✅ Write automated tests for everything
- ✅ Establish baseline for all components
- ✅ No code movement yet
- 📍 **You are here**

### Phase 0.5a: Audio Engine (1 week)
```
Week 3 (estimated)
├── Copy audio-engine.js to new repo structure
├── Add package.json, README, tests
├── Publish to npm as @narrative-os/audio-engine
└── Update narrative-os to import from package
```

**Effort:** ~4 hours actual work
**Impact:** Both themes can reuse audio immediately

### Phase 0.5b: Narrative Engine (2 weeks)
```
Week 4-5 (estimated)
├── Create new @narrative-os/engine repository
├── Move daemons (Python → TypeScript):
│   ├── daemon_chaos.py → ChaosDaemon.ts
│   ├── daemon_journal.py → JournalDaemon.ts
│   └── daemon_watcher.py → WatcherDaemon.ts
├── Add character configs:
│   ├── mira-petrovic.json (Deep Sea character)
│   └── bianca-rios.json (Living OS character)
├── Write narrative tests
└── Publish as @narrative-os/engine
```

**Effort:** ~2 weeks (includes TypeScript conversion, testing)
**Impact:** Enables narrative reuse across all themes

### Phase 1: Refactoring (6-8 weeks)
```
Weeks 6-13
├── Use both libraries as dependencies
├── Separate core OS from Deep Sea theme
├── Extract file system manager
├── Extract state management
└── Establish architecture for theme composition
```

---

## 📦 Extraction Details

### 1️⃣ Audio Engine → @narrative-os/audio-engine

**Current Location:** `frontend/audio-engine.js` (942 lines)

**Extract:** Exactly as-is (no changes needed)

**New Structure:**
```
@narrative-os/audio-engine/
├── src/
│   ├── index.js              (942 lines - from audio-engine.js)
│   ├── ambience.js           (class Ambience)
│   └── sound-effects.js      (class SoundEffect)
├── dist/
│   ├── index.js              (compiled)
│   └── index.min.js          (minified)
├── package.json
├── README.md
└── tests/
    ├── ambience.test.js
    └── sound-effects.test.js
```

**API (unchanged):**
```javascript
// Both themes use identically
const ambience = new Ambience();
await ambience.play('deepSea', { intensity: 0.3 });

// Deep Sea specific: no mystery tones
ambience.play('deepSea', { mystery: 0 });

// Living OS specific: different presets
ambience.play('organic', { intensity: 0.5 });
```

**When to Extract:** After Phase 0 testing ✓

**Implementation Cost:** 4 hours

---

### 2️⃣ Narrative Engine → @narrative-os/engine

**Current Location:** `backend/daemons/` + `backend/server/`

**Extract:** Daemons + character configs

**New Structure:**
```
@narrative-os/engine/
├── src/
│   ├── daemons/
│   │   ├── base-daemon.ts          (abstract)
│   │   ├── chaos-daemon.ts         (from daemon_chaos.py)
│   │   ├── journal-daemon.ts       (from daemon_journal.py)
│   │   └── watcher-daemon.ts       (from daemon_watcher.py)
│   ├── generators/
│   │   ├── character-voice.ts      (NEW - character-specific text)
│   │   └── narrative-arc.ts        (NEW - story progression)
│   └── types.ts                    (TypeScript interfaces)
├── config/
│   ├── characters/
│   │   ├── mira-petrovic.json      (Deep Sea character)
│   │   └── bianca-rios.json        (Living OS character)
│   └── narrative-arcs/
│       └── discovery-to-dread.json
├── dist/
│   └── ... (compiled)
├── package.json
├── README.md
└── tests/
    ├── daemons/
    ├── generators/
    ├── character-voice.test.ts
    └── narrative-consistency.test.ts
```

**Usage in narrative-os backend:**
```python
# Old way (monolithic backend):
from daemons import ChaosDaemon

# New way (with engine package):
from narrative_engine.daemons import ChaosDaemon
from narrative_engine.config import load_character_config

character = load_character_config('mira-petrovic.json')
chaos = ChaosDaemon(character)
```

**Character Config Example:**
```json
{
  "name": "Dr. Mira Petrovic",
  "role": "Deep-sea marine biologist",
  "tone": "professional, stressed, scientific",
  "vocabulary": ["specimen", "dive", "depth", "ROV", "bioluminescence"],
  "chaos_personality": "IT-speak with marine terms",
  "escalation": {
    "start_intensity": 0,
    "revelation_intensity": 70,
    "peak_intensity": 90
  },
  "file_topics": ["dives", "specimens", "footage"],
  "messages": {
    "greeting": "Welcome back, Mira. We've classified 3 new specimens.",
    "chaos_rename": "Optimized filename for better workflow"
  }
}
```

**When to Extract:** After Phase 0 testing, after audio-engine ✓

**Implementation Cost:** 2 weeks (includes TypeScript conversion, test writing)

---

### 3️⃣ Canvas Primitives → @narrative-os/canvas (FUTURE)

**Candidates for Extraction:**
```javascript
// Reusable parts:
├── animation utilities
│   ├── easing functions (easeInQuad, easeOutQuad, etc.)
│   ├── interpolation (lerp, vector interpolation)
│   └── frame timing
├── visual primitives
│   ├── particles (create, update, render)
│   ├── curves (Bezier, spiral, organic)
│   └── gradients (color interpolation)
└── interaction utilities
    ├── distance calculation
    ├── angle calculation
    └── bounds checking

// Keep in theme repo:
├── scene definitions (each theme renders differently)
├── interaction behavior (scene-specific logic)
└── narrative text (character-specific dialogue)
```

**When to Extract:** Phase 1+ if needed (only if writing multiple scenes)

**Implementation Cost:** 1 week (to extract cleanly)

---

## 🔄 Dependency Graph After Extractions

### Before Extractions (Monolithic)
```
narrative-os/
└── everything in single repo
    ├── audio-engine.js
    ├── os.js (has audio init + WebSocket)
    └── backend/daemons/
```

### After Phase 0.5 Extractions
```
┌─────────────────────────────────────────┐
│ narrative-os (Deep Sea Theme)           │
├─────────────────────────────────────────┤
│ ├── os.js (4173 lines)                 │
│ ├── index.html + CSS (theme colors)    │
│ ├── scenes/ (Deep Sea canvas scenes)   │
│ │   ├── leviathan.js                   │
│ │   ├── anglerfish.js                  │
│ │   └── ... (9 scenes)                 │
│ ├── backend/main.py                    │
│ └── imports:                           │
│     ├── @narrative-os/audio-engine     │
│     └── @narrative-os/engine           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ living-os (Organic Horror Theme)        │
├─────────────────────────────────────────┤
│ ├── os.js (similar structure)           │
│ ├── index.html + CSS (organic colors)   │
│ ├── scenes/ (Living OS canvas scenes)   │
│ │   ├── bioluminescent-forest.js        │
│ │   └── ... (custom scenes)             │
│ ├── backend/main.py                    │
│ └── imports:                           │
│     ├── @narrative-os/audio-engine     │
│     └── @narrative-os/engine           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ @narrative-os/audio-engine (Library)    │
├─────────────────────────────────────────┤
│ ├── Ambience class (942 lines)         │
│ ├── SoundEffect class                  │
│ └── no dependencies (just Web Audio)   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ @narrative-os/engine (Library)          │
├─────────────────────────────────────────┤
│ ├── ChaosDaemon                        │
│ ├── JournalDaemon                      │
│ ├── WatcherDaemon                      │
│ ├── CharacterVoiceGenerator            │
│ ├── config/                            │
│ │   ├── mira-petrovic.json             │
│ │   └── bianca-rios.json               │
│ └── no dependencies                    │
└─────────────────────────────────────────┘
```

---

## 📋 Checklist for Phase 0.5a (Audio Engine)

- [ ] Run existing tests to establish baseline
- [ ] Create new repo structure for audio-engine
- [ ] Copy audio-engine.js to src/index.js
- [ ] Add package.json with correct version/metadata
- [ ] Add README with examples
- [ ] Add LICENSE
- [ ] Write unit tests (import, instantiate, play, stop)
- [ ] Test with narrative-os integration
- [ ] Publish to npm (or private registry)
- [ ] Update narrative-os to import from package
- [ ] Verify audio works in both repos
- [ ] Document usage in both theme repos
- [ ] Run full test suite to confirm no regressions

**Estimated Time:** 4-6 hours
**Difficulty:** Low (copy + package config)
**Risk:** Minimal (no code changes)

---

## 📋 Checklist for Phase 0.5b (Narrative Engine)

### Step 1: Analyze Current Daemons
- [ ] Review daemon_chaos.py (patterns, character voice)
- [ ] Review daemon_journal.py (narrative generation)
- [ ] Review daemon_watcher.py (file system monitoring)
- [ ] Document daemon interfaces
- [ ] Identify character-specific vs. generic code

### Step 2: Create Engine Repository
- [ ] Initialize new repo: @narrative-os/engine
- [ ] Set up TypeScript + build pipeline
- [ ] Create src/ directory structure
- [ ] Create config/ directory for character data

### Step 3: Convert Daemons (Python → TypeScript)
- [ ] Convert daemon_chaos.py → ChaosDaemon.ts
- [ ] Convert daemon_journal.py → JournalDaemon.ts
- [ ] Convert daemon_watcher.py → WatcherDaemon.ts
- [ ] Create BaseDaemon abstract class
- [ ] Write TypeScript interfaces

### Step 4: Add Character Configs
- [ ] Create mira-petrovic.json (Deep Sea)
- [ ] Create bianca-rios.json (Living OS)
- [ ] Create config loader
- [ ] Document config schema

### Step 5: Write Tests
- [ ] Unit tests for each daemon
- [ ] Character voice consistency tests
- [ ] Narrative escalation tests
- [ ] Pacing tests

### Step 6: Documentation
- [ ] README with architecture
- [ ] Examples for both themes
- [ ] API documentation
- [ ] Configuration guide

### Step 7: Integration
- [ ] Update narrative-os backend to use engine
- [ ] Update living-os backend to use engine
- [ ] Test both themes with new engine
- [ ] Run full test suite

**Estimated Time:** 2 weeks
**Difficulty:** Medium (TypeScript conversion, API design)
**Risk:** Medium (need good daemon interface)

---

## 💰 Value Summary

### Audio Engine Extraction
| Metric | Value |
|--------|-------|
| Lines extracted | 942 |
| Lines added to os.js | 0 (pure deletion) |
| Reuse potential | 100% (both themes) |
| Implementation time | 4-6 hours |
| Maintenance burden | Reduced (separate package) |
| Risk | Low (no code changes) |

### Narrative Engine Extraction
| Metric | Value |
|--------|-------|
| Lines extracted | ~600-800 (daemons) + new configs |
| Lines added to backend | 0 (pure deletion) |
| Reuse potential | 100% (both themes) |
| Implementation time | 2 weeks |
| Maintenance burden | Reduced (separate package) |
| Risk | Medium (TypeScript conversion) |
| Enables | Both themes using same daemons |

### Total Value
- ✅ Eliminates code duplication
- ✅ Both themes use identical daemon logic
- ✅ Character configs become data, not code
- ✅ Easier to add new characters/themes
- ✅ Cleaner architecture
- ✅ Better testing separation

---

## 🚀 Quick Start: If You Want to Begin Now

### To Extract Audio Engine Today:
```bash
# 1. Create package structure
mkdir -p packages/audio-engine/src

# 2. Copy file
cp frontend/audio-engine.js packages/audio-engine/src/index.js

# 3. Create package.json
cd packages/audio-engine
npm init -y
# Edit package.json:
# {
#   "name": "@narrative-os/audio-engine",
#   "version": "1.0.0",
#   "main": "dist/index.js",
#   "module": "src/index.js",
#   "type": "module"
# }

# 4. Build
npm run build

# 5. Test in narrative-os
npm install ./packages/audio-engine
# Update HTML: <script src="node_modules/@narrative-os/audio-engine/src/index.js">
# Test that audio plays

# 6. Publish when ready
npm publish
```

### To Begin Narrative Engine:
```bash
# 1. Create repo
git init narrative-engine
cd narrative-engine

# 2. Set up TypeScript
npm init -y
npm install --save-dev typescript @types/node

# 3. Create structure
mkdir -p src/{daemons,generators} config tests

# 4. Start with interfaces
# See LIBRARY_ABSTRACTION_ANALYSIS.md for proposed structure

# 5. Convert first daemon (daemon_chaos.py → ChaosDaemon.ts)
```

---

## 🎯 Recommendation

**Do This:**
1. Complete Phase 0 testing (2-3 weeks)
2. Extract Audio Engine (4-6 hours) ✨ Quick win
3. Extract Narrative Engine (2 weeks) ✨ High value
4. Begin Phase 1 refactoring with both libraries as dependencies

**Timeline:**
- Weeks 1-3: Testing
- Week 3: Audio Engine
- Weeks 4-5: Narrative Engine
- Weeks 6+: Phase 1 refactoring

**Expected Result:** Clean, reusable, shareable architecture where both themes can coexist and share core logic.

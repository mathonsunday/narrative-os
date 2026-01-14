# Library Abstraction Strategy for Narrative OS

## Overview

This document analyzes the current narrative-os codebase (5203 lines across 3 main frontend files + Python backend) and identifies which code should be extracted into reusable libraries versus kept as app-specific customizations.

**Key Principle:** Extracting code into libraries is worthwhile when:
1. The code is generic enough to work across multiple themes/projects
2. The code encapsulates a complete capability (not just utilities)
3. The code is substantial enough (100+ lines, or core functionality)
4. The code benefits from being developed/maintained separately
5. Multiple projects will actually reuse it

---

## Current Codebase Structure

### Frontend Files (3 files, 5203 lines)

| File | Size | Type | Description |
|------|------|------|-------------|
| **os.js** | 4173 lines | Monolithic | Everything: WebSocket, file ops, UI, audio init, 9 canvas scenes, journal, daemon integration |
| **audio-engine.js** | 942 lines | Library-like | Web Audio API wrapper, preset-based ambience, sound effects, layer management |
| **visual-toolkit.min.js** | 88 lines | Library | Pre-built visual effects (minified) |

### Backend Files (Python)

| File | Type | Description |
|------|------|-------------|
| daemon_chaos.py | Daemon | Generates "helpful" chaos events (renames, notifications) |
| daemon_journal.py | Daemon | Generates narrative journal entries |
| daemon_watcher.py | Daemon | Watches filesystem, sends file events |
| main.py | Server | WebSocket server, daemon orchestration |

---

## LIBRARY CANDIDATES: Code That Should Move

### 1. Audio Engine (STRONG CANDIDATE - Already Library-like)

**Current Status:** audio-engine.js (942 lines)

**What It Provides:**
- Web Audio API abstraction (AudioContext, GainNode management)
- Ambience class: 7 preset soundscapes (deepSea, rov, sonar, bioluminescence, hydrophone, discovery, tension)
- SoundEffect class: UI sounds, creature sounds, notification sounds
- Layer management: Mix multiple audio sources with independent gains
- Fade in/out: Smooth transitions between ambience states
- Master volume control

**Reusability Analysis:**
- ✅ Completely generic (no narrative-os specific code)
- ✅ Works with any Web Audio context
- ✅ Presets can be extended/overridden
- ✅ Clean API: `ambience.play('deepSea')`, `ambience.addLayer('rov')`
- ✅ Already structured as a library (class-based, minimal dependencies)
- ✅ Living OS can use identical code
- ✅ Other projects (games, websites) could reuse

**Extraction Plan:**
```
Current: /narrative-os/frontend/audio-engine.js
→ Extract to: @narrative-os/audio-engine npm package

Or combine with other media:
→ Extract to: @narrative-os/media package
  ├── src/audio/ambience.js
  ├── src/audio/sound-effects.js
  └── presets/
      ├── deep-sea.json
      ├── organic-horror.json
      └── ambient-space.json
```

**Recommendation:** 📦 **EXTRACT TO LIBRARY** - This is ready to separate today
- Zero narrative-os dependencies
- Clear, stable API
- Reusable across all themes
- Actively maintained code

**Priority:** HIGH (Easy win, immediate reuse)

---

### 2. Canvas Scene Renderers (MEDIUM CANDIDATE)

**Current Status:** Embedded in os.js (lines 1114-3760, ~2600 lines)

**What's Included:**
- 9 interactive canvas scenes:
  1. Anglerfish encounter (horror)
  2. Pressure anomaly (equipment failure)
  3. Bioluminescence (abstract patterns)
  4. Leviathan (giant eye contact)
  5. ROV exterior (third-person view)
  6. Wall (organic surface)
  7. Seekers (bioluminescent swarm)
  8. Shadows (jellyfish drift)
  9. Giant Squid (tentacle interaction)

**Code Pattern:**
```javascript
function openAnglerfishScene() {
  // 1. Create window element
  // 2. Initialize canvas and 2D context
  // 3. Setup interaction handlers (mousemove, click)
  // 4. Animation loop with requestAnimationFrame
  // 5. Character-specific narrative text
}
```

**Reusability Analysis:**
- ✅ Canvas rendering is generic (2D/WebGL)
- ✅ Scene logic is scene-independent
- ✅ Physics/math is reusable (distance, angle, interpolation)
- ✅ Interaction patterns are standard (mousemove, click, resize)
- ❌ **BUT:** Each scene has theme-specific visuals (Deep Sea ocean colors vs. Living OS bioluminescence)
- ❌ **BUT:** Each scene has narrative flavor text
- ❌ **BUT:** Scenes are tightly coupled to file-opening logic
- ⚠️ **PARTIALLY REUSABLE:** Core rendering engine is generic, but scene definitions are theme-specific

**What Could Be Extracted:**
- Generic canvas scene framework (window, context, interaction loop)
- Reusable visual primitives (particles, curves, interpolation, color effects)
- Animation utilities (easing, timing, keyframes)

**What Must Stay App-Specific:**
- Each scene's visual appearance
- Each scene's narrative text
- File trigger associations (which file opens which scene)
- Character-specific dialogue

**Extraction Plan:**
```
Option A: Minimal Extract (RECOMMENDED)
Create @narrative-os/canvas-primitives
├── src/
│   ├── particles.js       (particle systems)
│   ├── curves.js          (bezier, spiral, organic curves)
│   ├── animations.js      (easing, timing, transitions)
│   ├── color.js           (color interpolation, gradients)
│   └── interactions.js    (mousemove, click, resize handlers)
└── tests/
    └── ... unit tests

Keep in narrative-os:
├── scenes/leviathan.js    (scene-specific, uses primitives)
├── scenes/anglerfish.js
├── scenes/wall.js
└── ... etc

Option B: Complete Scene Engine (NOT RECOMMENDED)
Would require huge refactoring, scene data + theme config = less reusable
```

**Recommendation:** 📦 **PARTIAL EXTRACTION** - Extract visual/animation primitives, keep scenes in-app

**What to Extract:**
- Animation easing functions (easingInQuad, easingOutQuad, etc.)
- Particle system (create, update, render particles)
- Bezier curve drawing
- Color interpolation/gradients
- Common interaction patterns (drag, click detection, bounds checking)
- Frame timing utilities

**Priority:** MEDIUM (Good reuse potential, requires some planning)

---

### 3. UI Primitives (WEAK CANDIDATE)

**Current Status:** os.js lines 495-590 (~95 lines)

**What's Included:**
- `makeDraggable()` - Enable drag for any element
- `makeResizable()` - Enable resize for any element
- Basic event handlers

**Reusability Analysis:**
- ✅ Completely generic
- ✅ No dependencies on narrative-os
- ❌ **BUT:** Very simple (95 lines of vanilla DOM manipulation)
- ❌ **BUT:** Everyone writes this code (or uses libraries like interact.js, Sortable.js)
- ❌ **BUT:** Very specialized for this specific window implementation

**Recommendation:** ❌ **DON'T EXTRACT** - Not worth separate package

Better alternatives:
- Use existing libraries: `interact.js`, `Draggabilly`, or `Sortable.js`
- Or keep inline (code is straightforward, easy to understand)

**Priority:** SKIP (Keep as-is, or migrate to established library)

---

### 4. File System Operations (NOT A CANDIDATE)

**Current Status:** os.js lines 757-807 (~50 lines)

**What's Included:**
- `addFile()`
- `removeFile()`
- `renameFile()`
- `moveFile()`

**Why Not Extract:**
- ✅ Generic operations
- ❌ **BUT:** Tightly coupled to DOM rendering (creates .file-icon elements)
- ❌ **BUT:** Tightly coupled to state management (state.files array)
- ❌ **BUT:** Not truly reusable without also extracting state/rendering

**Recommendation:** ❌ **DON'T EXTRACT** - Not isolated enough

Better approach in Phase 1 refactoring:
- Create FileSystemManager class (frontend abstraction)
- Separate from view rendering
- Then consider extracting

**Priority:** SKIP (Defer to Phase 1 refactoring)

---

### 5. Window Management (NOT A CANDIDATE)

**Current Status:** Scattered through os.js

**Why Not Extract:**
- Tightly coupled to specific window HTML structure
- Specific CSS classes (.window, .window-header, etc.)
- Custom resize handle, close button behavior
- Not applicable to other UI frameworks

**Recommendation:** ❌ **DON'T EXTRACT** - Application-specific

**Priority:** SKIP

---

### 6. Backend Daemons (STRONG CANDIDATE FOR NEW ENGINE REPO)

**Current Status:** 3 Python daemon files

**What's Included:**
- `daemon_chaos.py`: Generates "helpful" chaos (renames, notifications, file operations)
- `daemon_journal.py`: Generates narrative journal entries
- `daemon_watcher.py`: Watches filesystem, sends events

**Reusability Analysis:**
- ✅ Completely generic daemon orchestration
- ✅ Character-agnostic event generation
- ✅ Can be customized per-theme with configuration
- ✅ Living OS uses (or should use) same daemon patterns
- ✅ Other narrative projects could reuse
- ✅ Clear boundaries (input: time/state, output: events)

**Extraction Plan:**
This should be the **narrative-engine repository** from the refactoring plan:

```
New Repository: @narrative-os/engine
├── src/
│   ├── daemons/
│   │   ├── base-daemon.ts      (abstract base class)
│   │   ├── chaos-daemon.ts     (file manipulation, "helpful" behavior)
│   │   ├── journal-daemon.ts   (narrative entry generation)
│   │   └── watcher-daemon.ts   (filesystem monitoring)
│   ├── generators/
│   │   ├── character-voice.ts  (generates character-consistent text)
│   │   └── narrative-arc.ts    (manages story progression)
│   └── config/
│       ├── characters/
│       │   ├── mira-petrovic.json     (Deep Sea character config)
│       │   └── bianca-rios.json       (Living OS character config)
│       └── narrative-arcs/
│           └── discovery-to-dread.json
└── tests/
    ├── character-voice.test.ts
    ├── narrative-consistency.test.ts
    └── ...

Published as: @narrative-os/engine
Used by: narrative-os, living-os, future-projects
```

**Recommendation:** 📦 **EXTRACT TO SEPARATE REPO** - Create narrative-engine (Phase 0.5)

**Why This Makes Sense:**
1. Daemons are completely decoupled from frontend
2. Character configs can be shared/mixed
3. Daemon logic benefits from careful narrative design (→ use Opus/Sonnet)
4. Different themes can use identical daemon logic with different configs
5. Clean WebSocket API between frontend ↔ backend

**Priority:** HIGH (Critical for refactoring strategy)

---

## LIBRARY CANDIDATES: Code That Should Stay In-App

### 1. os.js Core (KEEP IN narrative-os)

Lines that should stay:

| Lines | Component | Reason |
|-------|-----------|--------|
| 1-58 | Audio initialization | App-specific initialization |
| 59-320 | WebSocket integration | Specific to narrative-os architecture |
| 321-454 | Character greetings/messages | Deep Sea character-specific |
| 455-483 | Application state | App-specific state structure |
| 631-689 | Toast notifications | App UI styling |
| 690-722 | Journal window | App-specific journal UI |
| 727-811 | File operations + DOM | Tightly coupled to file-icon DOM |
| 812-992 | Enhancements (CSS debug overlay) | Deep Sea theme-specific |
| 1114-3760 | Canvas scenes (9 scenes) | Deep Sea theme-specific visuals |
| 3761-4173 | Initialization + file mappings | App-specific setup |

**Total Keeping:** 4173 lines (all of it stays in this phase)

**Reason:** os.js is the theme implementation layer. It uses services (audio-engine) but is not reusable itself.

---

### 2. index.html + CSS (KEEP IN narrative-os)

**Reason:** Deep Sea specific theming (colors, layout, typography)

Current color palette:
```css
--abyss-black: #010508;
--bio-cyan: #4dd0e1;
--deep-teal: #006b63;
--biolum-blue: #0ac7ff;
--error-red: #ff4444;
```

This is Deep Sea theme. Living OS would have different colors.

---

## SUMMARY: What To Extract Now vs. Later

### Phase 0 (NOW - Testing)
- No extraction yet
- Write tests for everything as-is
- Establish behavioral baseline

### Phase 0.5 (RECOMMENDED)
- ✅ **Create @narrative-os/engine repository**
  - Extract: daemon_chaos.py, daemon_journal.py, daemon_watcher.py
  - Add: character configs (Mira, Bianca)
  - Add: narrative tests (voice consistency, pacing)
  - Used by: narrative-os, living-os

- ✅ **Create @narrative-os/audio-engine npm package**
  - Extract: frontend/audio-engine.js
  - Keep as-is (already well-designed)
  - Used by: narrative-os, living-os, future projects

### Phase 1 (REFACTORING)
- Extract core OS logic from theme layer
- Separate file system from UI rendering
- Extract state management

### Future (If Needed)
- ⚠️ Canvas primitives library (if writing more scenes)
- ⚠️ Visual toolkit components (if need more reuse)

---

## Extraction Timeline

### Week 1-2: Audio Engine Package
```bash
# Create package
mkdir -p packages/audio-engine/src
cp frontend/audio-engine.js packages/audio-engine/src/
npm publish @narrative-os/audio-engine

# Update narrative-os
npm install @narrative-os/audio-engine
# Replace: <script src="audio-engine.js">
# With: <script src="node_modules/@narrative-os/audio-engine/dist/index.js">
```

**Effort:** 4 hours (copy, add package.json, test, publish)

### Week 3: Narrative Engine Repository
```bash
# Create separate repo
git init narrative-engine
mkdir -p src/daemons src/generators src/config

# Move files
cp backend/daemons/*.py narrative-engine/src/daemons/
# Add TypeScript interfaces
# Add character configs
# Add tests

# Publish
npm publish @narrative-os/engine

# Update narrative-os backend
pip install narrative-engine
# Or use as git submodule
```

**Effort:** 2 weeks (refactor to TypeScript, add interfaces, tests, config system)

---

## Code Size Impact

### Current (Monolithic)
```
narrative-os/frontend/
├── os.js              4,173 lines
├── audio-engine.js      942 lines
└── visual-toolkit.min   88 lines
                      --------
                      5,203 lines (all in single repo)
```

### After Phase 0.5 Extractions
```
narrative-os/frontend/
├── os.js              4,173 lines (core theme implementation)
├── audio-engine.js    → moved to @narrative-os/audio-engine
└── (imports audio from package)

@narrative-os/audio-engine/
├── src/index.js         942 lines (same code, published)

@narrative-os/engine/
├── src/daemons/        600+ lines (refactored Python→TypeScript)
├── src/generators/     200+ lines (new character voice generator)
└── config/             200+ lines (character configs as JSON)

Result: cleaner separation, reusable components, clearer architecture
```

---

## Recommendations by Priority

### 🟢 DO THIS NOW (Phase 0.5)

1. **Extract Audio Engine → @narrative-os/audio-engine**
   - Effort: 4 hours
   - Reuse: immediate (living-os, future projects)
   - Risk: minimal (just copy, no changes needed)

2. **Create Narrative Engine Repository → @narrative-os/engine**
   - Effort: 2 weeks
   - Reuse: both themes use same daemons
   - Risk: moderate (need TypeScript, testing)

### 🟡 DO THIS IN PHASE 1 (Refactoring)

3. **Extract Canvas Primitives → @narrative-os/canvas**
   - Effort: 1 week (identify reusable pieces)
   - Reuse: if writing more scenes
   - Risk: medium (need clear abstractions)

4. **Refactor File System Manager**
   - Effort: 2 weeks
   - Reuse: potentially, but not yet
   - Risk: high (currently tightly coupled)

### 🔴 DON'T EXTRACT

- UI primitives (use established libraries instead)
- Window management (too specific)
- Individual theme implementations (stay in narrative-os, living-os repos)

---

## Shared vs. Theme-Specific Code

### Shared (Extract to Libraries/Engine)
- ✅ Audio system (all themes need ambience)
- ✅ Daemon logic (all themes need chaos/journal)
- ✅ Character configs (configure daemons per theme)
- ✅ Backend infrastructure (WebSocket, event routing)

### Theme-Specific (Keep in Repo)
- ❌ Canvas scenes (Leviathan vs. Bioluminescent Forest)
- ❌ Color palette and CSS
- ❌ Character greetings and dialogue
- ❌ File mappings (which file opens which scene)
- ❌ UI layout and styling
- ❌ Narrative text and journal content

### Both (Extract Parts, Customize Rest)
- 🟡 State management (shared structure, theme-specific initial state)
- 🟡 Event handlers (shared patterns, custom responses)
- 🟡 Toast/notification system (shared component, theme-specific styling)

---

## Architecture After Extractions

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (Frontend)                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ narrative-os / living-os (Theme Layer)              │  │
│  │ ├── os.js (4173 lines) - Deep Sea theme logic      │  │
│  │ ├── index.html + CSS - Deep Sea colors/layout      │  │
│  │ └── scenes/ - Deep Sea canvas scenes               │  │
│  └────────┬──────────────────────────────────────────┘  │
│           │ imports                                      │
│           ▼                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ @narrative-os/audio-engine (Library)                │  │
│  │ ├── Ambience class                                  │  │
│  │ ├── SoundEffect class                               │  │
│  │ └── 7 audio presets                                 │  │
│  └────────┬──────────────────────────────────────────┘  │
│           │ WebSocket                                   │
└───────────┼───────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Server, port 8765)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ main.py - WebSocket Server                          │  │
│  │ └── Orchestrates daemons, sends events to frontend  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ @narrative-os/engine (Library) - Daemons            │  │
│  │ ├── ChaosDaemon - generates chaos events            │  │
│  │ ├── JournalDaemon - generates journal entries       │  │
│  │ ├── WatcherDaemon - monitors filesystem             │  │
│  │ ├── CharacterVoiceGenerator - character-specific    │  │
│  │ └── config/                                         │  │
│  │     ├── mira-petrovic.json - Deep Sea              │  │
│  │     └── bianca-rios.json - Living OS               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Week 1-2:** Extract and publish audio-engine
   - Minimal effort, immediate value

2. **Week 3-4:** Create narrative-engine repository
   - More effort, critical for architecture

3. **Phase 1:** Begin refactoring core OS with test coverage
   - Use engine package as shared dependency
   - Both themes can use same daemons

---

## Conclusion

**Current State:** All code in narrative-os (monolithic)

**Recommended Extractions:**
1. ✅ Audio engine → npm package (easy, reusable)
2. ✅ Backend daemons → separate engine repo (critical, enables both themes)
3. ⚠️ Canvas primitives → later (if needed)
4. ❌ UI primitives → skip (use established libs)

**Core Principle:** Extract shared, generic, well-encapsulated code. Keep theme-specific, customized, tightly-coupled code in its theme repository.

Both narrative-os (Deep Sea) and living-os can then depend on:
- `@narrative-os/audio-engine` (audio system)
- `@narrative-os/engine` (daemon logic, character configs)

While keeping their own theme implementations (scenes, UI, colors, character text).

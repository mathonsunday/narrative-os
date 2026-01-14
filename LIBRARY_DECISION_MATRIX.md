# Library Decision Matrix - Quick Reference

## What Should Be a Library?

### 🟢 YES - Extract to Package

| Component | Extract? | When? | Name | Reuse |
|-----------|----------|-------|------|-------|
| Audio Engine | ✅ YES | Week 4 | @narrative-os/audio-engine | Both themes |
| Daemons (chaos, journal, watcher) | ✅ YES | Weeks 5-6 | @narrative-os/engine | Both themes |
| Character Configs | ✅ YES | With engine | engine/config/*.json | Both themes |

### 🟡 MAYBE - Extract Later

| Component | Extract? | When? | Name | Reuse |
|-----------|----------|-------|------|-------|
| Canvas Primitives (particles, curves, easing) | ⚠️ LATER | Phase 1+ | @narrative-os/canvas | If needed |
| File System Manager | ⚠️ LATER | Phase 1 | Part of refactoring | Maybe |

### 🔴 NO - Keep in App

| Component | Extract? | Why Not | Where |
|-----------|----------|--------|-------|
| Canvas Scenes (Leviathan, etc.) | ❌ NO | Theme-specific visuals | narrative-os/scenes/ |
| UI Styling (colors, layout, typography) | ❌ NO | Core theme identity | narrative-os/index.html + CSS |
| File mappings (which file opens which scene) | ❌ NO | App-specific logic | narrative-os/os.js |
| Window management | ❌ NO | Tightly coupled UI | narrative-os/os.js |
| Toast notifications | ❌ NO | Custom styling per theme | narrative-os/os.js |
| Journal entry rendering | ❌ NO | Theme-specific appearance | narrative-os/os.js |

---

## Code Location Decision Tree

```
"Should this code be a library?"
│
├─ Is it generic (works with multiple themes)?
│  │
│  ├─ YES
│  │  ├─ Is it well-encapsulated (minimal dependencies)?
│  │  │  ├─ YES → Extract to library ✅
│  │  │  └─ NO → Refactor then extract (Phase 1+)
│  │  │
│  │  └─ Will multiple projects reuse it?
│  │     ├─ YES → Extract to library ✅
│  │     └─ NO → Keep in app (for now)
│  │
│  └─ NO → Keep in app ❌
│
└─ Examples:
   ├─ Audio Engine → Generic ✅ Reusable ✅ Well-encapsulated ✅ → EXTRACT
   ├─ Daemons → Generic ✅ Reusable ✅ Well-encapsulated ✅ → EXTRACT
   ├─ Canvas Scenes → Theme-specific ❌ → KEEP
   ├─ UI Colors → Theme-specific ❌ → KEEP
   ├─ File Ops → Coupled to DOM ⚠️ → REFACTOR THEN EXTRACT
   └─ Toast Notifications → Coupled to UI ❌ → KEEP
```

---

## Phase 0 → Phase 0.5 → Phase 1 Progression

```
PHASE 0 (Weeks 1-3): TESTING
├─ Week 1: Unit + Integration tests         ✅ DONE
├─ Week 2: Visual regression tests          (THIS WEEK)
└─ Week 3: E2E + Manual tests               (NEXT WEEK)

PHASE 0.5 (Weeks 4-6): LIBRARY EXTRACTION
├─ Week 4: Audio Engine (4-6 hours)         → @narrative-os/audio-engine
└─ Weeks 5-6: Narrative Engine (2 weeks)    → @narrative-os/engine

PHASE 1+ (Weeks 7+): CORE REFACTORING
├─ Separate core OS from theme layer
├─ Both themes use extracted libraries
└─ Enable safe experimental development
```

---

## Extract Now vs. Later

### Extract NOW (Phase 0.5)

**Audio Engine (Week 4)**
```
Current: frontend/audio-engine.js (942 lines)
Future: @narrative-os/audio-engine package

Why Now:
✅ Zero changes needed (copy as-is)
✅ No dependencies on narrative-os
✅ Both themes use identically
✅ 4-6 hour quick win
✅ Immediate value
```

**Narrative Engine (Weeks 5-6)**
```
Current: backend/daemons/*.py
Future: @narrative-os/engine package

Why Now:
✅ Critical for architecture
✅ Both themes need same daemons
✅ Enables character config system
✅ Enables consistent voice testing
✅ High value justifies effort
```

### Extract LATER (Phase 1+)

**Canvas Primitives (Phase 1 if needed)**
```
Current: Embedded in 9 scene functions in os.js
Future: @narrative-os/canvas package (optional)

Why Later:
⚠️ Requires extraction of reusable parts
⚠️ Need to separate scene logic from rendering
⚠️ Only extract if writing many more scenes
⚠️ Low priority (current scenes work fine)
```

### Don't Extract (Keep Forever)

**Canvas Scenes**
```
Reason: Each theme has completely different scenes
- Deep Sea: Leviathan, Anglerfish, Wall, Shadows, etc.
- Living OS: Would have own organic/bioluminescent scenes
- Not reusable, theme-defining
```

**UI Styling**
```
Reason: Core to theme identity
- Colors, fonts, layouts are theme-specific
- Deep Sea: dark abyss blues
- Living OS: organic greens, growth patterns
- Not shared between themes
```

---

## Code Extraction Checklist

### Audio Engine ✅ High Priority
- [ ] Low complexity (copy file)
- [ ] High reuse (both themes)
- [ ] Low risk (no changes)
- [ ] Quick implementation (4-6 hours)
- **Status:** Ready to extract Week 4

### Narrative Engine ✅ High Priority
- [ ] Medium complexity (TypeScript conversion)
- [ ] High reuse (both themes)
- [ ] Medium risk (need good interface)
- [ ] Medium implementation (2 weeks)
- **Status:** Ready to extract Weeks 5-6

### Canvas Primitives ⚠️ Lower Priority
- [ ] Medium complexity (identify reusable parts)
- [ ] Medium reuse (if many scenes)
- [ ] Medium risk (need clean abstraction)
- [ ] Medium implementation (1 week)
- **Status:** Defer to Phase 1 if needed

### UI/CSS ❌ Don't Extract
- [ ] Not reusable (theme-specific)
- [ ] Not generic (core identity)
- **Status:** Keep in both theme repos

---

## Shared vs. Custom Code

### Shared (Both Themes Use Identical Code)

**Audio System**
```javascript
// Deep Sea OS
const ambience = new AudioEngine.Ambience();
ambience.play('deepSea', { intensity: 0.3, mystery: 0 });

// Living OS
const ambience = new AudioEngine.Ambience();
ambience.play('organic', { intensity: 0.4 });

// Same code, different presets ✅
```

**Daemon Logic**
```python
# Deep Sea OS
from narrative_engine import ChaosDaemon
from narrative_engine.config import load_character_config

character = load_character_config('mira-petrovic.json')
chaos = ChaosDaemon(character)

# Living OS
from narrative_engine import ChaosDaemon
from narrative_engine.config import load_character_config

character = load_character_config('bianca-rios.json')
chaos = ChaosDaemon(character)

# Same daemon, different character config ✅
```

### Custom (Each Theme Implements Own)

**Canvas Scenes**
```javascript
// Deep Sea OS
function openLeviathanScene() { ... }  // Giant eye
function openAnglerfishScene() { ... } // Horror fish

// Living OS
function openBiolumForest() { ... }  // Bioluminescent forest
function openGrowthScene() { ... }   // Plant growth

// Completely different visuals and behavior
```

**UI Colors & Layout**
```css
/* Deep Sea OS */
--abyss-black: #010508;
--bio-cyan: #4dd0e1;

/* Living OS */
--moss-green: #2d5016;
--growth-lime: #7fc97f;

/* Theme-specific identity */
```

---

## What Goes Where

### In @narrative-os/audio-engine
```javascript
✅ Ambience class
✅ SoundEffect class
✅ getAudioContext()
✅ resumeAudioContext()
✅ Audio layer management
✅ Master gain control
✅ Preset definitions
```

### In @narrative-os/engine
```python
✅ ChaosDaemon class
✅ JournalDaemon class
✅ WatcherDaemon class
✅ BaseDaemon class
✅ CharacterVoiceGenerator
✅ NarrativeArcManager
✅ config/mira-petrovic.json
✅ config/bianca-rios.json
```

### In narrative-os (Deep Sea Theme)
```javascript
✅ os.js (4173 lines) - theme implementation
✅ index.html + CSS - theme styling
✅ scenes/ - Deep Sea canvas scenes
✅ backend/main.py - WebSocket server
✅ imports:
   - @narrative-os/audio-engine
   - @narrative-os/engine
```

### In living-os (Living OS Theme)
```javascript
✅ os.js - theme implementation
✅ index.html + CSS - theme styling
✅ scenes/ - Living OS canvas scenes
✅ backend/main.py - WebSocket server
✅ imports:
   - @narrative-os/audio-engine
   - @narrative-os/engine
```

---

## Decision Summary Table

| Code | Extract? | When? | Library Name | Reuse | Effort | Risk |
|------|----------|-------|--------------|-------|--------|------|
| Audio Engine | ✅ YES | Week 4 | @narrative-os/audio-engine | Both | 4-6h | Low |
| Daemons | ✅ YES | Week 5-6 | @narrative-os/engine | Both | 2w | Medium |
| Canvas Scenes | ❌ NO | Never | (stay in theme repos) | Theme-specific | N/A | N/A |
| UI Colors/CSS | ❌ NO | Never | (stay in theme repos) | Theme-specific | N/A | N/A |
| Canvas Primitives | ⚠️ LATER | Phase 1+ | Maybe @narrative-os/canvas | If needed | 1w | Medium |
| File Ops | ⚠️ LATER | Phase 1 | Refactor first | Maybe | 2w | High |

---

## Key Principle

**Extract code to libraries when:**
1. ✅ It's generic (works for multiple themes)
2. ✅ It's well-encapsulated (doesn't depend on theme)
3. ✅ It's substantial (worth separate package)
4. ✅ It's reusable (multiple projects use it)

**Keep code in theme repos when:**
- ❌ It's theme-specific (colors, scenes, character text)
- ❌ It's tightly coupled (depends on DOM/theme structure)
- ❌ It's visual/artistic (vibe, appearance, feel)

---

## Next Steps

1. **✅ Week 1:** Phase 0 testing complete
2. **→ Week 2:** Visual regression tests
3. **→ Week 3:** E2E + manual tests
4. **→ Week 4:** Extract audio-engine (quick win)
5. **→ Week 5-6:** Create narrative-engine (major value)
6. **→ Week 7+:** Phase 1 refactoring with both libraries

**Decision Needed:** Proceed with this plan?

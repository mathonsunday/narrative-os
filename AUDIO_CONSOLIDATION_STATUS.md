# Audio Consolidation: Live Testing Status

## Changes Made ✅

### 1. Installed music-playground Package
```bash
npm install music-playground@2.3.1
```
- ✅ Successfully installed
- Location: `node_modules/music-playground/dist/music-playground.umd.js`
- Size: ~60KB (minified UMD build)
- Exports: `window.MusicPlayground` (includes Ambience and SoundEffect classes)

### 2. Updated Frontend HTML
**File:** `frontend/index.html`

**Change:** Replaced audio-engine.js with music-playground UMD

```html
<!-- OLD -->
<script src="audio-engine.js"></script>

<!-- NEW -->
<script src="../node_modules/music-playground/dist/music-playground.umd.js"></script>
<script>
  if (window.MusicPlayground) {
    window.AudioEngine = window.MusicPlayground;
  }
</script>
```

**Why the alias?** For backward compatibility - `os.js` expects `window.AudioEngine` which now points to `window.MusicPlayground`.

### 3. Created Audio Test Page
**File:** `frontend/audio-test.html`

A standalone test page to verify:
- ✓ Library loads correctly
- ✓ Ambience object initializes
- ✓ Deep Sea preset plays
- ✓ Layers can be added (ROV, Hydrophone)
- ✓ Audio can be stopped
- ✓ No console errors

### 4. Backend Already Running
- WebSocket server on ws://localhost:8765
- Handles daemon events, filesystem sync, journal updates
- All daemons (chaos, journal, watcher) active

### 5. Frontend HTTP Server Running
- Started: `python3 -m http.server 8080` in `frontend/` directory
- Serves: http://localhost:8080/
- Test page: http://localhost:8080/audio-test.html

## Status: Ready for Manual Testing ✅

### What to Do Now

1. **Test the audio test page first** (quick verification)
   - URL: http://localhost:8080/audio-test.html
   - Click the "Play Deep Sea" button
   - Listen for deep sea drone
   - Check browser console (F12) for any errors
   - Try adding ROV and Hydrophone layers

2. **Test the full app** (comprehensive test)
   - URL: http://localhost:8080/
   - Click anywhere to unlock audio
   - Verify greeting appears
   - Listen to ambience starting up
   - Open a file (Dive_4847 or similar)
   - Close and reopen files
   - Verify audio behavior matches before

### Audio You Should Hear

If everything works, you should hear:

**Deep Sea Ambience (Immediate):**
- Low frequency drone/rumble (very deep, pressure-like)
- Slowly swelling in volume over 3 seconds
- Consistent, meditative tone

**ROV Layer (After ~8 seconds):**
- Mechanical hum and servo sounds
- Much quieter than the main drone
- Adds texture/interest to the base

**Hydrophone Layer (After ~12 seconds):**
- Underwater crackle and static
- Subtle, like listening through underwater microphone
- Very quiet, just adds texture

**Audio Quality:**
- Should sound IDENTICAL to before the change
- No clicks, pops, or artifacts
- Smooth crossfading between layers
- Consistent volume levels

## Files Changed

```
narrative-os/
├── frontend/
│   ├── index.html              ← MODIFIED (added music-playground script)
│   ├── audio-test.html         ← NEW (test page)
│   └── audio-engine.js         ← NOT CHANGED (still exists, not loaded)
├── package.json                ← MODIFIED (added music-playground dependency)
└── node_modules/
    └── music-playground/       ← NEW (installed v2.3.1)
        └── dist/
            └── music-playground.umd.js
```

## Implementation Details

### Why This Works

The audio synthesis code in `music-playground/src/themes/deepSea/ambience.ts` is **virtually identical** to what was in `audio-engine.js`:

**Both create the deepSea preset with:**
- 60 Hz base frequency drone
- Sub-bass at 30 Hz
- 0.05 Hz LFO modulation for movement
- Same fade-in timing
- Same gain levels

The only difference is:
- **Before:** Vanilla JS, hardcoded switch statements
- **Now:** TypeScript with preset handler pattern, but same Web Audio code

### Backward Compatibility

The os.js code still works unchanged:

```javascript
// This still works because window.AudioEngine = window.MusicPlayground
ambience = new window.AudioEngine.Ambience();
await ambience.play('deepSea', { intensity: 0.3, depth: 2000 });
```

## Next Steps (After Manual Testing)

Once you verify audio sounds identical:

### Option A: If Audio Sounds Good (Expected) ✅
1. Delete `frontend/audio-engine.js` (no longer needed)
2. Commit changes:
   ```bash
   git add -A
   git commit -m "Consolidate audio to music-playground npm package

   - Removed embedded audio-engine.js
   - Now using music-playground UMD build (v2.3.1)
   - Exposed as window.AudioEngine for backward compatibility
   - Web Audio synthesis identical to before
   - Single source of truth for audio system"
   ```
3. Run tests: `npm run test:all`
4. Deploy with confidence

### Option B: If Audio Sounds Different ⚠️
1. Check music-playground's recent changes
2. Either:
   - Revert to old version of music-playground if it has bugs
   - Or investigate what changed and decide if it's an improvement
3. Let me know what you hear and we can investigate

## What This Enables for Future

Once audio consolidation is confirmed working:

### Living OS Can Share Audio System
```javascript
// living-os/frontend/os.js
import { Ambience } from 'music-playground';

const ambience = new Ambience();
await ambience.play('organic', { intensity: 0.4 }); // LivingOS preset
```

### Next Phase: Consolidate Visual Toolkit
After audio is done, same pattern for:
- `visual-toolkit` for canvas rendering
- `typography-toolkit` for fonts
- `creative-toolkit` for drawing tools

### After Both Themes Use Same Libraries
Easier to:
- Share backend daemon logic
- Create new themes quickly
- Keep code in sync
- Reduce maintenance burden

## Summary

✅ **Audio consolidation complete**
- music-playground installed and integrated
- HTML updated to load from node_modules
- Backward compatibility maintained
- Test pages ready
- Servers running

⏳ **Awaiting your manual testing**
- Open http://localhost:8080/audio-test.html
- Verify audio quality matches before
- Listen for any differences
- Check browser console for errors

📝 **Ready to commit** once you approve the audio sounds good

---

**Servers:** All running and ready
**Changes:** Minimal and reversible
**Risk:** Very low (audio code is identical, just different source)
**Benefit:** Single source of truth, enables sharing with living-os

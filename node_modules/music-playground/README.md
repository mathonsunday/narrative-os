# Ambient Audio Engine

A Web Audio API library for generating atmospheric soundscapes programmatically. Perfect for adding ambient audio to themed web projects, games, or interactive experiences.

**Built-in Theme**: Deep-sea marine biology (`themes.deepSea`)  
**Extensible**: Register custom themes for jungle, space, or any aesthetic.

## Architecture: Core + Themes

The library is organized into **core API** (theme-agnostic) and **themes** (presets):

```typescript
// New API (recommended) - explicit theme
import { themes } from 'music-playground';
const ambience = new themes.deepSea.Ambience();
await ambience.play('deepSea', { intensity: 0.7, depth: 3000 });

// Old API (backward compatible)
import { Ambience } from 'music-playground';
const ambience = new Ambience();
await ambience.play('deepSea', { intensity: 0.7, depth: 3000 });
```

See [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) for details.

## Installation & Usage

### ES Modules (Recommended for Modern Projects)

```bash
npm install music-playground
```

```typescript
import { themes } from 'music-playground';
const ambience = new themes.deepSea.Ambience();
```

### Vanilla JavaScript (UMD/IIFE)

Works with simple `<script>` tags - no build step required!

**Via CDN:**
```html
<script src="https://unpkg.com/music-playground@2.1.0/dist/music-playground.umd.js"></script>
<script>
  const ambience = new MusicPlayground.themes.deepSea.Ambience();
  await ambience.play('deepSea', { intensity: 0.5 });
</script>
```

**Local file:**
```html
<script src="./dist/music-playground.umd.js"></script>
<script>
  const ambience = new MusicPlayground.themes.livingOs.Ambience();
  await ambience.play('fieldStation', { growthLevel: 0 });
</script>
```

**Available formats:**
- `music-playground.esm.js` - ES Module (for bundlers)
- `music-playground.umd.js` - UMD (works everywhere)
- `music-playground.iife.js` - IIFE (browser-only, simpler)

## Quick Start

```typescript
import { Ambience, SoundEffect } from 'music-playground';

// Create ambience instance
const ambience = new Ambience();

// Play a preset soundscape
await ambience.play('deepSea');

// Play with custom parameters
await ambience.play('deepSea', { 
  intensity: 0.7,    // 0-1, how prominent the sounds are
  depth: 3000,       // meters, affects low frequency content
  mystery: 0.5       // 0-1, adds ethereal/unknown elements
});

// Layer multiple soundscapes
await ambience.play('deepSea');
await ambience.addLayer('sonar', { interval: 8 });

// Stop all ambience
ambience.stop();
```

## Themes

### Using Built-in Themes

```typescript
import { themes } from 'music-playground';

// Deep-sea theme (built-in)
const ambience = new themes.deepSea.Ambience();
await ambience.play('deepSea', { intensity: 0.5 });
await ambience.addLayer('rov', { intensity: 0.1 });

const sfx = new themes.deepSea.SoundEffect();
sfx.play('creature');

// Living OS theme (built-in) - Plant biology research OS
const livingOsAmbience = new themes.livingOs.Ambience();
await livingOsAmbience.play('fieldStation', { 
  growthLevel: 0,  // 0-100, controls progression from normal to eerie
  intensity: 0.3 
});

// Update growth level as the OS becomes more alive
livingOsAmbience.updateGrowthLevel(45); // Now sounds slightly off

const livingOsSfx = new themes.livingOs.SoundEffect();
livingOsSfx.setGrowthLevel(30);
livingOsSfx.play('fileConsume'); // Organic file consumption sound
livingOsSfx.play('systemNotification', { growthLevel: 30 });
```

### Registering Custom Themes

```typescript
import { registerTheme } from 'music-playground';

registerTheme('jungle', {
  Ambience: class JungleAmbience extends Ambience {
    constructor() {
      super();
      this.registerPreset('rain', createRainAmbience);
      this.registerPreset('wind', createWindAmbience);
    }
  },
  SoundEffect: class JungleSoundEffect extends SoundEffect {
    constructor() {
      super();
      this.registerSound('bird', playBirdCall);
      this.registerSound('insect', playInsectChirp);
    }
  },
});

// Now available
const ambience = new themes.jungle.Ambience();
await ambience.play('rain', { intensity: 0.6 });
```

## Available Ambience Presets

| Preset | Description | Best For |
|--------|-------------|----------|
| `deepSea` | Low drones, pressure ambience, occasional mysterious tones | Underwater scenes, ROV footage |
| `rov` | Mechanical hums, servo sounds, hydraulic movements | Submersible/vehicle scenes |
| `sonar` | Periodic ping sweeps fading into distance | Detection/scanning moments |
| `bioluminescence` | Ethereal tones, shimmer sounds | Creature encounters |
| `hydrophone` | Underwater static, radio texture | Communication/transmission |
| `discovery` | Tension building, wonder tones | Important revelations |
| `lab` | Research station ambience, equipment hums | Lab/station scenes |
| `surface` | Ocean surface, waves | Above water scenes |
| `tension` | Building suspense, dissonant tones | Danger/suspense moments |

## Sound Effects

One-shot sounds for specific UI/story moments:

```typescript
import { SoundEffect } from './src/index';

const sfx = new SoundEffect();

// Play effects
sfx.play('sonarPing');      // Classic sonar ping
sfx.play('notification');   // Gentle alert
sfx.play('discovery');      // Something found (magical arpeggio)
sfx.play('creature');       // Creature detected (whale-like)
sfx.play('click');          // UI click
sfx.play('open');           // Window/file open
sfx.play('close');          // Window/file close
sfx.play('error');          // Error tone
sfx.play('success');        // Success chime
sfx.play('warning');        // Warning alert
sfx.play('transmit');       // Data transmission
sfx.play('receive');        // Data received
sfx.play('depth');          // Depth change indicator
sfx.play('pressure');       // Pressure warning

// Set volume (0-1)
sfx.setVolume(0.5);
```

## Integration Example (narrative-os)

```typescript
// In your main app initialization
import { Ambience, SoundEffect } from '../audio-engine/src/index';

const ambience = new Ambience();
const sfx = new SoundEffect(0.4); // Lower volume for UI sounds

// Start ambient background when page loads
document.addEventListener('click', async () => {
  // Audio context needs user interaction to start
  await ambience.play('deepSea', { 
    intensity: 0.5, 
    depth: 2847,  // Match the depth indicator in your UI
    mystery: 0.3 
  });
  
  // Add sonar pings every 10 seconds
  await ambience.addLayer('sonar', { interval: 10 });
}, { once: true });

// Play sounds on interactions
document.querySelectorAll('.file-icon').forEach(icon => {
  icon.addEventListener('mouseenter', () => sfx.play('hover'));
  icon.addEventListener('click', () => sfx.play('open'));
});

// Play discovery sound when specimen is found
function onSpecimenDiscovered() {
  sfx.play('discovery');
  ambience.addLayer('bioluminescence', { intensity: 0.3 });
}

// Play creature sound for the distant creature animation
setInterval(() => {
  if (Math.random() < 0.1) {
    sfx.play('creature');
  }
}, 15000);
```

## API Reference

### Ambience

```typescript
class Ambience {
  // Play a preset soundscape
  play(preset: AmbiencePreset, options?: AmbienceOptions): Promise<void>
  
  // Add another layer on top
  addLayer(preset: AmbiencePreset, options?: AmbienceOptions): Promise<void>
  
  // Stop all soundscapes (with optional fade out in seconds)
  stop(fadeOut?: number): void
  
  // Set master volume (0-1)
  setVolume(volume: number): void
}

interface AmbienceOptions {
  intensity?: number;   // 0-1, overall presence (default: 0.5)
  depth?: number;       // Meters, affects frequencies (default: 2000)
  mystery?: number;     // 0-1, ethereal elements (default: 0.3)
  interval?: number;    // Seconds between events (default: 5)
  fadeIn?: number;      // Seconds to fade in (default: 2)
}
```

### SoundEffect

```typescript
class SoundEffect {
  constructor(volume?: number)  // Default volume 0.5
  
  // Play a sound effect
  play(type: SoundEffectType): Promise<void>
  
  // Set volume (0-1)
  setVolume(volume: number): void
}
```

## Running the Demo

```bash
cd music-playground
npm install
npm run dev
```

Open http://localhost:5173 to test all the sounds.

## File Structure

```
music-playground/
  src/
    index.ts              # Main exports (core + themes)
    core/
      ambience.ts         # Core Ambience class (theme-agnostic)
      sound-effect.ts     # Core SoundEffect class (theme-agnostic)
    themes/
      index.ts            # Theme registration system
      deepSea/
        ambience.ts       # Deep-sea ambience presets
        sound-effects.ts  # Deep-sea sound effects
        index.ts          # Deep-sea theme exports
    effects/
      reverb.ts           # Reverb effect
      delay.ts            # Delay effect
      effects-chain.ts    # Combined effects
    sound-engines/
      synth.ts            # Synthesizer (oscillators, filter, envelope)
      physical.ts         # Physical modeling (Karplus-Strong)
      sampler.ts          # Sample-based instruments
    shared/
      audio-context.ts    # Web Audio context management
      scales.ts           # Musical scales and frequencies
      scheduler.ts        # Tempo-synced scheduling
```

## Notes

- Audio requires user interaction (click) before it can play (browser security)
- All sounds are generated in real-time using Web Audio API (no audio files needed)
- The engine automatically handles audio context management

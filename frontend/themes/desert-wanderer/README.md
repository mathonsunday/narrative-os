# Desert Wanderer Theme

An archaeologist's desert expedition with dynamic time-of-day and weather systems.

## Character

**Alex** - A seasoned desert archaeologist with weathered wisdom and methodical curiosity. The field notes grow increasingly philosophical about the patterns being discovered in the sand... and what intelligence might be behind them.

## Features

### ⛏️ Excavation System
- Double-click excavation files to trigger digging animations
- Dust cloud visual effects
- Random artifact discovery messages
- Journal entries documenting findings

### 🌄 Time-of-Day System
- Dynamic background colors (dawn, morning, noon, afternoon, dusk, night)
- Sun position updates based on time
- 6 distinct visual phases
- Affects narrative tone and available activities

### 🌪️ Weather System
- Random weather changes (clear, hazy, stormy)
- Sandstorm notifications with warning messages
- Visual effects during storms
- Affects gameplay and narrative

### 📖 Archaeological Narrative
- Field notes documenting discoveries
- Pottery shards, stone tools, artifact layers
- Symbols found across multiple dig sites
- Growing suspicion about intentional patterns

### 🎨 Desert Aesthetics
- Warm sand, tan, and sunset orange colors
- Dune shapes and sand textures
- Serif fonts (Bitter) for expedition journal feel
- Authentic desert color palette

## Configuration

Edit `config.js` to customize:
- Character details (name, title, voice)
- Greeting messages
- Initial files (excavation logs, artifacts, surveys)
- Archaeological chaos events
- Field notes and journal entries
- Time-of-day and weather names
- Progression stages (Newcomer → Sage)

## Theme Features

The theme uses core infrastructure via `window.OSCore`:
- File management and drag/drop
- Toast notifications for discoveries
- Journal entries for field notes
- Window management for notes
- Time-based systems

Plus unique Desert Wanderer systems:
- **Excavation mechanics** - activate by opening excavation files
- **Time-of-day tracking** - 6 phases with visual feedback
- **Weather simulation** - random storms with warnings
- **Dynamic backgrounds** - colors change based on time
- **Sun tracking** - visual sun position follows time

## File Structure

```
desert-wanderer/
├── config.js       # Character, expedition, theme data
├── os.js           # Excavation, time, weather mechanics
├── index.html      # Complete UI with dunes and sun
└── README.md       # This file
```

## Quick Start

Visit: http://localhost:8000/frontend/themes/desert-wanderer/index.html

Or select from theme menu: http://localhost:8000/frontend/select-theme.html

## Game Mechanics

1. **Opening excavation files** triggers digging animations and discoveries
2. **Time of day changes** every hour with visual feedback
3. **Weather randomly changes** with occasional sandstorms
4. **Journal entries** document findings in field notes
5. **Files get "helpfully" renamed** by an unseen intelligence

## Narrative Arc

The theme gradually reveals that:
- Artifacts are more organized than random chance allows
- Symbols appear across unrelated dig sites
- The system is tracking the discoveries
- Something intelligent is watching from the sand

## Design Principles

- **Serif fonts** for authenticity (archaeological feel)
- **Warm color palette** - yellows, oranges, tans
- **Dune shapes** - CSS gradients creating sand formations
- **Dynamic lighting** - background changes with time
- **Exploratory tone** - curiosity mixed with creeping unease

## Progression System

Optional character progression through expedition stages:
- Newcomer (0%) - Just arrived
- Scout (25%) - Learning the landscape
- Archaeologist (50%) - Making discoveries
- Expert (75%) - Understanding patterns
- Sage (100%) - The desert reveals its secrets

## Future Enhancements

Possible additions:
- Map system for dig site locations
- Temperature indicator affecting work hours
- Artifact classification mini-game
- Team morale tracking
- Equipment inventory
- Sandstorm severity levels
- Night sky constellations
- Local guide dialog system

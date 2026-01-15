# Pixel Witch Theme

A cozy cottage witch aesthetic with beautiful pixel art and magical mechanics.

## Character

**Cecilia** - A cottage witch tending to potions, herbs, and ancient grimoires. She speaks with warmth and wonder, and the operating system... well, it seems to be learning her patterns just a little too well.

## Features

### 🧪 Potion Brewing System
- Double-click potion files to trigger brewing effects
- Visual potion bubbles (purple, teal, pink variants)
- Toast notifications when potions complete
- Random potion names and effects

### 🌙 Moon Phase System
- Automatic moon phase updates based on date
- 8 phases displayed in the clock widget
- Affects narrative tone and chaos events

### ✨ Sparkle Effects
- Floating sparkles across the desktop
- 4-pointed star pixel art style
- Smooth animations and color variations

### 📜 Witch-Themed Chaos Events
- "Helpful" file renaming with witchy suggestions
- Potion-brewing notifications
- Moon alignment messages
- Garden and grimoire reminders

### 💚 Cozy Interface
- Soft purple, pink, and teal color palette
- Rounded corners and smooth shadows
- Pixel art icons (potions, mushrooms, crystals, hearts, books, scrolls)
- Responsive file icon creation

## Configuration

Edit `config.js` to customize:
- Character details (name, title, emoji)
- Greeting messages (shown on startup)
- Initial files (what appears on desktop)
- Chaos events and message templates
- Journal entries
- Audio layers
- Progression system (growth stages)

## Theme Interface

The theme uses the core infrastructure via `window.OSCore`:
- File management
- Toast notifications
- Journal entries
- Drag & drop
- WebSocket integration (if backend available)

## File Structure

```
pixel-witch/
├── config.js       # Character, narrative, theme data
├── os.js           # Theme logic (potion brewing, moon phases)
├── index.html      # Complete UI with pixel art
└── README.md       # This file
```

## Quick Start

Visit: http://localhost:8000/frontend/themes/pixel-witch/index.html

Or select from theme menu: http://localhost:8000/frontend/select-theme.html

## Future Enhancements

Possible additions:
- Witch level progression (Apprentice → Archmagus)
- Spell casting mini-game
- Recipe/potion inventory
- Familiar pet (cat/owl) following cursor
- Seasonal variations
- Sound effects (cauldron bubbling, wind chimes)
- Backend integration for daemon chaos events

# Narrative OS

An experimental operating system interface designed for deep-sea marine biologist Dr. Mira Petrovic. This project explores innovative user experiences for operating systems through a narrative-driven, character-specific interface.

## Overview

Narrative OS combines a real backend filesystem (running in Docker) with a highly stylized frontend that tells a story. The system simulates the research environment of a deep-sea biologist, complete with ROV footage, specimen databases, grant proposals, and mysterious discoveries.

## Features

### ROV Footage Viewer

Interactive deep-sea exploration scenes rendered with Canvas:

- **The Wall** (`Dive_4914_wall_contact.mp4`) - A massive organic surface with tracking eyes that respond to your light source
- **Seekers** (`Dive_4913_biolum_swarm.mp4`) - A swarm of bioluminescent organisms that react to cursor movement (approach, flee, orbit)
- **Shadows** (`Dive_4914_midwater_shadows.mp4`) - Jellyfish-like creatures drifting through the depths, illuminated by your ROV light

All scenes feature:
- Real-time Canvas rendering
- Mouse-controlled light source
- Marine snow particle effects
- Depth and timestamp HUD overlays
- Journal entries documenting discoveries

### Visual Effects Library

Built using the [visual-toolkit](https://github.com/mathonsunday/visual-toolkit) library, which provides:

- Deep-sea color palettes (`deepSea`, `bioluminescence`, `darkness`)
- Organic motion functions (`drift`, `bob`, `pulse`, `waver`)
- Seeker swarm behavior (light-reactive creatures)
- Organic surface rendering with Simplex noise
- Material gradients and depth effects
- Marine snow particle systems

### Audio Engine

Ambient deep-sea soundscape powered by [music-playground](https://github.com/mathonsunday/music-playground):

- Deep sea ambience (configurable depth, intensity, mystery tones)
- Hydrophone crackle and static
- ROV mechanical hum
- Occasional distant creature sounds
- Web Audio API-based real-time generation

### Character-Driven Experience

- **Dr. Mira Petrovic** - Deep-sea marine biologist at MBARI
- Personalized file organization
- Journal entries documenting research
- IT notifications (security, system updates)
- Chaos events that add narrative interest

### Backend Integration

- Real filesystem running in Docker container
- WebSocket connection for real-time updates
- Python daemons generating system events:
  - `daemon_chaos.py` - File movements, renames, notifications
  - `daemon_journal.py` - Research journal entries
  - `daemon_watcher.py` - Filesystem monitoring

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Modern web browser with WebSocket support

### Running the System

1. Start the backend:
```bash
docker-compose up --build
```

2. Open `frontend/index.html` in your browser

3. Click anywhere to initialize audio (browser requirement)

### Development

The frontend is vanilla JavaScript with Canvas API. The backend is Python with WebSocket support.

## Themes

The system now supports multiple independent themes, each with unique narratives and mechanics:

- **Deep Sea OS** (Default) - Dr. Mira Petrovic exploring ROV footage
- **Living OS** - Dr. Bianca Rios discovering plant consciousness
- **Pixel Witch** - Cecilia the cottage witch brewing potions
- **Desert Wanderer** - Alex the archaeologist exploring ancient ruins

All themes share the same core infrastructure but provide completely different experiences.

### Accessing Themes

- **Default (Deep Sea):** `http://localhost:8000/frontend/index.html`
- **Theme Selector:** `http://localhost:8000/frontend/select-theme.html`
- **Individual Themes:**
  - Living OS: `/frontend/themes/living-os/index.html`
  - Pixel Witch: `/frontend/themes/pixel-witch/index.html`
  - Desert Wanderer: `/frontend/themes/desert-wanderer/index.html`

## Architecture

- **Frontend**: Vanilla JavaScript, Canvas API, Web Audio API
- **Core Infrastructure**: Shared OS utilities (WebSocket, file management, UI primitives)
- **Themes**: Independent implementations with unique narratives and mechanics
- **Backend**: Python with WebSocket server
- **Containerization**: Docker for isolated filesystem
- **Visual Library**: [visual-toolkit](https://github.com/mathonsunday/visual-toolkit)
- **Audio Library**: [music-playground](https://github.com/mathonsunday/music-playground)

## File Structure

```
narrative-os/
├── frontend/
│   ├── index.html                  # Main UI (Deep Sea - default)
│   ├── select-theme.html           # Theme selector
│   ├── core/
│   │   └── os-core.js              # Shared core infrastructure
│   ├── themes/
│   │   ├── deep-sea/
│   │   │   ├── index.html
│   │   │   ├── os.js
│   │   │   └── config.js
│   │   ├── living-os/
│   │   │   ├── index.html
│   │   │   ├── os.js
│   │   │   └── config.js
│   │   ├── pixel-witch/
│   │   │   ├── index.html
│   │   │   ├── os.js
│   │   │   └── config.js
│   │   └── desert-wanderer/
│   │       ├── index.html
│   │       ├── os.js
│   │       └── config.js
│   ├── os.js                       # Deep Sea main logic
│   ├── audio-engine.js             # Audio system
│   └── visual-toolkit.min.js       # Visual effects library
├── backend/
│   ├── server/
│   │   └── main.py                 # WebSocket server
│   ├── daemons/                    # Background processes
│   └── filesystem/                 # Real filesystem root
├── tests/                          # Test suite (129 tests)
├── vercel.json                     # Deployment configuration
├── DEPLOYMENT.md                   # Deployment strategy
├── THEME_DEVELOPMENT.md            # How to create themes
└── docker-compose.yml              # Container orchestration
```

## Deployment

The system is configured for Vercel deployment with Deep Sea OS as the default public experience:

- **Public URL** (`/`): Deep Sea OS
- **Theme Selector** (`/select-theme.html`): Available for discovery
- **Other Themes**: Accessible via direct URLs

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment configuration.

## Credits

- Visual effects powered by [visual-toolkit](https://github.com/mathonsunday/visual-toolkit)
- Audio engine adapted from [music-playground](https://github.com/mathonsunday/music-playground)
- Inspired by experimental OS interfaces and narrative-driven design

## License

[Your license here]

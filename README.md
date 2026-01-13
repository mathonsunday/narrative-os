# Narrative OS

An experimental operating system interface that tells stories through its chaos.

## What is this?

Narrative OS is an art project disguised as an operating system. It features:

- **A desktop that lies to you** — Files wander, rename themselves, and get "helpfully" reorganized
- **Fake personalization** — The system earnestly recommends things based on zero actual data
- **An IT department that cares too much** — MBARI IT sends helpful notifications about security policies
- **Deep sea aesthetics** — You're Dr. Mira Petrovic, a marine biologist studying the abyss

The interface looks comfortable and helpful. Underneath, nothing works the way you'd expect.

## Running locally

### Frontend only (simulation mode)

Just open `frontend/index.html` in a browser. The chaos runs locally via JavaScript.

### Full backend (real chaos)

```bash
docker-compose up --build
```

Then open http://localhost:8080

The backend runs real daemons that:
- Watch and manipulate files in a containerized filesystem
- Send events via WebSocket to the frontend
- Generate journal entries based on "observations"

## Project structure

```
narrative-os/
├── frontend/
│   ├── index.html      # Main UI (Abyss theme)
│   └── os.js           # Frontend logic, chaos simulation, WebSocket
├── backend/
│   ├── server/         # Python WebSocket server
│   ├── daemons/        # Chaos generators (watcher, chaos, journal)
│   └── filesystem/     # Dr. Petrovic's files
└── docker-compose.yml
```

## The character

Dr. Mira Petrovic is a deep-sea marine biologist at MBARI (Monterey Bay Aquarium Research Institute). Her desktop contains:

- ROV dive footage
- Observation logs
- Spreadsheets of bioluminescence readings
- The occasional existential note

The system "helps" her by reorganizing her research, enhancing her images with dramatic CSS filters, and sending IT security reminders about password policies.

## Tech

- Vanilla HTML/CSS/JS frontend (no frameworks)
- Python backend with `websockets`, `watchdog`, `aiofiles`
- Docker for containerization
- CSS animations for bioluminescent effects and creature simulations

## Aesthetics

The current theme is "Abyss" — dark backgrounds, bioluminescent accent colors, deep sea creatures swimming through video previews. The UI should feel like operating a research station at the bottom of the ocean.

## License

MIT — do whatever you want with this.

---

*"The system is trying to help. It doesn't understand why you keep undoing its improvements."*

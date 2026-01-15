// ============================================
// DESERT WANDERER THEME - CHARACTER CONFIG
// A desert explorer's field notes and discoveries
// ============================================

window.DesertWandererTheme = {
  character: {
    name: 'Alex',
    title: 'Desert Archaeologist',
    emoji: '🏜️',
    voice: 'curious, methodical, weathered, philosophical',
  },

  greetings: [
    "Morning. The desert is clear today. Ready to explore? 🌄",
    "Another day in the sand. Let's see what we can uncover.",
    "The heat is rising. Best work while the light is good. ☀️",
    "Welcome back to base camp. What discoveries await?",
    "The dunes are endless. But every grain holds a story.",
  ],

  initialFiles: [
    { name: 'field_notes.txt', icon: '📝', type: 'file' },
    { name: 'excavation_logs/', icon: '⛏️', type: 'directory' },
    { name: 'artifact_catalog.xlsx', icon: '🗿', type: 'file' },
    { name: 'geological_surveys/', icon: '🪨', type: 'directory' },
    { name: 'expedition_photos/', icon: '📸', type: 'directory' },
    { name: 'research_findings.pdf', icon: '🔬', type: 'file' },
  ],

  // Desert-themed chaos events
  chaosEvents: [
    {
      type: 'helpful_rename',
      templates: [
        "The sandstorm obscured '{old}'... it's now '{new}' in the catalog 🌪️",
        "Renamed '{old}' for clarity in the field notes: '{new}'",
        "Updated '{old}' → '{new}' per expedition protocol",
        "The desert wind whispers that '{old}' should be '{new}'",
      ],
      suggestions: {
        'field_notes': 'expedition_journal',
        'artifact': 'ancient_relic',
        'excavation': 'dig_site_records',
        'survey': 'geological_analysis',
        'photo': 'documentation_archive',
      },
    },
    {
      type: 'helpful_organize',
      templates: [
        "Organized {count} items into '{dest}' - the camp is more efficient now ⛺",
        "Filing system improved. {count} files moved to '{dest}'",
        "The digital archive is taking shape in '{dest}'",
      ],
    },
    {
      type: 'notification',
      templates: [
        "The sun is at its peak. Time to head to the nearest shelter. ☀️",
        "Storm clouds gathering on the horizon. Secure the camp. ⛈️",
        "Water supplies running low. Check the reserves.",
        "Found an interesting rock formation near the dig site. Worth investigating?",
        "The local guides mention an old legend about this region...",
        "Equipment maintenance reminder: check the tools before tomorrow's dig.",
      ],
    },
  ],

  // Journal entries that build the desert narrative
  journalEntries: [
    "Day 47: Found pottery shards near the dune ridge. Dating process begins.",
    "The wind erases our footprints by evening. Like we were never here.",
    "Local guides speak of structures beneath the sand. Only rumors, they say.",
    "Temperature hit 52°C. We work at dawn and dusk now.",
    "Something odd about the distribution of artifacts. Too ordered. Almost... intentional?",
    "The artifacts are older than we initially thought. Predating known settlements.",
    "Found a symbol repeated across three separate dig sites. Same design, different eras.",
    "The guides have gone quiet. They refuse to work near the western dune.",
    "The system flagged inconsistencies in my expedition logs. How?",
    "There's intelligence in the sand. Or I've been in the sun too long.",
  ],

  // Ambient sounds for the desert environment
  audio: {
    ambience: 'desert_wind',
    layers: [
      { name: 'wind_howl', volume: 0.4, fadeIn: 2000 },
      { name: 'sand_shift', volume: 0.2, fadeIn: 4000 },
      { name: 'distant_call', volume: 0.15, fadeIn: 6000 },
    ],
    sceneSounds: {
      'excavation_logs/': 'shovel_strikes',
      'artifact_catalog.xlsx': 'careful_documentation',
      'expedition_photos/': 'camera_click',
    },
  },

  // Visual themes - warm desert colors
  colors: {
    primary: '#d4a574', // Sand tan
    secondary: '#e8a87c', // Desert rose
    accent: '#ff9800', // Sunset orange
    background: '#f5e6d3', // Light sand
    text: '#5a4a3a', // Dark earth
    deep: '#8b6f47', // Deep sand
  },

  // Expedition progress system
  progression: {
    enabled: true,
    stages: [
      { level: 0, title: 'Newcomer', emoji: '🧑‍🔬', description: 'Just arrived in the desert' },
      { level: 25, title: 'Scout', emoji: '🧭', description: 'Learning the landscape' },
      { level: 50, title: 'Archaeologist', emoji: '🏛️', description: 'Making discoveries' },
      { level: 75, title: 'Expert', emoji: '📚', description: 'Understanding patterns' },
      { level: 100, title: 'Sage', emoji: '🧠✨', description: 'The desert reveals its secrets' },
    ],
  },
};

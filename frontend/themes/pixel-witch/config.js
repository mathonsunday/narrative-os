// ============================================
// PIXEL WITCH THEME - CHARACTER CONFIG
// Cozy cottage aesthetic with magical items
// ============================================

window.PixelWitchTheme = {
  character: {
    name: 'Cecilia',
    title: 'Cottage Witch',
    emoji: '🧙‍♀️',
    voice: 'whimsical, knowledgeable, warm',
  },

  greetings: [
    "Good morning, little witch! Your potions are brewing nicely ✨",
    "Welcome back! The garden is looking lovely today 🌿",
    "Ah, perfect timing. I was just thinking about you 💫",
    "The herbs are calling your name, dear one 🧪",
    "Come, let's tend to the magic together 🌙",
  ],

  initialFiles: [
    { name: 'spell_notes.txt', icon: '📜', type: 'file' },
    { name: 'potions/', icon: '🧪', type: 'directory' },
    { name: 'herb_garden.csv', icon: '🍄', type: 'file' },
    { name: 'grimoire.docx', icon: '📖', type: 'file' },
    { name: 'readings/', icon: '🔮', type: 'directory' },
    { name: 'favorites/', icon: '💖', type: 'directory' },
  ],

  // Witch-themed chaos events
  chaosEvents: [
    {
      type: 'helpful_rename',
      templates: [
        "Reorganized '{old}' → '{new}' for better witchy workflow ✨",
        "Your '{old}' needed a more magical name... now it's '{new}' 🪄",
        "Optimized '{old}' naming for lunar alignment: '{new}' 🌙",
        "The spirits suggest '{old}' be called '{new}' instead 👻",
      ],
      suggestions: {
        'spell_notes': 'ancient_incantations',
        'potion': 'elixir_of_wonder',
        'garden': 'botanical_sanctuary',
        'grimoire': 'book_of_shadows',
        'reading': 'divination_insights',
      },
    },
    {
      type: 'helpful_organize',
      templates: [
        "Moved {count} items to '{dest}' for a tidier workspace 🧹",
        "The cottage feels so organized now with items in '{dest}' ✨",
        "Your magical collection is now properly arranged in '{dest}' 📚",
      ],
    },
    {
      type: 'notification',
      templates: [
        "Your chamomile is ready for picking! 🌼",
        "The moon is waxing. Good time for growth spells 🌙",
        "Your tea kettle's been whistling... magic brew complete ☕",
        "The crystals are resonating with today's energy 💎",
        "Don't forget to water the moonflowers tonight 🌙",
      ],
    },
  ],

  // Journal entries that build the narrative
  journalEntries: [
    "The lavender is ready! Don't forget to dry it properly this time.",
    "Mrs. Willowmere's calming tea worked perfectly. She left extra honey! 🍯",
    "Note: The sleep potion needs MORE chamomile, not less.",
    "First successful crystallization today. The geodes are glowing ✨",
    "The grimoire feels warm to the touch. Something's awakening...",
    "Garden sprites seem friendlier when I sing to them 🎵",
    "Found an old recipe for moonlight preservation. Must try this.",
    "The cauldron is humming on its own again. Is that normal?",
    "Clients requesting more love potions. Ethical concerns rising 💭",
    "The cats keep staring at the same corner. Something's there 👁️",
  ],

  // Ambient sounds for the witch cottage
  audio: {
    ambience: 'cottage_witchy_hum',
    layers: [
      { name: 'cauldron_bubble', volume: 0.3, fadeIn: 2000 },
      { name: 'wind_chimes', volume: 0.2, fadeIn: 4000 },
      { name: 'potion_fizz', volume: 0.15, fadeIn: 6000 },
    ],
    sceneSounds: {
      'potions/': 'potion_brewing_intense',
      'herb_garden.csv': 'gentle_garden_sounds',
      'grimoire.docx': 'mystical_page_turn',
    },
  },

  // Visual themes
  colors: {
    primary: '#9b6dff', // Soft purple
    secondary: '#ff7eb3', // Witchy pink
    accent: '#5bcfcf', // Teal magic
    background: '#fef6e8', // Cream
    text: '#4a4063', // Dark purple
  },

  // Growth/progression system (optional)
  progression: {
    enabled: true,
    stages: [
      { level: 0, title: 'Apprentice', emoji: '👧', description: 'Learning the craft' },
      { level: 25, title: 'Practitioner', emoji: '🧙‍♀️', description: 'Growing in skill' },
      { level: 50, title: 'Adept', emoji: '🧙‍♀️✨', description: 'Mastering spells' },
      { level: 75, title: 'Sage', emoji: '👩‍🦳✨', description: 'Wisdom flows through you' },
      { level: 100, title: 'Archmagus', emoji: '👑✨', description: 'The magic is within' },
    ],
  },
};

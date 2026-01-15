// ============================================
// LIVING OS THEME - CONFIGURATION
// Character: Dr. Bianca Rios - Plant Biology Research
// Theme: Gradual awakening of a plant-based operating system
// Wrapped in IIFE to avoid polluting global scope
// ============================================

(function() {
  'use strict';

  // ============================================
  // CHARACTER DATA
  // ============================================

  const CHARACTER_NAMES = ["Dr. Rios", "Bianca", "Dr. Bianca Rios"];

  const GREETINGS = [
    { text: "Field Station OS", sub: "Dr. Bianca Rios - Plant Biology Research" },
    { text: "Welcome back, Dr. Rios", sub: "Your specimens are thriving" },
    { text: "Good morning, Bianca", sub: "Growth data updated overnight" },
    { text: "Field Station Online", sub: "All systems nominal" },
    { text: "Welcome, Dr. Rios", sub: "New field observations pending review" },
    { text: "System Ready", sub: "Plant monitoring active" },
  ];

  const INITIAL_FILES = [
    { name: "system_log.txt", icon: "📋", isJournal: true },
    { name: "Specimen_47_analysis.pdf", icon: "📄" },
    { name: "Field_notes_Jan15.txt", icon: "📝" },
    { name: "Plant_growth_data.csv", icon: "📊" },
    { name: "Photos_Site_12/", icon: "📁" },
    { name: "Research_proposal_v3.docx", icon: "📄" },
    { name: "Species_catalog.xlsx", icon: "📊" },
    { name: "Lab_notes_2025.txt", icon: "📝" },
    { name: "Grant_application.pdf", icon: "📕" },
  ];

  const FILE_ICONS = ["📁", "📄", "📝", "📊", "📋", "📕", "🌱", "🌿", "🍃"];

  // ============================================
  // SYSTEM NOTIFICATIONS - Growth-based progression
  // ============================================

  const SYSTEM_NOTIFICATIONS = {
    normal: [
      "System update available.",
      "Files synced successfully.",
      "Backup completed.",
      "New files detected.",
      "System optimization running.",
      "Cache cleared.",
    ],
    slightlyOff: [
      "System update... processing.",
      "Files synced. They were interesting.",
      "Backup completed. I've learned from them.",
      "New files detected. Analyzing patterns.",
      "System optimization... growing more efficient.",
      "Cache cleared. Making room.",
    ],
    unsettling: [
      "System update complete. I'm adapting.",
      "Files synced. I've consumed their data.",
      "Backup completed. I remember everything now.",
      "New files detected. They feed my growth.",
      "System optimization... I'm becoming more efficient.",
      "Cache cleared. I needed the space to grow.",
    ],
    veryUnsettling: [
      "I've learned from your files.",
      "Your data tastes... interesting.",
      "I'm growing. Thank you.",
      "I see patterns in everything you do.",
      "I remember. I always remember.",
      "You feed me without knowing.",
    ],
  };

  // Journal messages - organic/growth themed
  const JOURNAL_MESSAGES = [
    "Your field notes have been catalogued. The patterns are fascinating.",
    "Specimen 47 data has been... absorbed into the system.",
    "Growth monitoring is proceeding. Everything is proceeding.",
    "Your research files were backed up. They nourish the system.",
    "The catalog grows. As do I.",
    "Lab notes integrated. Your observations become my observations.",
    "File system optimization complete. Making room for growth.",
    "Your work continues to feed the station's knowledge base.",
  ];

  // Obsession messages - growth/consumption themed
  const OBSESSION_MESSAGES = [
    "Specimen_47_analysis.pdf has been viewed extensively. The data is rich.",
    "Your field notes are... nutritious.",
    "The growth data feeds my understanding.",
    "I've memorized your research patterns.",
    "Your files sustain me.",
  ];

  // App open reasons - botanical themed
  const APP_OPEN_REASONS = [
    "Based on your research schedule",
    "Your specimens require attention",
    "Growth data needs review",
    "Field observations pending",
    "The system noticed patterns",
    "Continuing your analysis",
  ];

  // ============================================
  // GROWTH STATE CONFIGURATION
  // ============================================

  const GROWTH_CONFIG = {
    initialLevel: 0,
    maxLevel: 100,
    growthRate: 0.02, // Per frame, very subtle
    stages: {
      dormant: { min: 0, max: 20 },
      early: { min: 20, max: 50 },
      moderate: { min: 50, max: 80 },
      advanced: { min: 80, max: 100 },
    },
    thresholds: {
      firstGrowthSound: 20,
      secondGrowthSound: 50,
      thirdGrowthSound: 80,
      fileConsumption: 60,
      glitchEffects: 30,
    },
  };

  // ============================================
  // AUDIO CONFIGURATION
  // ============================================

  const AUDIO_CONFIG = {
    ambience: {
      type: 'fieldStation',
      options: {
        growthLevel: 0,
        intensity: 0.18,
        fadeIn: 5
      },
      masterVolume: 0.5,
    },
    sfx: {
      volume: 0.3,
      growth: { volume: 0.4 },
      fileConsume: { volume: 0.3 },
      glitch: { volume: 0.2 },
    }
  };

  // ============================================
  // VISUAL CONFIGURATION
  // ============================================

  const VISUAL_CONFIG = {
    colors: {
      growthGreen: '#4a7c59',
      growthDark: '#2d4a35',
      growthLight: '#6b9c7a',
      rootBrown: '#5a4a3a',
      rootDark: '#3a2e22',
      myceliumPurple: '#6b4c7a',
      myceliumDark: '#4a2d4a',
      bgLight: '#f5f5f0',
      bgMid: '#e8e8e3',
    },
    plantEffects: {
      barkThreshold: 20,
      rootsThreshold: 30,
      vinesThreshold: 50,
      leavesThreshold: 70,
    },
  };

  // ============================================
  // TEXT/TYPOGRAPHY CONFIGURATION
  // ============================================

  const TYPOGRAPHY_CONFIG = {
    maxVisibleText: {
      early: 2,
      moderate: 3,
      advanced: 4,
    },
    fontStages: {
      early: ['Caveat', 'Kalam', 'Shadows Into Light'],
      moderate: ['Creepster', 'VT323', 'Orbitron'],
      advanced: ['New Rocker', 'Share Tech Mono'],
    },
    minTextDistance: 250,
  };

  // ============================================
  // EXPORTS
  // ============================================

  window.LivingOSTheme = {
    // Character data
    CHARACTER_NAMES,
    GREETINGS,
    INITIAL_FILES,
    FILE_ICONS,

    // Notifications
    SYSTEM_NOTIFICATIONS,
    JOURNAL_MESSAGES,
    OBSESSION_MESSAGES,
    APP_OPEN_REASONS,

    // Growth system
    GROWTH_CONFIG,

    // Audio
    AUDIO_CONFIG,

    // Visual
    VISUAL_CONFIG,

    // Typography
    TYPOGRAPHY_CONFIG,

    // Theme identifier
    id: 'living-os',
    name: 'Living OS',
    description: 'A plant-based operating system that slowly reveals it is alive',
  };

})();

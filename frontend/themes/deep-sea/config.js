// ============================================
// DEEP SEA THEME - CONFIGURATION
// Character: Dr. Mira Petrovic - Deep-sea marine biologist at MBARI
// Wrapped in IIFE to avoid polluting global scope
// ============================================

(function() {
  'use strict';

  // ============================================
  // CHARACTER DATA
  // ============================================

  const CHARACTER_NAMES = ["Dr. Petrovic", "Mira", "Mira Petrovic"];

  const GREETINGS = [
    { text: "Welcome back, Dr. Petrovic", sub: "Your dive logs are ready for review" },
    { text: "Good morning, Mira", sub: "The ROV footage finished processing" },
    { text: "Hey Mira", sub: "You left your annotations open" },
    { text: "Back again, Dr. Petrovic?", sub: "We saved your spot in the footage" },
    { text: "Still thinking about Dive 4847?", sub: "We kept the clip ready for you" },
    { text: "How was the team meeting, Dr. Petrovic?", sub: "Your notes were auto-saved" },
    { text: "Welcome back, Mira", sub: "3 new specimens awaiting classification" },
    { text: "Good to see you, Mira", sub: "Your draft has been auto-backed up" },
    { text: "Back from the aquarium, Dr. Petrovic?", sub: "Hope the exhibit went well" },
    { text: "Ready for another dive review?", sub: "Based on your schedule, you usually start now" },
    { text: "Hi Dr. Petrovic", sub: "The abyss awaits" },
    { text: "Welcome, Mira", sub: "Your personal folder was recently updated" },
    { text: "Good evening, Mira", sub: "Late night research session?" },
    { text: "Back for more footage?", sub: "We organized your recent views" },
  ];

  const INITIAL_FILES = [
    { name: "Dive_4847_02-34-17.mp4", icon: "🎬" },
    { name: "Dive_4914_wall_contact.mp4", icon: "🎬" },
    { name: "Dive_4913_biolum_swarm.mp4", icon: "🎬" },
    { name: "unidentified_specimen_47/", icon: "📁" },
    { name: "NOAA_grant_proposal_v4.docx", icon: "📄" },
    { name: "Barreleye_sighting_log.xlsx", icon: "📊" },
    { name: "eDNA_samples_Dec2025.csv", icon: "📋" },
    { name: "Personal/", icon: "🔒" },
    { name: "Paper_draft_midwater.docx", icon: "📝" },
  ];

  const REPLACEMENT_NAMES = [
    "Recommended: Dive_4847_02-34-17.mp4",
    "Your most viewed",
    "Based on your research interests",
    "Specimens you might recognize",
    "Picked for Mira",
    "Dr. Petrovic's favorites",
    "Continue your analysis",
    "Trending in marine biology",
    "Similar to your recent work",
    "Curated deep-sea content",
    "Because you study midwater ecology",
    "Your unfinished annotations",
  ];

  const FILE_ICONS = ["📁", "📄", "🗂️", "📋", "📝", "🎬", "🎥", "📊", "🔬", "🐙"];

  const JOURNAL_MESSAGES = [
    "We noticed you've watched Dive_4847_02-34-17.mp4 frequently. It's been moved to quick access.",
    "Your 'unidentified_specimen_47' folder was reorganized for easier reference.",
    "The grant proposal deadline is approaching. We've highlighted it for you.",
    "Based on your viewing patterns, you seem interested in midwater anomalies. Here are related files.",
    "Your Personal folder hasn't been opened in a while. We've kept it safe for you.",
    "We detected a pattern in your research. You often return to Dive 4847 around this time.",
    "Your ROV footage queue has been prioritized based on your interests.",
    "The system noticed you switch between professional and personal files. We've organized accordingly.",
    "A new specimen was added to your classification queue. It reminded us of something you viewed before.",
    "Your barreleye sighting log was backed up. You seem to value this data.",
    "We've learned you prefer timestamps in your filenames. Future files will match this pattern.",
    "Based on your behavior, you might want to revisit your paper draft soon.",
  ];

  const OBSESSION_MESSAGES = [
    "Dive_4847_02-34-17.mp4 has been viewed 47 times. Would you like to watch it again?",
    "Your most-viewed file is ready. We know it's important to you.",
    "The unidentified specimen folder has grown. Your dedication is noted.",
    "Still no match in the database for Specimen 47. We'll keep looking.",
    "You've spent 23 hours on Dive 4847 footage this month. Personalized for your focus.",
  ];

  const APP_OPEN_REASONS = [
    "Based on your research schedule",
    "You usually review footage around now",
    "Recommended by your viewing patterns",
    "Because you were looking at Dive 4847",
    "Your annotation software detected activity",
    "Continuing where you left off",
    "We noticed you were thinking about this",
    "Related to your unidentified specimen",
  ];

  // ============================================
  // MBARI IT DEPARTMENT MESSAGES
  // ============================================

  const IT_MESSAGES = {
    security: [
      { icon: "⚠️", title: "Security Alert", message: "Files containing cetacean vocalizations require encryption per Policy 4.7.2. 3 files flagged.", priority: "warning" },
      { icon: "🔒", title: "Session Notice", message: "Your session will expire in 47 minutes. Please save all research data.", priority: "info" },
      { icon: "⚠️", title: "Access Alert", message: "Unusual login activity detected from ROV Lab B. If this was you, no action required.", priority: "warning" },
      { icon: "🛡️", title: "Scan Complete", message: "Weekly security scan finished. 0 threats detected. 47 files analyzed.", priority: "success" },
      { icon: "⚠️", title: "Encryption Required", message: "specimen_47/ contains sensitive research data. Encryption pending approval.", priority: "warning" },
      { icon: "🔐", title: "Certificate Expiring", message: "Your MBARI research certificate expires in 14 days. Renew at it.mbari.org", priority: "info" },
    ],

    restrictions: [
      { icon: "🚫", title: "Application Blocked", message: "Preview.app is not approved for research devices. Use MBARI Media Viewer instead.", priority: "error" },
      { icon: "🚫", title: "File Type Restricted", message: "Opening .raw files requires IT approval. Ticket #IT-4847 has been auto-generated.", priority: "error" },
      { icon: "⚠️", title: "Browser Notice", message: "Safari is not an approved browser. Please use Chrome for all research activities.", priority: "warning" },
      { icon: "🚫", title: "USB Blocked", message: "External storage devices require pre-approval. Submit request at it.mbari.org/storage", priority: "error" },
      { icon: "⚠️", title: "Download Blocked", message: "File exceeds 500MB limit for unencrypted downloads. Use MBARI Secure Transfer.", priority: "warning" },
    ],

    compliance: [
      { icon: "📋", title: "Training Required", message: "REMINDER: Complete Q1 Cybersecurity Training by Friday. 2 modules remaining.", priority: "info" },
      { icon: "📋", title: "Certification Expiring", message: "Annual Data Handling Certification expires in 3 days. Recertify at training.mbari.org", priority: "warning" },
      { icon: "📋", title: "Policy Update", message: "Research Data Policy 7.3 has been updated. Review required by end of month.", priority: "info" },
      { icon: "✅", title: "Compliance Check", message: "Your device meets current security standards. Next audit: Feb 15.", priority: "success" },
      { icon: "📋", title: "Export Control", message: "Reminder: Deep-sea specimen data may be subject to export control regulations.", priority: "info" },
    ],

    network: [
      { icon: "⚠️", title: "VPN Unstable", message: "Connection to MBARI-SECURE is unstable. Research data sync paused.", priority: "warning" },
      { icon: "🔄", title: "Maintenance Scheduled", message: "Network maintenance tonight 02:00-04:00 PST. Save your work.", priority: "info" },
      { icon: "⚠️", title: "Guest Network", message: "You are connected to MBARI-Guest. ROV footage access is restricted.", priority: "warning" },
      { icon: "📡", title: "Sync Paused", message: "Cloud sync paused due to network conditions. 12 files pending upload.", priority: "info" },
      { icon: "✅", title: "Connected", message: "Reconnected to MBARI-SECURE. Resuming data sync.", priority: "success" },
    ],

    optimizations: [
      { icon: "✅", title: "Optimization Complete", message: "Your desktop has been optimized for compliance. Some files may have moved.", priority: "success" },
      { icon: "✅", title: "Storage Recovered", message: "Temporary files cleared. 2.3GB recovered. Old dive logs archived.", priority: "success" },
      { icon: "🔄", title: "Update Required", message: "Security definitions updated. Restart required within 24 hours.", priority: "warning" },
      { icon: "✅", title: "Backup Complete", message: "Weekly backup finished. 847 research files secured.", priority: "success" },
      { icon: "🔄", title: "System Update", message: "MBARI OS update available. Install will begin automatically at 03:00.", priority: "info" },
      { icon: "✅", title: "Index Rebuilt", message: "Search index has been rebuilt for faster specimen lookups.", priority: "success" },
    ],
  };

  // ============================================
  // AUDIO CONFIGURATION
  // ============================================

  const AUDIO_CONFIG = {
    ambience: {
      type: 'deepSea',
      options: {
        intensity: 0.3,
        depth: 2000,
        mystery: 0,  // No chime-like mystery tones
        fadeIn: 3
      },
      masterVolume: 0.5,
      layers: [
        { name: 'rov', delay: 8000, options: { intensity: 0.1 } },
        { name: 'hydrophone', delay: 12000, options: { intensity: 0.08 } },
      ]
    },
    sfx: {
      volume: 0.3,
      creatures: {
        interval: 45000,
        chance: 0.3,
        volume: 0.15
      }
    }
  };

  // ============================================
  // VISUAL SCENES
  // ============================================

  const SCENES = {
    wall: 'deepSea.wall',
    seekers: 'deepSea.seekers',
    leviathan: 'deepSea.leviathan',
  };

  // ============================================
  // EXPORTS
  // ============================================

  window.DeepSeaTheme = {
    // Character data
    CHARACTER_NAMES,
    GREETINGS,
    INITIAL_FILES,
    REPLACEMENT_NAMES,
    FILE_ICONS,
    JOURNAL_MESSAGES,
    OBSESSION_MESSAGES,
    APP_OPEN_REASONS,

    // IT Messages
    IT_MESSAGES,

    // Audio
    AUDIO_CONFIG,

    // Visual scenes
    SCENES,
  };

})();

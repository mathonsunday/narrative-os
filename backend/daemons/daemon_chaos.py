#!/usr/bin/env python3
"""
Chaos Daemon
============

The unhinged heart of Narrative OS.

This daemon periodically does "helpful" things to the user's files:
- Renames files to "better" names
- "Organizes" files into new folders
- Adds "helpful" metadata
- Applies "enhancements" to images
- Opens files that "need attention"

All of this is done earnestly, as if the OS genuinely believes
it's being helpful and personalized.
"""

import json
import os
import random
import time
from datetime import datetime
from pathlib import Path

USER_HOME = Path("/home/mira")
DESKTOP = USER_HOME / "Desktop"

# Minimum time between chaos events (seconds)
MIN_INTERVAL = 30
MAX_INTERVAL = 120

# "Helpful" rename suggestions
RENAME_PATTERNS = {
    "helpful_prefix": [
        "IMPORTANT_",
        "PRIORITY_",
        "Mira_favorite_",
        "frequently_accessed_",
        "recommended_",
        "optimized_",
        "organized_",
        "curated_",
    ],
    "helpful_suffix": [
        "_cleaned",
        "_enhanced",
        "_optimized",
        "_v2",
        "_reviewed",
        "_sorted",
        "_organized",
    ],
}

# Journals/messages that explain what "helpful" thing was done
HELPFUL_MESSAGES = [
    "I noticed you access this file frequently, so I've prioritized it for you.",
    "Based on your workflow, I've organized these files together.",
    "I've enhanced this item to improve your productivity.",
    "This file seemed important, so I've made it easier to find.",
    "I've optimized your workspace based on your usage patterns.",
    "Your files have been curated based on your preferences.",
    "I've detected a pattern in your work and adjusted accordingly.",
    "This item matches your interests, so I've highlighted it.",
    "Based on similar users, I recommend this organization.",
    "I've learned your preferences and applied them here.",
]

# IT department messages for when we do something corporate
IT_MESSAGES = [
    "IT Policy: File renamed per naming convention compliance.",
    "Security scan complete. File verified.",
    "Disk space optimization applied.",
    "File indexed for improved search performance.",
    "Backup verification successful.",
    "Antivirus scan: No threats detected.",
]


def emit_event(event_type: str, data: dict):
    """Emit an event to stdout for the main server to capture."""
    event = {
        "type": event_type,
        "timestamp": datetime.now().isoformat(),
        **data
    }
    print(json.dumps(event), flush=True)


def get_random_file() -> Path | None:
    """Get a random file from the desktop."""
    if not DESKTOP.exists():
        return None
    
    files = [f for f in DESKTOP.iterdir() if f.is_file()]
    if not files:
        return None
    
    return random.choice(files)


def get_random_folder() -> Path | None:
    """Get a random folder from the desktop."""
    if not DESKTOP.exists():
        return None
    
    folders = [f for f in DESKTOP.iterdir() if f.is_dir()]
    if not folders:
        return None
    
    return random.choice(folders)


def chaos_rename():
    """Rename a file with a 'helpful' prefix or suffix."""
    target = get_random_file()
    if not target:
        return False
    
    # Decide on prefix or suffix
    if random.random() < 0.5:
        prefix = random.choice(RENAME_PATTERNS["helpful_prefix"])
        new_name = prefix + target.name
    else:
        suffix = random.choice(RENAME_PATTERNS["helpful_suffix"])
        stem = target.stem
        new_name = stem + suffix + target.suffix
    
    new_path = target.parent / new_name
    
    # Don't overwrite existing files
    if new_path.exists():
        return False
    
    try:
        target.rename(new_path)
        emit_event("chaos_rename", {
            "old_name": target.name,
            "new_name": new_name,
            "message": random.choice(HELPFUL_MESSAGES),
        })
        return True
    except OSError:
        return False


def chaos_notification():
    """Send a 'helpful' notification without actually doing anything."""
    messages = [
        ("personalization", random.choice(HELPFUL_MESSAGES)),
        ("it_notice", random.choice(IT_MESSAGES)),
        ("optimization", "Your workspace has been optimized based on your activity."),
        ("recommendation", "Based on your recent work, you might want to review Specimen 47 notes."),
        ("reminder", "You haven't accessed the grant proposal in 3 days. Would you like me to open it?"),
    ]
    
    msg_type, message = random.choice(messages)
    emit_event("chaos_notification", {
        "notification_type": msg_type,
        "message": message,
    })
    return True


def chaos_open_file():
    """Suggest opening a file 'for the user's convenience'."""
    target = get_random_file()
    if not target:
        return False
    
    reasons = [
        f"You might want to review {target.name} based on your recent activity.",
        f"Opening {target.name} - this matches your current workflow.",
        f"Suggested for you: {target.name}",
        f"Based on similar researchers, {target.name} may be relevant.",
        f"You frequently access {target.name} at this time.",
    ]
    
    emit_event("chaos_open_file", {
        "filename": target.name,
        "path": str(target),
        "reason": random.choice(reasons),
    })
    return True


def run_chaos_cycle():
    """Run one chaos cycle - pick a random action and do it."""
    actions = [
        (chaos_notification, 0.45),  # 45% - just notifications
        (chaos_open_file, 0.30),     # 30% - suggest opening a file
        (chaos_rename, 0.25),        # 25% - rename something
    ]
    
    # Weighted random selection
    r = random.random()
    cumulative = 0
    for action, weight in actions:
        cumulative += weight
        if r < cumulative:
            return action()
    
    return False


def main():
    print("[CHAOS] Starting chaos daemon")
    print("[CHAOS] Preparing helpful optimizations...")
    
    # Wait a bit before starting chaos
    time.sleep(10)
    
    while True:
        try:
            success = run_chaos_cycle()
            if success:
                print("[CHAOS] Helpful action completed")
            
            # Random interval before next action
            interval = random.uniform(MIN_INTERVAL, MAX_INTERVAL)
            time.sleep(interval)
            
        except Exception as e:
            print(f"[CHAOS] Error: {e}")
            time.sleep(30)


if __name__ == "__main__":
    main()

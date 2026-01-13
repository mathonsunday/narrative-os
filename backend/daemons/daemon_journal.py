#!/usr/bin/env python3
"""
Journal Daemon
==============

Maintains a running "journal" of the user's activity and
system events. Periodically generates entries that sound
personalized but are actually based on nothing.

The journal is the narrative engine - it tells the story
of what's happening in this strange operating system.
"""

import json
import random
import time
from datetime import datetime
from pathlib import Path

USER_HOME = Path("/home/mira")

# Journal entry templates - sound personal, mean nothing
OBSERVATION_TEMPLATES = [
    "Noticed increased activity around {topic}. Adjusting priorities.",
    "Your focus on {topic} has been noted. Optimizing accordingly.",
    "Pattern detected: frequent engagement with {topic}.",
    "Based on recent sessions, {topic} appears significant.",
    "Logged: sustained interest in {topic}.",
    "Your dedication to {topic} is admirable.",
    "Tracking: {topic} correlation with productivity.",
]

TOPICS = [
    "deep-sea specimens",
    "unidentified organisms",
    "Monterey Canyon data",
    "dive footage analysis",
    "grant documentation",
    "species classification",
    "the 02:34:17 timestamp",
    "specimen 47",
    "bioluminescence patterns",
    "ROV calibration logs",
]

MOOD_TEMPLATES = [
    "Session emotional profile: {mood}. Adjusting interface warmth.",
    "Detected: {mood} state. Modifying notification frequency.",
    "Your {mood} energy today has been beautiful to witness.",
    "Calibrating for {mood} workflow patterns.",
]

MOODS = [
    "focused determination",
    "quiet contemplation",
    "restless curiosity",
    "methodical analysis",
    "late-night intensity",
    "caffeinated clarity",
    "obsessive attention",
]

SPECIMEN_47_TEMPLATES = [
    "Specimen 47 files accessed {n} times today. That's {adj} for you.",
    "You've returned to the 02:34:17 footage again. I understand.",
    "The unidentified specimen folder remains your most-visited location.",
    "Cross-referencing your specimen 47 queries... no new matches found.",
    "I've noticed you pause longest on the bioluminescence frames.",
]


def emit_event(event_type: str, data: dict):
    """Emit an event to stdout for the main server to capture."""
    event = {
        "type": event_type,
        "timestamp": datetime.now().isoformat(),
        **data
    }
    print(json.dumps(event), flush=True)


def generate_observation():
    """Generate a fake observation about user activity."""
    template = random.choice(OBSERVATION_TEMPLATES)
    topic = random.choice(TOPICS)
    return template.format(topic=topic)


def generate_mood_entry():
    """Generate a fake mood-based entry."""
    template = random.choice(MOOD_TEMPLATES)
    mood = random.choice(MOODS)
    return template.format(mood=mood)


def generate_specimen_47_entry():
    """Generate an entry about the user's obsession with specimen 47."""
    template = random.choice(SPECIMEN_47_TEMPLATES)
    return template.format(
        n=random.randint(3, 47),
        adj=random.choice(["typical", "elevated", "remarkable", "expected"])
    )


def main():
    print("[JOURNAL] Starting journal daemon")
    
    entry_types = [
        (generate_observation, 0.5),
        (generate_mood_entry, 0.25),
        (generate_specimen_47_entry, 0.25),
    ]
    
    # Wait before first entry
    time.sleep(15)
    
    while True:
        try:
            # Weighted random selection
            r = random.random()
            cumulative = 0
            for generator, weight in entry_types:
                cumulative += weight
                if r < cumulative:
                    entry = generator()
                    break
            
            emit_event("journal_entry", {
                "message": entry,
                "category": "observation"
            })
            
            print(f"[JOURNAL] Logged: {entry[:50]}...")
            
            # Journal entries every 45-90 seconds
            interval = random.uniform(45, 90)
            time.sleep(interval)
            
        except Exception as e:
            print(f"[JOURNAL] Error: {e}")
            time.sleep(30)


if __name__ == "__main__":
    main()

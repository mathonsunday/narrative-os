#!/usr/bin/env python3
"""
File Watcher Daemon
===================

Uses inotify to watch the user's filesystem for changes.
Emits events when files are created, modified, deleted, or renamed.

This is the "real" part - it observes actual filesystem changes
and broadcasts them so the frontend can react.
"""

import json
import os
import socket
import time
from datetime import datetime
from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

USER_HOME = Path("/home/mira")
EVENT_SOCKET = "/tmp/narrative-os-events.sock"


class DesktopEventHandler(FileSystemEventHandler):
    """Handle filesystem events on the user's desktop."""
    
    def __init__(self, event_callback):
        self.callback = event_callback
        super().__init__()
    
    def on_created(self, event):
        self.callback({
            "type": "file_created",
            "path": event.src_path,
            "is_directory": event.is_directory,
            "timestamp": datetime.now().isoformat()
        })
    
    def on_deleted(self, event):
        self.callback({
            "type": "file_deleted",
            "path": event.src_path,
            "is_directory": event.is_directory,
            "timestamp": datetime.now().isoformat()
        })
    
    def on_modified(self, event):
        self.callback({
            "type": "file_modified",
            "path": event.src_path,
            "is_directory": event.is_directory,
            "timestamp": datetime.now().isoformat()
        })
    
    def on_moved(self, event):
        self.callback({
            "type": "file_renamed",
            "old_path": event.src_path,
            "new_path": event.dest_path,
            "is_directory": event.is_directory,
            "timestamp": datetime.now().isoformat()
        })


def emit_event(event: dict):
    """Write event to stdout (captured by main server)."""
    print(json.dumps(event), flush=True)


def main():
    print("[WATCHER] Starting file watcher daemon")
    
    # Watch the desktop and documents
    paths_to_watch = [
        USER_HOME / "Desktop",
        USER_HOME / "Documents",
    ]
    
    handler = DesktopEventHandler(emit_event)
    observer = Observer()
    
    for path in paths_to_watch:
        if path.exists():
            observer.schedule(handler, str(path), recursive=True)
            print(f"[WATCHER] Watching: {path}")
    
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    
    observer.join()


if __name__ == "__main__":
    main()

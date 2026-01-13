#!/usr/bin/env python3
"""
Narrative OS - Main Server
==========================

This is the central hub that:
1. Runs an HTTP server for the frontend
2. Runs a WebSocket server for real-time events
3. Manages and coordinates all daemon processes
4. Broadcasts filesystem/system events to connected frontends

The frontend connects via WebSocket and receives a stream of events
about what's happening in the "operating system."
"""

import asyncio
import json
import os
import signal
import subprocess
import sys
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from typing import Set

import websockets

# Configuration
WEBSOCKET_PORT = 8765
HTTP_PORT = 8080
FRONTEND_DIR = Path("/opt/narrative-os/frontend")
DAEMONS_DIR = Path("/opt/narrative-os/daemons")
USER_HOME = Path("/home/mira")

# Connected WebSocket clients
connected_clients: Set = set()

# Event queue (daemons write here, server broadcasts)
event_queue: asyncio.Queue = None


class CORSRequestHandler(SimpleHTTPRequestHandler):
    """HTTP handler with CORS headers for local development."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Suppress HTTP access logs (too noisy)
        pass


def run_http_server():
    """Run the HTTP server in a separate thread."""
    server = HTTPServer(('0.0.0.0', HTTP_PORT), CORSRequestHandler)
    print(f"[HTTP] Serving frontend on http://localhost:{HTTP_PORT}")
    server.serve_forever()


async def broadcast_event(event: dict):
    """Send an event to all connected WebSocket clients."""
    if not connected_clients:
        return
    
    message = json.dumps(event)
    
    # Send to all clients, remove any that have disconnected
    disconnected = set()
    for client in connected_clients:
        try:
            await client.send(message)
        except websockets.ConnectionClosed:
            disconnected.add(client)
    
    connected_clients.difference_update(disconnected)


async def handle_client(websocket, path: str = None):
    """Handle a new WebSocket connection."""
    connected_clients.add(websocket)
    client_id = id(websocket)
    print(f"[WS] Client {client_id} connected (total: {len(connected_clients)})")
    
    # Send initial state
    await websocket.send(json.dumps({
        "type": "connected",
        "timestamp": datetime.now().isoformat(),
        "message": "Welcome to MBARI Research Station OS"
    }))
    
    # Send current filesystem state
    await send_filesystem_state(websocket)
    
    try:
        # Keep connection alive, handle any incoming messages
        async for message in websocket:
            data = json.loads(message)
            await handle_client_message(websocket, data)
    except websockets.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)
        print(f"[WS] Client {client_id} disconnected (total: {len(connected_clients)})")


async def handle_client_message(websocket, data: dict):
    """Handle a message from a client (e.g., user actions)."""
    msg_type = data.get("type")
    
    if msg_type == "file_opened":
        # User opened a file - daemons might react to this
        print(f"[EVENT] User opened: {data.get('filename')}")
        
    elif msg_type == "ping":
        await websocket.send(json.dumps({"type": "pong"}))


async def send_filesystem_state(websocket):
    """Send the current state of the user's desktop to a new client."""
    desktop_path = USER_HOME / "Desktop"
    
    if not desktop_path.exists():
        return
    
    files = []
    for item in desktop_path.iterdir():
        files.append({
            "name": item.name,
            "type": "folder" if item.is_dir() else "file",
            "size": item.stat().st_size if item.is_file() else None,
            "modified": datetime.fromtimestamp(item.stat().st_mtime).isoformat()
        })
    
    await websocket.send(json.dumps({
        "type": "filesystem_state",
        "desktop": files
    }))


async def event_broadcaster():
    """Continuously broadcast events from the queue."""
    global event_queue
    event_queue = asyncio.Queue()
    
    while True:
        event = await event_queue.get()
        print(f"[BROADCAST] {event.get('type')}: {str(event)[:80]}...")
        await broadcast_event(event)


async def read_daemon_output(proc, daemon_name: str):
    """Read stdout from a daemon process and queue events."""
    global event_queue
    
    # Wait for event_queue to be initialized
    while event_queue is None:
        await asyncio.sleep(0.1)
    
    print(f"[DAEMON] Reading output from {daemon_name}")
    
    while True:
        # Read line from subprocess stdout
        line = await asyncio.get_event_loop().run_in_executor(
            None, proc.stdout.readline
        )
        
        if not line:
            # Process ended
            print(f"[DAEMON] {daemon_name} ended")
            break
        
        line = line.decode('utf-8').strip()
        
        # Skip non-JSON lines (daemon log messages)
        if not line.startswith('{'):
            print(f"[DAEMON] {daemon_name}: {line}")
            continue
        
        try:
            event = json.loads(line)
            await event_queue.put(event)
        except json.JSONDecodeError:
            print(f"[DAEMON] {daemon_name} invalid JSON: {line[:50]}")


async def start_daemons():
    """Start all daemon processes and read their output."""
    daemon_files = list(DAEMONS_DIR.glob("daemon_*.py"))
    print(f"[DAEMONS] Found {len(daemon_files)} daemons")
    
    tasks = []
    
    for daemon_file in daemon_files:
        daemon_name = daemon_file.stem
        print(f"[DAEMONS] Starting {daemon_name}")
        
        proc = subprocess.Popen(
            [sys.executable, str(daemon_file)],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            bufsize=1  # Line buffered
        )
        
        # Create async task to read this daemon's output
        task = asyncio.create_task(read_daemon_output(proc, daemon_name))
        tasks.append(task)
    
    return tasks


async def main():
    """Main entry point."""
    print("=" * 50)
    print("NARRATIVE OS - Research Station Environment")
    print("=" * 50)
    print()
    
    # Start HTTP server in background thread
    http_thread = Thread(target=run_http_server, daemon=True)
    http_thread.start()
    
    # Start WebSocket server
    print(f"[WS] Starting WebSocket server on ws://localhost:{WEBSOCKET_PORT}")
    
    async with websockets.serve(handle_client, "0.0.0.0", WEBSOCKET_PORT):
        # Start daemon processes (they'll emit events)
        daemon_tasks = await start_daemons()
        
        # Run event broadcaster concurrently with daemon readers
        await asyncio.gather(
            event_broadcaster(),
            *daemon_tasks,
            asyncio.Future()  # Run forever
        )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Received interrupt, shutting down...")

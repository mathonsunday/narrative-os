# Narrative OS - Container Environment
# A contained Linux environment for Dr. Petrovic's research station

FROM python:3.11-slim

# System dependencies for file watching
RUN apt-get update && apt-get install -y --no-install-recommends \
    inotify-tools \
    && rm -rf /var/lib/apt/lists/*

# Create directories
WORKDIR /opt/narrative-os

# Install Python dependencies first (for better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create the user's home directory structure
RUN mkdir -p /home/mira/Desktop \
    /home/mira/Documents/Research \
    /home/mira/Documents/Drafts \
    /home/mira/.config \
    /home/mira/.local/logs \
    /var/log/narrative-os

# Copy the filesystem scaffold (character's initial files)
COPY filesystem/ /home/mira/

# Copy daemon scripts
COPY daemons/ /opt/narrative-os/daemons/

# Copy the event server
COPY server/ /opt/narrative-os/server/

# Note: Frontend is mounted as a volume in docker-compose for dev
# In production, you'd COPY it here

# Expose WebSocket port and HTTP port
EXPOSE 8765 8080

# Start the main server (runs all daemons + serves frontend)
CMD ["python", "server/main.py"]

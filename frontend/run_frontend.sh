#!/bin/bash

# Stop any running node processes
echo "Stopping any existing Node.js processes..."
NODE_PIDS=$(ps aux | grep "node.*qvs-pro/frontend" | grep -v grep | awk '{print $2}')
if [ ! -z "$NODE_PIDS" ]; then
  echo "Killing Node.js processes: $NODE_PIDS"
  kill -9 $NODE_PIDS 2>/dev/null || true
else
  echo "No Node.js processes found"
fi

# Build CSS
echo "Building CSS..."
npm run build:css

# Start on an unused port
echo "Starting frontend on port 3002..."
PORT=3002 npm start 
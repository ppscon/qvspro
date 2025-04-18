#!/bin/bash

# Get the absolute path of the project directory
PROJECT_DIR="/Users/home/Developer/qvs-pro"
FRONTEND_DIR="$PROJECT_DIR/frontend"
API_DIR="$PROJECT_DIR/api"

# Print divider
divider() {
  echo "----------------------------------------"
}

# Function to stop servers
stop_servers() {
  echo "Stopping all QVS-Pro servers..."
  
  # Find and kill Node.js processes
  NODE_PIDS=$(ps aux | grep "node.*qvs-pro" | grep -v grep | awk '{print $2}')
  if [ ! -z "$NODE_PIDS" ]; then
    echo "Killing Node.js processes: $NODE_PIDS"
    kill -9 $NODE_PIDS 2>/dev/null || true
  else
    echo "No Node.js processes found"
  fi
  
  # Find and kill Python processes
  PYTHON_PIDS=$(ps aux | grep "python.*qvs-pro" | grep -v grep | awk '{print $2}')
  if [ ! -z "$PYTHON_PIDS" ]; then
    echo "Killing Python processes: $PYTHON_PIDS"
    kill -9 $PYTHON_PIDS 2>/dev/null || true
  else
    echo "No Python processes found"
  fi
  
  echo "All servers stopped."
}

# Check command
if [ "$1" = "stop" ]; then
  stop_servers
  exit 0
fi

# Stop any running servers first
stop_servers

# Check if directories exist
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Error: Frontend directory not found at $FRONTEND_DIR"
  exit 1
fi

if [ ! -d "$API_DIR" ]; then
  echo "Error: API directory not found at $API_DIR"
  exit 1
fi

# Start the API server
divider
echo "Starting API server..."
cd "$API_DIR"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
  python3 app.py > "$PROJECT_DIR/api.log" 2>&1 &
  API_PID=$!
  echo "API server started with PID: $API_PID"
  echo "API logs being written to $PROJECT_DIR/api.log"
else
  echo "Error: Python 3 not found. Please install Python 3"
  exit 1
fi

# Wait for API to start
echo "Waiting for API to start..."
sleep 3

# Start the frontend server
divider
echo "Starting frontend server..."
cd "$FRONTEND_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in frontend directory ($FRONTEND_DIR)"
  kill $API_PID 2>/dev/null || true
  exit 1
fi

# Start frontend in its own directory
echo "Building frontend CSS..."
cd "$FRONTEND_DIR" && npm run build:css || {
  echo "Failed to build CSS. Continuing anyway..."
}

echo "Starting frontend server..."
cd "$FRONTEND_DIR" && PORT=3000 npm start > "$PROJECT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"
echo "Frontend logs being written to $PROJECT_DIR/frontend.log"

divider
echo "QVS-Pro is running!"
echo "- Frontend: http://localhost:3000"
echo "- API: http://localhost:5001"
divider
echo "Log files:"
echo "- API logs: $PROJECT_DIR/api.log"
echo "- Frontend logs: $PROJECT_DIR/frontend.log"
divider
echo "To stop the servers, run: $PROJECT_DIR/start.sh stop"
echo "Or press Ctrl+C to stop all servers"

# Write PIDs to file for later use
echo "$API_PID $FRONTEND_PID" > "$PROJECT_DIR/.qvs-pids"

# Function to clean up on exit
cleanup() {
  echo "Stopping servers..."
  kill $API_PID $FRONTEND_PID 2>/dev/null || true
  rm -f "$PROJECT_DIR/.qvs-pids" 2>/dev/null || true
  echo "Servers stopped"
  exit 0
}

# Set trap for clean exit
trap cleanup INT TERM
wait 
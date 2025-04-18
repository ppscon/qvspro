#!/bin/bash
# Development script to run all components

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "tmux is required for this script. Please install it first."
    exit 1
fi

# Create a new tmux session
SESSION_NAME="qvs-pro-dev"
tmux new-session -d -s $SESSION_NAME

# Build Go scanner
tmux send-keys -t $SESSION_NAME "cd scanner && go build -o qvs-pro && cd .." C-m

# Split window for Flask API
tmux split-window -h -t $SESSION_NAME
tmux send-keys -t $SESSION_NAME "cd api && pip install -r requirements.txt && python app.py" C-m

# Split window for React frontend
tmux split-window -v -t $SESSION_NAME
tmux send-keys -t $SESSION_NAME "cd frontend && npm install && npm start" C-m

# Select the first pane
tmux select-pane -t 0

# Attach to the session
tmux attach-session -t $SESSION_NAME

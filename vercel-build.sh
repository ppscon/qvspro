#!/bin/bash

# Navigate to frontend directory
echo "Navigating to frontend directory..."
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build the frontend
echo "Building frontend..."
npm run build

echo "Build completed!" 
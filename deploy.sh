#!/bin/bash

# Copy the Linux version of the scanner to the scanner directory
echo "Setting up scanner..."
mkdir -p scanner
cp scanner/qvs-pro-linux scanner/qvs-pro
chmod +x scanner/qvs-pro

echo "Scanner setup complete!" 
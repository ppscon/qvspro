#!/bin/bash

# Make sure the scanner directory exists
mkdir -p scanner

# Copy the Linux scanner to the expected location and make it executable
cp scanner/qvs-pro-linux scanner/qvs-pro-linux
chmod +x scanner/qvs-pro-linux

echo "Scanner preparation complete." 
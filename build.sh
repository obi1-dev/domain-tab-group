#!/bin/bash

# Build with Vite
npx vite build

# Copy static files to dist
cp manifest.json dist/
cp popup.html dist/
mkdir -p dist/icons
cp icons/*.svg dist/icons/

echo "Build completed successfully!"

#!/bin/bash
# Build script to build frontend and prepare for Django serving

set -e

echo "Building React frontend..."
cd frontend
npm install
npm run build

echo "Frontend build complete!"
echo "The built files are in frontend/dist/"
echo "Django will serve these files automatically."


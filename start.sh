#!/bin/bash

# Check if frontend build exists
if [ ! -d "frontend/build" ]; then
  echo "❌ Frontend build directory not found!"
  echo "Building frontend now..."
  cd frontend && npm install --legacy-peer-deps && npm run build
  cd ..
fi

echo "✅ Frontend build exists"
echo "Starting server..."
node backend/server.js

#!/bin/bash
# Setup script for Geofeed Manager (local development)

set -euo pipefail

echo "Setting up Geofeed Manager..."

echo "Installing dependencies..."
npm install

echo "Creating data directory..."
mkdir -p data

echo "Checking environment..."
if [ ! -f .env.local ]; then
  echo "Missing .env.local"
  echo "Copy .env.example to .env.local and fill in Supabase credentials."
  exit 1
fi

echo "Running database migrations..."
npm run prisma:migrate

echo "Setup complete!"
echo "Run: npm run dev"
echo "Open: http://localhost:3000/geo"

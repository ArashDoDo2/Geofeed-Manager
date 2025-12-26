#!/bin/bash
# Setup script for Geofeed Manager

echo "Setting up Geofeed Manager..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create data directory
echo "Creating data directory..."
mkdir -p data

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "Running database migrations..."
npm run prisma:migrate -- --name init

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local"
echo "2. Fill in your Supabase credentials"
echo "3. Run: npm run dev"
echo ""
echo "Visit http://localhost:3000/geo to start"

#!/bin/bash

echo "================================"
echo "Protocol 66 - Setup Script"
echo "================================"
echo ""

echo "[1/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed"
    exit 1
fi

echo ""
echo "[2/5] Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env file created from template"
    echo "IMPORTANT: Edit .env and add your ANTHROPIC_API_KEY!"
else
    echo ".env already exists, skipping..."
fi

echo ""
echo "[3/5] Starting PostgreSQL with Docker..."
docker-compose up postgres -d
if [ $? -ne 0 ]; then
    echo "WARNING: Docker Compose failed. Do you have Docker installed?"
    echo "You can install PostgreSQL manually instead."
fi

echo ""
echo "[4/5] Waiting for database to be ready..."
sleep 5

echo ""
echo "[5/5] Setup complete!"
echo ""
echo "================================"
echo "Next Steps:"
echo "================================"
echo "1. Edit .env file with your API keys"
echo "2. Run: npm run start:dev"
echo "3. Open: http://localhost:8000/docs"
echo ""
echo "================================"

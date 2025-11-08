#!/bin/bash

# Railway.app deployment script
# This script runs when deploying to Railway

echo "🚀 Starting LawMind Backend Deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements-prod.txt

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Start the server
echo "🧠 Starting LawMind Backend..."
uvicorn main:app --host 0.0.0.0 --port $PORT

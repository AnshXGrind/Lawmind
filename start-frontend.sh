#!/bin/bash

echo "================================================"
echo "   LawMind - AI Legal Drafting Assistant"
echo "   Frontend Development Server Startup Script"
echo "================================================"
echo ""

cd frontend

echo "[1/3] Checking Node.js installation..."
node --version
if [ $? -ne 0 ]; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi
echo ""

echo "[2/3] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo ""

echo "[3/3] Starting React development server..."
echo "Frontend will be available at: http://localhost:3000"
echo ""
npm start

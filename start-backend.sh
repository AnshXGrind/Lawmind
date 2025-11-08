#!/bin/bash

echo "================================================"
echo "   LawMind - AI Legal Drafting Assistant"
echo "   Backend Server Startup Script"
echo "================================================"
echo ""

cd backend

echo "[1/3] Checking Python installation..."
python3 --version
if [ $? -ne 0 ]; then
    echo "ERROR: Python is not installed or not in PATH"
    exit 1
fi
echo ""

echo "[2/3] Activating virtual environment..."
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
fi
source venv/bin/activate
echo ""

echo "[3/3] Starting FastAPI server..."
echo "Backend will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
python main.py

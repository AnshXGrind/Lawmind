@echo off
echo ================================================
echo    LawMind - AI Legal Drafting Assistant
echo    Backend Server Startup Script
echo ================================================
echo.

cd backend

echo [1/3] Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)
echo.

echo [2/3] Activating virtual environment...
if not exist venv (
    echo Virtual environment not found. Creating...
    python -m venv venv
)
call venv\Scripts\activate
echo.

echo [3/3] Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
python main.py

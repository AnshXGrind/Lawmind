@echo off
echo ================================================
echo    LawMind - AI Legal Drafting Assistant
echo    Frontend Development Server Startup Script
echo ================================================
echo.

cd frontend

echo [1/3] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo.

echo [2/3] Checking dependencies...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo.

echo [3/3] Starting React development server...
echo Frontend will be available at: http://localhost:3000
echo.
npm start

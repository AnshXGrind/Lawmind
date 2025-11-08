@echo off
echo ========================================
echo   Starting LawMind Application
echo ========================================
echo.

echo [1/2] Starting Backend API Server...
start "LawMind Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe main.py"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend React App...
start "LawMind Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   LawMind is starting up!
echo ========================================
echo.
echo Backend API will be available at:  http://localhost:8000
echo Frontend App will be available at: http://localhost:3000
echo.
echo Both servers will open in separate windows.
echo Press any key to close this window...
pause >nul

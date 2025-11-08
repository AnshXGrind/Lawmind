@echo off
echo.
echo ====================================
echo   STARTING LAWMIND SERVERS
echo ====================================
echo.

REM Kill any existing processes
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start Backend
echo [1/2] Starting Backend on http://localhost:8000...
start "LawMind Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe main.py"
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend on http://localhost:3000...
start "LawMind Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ====================================
echo   SERVERS STARTING!
echo ====================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Wait 30 seconds for frontend to compile...
echo Then open: http://localhost:3000
echo.
pause

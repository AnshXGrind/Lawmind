@echo off
echo ========================================
echo   STARTING LAWMIND FRONTEND SERVER
echo ========================================
cd /d "%~dp0frontend"
echo.
echo Starting React development server on http://localhost:3000
echo.
npm start
pause

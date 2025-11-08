@echo off
echo ========================================
echo   STARTING LAWMIND BACKEND SERVER
echo ========================================
cd /d "%~dp0backend"
call venv\Scripts\activate
echo.
echo Starting FastAPI server on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
python main.py
pause

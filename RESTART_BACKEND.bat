@echo off
echo ========================================
echo   RESTARTING LAWMIND BACKEND
echo ========================================
echo.

cd /d D:\github\Lawmind\backend

echo [1/2] Recreating database with new schema...
python -c "from app.core.database import engine, Base; from app.models.database_models import User, Draft; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine); print('✅ Database recreated!')" 2>nul

echo [2/2] Starting backend server...
echo.
python -m uvicorn main:app --reload --port 8000

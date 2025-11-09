@echo off
cd /d D:\github\Lawmind\backend
python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8000)"
pause

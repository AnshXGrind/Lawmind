@echo off
echo.
echo ========================================
echo   LawMind Pre-Deployment Checks
echo ========================================
echo.

REM Check 1: Git status
echo [1/5] Checking Git status...
git status --short > nul 2>&1
if %errorlevel% equ 0 (
    echo   OK - Git repository detected
) else (
    echo   WARNING - Not a git repository
)
echo.

REM Check 2: Backend files
echo [2/5] Checking backend files...
if exist "backend\requirements-prod.txt" (
    echo   OK - Production requirements found
) else (
    echo   ERROR - Missing requirements-prod.txt
)
if exist "backend\main.py" (
    echo   OK - Main application found
) else (
    echo   ERROR - Missing main.py
)
echo.

REM Check 3: Frontend files
echo [3/5] Checking frontend files...
if exist "frontend\package.json" (
    echo   OK - package.json found
) else (
    echo   ERROR - Missing package.json
)
if exist "frontend\src\App.js" (
    echo   OK - React app found
) else (
    echo   ERROR - Missing App.js
)
echo.

REM Check 4: Deployment configs
echo [4/5] Checking deployment configurations...
if exist "vercel.json" (
    echo   OK - vercel.json found
) else (
    echo   ERROR - Missing vercel.json
)
if exist "netlify.toml" (
    echo   OK - netlify.toml found
) else (
    echo   ERROR - Missing netlify.toml
)
echo.

REM Check 5: Documentation
echo [5/5] Checking documentation...
if exist "DEPLOYMENT_GUIDE.md" (
    echo   OK - Deployment guide found
) else (
    echo   ERROR - Missing deployment guide
)
if exist "DEPLOY_CHECKLIST.md" (
    echo   OK - Deployment checklist found
) else (
    echo   ERROR - Missing checklist
)
echo.

echo ========================================
echo   Pre-Deployment Summary
echo ========================================
echo.
echo Before deploying, ensure you have:
echo.
echo 1. Pushed all code to GitHub
echo 2. Created Vercel account
echo 3. Created Netlify account  
echo 4. Obtained OpenAI API key
echo 5. Setup PostgreSQL database
echo.
echo Next steps:
echo 1. Read DEPLOY_CHECKLIST.md
echo 2. Deploy backend to Vercel
echo 3. Deploy frontend to Netlify
echo.
echo ========================================
echo.
pause

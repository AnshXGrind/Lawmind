#!/bin/bash

# Pre-deployment check script
# Run this before deploying to verify everything is ready

echo "🔍 LawMind Pre-Deployment Checks"
echo "=================================="
echo ""

# Check 1: Git status
echo "✓ Checking Git status..."
if git diff-index --quiet HEAD --; then
    echo "  ✅ No uncommitted changes"
else
    echo "  ⚠️  Warning: You have uncommitted changes"
    echo "     Run: git add . && git commit -m 'Ready for deployment'"
fi
echo ""

# Check 2: Backend dependencies
echo "✓ Checking backend dependencies..."
if [ -f "backend/requirements-prod.txt" ]; then
    echo "  ✅ Production requirements file exists"
else
    echo "  ❌ Missing requirements-prod.txt"
fi
echo ""

# Check 3: Frontend build
echo "✓ Checking frontend configuration..."
if [ -f "frontend/package.json" ]; then
    echo "  ✅ package.json exists"
else
    echo "  ❌ Missing package.json"
fi
echo ""

# Check 4: Environment files
echo "✓ Checking environment configuration..."
if [ -f "backend/.env.example" ]; then
    echo "  ✅ Backend .env.example exists"
fi
if [ -f "frontend/.env.production.example" ]; then
    echo "  ✅ Frontend .env.production.example exists"
fi
echo ""

# Check 5: Deployment configs
echo "✓ Checking deployment configurations..."
configs=("vercel.json" "netlify.toml" "backend/Procfile" "backend/runtime.txt")
for config in "${configs[@]}"; do
    if [ -f "$config" ]; then
        echo "  ✅ $config exists"
    else
        echo "  ❌ Missing $config"
    fi
done
echo ""

# Summary
echo "=================================="
echo "📋 Pre-Deployment Summary"
echo "=================================="
echo ""
echo "Before deploying, make sure you have:"
echo ""
echo "1. ✅ Pushed all code to GitHub"
echo "2. ✅ Created Vercel account"
echo "3. ✅ Created Netlify account"
echo "4. ✅ Obtained OpenAI API key"
echo "5. ✅ Setup PostgreSQL database (Neon.tech)"
echo ""
echo "Next steps:"
echo "1. Read DEPLOY_CHECKLIST.md"
echo "2. Deploy backend to Vercel"
echo "3. Deploy frontend to Netlify"
echo ""
echo "Good luck! 🚀"

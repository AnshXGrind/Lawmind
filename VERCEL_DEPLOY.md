# 🚀 Quick Vercel Deployment Guide

## ✅ Step-by-Step Deployment

### Step 1: Push to GitHub (GitHub Desktop)
1. Open **GitHub Desktop**
2. You should see all your changes listed
3. Write commit message: `"Complete LawMind v1.0 - All premium features"`
4. Click **"Commit to main"**
5. Click **"Push origin"**
6. Copy your repository URL: `https://github.com/AnshXGrind/Lawmind`

---

### Step 2: Deploy Frontend on Vercel (Free)

1. **Go to:** https://vercel.com
2. **Sign in** with GitHub
3. Click **"New Project"**
4. **Import** your repository: `AnshXGrind/Lawmind`
5. **Configure:**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```
6. **Environment Variables:** (None needed for frontend)
7. Click **"Deploy"**
8. **Wait 2-3 minutes** for build
9. **Copy your URL:** `https://lawmind-xyz.vercel.app`

---

### Step 3: Deploy Backend on Render (Free)

1. **Go to:** https://render.com
2. **Sign in** with GitHub
3. Click **"New +"** → **"Web Service"**
4. **Connect repository:** `AnshXGrind/Lawmind`
5. **Configure:**
   ```
   Name: lawmind-backend
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. **Environment Variables:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=sqlite:///./lawmind.db
   SECRET_KEY=your_secret_key_here
   ```
7. Click **"Create Web Service"**
8. **Wait 5-10 minutes** for build
9. **Copy your URL:** `https://lawmind-backend.onrender.com`

---

### Step 4: Connect Frontend to Backend

1. **Edit:** `frontend/src/utils/api.js`
2. **Change baseURL:**
   ```javascript
   const API_BASE_URL = 'https://lawmind-backend.onrender.com';
   ```
3. **Commit and push** to GitHub
4. Vercel will **auto-redeploy** (2 min)

---

### Step 5: Test Live App

1. **Open:** Your Vercel URL
2. **Register** new account
3. **Test all features:**
   - Login/Dashboard
   - Create Draft
   - OCR Upload
   - Quality Score
   - Validation

---

## 🎯 Quick Reference

### Your URLs (After Deployment)
```
Frontend: https://lawmind-xyz.vercel.app
Backend:  https://lawmind-backend.onrender.com
API Docs: https://lawmind-backend.onrender.com/docs
```

### Important Files for Deployment

**Frontend (Vercel):**
- ✅ `package.json` - Already configured
- ✅ Build command: `npm run build`
- ✅ Output: `build/` folder
- ⚠️ Update API URL in `src/utils/api.js`

**Backend (Render):**
- ✅ `requirements.txt` - Already configured
- ✅ `main.py` - Entry point ready
- ⚠️ Add environment variables in Render dashboard

---

## 🔧 Troubleshooting

### Frontend Build Fails
```bash
# Locally test build
cd frontend
npm run build

# If errors, fix them before deploying
```

### Backend Build Fails
```bash
# Check requirements.txt has all dependencies
cd backend
pip freeze > requirements.txt
```

### API Connection Errors
1. Check backend URL is correct in `api.js`
2. Verify CORS settings in `backend/main.py`
3. Check environment variables in Render

---

## 📦 Alternative: Single Deployment (Render Full Stack)

If you want **everything on Render** (easier):

1. Deploy backend as Web Service (same as above)
2. Deploy frontend as **Static Site**:
   ```
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/build
   ```

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - Vercel: Unlimited bandwidth, 100GB free
   - Render: 750 hours/month, sleeps after 15 min inactivity

2. **Database:**
   - SQLite works on Render (file-based)
   - For production, upgrade to PostgreSQL

3. **Custom Domain:**
   - Add your domain in Vercel settings
   - Update DNS records

4. **Environment Variables:**
   - Keep API keys secret
   - Never commit `.env` files to GitHub

---

## ✅ Deployment Checklist

**Before Pushing to GitHub:**
- [ ] Remove any `.env` files from git
- [ ] Add `.env` to `.gitignore`
- [ ] Test build locally: `cd frontend && npm run build`
- [ ] Verify all dependencies in `requirements.txt`

**After Deployment:**
- [ ] Test user registration
- [ ] Test OCR upload
- [ ] Test quality score
- [ ] Test validation modal
- [ ] Test AI draft generation
- [ ] Check API docs endpoint

---

## 🎉 You're Ready!

1. **Push to GitHub** (via GitHub Desktop)
2. **Deploy Frontend** (Vercel - 3 minutes)
3. **Deploy Backend** (Render - 10 minutes)
4. **Update API URL** (in api.js)
5. **Test Live App**

**Total Time: ~20 minutes**

Your AI legal assistant will be live at:
`https://lawmind-xyz.vercel.app` 🚀

---

*Need help? Check Vercel/Render documentation or see PRODUCTION_READY.md*

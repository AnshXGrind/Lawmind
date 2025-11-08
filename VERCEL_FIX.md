# 🚀 Vercel Deployment Fix

## Issue
Getting "404: NOT_FOUND" error on Vercel deployment.

## Solution

Vercel deployments need to be split:
- **Backend → Deploy separately**
- **Frontend → Deploy separately**

---

## ✅ CORRECT Deployment Steps

### Option 1: Deploy Backend Only (Recommended)

1. **Deploy ONLY the backend folder to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - **Important:** Set **Root Directory** to `backend`
   - Framework Preset: Other
   - Click Deploy

2. **Add Environment Variables in Vercel:**
   ```
   OPENAI_API_KEY=sk-your-key
   DATABASE_URL=postgresql://...
   SECRET_KEY=random-secret-key
   CORS_ORIGINS=["https://your-frontend.netlify.app"]
   ```

3. **Backend will be live at:**
   ```
   https://lawmind-backend.vercel.app
   ```

### Option 2: Use Railway for Backend (Easier!)

Railway is actually better for FastAPI Python backends:

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Select `backend` directory
5. Railway auto-detects Python
6. Add environment variables
7. Deploy!

**Railway provides:**
- ✅ Free PostgreSQL database (automatic)
- ✅ Better Python support
- ✅ Easier configuration

---

## 🎨 Frontend Deployment (Netlify)

1. Go to [app.netlify.com/start](https://app.netlify.com/start)
2. Import from GitHub
3. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. **Environment variable:**
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```
5. Deploy!

---

## 🔧 Files Updated

I've fixed the Vercel configuration:

1. ✅ Updated root `vercel.json` - Now simpler
2. ✅ Created `backend/vercel.json` - Backend-specific config
3. ✅ Updated `backend/vercel_app.py` - Better ASGI wrapper

---

## 💡 Recommended Approach

**Best Practice:** Separate deployments

**Backend:**
- Railway.app (recommended) OR
- Vercel (with backend folder only)

**Frontend:**
- Netlify (recommended)

---

## 🚀 Quick Fix Steps

### If using Vercel for backend:

1. **Delete current Vercel deployment**
2. **Create new deployment:**
   - Root Directory: `backend` ← IMPORTANT!
   - Leave Framework as "Other"
3. **Add environment variables**
4. **Deploy**

### If switching to Railway:

1. Go to railway.app
2. New Project from GitHub
3. Select backend folder
4. Add env vars
5. Deploy (automatic PostgreSQL included!)

---

## ✅ Verify Deployment

After deploying backend:

```bash
# Test your backend URL
curl https://your-backend.vercel.app
# Should return: {"status":"active","service":"LawMind API","version":"1.0.0"}

# Test API docs
# Visit: https://your-backend.vercel.app/docs
```

---

## 📞 Still Getting Errors?

### Common Issues:

**1. Wrong Root Directory**
- Solution: Make sure Root Directory is set to `backend`

**2. Python Version Issues**
- Solution: Check `backend/runtime.txt` has `python-3.9.18`

**3. Dependencies Not Installing**
- Solution: Make sure using `requirements-prod.txt`

**4. Environment Variables Missing**
- Solution: Add all required env vars in Vercel dashboard

---

## 🎯 Final Recommendation

For easiest deployment:

1. **Backend → Railway** (better for Python)
2. **Frontend → Netlify** (perfect for React)

Both are free and work great together!

See `DEPLOYMENT_GUIDE.md` for complete instructions.

# 🚀 LawMind Deployment Guide

Complete guide to deploy LawMind on Vercel and Netlify.

---

## 📋 Prerequisites

Before deploying, you need:

1. ✅ GitHub account with this repository pushed
2. ✅ [Vercel Account](https://vercel.com/signup) (for backend)
3. ✅ [Netlify Account](https://netlify.com/signup) (for frontend)
4. ✅ [OpenAI API Key](https://platform.openai.com/api-keys)
5. ✅ [PostgreSQL Database](https://neon.tech) (free tier available)

---

## 🎯 Deployment Strategy

**Backend (FastAPI)** → **Vercel** or **Railway**
**Frontend (React)** → **Netlify** or **Vercel**

---

## 🔧 Option 1: Deploy Backend to Vercel

### Step 1: Prepare Backend for Vercel

Already configured! Files created:
- ✅ `vercel.json` - Vercel configuration
- ✅ `backend/vercel_app.py` - Entry point
- ✅ `backend/requirements-prod.txt` - Production dependencies
- ✅ `backend/runtime.txt` - Python version

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository `Lawmind`
4. **Framework Preset:** Other
5. **Root Directory:** `backend`
6. Click **"Deploy"**

### Step 4: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
DATABASE_URL=postgresql://user:pass@host/dbname
SECRET_KEY=your-super-secret-key-change-this
CORS_ORIGINS=["https://your-frontend.netlify.app"]
```

### Step 5: Get Backend URL

After deployment, copy your backend URL:
```
https://lawmind-backend.vercel.app
```

---

## 🎨 Option 2: Deploy Frontend to Netlify

### Step 1: Update Frontend Environment

Edit `frontend/.env.production`:

```bash
# Create this file
REACT_APP_API_URL=https://lawmind-backend.vercel.app
```

### Step 2: Update API Base URL

Already configured in `frontend/src/utils/api.js`

### Step 3: Deploy on Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select `Lawmind` repository
4. **Build settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
5. Click **"Deploy site"**

### Step 4: Configure Environment Variables

In Netlify Dashboard → Site settings → Environment variables:

```env
REACT_APP_API_URL=https://lawmind-backend.vercel.app
```

### Step 5: Get Frontend URL

Your app will be live at:
```
https://lawmind.netlify.app
```

---

## 🐘 Alternative: Backend on Railway

If Vercel doesn't work well for Python, use Railway:

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose `Lawmind` repository
5. Select **"backend"** directory
6. Railway will auto-detect FastAPI

### Environment Variables on Railway

```env
OPENAI_API_KEY=sk-your-key
DATABASE_URL=postgresql://provided-by-railway
SECRET_KEY=your-secret
PORT=8000
CORS_ORIGINS=["https://lawmind.netlify.app"]
```

Railway provides free PostgreSQL database automatically!

---

## 🗄️ Database Setup (PostgreSQL)

### Option A: Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech)
2. Create a free project
3. Copy connection string:
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/lawmind
```
4. Add to Vercel/Railway environment variables

### Option B: Railway Database

Railway provides PostgreSQL automatically - just use the `DATABASE_URL` they provide.

---

## 🔄 Update Backend Configuration for Production

### File: `backend/app/core/config.py`

The config already supports environment variables. Just ensure these are set:

```python
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lawmind.db")
CORS_ORIGINS: List[str] = json.loads(os.getenv("CORS_ORIGINS", '["http://localhost:3000"]'))
```

---

## ✅ Post-Deployment Checklist

### Backend Verification

Visit your backend URL and check:
- [ ] https://your-backend.vercel.app → Shows `{"status":"active"}`
- [ ] https://your-backend.vercel.app/docs → Shows API documentation
- [ ] https://your-backend.vercel.app/health → Returns healthy status

### Frontend Verification

Visit your frontend URL:
- [ ] https://lawmind.netlify.app → Shows LawMind login page
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Dashboard loads correctly

### Database Migration

Run migrations on production:

```bash
# Connect to your production backend
vercel env pull
cd backend
alembic upgrade head
```

---

## 🔐 Security Best Practices

### 1. Update CORS Origins

In backend `.env`:
```env
CORS_ORIGINS=["https://lawmind.netlify.app","https://www.lawmind.netlify.app"]
```

### 2. Use Strong Secret Key

Generate a new secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Enable HTTPS Only

Both Vercel and Netlify provide HTTPS automatically ✅

### 4. Protect API Keys

Never commit `.env` files - already in `.gitignore` ✅

---

## 📊 Monitoring & Logs

### Vercel Logs
- Dashboard → Your Project → Logs
- Real-time function logs
- Error tracking

### Netlify Logs
- Site settings → Deploys → Deploy log
- Build logs
- Function logs

---

## 🚀 Quick Deploy Commands

### Full Deployment

```bash
# 1. Commit changes
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Vercel auto-deploys backend
# 3. Netlify auto-deploys frontend
```

### Manual Deploy (if auto-deploy disabled)

```bash
# Backend on Vercel
vercel --prod

# Frontend on Netlify
cd frontend
netlify deploy --prod
```

---

## 🔄 CI/CD Pipeline

Both platforms provide automatic deployments:

**Vercel:**
- ✅ Auto-deploys on `git push` to main
- ✅ Preview deployments for PRs
- ✅ Instant rollbacks

**Netlify:**
- ✅ Auto-deploys on `git push` to main
- ✅ Deploy previews
- ✅ Split testing

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Module not found**
```bash
# Check requirements-prod.txt includes all dependencies
# Redeploy with updated requirements
```

**Error: Database connection failed**
```bash
# Verify DATABASE_URL in environment variables
# Check PostgreSQL is accessible
```

### Frontend Issues

**Error: API calls failing**
```bash
# Check REACT_APP_API_URL is set correctly
# Verify CORS is configured in backend
# Check backend is deployed and running
```

**Error: Build failed**
```bash
# Check all dependencies in package.json
# Verify Node version compatibility
# Check build command: npm run build
```

---

## 💡 Performance Optimization

### Backend
- ✅ Use PostgreSQL instead of SQLite
- ✅ Enable caching with Redis (optional)
- ✅ Optimize database queries
- ✅ Use connection pooling

### Frontend
- ✅ Build optimized production bundle
- ✅ Enable CDN (Netlify does this automatically)
- ✅ Lazy load components
- ✅ Optimize images

---

## 📈 Scaling

### Free Tier Limits

**Vercel:**
- 100GB bandwidth/month
- 100 hours serverless function execution
- Unlimited deployments

**Netlify:**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Upgrade when you hit limits!**

---

## 🎉 Your Deployment URLs

After deployment, update this section:

```
Frontend: https://lawmind.netlify.app
Backend:  https://lawmind-backend.vercel.app
API Docs: https://lawmind-backend.vercel.app/docs
```

Share these URLs to access your deployed LawMind application! 🚀

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Railway Docs: https://docs.railway.app

---

**Ready to deploy? Start with Step 1 of Option 1! 🚀**

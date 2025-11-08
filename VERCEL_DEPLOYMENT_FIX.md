# ⚠️ IMPORTANT: Vercel Deployment Instructions

## The 404 Error You're Seeing

The error happens because Vercel is trying to deploy the entire repository, but can't find the right entry point.

---

## ✅ SOLUTION: Deploy Backend Separately

### Step-by-Step Fix:

#### 1. Delete Current Deployment (if exists)
- Go to Vercel Dashboard
- Find your project
- Settings → Delete Project

#### 2. Create New Deployment - Backend Only

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `Lawmind` repository
4. **CRITICAL:** Click "Configure Project"
5. **Set Root Directory to:** `backend` ⬅️ THIS IS THE KEY!
6. Framework Preset: "Other"
7. Add Environment Variables:

```env
OPENAI_API_KEY=sk-your-openai-key-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=generate-a-random-secret-key-here
CORS_ORIGINS=["https://lawmind.netlify.app"]
PYTHON_VERSION=3.9
```

8. Click "Deploy"

#### 3. Wait for Build

You should see:
```
✓ Installing dependencies...
✓ Building...
✓ Uploading...
✓ Deployment ready!
```

#### 4. Test Your Backend

Visit: `https://your-project.vercel.app`

Should return:
```json
{"status":"active","service":"LawMind API","version":"1.0.0"}
```

Also test: `https://your-project.vercel.app/docs`

---

## 🎨 Deploy Frontend to Netlify

Now deploy the frontend separately:

1. Go to [app.netlify.com/start](https://app.netlify.com/start)
2. Import from GitHub → Select `Lawmind`
3. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend-name.vercel.app
   ```
5. Deploy!

---

## 🔄 Update CORS

After both are deployed:

1. Go to Vercel → Your Backend Project → Settings → Environment Variables
2. Update `CORS_ORIGINS` to include your Netlify URL:
   ```json
   ["https://your-app.netlify.app","https://www.your-app.netlify.app"]
   ```
3. Redeploy backend (Vercel → Deployments → Click on latest → Redeploy)

---

## 🚂 Alternative: Use Railway for Backend (Easier!)

If Vercel is giving you trouble, Railway is actually better for Python:

### Deploy to Railway:

1. Go to [railway.app/new](https://railway.app/new)
2. "Deploy from GitHub repo"
3. Select `Lawmind` repository
4. Railway asks: "Which directory?" → Select `backend`
5. Railway auto-detects Python and creates PostgreSQL!
6. Add environment variables (same as above)
7. Deploy!

**Benefits:**
- ✅ Automatic PostgreSQL database (free)
- ✅ Better Python/FastAPI support
- ✅ Simpler configuration
- ✅ Free tier: $5/month credits

---

## 📊 Comparison

| Feature | Vercel | Railway |
|---------|--------|---------|
| Python Support | Good | Excellent |
| PostgreSQL | External | Built-in (free) |
| Setup Difficulty | Medium | Easy |
| Free Tier | 100GB bandwidth | $5 credits/month |
| Best For | Serverless | Full-stack apps |

**Recommendation:** Use Railway for backend, Netlify for frontend.

---

## ✅ Quick Verification

### Backend (Vercel/Railway)
```bash
curl https://your-backend.vercel.app
# Should return: {"status":"active",...}
```

### Frontend (Netlify)
- Visit your Netlify URL
- Should show LawMind login page
- No CORS errors in console
- Can register/login

---

## 🐛 Troubleshooting

### Still getting 404?

**Check these:**
1. ✓ Root Directory is set to `backend` in Vercel
2. ✓ `vercel.json` exists in `backend/` folder
3. ✓ `requirements-prod.txt` exists in `backend/`
4. ✓ Python version in `runtime.txt` is `python-3.9.18`

### Build failing?

**Check logs:**
1. Go to Vercel → Your Project → Deployments
2. Click on the failed deployment
3. View build logs
4. Look for errors in dependency installation

### CORS errors?

**Fix:**
1. Make sure `CORS_ORIGINS` includes your frontend URL
2. Format must be JSON array: `["https://your-app.netlify.app"]`
3. Redeploy backend after changing

---

## 📞 Need More Help?

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Make sure Root Directory is `backend`
4. Try Railway instead (easier for Python)

---

**Files Updated:**
- ✅ `vercel.json` (root) - Simplified
- ✅ `backend/vercel.json` - Backend-specific config
- ✅ `backend/vercel_app.py` - ASGI wrapper

**Next Step:** Delete and recreate your Vercel project with Root Directory set to `backend`

Good luck! 🚀

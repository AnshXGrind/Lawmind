# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment Setup (Do Once)

### 1. Get Required Services

- [ ] Create [Vercel Account](https://vercel.com/signup)
- [ ] Create [Netlify Account](https://netlify.com/signup)
- [ ] Get [OpenAI API Key](https://platform.openai.com/api-keys)
- [ ] Setup [PostgreSQL Database](https://neon.tech) (free)

### 2. Push Code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 🔧 Backend Deployment (Choose One)

### Option A: Vercel (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Lawmind` repository
3. Root Directory: `backend`
4. Add Environment Variables:
   ```
   OPENAI_API_KEY=sk-your-key
   DATABASE_URL=postgresql://user:pass@host/db
   SECRET_KEY=random-secret-string
   CORS_ORIGINS=["https://your-app.netlify.app"]
   ```
5. Deploy ✅
6. Copy backend URL: `https://lawmind-xyz.vercel.app`

### Option B: Railway (Alternative)

1. Go to [railway.app](https://railway.app/new)
2. Deploy from GitHub → Select `Lawmind`
3. Add PostgreSQL database (automatic)
4. Set environment variables (same as above)
5. Deploy ✅

---

## 🎨 Frontend Deployment

### Netlify (Recommended)

1. Go to [app.netlify.com/start](https://app.netlify.com/start)
2. Import from GitHub → Select `Lawmind`
3. Build Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
4. Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app
   ```
5. Deploy ✅
6. Your app is live at: `https://lawmind.netlify.app`

---

## 🔗 Connect Frontend to Backend

### Update CORS in Backend

In Vercel/Railway, update environment variable:
```
CORS_ORIGINS=["https://lawmind.netlify.app","https://www.lawmind.netlify.app"]
```

Redeploy backend ✅

---

## ✅ Test Your Deployment

Visit your URLs:

- [ ] Frontend: `https://lawmind.netlify.app` → Shows login page
- [ ] Backend: `https://your-backend.vercel.app` → Shows `{"status":"active"}`
- [ ] API Docs: `https://your-backend.vercel.app/docs` → Shows Swagger UI
- [ ] Can register new account
- [ ] Can login successfully
- [ ] Can create a draft (if OpenAI key is set)

---

## 🎉 Done!

Your LawMind app is now live at:

**Frontend:** https://lawmind.netlify.app
**Backend:** https://your-backend.vercel.app

Share with users and start collecting feedback!

---

## 📞 Need Help?

See detailed guide: `DEPLOYMENT_GUIDE.md`

Common issues:
- **CORS errors:** Check CORS_ORIGINS includes your frontend URL
- **API not connecting:** Verify REACT_APP_API_URL in Netlify
- **Database errors:** Check DATABASE_URL format
- **Build fails:** Check all dependencies in requirements.txt/package.json

---

**Total time:** ~15 minutes
**Cost:** $0 (Free tier on all platforms)

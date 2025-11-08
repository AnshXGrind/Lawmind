# 🚀 Render Deployment Guide - Backend

## ✅ Quick Setup (5 minutes)

### Step 1: Create Render Account
1. Go to: **https://render.com**
2. Sign up with GitHub
3. Authorize Render to access your repositories

---

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your repository: **AnshXGrind/Lawmind**
3. Click **"Connect"**

---

### Step 3: Configure Service

**📋 EXACT SETTINGS TO USE:**

```
Name: lawmind-backend
Region: Choose closest to you (e.g., Singapore, Oregon)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

---

### Step 4: Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

**Required Variables:**

```
OPENAI_API_KEY = sk-your-openai-api-key-here
SECRET_KEY = your-random-secret-key-here-change-this
DATABASE_URL = sqlite:///./lawmind.db
```

**How to generate SECRET_KEY:**
```python
import secrets
print(secrets.token_urlsafe(32))
# Copy the output
```

---

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for initial build
3. Monitor build logs for any errors
4. Once deployed, you'll see: **"Your service is live"**
5. Copy your URL: `https://lawmind-backend.onrender.com`

---

## 🔗 Connect Frontend to Backend

After backend is deployed:

1. **Edit:** `frontend/src/utils/api.js`
2. **Change line 3:**
   ```javascript
   const API_BASE_URL = 'https://lawmind-backend.onrender.com';
   ```
3. **Commit and push** to GitHub
4. Vercel will auto-redeploy (2 min)

---

## 📊 Complete Deployment Status

### ✅ Files Already Configured:
- `backend/requirements.txt` - All dependencies listed
- `backend/Procfile` - Start command defined
- `backend/runtime.txt` - Python version specified
- `backend/render.yaml` - Render configuration
- `backend/.gitignore` - Sensitive files excluded

### ⚙️ Render Configuration Summary:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Python Version** | 3.9+ (from runtime.txt) |

---

## 🐛 Troubleshooting

### Build Fails - Missing Dependencies
```bash
# Check requirements.txt has all packages
# If missing, add them locally:
cd backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push
```

### Build Fails - Python Version
```
# Render uses runtime.txt
# We have: python-3.9.18
# This is correct
```

### API Not Responding
```
# Check environment variables are set
# Verify OPENAI_API_KEY is valid
# Check Render logs for errors
```

### Database Issues
```
# SQLite works on Render (file-based)
# Database file persists between deploys
# For production, consider PostgreSQL upgrade
```

### CORS Errors
```
# Frontend can't connect to backend
# Check backend URL in frontend/src/utils/api.js
# Verify CORS settings in backend/main.py
```

---

## 🎯 Render Free Tier Limits

✅ **What's Included:**
- 750 hours/month free
- Auto-sleep after 15 min inactivity
- Wake on request (3-5 sec delay)
- 512MB RAM
- Shared CPU
- Free SSL certificate

⚠️ **Limitations:**
- Sleeps after inactivity (first request slow)
- No persistent disk for SQLite (upgrades lost)
- Consider paid tier for production

---

## 💡 Production Upgrades (Optional)

### Upgrade to PostgreSQL (Recommended)
1. Create PostgreSQL database on Render
2. Update `DATABASE_URL` environment variable
3. Install `psycopg2-binary` in requirements.txt
4. Migrate from SQLite to PostgreSQL

### Stay Always Awake
- Upgrade to paid tier ($7/month)
- Or use external ping service (UptimeRobot)

### Add Redis Caching
- Speed up API responses
- Store OCR results temporarily
- Free tier available

---

## 📱 Post-Deployment Testing

### Test Backend API:
1. Open: `https://lawmind-backend.onrender.com/docs`
2. Should see FastAPI Swagger UI
3. Test `/api/auth/register` endpoint
4. Create test user
5. Test `/api/drafts/generate` endpoint

### Test Full Stack:
1. Open your Vercel frontend URL
2. Register new account
3. Login
4. Create draft (test AI generation)
5. Upload document (test OCR)
6. Check quality score

---

## 🔐 Security Checklist

Before deploying:
- [ ] Remove all `.env` files from git
- [ ] Set strong SECRET_KEY in Render
- [ ] Verify OPENAI_API_KEY is correct
- [ ] Check `.gitignore` excludes sensitive files
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set CORS allowed origins

---

## 📈 Monitoring

### Render Dashboard:
- View deployment logs
- Monitor CPU/RAM usage
- Check request metrics
- Set up alerts

### Check Backend Health:
```bash
# Test API is responding
curl https://lawmind-backend.onrender.com/docs

# Should return HTML (FastAPI docs page)
```

---

## 🎉 You're Done!

Your backend will be live at:
**`https://lawmind-backend.onrender.com`**

API Documentation:
**`https://lawmind-backend.onrender.com/docs`**

---

## 📞 Support

**Issues:** Check Render logs first  
**Documentation:** https://render.com/docs  
**Community:** Render Discord  

---

*Total deployment time: ~10 minutes*  
*Your AI legal assistant backend is now live! 🚀*

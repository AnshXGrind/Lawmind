# Backend Deployment Guide - Railway

## ⚡ Quick Deploy to Railway

### Prerequisites
- GitHub account connected to Railway
- Railway account (https://railway.app/)

### Automatic Deployment Steps

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select: `AnshXGrind/Lawmind`
   - Select directory: `backend/`

2. **Configure Environment Variables**
   
   Add these in Railway's Variables section:
   
   ```env
   # Required - OpenAI API
   OPENAI_API_KEY=sk-your-openai-api-key-here
   
   # Database (Railway provides PostgreSQL, but we use SQLite for now)
   DATABASE_URL=sqlite:///./lawmind.db
   
   # Security
   SECRET_KEY=your-super-secret-jwt-key-here-minimum-32-characters
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # CORS - Update after frontend deployment
   ALLOWED_ORIGINS=https://lawmind.vercel.app,http://localhost:3000
   
   # Optional - Indian Kanoon API (when available)
   INDIAN_KANOON_API_KEY=your-indian-kanoon-api-key
   ```

3. **Auto-Deploy Configuration**
   - Railway automatically detects:
     - `runtime.txt` → Python 3.13.5
     - `requirements.txt` → Dependencies
     - `Procfile` → Start command
   
4. **Domain & SSL**
   - Railway auto-generates: `lawmind-backend.up.railway.app`
   - SSL certificate: Automatic
   - Custom domain: Settings → Domains

### Manual Deployment (Alternative)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Post-Deployment Steps

1. **Update Frontend API URL**
   ```javascript
   // frontend/src/utils/api.js
   const API_URL = 'https://lawmind-backend.up.railway.app';
   ```

2. **Test Endpoints**
   ```bash
   # Health check
   curl https://lawmind-backend.up.railway.app/
   
   # Docs
   https://lawmind-backend.up.railway.app/docs
   ```

3. **Database Migration**
   - Railway CLI: `railway run alembic upgrade head`
   - Or use Railway's Web Terminal

### Monitoring

- **Logs**: Railway Dashboard → Deployments → Logs
- **Metrics**: CPU, Memory, Network usage
- **Alerts**: Configure in Settings

### Environment-Specific Notes

**Production Checklist:**
- ✅ SQLite works for MVP (single-instance)
- ⚠️ For scaling: Migrate to PostgreSQL
  ```env
  DATABASE_URL=postgresql://user:pass@host:5432/lawmind
  ```
- ✅ File uploads go to Railway's persistent volume
- ✅ CORS configured for production domain
- ✅ Debug mode OFF (set in config)

### Cost Estimation

**Railway Free Tier:**
- $5/month credit
- 500 hours execution time
- Perfect for MVP

**Pro Tier ($20/month):**
- Unlimited execution
- Better performance
- Priority support

### Troubleshooting

**Issue: Dependencies fail to install**
```bash
# Check requirements.txt compatibility
# Remove version pins if needed
```

**Issue: Port binding error**
```python
# Ensure using Railway's PORT env var
import os
port = int(os.getenv("PORT", 8000))
```

**Issue: Database connection**
```bash
# Check DATABASE_URL format
# Verify SQLite file permissions
```

### Security Best Practices

1. **Secrets Management**
   - Use Railway's Variables (encrypted)
   - Never commit `.env` files

2. **API Keys**
   - Rotate periodically
   - Use separate keys for staging/production

3. **CORS**
   - Restrict to your frontend domain only
   - Update when domain changes

### CI/CD Pipeline

Railway auto-deploys on:
- Every push to `main` branch
- Pull request merges

Disable auto-deploy:
- Settings → Auto Deploy: OFF

### Rollback

```bash
# Via Railway Dashboard
Deployments → Select previous → Rollback

# Via CLI
railway rollback
```

## 🚀 Alternative: Render Deployment

Already configured! See `render.yaml`:
- Auto-deploy from GitHub
- Free tier available
- Similar setup process

## 📊 Performance Optimization

1. **Enable Caching**
   - Add Redis for session caching
   - Cache API responses

2. **Database Optimization**
   - Add indexes for frequently queried fields
   - Use connection pooling

3. **Monitoring**
   - Add Sentry for error tracking
   - Use Railway metrics

---

**Deployment Status:**
- ✅ Configuration files ready
- ✅ Environment variables documented
- ✅ Auto-deploy configured
- ⏳ Awaiting deployment trigger

**Next Steps:**
1. Deploy backend to Railway
2. Update frontend API_URL
3. Test production endpoints
4. Monitor initial deployment

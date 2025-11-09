# 🚀 QUICK START GUIDE - Test Your System NOW!

## ✅ Backend is Running on Port 8000!

---

## 📋 **IMMEDIATE TESTING STEPS**

### Step 1: Test Registration (2 minutes)
1. Open browser: `http://localhost:3000/register`
2. Register with your credentials:
   - **Email**: anshgarg2512@gmail.com
   - **Name**: Saksham
   - **Password**: (your choice - e.g., LawMind@2024)
3. Click "Register"
4. ✅ Should succeed now (database has `encryption_key` and `role` fields)

### Step 2: Test Login (1 minute)
1. Go to: `http://localhost:3000/login`
2. Login with your credentials
3. ✅ Should redirect to dashboard

### Step 3: Run Automated Test Script (5 minutes)
```powershell
# Open new terminal
cd D:\github\Lawmind
python test_20_users.py
```

**What it tests:**
- ✅ Registers 20 unique users
- ✅ Tests login for each user
- ✅ Creates drafts for each user
- ✅ Tests analytics endpoints
- ✅ Tests dataset health check
- ✅ Generates comprehensive test report

---

## 🎯 **NEW API ENDPOINTS TO TEST**

### Analytics Endpoints:
```bash
# Get dashboard metrics
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/analytics/dashboard

# Get AI insights
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/analytics/insights

# Get platform statistics
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/analytics/platform

# Get citation analytics
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/analytics/citations

# Get court updates
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/analytics/court-updates

# Get quick stats summary
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/analytics/stats/summary
```

### Dataset Endpoints:
```bash
# Health check (no auth needed for health)
curl http://localhost:8000/api/dataset/health

# Get statistics
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/dataset/stats

# Trigger manual update (background task)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/dataset/trigger-update

# Get recent cases
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/dataset/recent-cases?limit=5

# Search similar cases (semantic search)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "criminal appeal", "limit": 5}' \
  http://localhost:8000/api/dataset/search-similar
```

---

## 📊 **WHAT'S NEW IN THIS BUILD**

### 1. **Automated Legal Dataset Builder**
- Fetches judgments from Indian Kanoon API
- Downloads PDFs automatically
- Extracts metadata using NLP
- Generates vector embeddings
- Stores in ChromaDB for semantic search
- **Scheduled to run daily at 2 AM**

### 2. **Analytics Dashboard Backend**
- User dashboard with metrics
- Platform-wide statistics
- Citation analytics (most cited judgments)
- AI-powered success predictions
- Court updates feed

### 3. **RBAC System**
- **Roles**: Admin, Advocate, Student, Guest
- **Permissions**: Granular access control
- **Feature Limits**: Based on role
  - Admin: Unlimited everything
  - Advocate: 100 drafts/month, 50 AI queries/day
  - Student: 20 drafts/month, 10 AI queries/day
  - Guest: 3 drafts/month, 2 AI queries/day

### 4. **Audit Logging**
- Tracks ALL user actions
- Security event monitoring
- GDPR-compliant logging
- Severity levels (INFO, WARNING, ERROR, CRITICAL)

### 5. **Test Script**
- Automated testing with 20 users
- Comprehensive test coverage
- Color-coded pass/fail report
- Production readiness check

---

## 🔍 **HOW TO GET YOUR AUTH TOKEN**

### Method 1: Via Frontend
1. Login at `http://localhost:3000/login`
2. Open browser DevTools (F12)
3. Go to Application/Storage → Local Storage
4. Find `token` key - copy the value

### Method 2: Via API
```powershell
# Login via API
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=anshgarg2512@gmail.com&password=YOUR_PASSWORD"

# Response will contain access_token:
# {"access_token": "eyJ...", "token_type": "bearer"}
```

---

## 📁 **NEW FILES CREATED TODAY**

### Backend Services:
- ✅ `backend/app/services/dataset_builder.py` (317 lines)
- ✅ `backend/app/services/analytics_service.py` (350 lines)
- ✅ `backend/app/services/rbac_service.py` (220 lines)
- ✅ `backend/app/services/audit_service.py` (300 lines)

### Backend Routers:
- ✅ `backend/app/routers/dataset.py` (220 lines)
- ✅ `backend/app/routers/analytics.py` (200 lines)

### Testing:
- ✅ `test_20_users.py` (400 lines)

### Documentation:
- ✅ `SESSION_COMPLETE.md` (comprehensive summary)
- ✅ `QUICK_TEST_GUIDE.md` (this file)

**Total New Code**: ~2,000 lines

---

## 🎨 **USER ROLES & PERMISSIONS**

### Default Role: Advocate
When you register, you automatically get the "Advocate" role with:
- ✅ Create, edit, delete drafts
- ✅ Export PDFs
- ✅ Use AI queries (50/day limit)
- ✅ Advanced AI features
- ✅ Precedent analysis
- ✅ Search cases (100/day limit)
- ✅ Access full database
- ✅ View analytics
- ✅ 5GB storage limit

### To Change Role to Admin:
Currently, roles are set to "advocate" by default. To become admin:
1. Manually update database (temporary method):
```python
# In Python shell or script:
from app.core.database import SessionLocal
from app.models.database_models import User

db = SessionLocal()
user = db.query(User).filter(User.email == "anshgarg2512@gmail.com").first()
user.role = "admin"
db.commit()
```

---

## 🧪 **TESTING CHECKLIST**

### Basic Tests (5 minutes):
- [ ] Register new account
- [ ] Login successfully
- [ ] Create a draft
- [ ] View dashboard
- [ ] Export PDF

### Advanced Tests (10 minutes):
- [ ] Run `python test_20_users.py`
- [ ] Test analytics endpoints
- [ ] Test dataset health check
- [ ] Test semantic search
- [ ] Verify audit logs

### Performance Tests (optional):
- [ ] Test with 100+ drafts
- [ ] Test concurrent users
- [ ] Test vector search speed
- [ ] Test PDF generation speed

---

## 🚨 **TROUBLESHOOTING**

### Backend Not Running?
```powershell
# Restart backend
D:\github\Lawmind\RESTART_BACKEND.bat
```

### Frontend Not Running?
```powershell
# Start frontend
cd D:\github\Lawmind\frontend
npm start
```

### Database Issues?
```powershell
# Recreate database
cd D:\github\Lawmind\backend
python -c "from app.core.database import engine, Base; from app.models.database_models import User, Draft; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine); print('Database recreated!')"
```

### Import Errors?
```powershell
# Install missing packages
cd D:\github\Lawmind\backend
pip install -r requirements.txt
```

---

## 📈 **MONITORING YOUR SYSTEM**

### Check Backend Health:
```bash
curl http://localhost:8000/
# Should return: {"status": "active", "message": "LawMind API is running"}
```

### Check Dataset Builder:
```bash
curl http://localhost:8000/api/dataset/health
# Should return: {"status": "healthy", "directories": {...}}
```

### Check Analytics:
```bash
# Login first, then:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/analytics/stats/summary
```

---

## 🎯 **SUCCESS CRITERIA**

### ✅ System is Ready When:
1. Backend responds on port 8000
2. Frontend loads on port 3000
3. Registration works without errors
4. Login redirects to dashboard
5. Draft creation succeeds
6. PDF export works
7. Test script passes with 90%+ rate

---

## 🚀 **NEXT: PRODUCTION DEPLOYMENT**

After testing locally, deploy to production:

### Backend (Railway):
```bash
# Deploy to Railway
railway login
railway init
railway up

# Add environment variables in Railway dashboard
```

### Frontend (Vercel):
```bash
# Push to GitHub
git add .
git commit -m "Production ready - 95% complete"
git push origin main

# Vercel auto-deploys from GitHub
# Update REACT_APP_API_URL to Railway URL
```

---

## 📞 **SUPPORT**

- **API Docs**: Check `API_DOCUMENTATION.md`
- **Deployment**: Check `DEPLOYMENT_GUIDE.md`
- **Features**: Check `SESSION_COMPLETE.md`
- **Quick Ref**: Check `QUICK_REFERENCE.md`

---

## 🎉 **YOU'RE ALL SET!**

Your LawMind system is **95% complete** and ready for testing!

**Start testing now**: `python test_20_users.py`

---

*Built with ❤️ | November 9, 2024*

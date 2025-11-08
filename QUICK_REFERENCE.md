# 🚀 LawMind Quick Reference

## ⚡ Instant Setup (5 Minutes)

### Step 1: Prerequisites
```bash
# Check if you have Python 3.11+
python --version

# Check if you have Node.js 18+
node --version

# If not installed, download from:
# Python: https://www.python.org/downloads/
# Node.js: https://nodejs.org/
```

### Step 2: Get OpenAI API Key
1. Visit: https://platform.openai.com/
2. Sign up/Login
3. Go to API Keys
4. Create new secret key
5. Copy the key (starts with `sk-`)

### Step 3: Setup Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Linux/Mac
pip install -r requirements.txt
copy .env.example .env         # Windows
# cp .env.example .env         # Linux/Mac
```

**Edit `backend\.env` and add:**
```env
OPENAI_API_KEY=sk-your-actual-key-here
SECRET_KEY=any-random-string-here
```

**Start backend:**
```bash
python main.py
```
✅ Backend running at: http://localhost:8000

### Step 4: Setup Frontend
```bash
cd frontend
npm install
npm start
```
✅ Frontend running at: http://localhost:3000

---

## 📋 Essential Commands

### Backend Commands
```bash
# Activate virtual environment
.\venv\Scripts\activate         # Windows
source venv/bin/activate        # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Run with auto-reload
uvicorn main:app --reload

# Deactivate virtual environment
deactivate
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

---

## 🔗 Important URLs

### Development
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

### API Endpoints
- Auth: `/api/auth/`
- Drafts: `/api/drafts/`
- Citations: `/api/citations/`
- Documents: `/api/documents/`

---

## 🎯 Common Tasks

### Create New User
```bash
# Using curl (Windows PowerShell)
curl -X POST "http://localhost:8000/api/auth/register" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\",\"full_name\":\"Test User\"}'

# Using curl (Linux/Mac)
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```

### Login and Get Token
```bash
# Using curl
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Generate Draft
```bash
# Replace YOUR_TOKEN with actual token
curl -X POST "http://localhost:8000/api/drafts/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"document_type":"petition","case_type":"civil","court":"district","title":"Test Petition","facts":"Test facts"}'
```

---

## 🐛 Quick Troubleshooting

### Backend Won't Start
**Problem:** ModuleNotFoundError
```bash
# Solution: Reinstall dependencies
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Problem:** Port 8000 in use
```bash
# Solution: Change port in .env
PORT=8001
```

**Problem:** Database error
```bash
# Solution: Delete database and restart
del lawmind.db    # Windows
rm lawmind.db     # Linux/Mac
python main.py
```

### Frontend Won't Start
**Problem:** npm install fails
```bash
# Solution: Clear cache and reinstall
npm cache clean --force
del -r node_modules package-lock.json    # Windows
rm -rf node_modules package-lock.json    # Linux/Mac
npm install
```

**Problem:** Can't connect to backend
```bash
# Solution: Check backend is running
# Verify REACT_APP_API_URL in .env
REACT_APP_API_URL=http://localhost:8000/api
```

### API Returns 401 Unauthorized
```bash
# Solution: Login again and get new token
# Tokens expire after 30 minutes
```

---

## 📁 Project Structure (Quick View)

```
Lawmind/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── core/     # Config, DB, Security
│   │   ├── models/   # Data models
│   │   ├── routers/  # API endpoints
│   │   └── services/ # Business logic
│   ├── main.py       # Entry point
│   └── requirements.txt
│
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
└── Documentation/
    ├── README.md
    ├── API_DOCUMENTATION.md
    ├── SETUP_GUIDE.md
    └── PROJECT_SUMMARY.md
```

---

## 🎨 Customization

### Change Colors
Edit `frontend/src/index.css`:
```css
:root {
  --primary: #1e3a8a;     /* Change this */
  --secondary: #3b82f6;   /* And this */
  --accent: #f59e0b;      /* And this */
}
```

### Change LLM Model
Edit `backend/.env`:
```env
LLM_MODEL=gpt-3.5-turbo  # Cheaper option
# LLM_MODEL=gpt-4        # Better quality
```

### Change Token Expiration
Edit `backend/.env`:
```env
ACCESS_TOKEN_EXPIRE_MINUTES=60  # 1 hour instead of 30 min
```

---

## 🧪 Testing the Application

### Manual Test Flow:
1. ✅ Open http://localhost:3000
2. ✅ Register new account
3. ✅ Login with credentials
4. ✅ Navigate to "New Draft"
5. ✅ Fill form and generate draft
6. ✅ Wait for AI (10-30 seconds)
7. ✅ Edit draft in editor
8. ✅ Try AI tools (explain, simplify)
9. ✅ Export draft
10. ✅ Logout and login again

---

## 💡 Tips & Best Practices

### For Development:
- Keep both terminals open (backend + frontend)
- Check browser console for errors
- Use API docs at /docs for testing
- Save your work frequently
- Review AI-generated content

### For Production:
- Set `DEBUG=False` in backend .env
- Use PostgreSQL instead of SQLite
- Set strong SECRET_KEY
- Enable HTTPS
- Use environment variables for secrets
- Implement rate limiting
- Add monitoring and logging

---

## 🔑 Environment Variables

### Backend (.env)
```env
# Required
OPENAI_API_KEY=sk-...
SECRET_KEY=random-secret

# Optional
DEBUG=True
DATABASE_URL=sqlite:///./lawmind.db
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.3
PORT=8000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 📚 Documentation Files

1. **README.md** - Main documentation, features, setup
2. **API_DOCUMENTATION.md** - Complete API reference
3. **SETUP_GUIDE.md** - Detailed setup instructions
4. **PROJECT_SUMMARY.md** - Complete project overview
5. **QUICK_REFERENCE.md** - This file

---

## 🎯 Document Types Supported

1. **petition** - Legal petition
2. **notice** - Legal notice
3. **affidavit** - Sworn statement
4. **contract** - Legal contract
5. **agreement** - Legal agreement
6. **reply** - Reply to notice/petition
7. **application** - Court application
8. **appeal** - Appeal application

---

## ⚖️ Case Types Supported

1. **civil** - Civil cases
2. **criminal** - Criminal cases
3. **corporate** - Corporate law
4. **family** - Family law
5. **tax** - Tax matters
6. **property** - Property disputes
7. **labour** - Labour law
8. **constitutional** - Constitutional matters

---

## 🏛️ Court Levels Supported

1. **district** - District Court
2. **high_court** - High Court
3. **supreme_court** - Supreme Court
4. **tribunal** - Tribunal

---

## 📞 Getting Help

### Resources:
- 📖 [Full Documentation](README.md)
- 🔧 [Setup Guide](SETUP_GUIDE.md)
- 📡 [API Docs](API_DOCUMENTATION.md)
- 📋 [Project Summary](PROJECT_SUMMARY.md)

### Online:
- 🌐 Interactive API: http://localhost:8000/docs
- 💻 GitHub: https://github.com/AnshXGrind/Lawmind
- 🐛 Issues: https://github.com/AnshXGrind/Lawmind/issues

---

## ⚡ Performance Tips

### Backend:
- Use `gpt-3.5-turbo` for faster, cheaper responses
- Reduce `LLM_MAX_TOKENS` for faster generation
- Use PostgreSQL for better performance
- Enable caching for citations

### Frontend:
- Build production version: `npm run build`
- Use code splitting
- Lazy load components
- Optimize images

---

## 🔒 Security Checklist

- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] CORS configuration
- [x] SQL injection prevention
- [x] XSS protection
- [ ] Rate limiting (TODO)
- [ ] HTTPS (production)
- [ ] Input sanitization (enhanced)

---

## 🎉 Success Indicators

✅ Backend shows: `Application startup complete`  
✅ Frontend shows: `Compiled successfully!`  
✅ Can access: http://localhost:3000  
✅ Can register new user  
✅ Can login  
✅ Can generate draft  
✅ AI responds in 10-30 seconds  

---

**🧠 LawMind - Quick Reference Guide v1.0**

**Last Updated:** November 8, 2025

---

*For detailed information, see README.md*

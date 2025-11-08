# 🚀 How to Run LawMind Locally

## Quick Start (Easiest Method)

**Just double-click this file:**
```
START_LAWMIND.bat
```

This will automatically start both backend and frontend servers!

---

## Manual Start (Alternative Method)

### Option A: Use the Startup Scripts

**For Backend:**
```bash
# Windows
start-backend.bat

# Mac/Linux
./start-backend.sh
```

**For Frontend:**
```bash
# Windows
start-frontend.bat

# Mac/Linux
./start-frontend.sh
```

### Option B: Manual Terminal Commands

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## 🌐 Access the Application

Once both servers are running:

- **Frontend (Web App):** http://localhost:3000
- **Backend (API):** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

**⚠️ IMPORTANT:** 
- Type `localhost:3000` in your browser address bar
- Do NOT open the file explorer or local files
- Do NOT use `file:///` URLs

---

## ✅ Verify Servers Are Running

You should see:

**Backend Terminal:**
```
🧠 LawMind Backend Starting...
✅ Database initialized
INFO: Uvicorn running on http://0.0.0.0:8000
```

**Frontend Terminal:**
```
Compiled successfully!
You can now view lawmind-frontend in the browser.
Local: http://localhost:3000
```

---

## 🔧 Add Your OpenAI API Key

**Before using AI features:**

1. Open `backend/.env`
2. Find: `OPENAI_API_KEY=your-openai-api-key-here`
3. Replace with your real key from https://platform.openai.com/api-keys
4. Save the file
5. Restart the backend server

---

## 🛑 Stop the Servers

**Windows:** Press `Ctrl + C` in each terminal window

**Or:** Close the terminal windows

---

## 🐛 Troubleshooting

### "Port already in use" Error

**Backend (port 8000):**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**Frontend (port 3000):**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Frontend Shows Wrong Content

1. Clear browser cache: `Ctrl + Shift + Delete`
2. Hard refresh: `Ctrl + Shift + R`
3. Try Incognito/Private mode
4. Make sure you're going to `http://localhost:3000`

### Backend Won't Start

```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend Won't Start

```bash
cd frontend
npm install
npm start
```

---

## 📱 First Time Setup Already Done ✅

- ✅ Python virtual environment created
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ Database initialized
- ✅ Configuration files created

**You're ready to go!** Just run `START_LAWMIND.bat`

---

## 💡 Tips

1. **Keep both terminal windows open** while using the app
2. **Backend must be running** for frontend features to work
3. **Changes to code** will auto-reload (no need to restart)
4. **Use Incognito mode** if you see cached old content

---

## 🎯 What to Expect

When you visit http://localhost:3000 you should see:

✅ **LawMind** login/register page
✅ Clean UI with legal theme
✅ Options to create an account

**NOT:**
❌ File directory listing
❌ MedAid healthcare app
❌ Empty page or errors

---

Need help? Check the main README.md for full documentation!

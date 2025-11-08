# LawMind Setup Guide

This guide will help you set up the LawMind application on your local machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Docker Setup](#docker-setup)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Python 3.11 or higher**
   - Download from: https://www.python.org/downloads/
   - Verify: `python --version`

2. **Node.js 18 or higher**
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

3. **Git**
   - Download from: https://git-scm.com/
   - Verify: `git --version`

4. **OpenAI API Key** (Required)
   - Sign up at: https://platform.openai.com/
   - Generate an API key

### Optional Software

5. **Docker Desktop** (for containerized deployment)
   - Download from: https://www.docker.com/products/docker-desktop/

6. **PostgreSQL** (optional, SQLite works fine for development)
   - Download from: https://www.postgresql.org/download/

---

## Backend Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/AnshXGrind/Lawmind.git
cd Lawmind
```

### Step 2: Create Virtual Environment

#### Windows (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

#### Linux/Mac
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI and Uvicorn
- SQLAlchemy for database
- LangChain for AI
- OpenAI SDK
- And all other dependencies

### Step 4: Configure Environment

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` file and add your API keys:

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
SECRET_KEY=your-random-secret-key-here
DEBUG=True
```

To generate a secure secret key:

#### Windows (PowerShell)
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Linux/Mac
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 5: Initialize Database

The database will be automatically created when you first run the application.

### Step 6: Run Backend Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API should now be running at: `http://localhost:8000`

#### Verify Backend

Visit `http://localhost:8000/docs` to see the interactive API documentation.

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React and React Router
- Axios for API calls
- TailwindCSS for styling
- And other dependencies

### Step 3: Configure Environment

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

The default `.env` file should work if backend is on localhost:8000:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Step 4: Run Development Server

```bash
npm start
```

The frontend should now be running at: `http://localhost:3000`

The browser should automatically open. If not, manually navigate to `http://localhost:3000`

---

## Docker Setup

If you prefer using Docker, follow these steps:

### Step 1: Create Environment Files

```bash
# Backend
cd backend
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Frontend
cd ../frontend
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

cd ..
```

Edit `backend/.env` and add your API keys.

### Step 2: Build and Run with Docker Compose

From the project root directory:

```bash
docker-compose up -d
```

This will:
- Build the backend and frontend Docker images
- Start PostgreSQL database
- Start all services

Access the application:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Step 3: View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Stop Services

```bash
docker-compose down
```

To also remove volumes:

```bash
docker-compose down -v
```

---

## Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# Application
DEBUG=True                    # Set to False in production
HOST=0.0.0.0
PORT=8000

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./lawmind.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/lawmind_db

# AI Configuration
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4              # or gpt-3.5-turbo for lower cost
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

# Vector Database
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_DB_PATH=./data/vectordb

# File Limits
MAX_FILE_SIZE=10485760        # 10MB
AUDIO_MAX_SIZE=26214400       # 25MB
```

### Frontend Configuration

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

For production, change to your actual API URL:

```env
REACT_APP_API_URL=https://api.lawmind.example.com/api
```

---

## Troubleshooting

### Backend Issues

#### 1. ModuleNotFoundError

**Problem:** Missing Python packages

**Solution:**
```bash
cd backend
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

#### 2. Database Connection Error

**Problem:** Cannot connect to database

**Solution for SQLite:**
- Ensure the backend directory has write permissions
- Delete `lawmind.db` and restart

**Solution for PostgreSQL:**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists: `createdb lawmind_db`

#### 3. OpenAI API Error

**Problem:** Invalid API key or quota exceeded

**Solution:**
- Verify API key in `.env`
- Check OpenAI account has credits
- Try using `gpt-3.5-turbo` instead of `gpt-4`

#### 4. Port Already in Use

**Problem:** Port 8000 is already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Or change port in .env
PORT=8001
```

### Frontend Issues

#### 1. npm install fails

**Problem:** Node module installation errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 2. Cannot Connect to Backend

**Problem:** Network errors when calling API

**Solution:**
- Verify backend is running on http://localhost:8000
- Check `REACT_APP_API_URL` in `.env`
- Check browser console for CORS errors
- Ensure backend CORS settings allow frontend origin

#### 3. Blank Page After npm start

**Problem:** Application shows blank page

**Solution:**
- Check browser console for errors
- Clear browser cache
- Try incognito/private mode
- Rebuild:
```bash
rm -rf build node_modules
npm install
npm start
```

### Docker Issues

#### 1. Docker Build Fails

**Problem:** Image build errors

**Solution:**
```bash
# Rebuild without cache
docker-compose build --no-cache

# Check Docker daemon is running
docker info
```

#### 2. Container Exits Immediately

**Problem:** Container starts then stops

**Solution:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Usually missing environment variables
```

#### 3. Database Connection in Docker

**Problem:** Backend can't connect to database

**Solution:**
- In `backend/.env`, use: `DATABASE_URL=postgresql://lawmind:lawmind123@db:5432/lawmind_db`
- Ensure db service is healthy: `docker-compose ps`

---

## First-Time Usage

1. **Start the servers** (backend and frontend)

2. **Open browser** to `http://localhost:3000`

3. **Register** a new account
   - Email: your-email@example.com
   - Password: secure password
   - Full Name: Your Name

4. **Login** with your credentials

5. **Create your first draft**
   - Click "New Draft"
   - Fill in the form
   - Click "Generate Draft with AI"

6. **Wait for AI generation** (may take 10-30 seconds)

7. **Edit and refine** your draft using AI tools

8. **Export** when ready

---

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in backend `.env`
2. Use PostgreSQL instead of SQLite
3. Set strong `SECRET_KEY`
4. Configure proper CORS origins
5. Use environment variables for secrets
6. Set up SSL/HTTPS
7. Use production-grade web server (Gunicorn/uWSGI)
8. Implement rate limiting
9. Set up monitoring and logging
10. Regular backups

---

## Getting Help

- **Documentation:** See README.md and API_DOCUMENTATION.md
- **Issues:** https://github.com/AnshXGrind/Lawmind/issues
- **Email:** support@lawmind.ai

---

**Happy Legal Drafting! 🧠⚖️**

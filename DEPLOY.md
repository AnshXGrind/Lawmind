# 🚀 Deploy LawMind to Hugging Face Spaces

<div align="center">

[![Deploy to HF](https://huggingface.co/datasets/huggingface/badges/raw/main/deploy-to-spaces-lg.svg)](https://huggingface.co/new-space)

</div>

---

## Method 1: One-Click via GitHub Actions (Recommended)

### Prerequisites
- A Hugging Face account: https://huggingface.co
- Your repo on GitHub

### Step 1: Create HF Space
1. Go to https://huggingface.co/new-space
2. Fill in:
   - **Owner:** your HF username
   - **Space name:** `lawmind-legal-ai`
   - **License:** MIT
   - **SDK:** Docker
   - **Hardware:** CPU Basic (free tier)
   - **Visibility:** Public

### Step 2: Add GitHub Secrets
In your GitHub repo → Settings → Secrets → Actions → New repository secret:

| Secret Name | Value |
|-------------|-------|
| `HF_TOKEN` | Your HF token from https://huggingface.co/settings/tokens |
| `HF_USERNAME` | Your HF username |
| `HF_SPACE_NAME` | `lawmind-legal-ai` |

### Step 3: Trigger Deploy
Push to `main` branch — GitHub Actions auto-deploys to HF Spaces.

Or manually: Go to Actions → Deploy to Hugging Face Spaces → Run workflow.

---

## Method 2: Manual git push

```bash
# 1. Clone your HF Space (replace YOUR_USERNAME)
git clone https://huggingface.co/spaces/YOUR_USERNAME/lawmind-legal-ai hf-space-clone

# 2. Copy project files into it
cp Dockerfile hf-space-clone/
cp README.md hf-space-clone/
cp app.py hf-space-clone/
cp -r backend/* hf-space-clone/

# 3. Push to HF
cd hf-space-clone
git add .
git commit -m "Deploy LawMind $(date +%Y-%m-%d)"
git push
```

---

## Step 4: Add Space Secrets

In your HF Space → Settings → Variables and secrets → **New secret**:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Gemini API key (from https://aistudio.google.com) |
| `SECRET_KEY` | Any long random string for JWT |
| `CORS_ORIGINS` | `["https://your-vercel-app.vercel.app","http://localhost:3000"]` |

---

## Step 5: Update Frontend

In Vercel → your project → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://YOUR_USERNAME-lawmind-legal-ai.hf.space/api` |

Then: Deployments → Redeploy (without cache).

---

## Your URLs After Deploy

| Resource | URL |
|----------|-----|
| HF Space | `https://huggingface.co/spaces/YOUR_USERNAME/lawmind-legal-ai` |
| API Base | `https://YOUR_USERNAME-lawmind-legal-ai.hf.space` |
| Swagger Docs | `https://YOUR_USERNAME-lawmind-legal-ai.hf.space/docs` |
| Health Check | `https://YOUR_USERNAME-lawmind-legal-ai.hf.space/health` |
| Keepalive Ping | `https://YOUR_USERNAME-lawmind-legal-ai.hf.space/ping` |

---

## Verification Checklist

- [ ] `GET /ping` returns `"pong"`
- [ ] `GET /health` returns `{"status":"healthy","gemini":"configured"}`
- [ ] `GET /docs` opens Swagger UI
- [ ] Register + Login working from frontend
- [ ] Draft generation works end-to-end

---

## Notes on Hugging Face Free Tier

- **Cold starts:** Spaces spin down after ~15 min of inactivity. First request can take 30-60s.
- **Storage:** Ephemeral — SQLite DB resets on restart. For persistence use `HF_HOME`.
- **Uptime:** Set up UptimeRobot to ping `/ping` every 5 minutes.

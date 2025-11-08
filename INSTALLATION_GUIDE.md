# 🚀 Quick Installation Guide - Premium Features

## Step 1: Install New Dependencies

```powershell
# Navigate to backend
cd d:\github\Lawmind\backend

# Install all new packages
.\venv\Scripts\pip.exe install -r requirements.txt

# Verify installations
.\venv\Scripts\pip.exe list | findstr "easyocr|pytesseract|spacy|whoosh"
```

**Expected packages:**
- ✅ pytesseract>=0.3.10
- ✅ pdf2image>=1.16.3  
- ✅ easyocr>=1.7.0
- ✅ spacy>=3.7.0
- ✅ language-tool-python>=2.7.1
- ✅ deep-translator>=1.11.4
- ✅ whoosh>=2.7.4
- ✅ langchain-core>=0.1.0
- ✅ langchain-openai>=0.0.2

---

## Step 2: Install Tesseract OCR (Windows)

### Option A: Using Chocolatey (Recommended)
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Tesseract
choco install tesseract -y

# Add to PATH
$env:Path += ";C:\Program Files\Tesseract-OCR"
```

### Option B: Manual Installation
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to `C:\Program Files\Tesseract-OCR`
3. Add to System PATH:
   - Open System Properties → Environment Variables
   - Edit PATH variable
   - Add: `C:\Program Files\Tesseract-OCR`

**Verify Installation:**
```powershell
tesseract --version
# Should show: tesseract 5.x.x
```

---

## Step 3: Install Poppler (for PDF to Image conversion)

### Download & Setup
1. Download poppler for Windows: https://github.com/oschwartz10612/poppler-windows/releases/
2. Extract to: `C:\poppler`
3. Add to PATH: `C:\poppler\Library\bin`

**Or using PowerShell:**
```powershell
# Download poppler
$popplerUrl = "https://github.com/oschwartz10612/poppler-windows/releases/download/v23.08.0-0/Release-23.08.0-0.zip"
Invoke-WebRequest -Uri $popplerUrl -OutFile "C:\poppler.zip"

# Extract
Expand-Archive -Path "C:\poppler.zip" -DestinationPath "C:\poppler"

# Add to PATH
$env:Path += ";C:\poppler\Library\bin"
```

---

## Step 4: Update Database Schema

### Option A: Fresh Start (Development)
```powershell
# Backup current database
cd d:\github\Lawmind\backend
Copy-Item lawmind.db lawmind.db.backup

# Delete and recreate (server will auto-create new schema)
Remove-Item lawmind.db

# Restart server
.\venv\Scripts\python.exe main.py
```

### Option B: Using Alembic (Production)
```powershell
# Generate migration
.\venv\Scripts\alembic.exe revision --autogenerate -m "Add OCR and quality features"

# Apply migration
.\venv\Scripts\alembic.exe upgrade head
```

---

## Step 5: Download Language Models (Optional)

### For better NLP (Optional but recommended):
```powershell
# Download spaCy English model
.\venv\Scripts\python.exe -m spacy download en_core_web_sm

# Download spaCy Hindi model (for Indian documents)
.\venv\Scripts\python.exe -m spacy download xx_ent_wiki_sm
```

---

## Step 6: Test Installation

### Test OCR Service
```powershell
cd d:\github\Lawmind\backend

# Create test script
@"
import asyncio
from app.services.ocr_service import ocr_service, case_extractor

async def test():
    # Test with sample text
    sample_text = '''
    FIR No. 123/2024
    Police Station: Connaught Place
    Accused: Ravi Kumar
    Section 420 IPC, Section 120B IPC
    Date: 15/01/2024
    '''
    
    result = await case_extractor.extract_case_info(sample_text, 'fir')
    print('Extracted Data:', result)

asyncio.run(test())
"@ | Out-File -Encoding utf8 test_ocr.py

# Run test
.\venv\Scripts\python.exe test_ocr.py
```

**Expected Output:**
```json
{
  "fir_number": "123/2024",
  "police_station": "Connaught Place",
  "accused": "Ravi Kumar",
  "sections": ["Section 420 IPC", "Section 120B IPC"],
  "dates": ["15/01/2024"]
}
```

---

## Step 7: Start Backend with New Features

```powershell
cd d:\github\Lawmind\backend

# Start server
.\venv\Scripts\python.exe main.py
```

**Expected Console Output:**
```
[*] LawMind Backend Starting...
[+] Database initialized
[+] New tables created: uploaded_documents, draft_versions, comments, precedents
[✓] OCR Service initialized (EasyOCR + Tesseract)
[✓] Quality Scorer loaded
[✓] Validation Service ready
INFO: Application startup complete
INFO: Uvicorn running on http://0.0.0.0:8000
```

---

## Step 8: Test New API Endpoints

### Test 1: Upload & Extract (OCR)
```powershell
# Using PowerShell
$token = "YOUR_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}

# Upload sample FIR image/PDF
$filePath = "path\to\sample_fir.pdf"
$form = @{
    file = Get-Item $filePath
}

Invoke-RestMethod -Uri "http://localhost:8000/api/documents/upload-and-extract?document_type=fir" `
    -Method POST `
    -Headers $headers `
    -Form $form
```

### Test 2: Quality Score
```powershell
# Get quality score for draft
Invoke-RestMethod -Uri "http://localhost:8000/api/drafts/1/quality-score" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $token"}
```

### Test 3: Validate Draft
```powershell
# Check for missing info
$body = @{
    document_type = "petition"
    case_type = "criminal"
    title = "Bail Application"
    facts = "Brief facts here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/drafts/validate-draft" `
    -Method POST `
    -Headers @{
        "Authorization"="Bearer $token"
        "Content-Type"="application/json"
    } `
    -Body $body
```

### Test 4: Client Summary
```powershell
# Generate plain English summary
Invoke-RestMethod -Uri "http://localhost:8000/api/drafts/1/client-summary" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $token"}
```

---

## Step 9: Check API Documentation

Open browser: **http://localhost:8000/docs**

**New Endpoints to Verify:**
- ✅ POST `/api/documents/upload-and-extract`
- ✅ GET `/api/documents/my-uploads`
- ✅ POST `/api/documents/create-draft-from-upload/{id}`
- ✅ POST `/api/drafts/{id}/quality-score`
- ✅ POST `/api/drafts/validate-draft`
- ✅ POST `/api/drafts/{id}/check-tone`
- ✅ POST `/api/drafts/{id}/client-summary`
- ✅ GET `/api/drafts/search`

---

## Troubleshooting

### Issue: "Tesseract not found"
**Solution:**
```powershell
# Add Tesseract to PATH permanently
[Environment]::SetEnvironmentVariable(
    "Path",
    $env:Path + ";C:\Program Files\Tesseract-OCR",
    [EnvironmentVariableTarget]::Machine
)

# Or set in code (ocr_service.py):
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### Issue: "pdf2image: Unable to get page count"
**Solution:**
```powershell
# Verify poppler is in PATH
where.exe pdftoppm

# Should show: C:\poppler\Library\bin\pdftoppm.exe
```

### Issue: "EasyOCR initialization failed"
**Solution:**
```powershell
# EasyOCR requires GPU support OR CPU-only mode
# For CPU-only, it will automatically fallback to Tesseract
# No action needed - app will work fine!
```

### Issue: Import errors for new services
**Solution:**
```powershell
# Ensure all files are saved and server restarted
cd d:\github\Lawmind\backend

# Stop server (Ctrl+C)
# Restart
.\venv\Scripts\python.exe main.py
```

### Issue: Database errors for new tables
**Solution:**
```powershell
# Recreate database
cd d:\github\Lawmind\backend
Remove-Item lawmind.db
.\venv\Scripts\python.exe main.py

# Tables will auto-create on startup
```

---

## Verification Checklist

Run these checks to verify everything works:

```powershell
# 1. Check Python packages
.\venv\Scripts\pip.exe list | findstr "tesseract|easyocr|spacy|langchain-core"

# 2. Check Tesseract
tesseract --version

# 3. Check Poppler
where.exe pdftoppm

# 4. Check backend server
# Should see no import errors in console

# 5. Check API docs
# Visit http://localhost:8000/docs
# Should see new endpoints listed

# 6. Check database tables
.\venv\Scripts\python.exe -c "from app.models.database_models import *; from app.core.database import engine; Base.metadata.create_all(engine); print('Tables created!')"
```

---

## Performance Tips

### For Faster OCR:
1. **Use EasyOCR for Indian documents** (better Hindi support)
2. **Resize large images** before OCR (max 2000px width)
3. **Use Tesseract for English-only docs** (faster)

### For Better Extraction:
1. **Provide document type** (fir, chargesheet, notes)
2. **Pre-process images** (crop, enhance contrast)
3. **Use high-quality scans** (min 300 DPI)

### For Production:
1. **Enable GPU for EasyOCR** (10x faster)
2. **Use Redis for caching** OCR results
3. **Process uploads in background** (Celery queue)

---

## Next Steps

1. ✅ Install all dependencies
2. ✅ Configure Tesseract & Poppler
3. ✅ Update database schema
4. ✅ Test new API endpoints
5. ⏳ Build frontend components (OCR upload UI, quality dashboard)
6. ⏳ Add remaining features (court formats, precedents, multi-language)
7. ⏳ Deploy to production

**Estimated Setup Time:** 15-20 minutes ⏱️

**Ready to go!** 🚀

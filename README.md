# 🧠 LawMind – AI Legal Drafting Assistant

![LawMind Logo](https://img.shields.io/badge/LawMind-AI%20Legal%20Assistant-blue)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌍 Vision

LawMind is a next-generation **AI-powered legal assistant** designed to help **advocates, interns, and legal firms** automate and streamline the process of **drafting, reviewing, and formatting legal documents**.

It saves hours of manual effort by turning **voice or text prompts** into **professionally structured legal drafts**—while maintaining **accuracy, security, and confidentiality**.

---

## 💡 Problem Statement

Legal professionals spend **3–5 hours** drafting each petition, notice, or affidavit—often repeating similar formats and manually searching for citations.

Existing AI tools are too generic, lacking:
- ❌ Indian law context
- ❌ Legal formatting standards
- ❌ Data privacy & security
- ❌ Citation management

**LawMind solves this** by combining:
- ✅ Generative AI for intelligent draft creation
- ✅ Indian law datasets for contextual relevance
- ✅ Encrypted, cloud-based document handling
- ✅ A sleek, professional UI experience

---

## 🚀 Live Demo & Deployment

### Quick Deploy

**Ready to deploy in production?**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AnshXGrind/Lawmind)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/AnshXGrind/Lawmind)

**See:** 📚 [Complete Deployment Guide](DEPLOYMENT_GUIDE.md) | ✅ [Quick Checklist](DEPLOY_CHECKLIST.md)

---

## ✨ Features

### 🎯 Core Features

1. **AI-Powered Draft Generation**
   - Generate petitions, notices, affidavits, contracts, and more
   - Context-aware legal language
   - Court-specific formatting

2. **Intelligent Citation Suggestions**
   - Automatically suggest relevant case laws
   - Indian law sections and acts
   - Smart relevance scoring

3. **Voice-to-Text Input**
   - Speak your case details
   - AI transcribes and structures the information
   - Supports Indian languages

4. **AI-Assisted Editing**
   - Explain legal sections in simple language
   - Simplify complex legal text
   - Rephrase in formal legal tone
   - Add relevant citations

5. **Multi-Format Export**
   - PDF and DOCX formats
   - Professional formatting
   - Optional watermarking

6. **Secure & Private**
   - End-to-end encryption
   - User-owned data
   - GDPR compliant

---

## 🏗️ Architecture

### Technology Stack

#### Backend
- **Framework:** FastAPI (Python 3.11)
- **Database:** SQLAlchemy + PostgreSQL/SQLite
- **AI/ML:** 
  - LangChain for LLM orchestration
  - OpenAI GPT-4 / Anthropic Claude
  - Sentence Transformers for embeddings
  - FAISS for vector storage
- **Authentication:** JWT tokens with bcrypt
- **Document Processing:** python-docx, ReportLab

#### Frontend
- **Framework:** React 18
- **Styling:** TailwindCSS
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Icons:** Lucide React

#### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (for production)
- **Cloud Deployment:** AWS/GCP/Azure ready

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Docker & Docker Compose** (optional)
- **OpenAI API Key** (required for AI features)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/AnshXGrind/Lawmind.git
cd Lawmind
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env and add your API keys

# Run the backend server
python main.py
```

Backend will be available at: `http://localhost:8000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
copy .env.example .env
# Edit .env if needed

# Run the development server
npm start
```

Frontend will be available at: `http://localhost:3000`

### 🐳 Docker Deployment

```bash
# From project root
docker-compose up -d
```

This will start:
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- PostgreSQL Database: `localhost:5432`

---

## 📖 Usage Guide

### 1. Register & Login
- Navigate to `http://localhost:3000`
- Create an account with your email
- Login to access the dashboard

### 2. Create a New Draft
- Click "New Draft" button
- Fill in the case details:
  - Document type (Petition, Notice, etc.)
  - Case type (Civil, Criminal, etc.)
  - Court level
  - Facts and parties
  - Relief sought
- Click "Generate Draft with AI"

### 3. Edit Your Draft
- Use the rich text editor
- Select text to access AI tools:
  - **Explain** - Simplify legal jargon
  - **Simplify** - Make language accessible
  - **Rephrase** - Formalize the tone
  - **Add Citation** - Find relevant case laws

### 4. Export Document
- Save your draft
- Export as PDF or DOCX
- Download and use in court

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://user:pass@localhost/lawmind_db

# Security
SECRET_KEY=your-secret-key
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "John Doe",
  "organization": "ABC Law Firm"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Draft Endpoints

#### Generate Draft
```http
POST /api/drafts/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "document_type": "petition",
  "case_type": "civil",
  "court": "high_court",
  "title": "Petition for Injunction",
  "facts": "...",
  "parties": {
    "petitioner": "John Doe",
    "respondent": "State of XYZ"
  },
  "sections": ["IPC 420", "Contract Act 10"],
  "relief_sought": "...",
  "tone": "formal"
}
```

#### Get All Drafts
```http
GET /api/drafts/
Authorization: Bearer <token>
```

#### Get Single Draft
```http
GET /api/drafts/{draft_id}
Authorization: Bearer <token>
```

#### Update Draft
```http
PUT /api/drafts/{draft_id}?content=<new_content>
Authorization: Bearer <token>
```

### AI Editing Endpoints

#### AI Edit Action
```http
POST /api/drafts/edit
Authorization: Bearer <token>
Content-Type: application/json

{
  "draft_id": 1,
  "action": "explain",  // explain, simplify, rephrase, add_citation
  "selected_text": "...",
  "context": "..."
}
```

### Citation Endpoints

#### Search Citations
```http
POST /api/citations/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "fundamental rights",
  "case_type": "constitutional",
  "limit": 5
}
```

### Document Export

#### Export Draft
```http
POST /api/documents/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "draft_id": 1,
  "format": "pdf",  // pdf or docx
  "include_watermark": true
}
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## 📁 Project Structure

```
Lawmind/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Configuration
│   │   │   ├── database.py        # Database setup
│   │   │   └── security.py        # Auth utilities
│   │   ├── models/
│   │   │   ├── database_models.py # SQLAlchemy models
│   │   │   └── schemas.py         # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── auth.py            # Auth endpoints
│   │   │   ├── drafts.py          # Draft endpoints
│   │   │   ├── citations.py       # Citation endpoints
│   │   │   └── documents.py       # Export endpoints
│   │   └── services/
│   │       ├── ai_service.py      # LLM integration
│   │       ├── rag_service.py     # RAG system
│   │       └── citation_service.py # Citation logic
│   ├── main.py                    # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── NewDraft.js
│   │   │   └── DraftEditor.js
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ AI-powered draft generation
- ✅ Multi-document type support
- ✅ Basic citation management
- ✅ Export to PDF/DOCX

### Phase 2 (Upcoming)
- 🔄 Voice input integration
- 🔄 Advanced RAG with Indian law database
- 🔄 Multi-language support (Hindi, Tamil, etc.)
- 🔄 Collaborative editing

### Phase 3 (Future)
- 📅 Case management system
- 📅 Client portal
- 📅 E-filing integration
- 📅 Mobile app (iOS/Android)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Developer:** AnshXGrind
- **Repository:** [github.com/AnshXGrind/Lawmind](https://github.com/AnshXGrind/Lawmind)

---

## 📞 Support

For support, email: support@lawmind.ai or join our Slack channel.

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- LangChain community
- Indian legal community for feedback
- All contributors

---

## ⚠️ Disclaimer

LawMind is an AI assistant tool and should be used as an aid. Always review AI-generated content with a qualified legal professional before submission to court. LawMind does not provide legal advice.

---

**Made with ❤️ for the Indian Legal Community**

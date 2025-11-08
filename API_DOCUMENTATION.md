# LawMind API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication using JWT Bearer tokens.

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Endpoints

### Authentication

#### 1. Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "organization": "ABC Law Firm"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "organization": "ABC Law Firm",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 2. Login
Authenticate and receive access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 3. Get Current User
Get authenticated user information.

**Endpoint:** `GET /auth/me`

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "organization": "ABC Law Firm",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Drafts

#### 1. Generate New Draft
Generate a legal draft using AI.

**Endpoint:** `POST /drafts/generate`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "document_type": "petition",
  "case_type": "civil",
  "court": "high_court",
  "title": "Petition for Injunction against Unlawful Eviction",
  "facts": "The petitioner is the lawful owner of property...",
  "parties": {
    "petitioner": "John Doe",
    "respondent": "State of XYZ"
  },
  "sections": ["IPC Section 420", "Contract Act Section 10"],
  "relief_sought": "Grant permanent injunction...",
  "tone": "formal",
  "additional_context": "Urgent matter requiring immediate attention"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "content": "IN THE HIGH COURT OF...",
  "document_type": "petition",
  "case_type": "civil",
  "title": "Petition for Injunction against Unlawful Eviction",
  "citations": [
    {
      "title": "Kesavananda Bharati v. State of Kerala",
      "citation": "AIR 1973 SC 1461",
      "court": "Supreme Court of India",
      "year": 1973,
      "relevance_score": 0.85
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 2. Get All Drafts
Retrieve all drafts for authenticated user.

**Endpoint:** `GET /drafts/`

**Headers:** Requires authentication

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum records to return (default: 20)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "content": "...",
    "document_type": "petition",
    "case_type": "civil",
    "title": "...",
    "citations": [...],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### 3. Get Single Draft
Retrieve a specific draft by ID.

**Endpoint:** `GET /drafts/{draft_id}`

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "id": 1,
  "content": "...",
  "document_type": "petition",
  "case_type": "civil",
  "title": "...",
  "citations": [...],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 4. Update Draft
Update draft content.

**Endpoint:** `PUT /drafts/{draft_id}`

**Headers:** Requires authentication

**Query Parameters:**
- `content`: New content for the draft

**Response:** `200 OK`
```json
{
  "id": 1,
  "content": "Updated content...",
  "document_type": "petition",
  "version": 2,
  "updated_at": "2024-01-01T01:00:00Z"
}
```

#### 5. Delete Draft
Delete a draft.

**Endpoint:** `DELETE /drafts/{draft_id}`

**Headers:** Requires authentication

**Response:** `204 No Content`

---

### AI Editing

#### Edit Draft with AI
Perform AI-assisted editing operations.

**Endpoint:** `POST /drafts/edit`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "draft_id": 1,
  "action": "explain",
  "selected_text": "The petitioner humbly submits...",
  "context": "Introduction section"
}
```

**Actions:**
- `explain` - Explain legal text in simple language
- `simplify` - Simplify legal jargon
- `rephrase` - Rephrase in formal legal tone
- `add_citation` - Find relevant citations
- `improve` - Get improvement suggestions

**Response:** `200 OK`
```json
{
  "result": "This means the petitioner respectfully presents...",
  "suggestions": null
}
```

Or for `improve` action:
```json
{
  "result": "",
  "suggestions": [
    "1. Add specific section references",
    "2. Strengthen legal arguments",
    "3. Include precedent citations"
  ]
}
```

---

### Citations

#### 1. Search Citations
Search for relevant legal citations.

**Endpoint:** `POST /citations/search`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "query": "fundamental rights article 21",
  "case_type": "constitutional",
  "limit": 5
}
```

**Response:** `200 OK`
```json
{
  "citations": [
    {
      "title": "Maneka Gandhi v. Union of India",
      "citation": "AIR 1978 SC 597",
      "court": "Supreme Court of India",
      "year": 1978,
      "relevance_score": 0.92,
      "summary": "Expanded interpretation of Article 21..."
    }
  ],
  "total": 1
}
```

#### 2. Get Citation by Reference
Get specific citation details.

**Endpoint:** `GET /citations/{citation_ref}`

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "title": "Kesavananda Bharati v. State of Kerala",
  "citation": "AIR 1973 SC 1461",
  "court": "Supreme Court of India",
  "year": 1973,
  "relevance_score": 1.0,
  "summary": "Landmark case establishing basic structure doctrine"
}
```

---

### Documents

#### 1. Export Draft
Export draft to PDF or DOCX format.

**Endpoint:** `POST /documents/export`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "draft_id": 1,
  "format": "pdf",
  "include_watermark": true
}
```

**Response:** `200 OK`
```json
{
  "file_url": "/api/documents/download/1",
  "format": "pdf",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 2. Get User Exports
Get all exports for current user.

**Endpoint:** `GET /documents/exports`

**Headers:** Requires authentication

**Response:** `200 OK`
```json
[
  {
    "file_url": "/api/documents/download/1",
    "format": "pdf",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### 3. Upload Document
Upload a document for context.

**Endpoint:** `POST /documents/upload`

**Headers:** 
- Requires authentication
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: The file to upload (.pdf, .docx, .txt)

**Response:** `200 OK`
```json
{
  "filename": "upload_1_20240101_120000.pdf",
  "size": 102400,
  "message": "File uploaded successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Draft not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error generating draft: <error_message>"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting for API endpoints.

---

## Data Models

### Document Types
- `petition`
- `notice`
- `affidavit`
- `contract`
- `agreement`
- `reply`
- `application`
- `appeal`

### Case Types
- `civil`
- `criminal`
- `corporate`
- `family`
- `tax`
- `property`
- `labour`
- `constitutional`

### Court Levels
- `district`
- `high_court`
- `supreme_court`
- `tribunal`

### Tone Types
- `formal`
- `assertive`
- `conciliatory`
- `technical`

---

## WebSocket Support

WebSocket support for real-time collaboration is planned for future releases.

---

For more information, visit the [GitHub repository](https://github.com/AnshXGrind/Lawmind).

"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

# Enums
class CaseType(str, Enum):
    CIVIL = "civil"
    CRIMINAL = "criminal"
    CORPORATE = "corporate"
    FAMILY = "family"
    TAX = "tax"
    PROPERTY = "property"
    LABOUR = "labour"
    CONSTITUTIONAL = "constitutional"

class CourtLevel(str, Enum):
    DISTRICT = "district"
    HIGH_COURT = "high_court"
    SUPREME_COURT = "supreme_court"
    TRIBUNAL = "tribunal"

class DocumentType(str, Enum):
    PETITION = "petition"
    NOTICE = "notice"
    AFFIDAVIT = "affidavit"
    CONTRACT = "contract"
    AGREEMENT = "agreement"
    REPLY = "reply"
    APPLICATION = "application"
    APPEAL = "appeal"

class ToneType(str, Enum):
    FORMAL = "formal"
    ASSERTIVE = "assertive"
    CONCILIATORY = "conciliatory"
    TECHNICAL = "technical"

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    organization: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Draft Generation Schemas
class DraftRequest(BaseModel):
    document_type: DocumentType
    case_type: CaseType
    court: CourtLevel
    title: str = Field(..., description="Case title or document title")
    facts: str = Field(..., description="Facts of the case or document context")
    parties: Dict[str, str] = Field(
        default_factory=dict,
        description="Petitioner, Respondent, etc."
    )
    sections: Optional[List[str]] = Field(
        default=[],
        description="Relevant legal sections/acts"
    )
    relief_sought: Optional[str] = None
    tone: ToneType = ToneType.FORMAL
    additional_context: Optional[str] = None

class DraftResponse(BaseModel):
    id: int
    content: str
    document_type: str
    case_type: str
    title: str
    citations: List[Dict[str, str]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Voice Input Schema
class VoiceTranscriptionRequest(BaseModel):
    audio_file_id: str
    language: str = "en-IN"

class VoiceTranscriptionResponse(BaseModel):
    text: str
    confidence: float
    language: str

# Citation Schemas
class CitationSearch(BaseModel):
    query: str
    case_type: Optional[CaseType] = None
    limit: int = 5

class Citation(BaseModel):
    title: str
    citation: str
    court: str
    year: int
    relevance_score: float
    summary: Optional[str] = None

class CitationResponse(BaseModel):
    citations: List[Citation]
    total: int

# Document Edit Schemas
class DocumentEditRequest(BaseModel):
    draft_id: int
    action: str  # "explain", "simplify", "add_citation", "rephrase"
    selected_text: Optional[str] = None
    context: Optional[str] = None

class DocumentEditResponse(BaseModel):
    result: str
    suggestions: Optional[List[str]] = None

# Export Schemas
class ExportRequest(BaseModel):
    draft_id: int
    format: str  # "pdf", "docx"
    include_watermark: bool = True

class ExportResponse(BaseModel):
    file_url: str
    format: str
    created_at: datetime

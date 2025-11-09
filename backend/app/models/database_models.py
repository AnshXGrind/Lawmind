"""
SQLAlchemy database models
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    organization = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # New fields for enhanced features
    preferences = Column(JSON, nullable=True)  # UI preferences, language, theme
    subscription_tier = Column(String, default="free")  # free, pro, enterprise
    storage_used = Column(Integer, default=0)  # in bytes
    encryption_key = Column(String, nullable=True)  # User's 256-bit AES encryption key (hex)
    role = Column(String, default="advocate")  # admin, advocate, student, guest - for RBAC
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    drafts = relationship("Draft", back_populates="user", cascade="all, delete-orphan")
    uploaded_documents = relationship("UploadedDocument", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")

class Draft(Base):
    __tablename__ = "drafts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Document Details
    title = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # petition, notice, etc.
    case_type = Column(String, nullable=False)  # civil, criminal, etc.
    court = Column(String, nullable=False)  # district, high_court, etc.
    
    # Content
    content = Column(Text, nullable=False)
    facts = Column(Text, nullable=True)
    parties = Column(JSON, nullable=True)
    sections = Column(JSON, nullable=True)  # Array of section references
    relief_sought = Column(Text, nullable=True)
    tone = Column(String, default="formal")
    
    # Metadata
    citations = Column(JSON, nullable=True)  # Array of citation objects
    version = Column(Integer, default=1)
    is_finalized = Column(Boolean, default=False)
    
    # New fields for enhanced features
    client_name = Column(String, nullable=True)  # For tagging and search
    tags = Column(JSON, nullable=True)  # Array of custom tags
    court_format = Column(String, default="district")  # district, high_court, supreme_court
    language = Column(String, default="en")  # en, hi, regional
    quality_score = Column(JSON, nullable=True)  # {structure: 9, tone: 8, etc.}
    missing_info = Column(JSON, nullable=True)  # Array of detected missing fields
    suggestions = Column(JSON, nullable=True)  # AI improvement suggestions
    word_count = Column(Integer, default=0)
    page_count = Column(Integer, default=0)
    extracted_from_doc = Column(Integer, ForeignKey("uploaded_documents.id"), nullable=True)  # Link to source OCR doc
    
    # Encryption fields
    is_encrypted = Column(Boolean, default=False)  # Whether content is encrypted
    encryption_iv = Column(String, nullable=True)  # Initialization vector for AES-256
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="drafts")
    exports = relationship("Export", back_populates="draft", cascade="all, delete-orphan")
    versions = relationship("DraftVersion", back_populates="draft", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="draft", cascade="all, delete-orphan")

class Export(Base):
    __tablename__ = "exports"
    
    id = Column(Integer, primary_key=True, index=True)
    draft_id = Column(Integer, ForeignKey("drafts.id"), nullable=False)
    
    # Export Details
    file_path = Column(String, nullable=False)
    file_format = Column(String, nullable=False)  # pdf, docx
    file_size = Column(Integer, nullable=True)
    has_watermark = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    draft = relationship("Draft", back_populates="exports")

class LegalKnowledge(Base):
    __tablename__ = "legal_knowledge"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Content
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # act, section, case_law, etc.
    
    # Metadata
    act_name = Column(String, nullable=True)
    section_number = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    court = Column(String, nullable=True)
    citation = Column(String, nullable=True)
    
    # Vector embedding reference
    vector_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# NEW MODELS FOR ENHANCED FEATURES

class UploadedDocument(Base):
    """Store uploaded FIRs, chargesheet, notes for OCR extraction"""
    __tablename__ = "uploaded_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # File details
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, image, doc
    file_size = Column(Integer, nullable=False)
    
    # OCR results
    extracted_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, nullable=True)  # {petitioner, respondent, sections, dates, etc.}
    ocr_confidence = Column(Integer, nullable=True)  # 0-100
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="uploaded_documents")

class DraftVersion(Base):
    """Version history for drafts"""
    __tablename__ = "draft_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    draft_id = Column(Integer, ForeignKey("drafts.id"), nullable=False)
    
    # Version content
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    change_summary = Column(String, nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    draft = relationship("Draft", back_populates="versions")

class Comment(Base):
    """Comments and collaboration on drafts"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    draft_id = Column(Integer, ForeignKey("drafts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Comment details
    content = Column(Text, nullable=False)
    comment_type = Column(String, default="comment")  # comment, suggestion, approval
    is_resolved = Column(Boolean, default=False)
    parent_comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)  # For replies
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    draft = relationship("Draft", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Precedent(Base):
    """Indian case law precedents database"""
    __tablename__ = "precedents"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Case details
    case_name = Column(String, nullable=False, index=True)
    citation = Column(String, nullable=False)
    court = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    
    # Content
    summary = Column(Text, nullable=True)
    full_text = Column(Text, nullable=True)
    headnote = Column(Text, nullable=True)
    
    # Classification
    case_type = Column(String, nullable=True)  # civil, criminal, etc.
    sections_cited = Column(JSON, nullable=True)  # Array of sections
    keywords = Column(JSON, nullable=True)  # Array of keywords for search
    
    # Metadata
    judges = Column(JSON, nullable=True)
    bench_strength = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

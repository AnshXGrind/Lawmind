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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    drafts = relationship("Draft", back_populates="user", cascade="all, delete-orphan")

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
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="drafts")
    exports = relationship("Export", back_populates="draft", cascade="all, delete-orphan")

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

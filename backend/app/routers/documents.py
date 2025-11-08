"""
Documents router for export and file handling
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_token
from app.models.schemas import ExportRequest, ExportResponse
from app.models.database_models import User, Draft, Export
from app.core.config import settings

router = APIRouter()

async def get_current_user(
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    user_id = int(token_data["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/export", response_model=ExportResponse)
async def export_document(
    request: ExportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export draft to PDF or DOCX format"""
    
    # Get draft
    draft = db.query(Draft).filter(
        Draft.id == request.draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    try:
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"draft_{draft.id}_{timestamp}.{request.format}"
        filepath = os.path.join(settings.EXPORT_DIR, filename)
        
        # Export based on format
        if request.format == "pdf":
            # TODO: Implement PDF generation (using reportlab or weasyprint)
            file_content = draft.content
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(file_content)
                if request.include_watermark:
                    f.write("\n\n---\nDrafted via LawMind AI Legal Assistant")
        
        elif request.format == "docx":
            # TODO: Implement DOCX generation (using python-docx)
            file_content = draft.content
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(file_content)
                if request.include_watermark:
                    f.write("\n\n---\nDrafted via LawMind AI Legal Assistant")
        
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
        
        # Get file size
        file_size = os.path.getsize(filepath)
        
        # Save export record
        export = Export(
            draft_id=draft.id,
            file_path=filepath,
            file_format=request.format,
            file_size=file_size,
            has_watermark=request.include_watermark
        )
        
        db.add(export)
        db.commit()
        db.refresh(export)
        
        # Generate URL (in production, this would be a signed URL)
        file_url = f"/api/documents/download/{export.id}"
        
        return ExportResponse(
            file_url=file_url,
            format=request.format,
            created_at=export.created_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting document: {str(e)}"
        )

@router.get("/exports", response_model=List[ExportResponse])
async def get_exports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all exports for current user"""
    
    exports = db.query(Export).join(Draft).filter(
        Draft.user_id == current_user.id
    ).all()
    
    return [
        ExportResponse(
            file_url=f"/api/documents/download/{exp.id}",
            format=exp.file_format,
            created_at=exp.created_at
        )
        for exp in exports
    ]

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for context"""
    
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed"
        )
    
    # Save file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"upload_{current_user.id}_{timestamp}{file_ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    try:
        content = await file.read()
        
        # Check file size
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File too large"
            )
        
        with open(filepath, "wb") as f:
            f.write(content)
        
        return {
            "filename": filename,
            "size": len(content),
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading file: {str(e)}"
        )

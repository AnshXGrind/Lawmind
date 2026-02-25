"""
Documents router for export and file handling
Enhanced with OCR and automatic case extraction
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_token
from app.models.schemas import ExportRequest, ExportResponse
from app.models.database_models import User, Draft, Export, UploadedDocument
from app.core.config import settings
from app.services.ocr_service import ocr_service, case_extractor

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
    """Upload a document for context - Basic upload"""
    
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


# ========== NEW OCR & EXTRACTION ENDPOINTS ==========

@router.post("/upload-and-extract")
async def upload_and_extract_case_info(
    file: UploadFile = File(...),
    document_type: str = "general",  # fir, chargesheet, notes, general
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🚀 AUTO CASE EXTRACTOR - Upload FIR/Chargesheet/Notes and automatically extract case information
    
    **Features:**
    - Supports PDF and image files (JPG, PNG)
    - OCR extraction with confidence score
    - Auto-extracts: Petitioner, Respondent, Sections, Dates, Facts, FIR Number, Police Station
    - Saves to database for future reference
    
    **Time Saved:** 25-30 minutes of manual data entry ⏱️
    """
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and image files (JPEG, PNG) are supported"
        )
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            file_size = len(content)
        
        # Create database record
        uploaded_doc = UploadedDocument(
            user_id=current_user.id,
            filename=file.filename,
            file_path=file_path,
            file_type=file_extension,
            file_size=file_size,
            processing_status="processing"
        )
        db.add(uploaded_doc)
        db.commit()
        db.refresh(uploaded_doc)
        
        # Perform OCR extraction
        if file_extension.lower() == "pdf":
            extracted_text, confidence = await ocr_service.extract_text_from_pdf(file_path)
        else:
            extracted_text, confidence = await ocr_service.extract_text_from_image(file_path)
        
        # Extract structured case information
        extracted_data = await case_extractor.extract_case_info(extracted_text, document_type)
        
        # Update database record
        uploaded_doc.extracted_text = extracted_text
        uploaded_doc.extracted_data = extracted_data
        uploaded_doc.ocr_confidence = confidence
        uploaded_doc.processing_status = "completed"
        uploaded_doc.processed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(uploaded_doc)
        
        return {
            "success": True,
            "document_id": uploaded_doc.id,
            "filename": file.filename,
            "ocr_confidence": confidence,
            "extracted_data": extracted_data,
            "extracted_fields": extracted_data.get("extracted_fields", []),
            "full_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
            "message": f"✅ Successfully extracted {len(extracted_data.get('extracted_fields', []))} fields from document"
        }
        
    except Exception as e:
        # Update status to failed
        if 'uploaded_doc' in locals():
            uploaded_doc.processing_status = "failed"
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )


@router.get("/uploaded/{document_id}")
async def get_uploaded_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details of previously uploaded document"""
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "processing_status": doc.processing_status,
        "ocr_confidence": doc.ocr_confidence,
        "extracted_data": doc.extracted_data,
        "created_at": doc.created_at,
        "processed_at": doc.processed_at
    }


@router.get("/my-uploads")
async def list_my_uploads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents uploaded by current user"""
    docs = db.query(UploadedDocument).filter(
        UploadedDocument.user_id == current_user.id
    ).order_by(UploadedDocument.created_at.desc()).all()
    
    return {
        "total": len(docs),
        "documents": [
            {
                "id": doc.id,
                "filename": doc.filename,
                "processing_status": doc.processing_status,
                "ocr_confidence": doc.ocr_confidence,
                "created_at": doc.created_at
            }
            for doc in docs
        ]
    }


@router.post("/create-draft-from-upload/{document_id}")
async def create_draft_from_uploaded_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🎯 AUTO-GENERATE DRAFT from uploaded document
    
    **Workflow:**
    1. Retrieves extracted data from uploaded document
    2. Uses AI to generate petition based on extracted information
    3. Creates new draft in database
    4. Returns draft ready for editing
    
    **This saves 25-30 minutes!** ⚡
    """
    from app.services.ai_service import ai_service
    
    # Get uploaded document
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if doc.processing_status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document processing not completed yet"
        )
    
    extracted_data = doc.extracted_data or {}
    
    # Prepare draft title from extracted data
    draft_title = "Petition from Uploaded Document"
    if extracted_data.get("fir_number"):
        draft_title = f"Petition - FIR {extracted_data['fir_number']}"
    
    # Determine case type from sections
    case_type = "criminal"  # Default
    sections = extracted_data.get("sections", [])
    if any("CPC" in s for s in sections):
        case_type = "civil"
    
    # Generate draft using AI service
    try:
        content = await ai_service.generate_draft(
            document_type="petition",
            case_type=case_type,
            title=draft_title,
            facts=extracted_data.get("facts", ""),
            parties={
                "petitioner": extracted_data.get("petitioner") or extracted_data.get("complainant"),
                "respondent": extracted_data.get("respondent") or extracted_data.get("accused"),
            },
            sections=sections,
            relief_sought="",
            tone="formal",
            additional_context=f"Extracted from {doc.filename}. Place: {extracted_data.get('place', 'N/A')}"
        )
        
        # Create draft in database
        new_draft = Draft(
            user_id=current_user.id,
            title=draft_title,
            document_type="petition",
            case_type=case_type,
            court="district",
            content=content,
            facts=extracted_data.get("facts"),
            parties=extracted_data,
            sections=sections,
            extracted_from_doc=document_id,
            word_count=len(content.split()),
            page_count=len(content.split()) // 250  # Approx 250 words per page
        )
        
        db.add(new_draft)
        db.commit()
        db.refresh(new_draft)
        
        return {
            "success": True,
            "draft_id": new_draft.id,
            "title": new_draft.title,
            "content": content,
            "extracted_from": doc.filename,
            "message": "✅ Draft successfully created from uploaded document!"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate draft: {str(e)}"
        )

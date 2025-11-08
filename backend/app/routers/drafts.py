"""
Legal drafts router
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import verify_token
from app.models.schemas import DraftRequest, DraftResponse, DocumentEditRequest, DocumentEditResponse
from app.models.database_models import User, Draft
from app.services.ai_service import legal_ai
from app.services.citation_service import citation_service

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

@router.post("/generate", response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
async def generate_draft(
    request: DraftRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new legal draft using AI"""
    
    try:
        # Generate draft content using AI
        content = legal_ai.generate_draft(request)
        
        # Get suggested citations
        citations = citation_service.suggest_citations_for_draft(content, request.case_type)
        citations_data = [
            {
                "title": c.title,
                "citation": c.citation,
                "court": c.court,
                "year": c.year,
                "relevance_score": c.relevance_score
            }
            for c in citations
        ]
        
        # Create draft in database
        db_draft = Draft(
            user_id=current_user.id,
            title=request.title,
            document_type=request.document_type.value,
            case_type=request.case_type.value,
            court=request.court.value,
            content=content,
            facts=request.facts,
            parties=request.parties,
            sections=request.sections,
            relief_sought=request.relief_sought,
            tone=request.tone.value,
            citations=citations_data,
            version=1
        )
        
        db.add(db_draft)
        db.commit()
        db.refresh(db_draft)
        
        return db_draft
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating draft: {str(e)}"
        )

@router.get("/", response_model=List[DraftResponse])
async def get_drafts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """Get all drafts for current user"""
    drafts = db.query(Draft).filter(
        Draft.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return drafts

@router.get("/{draft_id}", response_model=DraftResponse)
async def get_draft(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific draft"""
    draft = db.query(Draft).filter(
        Draft.id == draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    return draft

@router.put("/{draft_id}", response_model=DraftResponse)
async def update_draft(
    draft_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update draft content"""
    draft = db.query(Draft).filter(
        Draft.id == draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    draft.content = content
    draft.version += 1
    db.commit()
    db.refresh(draft)
    
    return draft

@router.post("/edit", response_model=DocumentEditResponse)
async def edit_draft(
    request: DocumentEditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI-assisted editing of draft sections"""
    
    # Verify draft ownership
    draft = db.query(Draft).filter(
        Draft.id == request.draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    text = request.selected_text or draft.content
    
    try:
        if request.action == "explain":
            result = legal_ai.explain_section(text)
            
        elif request.action == "simplify":
            result = legal_ai.simplify_tone(text)
            
        elif request.action == "rephrase":
            result = legal_ai.rephrase_legally(text, request.context or "")
            
        elif request.action == "add_citation":
            # Search for relevant citations
            citations = citation_service.search_citations(text, limit=3)
            result = "\n".join([f"• {c.citation} - {c.title}" for c in citations])
            
        elif request.action == "improve":
            suggestions = legal_ai.suggest_improvements(text)
            return DocumentEditResponse(result="", suggestions=suggestions)
            
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        return DocumentEditResponse(result=result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error performing edit: {str(e)}"
        )

@router.delete("/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_draft(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a draft"""
    draft = db.query(Draft).filter(
        Draft.id == draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    db.delete(draft)
    db.commit()
    
    return None

@router.post("/suggest-sections")
async def suggest_sections(
    document_type: str,
    case_type: str,
    facts: str = "",
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered suggestions for applicable legal sections"""
    
    try:
        suggestions = legal_ai.suggest_legal_sections(
            document_type=document_type,
            case_type=case_type,
            facts=facts
        )
        
        return {
            "suggestions": suggestions,
            "case_type": case_type,
            "document_type": document_type
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating suggestions: {str(e)}"
        )

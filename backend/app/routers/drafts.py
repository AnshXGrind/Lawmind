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


# ========== NEW QUALITY SCORING & VALIDATION ENDPOINTS ==========

@router.post("/{draft_id}/quality-score")
async def get_quality_score(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    📊 PETITION QUALITY SCORE - Analyze draft quality
    
    Returns comprehensive quality report with scores for:
    - Structure (9/10)
    - Tone (8/10)
    - Completeness (9/10)
    - Legal References (7/10)
    - Grammar (10/10)
    
    Plus actionable suggestions for improvement!
    """
    from app.services.quality_service import quality_scorer
    
    # Get draft
    draft = db.query(Draft).filter(
        Draft.id == draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    try:
        # Score the document
        quality_report = await quality_scorer.score_document(
            content=draft.content,
            document_type=draft.document_type,
            case_type=draft.case_type
        )
        
        # Save score to database
        draft.quality_score = quality_report
        db.commit()
        
        return {
            "draft_id": draft_id,
            "quality_report": quality_report,
            "message": f"📊 Overall Quality Score: {quality_report['overall']}/10"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating quality score: {str(e)}"
        )


@router.post("/validate-draft")
async def validate_draft_data(
    document_type: str,
    case_type: str,
    title: str = "",
    facts: str = "",
    parties: dict = None,
    sections: list = None,
    relief_sought: str = "",
    current_user: User = Depends(get_current_user)
):
    """
    🔍 SMART MISSING INFO DETECTOR
    
    Analyzes your draft data and detects missing critical information.
    Returns intelligent follow-up questions like a junior lawyer assistant:
    
    "It seems you haven't mentioned the IPC section. Is this a bail petition or writ petition?"
    
    Saves revision time by catching gaps early!
    """
    from app.services.validation_service import validation_service
    
    try:
        provided_data = {
            "title": title,
            "case_type": case_type,
            "facts": facts,
            "parties": parties or {},
            "sections": sections or [],
            "relief_sought": relief_sought
        }
        
        # Detect missing information
        missing_fields = await validation_service.detect_missing_info(
            document_type=document_type,
            provided_data=provided_data
        )
        
        # Generate conversational prompts
        interactive_prompts = await validation_service.generate_interactive_prompts(missing_fields)
        
        return {
            "validation_status": "incomplete" if missing_fields else "complete",
            "missing_fields_count": len(missing_fields),
            "missing_fields": [
                {
                    "field": f.field_name,
                    "question": f.question,
                    "priority": f.priority,
                    "suggestions": f.suggestions
                }
                for f in missing_fields
            ],
            "interactive_prompts": interactive_prompts,
            "message": "✅ All good!" if not missing_fields else f"⚠️ {len(missing_fields)} fields need attention"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating draft: {str(e)}"
        )


@router.post("/{draft_id}/check-tone")
async def check_legal_tone(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    💬 LEGAL TONE & GRAMMAR CHECKER
    
    Analyzes your draft for:
    - Formal legal tone
    - Sentence correctness
    - Avoids repetitive or casual words
    
    Example suggestion:
    "Please grant him bail" → "It is respectfully prayed that the Hon'ble Court may kindly grant bail to the petitioner."
    """
    from app.services.quality_service import quality_scorer
    
    draft = db.query(Draft).filter(
        Draft.id == draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    try:
        # Get tone score specifically
        tone_score, tone_feedback = quality_scorer._score_tone(draft.content)
        grammar_score, grammar_feedback = quality_scorer._score_grammar(draft.content)
        
        improvements = []
        
        # Tone improvements
        if tone_feedback["informal_terms_count"] > 0:
            improvements.append({
                "type": "tone",
                "issue": f"Found {tone_feedback['informal_terms_count']} informal terms",
                "suggestion": "Replace informal language with formal legal expressions"
            })
        
        if tone_feedback["formal_terms_count"] < 3:
            improvements.append({
                "type": "tone",
                "issue": "Insufficient formal legal terminology",
                "suggestion": "Use more formal terms like 'respectfully submitted', 'learned counsel', 'Hon'ble Court'"
            })
        
        # Grammar improvements
        for issue in grammar_feedback["potential_issues"]:
            improvements.append({
                "type": "grammar",
                "issue": issue,
                "suggestion": "Please review and correct"
            })
        
        return {
            "draft_id": draft_id,
            "tone_score": tone_score,
            "grammar_score": grammar_score,
            "formality_ratio": tone_feedback["formality_ratio"],
            "improvements": improvements,
            "message": "✅ Tone looks good!" if tone_score >= 8 and grammar_score >= 8 else "⚠️ Some improvements suggested"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking tone: {str(e)}"
        )


@router.post("/{draft_id}/client-summary")
async def generate_client_summary(
    draft_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    📝 CLIENT SUMMARY GENERATOR
    
    Converts complex legal petition into simple English summary
    that can be sent to client for approval.
    
    Example:
    "This petition requests bail for Ravi under Section 420 IPC, 
    highlighting that he's a first-time offender and has cooperated with the police."
    
    Saves time in client communication! 💬
    """
    from app.services.ai_service import legal_ai
    
    draft = db.query(Draft).filter(
        Draft.id == draft_id,
        Draft.user_id == current_user.id
    ).first()
    
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    
    try:
        # Use AI to create plain English summary
        prompt = f"""Convert this legal document into a simple, easy-to-understand summary for a client.
        Use plain English. Avoid legal jargon. Keep it under 200 words.
        
        Legal Document:
        {draft.content[:1500]}
        
        Client Summary:"""
        
        summary = legal_ai.llm.invoke(prompt).content
        
        return {
            "draft_id": draft_id,
            "client_summary": summary,
            "case_type": draft.case_type,
            "document_type": draft.document_type,
            "message": "✅ Client summary generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating client summary: {str(e)}"
        )


@router.get("/search")
async def smart_search_drafts(
    query: str = "",
    case_type: str = None,
    document_type: str = None,
    client_name: str = None,
    section: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    🔍 SMART SEARCH FOR OLD DRAFTS
    
    Search your drafts by:
    - Case name
    - IPC Section  
    - Client name
    - Date
    
    No more folder chaos! 📁
    """
    
    try:
        # Build query
        search_query = db.query(Draft).filter(Draft.user_id == current_user.id)
        
        # Apply filters
        if query:
            search_query = search_query.filter(
                (Draft.title.contains(query)) | (Draft.content.contains(query))
            )
        
        if case_type:
            search_query = search_query.filter(Draft.case_type == case_type)
        
        if document_type:
            search_query = search_query.filter(Draft.document_type == document_type)
        
        if client_name:
            search_query = search_query.filter(Draft.client_name.contains(client_name))
        
        if section:
            # Search in sections JSON array
            search_query = search_query.filter(Draft.sections.contains([section]))
        
        results = search_query.order_by(Draft.updated_at.desc()).limit(50).all()
        
        return {
            "total_results": len(results),
            "query": query,
            "filters": {
                "case_type": case_type,
                "document_type": document_type,
                "client_name": client_name,
                "section": section
            },
            "results": [
                {
                    "id": d.id,
                    "title": d.title,
                    "case_type": d.case_type,
                    "document_type": d.document_type,
                    "client_name": d.client_name,
                    "sections": d.sections,
                    "created_at": d.created_at,
                    "updated_at": d.updated_at
                }
                for d in results
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching drafts: {str(e)}"
        )

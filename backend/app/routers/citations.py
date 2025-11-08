"""
Citations router
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.models.schemas import CitationSearch, CitationResponse, Citation
from app.services.citation_service import citation_service
from app.core.security import verify_token

router = APIRouter()

@router.post("/search", response_model=CitationResponse)
async def search_citations(
    search: CitationSearch,
    token_data: dict = Depends(verify_token)
):
    """Search for legal citations"""
    
    try:
        citations = citation_service.search_citations(
            query=search.query,
            case_type=search.case_type,
            limit=search.limit
        )
        
        return CitationResponse(
            citations=citations,
            total=len(citations)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching citations: {str(e)}")

@router.get("/{citation_ref}", response_model=Citation)
async def get_citation(
    citation_ref: str,
    token_data: dict = Depends(verify_token)
):
    """Get citation details by reference"""
    
    citation = citation_service.get_citation_by_reference(citation_ref)
    
    if not citation:
        raise HTTPException(status_code=404, detail="Citation not found")
    
    return citation

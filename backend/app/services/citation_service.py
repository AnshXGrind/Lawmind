"""
Citation Service for finding and suggesting legal citations
"""

from typing import List, Dict, Optional
from app.services.rag_service import rag_service
from app.models.schemas import Citation, CaseType

class CitationService:
    """Service for managing legal citations"""
    
    def __init__(self):
        self.rag_service = rag_service
        
        # Sample Indian legal citations database
        self.sample_citations = [
            {
                "title": "Kesavananda Bharati v. State of Kerala",
                "citation": "AIR 1973 SC 1461",
                "court": "Supreme Court of India",
                "year": 1973,
                "summary": "Landmark case establishing the basic structure doctrine of the Constitution",
                "keywords": ["constitution", "basic structure", "amendment"]
            },
            {
                "title": "Maneka Gandhi v. Union of India",
                "citation": "AIR 1978 SC 597",
                "court": "Supreme Court of India",
                "year": 1978,
                "summary": "Expanded interpretation of Article 21 - Right to Life and Personal Liberty",
                "keywords": ["fundamental rights", "article 21", "personal liberty"]
            },
            {
                "title": "Vishaka v. State of Rajasthan",
                "citation": "AIR 1997 SC 3011",
                "court": "Supreme Court of India",
                "year": 1997,
                "summary": "Guidelines for prevention of sexual harassment at workplace",
                "keywords": ["sexual harassment", "workplace", "women's rights"]
            },
        ]
    
    def search_citations(
        self,
        query: str,
        case_type: Optional[CaseType] = None,
        limit: int = 5
    ) -> List[Citation]:
        """Search for relevant legal citations"""
        
        # Search in RAG service
        rag_results = self.rag_service.search_case_laws(
            query,
            case_type=case_type.value if case_type else None,
            k=limit
        )
        
        # Combine with sample citations (keyword matching)
        query_lower = query.lower()
        matching_citations = []
        
        for cite in self.sample_citations:
            relevance = 0.0
            
            # Check title match
            if query_lower in cite["title"].lower():
                relevance += 0.5
            
            # Check keyword match
            for keyword in cite["keywords"]:
                if keyword in query_lower or query_lower in keyword:
                    relevance += 0.3
            
            # Check summary match
            if query_lower in cite["summary"].lower():
                relevance += 0.2
            
            if relevance > 0:
                matching_citations.append({
                    **cite,
                    "relevance_score": min(relevance, 1.0)
                })
        
        # Sort by relevance
        matching_citations.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Convert to Citation objects
        citations = []
        for cite in matching_citations[:limit]:
            citations.append(Citation(
                title=cite["title"],
                citation=cite["citation"],
                court=cite["court"],
                year=cite["year"],
                relevance_score=cite["relevance_score"],
                summary=cite.get("summary")
            ))
        
        return citations
    
    def get_citation_by_reference(self, citation_ref: str) -> Optional[Citation]:
        """Get citation details by reference number"""
        for cite in self.sample_citations:
            if cite["citation"] == citation_ref:
                return Citation(
                    title=cite["title"],
                    citation=cite["citation"],
                    court=cite["court"],
                    year=cite["year"],
                    relevance_score=1.0,
                    summary=cite.get("summary")
                )
        return None
    
    def suggest_citations_for_draft(self, draft_content: str, case_type: CaseType) -> List[Citation]:
        """Suggest relevant citations based on draft content"""
        # Extract key phrases from draft (simplified approach)
        words = draft_content.lower().split()
        
        # Common legal terms to search for
        legal_terms = [
            "fundamental rights", "constitution", "contract", "tort",
            "criminal", "civil", "property", "evidence", "procedure"
        ]
        
        relevant_terms = [term for term in legal_terms if term in draft_content.lower()]
        
        if not relevant_terms:
            # Fallback to case type
            search_query = case_type.value
        else:
            search_query = " ".join(relevant_terms[:3])
        
        return self.search_citations(search_query, case_type, limit=5)

# Lazy singleton instance
_citation_service_instance = None

def get_citation_service():
    """Get or create the citation service singleton instance"""
    global _citation_service_instance
    if _citation_service_instance is None:
        _citation_service_instance = CitationService()
    return _citation_service_instance

# For backward compatibility
class LazyCitationService:
    def __getattr__(self, name):
        return getattr(get_citation_service(), name)

citation_service = LazyCitationService()

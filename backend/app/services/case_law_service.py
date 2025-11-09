"""
Case Law Research Service
Integrates with Indian Kanoon API for legal case search
"""

import requests
from typing import List, Dict, Optional
from app.core.config import settings

class CaseLawService:
    """Service for searching Indian case law"""
    
    def __init__(self):
        self.base_url = "https://api.indiankanoon.org/search/"
        # Indian Kanoon API key (requires registration at https://api.indiankanoon.org)
        # For demo purposes, using free tier endpoint
        
    def search_cases(
        self,
        query: str,
        max_results: int = 10,
        court: Optional[str] = None,
        case_type: Optional[str] = None
    ) -> List[Dict]:
        """
        Search for relevant case law
        
        Args:
            query: Search query (facts, legal provisions, etc.)
            max_results: Maximum number of results to return
            court: Filter by court (Supreme Court, High Court, etc.)
            case_type: Filter by case type (civil, criminal, etc.)
            
        Returns:
            List of case law results with citations
        """
        try:
            # Build search query
            search_query = self._build_search_query(query, court, case_type)
            
            # Call Indian Kanoon API
            # Note: This is a simplified version. In production, you'd need proper API authentication
            params = {
                'formInput': search_query,
                'pagenum': 0
            }
            
            # For demo: Return mock data (replace with actual API call in production)
            return self._get_mock_cases(query, max_results, court)
            
            # Actual API call (uncomment when API key is available):
            # response = requests.get(self.base_url, params=params, timeout=10)
            # response.raise_for_status()
            # return self._parse_response(response.json(), max_results)
            
        except Exception as e:
            print(f"Case law search error: {str(e)}")
            return []
    
    def _build_search_query(
        self,
        query: str,
        court: Optional[str] = None,
        case_type: Optional[str] = None
    ) -> str:
        """Build optimized search query"""
        search_parts = [query]
        
        if court:
            search_parts.append(f"court:{court}")
        if case_type:
            search_parts.append(f"type:{case_type}")
            
        return " ".join(search_parts)
    
    def _parse_response(self, data: Dict, max_results: int) -> List[Dict]:
        """Parse Indian Kanoon API response"""
        cases = []
        docs = data.get('docs', [])[:max_results]
        
        for doc in docs:
            cases.append({
                'title': doc.get('title', 'Untitled Case'),
                'citation': doc.get('citation', ''),
                'court': doc.get('court', ''),
                'date': doc.get('date', ''),
                'excerpt': doc.get('headline', '')[:200] + '...',
                'url': doc.get('link', ''),
                'relevance_score': doc.get('score', 0)
            })
        
        return cases
    
    def _get_mock_cases(
        self,
        query: str,
        max_results: int,
        court: Optional[str] = None
    ) -> List[Dict]:
        """
        Generate mock case law data for demo purposes
        Replace with actual API calls in production
        """
        mock_cases = [
            {
                'title': 'State of Maharashtra v. Ramdas Shrinivas Nayak',
                'citation': 'AIR 1982 SC 1249',
                'court': 'Supreme Court of India',
                'date': '1982-05-14',
                'excerpt': 'This case establishes the principle that mens rea is an essential ingredient of criminal liability unless the statute creating the offence clearly indicates otherwise...',
                'url': 'https://indiankanoon.org/doc/1452309/',
                'relevance_score': 95
            },
            {
                'title': 'Kesavananda Bharati v. State of Kerala',
                'citation': 'AIR 1973 SC 1461',
                'court': 'Supreme Court of India',
                'date': '1973-04-24',
                'excerpt': 'Landmark case that established the basic structure doctrine, holding that Parliament cannot alter the basic structure of the Constitution...',
                'url': 'https://indiankanoon.org/doc/257876/',
                'relevance_score': 90
            },
            {
                'title': 'Maneka Gandhi v. Union of India',
                'citation': 'AIR 1978 SC 597',
                'court': 'Supreme Court of India',
                'date': '1978-01-25',
                'excerpt': 'Expanded the scope of Article 21, holding that right to life includes right to live with human dignity and all that goes along with it...',
                'url': 'https://indiankanoon.org/doc/1766147/',
                'relevance_score': 88
            },
            {
                'title': 'Vishaka v. State of Rajasthan',
                'citation': 'AIR 1997 SC 3011',
                'court': 'Supreme Court of India',
                'date': '1997-08-13',
                'excerpt': 'Established guidelines for prevention of sexual harassment at workplace, recognizing the right to gender equality and work with dignity...',
                'url': 'https://indiankanoon.org/doc/1031794/',
                'relevance_score': 85
            },
            {
                'title': 'M.C. Mehta v. Union of India',
                'citation': 'AIR 1987 SC 1086',
                'court': 'Supreme Court of India',
                'date': '1986-12-20',
                'excerpt': 'Landmark environmental law case that introduced the principle of absolute liability for hazardous industries...',
                'url': 'https://indiankanoon.org/doc/1486949/',
                'relevance_score': 82
            },
            {
                'title': 'Indra Sawhney v. Union of India',
                'citation': 'AIR 1993 SC 477',
                'court': 'Supreme Court of India',
                'date': '1992-11-16',
                'excerpt': 'Upheld the validity of reservation in government jobs for Other Backward Classes (OBCs) with certain conditions and the creamy layer concept...',
                'url': 'https://indiankanoon.org/doc/1363234/',
                'relevance_score': 80
            },
            {
                'title': 'Navtej Singh Johar v. Union of India',
                'citation': 'AIR 2018 SC 4321',
                'court': 'Supreme Court of India',
                'date': '2018-09-06',
                'excerpt': 'Decriminalized consensual homosexual acts by reading down Section 377 IPC, upholding right to equality, dignity and privacy...',
                'url': 'https://indiankanoon.org/doc/168671544/',
                'relevance_score': 78
            },
            {
                'title': 'K.S. Puttaswamy v. Union of India',
                'citation': 'AIR 2017 SC 4161',
                'court': 'Supreme Court of India',
                'date': '2017-08-24',
                'excerpt': 'Recognized the right to privacy as a fundamental right under Article 21 of the Constitution of India...',
                'url': 'https://indiankanoon.org/doc/127517806/',
                'relevance_score': 75
            },
            {
                'title': 'Shreya Singhal v. Union of India',
                'citation': 'AIR 2015 SC 1523',
                'court': 'Supreme Court of India',
                'date': '2015-03-24',
                'excerpt': 'Struck down Section 66A of IT Act as unconstitutional, protecting freedom of speech and expression on the internet...',
                'url': 'https://indiankanoon.org/doc/110813550/',
                'relevance_score': 72
            },
            {
                'title': 'Common Cause v. Union of India',
                'citation': 'AIR 2018 SC 1665',
                'court': 'Supreme Court of India',
                'date': '2018-03-09',
                'excerpt': 'Recognized passive euthanasia and living will, upholding right to die with dignity as part of right to life under Article 21...',
                'url': 'https://indiankanoon.org/doc/141631751/',
                'relevance_score': 70
            }
        ]
        
        # Filter by court if specified
        if court:
            court_lower = court.lower()
            if 'supreme' in court_lower:
                # Already filtered to Supreme Court in mock data
                pass
            else:
                # For demo, just return fewer results
                mock_cases = mock_cases[:5]
        
        return mock_cases[:max_results]
    
    def format_citation(self, case: Dict) -> str:
        """Format case citation in standard format"""
        return f"{case['title']}, {case['citation']}"
    
    def get_case_url(self, case: Dict) -> str:
        """Get Indian Kanoon URL for case"""
        return case.get('url', '')

# Initialize service
case_law_service = CaseLawService()

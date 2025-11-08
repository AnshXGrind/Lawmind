"""
Document Quality Scoring Service
Analyzes petition/draft quality and provides improvement suggestions
"""

import re
from typing import Dict, List, Tuple
from collections import Counter


class QualityScorer:
    """Analyze and score legal document quality"""
    
    def __init__(self):
        # Formal legal terms (good indicators)
        self.formal_terms = [
            "respectfully", "humbly", "hon'ble", "honourable", "learned",
            "aforementioned", "aforesaid", "hereinafter", "pursuant",
            "petitioner", "respondent", "applicant", "covenant",
            "whereas", "hereby", "thereof", "wherein", "therein"
        ]
        
        # Informal/weak terms (should be avoided)
        self.informal_terms = [
            "please", "kindly", "want", "need", "think", "feel",
            "maybe", "perhaps", "basically", "actually", "really"
        ]
        
        # Essential petition components
        self.required_components = [
            ("title", r'(?:IN THE (?:HON\'BLE )?(?:SUPREME COURT|HIGH COURT|DISTRICT COURT))'),
            ("parties", r'(?:PETITIONER|APPLICANT|PLAINTIFF).+(?:VERSUS|V/S|VS\.?).+(?:RESPONDENT|DEFENDANT)'),
            ("prayer", r'(?:PRAYER|IT IS (?:THEREFORE )?(?:HUMBLY )?PRAYED)'),
            ("verification", r'(?:VERIFICATION|VERILY VERIFIED)'),
        ]
    
    async def score_document(self, content: str, document_type: str, case_type: str) -> Dict:
        """
        Score document on multiple dimensions
        Returns comprehensive quality report
        """
        scores = {
            "overall": 0,
            "structure": 0,
            "tone": 0,
            "completeness": 0,
            "legal_references": 0,
            "grammar": 0,
            "breakdown": {},
            "suggestions": [],
            "strengths": [],
            "missing_elements": []
        }
        
        # 1. Structure Score (0-10)
        structure_score, structure_feedback = self._score_structure(content, document_type)
        scores["structure"] = structure_score
        scores["breakdown"]["structure"] = structure_feedback
        
        # 2. Tone Score (0-10)
        tone_score, tone_feedback = self._score_tone(content)
        scores["tone"] = tone_score
        scores["breakdown"]["tone"] = tone_feedback
        
        # 3. Completeness Score (0-10)
        completeness_score, completeness_feedback = self._score_completeness(content, document_type)
        scores["completeness"] = completeness_score
        scores["breakdown"]["completeness"] = completeness_feedback
        
        # 4. Legal References Score (0-10)
        references_score, references_feedback = self._score_legal_references(content)
        scores["legal_references"] = references_score
        scores["breakdown"]["legal_references"] = references_feedback
        
        # 5. Grammar/Language Quality (0-10)
        grammar_score, grammar_feedback = self._score_grammar(content)
        scores["grammar"] = grammar_score
        scores["breakdown"]["grammar"] = grammar_feedback
        
        # Calculate overall score (weighted average)
        scores["overall"] = round(
            (structure_score * 0.25) +
            (tone_score * 0.20) +
            (completeness_score * 0.25) +
            (references_score * 0.20) +
            (grammar_score * 0.10)
        , 1)
        
        # Generate suggestions
        scores["suggestions"] = self._generate_suggestions(scores)
        scores["strengths"] = self._identify_strengths(scores)
        
        return scores
    
    def _score_structure(self, content: str, document_type: str) -> Tuple[int, Dict]:
        """Score document structure and organization"""
        score = 10
        feedback = {
            "has_title": False,
            "has_parties": False,
            "has_prayer": False,
            "has_verification": False,
            "proper_paragraphing": False,
            "word_count": 0,
            "deductions": []
        }
        
        # Check for essential components
        for component, pattern in self.required_components:
            if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
                feedback[f"has_{component}"] = True
            else:
                score -= 2
                feedback["deductions"].append(f"Missing {component}")
        
        # Check paragraphing
        paragraphs = [p for p in content.split('\n\n') if p.strip()]
        if len(paragraphs) >= 3:
            feedback["proper_paragraphing"] = True
        else:
            score -= 1
            feedback["deductions"].append("Insufficient paragraph structure")
        
        # Word count check
        word_count = len(content.split())
        feedback["word_count"] = word_count
        
        if document_type == "petition" and word_count < 500:
            score -= 1
            feedback["deductions"].append("Document may be too brief for a petition")
        
        return max(0, score), feedback
    
    def _score_tone(self, content: str) -> Tuple[int, Dict]:
        """Score legal tone and formality"""
        score = 10
        feedback = {
            "formal_terms_count": 0,
            "informal_terms_count": 0,
            "formality_ratio": 0,
            "deductions": []
        }
        
        content_lower = content.lower()
        
        # Count formal terms
        formal_count = sum(1 for term in self.formal_terms if term in content_lower)
        feedback["formal_terms_count"] = formal_count
        
        # Count informal terms
        informal_count = sum(1 for term in self.informal_terms if term in content_lower)
        feedback["informal_terms_count"] = informal_count
        
        # Calculate formality ratio
        total_indicator_terms = formal_count + informal_count
        if total_indicator_terms > 0:
            feedback["formality_ratio"] = round(formal_count / total_indicator_terms, 2)
        
        # Deductions
        if formal_count < 3:
            score -= 2
            feedback["deductions"].append("Insufficient formal legal terminology")
        
        if informal_count > 2:
            score -= 2
            feedback["deductions"].append(f"Contains {informal_count} informal terms")
        
        # Check for proper honorifics
        if not re.search(r"hon'ble|honourable", content_lower):
            score -= 1
            feedback["deductions"].append("Missing court honorifics")
        
        return max(0, score), feedback
    
    def _score_completeness(self, content: str, document_type: str) -> Tuple[int, Dict]:
        """Score document completeness"""
        score = 10
        feedback = {
            "has_facts": False,
            "has_legal_grounds": False,
            "has_relief": False,
            "has_sections": False,
            "deductions": []
        }
        
        # Facts section
        if re.search(r'(?:FACTS|BRIEF FACTS|FACTUAL BACKGROUND)', content, re.IGNORECASE):
            feedback["has_facts"] = True
        else:
            score -= 3
            feedback["deductions"].append("Missing facts section")
        
        # Legal grounds
        if re.search(r'(?:LEGAL GROUNDS|GROUNDS|SUBMISSIONS|ARGUMENTS)', content, re.IGNORECASE):
            feedback["has_legal_grounds"] = True
        else:
            score -= 2
            feedback["deductions"].append("Missing legal grounds/arguments")
        
        # Relief sought
        if re.search(r'(?:RELIEF|PRAYER|PRAYED|RELIEF SOUGHT)', content, re.IGNORECASE):
            feedback["has_relief"] = True
        else:
            score -= 3
            feedback["deductions"].append("Missing relief/prayer section")
        
        # Legal sections cited
        if re.search(r'(?:Section|Article|Order).+(?:IPC|CrPC|CPC|Constitution)', content, re.IGNORECASE):
            feedback["has_sections"] = True
        else:
            score -= 2
            feedback["deductions"].append("No legal sections cited")
        
        return max(0, score), feedback
    
    def _score_legal_references(self, content: str) -> Tuple[int, Dict]:
        """Score quality and quantity of legal references"""
        score = 10
        feedback = {
            "sections_count": 0,
            "case_citations": 0,
            "acts_referenced": 0,
            "deductions": []
        }
        
        # Count sections
        section_matches = re.findall(
            r'(?:Section|Sec\.|S\.)\s*\d+[A-Z]?(?:\(\d+\))?',
            content,
            re.IGNORECASE
        )
        feedback["sections_count"] = len(section_matches)
        
        # Count case citations
        citation_matches = re.findall(
            r'\(\d{4}\)\s*(?:SCC|SCR|AIR|Cri\.L\.J\.|Mad\.L\.J\.)',
            content
        )
        feedback["case_citations"] = len(citation_matches)
        
        # Count acts referenced
        act_matches = re.findall(
            r'(?:Indian Penal Code|Code of Criminal Procedure|Code of Civil Procedure|Constitution of India|IPC|CrPC|CPC)',
            content,
            re.IGNORECASE
        )
        feedback["acts_referenced"] = len(set(act_matches))
        
        # Scoring
        if feedback["sections_count"] == 0:
            score -= 4
            feedback["deductions"].append("No legal sections cited")
        elif feedback["sections_count"] < 2:
            score -= 2
            feedback["deductions"].append("Very few legal sections cited")
        
        if feedback["case_citations"] == 0:
            score -= 3
            feedback["deductions"].append("No precedent case citations")
        
        if feedback["acts_referenced"] == 0:
            score -= 3
            feedback["deductions"].append("No acts/statutes referenced")
        
        return max(0, score), feedback
    
    def _score_grammar(self, content: str) -> Tuple[int, Dict]:
        """Basic grammar and language quality check"""
        score = 10
        feedback = {
            "sentence_count": 0,
            "avg_sentence_length": 0,
            "potential_issues": [],
            "deductions": []
        }
        
        # Count sentences
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        feedback["sentence_count"] = len(sentences)
        
        # Average sentence length
        if sentences:
            avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
            feedback["avg_sentence_length"] = round(avg_length, 1)
            
            # Very long sentences can be confusing
            if avg_length > 40:
                score -= 1
                feedback["potential_issues"].append("Very long average sentence length")
        
        # Check for common errors
        if re.search(r'\s{3,}', content):
            feedback["potential_issues"].append("Excessive whitespace detected")
        
        if re.search(r'[a-z]\.[A-Z]', content):
            score -= 1
            feedback["potential_issues"].append("Missing space after period")
        
        # Check capitalization
        if not re.search(r'^[A-Z]', content.strip()):
            score -= 1
            feedback["potential_issues"].append("Document should start with capital letter")
        
        return max(0, score), feedback
    
    def _generate_suggestions(self, scores: Dict) -> List[str]:
        """Generate actionable improvement suggestions"""
        suggestions = []
        
        # Structure suggestions
        if scores["structure"] < 7:
            if not scores["breakdown"]["structure"].get("has_title"):
                suggestions.append("Add proper court heading (e.g., 'IN THE HON'BLE HIGH COURT OF...')")
            if not scores["breakdown"]["structure"].get("has_prayer"):
                suggestions.append("Include a clear PRAYER section stating what relief you seek")
            if not scores["breakdown"]["structure"].get("has_verification"):
                suggestions.append("Add VERIFICATION clause at the end")
        
        # Tone suggestions
        if scores["tone"] < 7:
            if scores["breakdown"]["tone"]["formal_terms_count"] < 3:
                suggestions.append("Use more formal legal terminology (e.g., 'respectfully submitted', 'learned counsel')")
            if scores["breakdown"]["tone"]["informal_terms_count"] > 2:
                suggestions.append("Replace informal language with formal legal expressions")
        
        # Completeness suggestions
        if scores["completeness"] < 7:
            if not scores["breakdown"]["completeness"].get("has_facts"):
                suggestions.append("Add a FACTS section outlining the case background")
            if not scores["breakdown"]["completeness"].get("has_legal_grounds"):
                suggestions.append("Include LEGAL GROUNDS section with your arguments")
        
        # Legal references suggestions
        if scores["legal_references"] < 7:
            if scores["breakdown"]["legal_references"]["sections_count"] < 2:
                suggestions.append("Cite relevant legal sections (IPC, CrPC, CPC, etc.) to strengthen arguments")
            if scores["breakdown"]["legal_references"]["case_citations"] == 0:
                suggestions.append("Add precedent case citations to support your position")
        
        # Grammar suggestions
        if scores["grammar"] < 8:
            for issue in scores["breakdown"]["grammar"]["potential_issues"]:
                suggestions.append(f"Fix: {issue}")
        
        return suggestions
    
    def _identify_strengths(self, scores: Dict) -> List[str]:
        """Identify strong points in the document"""
        strengths = []
        
        if scores["structure"] >= 9:
            strengths.append("Excellent document structure and organization")
        
        if scores["tone"] >= 9:
            strengths.append("Professional legal tone maintained throughout")
        
        if scores["completeness"] >= 9:
            strengths.append("Comprehensive coverage of all essential elements")
        
        if scores["legal_references"] >= 8:
            refs = scores["breakdown"]["legal_references"]
            if refs["case_citations"] > 0:
                strengths.append(f"Good use of precedent citations ({refs['case_citations']} cases cited)")
            if refs["sections_count"] >= 3:
                strengths.append(f"Well-supported with legal sections ({refs['sections_count']} sections)")
        
        if scores["grammar"] >= 9:
            strengths.append("Clean, well-written language")
        
        return strengths


# Singleton instance
quality_scorer = QualityScorer()

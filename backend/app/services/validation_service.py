"""
Smart Missing Info Detector
Detects missing information and generates intelligent follow-up questions
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


class MissingFieldAnalysis(BaseModel):
    field_name: str
    question: str
    priority: str  # "high", "medium", "low"
    suggestions: List[str] = []


class ValidationService:
    """Detect missing information and suggest follow-ups"""
    
    def __init__(self):
        # Required fields by document type
        self.required_fields = {
            "petition": {
                "high": ["title", "case_type", "court", "facts", "relief_sought"],
                "medium": ["parties", "sections"],
                "low": ["tone", "citations"]
            },
            "notice": {
                "high": ["title", "facts", "parties"],
                "medium": ["relief_sought", "sections"],
                "low": ["tone"]
            },
            "affidavit": {
                "high": ["title", "facts", "parties"],
                "medium": ["verification_details"],
                "low": []
            },
            "bail_application": {
                "high": ["case_type", "fir_number", "sections", "facts", "accused_details"],
                "medium": ["previous_bail_applications", "surety_details"],
                "low": ["medical_condition", "family_circumstances"]
            }
        }
    
    async def detect_missing_info(
        self,
        document_type: str,
        provided_data: Dict
    ) -> List[MissingFieldAnalysis]:
        """
        Analyze provided data and detect missing critical information
        Returns list of missing fields with intelligent questions
        """
        missing_fields = []
        
        # Get required fields for this document type
        doc_requirements = self.required_fields.get(document_type, self.required_fields["petition"])
        
        # Check high priority fields
        for field in doc_requirements["high"]:
            if not provided_data.get(field) or provided_data[field] == "":
                question, suggestions = self._generate_question(field, document_type, provided_data)
                missing_fields.append(MissingFieldAnalysis(
                    field_name=field,
                    question=question,
                    priority="high",
                    suggestions=suggestions
                ))
        
        # Check medium priority fields
        for field in doc_requirements["medium"]:
            if not provided_data.get(field) or provided_data[field] == "":
                question, suggestions = self._generate_question(field, document_type, provided_data)
                missing_fields.append(MissingFieldAnalysis(
                    field_name=field,
                    question=question,
                    priority="medium",
                    suggestions=suggestions
                ))
        
        # Context-based intelligent detection
        contextual_missing = self._detect_contextual_missing(document_type, provided_data)
        missing_fields.extend(contextual_missing)
        
        return missing_fields
    
    def _generate_question(
        self,
        field: str,
        document_type: str,
        context: Dict
    ) -> tuple[str, List[str]]:
        """Generate intelligent follow-up question for missing field"""
        
        questions = {
            "title": (
                "What is the title or subject of this case/document?",
                ["E.g., 'Bail Application in FIR No. 123/2024'", "E.g., 'Petition for Divorce'"]
            ),
            "case_type": (
                "What type of case is this?",
                ["Civil", "Criminal", "Family", "Corporate", "Constitutional"]
            ),
            "court": (
                "Which court will this be filed in?",
                ["District Court", "High Court", "Supreme Court", "Tribunal"]
            ),
            "facts": (
                "Can you provide the facts or background of the case?",
                ["Describe what happened, when, where, and who was involved"]
            ),
            "relief_sought": (
                "What relief or remedy are you seeking from the court?",
                ["E.g., 'Grant bail to the accused'", "E.g., 'Direct the respondent to pay damages'"]
            ),
            "parties": (
                "Who are the parties involved?",
                ["Petitioner/Applicant name", "Respondent/Defendant name"]
            ),
            "sections": (
                "Which legal sections or acts are relevant to this case?",
                ["E.g., 'Section 420 IPC'", "E.g., 'Section 138 Negotiable Instruments Act'"]
            ),
            "fir_number": (
                "What is the FIR number?",
                ["Format: FIR No. XXX/YYYY"]
            ),
            "accused_details": (
                "Please provide accused person's details",
                ["Name, age, address, occupation"]
            ),
            "previous_bail_applications": (
                "Have you filed any previous bail applications in this case?",
                ["If yes, please provide details and outcome"]
            ),
            "verification_details": (
                "Who will verify this affidavit?",
                ["Name and designation of the deponent"]
            )
        }
        
        return questions.get(field, (f"Please provide {field.replace('_', ' ')}", []))
    
    def _detect_contextual_missing(
        self,
        document_type: str,
        provided_data: Dict
    ) -> List[MissingFieldAnalysis]:
        """Detect missing info based on context and provided data"""
        contextual_missing = []
        
        # If criminal case but no sections mentioned
        if provided_data.get("case_type") == "criminal":
            if not provided_data.get("sections") or len(provided_data.get("sections", [])) == 0:
                contextual_missing.append(MissingFieldAnalysis(
                    field_name="sections",
                    question="This is a criminal case. Which IPC/CrPC sections are involved?",
                    priority="high",
                    suggestions=["Common sections: 302 (Murder), 420 (Cheating), 376 (Rape), 498A (Dowry harassment)"]
                ))
            
            # If criminal petition but no FIR mentioned
            facts = provided_data.get("facts", "").lower()
            if "fir" not in facts and not provided_data.get("fir_number"):
                contextual_missing.append(MissingFieldAnalysis(
                    field_name="fir_number",
                    question="Is there an FIR registered in this case? If yes, what's the FIR number?",
                    priority="medium",
                    suggestions=["FIR No. format: XXX/YYYY at PS (Police Station name)"]
                ))
        
        # If petition but no court mentioned
        if document_type == "petition" and not provided_data.get("court"):
            contextual_missing.append(MissingFieldAnalysis(
                field_name="court",
                question="Which court do you plan to file this petition in?",
                priority="high",
                suggestions=["District Court (for local matters)", "High Court (for constitutional/writ petitions)", "Supreme Court (for appeals)"]
            ))
        
        # If bail application specific checks
        if "bail" in document_type.lower() or (provided_data.get("relief_sought") and "bail" in provided_data["relief_sought"].lower()):
            if not provided_data.get("accused_details"):
                contextual_missing.append(MissingFieldAnalysis(
                    field_name="accused_details",
                    question="Please provide details of the accused person",
                    priority="high",
                    suggestions=["Name, age, address, occupation, family status"]
                ))
            
            # Check for grounds for bail
            if not provided_data.get("bail_grounds"):
                contextual_missing.append(MissingFieldAnalysis(
                    field_name="bail_grounds",
                    question="What are the grounds for granting bail?",
                    priority="high",
                    suggestions=[
                        "First-time offender",
                        "Cooperating with investigation",
                        "No flight risk",
                        "Medical condition",
                        "Sole breadwinner of family"
                    ]
                ))
        
        # If civil case, check for cause of action
        if provided_data.get("case_type") == "civil":
            facts = provided_data.get("facts", "").lower()
            if len(facts) < 100:  # Very brief facts
                contextual_missing.append(MissingFieldAnalysis(
                    field_name="detailed_facts",
                    question="The facts seem brief. Can you provide more details about the cause of action?",
                    priority="medium",
                    suggestions=["When did the dispute arise?", "What is the financial value involved?", "What attempts were made to resolve the dispute?"]
                ))
        
        # If parties mentioned but incomplete
        parties = provided_data.get("parties", {})
        if parties:
            if not parties.get("petitioner") and not parties.get("applicant"):
                contextual_missing.append(MissingFieldAnalysis(
                    field_name="petitioner_name",
                    question="Who is the petitioner/applicant in this case?",
                    priority="high",
                    suggestions=["Full name as it should appear in court records"]
                ))
            
            if not parties.get("respondent") and not parties.get("defendant"):
                contextual_missing.append(MissingFieldAnalysis(
                    field_name="respondent_name",
                    question="Who is the respondent/defendant?",
                    priority="high",
                    suggestions=["Full name and address if known"]
                ))
        
        return contextual_missing
    
    async def generate_interactive_prompts(
        self,
        missing_fields: List[MissingFieldAnalysis]
    ) -> List[str]:
        """
        Generate conversational follow-up prompts
        Like a junior lawyer assistant
        """
        prompts = []
        
        if not missing_fields:
            return ["Great! All essential information is provided. Proceeding with draft generation."]
        
        # Sort by priority
        high_priority = [f for f in missing_fields if f.priority == "high"]
        medium_priority = [f for f in missing_fields if f.priority == "medium"]
        
        if high_priority:
            prompts.append("I noticed some important information is missing:")
            for field in high_priority[:3]:  # Top 3 high priority
                prompts.append(f"• {field.question}")
                if field.suggestions:
                    prompts.append(f"  💡 {field.suggestions[0]}")
        
        if medium_priority and len(high_priority) < 3:
            prompts.append("\nAdditionally, it would help to know:")
            for field in medium_priority[:2]:  # Top 2 medium priority
                prompts.append(f"• {field.question}")
        
        return prompts


# Singleton instance
validation_service = ValidationService()

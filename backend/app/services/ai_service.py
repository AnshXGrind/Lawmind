"""
AI Service for Legal Document Generation using LLMs
"""

from typing import List, Dict, Optional
from app.core.config import settings
from app.models.schemas import DraftRequest, CaseType, DocumentType, CourtLevel

class LegalDraftingAI:
    """AI service for generating legal documents"""
    
    def __init__(self):
        """Initialize LLM and prompt templates"""
        # Lazy import to avoid loading heavy dependencies on startup
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import ChatPromptTemplate
        
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.LLM_MAX_TOKENS,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.draft_template = self._create_draft_template()
    
    def _create_draft_template(self):
        """Create prompt template for legal drafting"""
        from langchain_core.prompts import ChatPromptTemplate
        
        system_message = """You are LawMind, a professional Indian legal drafting assistant with expertise in Indian law.
You generate legally formatted documents that follow proper court procedures and formatting standards.
Your drafts are precise, professionally structured, and include relevant legal references."""

        human_message = """Generate a legally formatted {document_type} for {court} with the following details:

**Case Type:** {case_type}
**Title:** {title}

**Parties Involved:**
{parties}

**Facts of the Case:**
{facts}

**Applicable Legal Provisions:**
{sections}

**Relief Sought:**
{relief_sought}

**Tone Required:** {tone}

**Additional Context:**
{additional_context}

Please generate a complete, professionally formatted {document_type} following Indian legal standards. Include:
1. Proper heading and case title
2. Parties designation
3. Factual background
4. Legal arguments with section references
5. Relief/Prayer section
6. Verification clause (if applicable)

Ensure the language is {tone}, legally precise, and follows court formatting conventions."""

        return ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", human_message)
        ])
    
    def generate_draft(self, request: DraftRequest) -> str:
        """Generate legal draft based on request"""
        
        # Format parties
        parties_text = "\n".join([f"{role}: {name}" for role, name in request.parties.items()])
        if not parties_text:
            parties_text = "To be filled"
        
        # Format sections
        sections_text = ", ".join(request.sections) if request.sections else "To be determined"
        
        # Generate draft using the template
        messages = self.draft_template.format_messages(
            document_type=request.document_type.value,
            case_type=request.case_type.value,
            court=request.court.value.replace("_", " ").title(),
            title=request.title,
            parties=parties_text,
            facts=request.facts,
            sections=sections_text,
            relief_sought=request.relief_sought or "To be specified",
            tone=request.tone.value,
            additional_context=request.additional_context or "None provided"
        )
        
        result = self.llm.invoke(messages)
        return result.content
    
    def explain_section(self, text: str) -> str:
        """Explain a specific section of legal text"""
        prompt_text = f"""As a legal expert, explain the following legal text in simple, clear language:

Text: {text}

Provide a concise explanation that a non-lawyer could understand, while maintaining legal accuracy."""
        
        result = self.llm.invoke(prompt_text)
        return result.content
    
    def simplify_tone(self, text: str) -> str:
        """Simplify legal text while maintaining meaning"""
        prompt_text = f"""Rewrite the following legal text in simpler, more accessible language while maintaining legal accuracy:

Original: {text}

Simplified version:"""
        
        result = self.llm.invoke(prompt_text)
        return result.content
    
    def rephrase_legally(self, text: str, context: str = "") -> str:
        """Rephrase text in more formal legal language"""
        prompt_text = f"""Rephrase the following text in formal, professional legal language suitable for court documents:

Text: {text}
Context: {context}

Legally rephrased version:"""
        
        result = self.llm.invoke(prompt_text)
        return result.content
    
    def suggest_improvements(self, draft: str) -> List[str]:
        """Suggest improvements for a legal draft"""
        prompt_text = f"""Review the following legal draft and suggest 3-5 specific improvements:

Draft:
{draft}

Provide numbered suggestions for improvement:"""
        
        result = self.llm.invoke(prompt_text)
        
        # Parse suggestions (assuming they're numbered)
        suggestions = [s.strip() for s in result.content.split("\n") if s.strip() and s.strip()[0].isdigit()]
        return suggestions
    
    def suggest_legal_sections(self, document_type: str, case_type: str, facts: str = "") -> List[Dict[str, str]]:
        """Suggest applicable legal sections based on case details"""
        
        # Predefined section database for common cases
        section_database = {
            "civil": {
                "petition": [
                    {"section": "Order VII Rule 11 CPC", "description": "Rejection of plaint", "act": "Code of Civil Procedure, 1908"},
                    {"section": "Section 9 CPC", "description": "Courts to try all civil suits", "act": "Code of Civil Procedure, 1908"},
                    {"section": "Order I Rule 10 CPC", "description": "Procedure where one of several plaintiffs fails to appear", "act": "Code of Civil Procedure, 1908"},
                    {"section": "Section 141 CPC", "description": "Arrest and detention", "act": "Code of Civil Procedure, 1908"},
                ],
                "contract": [
                    {"section": "Section 10 Contract Act", "description": "What agreements are contracts", "act": "Indian Contract Act, 1872"},
                    {"section": "Section 73 Contract Act", "description": "Compensation for loss or damage caused by breach", "act": "Indian Contract Act, 1872"},
                    {"section": "Section 75 Contract Act", "description": "Party rightfully rescinding contract, entitled to compensation", "act": "Indian Contract Act, 1872"},
                ],
                "property": [
                    {"section": "Section 54 Transfer of Property Act", "description": "Sale defined", "act": "Transfer of Property Act, 1882"},
                    {"section": "Section 17 Registration Act", "description": "Documents of which registration is compulsory", "act": "Registration Act, 1908"},
                    {"section": "Section 53A Transfer of Property Act", "description": "Part performance", "act": "Transfer of Property Act, 1882"},
                ]
            },
            "criminal": {
                "petition": [
                    {"section": "Section 438 CrPC", "description": "Direction for grant of bail (Anticipatory Bail)", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 482 CrPC", "description": "Saving of inherent powers of High Court", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 154 CrPC", "description": "Information in cognizable cases (FIR)", "act": "Code of Criminal Procedure, 1973"},
                ],
                "bail": [
                    {"section": "Section 437 CrPC", "description": "When bail may be taken in case of non-bailable offence", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 439 CrPC", "description": "Special powers of High Court or Court of Session regarding bail", "act": "Code of Criminal Procedure, 1973"},
                ],
                "appeal": [
                    {"section": "Section 374 CrPC", "description": "Appeals from convictions", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 378 CrPC", "description": "Appeal in case of acquittal", "act": "Code of Criminal Procedure, 1973"},
                ]
            },
            "corporate": {
                "agreement": [
                    {"section": "Section 2(20) Companies Act", "description": "Definition of Company", "act": "Companies Act, 2013"},
                    {"section": "Section 230 Companies Act", "description": "Power to compromise or make arrangements with creditors and members", "act": "Companies Act, 2013"},
                ],
                "petition": [
                    {"section": "Section 241 Companies Act", "description": "Application to Tribunal for relief in cases of oppression", "act": "Companies Act, 2013"},
                    {"section": "Section 244 Companies Act", "description": "Application by Central Government for relief in cases of oppression", "act": "Companies Act, 2013"},
                ]
            },
            "family": {
                "petition": [
                    {"section": "Section 13 Hindu Marriage Act", "description": "Divorce", "act": "Hindu Marriage Act, 1955"},
                    {"section": "Section 24 Hindu Marriage Act", "description": "Maintenance pendente lite and expenses of proceedings", "act": "Hindu Marriage Act, 1955"},
                    {"section": "Section 125 CrPC", "description": "Order for maintenance of wives, children and parents", "act": "Code of Criminal Procedure, 1973"},
                ],
                "divorce": [
                    {"section": "Section 13 Hindu Marriage Act", "description": "Divorce", "act": "Hindu Marriage Act, 1955"},
                    {"section": "Section 13B Hindu Marriage Act", "description": "Divorce by mutual consent", "act": "Hindu Marriage Act, 1955"},
                ]
            },
            "labour": {
                "petition": [
                    {"section": "Section 2(s) Industrial Disputes Act", "description": "Definition of workman", "act": "Industrial Disputes Act, 1947"},
                    {"section": "Section 25F Industrial Disputes Act", "description": "Conditions precedent to retrenchment", "act": "Industrial Disputes Act, 1947"},
                    {"section": "Section 11A Industrial Disputes Act", "description": "Jurisdiction of Labour Courts", "act": "Industrial Disputes Act, 1947"},
                ]
            },
            "constitutional": {
                "petition": [
                    {"section": "Article 32 Constitution", "description": "Remedies for enforcement of fundamental rights", "act": "Constitution of India"},
                    {"section": "Article 226 Constitution", "description": "Power of High Courts to issue writs", "act": "Constitution of India"},
                    {"section": "Article 14 Constitution", "description": "Equality before law", "act": "Constitution of India"},
                    {"section": "Article 21 Constitution", "description": "Protection of life and personal liberty", "act": "Constitution of India"},
                ]
            }
        }
        
        # Get relevant sections from database
        suggestions = []
        
        if case_type in section_database:
            if document_type in section_database[case_type]:
                suggestions = section_database[case_type][document_type]
            else:
                # Get the first available document type for this case type
                first_doc_type = list(section_database[case_type].keys())[0]
                suggestions = section_database[case_type][first_doc_type]
        
        # If we have facts, we could use AI to suggest more specific sections
        # For now, return the predefined suggestions
        
        return suggestions[:10]  # Return top 10 suggestions

# Lazy singleton instance
_legal_ai_instance = None

def get_legal_ai():
    """Get or create the legal AI singleton instance"""
    global _legal_ai_instance
    if _legal_ai_instance is None:
        _legal_ai_instance = LegalDraftingAI()
    return _legal_ai_instance

# For backward compatibility
class LazyLegalAI:
    def __getattr__(self, name):
        return getattr(get_legal_ai(), name)

legal_ai = LazyLegalAI()

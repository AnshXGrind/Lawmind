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
        from langchain.prompts import ChatPromptTemplate
        
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.LLM_MAX_TOKENS,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.draft_template = self._create_draft_template()
    
    def _create_draft_template(self):
        """Create prompt template for legal drafting"""
        from langchain.prompts import ChatPromptTemplate
        
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
        
        # Create chain
        chain = LLMChain(llm=self.llm, prompt=self.draft_template)
        
        # Generate draft
        result = chain.run(
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
        
        return result
    
    def explain_section(self, text: str) -> str:
        """Explain a specific section of legal text"""
        prompt = PromptTemplate(
            input_variables=["text"],
            template="""As a legal expert, explain the following legal text in simple, clear language:

Text: {text}

Provide a concise explanation that a non-lawyer could understand, while maintaining legal accuracy."""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        return chain.run(text=text)
    
    def simplify_tone(self, text: str) -> str:
        """Simplify legal text while maintaining meaning"""
        prompt = PromptTemplate(
            input_variables=["text"],
            template="""Rewrite the following legal text in simpler, more accessible language while maintaining legal accuracy:

Original: {text}

Simplified version:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        return chain.run(text=text)
    
    def rephrase_legally(self, text: str, context: str = "") -> str:
        """Rephrase text in more formal legal language"""
        prompt = PromptTemplate(
            input_variables=["text", "context"],
            template="""Rephrase the following text in formal, professional legal language suitable for court documents:

Text: {text}
Context: {context}

Legally rephrased version:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        return chain.run(text=text, context=context)
    
    def suggest_improvements(self, draft: str) -> List[str]:
        """Suggest improvements for a legal draft"""
        prompt = PromptTemplate(
            input_variables=["draft"],
            template="""Review the following legal draft and suggest 3-5 specific improvements:

Draft:
{draft}

Provide numbered suggestions for improvement:"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = chain.run(draft=draft)
        
        # Parse suggestions (assuming they're numbered)
        suggestions = [s.strip() for s in result.split("\n") if s.strip() and s.strip()[0].isdigit()]
        return suggestions

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

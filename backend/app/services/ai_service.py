"""
AI Service for Legal Document Generation using Google Gemini
"""

import os
from typing import List, Dict, Optional
import google.generativeai as genai
from app.core.config import settings
from app.models.schemas import DraftRequest, CaseType, DocumentType, CourtLevel

# Configure Gemini with API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

_SYSTEM_PROMPT = """You are LawMind, a professional Indian legal drafting assistant with deep expertise in Indian law.
You generate legally formatted documents that follow proper court procedures and formatting standards.
Your drafts are precise, professionally structured, and include relevant legal references to the IPC, CrPC, CPC,
and other applicable Indian statutes. Always use formal legal language unless asked otherwise."""


class LegalDraftingAI:
    """AI service for generating legal documents via Google Gemini"""

    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=_SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(
                temperature=getattr(settings, "LLM_TEMPERATURE", 0.3),
                max_output_tokens=getattr(settings, "LLM_MAX_TOKENS", 2000),
            ),
        )

    def _generate(self, prompt: str) -> str:
        """Internal helper — call Gemini and return text."""
        response = self.model.generate_content(prompt)
        return response.text

    def generate_draft(self, request: DraftRequest) -> str:
        """Generate a full legal draft based on the request."""
        parties_text = "\n".join(
            [f"{role}: {name}" for role, name in request.parties.items()]
        ) or "To be filled"
        sections_text = (
            ", ".join(request.sections) if request.sections else "To be determined"
        )

        prompt = f"""Generate a legally formatted {request.document_type.value} for {request.court.value.replace("_", " ").title()} with the following details:

**Case Type:** {request.case_type.value}
**Title:** {request.title}

**Parties Involved:**
{parties_text}

**Facts of the Case:**
{request.facts}

**Applicable Legal Provisions:**
{sections_text}

**Relief Sought:**
{request.relief_sought or "To be specified"}

**Tone Required:** {request.tone.value}

**Additional Context:**
{request.additional_context or "None provided"}

Please generate a complete, professionally formatted {request.document_type.value} following Indian legal standards. Include:
1. Proper heading and case title
2. Parties designation
3. Factual background
4. Legal arguments with section references
5. Relief/Prayer section
6. Verification clause (if applicable)

Ensure the language is {request.tone.value}, legally precise, and follows court formatting conventions."""

        return self._generate(prompt)

    def explain_section(self, text: str) -> str:
        """Explain a legal text section in plain language."""
        prompt = f"""As a legal expert, explain the following legal text in simple, clear language:

Text: {text}

Provide a concise explanation that a non-lawyer could understand, while maintaining legal accuracy."""
        return self._generate(prompt)

    def simplify_tone(self, text: str) -> str:
        """Simplify legal text while maintaining meaning."""
        prompt = f"""Rewrite the following legal text in simpler, more accessible language while maintaining legal accuracy:

Original: {text}

Simplified version:"""
        return self._generate(prompt)

    def rephrase_legally(self, text: str, context: str = "") -> str:
        """Rephrase text in more formal legal language."""
        prompt = f"""Rephrase the following text in formal, professional legal language suitable for Indian court documents:

Text: {text}
Context: {context}

Legally rephrased version:"""
        return self._generate(prompt)

    def suggest_improvements(self, draft: str) -> List[str]:
        """Suggest improvements for a legal draft."""
        prompt = f"""Review the following legal draft and suggest 3-5 specific improvements:

Draft:
{draft}

Provide numbered suggestions for improvement:"""
        result = self._generate(prompt)
        suggestions = [
            s.strip()
            for s in result.split("\n")
            if s.strip() and s.strip()[0].isdigit()
        ]
        return suggestions

    def suggest_legal_sections(
        self, document_type: str, case_type: str, facts: str = ""
    ) -> List[Dict[str, str]]:
        """Suggest applicable legal sections based on case details."""
        section_database = {
            "civil": {
                "petition": [
                    {"section": "Order VII Rule 11 CPC", "description": "Rejection of plaint", "act": "Code of Civil Procedure, 1908"},
                    {"section": "Section 9 CPC", "description": "Courts to try all civil suits", "act": "Code of Civil Procedure, 1908"},
                    {"section": "Order I Rule 10 CPC", "description": "Procedure for impleadment of parties", "act": "Code of Civil Procedure, 1908"},
                ],
                "contract": [
                    {"section": "Section 10 Contract Act", "description": "What agreements are contracts", "act": "Indian Contract Act, 1872"},
                    {"section": "Section 73 Contract Act", "description": "Compensation for breach", "act": "Indian Contract Act, 1872"},
                    {"section": "Section 75 Contract Act", "description": "Compensation on rescission", "act": "Indian Contract Act, 1872"},
                ],
                "property": [
                    {"section": "Section 54 Transfer of Property Act", "description": "Sale defined", "act": "Transfer of Property Act, 1882"},
                    {"section": "Section 17 Registration Act", "description": "Compulsory registration", "act": "Registration Act, 1908"},
                ],
            },
            "criminal": {
                "petition": [
                    {"section": "Section 438 CrPC", "description": "Anticipatory Bail", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 482 CrPC", "description": "Inherent powers of High Court", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 154 CrPC", "description": "FIR in cognizable cases", "act": "Code of Criminal Procedure, 1973"},
                ],
                "bail": [
                    {"section": "Section 437 CrPC", "description": "Bail in non-bailable offences", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 439 CrPC", "description": "Special powers of High Court - bail", "act": "Code of Criminal Procedure, 1973"},
                ],
                "appeal": [
                    {"section": "Section 374 CrPC", "description": "Appeals from convictions", "act": "Code of Criminal Procedure, 1973"},
                    {"section": "Section 378 CrPC", "description": "Appeal in acquittal", "act": "Code of Criminal Procedure, 1973"},
                ],
            },
            "corporate": {
                "agreement": [
                    {"section": "Section 2(20) Companies Act", "description": "Definition of Company", "act": "Companies Act, 2013"},
                    {"section": "Section 230 Companies Act", "description": "Compromise arrangements", "act": "Companies Act, 2013"},
                ],
                "petition": [
                    {"section": "Section 241 Companies Act", "description": "Relief in cases of oppression", "act": "Companies Act, 2013"},
                ],
            },
            "family": {
                "petition": [
                    {"section": "Section 13 Hindu Marriage Act", "description": "Divorce", "act": "Hindu Marriage Act, 1955"},
                    {"section": "Section 24 Hindu Marriage Act", "description": "Maintenance pendente lite", "act": "Hindu Marriage Act, 1955"},
                    {"section": "Section 125 CrPC", "description": "Maintenance of wives, children, parents", "act": "Code of Criminal Procedure, 1973"},
                ],
                "divorce": [
                    {"section": "Section 13 Hindu Marriage Act", "description": "Divorce", "act": "Hindu Marriage Act, 1955"},
                    {"section": "Section 13B Hindu Marriage Act", "description": "Divorce by mutual consent", "act": "Hindu Marriage Act, 1955"},
                ],
            },
            "labour": {
                "petition": [
                    {"section": "Section 2(s) Industrial Disputes Act", "description": "Definition of workman", "act": "Industrial Disputes Act, 1947"},
                    {"section": "Section 25F Industrial Disputes Act", "description": "Conditions for retrenchment", "act": "Industrial Disputes Act, 1947"},
                ],
            },
            "constitutional": {
                "petition": [
                    {"section": "Article 32 Constitution", "description": "Remedies for fundamental rights", "act": "Constitution of India"},
                    {"section": "Article 226 Constitution", "description": "Power to issue writs - High Courts", "act": "Constitution of India"},
                    {"section": "Article 14 Constitution", "description": "Equality before law", "act": "Constitution of India"},
                    {"section": "Article 21 Constitution", "description": "Right to life and personal liberty", "act": "Constitution of India"},
                ],
            },
        }

        suggestions = []
        if case_type in section_database:
            doc_sections = section_database[case_type]
            if document_type in doc_sections:
                suggestions = doc_sections[document_type]
            else:
                suggestions = list(doc_sections.values())[0]

        return suggestions[:10]


# ---------------------------------------------------------------------------
# Singleton helpers
# ---------------------------------------------------------------------------

_legal_ai_instance = None


def get_legal_ai() -> LegalDraftingAI:
    global _legal_ai_instance
    if _legal_ai_instance is None:
        _legal_ai_instance = LegalDraftingAI()
    return _legal_ai_instance


class LazyLegalAI:
    def __getattr__(self, name):
        return getattr(get_legal_ai(), name)


legal_ai = LazyLegalAI()

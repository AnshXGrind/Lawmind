"""AI Service - Google Gemini (lazy init)"""

import os, logging
from typing import List, Dict
import google.generativeai as genai
from app.core.config import settings
from app.models.schemas import DraftRequest

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are LawMind, a senior Indian legal drafting expert with 20+ years of court experience.
Expertise: IPC, CrPC, CPC, Indian Evidence Act, Constitution, Hindu Marriage Act, Companies Act 2013, Contract Act 1872.
ALWAYS:
- Use proper Indian court headings (IN THE HON'BLE HIGH COURT OF...)
- Number all paragraphs
- Include PRAYER / RELIEF SOUGHT section
- Add VERIFICATION clause
- Use formal language: "It is respectfully submitted...", "The Hon'ble Court may be pleased to..."
- Produce COMPLETE documents, not outlines."""


class LegalDraftingAI:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            if not key:
                raise ValueError("GEMINI_API_KEY is not set. Add it to Replit Secrets.")
            genai.configure(api_key=key)
            self._model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=_SYSTEM_PROMPT,
                generation_config=genai.GenerationConfig(
                    temperature=0.2, max_output_tokens=4096
                ),
            )
        return self._model

    def _generate(self, prompt: str) -> str:
        try:
            return self.model.generate_content(prompt).text
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            raise ValueError(f"AI generation failed: {e}")

    def generate_draft(self, request: DraftRequest) -> str:
        parties = "\n".join(f"{r.upper()}: {n}" for r, n in request.parties.items()) or "Parties: TBD"
        sections = ", ".join(request.sections) if request.sections else "To be determined"
        return self._generate(f"""Draft a COMPLETE, court-ready {request.document_type.value.upper()} for {request.court}.

PARTIES: {parties}
CASE TYPE: {request.case_type.value.upper()}
TITLE: {request.title}
FACTS: {request.facts}
LEGAL PROVISIONS: {sections}
RELIEF SOUGHT: {request.relief_sought or "Appropriate relief as the court deems fit"}
TONE: {request.tone.value}
{f"CONTEXT: {request.additional_context}" if request.additional_context else ""}

Generate ALL sections:
1. COURT HEADING  2. PARTIES BLOCK  3. INTRODUCTION
4. FACTS (min 5 numbered paragraphs)
5. GROUNDS (min 5 numbered with section references)
6. PRAYER (numbered specific reliefs)
7. VERIFICATION CLAUSE  8. Counsel signature block
This must be ready to file in court.""")

    def explain_section(self, text: str) -> str:
        return self._generate(f"Explain this legal text in plain English (under 150 words):\n\n{text}")

    def simplify_tone(self, text: str) -> str:
        return self._generate(f"Simplify this legal text while keeping accuracy:\n\n{text}")

    def rephrase_legally(self, text: str, context: str = "") -> str:
        return self._generate(f"Rephrase in formal Indian legal language:\n\nText: {text}\nContext: {context}")

    def suggest_improvements(self, draft: str) -> List[str]:
        result = self._generate(f"Give 5 numbered improvement suggestions for this draft:\n\n{draft[:2000]}")
        return [s.strip() for s in result.split("\n") if s.strip() and s.strip()[0].isdigit()][:5]

    def suggest_legal_sections(self, document_type: str, case_type: str, facts: str = "") -> List[Dict]:
        db = {
            "criminal": {
                "petition": [
                    {"section": "Section 438 CrPC", "description": "Anticipatory Bail", "act": "CrPC 1973"},
                    {"section": "Section 482 CrPC", "description": "Inherent powers of High Court", "act": "CrPC 1973"},
                    {"section": "Section 154 CrPC", "description": "FIR registration", "act": "CrPC 1973"},
                ],
                "bail": [
                    {"section": "Section 437 CrPC", "description": "Bail in non-bailable offences", "act": "CrPC 1973"},
                    {"section": "Section 439 CrPC", "description": "High Court bail powers", "act": "CrPC 1973"},
                ],
            },
            "civil": {
                "petition": [
                    {"section": "Section 9 CPC", "description": "Courts to try all civil suits", "act": "CPC 1908"},
                    {"section": "Order VII Rule 11", "description": "Rejection of plaint", "act": "CPC 1908"},
                ],
                "contract": [
                    {"section": "Section 10 Contract Act", "description": "Valid contracts", "act": "Contract Act 1872"},
                    {"section": "Section 73 Contract Act", "description": "Compensation for breach", "act": "Contract Act 1872"},
                ],
            },
            "constitutional": {
                "petition": [
                    {"section": "Article 32", "description": "Writ jurisdiction - Supreme Court", "act": "Constitution of India"},
                    {"section": "Article 226", "description": "Writ jurisdiction - High Courts", "act": "Constitution of India"},
                    {"section": "Article 21", "description": "Right to life and liberty", "act": "Constitution of India"},
                ],
            },
            "family": {
                "petition": [
                    {"section": "Section 13 HMA", "description": "Divorce", "act": "Hindu Marriage Act 1955"},
                    {"section": "Section 125 CrPC", "description": "Maintenance", "act": "CrPC 1973"},
                ],
            },
        }
        ct = db.get(case_type, {})
        return ct.get(document_type, list(ct.values())[0] if ct else [])[:10]


_instance = None

def get_legal_ai() -> LegalDraftingAI:
    global _instance
    if _instance is None:
        _instance = LegalDraftingAI()
    return _instance

class LazyLegalAI:
    def __getattr__(self, name):
        return getattr(get_legal_ai(), name)

legal_ai = LazyLegalAI()
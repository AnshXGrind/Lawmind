"""AI Service — Google Gemini (lazy init, model fallback, retry, mock fallback)"""

import os, logging, time
from typing import List, Dict
import google.generativeai as genai
from app.core.config import settings
from app.models.schemas import DraftRequest

logger = logging.getLogger(__name__)

_MODEL_CANDIDATES = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
]

_SYSTEM_PROMPT = """You are LawMind, a senior Indian legal drafting expert with 20+ years of court experience.
Expertise: IPC, CrPC, CPC, Indian Evidence Act, Constitution, Hindu Marriage Act, Companies Act 2013, Contract Act 1872, Transfer of Property Act, Negotiable Instruments Act.

FORMAT EVERY DOCUMENT WITH:
1. CASE TITLE — IN THE HON'BLE [COURT NAME]
2. PARTIES — Petitioner vs. Respondent block
3. BACKGROUND / FACTS — numbered paragraphs
4. LEGAL ARGUMENTS / GROUNDS — numbered with section citations
5. PRAYER / RELIEF SOUGHT — numbered specific reliefs
6. VERIFICATION CLAUSE — with blanks for date, place, deponent
7. Advocate signature block

RULES:
- Use formal language: "It is respectfully submitted that...", "The Hon'ble Court may be pleased to..."
- Number ALL paragraphs
- Cite specific sections (e.g. Section 438 CrPC, Article 226 Constitution)
- Produce COMPLETE, court-ready documents — never templates or outlines
- Minimum 600 words"""


class LegalDraftingAI:
    def __init__(self):
        self._model = None
        self._working_model = None

    def _configure(self):
        key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        if not key:
            raise ValueError("GEMINI_API_KEY is not set. Add it in Space Settings → Variables and secrets.")
        genai.configure(api_key=key)
        return key

    @property
    def model(self):
        if self._model is None:
            self._configure()
            last_err = None
            for name in _MODEL_CANDIDATES:
                try:
                    m = genai.GenerativeModel(
                        model_name=name,
                        system_instruction=_SYSTEM_PROMPT,
                        generation_config=genai.GenerationConfig(
                            temperature=0.2, max_output_tokens=4096
                        ),
                    )
                    m.generate_content("ping")  # probe
                    self._model = m
                    self._working_model = name
                    logger.info(f"[+] Gemini model ready: {name}")
                    break
                except Exception as e:
                    logger.warning(f"[!] Model {name} unavailable: {e}")
                    last_err = e
            if self._model is None:
                raise ValueError(f"No Gemini model available. Last error: {last_err}")
        return self._model

    def _generate(self, prompt: str, retries: int = 3) -> str:
        last_err = None
        for attempt in range(retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                last_err = e
                wait = 2 ** attempt
                logger.warning(f"Gemini attempt {attempt+1}/{retries} failed: {e} — retrying in {wait}s")
                time.sleep(wait)
                if attempt == retries - 2:
                    self._model = None
        raise ValueError(f"AI generation failed after {retries} retries: {last_err}")

    def generate_draft(self, request: DraftRequest) -> str:
        parties = "\n".join(f"{r.upper()}: {n}" for r, n in request.parties.items()) or "Parties: TBD"
        sections = ", ".join(request.sections) if request.sections else "To be determined"
        try:
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
        except ValueError as e:
            if "GEMINI_API_KEY" in str(e):
                logger.warning("Gemini key missing — returning mock draft")
                return self._mock_draft(request)
            raise

    def _mock_draft(self, request: DraftRequest) -> str:
        court_name = str(request.court).upper().replace("_", " ")
        doc_type = request.document_type.value.upper().replace("_", " ")
        return f"""IN THE HON'BLE {court_name}

{doc_type}

IN THE MATTER OF:
{request.title}

VERSUS

[RESPONDENT NAME]                       ... RESPONDENT

---

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

MOST RESPECTFULLY SHOWETH:

1. That the Petitioner is filing this petition seeking appropriate relief from this Hon'ble Court.

2. That the facts of the case are as follows:
   {request.facts or "Facts to be stated here."}

3. That the Petitioner has no other efficacious remedy available except to approach this Hon'ble Court.

GROUNDS:

4. Because the impugned action is arbitrary and violative of Article 14 of the Constitution of India.

5. Because the procedure established by law has not been followed in the present case.

6. Because the Petitioner's fundamental rights under Article 21 have been violated.

PRAYER:

In view of the aforesaid facts and circumstances, it is most respectfully prayed that this Hon'ble Court may be pleased to:

(a) {request.relief_sought or "Issue appropriate writ, order, or direction"};
(b) Award costs of this petition to the Petitioner;
(c) Pass such other order(s) as this Hon'ble Court may deem fit.

---
NOTE: Mock draft — add GEMINI_API_KEY in HF Space Settings → Variables and secrets for AI generation.
---

VERIFICATION:
I, the Petitioner, verify that contents of the above petition are true to my knowledge.

Verified at [PLACE] on [DATE].

PETITIONER

Through:
[ADVOCATE NAME] | [BAR COUNCIL NO.]"""

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
            },
            "constitutional": {
                "petition": [
                    {"section": "Article 32", "description": "Writ jurisdiction - Supreme Court", "act": "Constitution"},
                    {"section": "Article 226", "description": "Writ jurisdiction - High Courts", "act": "Constitution"},
                    {"section": "Article 21", "description": "Right to life and liberty", "act": "Constitution"},
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

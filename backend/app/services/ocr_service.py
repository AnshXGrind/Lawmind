"""OCR Service - Tesseract only (EasyOCR removed for Replit)"""

import re, os, logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

try:
    import pytesseract
    from PIL import Image
    TESSERACT_OK = True
except ImportError:
    TESSERACT_OK = False
    logger.warning("[!] pytesseract not available")

try:
    import pdf2image
    PDF2IMAGE_OK = True
except ImportError:
    PDF2IMAGE_OK = False

try:
    import PyPDF2
    PYPDF2_OK = True
except ImportError:
    PYPDF2_OK = False


class OCRService:
    async def extract_text_from_image(self, path: str) -> Tuple[str, int]:
        if not TESSERACT_OK:
            return "OCR not available.", 0
        try:
            text = pytesseract.image_to_string(Image.open(path), lang="eng")
            return text.strip(), 75
        except Exception as e:
            return f"OCR failed: {e}", 0

    async def extract_text_from_pdf(self, path: str) -> Tuple[str, int]:
        if PYPDF2_OK:
            try:
                with open(path, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    text = "\n".join(p.extract_text() or "" for p in reader.pages)
                if len(text.strip()) > 50:
                    return text.strip(), 95
            except Exception:
                pass
        if PDF2IMAGE_OK and TESSERACT_OK:
            try:
                pages = pdf2image.convert_from_path(path, first_page=1, last_page=3)
                text = "\n".join(pytesseract.image_to_string(p, lang="eng") for p in pages)
                return text.strip(), 70
            except Exception as e:
                return f"PDF OCR failed: {e}", 0
        return "PDF extraction unavailable.", 0


class CaseExtractor:
    async def extract_case_info(self, text: str, doc_type: str = "general") -> Dict:
        if not text or len(text.strip()) < 20:
            return {"error": "Insufficient text", "extracted_fields": []}
        out = {}
        fields = []

        def search(pattern, key):
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                out[key] = m.group(1).strip()
                fields.append(key)

        search(r'FIR\s*(?:No\.?|Number)?\s*[:#]?\s*(\d+[/\-]\d+)', "fir_number")
        search(r'(?:P\.?S\.?|Police\s+Station)\s*[:#]?\s*([A-Za-z\s]+?)(?:\n|,|\.)', "police_station")
        search(r'(?:Complainant|Petitioner|Plaintiff)\s*[:#]?\s*([A-Za-z\s\.]+?)(?:\n|,|aged|s/o)', "petitioner")
        search(r'(?:Accused|Respondent|Defendant)\s*[:#]?\s*([A-Za-z\s\.]+?)(?:\n|,|aged|s/o)', "respondent")

        sections = re.findall(r'(?:Section|Sec\.|u/s)\s*(\d+[A-Za-z]?)', text, re.IGNORECASE)
        if sections:
            out["sections"] = sections[:10]
            fields.append("sections")

        out["facts"] = text[:500].strip()
        out["extracted_fields"] = fields
        return out


ocr_service = OCRService()
case_extractor = CaseExtractor()
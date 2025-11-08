"""
OCR and Document Extraction Service
Extracts case information from uploaded FIRs, chargesheets, and notes
"""

import re
import os
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import pytesseract
from PIL import Image
import pdf2image
from io import BytesIO

# Make EasyOCR completely optional
EASYOCR_AVAILABLE = False
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except (ImportError, Exception) as e:
    print(f"[!] EasyOCR not available (using Tesseract only): {e}")
    EASYOCR_AVAILABLE = False


class OCRService:
    """Handle OCR extraction from images and PDFs"""
    
    def __init__(self):
        self.reader = None
        if EASYOCR_AVAILABLE:
            try:
                self.reader = easyocr.Reader(['en', 'hi'], gpu=False)
            except Exception as e:
                print(f"[!] EasyOCR initialization failed: {e}")
    
    async def extract_text_from_image(self, image_path: str) -> Tuple[str, int]:
        """
        Extract text from image using OCR
        Returns: (extracted_text, confidence_score)
        """
        try:
            # Try EasyOCR first (better for Indian documents)
            if self.reader:
                results = self.reader.readtext(image_path)
                text = "\n".join([res[1] for res in results])
                avg_confidence = sum([res[2] for res in results]) / len(results) if results else 0
                confidence = int(avg_confidence * 100)
                return text, confidence
            
            # Fallback to Tesseract
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img, lang='eng+hin')
            
            # Get confidence from Tesseract
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            confidences = [int(conf) for conf in data['conf'] if conf != '-1']
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return text, int(avg_confidence)
            
        except Exception as e:
            print(f"[!] OCR extraction failed: {e}")
            return "", 0
    
    async def extract_text_from_pdf(self, pdf_path: str) -> Tuple[str, int]:
        """
        Extract text from PDF (convert to images first, then OCR)
        Returns: (extracted_text, confidence_score)
        """
        try:
            # Convert PDF to images
            images = pdf2image.convert_from_path(pdf_path)
            
            all_text = []
            all_confidences = []
            
            for i, image in enumerate(images):
                # Save temporary image
                temp_path = f"/tmp/page_{i}.png"
                image.save(temp_path, 'PNG')
                
                # Extract text
                text, confidence = await self.extract_text_from_image(temp_path)
                all_text.append(text)
                all_confidences.append(confidence)
                
                # Clean up
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
            combined_text = "\n\n--- Page Break ---\n\n".join(all_text)
            avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
            
            return combined_text, int(avg_confidence)
            
        except Exception as e:
            print(f"[!] PDF OCR extraction failed: {e}")
            return "", 0


class CaseExtractor:
    """Extract structured case information from raw text"""
    
    def __init__(self):
        # Common Indian legal sections patterns
        self.section_patterns = [
            r'(?:Section|Sec\.|S\.)\s*(\d+[A-Z]?(?:\(\d+\))?)\s*(?:of\s+)?(?:IPC|CrPC|CPC|IT Act|NDPS|SC/ST Act)',
            r'(?:Order|O\.)\s*([IVXLCDM]+)\s*(?:Rule|R\.)\s*(\d+)\s*(?:of\s+)?(?:CPC|CrPC)',
            r'Article\s+(\d+[A-Z]?)\s*of\s+(?:the\s+)?Constitution',
        ]
        
        # Date patterns
        self.date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
            r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}',
        ]
        
        # Name patterns (common in FIRs)
        self.name_pattern = r'(?:Name|Accused|Complainant|Petitioner|Respondent)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
    
    async def extract_case_info(self, text: str, document_type: str = "general") -> Dict:
        """
        Extract structured information from OCR text
        Returns dictionary with extracted fields
        """
        extracted_data = {
            "petitioner": None,
            "respondent": None,
            "accused": None,
            "complainant": None,
            "sections": [],
            "dates": [],
            "facts": None,
            "fir_number": None,
            "police_station": None,
            "place": None,
            "extracted_fields": []
        }
        
        # Extract names
        names = self._extract_names(text)
        if names:
            extracted_data.update(names)
            extracted_data["extracted_fields"].extend(names.keys())
        
        # Extract sections
        sections = self._extract_sections(text)
        if sections:
            extracted_data["sections"] = sections
            extracted_data["extracted_fields"].append("sections")
        
        # Extract dates
        dates = self._extract_dates(text)
        if dates:
            extracted_data["dates"] = dates
            extracted_data["extracted_fields"].append("dates")
        
        # Extract FIR specific info
        if "fir" in document_type.lower():
            fir_info = self._extract_fir_info(text)
            extracted_data.update(fir_info)
            extracted_data["extracted_fields"].extend(fir_info.keys())
        
        # Extract place/location
        place = self._extract_place(text)
        if place:
            extracted_data["place"] = place
            extracted_data["extracted_fields"].append("place")
        
        # Extract facts (first substantial paragraph)
        facts = self._extract_facts(text)
        if facts:
            extracted_data["facts"] = facts
            extracted_data["extracted_fields"].append("facts")
        
        return extracted_data
    
    def _extract_names(self, text: str) -> Dict[str, str]:
        """Extract petitioner, respondent, accused, complainant names"""
        names = {}
        
        # Look for labeled names
        patterns = {
            "petitioner": r'(?:Petitioner|Applicant)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            "respondent": r'(?:Respondent|Opposite Party)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            "accused": r'(?:Accused|Defendant)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            "complainant": r'(?:Complainant|Informant)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                names[key] = match.group(1).strip()
        
        return names
    
    def _extract_sections(self, text: str) -> List[str]:
        """Extract legal sections mentioned"""
        sections = set()
        
        for pattern in self.section_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                sections.add(match.group(0))
        
        return sorted(list(sections))
    
    def _extract_dates(self, text: str) -> List[str]:
        """Extract dates mentioned in document"""
        dates = set()
        
        for pattern in self.date_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                dates.add(match.group(0))
        
        return sorted(list(dates))
    
    def _extract_fir_info(self, text: str) -> Dict[str, str]:
        """Extract FIR specific information"""
        info = {}
        
        # FIR Number
        fir_match = re.search(r'(?:FIR|F\.I\.R\.)\s*(?:No\.?|Number)\s*:?\s*(\d+/\d+)', text, re.IGNORECASE)
        if fir_match:
            info["fir_number"] = fir_match.group(1)
        
        # Police Station
        ps_match = re.search(r'(?:Police Station|P\.S\.)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text, re.IGNORECASE)
        if ps_match:
            info["police_station"] = ps_match.group(1)
        
        return info
    
    def _extract_place(self, text: str) -> Optional[str]:
        """Extract place/location"""
        # Look for common place indicators
        place_match = re.search(r'(?:Place|Location|At)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', text, re.IGNORECASE)
        if place_match:
            return place_match.group(1).strip()
        return None
    
    def _extract_facts(self, text: str) -> Optional[str]:
        """Extract facts/description from document"""
        # Look for substantial paragraphs (>100 chars)
        paragraphs = text.split('\n\n')
        
        for para in paragraphs:
            para = para.strip()
            # Skip if too short or looks like a header
            if len(para) > 100 and not para.isupper():
                # Clean up excessive whitespace
                para = re.sub(r'\s+', ' ', para)
                return para[:1000]  # Limit to first 1000 chars
        
        return None


# Singleton instance
ocr_service = OCRService()
case_extractor = CaseExtractor()

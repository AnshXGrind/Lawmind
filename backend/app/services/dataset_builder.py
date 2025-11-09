"""
Automated Legal Dataset Builder
Scheduled job that fetches, processes, and indexes legal judgments
"""

import os
import requests
import schedule
import time
from datetime import datetime
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LegalDatasetBuilder:
    """Automatically fetch and process legal judgments"""
    
    def __init__(self):
        self.indian_kanoon_base = "https://api.indiankanoon.org"
        self.supreme_court_api = "https://api.sci.gov.in"  # Placeholder
        self.data_dir = "data/judgments"
        self.processed_cases = set()
        
        # Create directories
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs("data/vectordb", exist_ok=True)
        os.makedirs("data/metadata", exist_ok=True)
    
    def fetch_recent_judgments(self, days=1) -> List[Dict]:
        """
        Fetch recent judgments from Indian Kanoon API
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of judgment metadata
        """
        try:
            logger.info(f"Fetching judgments from last {days} days...")
            
            # Indian Kanoon API endpoint (requires API key)
            # For now, using mock data structure
            judgments = []
            
            # Mock data for demonstration
            # In production, replace with actual API call:
            # response = requests.get(
            #     f"{self.indian_kanoon_base}/search",
            #     params={"fromdate": start_date, "todate": end_date},
            #     headers={"Authorization": f"Bearer {API_KEY}"}
            # )
            
            # Example structure from Indian Kanoon
            mock_judgments = [
                {
                    "tid": "123456",
                    "title": "Ram Kumar vs State of UP",
                    "court": "Supreme Court of India",
                    "date": "2025-11-08",
                    "citation": "2025 SCC Online SC 1234",
                    "pdf_url": "https://example.com/judgment.pdf",
                    "sections": ["IPC 302", "CrPC 313"],
                    "category": "Criminal"
                }
            ]
            
            logger.info(f"Found {len(mock_judgments)} new judgments")
            return mock_judgments
            
        except Exception as e:
            logger.error(f"Error fetching judgments: {str(e)}")
            return []
    
    def download_pdf(self, url: str, case_id: str) -> str:
        """
        Download PDF judgment to local storage
        
        Args:
            url: PDF download URL
            case_id: Unique case identifier
            
        Returns:
            Local file path
        """
        try:
            logger.info(f"Downloading PDF for case {case_id}")
            
            # Create filename
            filename = f"{case_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
            filepath = os.path.join(self.data_dir, filename)
            
            # Download PDF
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"PDF downloaded: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error downloading PDF: {str(e)}")
            return None
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF using PyMuPDF
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        try:
            import fitz  # PyMuPDF
            
            logger.info(f"Extracting text from {pdf_path}")
            
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                text += page.get_text()
            
            doc.close()
            
            logger.info(f"Extracted {len(text)} characters")
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return ""
    
    def extract_metadata(self, text: str, judgment_info: Dict) -> Dict:
        """
        Extract legal metadata from judgment text using NLP
        
        Args:
            text: Judgment full text
            judgment_info: Basic judgment info from API
            
        Returns:
            Enhanced metadata dictionary
        """
        try:
            import re
            
            metadata = {
                **judgment_info,
                "extracted_at": datetime.now().isoformat(),
                "word_count": len(text.split()),
                "char_count": len(text)
            }
            
            # Extract case number pattern
            case_no_pattern = r"(?:Criminal Appeal No\.|Civil Appeal No\.|Writ Petition No\.)\s*(\d+)\s*of\s*(\d{4})"
            case_match = re.search(case_no_pattern, text, re.IGNORECASE)
            if case_match:
                metadata["case_number"] = case_match.group(0)
            
            # Extract petitioner/respondent
            parties_pattern = r"(.*?)\s+vs?\.?\s+(.*?)(?:\n|$)"
            parties_match = re.search(parties_pattern, text[:1000])
            if parties_match:
                metadata["petitioner"] = parties_match.group(1).strip()
                metadata["respondent"] = parties_match.group(2).strip()
            
            # Extract judges
            judge_pattern = r"(?:BEFORE|CORAM).*?:?\s*(.*?)(?:\n|$)"
            judge_match = re.search(judge_pattern, text[:2000], re.IGNORECASE)
            if judge_match:
                metadata["judges"] = judge_match.group(1).strip()
            
            # Extract legal sections mentioned
            section_pattern = r"Section\s+(\d+[A-Z]?)\s+(?:of\s+)?(?:the\s+)?([A-Za-z\s,]+(?:Act|Code))"
            sections = re.findall(section_pattern, text[:5000])
            metadata["sections_mentioned"] = [f"Section {s[0]} of {s[1].strip()}" for s in sections[:10]]
            
            # Extract decision/outcome
            if "appeal is allowed" in text.lower():
                metadata["outcome"] = "Appeal Allowed"
            elif "appeal is dismissed" in text.lower():
                metadata["outcome"] = "Appeal Dismissed"
            elif "petition is allowed" in text.lower():
                metadata["outcome"] = "Petition Allowed"
            elif "petition is dismissed" in text.lower():
                metadata["outcome"] = "Petition Dismissed"
            else:
                metadata["outcome"] = "Unknown"
            
            # Extract key arguments (simplified - first 3 paragraphs after "HELD")
            held_pattern = r"HELD:?\s*(.*?)(?:\n\n|$)"
            held_match = re.search(held_pattern, text, re.IGNORECASE | re.DOTALL)
            if held_match:
                metadata["holding"] = held_match.group(1)[:500]
            
            logger.info(f"Metadata extracted: {metadata.get('case_number', 'Unknown')}")
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            return judgment_info
    
    def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate embeddings for semantic search
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        try:
            from sentence_transformers import SentenceTransformer
            
            # Use a pre-trained model (already installed)
            model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Truncate text if too long (max 512 tokens)
            max_chars = 2000
            text_truncated = text[:max_chars]
            
            # Generate embedding
            embedding = model.encode(text_truncated)
            
            logger.info(f"Generated embedding of dimension {len(embedding)}")
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            return []
    
    def store_in_vector_db(self, case_id: str, text: str, metadata: Dict, embedding: List[float]):
        """
        Store case in vector database (ChromaDB)
        
        Args:
            case_id: Unique case identifier
            text: Full judgment text
            metadata: Extracted metadata
            embedding: Vector embedding
        """
        try:
            import chromadb
            from chromadb.config import Settings
            
            # Initialize ChromaDB client
            client = chromadb.PersistentClient(
                path="data/vectordb",
                settings=Settings(anonymized_telemetry=False)
            )
            
            # Get or create collection
            collection = client.get_or_create_collection(
                name="indian_judgments",
                metadata={"description": "Indian legal judgments database"}
            )
            
            # Add document
            collection.add(
                documents=[text[:1000]],  # Store first 1000 chars as document
                metadatas=[metadata],
                ids=[case_id],
                embeddings=[embedding] if embedding else None
            )
            
            logger.info(f"Stored case {case_id} in vector database")
            
        except Exception as e:
            logger.error(f"Error storing in vector database: {str(e)}")
    
    def check_duplicate(self, case_id: str) -> bool:
        """
        Check if case already processed
        
        Args:
            case_id: Case identifier
            
        Returns:
            True if duplicate, False otherwise
        """
        return case_id in self.processed_cases
    
    def mark_processed(self, case_id: str):
        """Mark case as processed"""
        self.processed_cases.add(case_id)
        
        # Save to file for persistence
        with open("data/metadata/processed_cases.txt", "a") as f:
            f.write(f"{case_id}\n")
    
    def load_processed_cases(self):
        """Load list of already processed cases"""
        try:
            with open("data/metadata/processed_cases.txt", "r") as f:
                self.processed_cases = set(line.strip() for line in f)
            logger.info(f"Loaded {len(self.processed_cases)} processed cases")
        except FileNotFoundError:
            logger.info("No previous processed cases found")
    
    def run_daily_update(self):
        """Main job - run daily to fetch and process new judgments"""
        logger.info("=" * 50)
        logger.info("Starting daily legal dataset update")
        logger.info("=" * 50)
        
        # Load processed cases
        self.load_processed_cases()
        
        # Fetch recent judgments
        judgments = self.fetch_recent_judgments(days=1)
        
        processed_count = 0
        skipped_count = 0
        
        for judgment in judgments:
            case_id = judgment.get("tid", "unknown")
            
            # Check if already processed
            if self.check_duplicate(case_id):
                logger.info(f"Skipping duplicate case: {case_id}")
                skipped_count += 1
                continue
            
            try:
                # Download PDF
                pdf_path = self.download_pdf(judgment["pdf_url"], case_id)
                if not pdf_path:
                    continue
                
                # Extract text
                text = self.extract_text_from_pdf(pdf_path)
                if not text:
                    continue
                
                # Extract metadata
                metadata = self.extract_metadata(text, judgment)
                
                # Generate embeddings
                embedding = self.generate_embeddings(text)
                
                # Store in vector database
                self.store_in_vector_db(case_id, text, metadata, embedding)
                
                # Mark as processed
                self.mark_processed(case_id)
                processed_count += 1
                
                logger.info(f"✅ Successfully processed case: {case_id}")
                
            except Exception as e:
                logger.error(f"❌ Error processing case {case_id}: {str(e)}")
                continue
        
        logger.info("=" * 50)
        logger.info(f"Daily update complete!")
        logger.info(f"Processed: {processed_count} | Skipped: {skipped_count}")
        logger.info("=" * 50)
    
    def start_scheduler(self):
        """Start background scheduler"""
        logger.info("Starting legal dataset scheduler...")
        
        # Run immediately on start
        self.run_daily_update()
        
        # Schedule to run daily at 2 AM
        schedule.every().day.at("02:00").do(self.run_daily_update)
        
        # Keep running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute


# Standalone execution
if __name__ == "__main__":
    builder = LegalDatasetBuilder()
    builder.start_scheduler()

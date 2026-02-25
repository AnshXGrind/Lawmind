"""RAG Service - keyword mode (chromadb disabled on Replit)"""
import logging
logger = logging.getLogger(__name__)

class LegalRAGService:
    def __init__(self):
        logger.info("[!] RAG in keyword-only mode (no vector DB)")
    def add_documents(self, *a, **kw): return []
    def search(self, query, n_results=5):
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
    def search_similar(self, text, limit=5): return []

rag_service = LegalRAGService()
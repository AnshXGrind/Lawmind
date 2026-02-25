"""RAG Service — stub for Hugging Face (chromadb/sentence-transformers excluded)"""
import logging
logger = logging.getLogger(__name__)


class LegalRAGService:
    """Stubbed — ChromaDB and sentence-transformers excluded to keep image lean."""

    def __init__(self):
        logger.info("[!] RAG service running in keyword-only mode (no embeddings)")

    def search(self, query: str, limit: int = 5):
        return []

    def add_document(self, *args, **kwargs):
        pass

    def get_context(self, query: str) -> str:
        return ""

    def search_legal_knowledge(self, query: str, limit: int = 5):
        return []


rag_service = LegalRAGService()

        if self.collection.count() == 0:
            self._seed_default_knowledge()

    def _embed(self, text: str) -> List[float]:
        return self.embedder.encode(text).tolist()

    def _seed_default_knowledge(self):
        docs = [
            {"id": "ipc302", "text": "IPC Section 302: Murder - punished with death or life imprisonment.", "meta": {"section": "302", "act": "IPC", "category": "criminal"}},
            {"id": "cpc9", "text": "CPC Section 9: Courts to try all civil suits unless barred.", "meta": {"section": "9", "act": "CPC", "category": "civil"}},
            {"id": "contract10", "text": "Contract Act Section 10: Agreements are contracts if by free consent for lawful consideration.", "meta": {"section": "10", "act": "Contract Act", "category": "contract"}},
            {"id": "crpc438", "text": "CrPC Section 438: Anticipatory Bail - Direction for grant of bail to person apprehending arrest.", "meta": {"section": "438", "act": "CrPC", "category": "criminal"}},
            {"id": "art226", "text": "Constitution Article 226: Power of High Courts to issue writs.", "meta": {"section": "226", "act": "Constitution", "category": "constitutional"}},
        ]
        self.collection.add(
            ids=[d["id"] for d in docs],
            embeddings=[self._embed(d["text"]) for d in docs],
            documents=[d["text"] for d in docs],
            metadatas=[d["meta"] for d in docs],
        )

    def search_relevant_sections(self, query: str, k: int = 5) -> List[Dict]:
        n = min(k, max(self.collection.count(), 1))
        results = self.collection.query(query_embeddings=[self._embed(query)], n_results=n, include=["documents", "metadatas", "distances"])
        return [{"content": doc, "metadata": meta, "relevance_score": float(1.0 - dist)} for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0])]

    def add_legal_knowledge(self, content: str, metadata: Dict) -> bool:
        try:
            doc_id = f"doc_{hash(content) & 0xFFFFFFFF}"
            self.collection.add(ids=[doc_id], embeddings=[self._embed(content)], documents=[content], metadatas=[metadata])
            return True
        except Exception as exc:
            print(f"Error adding legal knowledge: {exc}")
            return False

    def search_case_laws(self, query: str, case_type: Optional[str] = None, k: int = 5) -> List[Dict]:
        n = min(k, max(self.collection.count(), 1))
        results = self.collection.query(query_embeddings=[self._embed(query)], n_results=n, include=["documents", "metadatas", "distances"])
        return [{"content": doc, "metadata": meta, "relevance_score": float(1.0 - dist)} for doc, meta, dist in zip(results["documents"][0], results["metadatas"][0], results["distances"][0])]


_rag_service_instance = None


def get_rag_service() -> LegalRAGService:
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = LegalRAGService()
    return _rag_service_instance


class LazyRAGService:
    def __getattr__(self, name):
        return getattr(get_rag_service(), name)


rag_service = LazyRAGService()

"""
RAG (Retrieval Augmented Generation) Service for Legal Knowledge
"""

from typing import List, Dict, Optional
from app.core.config import settings
import os

class LegalRAGService:
    """RAG service for legal knowledge retrieval"""
    
    def __init__(self):
        """Initialize embeddings and vector store"""
        # Lazy imports to avoid loading heavy dependencies on startup
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_community.vectorstores import FAISS
        
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL
        )
        
        self.vector_store_path = settings.VECTOR_DB_PATH
        self.vector_store = None
        
        # Initialize or load vector store
        self._load_or_create_vector_store()
    
    def _load_or_create_vector_store(self):
        """Load existing vector store or create new one"""
        from langchain_community.vectorstores import FAISS
        
        index_path = os.path.join(self.vector_store_path, "index.faiss")
        
        if os.path.exists(index_path):
            try:
                self.vector_store = FAISS.load_local(
                    self.vector_store_path,
                    self.embeddings
                )
                print("✅ Loaded existing legal knowledge vector store")
            except Exception as e:
                print(f"⚠️ Error loading vector store: {e}")
                self._create_default_vector_store()
        else:
            self._create_default_vector_store()
    
    def _create_default_vector_store(self):
        """Create default vector store with sample legal knowledge"""
        sample_docs = [
            Document(
                page_content="Indian Penal Code Section 302: Murder - Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.",
                metadata={"section": "302", "act": "IPC", "category": "criminal"}
            ),
            Document(
                page_content="Code of Civil Procedure Section 9: Courts to try all civil suits unless barred - The Courts shall have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred.",
                metadata={"section": "9", "act": "CPC", "category": "civil"}
            ),
            Document(
                page_content="Indian Contract Act Section 10: What agreements are contracts - All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.",
                metadata={"section": "10", "act": "Contract Act", "category": "contract"}
            ),
        ]
        
        self.vector_store = FAISS.from_documents(
            sample_docs,
            self.embeddings
        )
        
        # Save the vector store
        os.makedirs(self.vector_store_path, exist_ok=True)
        self.vector_store.save_local(self.vector_store_path)
        print("✅ Created new legal knowledge vector store")
    
    def search_relevant_sections(
        self,
        query: str,
        k: int = 5
    ) -> List[Dict[str, any]]:
        """Search for relevant legal sections"""
        if not self.vector_store:
            return []
        
        # Perform similarity search
        results = self.vector_store.similarity_search_with_score(query, k=k)
        
        # Format results
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "relevance_score": float(1 - score)  # Convert distance to relevance
            })
        
        return formatted_results
    
    def add_legal_knowledge(
        self,
        content: str,
        metadata: Dict[str, any]
    ) -> bool:
        """Add new legal knowledge to vector store"""
        try:
            doc = Document(page_content=content, metadata=metadata)
            
            if self.vector_store:
                self.vector_store.add_documents([doc])
                self.vector_store.save_local(self.vector_store_path)
            else:
                self.vector_store = FAISS.from_documents([doc], self.embeddings)
                self.vector_store.save_local(self.vector_store_path)
            
            return True
        except Exception as e:
            print(f"Error adding legal knowledge: {e}")
            return False
    
    def search_case_laws(
        self,
        query: str,
        case_type: Optional[str] = None,
        k: int = 5
    ) -> List[Dict[str, any]]:
        """Search for relevant case laws"""
        if not self.vector_store:
            return []
        
        # Add filter for case type if provided
        filter_dict = {"category": "case_law"}
        if case_type:
            filter_dict["case_type"] = case_type
        
        results = self.vector_store.similarity_search_with_score(
            query,
            k=k,
            filter=filter_dict if case_type else None
        )
        
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "relevance_score": float(1 - score)
            })
        
        return formatted_results

# Lazy singleton instance
_rag_service_instance = None

def get_rag_service():
    """Get or create the RAG service singleton instance"""
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = LegalRAGService()
    return _rag_service_instance

# For backward compatibility
class LazyRAGService:
    def __getattr__(self, name):
        return getattr(get_rag_service(), name)

rag_service = LazyRAGService()

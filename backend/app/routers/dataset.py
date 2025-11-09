"""
Dataset Management API Router
Endpoints to manage automated legal dataset updates
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, List
import os
import json
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_token
from app.models.database_models import User
from app.services.dataset_builder import LegalDatasetBuilder

router = APIRouter()

# Global dataset builder instance
dataset_builder = LegalDatasetBuilder()


async def get_current_user(
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    user_id = int(token_data["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/dataset/trigger-update")
async def trigger_dataset_update(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger dataset update (admin only)
    Runs in background
    """
    try:
        # Add to background tasks
        background_tasks.add_task(dataset_builder.run_daily_update)
        
        return {
            "success": True,
            "message": "Dataset update triggered in background",
            "triggered_by": current_user.email,
            "triggered_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error triggering dataset update: {str(e)}"
        )


@router.get("/dataset/stats")
async def get_dataset_stats(
    current_user: User = Depends(get_current_user)
):
    """
    Get dataset statistics
    """
    try:
        # Load processed cases count
        processed_count = 0
        if os.path.exists("data/metadata/processed_cases.txt"):
            with open("data/metadata/processed_cases.txt", "r") as f:
                processed_count = len(f.readlines())
        
        # Get vector database stats
        try:
            import chromadb
            from chromadb.config import Settings
            
            client = chromadb.PersistentClient(
                path="data/vectordb",
                settings=Settings(anonymized_telemetry=False)
            )
            collection = client.get_collection("indian_judgments")
            vector_count = collection.count()
        except:
            vector_count = 0
        
        # Get PDF count
        pdf_count = 0
        if os.path.exists("data/judgments"):
            pdf_count = len([f for f in os.listdir("data/judgments") if f.endswith('.pdf')])
        
        return {
            "total_cases_processed": processed_count,
            "total_embeddings": vector_count,
            "total_pdfs_downloaded": pdf_count,
            "last_updated": datetime.now().isoformat(),
            "storage_path": os.path.abspath("data")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting dataset stats: {str(e)}"
        )


@router.get("/dataset/recent-cases")
async def get_recent_cases(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """
    Get recently added cases from vector database
    """
    try:
        import chromadb
        from chromadb.config import Settings
        
        client = chromadb.PersistentClient(
            path="data/vectordb",
            settings=Settings(anonymized_telemetry=False)
        )
        
        collection = client.get_collection("indian_judgments")
        
        # Get all documents (limited)
        results = collection.get(
            limit=limit,
            include=["documents", "metadatas"]
        )
        
        cases = []
        for i, case_id in enumerate(results["ids"]):
            cases.append({
                "id": case_id,
                "metadata": results["metadatas"][i] if results["metadatas"] else {},
                "preview": results["documents"][i][:200] if results["documents"] else ""
            })
        
        return {
            "total": len(cases),
            "cases": cases
        }
        
    except Exception as e:
        return {
            "total": 0,
            "cases": [],
            "error": str(e)
        }


@router.post("/dataset/search-similar")
async def search_similar_cases(
    query: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user)
):
    """
    Search for similar cases using semantic search
    """
    try:
        import chromadb
        from chromadb.config import Settings
        from sentence_transformers import SentenceTransformer
        
        # Generate query embedding
        model = SentenceTransformer('all-MiniLM-L6-v2')
        query_embedding = model.encode(query).tolist()
        
        # Search vector database
        client = chromadb.PersistentClient(
            path="data/vectordb",
            settings=Settings(anonymized_telemetry=False)
        )
        collection = client.get_collection("indian_judgments")
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas", "distances"]
        )
        
        cases = []
        for i, case_id in enumerate(results["ids"][0]):
            cases.append({
                "id": case_id,
                "similarity_score": 1 - results["distances"][0][i],  # Convert distance to similarity
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                "preview": results["documents"][0][i][:300] if results["documents"] else ""
            })
        
        return {
            "query": query,
            "total_results": len(cases),
            "cases": cases
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching cases: {str(e)}"
        )


@router.get("/dataset/health")
async def dataset_health_check():
    """
    Check if dataset builder is configured correctly
    """
    health_status = {
        "status": "healthy",
        "checks": {
            "data_directory": os.path.exists("data"),
            "judgments_directory": os.path.exists("data/judgments"),
            "vectordb_directory": os.path.exists("data/vectordb"),
            "metadata_directory": os.path.exists("data/metadata"),
        },
        "timestamp": datetime.now().isoformat()
    }
    
    # Check if all directories exist
    all_healthy = all(health_status["checks"].values())
    health_status["status"] = "healthy" if all_healthy else "degraded"
    
    return health_status

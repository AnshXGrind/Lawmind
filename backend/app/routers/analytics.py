from fastapi import APIRouter
router = APIRouter()

@router.get("/stats")
async def stats():
    return {"message": "Analytics coming soon", "drafts": 0}
from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_home_collections():
    """Placeholder list home collections endpoint."""
    return []


@router.post("")
async def create_home_collection():
    """Placeholder create home collection booking endpoint for voice agent."""
    return {"detail": "not implemented yet"}


@router.put("/{collection_id}/status")
async def update_home_collection_status(collection_id: str):
    """Placeholder status update endpoint."""
    return {"collection_id": collection_id, "detail": "not implemented yet"}


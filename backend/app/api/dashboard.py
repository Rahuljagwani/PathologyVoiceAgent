from fastapi import APIRouter

router = APIRouter()


@router.get("/stats")
async def dashboard_stats():
    """Placeholder dashboard stats endpoint."""
    return {"detail": "not implemented yet"}


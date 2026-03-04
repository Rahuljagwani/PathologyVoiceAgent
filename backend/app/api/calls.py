from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_calls():
    """Placeholder list call logs endpoint."""
    return []


@router.post("/log")
async def log_call():
    """Placeholder call log webhook endpoint (for Bolna)."""
    return {"detail": "not implemented yet"}


@router.get("/stats")
async def call_stats():
    """Placeholder call stats endpoint (automation rate, etc.)."""
    return {"detail": "not implemented yet"}


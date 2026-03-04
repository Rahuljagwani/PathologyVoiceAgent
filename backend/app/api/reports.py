from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_reports():
    """Placeholder list reports endpoint."""
    return []


@router.post("")
async def create_report():
    """Placeholder create report endpoint."""
    return {"detail": "not implemented yet"}


@router.put("/{report_id}/mark-ready")
async def mark_report_ready(report_id: str):
    """Placeholder mark-ready endpoint."""
    return {"report_id": report_id, "detail": "not implemented yet"}


@router.get("/search")
async def search_reports():
    """Placeholder search endpoint for voice agent."""
    return []


from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.db.supabase import get_supabase_client

router = APIRouter()


@router.get("")
def list_home_collections(
    lab_id: str = Query(..., description="Lab identifier"),
    date_filter: Optional[date] = Query(
        None, alias="date", description="Preferred date filter (YYYY-MM-DD)"
    ),
) -> List[Dict[str, Any]]:
    """
    List home collection bookings for a lab. Used by the Home Collection Calendar.
    """
    supabase = get_supabase_client()
    query = supabase.table("home_collections").select("*").eq("lab_id", lab_id)
    if date_filter:
        query = query.eq("preferred_date", str(date_filter))
    result = query.order("preferred_date", desc=False).order("created_at", desc=True).execute()
    return result.data or []


@router.post("")
def create_home_collection(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new home collection booking.
    This is the tool endpoint for the voice agent (Flow 4).
    """
    supabase = get_supabase_client()
    result = supabase.table("home_collections").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create booking")
    return result.data[0]


@router.put("/{collection_id}/status")
def update_home_collection_status(collection_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update status of a home collection (booked | assigned | completed | cancelled),
    optionally setting assigned_to or notes.
    """
    supabase = get_supabase_client()
    result = (
        supabase.table("home_collections")
        .update(payload)
        .eq("id", collection_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Home collection not found")
    return result.data[0]



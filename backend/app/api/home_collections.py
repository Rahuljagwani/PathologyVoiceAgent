from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import require_staff_or_owner, verify_lab_access
from app.db.supabase import get_supabase_client
from app.models.schemas import HomeCollectionCreateRequest, HomeCollectionStatusUpdate

router = APIRouter()


# ── Dashboard endpoints (auth required) ─────────────────────────


@router.get("")
async def list_home_collections(
    lab_id: str = Query(..., description="Lab identifier"),
    date_filter: Optional[date] = Query(None, alias="date"),
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> List[Dict[str, Any]]:
    verify_lab_access(current_user, lab_id)

    supabase = get_supabase_client()
    query = supabase.table("home_collections").select("*").eq("lab_id", lab_id)
    if date_filter:
        query = query.eq("preferred_date", str(date_filter))
    result = (
        query.order("preferred_date", desc=False)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.put("/{collection_id}/status")
async def update_home_collection_status(
    collection_id: str,
    payload: HomeCollectionStatusUpdate,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    supabase = get_supabase_client()

    existing = (
        supabase.table("home_collections")
        .select("lab_id")
        .eq("id", collection_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Home collection not found")
    verify_lab_access(current_user, existing.data[0]["lab_id"])

    result = (
        supabase.table("home_collections")
        .update(payload.model_dump(exclude_none=True))
        .eq("id", collection_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Home collection not found")
    return result.data[0]


# ── Voice-agent tool endpoint (no JWT — called by Bolna) ────────


@router.post("")
def create_home_collection(payload: HomeCollectionCreateRequest) -> Dict[str, Any]:
    supabase = get_supabase_client()
    result = (
        supabase.table("home_collections")
        .insert(payload.model_dump(mode="json"))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create booking")
    return result.data[0]

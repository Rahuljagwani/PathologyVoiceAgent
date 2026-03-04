from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.db.supabase import get_supabase_client

router = APIRouter()


@router.get("/{lab_id}/settings")
def get_lab_settings(lab_id: str) -> Dict[str, Any]:
    """
    Get full lab_settings row for a lab.
    Voice agent and dashboard read from this.
    """
    supabase = get_supabase_client()
    result = (
        supabase.table("lab_settings")
        .select("*")
        .eq("lab_id", lab_id)
        .limit(1)
        .execute()
    )
    data = result.data or []
    if not data:
        raise HTTPException(status_code=404, detail="Lab settings not found")
    return data[0]


@router.put("/{lab_id}/settings")
def update_lab_settings(lab_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update lab_settings for a lab.
    """
    supabase = get_supabase_client()
    payload["lab_id"] = lab_id
    result = (
        supabase.table("lab_settings")
        .upsert(payload, on_conflict="lab_id")
        .execute()
    )
    data = result.data or []
    if not data:
        raise HTTPException(status_code=400, detail="Could not update lab settings")
    return data[0]



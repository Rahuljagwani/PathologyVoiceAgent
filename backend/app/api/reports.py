from datetime import date, datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import require_staff_or_owner, verify_lab_access
from app.db.supabase import get_supabase_client
from app.models.schemas import ReportCreateRequest

router = APIRouter()


# ── Dashboard endpoints (auth required) ─────────────────────────


@router.get("")
async def list_reports(
    lab_id: str = Query(..., description="Lab identifier"),
    status: Optional[str] = Query(None, description="pending | ready | dispatched"),
    date_filter: Optional[date] = Query(None, alias="date"),
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> List[Dict[str, Any]]:
    verify_lab_access(current_user, lab_id)

    supabase = get_supabase_client()
    query = supabase.table("reports").select("*").eq("lab_id", lab_id)
    if status:
        query = query.eq("status", status)
    if date_filter:
        query = query.eq("sample_date", str(date_filter))

    result = query.order("sample_date", desc=False).order("created_at", desc=True).execute()
    return result.data or []


@router.post("")
async def create_report(
    payload: ReportCreateRequest,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    verify_lab_access(current_user, payload.lab_id)

    supabase = get_supabase_client()
    result = (
        supabase.table("reports")
        .insert(payload.model_dump(mode="json"))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create report")
    return result.data[0]


@router.put("/{report_id}/mark-ready")
async def mark_report_ready(
    report_id: str,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    supabase = get_supabase_client()

    existing = (
        supabase.table("reports")
        .select("lab_id")
        .eq("id", report_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Report not found")
    verify_lab_access(current_user, existing.data[0]["lab_id"])

    update_data: Dict[str, Any] = {
        "status": "ready",
        "ready_marked_at": datetime.utcnow().isoformat(),
        "ready_marked_by": str(current_user["id"]),
    }
    result = (
        supabase.table("reports")
        .update(update_data)
        .eq("id", report_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return result.data[0]


# ── Voice-agent tool endpoint (no JWT — called by Bolna) ────────


@router.get("/search")
def search_reports(
    query: str = Query(..., description="Token, patient name, or phone"),
    lab_id: str = Query(..., description="Lab identifier"),
) -> List[Dict[str, Any]]:
    supabase = get_supabase_client()
    result = (
        supabase.table("reports")
        .select("*")
        .eq("lab_id", lab_id)
        .or_(
            f"token_number.ilike.%{query}%,"
            f"patient_name.ilike.%{query}%,"
            f"patient_phone.ilike.%{query}%"
        )
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []

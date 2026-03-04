from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.db.supabase import get_supabase_client

router = APIRouter()


@router.get("")
def list_reports(
    lab_id: str = Query(..., description="Lab identifier"),
    status: Optional[str] = Query(None, description="pending | ready | dispatched"),
    date_filter: Optional[date] = Query(
        None, alias="date", description="Filter by sample_date (YYYY-MM-DD)"
    ),
) -> List[Dict[str, Any]]:
    """
    List reports for a lab, optionally filtered by status and sample_date.
    Used by the Report Status Manager screen.
    """
    supabase = get_supabase_client()
    query = supabase.table("reports").select("*").eq("lab_id", lab_id)

    if status:
        query = query.eq("status", status)
    if date_filter:
        query = query.eq("sample_date", str(date_filter))

    result = query.order("sample_date", desc=False).order("created_at", desc=True).execute()
    return result.data or []


@router.post("")
def create_report(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add a new report row. The frontend will send required fields
    (lab_id, patient_name, patient_phone, test_name, sample_date, etc.).
    """
    supabase = get_supabase_client()
    result = supabase.table("reports").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create report")
    return result.data[0]


@router.put("/{report_id}/mark-ready")
def mark_report_ready(report_id: str, ready_marked_by: Optional[str] = None) -> Dict[str, Any]:
    """
    Mark a report as ready and stamp the ready_marked_at/ready_marked_by fields.
    """
    from datetime import datetime

    supabase = get_supabase_client()
    update_data: Dict[str, Any] = {
        "status": "ready",
        "ready_marked_at": datetime.utcnow().isoformat(),
    }
    if ready_marked_by:
        update_data["ready_marked_by"] = ready_marked_by

    result = (
        supabase.table("reports")
        .update(update_data)
        .eq("id", report_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return result.data[0]


@router.get("/search")
def search_reports(
    query: str = Query(..., description="Token, patient name, or phone"),
    lab_id: str = Query(..., description="Lab identifier"),
) -> List[Dict[str, Any]]:
    """
    Search reports by token_number, patient_name, or patient_phone.
    This is the primary tool endpoint for the voice agent's report status flow.
    """
    supabase = get_supabase_client()

    # Supabase does not support OR with simple helpers, so use the raw filter string.
    filter_expr = (
        f"lab_id.eq.{lab_id},"
        f"or("
        f"token_number.ilike.%{query}%,"
        f"patient_name.ilike.%{query}%,"
        f"patient_phone.ilike.%{query}%"
        f")"
    )

    result = (
        supabase.table("reports")
        .select("*")
        .or_(
            f"token_number.ilike.%{query}%,patient_name.ilike.%{query}%,patient_phone.ilike.%{query}%"
        )
        .eq("lab_id", lab_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


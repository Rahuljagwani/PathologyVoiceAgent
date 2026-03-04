from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import require_staff_or_owner, verify_lab_access
from app.db.supabase import get_supabase_client
from app.models.schemas import CallLogCreateRequest, CallStatsResponse

router = APIRouter()


@router.get("")
async def list_calls(
    lab_id: str = Query(..., description="Lab identifier"),
    date_filter: Optional[str] = Query(None, alias="date", description="YYYY-MM-DD"),
    outcome: Optional[str] = Query(None, description="resolved | logged | transferred"),
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> List[Dict[str, Any]]:
    verify_lab_access(current_user, lab_id)

    supabase = get_supabase_client()
    query = supabase.table("call_logs").select("*").eq("lab_id", lab_id)
    if date_filter:
        query = query.gte("call_time", f"{date_filter}T00:00:00").lt(
            "call_time", f"{date_filter}T23:59:59.999999"
        )
    if outcome:
        query = query.eq("outcome", outcome)
    result = query.order("call_time", desc=True).execute()
    return result.data or []


@router.post("/log")
async def log_call(
    payload: CallLogCreateRequest,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    verify_lab_access(current_user, payload.lab_id)

    supabase = get_supabase_client()
    result = (
        supabase.table("call_logs")
        .insert(payload.model_dump(mode="json"))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not log call")
    return result.data[0]


@router.get("/stats", response_model=CallStatsResponse)
async def call_stats(
    lab_id: str = Query(..., description="Lab identifier"),
    period: str = Query("today", description="today | 7d"),
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> CallStatsResponse:
    verify_lab_access(current_user, lab_id)

    supabase = get_supabase_client()
    now = datetime.utcnow()
    if period == "7d":
        start = now - timedelta(days=7)
    else:
        start = datetime.combine(now.date(), datetime.min.time())

    result = (
        supabase.table("call_logs")
        .select("*")
        .eq("lab_id", lab_id)
        .gte("call_time", start.isoformat())
        .execute()
    )
    data = result.data or []
    total = len(data)
    auto_resolved = sum(1 for c in data if c.get("outcome") == "resolved")
    transferred = sum(1 for c in data if c.get("outcome") == "transferred")
    logged = sum(1 for c in data if c.get("outcome") == "logged")
    automation_rate = (auto_resolved / total * 100) if total else 0.0

    return CallStatsResponse(
        period=period,
        total_calls=total,
        auto_resolved=auto_resolved,
        transferred=transferred,
        logged=logged,
        automation_rate=round(automation_rate, 2),
    )

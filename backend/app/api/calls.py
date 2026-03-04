from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.db.supabase import get_supabase_client

router = APIRouter()


@router.get("")
def list_calls(
    lab_id: str = Query(..., description="Lab identifier"),
    date_filter: Optional[date] = Query(
        None, alias="date", description="Filter by call_date (YYYY-MM-DD)"
    ),
    outcome: Optional[str] = Query(None, description="resolved | logged | transferred"),
) -> List[Dict[str, Any]]:
    """
    List call logs for Call Logs screen.
    """
    supabase = get_supabase_client()
    query = supabase.table("call_logs").select("*").eq("lab_id", lab_id)
    if date_filter:
        # call_time is a timestamp; we approximate by >= date and < date+1
        start = datetime.combine(date_filter, datetime.min.time())
        end = start + timedelta(days=1)
        query = query.gte("call_time", start.isoformat()).lt("call_time", end.isoformat())
    if outcome:
        query = query.eq("outcome", outcome)
    result = query.order("call_time", desc=True).execute()
    return result.data or []


@router.post("/log")
def log_call(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Log a call entry.
    This will be used by Bolna webhook and internal tools.
    """
    supabase = get_supabase_client()
    result = supabase.table("call_logs").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not log call")
    return result.data[0]


@router.get("/stats")
def call_stats(
    lab_id: str = Query(..., description="Lab identifier"),
    period: str = Query("today", description="today | 7d"),
) -> Dict[str, Any]:
    """
    Compute basic stats: calls count, auto-resolved, transferred, automation rate.
    """
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
    auto_resolved = len([c for c in data if c.get("outcome") == "resolved"])
    transferred = len([c for c in data if c.get("outcome") == "transferred"])
    logged = len([c for c in data if c.get("outcome") == "logged"])
    automation_rate = (auto_resolved / total * 100) if total else 0.0

    return {
        "period": period,
        "total_calls": total,
        "auto_resolved": auto_resolved,
        "transferred": transferred,
        "logged": logged,
        "automation_rate": automation_rate,
    }



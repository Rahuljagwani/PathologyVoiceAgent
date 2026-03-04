from datetime import datetime, timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends, Query

from app.core.security import require_staff_or_owner, verify_lab_access
from app.db.supabase import get_supabase_client
from app.models.schemas import DashboardStatsResponse

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsResponse)
async def dashboard_stats(
    lab_id: str = Query(..., description="Lab identifier"),
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> DashboardStatsResponse:
    verify_lab_access(current_user, lab_id)

    supabase = get_supabase_client()
    now = datetime.utcnow()
    today_str = now.strftime("%Y-%m-%d")
    start = datetime.combine(now.date(), datetime.min.time())
    end = start + timedelta(days=1)

    reports_today = (
        supabase.table("reports")
        .select("*")
        .eq("lab_id", lab_id)
        .eq("sample_date", today_str)
        .execute()
    ).data or []
    reports_ready_count = sum(1 for r in reports_today if r.get("status") == "ready")

    home_today = (
        supabase.table("home_collections")
        .select("*")
        .eq("lab_id", lab_id)
        .eq("preferred_date", today_str)
        .execute()
    ).data or []

    calls_today = (
        supabase.table("call_logs")
        .select("*")
        .eq("lab_id", lab_id)
        .gte("call_time", start.isoformat())
        .lt("call_time", end.isoformat())
        .execute()
    ).data or []
    total_calls = len(calls_today)
    auto_resolved = sum(1 for c in calls_today if c.get("outcome") == "resolved")
    automation_rate = (auto_resolved / total_calls * 100) if total_calls else 0.0

    return DashboardStatsResponse(
        reports_today=len(reports_today),
        reports_ready_today=reports_ready_count,
        home_collections_today=len(home_today),
        calls_today=total_calls,
        automation_rate_today=round(automation_rate, 2),
    )

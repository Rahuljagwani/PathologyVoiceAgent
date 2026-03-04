from datetime import date, datetime, timedelta
from typing import Any, Dict

from fastapi import APIRouter, Query

from app.db.supabase import get_supabase_client

router = APIRouter()


@router.get("/stats")
def dashboard_stats(
    lab_id: str = Query(..., description="Lab identifier"),
) -> Dict[str, Any]:
    """
    Aggregate high-level dashboard stats for the current day:
    - Reports today
    - Reports ready today
    - Home collections today
    - Calls today
    - Automation rate today
    """
    supabase = get_supabase_client()
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    # Reports
    reports_today = (
        supabase.table("reports")
        .select("*")
        .eq("lab_id", lab_id)
        .eq("sample_date", str(today))
        .execute()
    ).data or []
    reports_ready_today = [r for r in reports_today if r.get("status") == "ready"]

    # Home collections
    home_today = (
        supabase.table("home_collections")
        .select("*")
        .eq("lab_id", lab_id)
        .eq("preferred_date", str(today))
        .execute()
    ).data or []

    # Calls today
    calls_today = (
        supabase.table("call_logs")
        .select("*")
        .eq("lab_id", lab_id)
        .gte("call_time", start.isoformat())
        .lt("call_time", end.isoformat())
        .execute()
    ).data or []
    total_calls = len(calls_today)
    auto_resolved = len([c for c in calls_today if c.get("outcome") == "resolved"])
    automation_rate = (auto_resolved / total_calls * 100) if total_calls else 0.0

    return {
        "reports_today": len(reports_today),
        "reports_ready_today": len(reports_ready_today),
        "home_collections_today": len(home_today),
        "calls_today": total_calls,
        "automation_rate_today": automation_rate,
    }



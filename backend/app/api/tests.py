from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import require_staff_or_owner, verify_lab_access
from app.db.supabase import get_supabase_client
from app.models.schemas import TestCreateRequest, TestPrepResponse, TestUpdateRequest

router = APIRouter()


# ── Dashboard endpoints (auth required) ─────────────────────────


@router.get("")
async def list_tests(
    lab_id: str = Query(..., description="Lab identifier"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> List[Dict[str, Any]]:
    verify_lab_access(current_user, lab_id)

    supabase = get_supabase_client()
    query = supabase.table("test_price_master").select("*").eq("lab_id", lab_id)
    if category:
        query = query.eq("category", category)
    result = query.order("test_name", desc=False).execute()
    return result.data or []


@router.post("")
async def create_test(
    payload: TestCreateRequest,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    verify_lab_access(current_user, payload.lab_id)

    supabase = get_supabase_client()
    result = (
        supabase.table("test_price_master")
        .insert(payload.model_dump(mode="json"))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create test")
    return result.data[0]


@router.put("/{test_id}")
async def update_test(
    test_id: str,
    payload: TestUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    supabase = get_supabase_client()

    existing = (
        supabase.table("test_price_master")
        .select("lab_id")
        .eq("id", test_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Test not found")
    verify_lab_access(current_user, existing.data[0]["lab_id"])

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        supabase.table("test_price_master")
        .update(update_data)
        .eq("id", test_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Test not found")
    return result.data[0]


@router.delete("/{test_id}")
async def delete_test(
    test_id: str,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    supabase = get_supabase_client()

    existing = (
        supabase.table("test_price_master")
        .select("lab_id")
        .eq("id", test_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Test not found")
    verify_lab_access(current_user, existing.data[0]["lab_id"])

    result = (
        supabase.table("test_price_master")
        .delete()
        .eq("id", test_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"id": test_id, "deleted": True}


# ── Voice-agent tool endpoints (no JWT — called by Bolna) ───────


@router.get("/search")
def search_tests(
    query: str = Query(..., description="Test name or alias"),
    lab_id: str = Query(..., description="Lab identifier"),
) -> List[Dict[str, Any]]:
    supabase = get_supabase_client()
    pattern = f"%{query}%"
    result = (
        supabase.table("test_price_master")
        .select("*")
        .eq("lab_id", lab_id)
        .or_(f"test_name.ilike.{pattern},test_aliases.cs.{{{query}}}")
        .order("test_name", desc=False)
        .execute()
    )
    return result.data or []


@router.get("/prep", response_model=TestPrepResponse)
def get_test_prep(
    test_name: str = Query(..., description="Exact or approximate test name"),
    lab_id: str = Query(..., description="Lab identifier"),
) -> TestPrepResponse:
    supabase = get_supabase_client()

    result = (
        supabase.table("test_price_master")
        .select("*")
        .eq("lab_id", lab_id)
        .ilike("test_name", test_name)
        .limit(1)
        .execute()
    )
    data = result.data or []

    if not data:
        result = (
            supabase.table("test_price_master")
            .select("*")
            .eq("lab_id", lab_id)
            .ilike("test_name", f"%{test_name}%")
            .limit(1)
            .execute()
        )
        data = result.data or []

    if not data:
        raise HTTPException(status_code=404, detail="Test not found")

    record = data[0]
    return TestPrepResponse(
        test_name=record.get("test_name"),
        fasting_required=record.get("fasting_required"),
        fasting_hours=record.get("fasting_hours"),
        sample_type=record.get("sample_type"),
        notes=record.get("notes"),
    )

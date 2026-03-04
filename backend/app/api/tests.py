from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.db.supabase import get_supabase_client

router = APIRouter()


@router.get("")
def list_tests(
    lab_id: str = Query(..., description="Lab identifier"),
    category: Optional[str] = Query(None, description="Optional category filter"),
) -> List[Dict[str, Any]]:
    """
    List all tests for a lab, optionally filtered by category.
    """
    supabase = get_supabase_client()
    query = supabase.table("test_price_master").select("*").eq("lab_id", lab_id)
    if category:
        query = query.eq("category", category)
    result = query.order("test_name", desc=False).execute()
    return result.data or []


@router.post("")
def create_test(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add a new test row.
    """
    supabase = get_supabase_client()
    result = supabase.table("test_price_master").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create test")
    return result.data[0]


@router.put("/{test_id}")
def update_test(test_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update an existing test, including price and availability.
    """
    supabase = get_supabase_client()
    result = (
        supabase.table("test_price_master")
        .update(payload)
        .eq("id", test_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Test not found")
    return result.data[0]


@router.delete("/{test_id}")
def delete_test(test_id: str) -> Dict[str, Any]:
    """
    Remove a test from the catalogue.
    """
    supabase = get_supabase_client()
    result = (
        supabase.table("test_price_master")
        .delete()
        .eq("id", test_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"id": test_id, "deleted": True}


@router.get("/search")
def search_tests(
    query: str = Query(..., description="Test name or alias"),
    lab_id: str = Query(..., description="Lab identifier"),
) -> List[Dict[str, Any]]:
    """
    Fuzzy search tests by name or aliases.
    Used by pricing flow (voice agent + dashboard).
    """
    supabase = get_supabase_client()
    pattern = f"%{query}%"
    result = (
        supabase.table("test_price_master")
        .select("*")
        .eq("lab_id", lab_id)
        .or_(
            f"test_name.ilike.{pattern},test_aliases.cs.{{{query}}}"
        )
        .order("test_name", desc=False)
        .execute()
    )
    return result.data or []


@router.get("/prep")
def get_test_prep(
    test_name: str = Query(..., description="Exact or approximate test name"),
    lab_id: str = Query(..., description="Lab identifier"),
) -> Dict[str, Any]:
    """
    Get preparation instructions for a specific test.
    Voice agent uses this for Flow 2 (Test Preparation).
    """
    supabase = get_supabase_client()
    # Try exact/ilike match first
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
        # Fallback to fuzzy search
        pattern = f"%{test_name}%"
        result = (
            supabase.table("test_price_master")
            .select("*")
            .eq("lab_id", lab_id)
            .ilike("test_name", pattern)
            .limit(1)
            .execute()
        )
        data = result.data or []

    if not data:
        raise HTTPException(status_code=404, detail="Test not found")

    record = data[0]
    return {
        "test_name": record.get("test_name"),
        "fasting_required": record.get("fasting_required"),
        "fasting_hours": record.get("fasting_hours"),
        "sample_type": record.get("sample_type"),
        "notes": record.get("notes"),
    }



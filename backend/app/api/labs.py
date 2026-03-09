from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_owner, require_staff_or_owner, verify_lab_access
from app.db.supabase import get_supabase_client
from app.models.schemas import LabCreateRequest, LabSettingsUpdateRequest

router = APIRouter()


@router.get("", response_model=List[Dict[str, Any]])
async def list_labs(
    current_user: Dict[str, Any] = Depends(require_owner),
) -> List[Dict[str, Any]]:
    organization_id = current_user.get("organization_id")
    if not organization_id:
        return []

    supabase = get_supabase_client()
    result = (
        supabase.table("labs")
        .select("*")
        .eq("organization_id", organization_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data or []


@router.post("", response_model=Dict[str, Any])
async def create_lab(
    payload: LabCreateRequest,
    current_user: Dict[str, Any] = Depends(require_owner),
) -> Dict[str, Any]:
    organization_id = current_user.get("organization_id")
    if not organization_id:
        raise HTTPException(
            status_code=400, detail="Current user is not linked to an organization"
        )

    supabase = get_supabase_client()
    lab_result = (
        supabase.table("labs")
        .insert(
            {
                "organization_id": organization_id,
                "name": payload.name,
                "owner_name": payload.owner_name or current_user.get("name"),
                "owner_phone": payload.owner_phone or current_user.get("phone"),
                "owner_email": payload.owner_email or current_user.get("email"),
            }
        )
        .execute()
    )
    if not lab_result.data:
        raise HTTPException(status_code=500, detail="Could not create lab")
    lab = lab_result.data[0]
    lab_id = str(lab["id"])

    settings_result = (
        supabase.table("lab_settings")
        .insert(
            {
                "lab_id": lab_id,
                "lab_name": payload.name,
                "address": payload.address,
                "escalation_phone": payload.escalation_phone,
                "language_preference": payload.language_preference,
                # Default Priya Bolna agent for all newly created labs.
                "bolna_agent_id": "26ceb7ea-2c43-4bf2-9eab-0e77ee61e28b",
            }
        )
        .execute()
    )
    if not settings_result.data:
        raise HTTPException(status_code=500, detail="Could not create lab settings")

    return lab


@router.get("/{lab_id}/settings")
def get_lab_settings(lab_id: str) -> Dict[str, Any]:
    """Public read — used by the voice agent during calls."""
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
async def update_lab_settings(
    lab_id: str,
    payload: LabSettingsUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_staff_or_owner),
) -> Dict[str, Any]:
    verify_lab_access(current_user, lab_id)

    supabase = get_supabase_client()
    update_data = payload.model_dump(exclude_none=True)
    update_data["lab_id"] = lab_id

    result = (
        supabase.table("lab_settings")
        .upsert(update_data, on_conflict="lab_id")
        .execute()
    )
    data = result.data or []
    if not data:
        raise HTTPException(status_code=400, detail="Could not update lab settings")
    return data[0]

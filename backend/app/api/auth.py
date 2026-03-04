from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.db.supabase import get_supabase_client
from app.models.schemas import SignupRequest, TokenResponse

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest) -> TokenResponse:
    supabase = get_supabase_client()

    existing = (
        supabase.table("users")
        .select("id")
        .eq("email", str(payload.owner_email))
        .limit(1)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    org_result = (
        supabase.table("organizations")
        .insert(
            {
                "name": payload.organization_name,
                "owner_name": payload.owner_name,
                "owner_email": str(payload.owner_email),
            }
        )
        .execute()
    )
    if not org_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create organization",
        )
    organization = org_result.data[0]
    organization_id = str(organization["id"])

    lab_result = (
        supabase.table("labs")
        .insert(
            {
                "organization_id": organization_id,
                "name": payload.lab_name,
                "owner_name": payload.owner_name,
                "owner_phone": payload.owner_phone,
                "owner_email": str(payload.owner_email),
            }
        )
        .execute()
    )
    if not lab_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create lab",
        )
    lab = lab_result.data[0]
    lab_id = str(lab["id"])

    password_hash = get_password_hash(payload.password)
    user_result = (
        supabase.table("users")
        .insert(
            {
                "organization_id": organization_id,
                "lab_id": lab_id,
                "name": payload.owner_name,
                "phone": payload.owner_phone,
                "email": str(payload.owner_email),
                "role": "owner",
                "password_hash": password_hash,
            }
        )
        .execute()
    )
    if not user_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create owner user",
        )
    user = user_result.data[0]
    user_id = str(user["id"])

    settings_result = (
        supabase.table("lab_settings")
        .insert(
            {
                "lab_id": lab_id,
                "lab_name": payload.lab_name,
                "address": payload.address,
                "escalation_phone": payload.escalation_phone,
                "language_preference": payload.language_preference,
            }
        )
        .execute()
    )
    if not settings_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create lab settings",
        )

    access_token = create_access_token(subject=user_id, lab_id=lab_id, role="owner")
    return TokenResponse(access_token=access_token, role="owner", lab_id=lab_id)


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    supabase = get_supabase_client()
    result = (
        supabase.table("users")
        .select("*")
        .eq("email", form_data.username)
        .limit(1)
        .execute()
    )
    users = result.data or []
    if not users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    user: Dict[str, Any] = users[0]
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User inactive",
        )

    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    user_id = str(user["id"])
    lab_id = str(user["lab_id"]) if user.get("lab_id") else None
    role = user.get("role", "staff")

    access_token = create_access_token(subject=user_id, lab_id=lab_id or "", role=role)
    return TokenResponse(access_token=access_token, role=role, lab_id=lab_id)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> TokenResponse:
    user_id = str(current_user["id"])
    lab_id = str(current_user["lab_id"]) if current_user.get("lab_id") else None
    role = current_user.get("role", "staff")
    access_token = create_access_token(subject=user_id, lab_id=lab_id or "", role=role)
    return TokenResponse(access_token=access_token, role=role, lab_id=lab_id)

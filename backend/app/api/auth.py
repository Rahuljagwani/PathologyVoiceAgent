from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.core.security import (
    create_access_token,
    decode_token,
    get_current_user,
    verify_password,
)
from app.db.supabase import get_supabase_client

router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    lab_id: Optional[str]


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    """
    Username/password login endpoint.
    - `username` field should contain the user's email.
    - `password` is the plain password.
    """
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
    lab_id = str(user.get("lab_id")) if user.get("lab_id") else None
    role = user.get("role", "staff")

    access_token = create_access_token(subject=user_id, lab_id=lab_id or "", role=role)
    return TokenResponse(access_token=access_token, role=role, lab_id=lab_id)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: Dict[str, Any] = Depends(get_current_user)) -> TokenResponse:
    """
    Issue a new access token for the currently authenticated user.
    Client must send existing token in Authorization header.
    """
    user_id = str(current_user["id"])
    lab_id = str(current_user.get("lab_id")) if current_user.get("lab_id") else None
    role = current_user.get("role", "staff")
    access_token = create_access_token(subject=user_id, lab_id=lab_id or "", role=role)
    return TokenResponse(access_token=access_token, role=role, lab_id=lab_id)



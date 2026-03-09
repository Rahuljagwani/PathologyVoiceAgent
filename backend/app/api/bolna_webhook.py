from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Query, Request, status

from app.core.config import get_settings
from app.db.supabase import get_supabase_client
from app.models.schemas import BolnaWebhookPayload

router = APIRouter()


def _validate_signature(request: Request, x_bolna_signature: Optional[str]) -> None:
    settings = get_settings()
    if not settings.BOLNA_WEBHOOK_SECRET:
        return
    if not x_bolna_signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bolna signature",
        )
    # TODO: implement real HMAC verification once Bolna spec is available.


def _validate_bearer_token(authorization: Optional[str]) -> None:
    """
    Validate Authorization: Bearer <token> header for Bolna context lookups.
    Reuses BOLNA_WEBHOOK_SECRET as the shared token; if unset, no validation.
    """
    settings = get_settings()
    if not settings.BOLNA_WEBHOOK_SECRET:
        return

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    token = authorization.split(" ", 1)[1].strip()
    if token != settings.BOLNA_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token",
        )


@router.post("/webhook")
async def bolna_webhook(
    payload: BolnaWebhookPayload,
    request: Request,
    x_bolna_signature: Optional[str] = Header(None, convert_underscores=False),
):
    _validate_signature(request, x_bolna_signature)

    supabase = get_supabase_client()

    insert_payload = {
        "lab_id": payload.lab_id,
        "bolna_call_id": payload.call_id,
        "caller_phone": payload.caller_phone,
        "call_time": datetime.utcnow().isoformat(),
        "duration_seconds": payload.duration_seconds,
        "language_detected": payload.language_detected,
        "flow_triggered": payload.flow_triggered,
        "outcome": payload.outcome,
        "transfer_reason": payload.transfer_reason,
        "summary": payload.summary,
        "recording_url": payload.recording_url,
    }

    result = supabase.table("call_logs").insert(insert_payload).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log Bolna call",
        )

    return {"status": "ok"}


@router.get("/caller-context")
async def bolna_caller_context(
    contact_number: str = Query(..., description="Incoming caller phone number"),
    agent_id: str = Query(..., description="Bolna agent id handling the call"),
    execution_id: str = Query(..., description="Bolna execution id for this call"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """
    Lightweight context endpoint used by Bolna's Inbound tab.

    Bolna will call this with:
      - contact_number: caller's phone number (E.164)
      - agent_id: id of the Bolna agent
      - execution_id: unique id per call

    We ignore the phone for now and look up the lab by bolna_agent_id,
    then return lab-specific variables (like lab_name) that can be used
    in the agent prompt as {lab_name}, {address}, etc.
    """
    _validate_bearer_token(authorization)

    supabase = get_supabase_client()
    # For now, always use the most recently created lab_settings row,
    # effectively mapping this single Bolna agent to the latest lab.
    result = (
        supabase.table("lab_settings")
        .select("*")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    data = result.data or []
    if not data:
        # No labs configured yet; return empty context
        return {}

    lab_settings = data[0]

    # Only return fields that are useful as prompt variables.
    # Include lab_id so tools (reports, tests, home collections) can scope correctly.
    context = {
        "lab_id": lab_settings.get("lab_id"),
        "lab_name": lab_settings.get("lab_name"),
        "address": lab_settings.get("address"),
        "language_preference": lab_settings.get("language_preference"),
        "escalation_phone": lab_settings.get("escalation_phone"),
    }

    # If you ever want to use execution_id in your prompt, you can uncomment this:
    # context["execution_id"] = execution_id

    return context

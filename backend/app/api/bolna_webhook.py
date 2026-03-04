from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException, Request, status
from pydantic import BaseModel

from app.core.config import get_settings
from app.db.supabase import get_supabase_client

router = APIRouter()


class BolnaToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]


class BolnaWebhookPayload(BaseModel):
    call_id: str
    lab_id: str
    caller_phone: Optional[str] = None
    duration_seconds: int
    language_detected: str
    flow_triggered: str  # report_status | test_prep | pricing | home_collection | lab_info | transfer
    outcome: str  # resolved | logged | transferred
    transfer_reason: Optional[str] = None
    summary: Optional[str] = None
    recording_url: Optional[str] = None
    tool_calls: Optional[list[BolnaToolCall]] = None
    raw_metadata: Optional[Dict[str, Any]] = None


def _validate_signature(request: Request, x_bolna_signature: Optional[str]) -> None:
    """
    Optional HMAC-style validation hook. For now we only check that a secret
    is configured and a header is present; you can extend this later to
    verify the payload using BOLNA_WEBHOOK_SECRET.
    """
    settings = get_settings()
    if not settings.BOLNA_WEBHOOK_SECRET:
        # No secret configured; skip validation in development.
        return
    if not x_bolna_signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bolna signature",
        )
    # TODO: implement real signature verification once Bolna spec is available.
    return


@router.post("/webhook")
async def bolna_webhook(
    payload: BolnaWebhookPayload,
    request: Request,
    x_bolna_signature: Optional[str] = Header(None, convert_underscores=False),
):
    """
    Bolna call completion webhook.

    Bolna should be configured to POST here when a call ends. We:
    - optionally validate the webhook signature
    - log the call in `call_logs` table
    - return a simple {\"status\": \"ok\"} JSON
    """
    _validate_signature(request, x_bolna_signature)

    supabase = get_supabase_client()

    call_time = datetime.utcnow().isoformat()
    insert_payload = {
        "lab_id": payload.lab_id,
        "bolna_call_id": payload.call_id,
        "caller_phone": payload.caller_phone,
        "call_time": call_time,
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



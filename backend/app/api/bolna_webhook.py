from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request, status

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

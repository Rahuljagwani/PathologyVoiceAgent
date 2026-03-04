from fastapi import APIRouter

router = APIRouter()


@router.post("/webhook")
async def bolna_webhook():
    """
    Placeholder Bolna call completion webhook endpoint.
    Full payload handling and DB logging will be implemented later.
    """
    return {"status": "ok"}


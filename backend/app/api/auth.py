from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
async def login():
    """
    Placeholder login endpoint.
    Real JWT auth will be implemented in Commit 4.
    """
    return {"detail": "Not implemented yet"}


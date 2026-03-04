from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_tests():
    """Placeholder list tests endpoint."""
    return []


@router.post("")
async def create_test():
    """Placeholder create test endpoint."""
    return {"detail": "not implemented yet"}


@router.put("/{test_id}")
async def update_test(test_id: str):
    """Placeholder update test endpoint."""
    return {"test_id": test_id, "detail": "not implemented yet"}


@router.delete("/{test_id}")
async def delete_test(test_id: str):
    """Placeholder delete test endpoint."""
    return {"test_id": test_id, "detail": "not implemented yet"}


@router.get("/search")
async def search_tests():
    """Placeholder fuzzy search endpoint for voice agent."""
    return []


@router.get("/prep")
async def get_test_prep():
    """Placeholder prep instructions endpoint for voice agent."""
    return {"detail": "not implemented yet"}


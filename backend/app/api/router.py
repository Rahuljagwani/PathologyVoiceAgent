from fastapi import APIRouter

from . import auth, labs, reports, tests, home_collections, calls, dashboard, bolna_webhook

api_router = APIRouter()

# Auth & labs
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(labs.router, prefix="/labs", tags=["labs"])

# Core resources
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(home_collections.router, prefix="/home-collections", tags=["home-collections"])

# Calls & dashboard
api_router.include_router(calls.router, prefix="/calls", tags=["calls"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Bolna webhook
api_router.include_router(bolna_webhook.router, prefix="/bolna", tags=["bolna"])


from typing import Optional

from supabase import Client, create_client

from app.core.config import get_settings

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError("Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.")

    _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _supabase_client


def supabase_healthcheck() -> bool:
    """
    Lightweight health check hook. This will be wired to real logic once
    database tables and migrations are in place (Commit 2).
    """
    settings = get_settings()
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY)


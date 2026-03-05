from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = "development"
    BASE_URL: str = "http://localhost:8000"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Bolna
    # Optional shared secret used to validate incoming webhooks.
    BOLNA_WEBHOOK_SECRET: str = ""

    # Auth
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # CORS
    # Include common local frontend ports by default (CRA: 3000, Vite: 5173).
    # In production, override via env var, e.g.:
    # CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend-domain.com
    CORS_ALLOW_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


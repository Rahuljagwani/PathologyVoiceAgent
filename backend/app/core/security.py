from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import jwt

from app.core.config import get_settings


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Minimal JWT helper; full auth flow will be built in Commit 4.
    """
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {"sub": subject, "exp": datetime.utcnow() + expires_delta}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


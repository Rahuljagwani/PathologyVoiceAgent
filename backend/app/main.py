from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Pathology Lab Voice Agent API",
        version="0.1.0",
    )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request, exc: HTTPException):
        detail = exc.detail
        message = detail if isinstance(detail, str) else "Request failed"

        content = {
            "success": False,
            "message": message,
        }
        if not isinstance(detail, str):
            content["details"] = detail

        return JSONResponse(
            status_code=exc.status_code,
            content=content,
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Validation error",
                "details": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request, exc: Exception):
        # FastAPI / Uvicorn will also log this; we return a safe payload to clients.
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
            },
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ALLOW_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    async def health_check():
        return {"status": "ok"}

    app.include_router(api_router, prefix="/api")

    return app


app = create_app()


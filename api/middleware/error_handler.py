"""
Equalyze — Global Error Handler Middleware
Standardizes all API error responses into a consistent JSON envelope.
Enterprise-grade: no stack traces leak to clients in production.
"""

import traceback
import uuid
from datetime import datetime, timezone
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class ErrorEnvelope:
    """Standard error response format for all API errors."""

    @staticmethod
    def build(
        error_code: str,
        detail: str,
        status_code: int,
        request_id: str = "",
        path: str = "",
    ) -> dict:
        return {
            "error": error_code,
            "detail": detail,
            "status_code": status_code,
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "path": path,
        }


# Map common exceptions → (status_code, error_code)
EXCEPTION_MAP = {
    ValueError: (400, "VALIDATION_ERROR"),
    KeyError: (400, "MISSING_FIELD"),
    FileNotFoundError: (404, "FILE_NOT_FOUND"),
    PermissionError: (403, "FORBIDDEN"),
    NotImplementedError: (501, "NOT_IMPLEMENTED"),
}


class GlobalErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Catches all unhandled exceptions and returns standardized JSON.
    In production: sanitized message only.
    In development: includes exception type for debugging.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            request_id = getattr(request.state, "request_id", str(uuid.uuid4())[:8])
            path = request.url.path
            is_dev = request.app.debug if hasattr(request.app, "debug") else False

            # HTTPException — pass through with envelope
            if isinstance(exc, HTTPException):
                return JSONResponse(
                    status_code=exc.status_code,
                    content=ErrorEnvelope.build(
                        error_code=f"HTTP_{exc.status_code}",
                        detail=str(exc.detail),
                        status_code=exc.status_code,
                        request_id=request_id,
                        path=path,
                    ),
                )

            # Known exception types
            for exc_type, (status, code) in EXCEPTION_MAP.items():
                if isinstance(exc, exc_type):
                    return JSONResponse(
                        status_code=status,
                        content=ErrorEnvelope.build(
                            error_code=code,
                            detail=str(exc),
                            status_code=status,
                            request_id=request_id,
                            path=path,
                        ),
                    )

            # Unknown exception — 500
            print(f"[ERROR] request_id={request_id} path={path} error={exc}")
            if is_dev:
                traceback.print_exc()

            return JSONResponse(
                status_code=500,
                content=ErrorEnvelope.build(
                    error_code="INTERNAL_SERVER_ERROR",
                    detail="An unexpected error occurred. Contact support with your request ID."
                    if not is_dev
                    else f"{type(exc).__name__}: {str(exc)}",
                    status_code=500,
                    request_id=request_id,
                    path=path,
                ),
            )

"""
Equalyze — Request Logging Middleware
Enterprise-grade structured request tracing.

Every request gets a unique X-Request-ID. All log lines include it.
Uses Python contextvars for propagation across async call stacks.
"""

import time
import uuid
import logging
import contextvars
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# ── Context Variable ─────────────────────────────
# Any code in the request lifecycle can call get_request_id()
# to get the current request's trace ID.

_request_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar(
    "request_id", default=""
)


def get_request_id() -> str:
    """Get current request ID from context. Safe to call from anywhere."""
    return _request_id_ctx.get()


def bind_request_id(request_id: str) -> contextvars.Token:
    """Bind a request ID to the current context."""
    return _request_id_ctx.set(request_id)


# ── JSON Log Formatter ───────────────────────────

class StructuredFormatter(logging.Formatter):
    """JSON-structured log formatter with request_id injection."""

    def format(self, record: logging.LogRecord) -> str:
        request_id = get_request_id()
        # Attach request_id to every log line
        timestamp = self.formatTime(record, "%Y-%m-%dT%H:%M:%S")
        level = record.levelname
        message = record.getMessage()
        module = record.module

        return (
            f'{{"timestamp":"{timestamp}",'
            f'"level":"{level}",'
            f'"request_id":"{request_id}",'
            f'"module":"{module}",'
            f'"message":"{message}"}}'
        )


def setup_logging():
    """Configure root logger with structured JSON output."""
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)


# ── Request Logging Middleware ────────────────────

logger = logging.getLogger("equalyze.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Assigns X-Request-ID to every request.
    Logs: method, path, status, duration_ms, user hint.
    Attaches request_id to response headers for client correlation.
    """

    async def dispatch(self, request: Request, call_next):
        # Read forwarded ID or generate new one
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:12])

        # Bind to contextvars (propagates through entire async stack)
        token = bind_request_id(request_id)

        # Store on request.state for error handler access
        request.state.request_id = request_id

        start = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            # Let error handler middleware deal with it
            raise
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 1)
            status = getattr(response, "status_code", 500) if "response" in dir() else 500

            # Skip health check noise
            if request.url.path != "/health":
                logger.info(
                    f"{request.method} {request.url.path} → {status} ({duration_ms}ms)"
                )

            _request_id_ctx.reset(token)

        # Attach to response headers for client-side correlation
        response.headers["X-Request-ID"] = request_id
        return response

"""
Equalyze — Security Middleware
Rate limiting, request size limits, and security headers.

NOTE: Rate limiting uses in-memory sliding window storage.
For global production deployment, swap to Redis-backed storage.
"""

import time
import collections
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


# ── In-Memory Sliding Window Rate Limiter ─────────

class SlidingWindowCounter:
    """
    In-memory sliding window rate limiter.

    Production note: This is per-instance only. For horizontal scaling
    across multiple Cloud Run instances, replace with Redis INCR + EXPIRE
    or GCP API Gateway rate limiting policies.
    """

    def __init__(self):
        # key → deque of timestamps
        self._windows: dict[str, collections.deque] = {}

    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        now = time.time()
        cutoff = now - window_seconds

        if key not in self._windows:
            self._windows[key] = collections.deque()

        window = self._windows[key]

        # Prune expired entries
        while window and window[0] < cutoff:
            window.popleft()

        if len(window) >= max_requests:
            return False

        window.append(now)
        return True

    def remaining(self, key: str, max_requests: int, window_seconds: int) -> int:
        now = time.time()
        cutoff = now - window_seconds

        if key not in self._windows:
            return max_requests

        window = self._windows[key]
        while window and window[0] < cutoff:
            window.popleft()

        return max(0, max_requests - len(window))


# Singleton
_limiter = SlidingWindowCounter()


# ── Rate Limit Rules ──────────────────────────────

RATE_RULES = [
    # (path_prefix, max_requests, window_seconds, key_type)
    ("/api/v1/auth/", 10, 60, "ip"),          # Auth: 10/min per IP
    ("/api/v1/audits/", 300, 60, "ip"),        # Audits: 300/min per IP (high limit for status polling)
    ("/api/v1/datasets/upload", 10, 60, "ip"), # Uploads: 10/min per IP
]

GENERAL_RATE = (60, 60)  # 60 req/min per IP (default)

# ── Max request body sizes ────────────────────────
MAX_BODY_BYTES = 50 * 1024 * 1024  # 50MB
UPLOAD_PATHS = ["/api/v1/datasets/upload"]


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Enterprise security layer:
    1. Rate limiting (sliding window, in-memory)
    2. Request size validation
    3. Security response headers
    """

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # ── 1. Rate Limiting ──────────────────────
        rate_key = None
        max_req, window = GENERAL_RATE

        for prefix, limit, win, key_type in RATE_RULES:
            if path.startswith(prefix):
                max_req, window = limit, win
                rate_key = f"{key_type}:{client_ip}:{prefix}"
                break

        if not rate_key:
            rate_key = f"ip:{client_ip}:general"

        if not _limiter.is_allowed(rate_key, max_req, window):
            remaining = _limiter.remaining(rate_key, max_req, window)
            return JSONResponse(
                status_code=429,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "detail": f"Too many requests. Limit: {max_req} per {window}s.",
                    "retry_after_seconds": window,
                },
                headers={
                    "Retry-After": str(window),
                    "X-RateLimit-Limit": str(max_req),
                    "X-RateLimit-Remaining": str(remaining),
                },
            )

        # ── 2. Request Size Validation ────────────
        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > MAX_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={
                        "error": "PAYLOAD_TOO_LARGE",
                        "detail": f"Request body exceeds {MAX_BODY_BYTES // (1024*1024)}MB limit.",
                    },
                )

        # ── 3. Process Request ────────────────────
        response = await call_next(request)

        # ── 4. Security Headers ───────────────────
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # HSTS only in production (when behind HTTPS)
        if not request.url.hostname in ("localhost", "127.0.0.1"):
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        # Rate limit headers
        remaining = _limiter.remaining(rate_key, max_req, window)
        response.headers["X-RateLimit-Limit"] = str(max_req)
        response.headers["X-RateLimit-Remaining"] = str(remaining)

        return response

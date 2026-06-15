"""
Equalyze — FastAPI Application Entry Point
Enterprise-grade API with structured logging, security middleware, and request tracing.
"""

import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routers import datasets, audits, organizations, monitoring, counterfactual, auth, reports, cicd, llm_audits
from api.config import settings
from api.services.scheduler import start_scheduler
from api.middleware.logging import RequestLoggingMiddleware, setup_logging
from api.middleware.security import SecurityMiddleware
from api.middleware.error_handler import GlobalErrorHandlerMiddleware, ErrorEnvelope
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# ── Structured Logging Setup ─────────────────────
setup_logging()
logger = logging.getLogger("equalyze.app")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
VERSION = "1.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Equalyze API v{VERSION} starting in {ENVIRONMENT} mode")
    scheduler = start_scheduler()
    yield
    # Shutdown
    logger.info("Equalyze API shutting down")
    scheduler.shutdown()


app = FastAPI(
    title="Equalyze API",
    description="AI Bias Detection & Governance Platform — Enterprise Edition",
    version=VERSION,
    lifespan=lifespan,
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None,
)


# ── Exception Handlers ───────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    from api.middleware.logging import get_request_id
    request_id = get_request_id() or getattr(request.state, "request_id", "")
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content=ErrorEnvelope.build(
            error_code="VALIDATION_ERROR",
            detail=str(exc.errors()),
            status_code=422,
            request_id=request_id,
            path=str(request.url.path),
        ),
    )


# ── Middleware Stack ─────────────────────────────
# Order matters: outermost middleware runs first.
# 1. Security (rate limiting + headers) — outermost
# 2. Request logging (X-Request-ID) — traces everything inside
# 3. CORS — must be before error handler
# 4. Error handler — catches exceptions from routes

app.add_middleware(SecurityMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://equalyze-frontend-1085178935109.us-central1.run.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Remaining", "X-RateLimit-Limit"],
)
app.add_middleware(GlobalErrorHandlerMiddleware)


# ── Health Check ─────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "equalyze-api",
        "version": VERSION,
        "environment": ENVIRONMENT,
    }


# ── Mount Routers ────────────────────────────────
app.include_router(datasets.router, prefix="/api/v1", tags=["datasets"])
app.include_router(audits.router, prefix="/api/v1", tags=["audits"])
app.include_router(organizations.router, prefix="/api/v1", tags=["organizations"])
app.include_router(monitoring.router, prefix="/api/v1", tags=["monitoring"])
app.include_router(counterfactual.router, prefix="/api/v1", tags=["counterfactual"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(cicd.router, prefix="/api/v1", tags=["cicd"])
app.include_router(llm_audits.router, prefix="/api/v1", tags=["llm-audits"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

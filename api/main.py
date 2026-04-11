"""
Equalyze — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routers import datasets, audits, organizations, monitoring
from api.config import settings
from api.services.scheduler import start_scheduler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import sys

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = start_scheduler()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(
    title="Equalyze API",
    description="AI Bias Detection & Governance Platform",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    body = await request.body()
    print(f"Validation Error: {exc.errors()}", file=sys.stderr)
    print(f"Request Body: {body.decode()}", file=sys.stderr)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ─────────────────────────────────
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "equalyze-api", "version": "1.0.0"}


# ── Mount Routers ────────────────────────────────
app.include_router(datasets.router, prefix="/api/v1", tags=["datasets"])
app.include_router(audits.router, prefix="/api/v1", tags=["audits"])
app.include_router(organizations.router, prefix="/api/v1", tags=["organizations"])
app.include_router(monitoring.router, prefix="/api/v1", tags=["monitoring"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

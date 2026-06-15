# ── Stage 1: Builder ─────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build deps separately for layer caching
COPY api/requirements.txt ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Runtime ─────────────────────────────
FROM python:3.11-slim AS runner

# Security: non-root user
RUN groupadd -r equalyze && useradd -r -g equalyze equalyze

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

WORKDIR /app

# Copy only installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY api ./api/
COPY trained_models ./trained_models/

# Remove any dev artifacts
RUN find /app -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# Pre-create storage directories and set ownership for non-root user
RUN mkdir -p /app/storage/datasets /app/storage/reports && \
    chown -R equalyze:equalyze /app

# Switch to non-root user
USER equalyze

EXPOSE ${PORT}

# Health check for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/health')" || exit 1

CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT}"]

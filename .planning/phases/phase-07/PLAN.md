# Phase 7 Plan — Asynchronous Scalability

## Objective
Decouple the frontend from heavy ML processing using Cloud Tasks and Cloud Run.

## Tasks

### Wave 1: Cloud Run Worker
- [x] Create `worker/main.py` FastAPI app to handle heavy background tasks decoupled from main API.
- [x] Expose `POST /task` to simulate Cloud Run webhooks.

### Wave 2: Cloud Tasks Enqueue
- [x] Create `api/services/cloud_tasks.py` client to push HTTP tasks.
- [x] Refactor `api/routers/audits.py` to enqueue background ML jobs using `cloud_tasks.enqueue_audit_run()`.

### Wave 3: UI Polling & Decoupled Parsing
- [x] Refactor `api/routers/datasets.py` `POST /datasets/upload` to immediately return HTTP 202 async with a `job_id`.
- [x] Enqueue `dataset-parse-queue` job from upload API.
- [x] Implement polling loop in Next.js `handleUpload` (`frontend/app/dashboard/audits/new/page.tsx`).

## Next Steps
Phase 7 completed. Proceed to Phase 8.

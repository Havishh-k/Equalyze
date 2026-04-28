# Equalyze GCP Deployment Script (PowerShell)
# This script builds and deploys both backend and frontend to Google Cloud Run.

$ErrorActionPreference = "Stop"

# Resolve gcloud path (not always in PATH from regular PowerShell)
$GCLOUD = (Get-Command gcloud -ErrorAction SilentlyContinue).Source
if (-not $GCLOUD) {
    $GCLOUD = "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
}
if (-not (Test-Path $GCLOUD)) {
    Write-Error "gcloud not found. Install Google Cloud SDK or open the Cloud SDK Shell."
    exit 1
}
Write-Host "Using gcloud at: $GCLOUD" -ForegroundColor Gray

$PROJECT_ID = & $GCLOUD config get-value project
if (-not $PROJECT_ID) {
    Write-Error "Google Cloud Project ID not set. Please run 'gcloud config set project [YOUR_PROJECT_ID]'"
    exit
}

$REGION = "us-central1"
$REPO_NAME = "equalyze-repo"
$IMAGE_TAG = "latest"

# Load Gemini API Key from .env
$GEMINI_KEY = ""
if (Test-Path ".\.env") {
    $envContent = Get-Content ".\.env" | Where-Object { $_ -match "^GEMINI_API_KEY=" }
    if ($envContent) {
        $GEMINI_KEY = ($envContent -split "=", 2)[1]
    }
}

Write-Host "Starting deployment for project: $PROJECT_ID" -ForegroundColor Cyan

# 1. Ensure Artifact Registry exists (ignore error if already exists)
Write-Host "Ensuring Artifact Registry '$REPO_NAME' exists..." -ForegroundColor Yellow
try {
    & $GCLOUD artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="Equalyze Docker images" --quiet 2>&1 | Out-Null
} catch {
    Write-Host "  Registry already exists, continuing..." -ForegroundColor Gray
}
$global:LASTEXITCODE = 0

# 2. Build and Push Backend (uses root context with api/Dockerfile)
Write-Host "Building and pushing Backend..." -ForegroundColor Yellow
$BACKEND_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/backend:$IMAGE_TAG"
# Cloud Run requires linux/amd64 images; force platform on Apple Silicon hosts.
docker build --platform linux/amd64 -t $BACKEND_IMAGE -f ./api/Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend image build failed. Halting deployment."
    exit 1
}
docker push $BACKEND_IMAGE
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend image push failed. Halting deployment."
    exit 1
}

# 3. Deploy Backend to Cloud Run (with env vars)
Write-Host "Deploying Backend to Cloud Run..." -ForegroundColor Yellow
$ENV_VARS = "ENVIRONMENT=production"
if ($GEMINI_KEY) {
    $ENV_VARS = "$ENV_VARS,GEMINI_API_KEY=$GEMINI_KEY"
}

$BACKEND_URL = & $GCLOUD run deploy equalyze-backend `
    --image $BACKEND_IMAGE `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars $ENV_VARS `
    --memory 1Gi `
    --format="value(status.url)"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend deployment failed. Halting deployment."
    exit 1
}

Write-Host "Backend deployed at: $BACKEND_URL" -ForegroundColor Green

# 4. Build and Push Frontend
Write-Host "Building and pushing Frontend..." -ForegroundColor Yellow
$FRONTEND_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/frontend:$IMAGE_TAG"
# Build with the deployed backend URL baked in
docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_API_URL="$BACKEND_URL/api/v1" -t $FRONTEND_IMAGE ./frontend
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend image build failed. Halting deployment."
    exit 1
}
docker push $FRONTEND_IMAGE
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend image push failed. Halting deployment."
    exit 1
}

# 5. Deploy Frontend to Cloud Run
Write-Host "Deploying Frontend to Cloud Run..." -ForegroundColor Yellow
& $GCLOUD run deploy equalyze-frontend `
    --image $FRONTEND_IMAGE `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --memory 512Mi
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend deployment failed. Halting deployment."
    exit 1
}

# 6. Update Backend CORS with the frontend URL
$FRONTEND_URL = & $GCLOUD run services describe equalyze-frontend --region $REGION --format="value(status.url)"
Write-Host "Frontend deployed at: $FRONTEND_URL" -ForegroundColor Green

& $GCLOUD run services update equalyze-backend `
    --region $REGION `
    --update-env-vars "FRONTEND_URL=$FRONTEND_URL"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend CORS update failed."
    exit 1
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "  Backend:  $BACKEND_URL" -ForegroundColor Cyan
Write-Host "  Frontend: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Green

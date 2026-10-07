# Start EzyKwelez FastAPI Server with Hot-Reloading
$ErrorActionPreference = "Stop"

Write-Host "Starting EzyKwelez FastAPI Server on http://localhost:8000..." -ForegroundColor Cyan
python -m uvicorn app.main:app --app-dir apps/api --reload --host 0.0.0.0 --port 8000

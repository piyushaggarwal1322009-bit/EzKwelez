"""EzyKwelez FastAPI Application Entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.router import api_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Campus Disruption-Response & Recovery Engine API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    """Root entrypoint with service metadata."""
    return {
        "service": "ezykwelez-api",
        "documentation": "/docs",
        "health": "/health",
        "status": "online",
    }

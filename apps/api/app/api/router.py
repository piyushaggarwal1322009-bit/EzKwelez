"""Main API Router aggregating all domain sub-routers."""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.campus import router as campus_router

api_router = APIRouter()

# Register core system routes
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(campus_router)

"""Main API Router aggregating all domain sub-routers."""

from fastapi import APIRouter
from app.api.routes.campus import router as campus_router
from app.api.routes.graph import router as graph_router
from app.api.routes.health import router as health_router
from app.api.routes.impact import router as impact_router

api_router = APIRouter()

# Register core health & diagnostics router
api_router.include_router(health_router)

# Register campus & live conditions router (Phase 3)
api_router.include_router(campus_router)

# Register dependency graph router (Phase 4)
api_router.include_router(graph_router)

# Register impact analysis & blast radius router (Phase 4)
api_router.include_router(impact_router)

"""Main API Router aggregating all domain sub-routers."""

from fastapi import APIRouter
from app.api.routes.auth import router as auth_router
from app.api.routes.campus import router as campus_router
from app.api.routes.graph import router as graph_router
from app.api.routes.health import router as health_router
from app.api.routes.impact import router as impact_router
from app.api.routes.incidents import router as incidents_router

api_router = APIRouter()

# Register core health & diagnostics router
api_router.include_router(health_router)

# Register auth router
api_router.include_router(auth_router)

# Register campus router
api_router.include_router(campus_router)

# Register dependency graph router
api_router.include_router(graph_router)

# Register impact analysis & blast radius router
api_router.include_router(impact_router)

# Register incidents router
api_router.include_router(incidents_router)

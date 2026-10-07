"""Main API Router aggregating all domain sub-routers."""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router

api_router = APIRouter()

# Register core system routes
api_router.include_router(health_router)
api_router.include_router(auth_router)

# Future domain sub-routers will be mounted here in Phase 3+:
# api_router.include_router(campus_router, prefix="/campus", tags=["Campus"])
# api_router.include_router(incidents_router, prefix="/incidents", tags=["Incidents"])
# api_router.include_router(graph_router, prefix="/graph", tags=["Graph"])
# api_router.include_router(recovery_router, prefix="/recovery", tags=["Recovery"])
# api_router.include_router(simulation_router, prefix="/simulation", tags=["Simulation"])

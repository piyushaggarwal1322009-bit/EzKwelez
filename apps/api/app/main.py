"""EzyKwelez FastAPI Application Entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
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

# Mount API Routers (Root for local/tests, /api prefix for Vercel/proxied routing)
app.include_router(api_router)
app.include_router(api_router, prefix="/api", include_in_schema=False)


@app.get("/api/docs", include_in_schema=False)
async def get_api_docs():
    """Swagger UI documentation under /api prefix."""
    return get_swagger_ui_html(
        openapi_url="/api/openapi.json",
        title=f"{settings.app_name} - API Documentation",
    )


@app.get("/api/redoc", include_in_schema=False)
async def get_api_redoc():
    """ReDoc documentation under /api prefix."""
    return get_redoc_html(
        openapi_url="/api/openapi.json",
        title=f"{settings.app_name} - ReDoc",
    )


@app.get("/api/openapi.json", include_in_schema=False)
async def get_api_openapi():
    """OpenAPI schema JSON under /api prefix."""
    return JSONResponse(
        get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )
    )


@app.get("/", tags=["Root"])
@app.get("/api", tags=["Root"], include_in_schema=False)
async def root():
    """Root entrypoint with service metadata."""
    return {
        "service": "ezykwelez-api",
        "documentation": "/docs",
        "health": "/health",
        "status": "online",
    }

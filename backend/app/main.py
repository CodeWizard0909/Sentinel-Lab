"""SentinelLab — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_health import router as health_router
from app.api.routes_scans import router as scans_router
from app.api.routes_projects import router as projects_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="SentinelLab",
    description="Multi-Agent AI Software Verification Platform",
    version="0.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health_router)
app.include_router(scans_router, prefix="/scans", tags=["scans"])
app.include_router(projects_router, prefix="/projects", tags=["projects"])

try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")
except ImportError:
    handler = None


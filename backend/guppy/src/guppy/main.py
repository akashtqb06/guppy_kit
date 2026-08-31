"""
Guppy Kit — FastAPI application entry point.

Startup sequence:
  1. Load settings
  2. Discover and register all tools
  3. Mount API routers
  4. Register exception handlers
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from guppy.auth.admin_seed import seed_admin_user
from guppy.core.config import get_settings
from guppy.core.db import AsyncSessionFactory
from guppy.core.exceptions import GuppyError
from guppy.tools.registry import registry

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
)
logger = logging.getLogger("guppy")

# ── Application factory ───────────────────────────────────────────────────────

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s v%s", settings.app_name, settings.app_version)
    registry.discover()
    logger.info("Tool registry ready — %d tool(s) registered", len(registry))
    async with AsyncSessionFactory() as db:
        await seed_admin_user(db)
    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    app = FastAPI(
        lifespan=lifespan,
        title=settings.app_name,
        version=settings.app_version,
        description="Professional Digital Workbench — Capability Layer API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ────────────────────────────────────────────────
    @app.exception_handler(GuppyError)
    async def guppy_error_handler(request: Request, exc: GuppyError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.error_code,
                "message": exc.message,
                "detail": exc.detail,
            },
        )

    # ── Routers ───────────────────────────────────────────────────────────
    from guppy.api.admin import router as admin_router
    from guppy.api.artifacts import router as artifacts_router
    from guppy.api.auth import router as auth_router
    from guppy.api.events import router as events_router
    from guppy.api.executions import router as executions_router
    from guppy.api.projects import router as projects_router
    from guppy.api.tools import router as tools_router
    from guppy.mcp.server import _register_tools, mcp

    _register_tools()

    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(tools_router, prefix=settings.api_prefix)
    app.include_router(artifacts_router, prefix=settings.api_prefix)
    app.include_router(events_router, prefix=settings.api_prefix)
    app.include_router(projects_router, prefix=settings.api_prefix)
    app.include_router(executions_router, prefix=settings.api_prefix)
    app.include_router(admin_router, prefix=settings.api_prefix)

    # Mount MCP server
    app.mount("/mcp", mcp.streamable_http_app())

    # ── Health check ──────────────────────────────────────────────────────
    @app.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "version": settings.app_version}

    return app


app = create_app()

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

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from guppy.core.config import get_settings
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


def create_app() -> FastAPI:
    app = FastAPI(
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

    # ── Startup / shutdown ────────────────────────────────────────────────
    @app.on_event("startup")
    async def startup() -> None:
        logger.info("Starting %s v%s", settings.app_name, settings.app_version)
        registry.discover()
        logger.info("Tool registry ready — %d tool(s) registered", len(registry))

    @app.on_event("shutdown")
    async def shutdown() -> None:
        logger.info("Shutting down %s", settings.app_name)

    # ── Routers ───────────────────────────────────────────────────────────
    from guppy.api.tools import router as tools_router

    app.include_router(tools_router, prefix=settings.api_prefix)

    # ── Health check ──────────────────────────────────────────────────────
    @app.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "version": settings.app_version}

    return app


app = create_app()

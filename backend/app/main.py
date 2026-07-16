"""FastAPI application factory for River Monitoring V1."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .api import router
from .broadcast import EventBroadcaster
from .communication import SerialTransport, SimulatorTransport
from .config import Settings
from .database import ReadingRepository
from .service import TelemetryService


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    logging.basicConfig(
        level=getattr(logging, settings.log_level, logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    repository = ReadingRepository(settings.database_url)
    # Initialize before service construction because the service restores the
    # latest persisted reading for its initial connection snapshot.
    repository.initialize()
    broadcaster = EventBroadcaster()
    transport = (
        SimulatorTransport(settings.simulator_interval_seconds)
        if settings.transport == "simulator"
        else SerialTransport(settings.com_port, settings.baud_rate)
    )
    service = TelemetryService(
        transport,
        repository,
        broadcaster,
        reconnect_seconds=settings.reconnect_seconds,
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        await service.start()
        yield
        await service.stop()
        repository.close()

    app = FastAPI(
        title="River Monitoring API",
        version="1.0.0",
        description="Read-only V1 telemetry ingestion and monitoring API.",
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.repository = repository
    app.state.broadcaster = broadcaster
    app.state.telemetry_service = service
    app.include_router(router)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
    if frontend_dist.exists():
        assets = frontend_dist / "assets"
        if assets.exists():
            app.mount("/assets", StaticFiles(directory=assets), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def frontend(full_path: str):
            candidate = frontend_dist / full_path
            if full_path and candidate.is_file():
                return FileResponse(candidate)
            return FileResponse(frontend_dist / "index.html")

    return app


app = create_app()


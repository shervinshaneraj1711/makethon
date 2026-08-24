"""FastAPI application factory for River Monitoring Wi-Fi telemetry."""

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
from .communication.base import TelemetryTransport
from .config import Settings
from .database import ReadingRepository
from .service import TelemetryService


class WiFiHTTPTransport(TelemetryTransport):
    """
    Logical transport used when telemetry arrives through
    the FastAPI HTTP endpoint.

    The ESP32 sends telemetry to:

        POST /api/v1/telemetry

    Therefore the backend does not open or read a COM port.
    """

    name = "wifi-http"
    endpoint = "HTTP /api/v1/telemetry"

    def connect(self) -> None:
        # No persistent connection is required.
        pass

    def readline(self) -> str | None:
        # Telemetry does not arrive through a background
        # line-reading loop. It arrives through FastAPI.
        return None

    def write(self, data: bytes) -> None:
        # The current Wi-Fi implementation is for
        # ESP32 -> laptop telemetry ingestion.
        #
        # Outbound ESP32 commands are intentionally not
        # sent through this transport yet.
        logging.getLogger(__name__).debug(
            "Wi-Fi transport received outbound command: %s",
            data.decode("utf-8", errors="replace").strip(),
        )

    def close(self) -> None:
        # Nothing to close.
        pass


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings.from_env()

    logging.basicConfig(
        level=getattr(
            logging,
            settings.log_level,
            logging.INFO,
        ),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    # ---------------------------------------------------------
    # Database
    # ---------------------------------------------------------
    repository = ReadingRepository(settings.database_url)

    # Initialize before service construction because the service
    # restores the latest persisted reading for its snapshot.
    repository.initialize()

    # ---------------------------------------------------------
    # WebSocket broadcaster
    # ---------------------------------------------------------
    broadcaster = EventBroadcaster()

    # ---------------------------------------------------------
    # Wi-Fi HTTP transport
    # ---------------------------------------------------------
    #
    # IMPORTANT:
    # Do NOT create SerialTransport here.
    #
    # The ESP32 sends telemetry through:
    #
    # POST /api/v1/telemetry
    #
    # ---------------------------------------------------------
    transport = WiFiHTTPTransport()

    # ---------------------------------------------------------
    # Telemetry service
    # ---------------------------------------------------------
    service = TelemetryService(
        transport,
        repository,
        broadcaster,
        reconnect_seconds=settings.reconnect_seconds,
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # We deliberately do NOT call service.start().
        #
        # service.start() launches the background transport
        # readline() loop, which is appropriate for Serial or
        # Simulator but not for HTTP ingestion.
        #
        # The API endpoint calls service.ingest() directly.
        yield

        await service.stop()
        repository.close()

    # ---------------------------------------------------------
    # FastAPI application
    # ---------------------------------------------------------
    app = FastAPI(
        title="River Monitoring API",
        version="1.0.0",
        description=(
            "River monitoring telemetry API using "
            "Wi-Fi HTTP ingestion."
        ),
        lifespan=lifespan,
    )

    # ---------------------------------------------------------
    # Application state
    # ---------------------------------------------------------
    app.state.settings = settings
    app.state.repository = repository
    app.state.broadcaster = broadcaster
    app.state.telemetry_service = service

    # ---------------------------------------------------------
    # API routes
    # ---------------------------------------------------------
    app.include_router(router)

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---------------------------------------------------------
    # React production build
    # ---------------------------------------------------------
    frontend_dist = (
        Path(__file__).resolve().parents[2]
        / "frontend"
        / "dist"
    )

    if frontend_dist.exists():
        assets = frontend_dist / "assets"

        if assets.exists():
            app.mount(
                "/assets",
                StaticFiles(directory=assets),
                name="assets",
            )

        @app.get(
            "/{full_path:path}",
            include_in_schema=False,
        )
        async def frontend(full_path: str):
            candidate = frontend_dist / full_path

            if full_path and candidate.is_file():
                return FileResponse(candidate)

            return FileResponse(
                frontend_dist / "index.html"
            )

    return app


app = create_app()

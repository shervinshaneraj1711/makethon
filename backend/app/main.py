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
    Placeholder transport for HTTP telemetry ingestion.

    The ESP32 sends telemetry to:
        POST /api/v1/telemetry

    Therefore the FastAPI application does not need to open
    COM6 or continuously read from a serial port.
    """

    name = "Wi-Fi HTTP"

    def __init__(self) -> None:
        self.endpoint = "POST /api/v1/telemetry"

    def connect(self) -> None:
        # No persistent connection is opened.
        pass

    def readline(self) -> str | None:
        # Telemetry arrives through the FastAPI HTTP endpoint,
        # not through a background read loop.
        return None

    def write(self, data: bytes) -> None:
        """
        Kept for compatibility with TelemetryService.

        The current Wi-Fi telemetry implementation is focused on
        ESP32 -> Laptop ingestion. Hardware commands are not sent
        through this transport yet.
        """
        logging.getLogger(__name__).debug(
            "Ignoring outbound hardware command in Wi-Fi HTTP mode: %s",
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

    repository = ReadingRepository(
        settings.database_url
    )

    repository.initialize()

    # ---------------------------------------------------------
    # Event broadcaster
    # ---------------------------------------------------------

    broadcaster = EventBroadcaster()

    # ---------------------------------------------------------
    # Wi-Fi HTTP transport
    # ---------------------------------------------------------
    #
    # IMPORTANT:
    # We deliberately do NOT create SerialTransport here.
    #
    # ESP32 telemetry now arrives through:
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

        # Do NOT call service.start().
        #
        # service.start() would launch the old continuous
        # transport.readline() loop.
        #
        # Incoming telemetry is instead handled by the
        # HTTP endpoint in api.py.

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

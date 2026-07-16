"""Orchestrates transport, parsing, storage, and live delivery."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from .broadcast import EventBroadcaster
from .communication.base import TelemetryTransport
from .database import ReadingRepository
from .domain import ConnectionSnapshot
from .parser import TelemetryParseError, parse_telemetry

logger = logging.getLogger(__name__)


class TelemetryService:
    """Owns the single active V1 telemetry connection."""

    def __init__(
        self,
        transport: TelemetryTransport,
        repository: ReadingRepository,
        broadcaster: EventBroadcaster,
        *,
        reconnect_seconds: float,
    ) -> None:
        self.transport = transport
        self.repository = repository
        self.broadcaster = broadcaster
        self.reconnect_seconds = reconnect_seconds
        self._task: asyncio.Task[None] | None = None
        self._stopping = asyncio.Event()
        latest = repository.latest()
        self.snapshot = ConnectionSnapshot(
            state="starting",
            transport=transport.name,
            port=transport.endpoint,
            detail="Telemetry service is starting",
            last_update_at=latest.received_at if latest else None,
            latest_device_id=latest.device_id if latest else None,
        )

    async def start(self) -> None:
        if self._task is None:
            self._task = asyncio.create_task(self._run(), name="telemetry-service")

    async def stop(self) -> None:
        self._stopping.set()
        await asyncio.to_thread(self.transport.close)
        if self._task is not None:
            await self._task
            self._task = None

    async def _set_state(self, state: str, detail: str) -> None:
        self.snapshot = ConnectionSnapshot(
            state=state,
            transport=self.transport.name,
            port=self.transport.endpoint,
            detail=detail,
            last_update_at=self.snapshot.last_update_at,
            latest_device_id=self.snapshot.latest_device_id,
        )
        await self.broadcaster.publish(
            {"type": "connection", "data": self.snapshot.as_dict()}
        )

    async def _diagnostic(self, level: str, event: str, detail: str) -> None:
        getattr(logger, level.lower(), logger.info)("%s: %s", event, detail)
        await asyncio.to_thread(
            self.repository.diagnostic, level=level, event=event, detail=detail
        )

    async def ingest(self, raw_packet: str) -> None:
        """Validate, store, and publish one packet."""

        try:
            parsed = parse_telemetry(raw_packet)
            stored = await asyncio.to_thread(self.repository.add, parsed)
        except TelemetryParseError as exc:
            await self._diagnostic("WARNING", "packet_rejected", str(exc))
            return
        except Exception as exc:
            await self._diagnostic("ERROR", "storage_failed", str(exc))
            return

        self.snapshot = ConnectionSnapshot(
            state="connected",
            transport=self.transport.name,
            port=self.transport.endpoint,
            detail="Receiving telemetry",
            last_update_at=stored.received_at,
            latest_device_id=stored.device_id,
        )
        await self.broadcaster.publish({"type": "reading", "data": stored.as_dict()})

    async def _run(self) -> None:
        while not self._stopping.is_set():
            try:
                await self._set_state("connecting", "Connecting to telemetry source")
                await asyncio.to_thread(self.transport.connect)
                await self._diagnostic(
                    "INFO", "transport_connected", str(self.transport.endpoint)
                )
                await self._set_state("connected", "Connected; waiting for telemetry")

                while not self._stopping.is_set():
                    line = await asyncio.to_thread(self.transport.readline)
                    if line is not None:
                        await self.ingest(line)
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                state = (
                    "configuration_required"
                    if "not configured" in str(exc).lower()
                    else "disconnected"
                )
                await self._set_state(state, str(exc))
                await self._diagnostic("ERROR", "transport_error", str(exc))
            finally:
                await asyncio.to_thread(self.transport.close)

            if not self._stopping.is_set():
                try:
                    await asyncio.wait_for(
                        self._stopping.wait(), timeout=self.reconnect_seconds
                    )
                except asyncio.TimeoutError:
                    pass

        await self._set_state("stopped", "Telemetry service stopped")


"""Typed domain objects shared by parsing, storage, and delivery."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any


@dataclass(frozen=True, slots=True)
class TelemetryReading:
    """One validated ESP32 telemetry packet."""

    device_id: str
    device_timestamp: datetime | None
    received_at: datetime
    water_level: float
    roll: float
    pitch: float
    alert: bool
    raw_packet: str

    def as_dict(self) -> dict[str, Any]:
        """Return a JSON-ready representation without calculated values."""

        value = asdict(self)
        value["device_timestamp"] = self.device_timestamp.isoformat() if self.device_timestamp else None
        value["received_at"] = self.received_at.isoformat()
        return value


@dataclass(frozen=True, slots=True)
class StoredReading(TelemetryReading):
    """A telemetry reading persisted in SQLite."""

    id: int


@dataclass(frozen=True, slots=True)
class ConnectionSnapshot:
    """Observable state of the configured telemetry transport."""

    state: str
    transport: str
    port: str | None
    detail: str
    last_update_at: datetime | None = None
    latest_device_id: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "state": self.state,
            "transport": self.transport,
            "port": self.port,
            "detail": self.detail,
            "last_update_at": (
                self.last_update_at.isoformat() if self.last_update_at else None
            ),
            "latest_device_id": self.latest_device_id,
        }


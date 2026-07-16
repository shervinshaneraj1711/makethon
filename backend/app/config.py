"""Runtime configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Settings:
    """Settings required by the V1 data pipeline."""

    transport: str = "serial"
    com_port: str | None = None
    baud_rate: int = 115200
    database_url: str = "sqlite:///./data/river_monitor.db"
    log_level: str = "INFO"
    reconnect_seconds: float = 3.0
    simulator_interval_seconds: float = 2.0

    @classmethod
    def from_env(cls) -> "Settings":
        """Create validated settings from ``RIVER_*`` environment variables."""

        transport = os.getenv("RIVER_TRANSPORT", "serial").strip().lower()
        if transport not in {"serial", "simulator"}:
            raise ValueError("RIVER_TRANSPORT must be 'serial' or 'simulator'")

        baud_rate = int(os.getenv("RIVER_BAUD_RATE", "115200"))
        reconnect_seconds = float(os.getenv("RIVER_RECONNECT_SECONDS", "3"))
        simulator_interval = float(os.getenv("RIVER_SIMULATOR_INTERVAL_SECONDS", "2"))
        if baud_rate <= 0 or reconnect_seconds <= 0 or simulator_interval <= 0:
            raise ValueError("Baud rate and intervals must be positive")

        return cls(
            transport=transport,
            com_port=os.getenv("RIVER_COM_PORT") or None,
            baud_rate=baud_rate,
            database_url=os.getenv(
                "RIVER_DATABASE_URL", "sqlite:///./data/river_monitor.db"
            ),
            log_level=os.getenv("RIVER_LOG_LEVEL", "INFO").upper(),
            reconnect_seconds=reconnect_seconds,
            simulator_interval_seconds=simulator_interval,
        )


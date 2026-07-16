"""Deterministic telemetry source for development and automated demonstrations."""

from __future__ import annotations

import math
import threading
from datetime import datetime

from .base import TelemetryTransport


class SimulatorTransport(TelemetryTransport):
    name = "simulator"
    endpoint = "built-in"

    def __init__(self, interval_seconds: float = 2.0) -> None:
        self.interval_seconds = interval_seconds
        self._connected = False
        self._sample = 0
        self._closed = threading.Event()

    def connect(self) -> None:
        self._connected = True
        self._closed.clear()

    def readline(self) -> str | None:
        if not self._connected:
            raise RuntimeError("simulator is not connected")
        if self._closed.wait(self.interval_seconds):
            return None
        self._sample += 1
        now = datetime.now()
        distance = 124.5 + math.sin(self._sample / 5) * 1.8
        pressure = 1.98 + math.cos(self._sample / 7) * 0.04
        tilt_x = 2.3 + math.sin(self._sample / 4) * 0.3
        tilt_y = -1.1 + math.cos(self._sample / 4) * 0.2
        tilt_z = 180.4 + math.sin(self._sample / 8) * 0.2
        rain = 1 if self._sample % 20 > 15 else 0
        battery = max(0.0, 92.0 - self._sample * 0.01)
        return (
            f"Node01,{now:%d-%m-%Y},{now:%H:%M:%S},{distance:.2f},"
            f"{pressure:.3f},{tilt_x:.2f},{tilt_y:.2f},{tilt_z:.2f},"
            f"{rain},{battery:.1f},ONLINE"
        )

    def close(self) -> None:
        self._connected = False
        self._closed.set()


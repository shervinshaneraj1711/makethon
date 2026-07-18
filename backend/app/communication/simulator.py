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
        import json
        
        # Simulate a flash flood! Distance decreases by 2cm every sample (2 seconds)
        distance = max(15.0, 160.0 - (self._sample * 2.0))
        
        pressure = 1.98 + math.cos(self._sample / 7) * 0.04
        tilt_x = 2.3 + math.sin(self._sample / 4) * 0.3
        tilt_y = -1.1 + math.cos(self._sample / 4) * 0.2
        tilt_z = 180.4 + math.sin(self._sample / 8) * 0.2
        rain = True if self._sample % 20 > 15 else False
        battery = max(0.0, 92.0 - self._sample * 0.01)
        
        # Calculate fake status
        status = "SAFE"
        if distance < 60: status = "WARNING"
        if distance < 30: status = "DANGER"

        return json.dumps({
            "deviceId": "SimNode01",
            "date": now.strftime("%d-%m-%Y"),
            "time": now.strftime("%H:%M:%S"),
            "distance": round(distance, 2),
            "pressure": round(pressure, 3),
            "tilt": {
                "x": round(tilt_x, 2),
                "y": round(tilt_y, 2),
                "z": round(tilt_z, 2)
            },
            "rain": rain,
            "battery": round(battery, 1),
            "status": status
        })

    def write(self, data: bytes) -> None:
        if not self._connected:
            raise RuntimeError("simulator is not connected")
        # In the simulator, we just print the received commands to the console
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Simulator received hardware command: {data.decode('utf-8').strip()}")

    def close(self) -> None:
        self._connected = False
        self._closed.set()


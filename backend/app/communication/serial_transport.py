"""Bluetooth Classic SPP transport exposed by the OS as a serial COM port."""

from __future__ import annotations

import serial

from .base import TelemetryTransport


class SerialTransport(TelemetryTransport):
    name = "bluetooth_spp"

    def __init__(self, port: str | None, baud_rate: int, *, timeout: float = 1.0) -> None:
        self.endpoint = port
        self.baud_rate = baud_rate
        self.timeout = timeout
        self._serial: serial.Serial | None = None

    def connect(self) -> None:
        if not self.endpoint:
            raise RuntimeError("RIVER_COM_PORT is not configured")
        self._serial = serial.Serial(
            port=self.endpoint,
            baudrate=self.baud_rate,
            timeout=self.timeout,
        )

    def readline(self) -> str | None:
        if self._serial is None or not self._serial.is_open:
            raise RuntimeError("serial connection is not open")
        payload = self._serial.readline()
        if not payload:
            return None
        try:
            return payload.decode("utf-8", errors="strict").rstrip("\r\n")
        except UnicodeDecodeError as exc:
            raise ValueError("serial packet is not valid UTF-8") from exc

    def close(self) -> None:
        if self._serial is not None:
            self._serial.close()
            self._serial = None


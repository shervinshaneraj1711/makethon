"""Validation and parsing for the ESP32 CSV telemetry protocol."""

from __future__ import annotations

import csv
import math
from datetime import datetime, timezone

from .domain import TelemetryReading


class TelemetryParseError(ValueError):
    """Raised when a packet cannot be interpreted without guessing."""


_TRUE_VALUES = {"1", "true", "yes", "rain", "wet"}
_FALSE_VALUES = {"0", "false", "no", "dry"}


def _number(value: str, field: str) -> float:
    try:
        parsed = float(value)
    except ValueError as exc:
        raise TelemetryParseError(f"{field} must be numeric") from exc
    if not math.isfinite(parsed):
        raise TelemetryParseError(f"{field} must be finite")
    return parsed


def _optional_bool(value: str) -> bool | None:
    normalized = value.strip().lower()
    if normalized in _TRUE_VALUES:
        return True
    if normalized in _FALSE_VALUES:
        return False
    return None


def _looks_numeric(value: str) -> bool:
    try:
        return math.isfinite(float(value))
    except ValueError:
        return False


def parse_telemetry(
    raw_packet: str, *, received_at: datetime | None = None
) -> TelemetryReading:
    """Parse a telemetry line while allowing only trailing optional fields.

    Required fields are device, date, time, distance, pressure, and tilt X/Y/Z.
    Rain, battery, and status may follow in that order. If battery is omitted,
    a textual value after rain is treated as status.
    """

    line = raw_packet.strip()
    if not line:
        raise TelemetryParseError("packet is empty")
    if len(line) > 2048:
        raise TelemetryParseError("packet exceeds 2048 characters")

    try:
        fields = next(csv.reader([line], strict=True))
    except csv.Error as exc:
        raise TelemetryParseError("packet is not valid CSV") from exc

    fields = [field.strip() for field in fields]
    if not 8 <= len(fields) <= 11:
        raise TelemetryParseError("packet must contain 8 to 11 fields")

    device_id = fields[0]
    if not device_id or len(device_id) > 64:
        raise TelemetryParseError("device ID is required and limited to 64 characters")

    try:
        device_timestamp = datetime.strptime(
            f"{fields[1]} {fields[2]}", "%d-%m-%Y %H:%M:%S"
        )
    except ValueError as exc:
        raise TelemetryParseError("date/time must use DD-MM-YYYY,HH:MM:SS") from exc

    tail = fields[8:]
    rain: bool | None = None
    battery: float | None = None
    device_status: str | None = None

    if tail:
        parsed_rain = _optional_bool(tail[0])
        if parsed_rain is not None:
            rain = parsed_rain
            tail.pop(0)

    if tail and _looks_numeric(tail[0]):
        battery = _number(tail.pop(0), "battery")

    if tail:
        if len(tail) != 1 or not tail[0]:
            raise TelemetryParseError("optional fields must be rain, battery, then status")
        device_status = tail[0]

    return TelemetryReading(
        device_id=device_id,
        device_timestamp=device_timestamp,
        received_at=received_at or datetime.now(timezone.utc),
        distance=_number(fields[3], "distance"),
        pressure=_number(fields[4], "pressure"),
        tilt_x=_number(fields[5], "tilt X"),
        tilt_y=_number(fields[6], "tilt Y"),
        tilt_z=_number(fields[7], "tilt Z"),
        rain=rain,
        battery=battery,
        device_status=device_status,
        raw_packet=line,
    )


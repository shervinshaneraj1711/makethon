"""Validation and parsing for the ESP32 JSON telemetry protocol."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from .domain import TelemetryReading


class TelemetryParseError(ValueError):
    """Raised when a packet cannot be interpreted without guessing."""


def _number(value, field: str) -> float:
    try:
        if value is None:
            raise ValueError
        parsed = float(value)
    except (ValueError, TypeError) as exc:
        raise TelemetryParseError(f"{field} must be numeric") from exc
    return parsed


def parse_telemetry(
    raw_packet: str, *, received_at: datetime | None = None
) -> TelemetryReading:
    """Parse a telemetry JSON packet."""

    packet_clean = raw_packet.strip()
    if not packet_clean:
        raise TelemetryParseError("packet is empty")
    if len(packet_clean) > 2048:
        raise TelemetryParseError("packet exceeds 2048 characters")

    try:
        data = json.loads(packet_clean)
    except json.JSONDecodeError as exc:
        raise TelemetryParseError("packet is not valid JSON") from exc

    if not isinstance(data, dict):
        raise TelemetryParseError("root must be a JSON object")

    device_id = data.get("deviceId")
    if not device_id:
        raise TelemetryParseError("device ID is required")

    date_str = data.get("date")
    time_str = data.get("time")

    device_timestamp = None
    if date_str and time_str:
        try:
            device_timestamp = datetime.strptime(
                f"{date_str} {time_str}", "%d-%m-%Y %H:%M:%S"
            )
        except ValueError as exc:
            raise TelemetryParseError("date/time invalid") from exc

    water_level = data.get("waterLevel")
    roll = data.get("roll")
    pitch = data.get("pitch")
    alert = data.get("alert")

    return TelemetryReading(
        device_id=str(device_id),
        device_timestamp=device_timestamp,
        received_at=received_at or datetime.now(timezone.utc),
        water_level=_number(water_level, "waterLevel") if water_level is not None else 0.0,
        roll=_number(roll, "roll") if roll is not None else 0.0,
        pitch=_number(pitch, "pitch") if pitch is not None else 0.0,
        alert=alert if isinstance(alert, bool) else False,
        raw_packet=packet_clean,
    )

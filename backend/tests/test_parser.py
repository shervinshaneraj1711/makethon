from datetime import datetime, timezone

import pytest

from backend.app.parser import TelemetryParseError, parse_telemetry


RECEIVED_AT = datetime(2026, 7, 16, 9, 5, 21, tzinfo=timezone.utc)


def test_parses_full_packet_without_calculating_values():
    reading = parse_telemetry(
        "Node01,16-07-2026,14:35:20,124.5,1.98,2.3,-1.1,180.4,0,92.5,SAFE",
        received_at=RECEIVED_AT,
    )

    assert reading.device_id == "Node01"
    assert reading.distance == 124.5
    assert reading.rain is False
    assert reading.battery == 92.5
    assert reading.device_status == "SAFE"
    assert reading.received_at == RECEIVED_AT


@pytest.mark.parametrize(
    ("tail", "rain", "battery", "status"),
    [
        ("", None, None, None),
        (",1", True, None, None),
        (",0,ONLINE", False, None, "ONLINE"),
        (",0,88.2", False, 88.2, None),
    ],
)
def test_handles_only_trailing_optional_fields(tail, rain, battery, status):
    packet = f"Node01,16-07-2026,14:35:20,124.5,1.98,2.3,-1.1,180.4{tail}"
    reading = parse_telemetry(packet, received_at=RECEIVED_AT)
    assert (reading.rain, reading.battery, reading.device_status) == (
        rain,
        battery,
        status,
    )


@pytest.mark.parametrize(
    "packet",
    [
        "",
        "Node01,16-07-2026,14:35:20,124.5",
        "Node01,2026-07-16,14:35:20,124.5,1.98,2.3,-1.1,180.4",
        "Node01,16-07-2026,14:35:20,nan,1.98,2.3,-1.1,180.4",
        "Node01,16-07-2026,14:35:20,far,1.98,2.3,-1.1,180.4",
    ],
)
def test_rejects_packets_that_require_guessing(packet):
    with pytest.raises(TelemetryParseError):
        parse_telemetry(packet, received_at=RECEIVED_AT)


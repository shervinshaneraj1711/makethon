import json
from datetime import datetime, timezone

import pytest

from backend.app.parser import TelemetryParseError, parse_telemetry


RECEIVED_AT = datetime(2026, 7, 16, 9, 5, 21, tzinfo=timezone.utc)

def test_parses_full_valid_json_packet():
    packet = json.dumps({
        "deviceId": "Node01",
        "date": "16-07-2026",
        "time": "14:35:20",
        "distance": 124.5,
        "pressure": 1.98,
        "tilt": {
            "x": 2.3,
            "y": -1.1,
            "z": 180.4
        },
        "rain": False,
        "battery": 92.5,
        "status": "SAFE"
    })
    
    reading = parse_telemetry(packet, received_at=RECEIVED_AT)

    assert reading.device_id == "Node01"
    assert reading.distance == 124.5
    assert reading.pressure == 1.98
    assert reading.tilt_x == 2.3
    assert reading.tilt_y == -1.1
    assert reading.tilt_z == 180.4
    assert reading.rain is False
    assert reading.battery == 92.5
    assert reading.device_status == "SAFE"
    assert reading.received_at == RECEIVED_AT

def test_parses_partial_json_packet():
    packet = json.dumps({
        "deviceId": "Node02",
        "distance": 12.3
    })
    reading = parse_telemetry(packet, received_at=RECEIVED_AT)
    assert reading.device_id == "Node02"
    assert reading.distance == 12.3
    assert reading.pressure is None
    assert reading.tilt_x is None
    assert reading.device_timestamp is None

def test_rejects_malformed_json():
    with pytest.raises(TelemetryParseError, match="packet is not valid JSON"):
        parse_telemetry("{invalid_json: 123", received_at=RECEIVED_AT)

@pytest.mark.parametrize("field,invalid_value", [
    ("distance", "far"),
    ("pressure", "nan"),
])
def test_rejects_invalid_numeric_values(field, invalid_value):
    data = {
        "deviceId": "Node01",
        field: invalid_value
    }
    with pytest.raises(TelemetryParseError):
        parse_telemetry(json.dumps(data), received_at=RECEIVED_AT)

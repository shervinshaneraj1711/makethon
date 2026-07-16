# Version 1 — Bluetooth, Dashboard, and Storage

## Status

Ready to start.

## Objective

Prove the complete live-data pipeline from the ESP32 to a browser:

`ESP32 → Bluetooth SPP → FastAPI → SQLite → WebSocket → React dashboard`

## Deliverables

- Bluetooth Classic SPP communication through the ESP32's paired COM port.
- Automatic connection-loss detection and reconnection.
- Validation and parsing of the telemetry actually emitted by the firmware.
- FastAPI backend with SQLite persistence and basic diagnostic logging.
- WebSocket delivery of new readings and connection-state changes.
- One responsive React dashboard containing:
  - Bluetooth connection state.
  - Last update time and device ID.
  - Live cards for received sensor fields.
  - Raw live-telemetry table.
  - Basic persisted-history table.
  - CSV export.
- Optional values such as rain, battery, and device status appear only when received.

## Architecture Boundaries

- Communication, parsing, storage, API, and UI remain independent modules.
- COM port and baud rate are runtime configuration, not dashboard settings.
- One ESP32 connection is active at a time.
- Store the raw packet, parsed values, firmware timestamp, and backend receipt time.
- Do not calculate, estimate, or invent values missing from firmware telemetry.

## Validation Gate

Version 1 is complete only when:

- Real ESP32 data reaches the dashboard without manual refresh.
- Displayed values match the serial packets exactly.
- Valid readings persist across backend restarts.
- Missing optional fields are handled cleanly.
- Malformed packets are rejected and logged without stopping ingestion.
- Bluetooth disconnect and reconnect do not require restarting the application.
- CSV exports match the stored readings.
- Backend and frontend tests and production builds pass.

## Not Included

- Device commands, calibration, self-test, RTC, buzzer, LEDs, or SD controls.
- Charts, statistics, replay, calculated depth, thresholds, alerts, or risk scoring.
- Machine learning, GSM, cloud hosting, authentication, or multi-node connections.


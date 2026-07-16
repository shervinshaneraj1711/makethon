# Version 2 — Device Controls

## Status

Planned. Starts only after Version 1 passes its validation gate.

## Objective

Add tested, operator-facing ESP32 controls using a reliable command and acknowledgement protocol.

## Deliverables

- Device self-test and returned sensor-health results.
- Sensor calibration commands supported by the firmware.
- RTC synchronization.
- Buzzer test.
- Green, yellow, and red LED tests.
- SD card status and supported SD diagnostics.
- Sampling-interval control when supported by firmware.
- Command timeout, acknowledgement, error, and diagnostic logging.
- A compact maintenance interface separate from the monitoring dashboard.

## Validation Gate

- Every displayed capability is supported by the connected firmware.
- Each command has a verifiable acknowledgement or error response.
- Timeouts and connection loss do not leave the UI in a false success state.
- Calibration and RTC changes are confirmed using subsequent device output.
- Destructive commands require an explicit confirmation.

## Not Included

- Charts, monitoring intelligence, machine learning, cloud features, or simulated controls.


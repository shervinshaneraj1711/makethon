# River Monitoring System — Version Progress

This file is the single progress index for the incremental roadmap. Update it when work starts, a deliverable is verified, or a version passes its validation gate.

## Current Position

- Current target: **Version 1**
- Current phase: **V1 implemented; awaiting real ESP32 Bluetooth validation**
- Rule: a version becomes the foundation for the next only after its validation gate passes.

## Version Tracker

| Version | Focus | Status | Progress | Roadmap |
|---|---|---|---:|---|
| V1 | Bluetooth, Dashboard, Storage | Hardware validation required | 85% | [Open](v1-bluetooth-dashboard-storage.md) |
| V2 | Device Controls | Planned | 0% | [Open](v2-device-controls.md) |
| V3 | Visualization | Planned | 0% | [Open](v3-visualization.md) |
| V4 | Monitoring Intelligence | Planned | 0% | [Open](v4-monitoring-intelligence.md) |
| V5 | Machine Learning | Planned | 0% | [Open](v5-machine-learning.md) |
| V6 | Cloud | Planned | 0% | [Open](v6-cloud.md) |

## Version 1 Checklist

- [x] Project structure and development environment established.
- [ ] Bluetooth SPP transport reads the real ESP32 stream.
- [x] Telemetry parser implemented and validated against the documented packet variants.
- [x] SQLite persistence implemented and restart-tested.
- [x] FastAPI read APIs implemented.
- [x] WebSocket live updates implemented.
- [x] Responsive single-page dashboard implemented.
- [x] Connection state and last-update time displayed.
- [x] Live sensor cards display only received fields.
- [x] Raw live-telemetry table implemented.
- [x] Basic persisted-history table implemented.
- [x] CSV export implemented and verified.
- [ ] Disconnect and reconnect behavior verified with hardware.
- [x] Automated tests, browser smoke test, and production build pass.
- [ ] Version 1 validation gate passed.

## Progress Log

| Date | Version | Update |
|---|---|---|
| 2026-07-16 | Roadmap | Created individual V1–V6 roadmap files and initialized the progress tracker. |
| 2026-07-16 | V1 | Implemented and tested the simulator-backed V1 pipeline; real ESP32 Bluetooth validation remains. |

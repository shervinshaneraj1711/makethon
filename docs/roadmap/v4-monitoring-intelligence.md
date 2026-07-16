# Version 4 — Monitoring Intelligence

## Status

Planned. Starts only after Version 3 passes its validation gate and sensor behavior is understood.

## Objective

Add transparent, rule-based monitoring derived from calibrated and validated telemetry.

## Deliverables

- Water-depth calculation using a documented installation reference.
- Rising, falling, and stable water-trend detection.
- Configurable warning and danger thresholds.
- Safe, Warning, and Danger classifications.
- Deduplicated rule-based alerts.
- Explainable rule-based risk score.
- AI explanation panel that states which rules and readings produced the result.

## Validation Gate

- Calculated depth is verified against physical measurements.
- Threshold units and direction are correct for the installed sensors.
- Trend results are tested against known rising, falling, stable, and missing-data sequences.
- Every alert and risk result includes a human-readable explanation.
- Rule-based results are never presented as trained-model probabilities.

## Not Included

- Trained prediction models, TinyML, cloud synchronization, or remote administration.


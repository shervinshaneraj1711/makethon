# Version 3 — Visualization

## Status

Planned. Starts only after Version 2 passes its validation gate.

## Objective

Turn validated stored telemetry into clear historical and live visualizations.

## Deliverables

- Live sensor charts.
- Historical graphs with device and time-range filters.
- Simple descriptive statistics derived from stored readings.
- Data replay with visible replay state and speed controls.
- Responsive charts suitable for laptop and mobile browsers.

## Validation Gate

- Chart points match stored readings and timestamps.
- Missing samples and connection gaps are represented honestly.
- Statistics use documented units and time ranges.
- Replay never mixes replayed readings with live readings ambiguously.
- Large history queries remain responsive for the collected dataset size.

## Not Included

- Threshold alerts, risk scoring, predictions, anomaly detection, or cloud analytics.


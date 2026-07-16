# Version 5 — Machine Learning

## Status

Planned. Starts only after sufficient representative real-world data is available.

## Objective

Introduce validated local models without coupling the application to one ML runtime.

## Deliverables

- Replaceable inference-engine interface.
- TensorFlow Lite model loading and version tracking.
- Flood prediction based on an explicitly defined target and forecast horizon.
- Sensor anomaly detection.
- Calibrated confidence scores and model explanations appropriate to the model.
- Safe fallback to the Version 4 rule engine when a model is missing or invalid.

## Data and Validation Gate

- Training data includes documented schema, units, missingness, labels, and collection conditions.
- Temporal datasets use chronological training, validation, and test splits.
- Preprocessing is fitted only on training data.
- Candidate models are compared with simple baselines using suitable error metrics.
- False-negative and false-positive behavior is reviewed for flood monitoring.
- Model size, inference latency, failure handling, and test-set performance are documented.
- TinyML deployment proceeds only if the target hardware supports the selected model reliably.

## Not Included

- Claims of useful prediction before sufficient real data and validation exist.
- Cloud-only inference or hidden replacement of rule-based safety behavior.


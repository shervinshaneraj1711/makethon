# Version 6 — Cloud

## Status

Planned. Starts only after the local monitoring system is stable.

## Objective

Extend the proven local system to secure remote and multi-node operation.

## Deliverables

- GSM communication adapter.
- Reliable cloud synchronization with offline buffering and retry behavior.
- Secure remote dashboard deployment.
- Authentication and authorization for monitoring and maintenance operations.
- Multi-node ingestion, identity, status, filtering, and visualization.
- Auditing, deployment configuration, backup, and operational monitoring.

## Validation Gate

- Loss of GSM or internet connectivity does not lose locally captured data.
- Synchronization is idempotent and does not duplicate readings.
- Authentication protects all non-public data and device-control operations.
- Node identity remains stable across reconnects and deployments.
- Cloud failure does not prevent local monitoring.

## Not Included

- Replacing the validated local application with a cloud-dependent data path.


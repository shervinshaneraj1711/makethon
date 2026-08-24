"""HTTP and WebSocket API for river telemetry."""

from __future__ import annotations

import asyncio
import csv
import io
import json
from datetime import datetime

from fastapi import APIRouter, Query, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from .analytics import calculate_flood_prediction

router = APIRouter()


def _repository(request: Request):
    return request.app.state.repository


@router.get("/api/v1/status")
async def status(request: Request) -> dict:
    return request.app.state.telemetry_service.snapshot.as_dict()


@router.get("/api/v1/predict")
async def predict(request: Request) -> dict:
    # Get the last 100 readings
    rows = await asyncio.to_thread(
        _repository(request).list,
        limit=100,
    )

    # Reverse to make them chronological
    rows.reverse()

    return calculate_flood_prediction(rows)


# ============================================================
# NEW: Wireless telemetry endpoint for ESP32
# ============================================================

@router.post("/api/v1/telemetry")
async def receive_telemetry(
    request: Request,
    payload: dict,
) -> dict:
    """
    Receive JSON telemetry directly from the ESP32 over Wi-Fi.

    Expected example:
    {
        "deviceId": "RiverNode01",
        "timestamp": "2026-08-24T23:10:00",
        "waterLevel": 18.4,
        "roll": 1.25,
        "pitch": -0.73,
        "alert": false
    }
    """

    try:
        # Convert the received JSON object back into a JSON string.
        # The existing TelemetryService.ingest() expects a raw packet.
        raw_packet = json.dumps(
            payload,
            separators=(",", ":"),
        )

        service = request.app.state.telemetry_service

        # Send the packet through the existing parser ->
        # SQLite -> WebSocket/dashboard pipeline.
        await service.ingest(raw_packet)

        return {
            "status": "received",
            "deviceId": payload.get("deviceId"),
        }

    except Exception as exc:
        return {
            "status": "error",
            "message": str(exc),
        }


# ============================================================
# Existing configuration endpoint
# ============================================================

@router.post("/api/v1/config")
async def update_config(
    request: Request,
    interval: int = Query(...),
) -> dict:

    transport = request.app.state.telemetry_service.transport

    if not transport:
        return {"error": "Transport not connected"}

    # Existing command
    command = f'{{"command": "set_interval", "value": {interval}}}\n'

    try:
        await asyncio.to_thread(
            transport.write,
            command.encode("utf-8"),
        )

        return {
            "status": "success",
            "message": f"Interval set to {interval}ms",
        }

    except Exception as exc:
        return {
            "status": "error",
            "message": str(exc),
        }


@router.get("/api/v1/readings")
async def readings(
    request: Request,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict:

    rows = await asyncio.to_thread(
        _repository(request).list,
        limit=limit,
        offset=offset,
    )

    return {
        "items": [row.as_dict() for row in rows],
        "limit": limit,
        "offset": offset,
    }


def _csv_rows(
    repository,
    start: datetime | None,
    end: datetime | None,
):
    buffer = io.StringIO()

    writer = csv.writer(
        buffer,
        lineterminator="\n",
    )

    writer.writerow(
        [
            "id",
            "device_id",
            "device_timestamp",
            "received_at",
            "water_level",
            "roll",
            "pitch",
            "alert",
            "raw_packet",
        ]
    )

    yield buffer.getvalue()

    buffer.seek(0)
    buffer.truncate(0)

    for row in repository.iterate_chronological(
        start=start,
        end=end,
    ):

        writer.writerow(
            [
                row.id,
                row.device_id,
                (
                    row.device_timestamp.isoformat()
                    if row.device_timestamp
                    else ""
                ),
                row.received_at.isoformat(),
                row.water_level,
                row.roll,
                row.pitch,
                "" if row.alert is None else int(row.alert),
                row.raw_packet,
            ]
        )

        yield buffer.getvalue()

        buffer.seek(0)
        buffer.truncate(0)


@router.get("/api/v1/readings/export.csv")
async def export_csv(
    request: Request,
    start: datetime | None = None,
    end: datetime | None = None,
) -> StreamingResponse:

    headers = {
        "Content-Disposition":
            'attachment; filename="river-telemetry.csv"'
    }

    return StreamingResponse(
        _csv_rows(
            _repository(request),
            start,
            end,
        ),
        media_type="text/csv; charset=utf-8",
        headers=headers,
    )


@router.get("/health")
async def health(request: Request) -> dict:

    await asyncio.to_thread(
        _repository(request).latest,
    )

    return {
        "status": "ok",
        "database": "ok",
    }


@router.websocket("/ws/live")
async def live(websocket: WebSocket) -> None:

    await websocket.accept()

    service = websocket.app.state.telemetry_service
    broadcaster = websocket.app.state.broadcaster

    await websocket.send_json(
        {
            "type": "connection",
            "data": service.snapshot.as_dict(),
        }
    )

    try:

        async with broadcaster.subscribe() as queue:

            while True:

                event = await queue.get()

                await websocket.send_json(event)

    except WebSocketDisconnect:
        return

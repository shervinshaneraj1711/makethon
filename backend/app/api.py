"""Read-only V1 HTTP and WebSocket API."""

from __future__ import annotations

import asyncio
import csv
import io
from datetime import datetime

from fastapi import APIRouter, Query, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

router = APIRouter()


def _repository(request: Request):
    return request.app.state.repository


@router.get("/api/v1/status")
async def status(request: Request) -> dict:
    return request.app.state.telemetry_service.snapshot.as_dict()

from .analytics import calculate_flood_prediction

@router.get("/api/v1/predict")
async def predict(request: Request) -> dict:
    # Get the last 100 readings
    rows = await asyncio.to_thread(_repository(request).list, limit=100)
    # Reverse to make them chronological
    rows.reverse()
    return calculate_flood_prediction(rows)

@router.post("/api/v1/config")
async def update_config(request: Request, interval: int = Query(...)) -> dict:
    transport = request.app.state.telemetry_service.transport
    if not transport:
        return {"error": "Transport not connected"}
    
    # Create the JSON command
    command = f'{{"command": "set_interval", "value": {interval}}}\n'
    
    # Send it down the USB cable to the ESP32
    try:
        await asyncio.to_thread(transport.write, command.encode('utf-8'))
        return {"status": "success", "message": f"Interval set to {interval}ms"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/api/v1/readings")
async def readings(
    request: Request,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict:
    rows = await asyncio.to_thread(
        _repository(request).list, limit=limit, offset=offset
    )
    return {"items": [row.as_dict() for row in rows], "limit": limit, "offset": offset}


def _csv_rows(repository, start: datetime | None, end: datetime | None):
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
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

    for row in repository.iterate_chronological(start=start, end=end):
        writer.writerow(
            [
                row.id,
                row.device_id,
                row.device_timestamp.isoformat() if row.device_timestamp else "",
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
    request: Request, start: datetime | None = None, end: datetime | None = None
) -> StreamingResponse:
    headers = {"Content-Disposition": 'attachment; filename="river-telemetry.csv"'}
    return StreamingResponse(
        _csv_rows(_repository(request), start, end),
        media_type="text/csv; charset=utf-8",
        headers=headers,
    )


@router.get("/health")
async def health(request: Request) -> dict:
    await asyncio.to_thread(_repository(request).latest)
    return {"status": "ok", "database": "ok"}


@router.websocket("/ws/live")
async def live(websocket: WebSocket) -> None:
    await websocket.accept()
    service = websocket.app.state.telemetry_service
    broadcaster = websocket.app.state.broadcaster
    await websocket.send_json({"type": "connection", "data": service.snapshot.as_dict()})
    try:
        async with broadcaster.subscribe() as queue:
            while True:
                event = await queue.get()
                await websocket.send_json(event)
    except WebSocketDisconnect:
        return


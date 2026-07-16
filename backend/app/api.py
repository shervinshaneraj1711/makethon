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
            "distance",
            "pressure",
            "tilt_x",
            "tilt_y",
            "tilt_z",
            "rain",
            "battery",
            "device_status",
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
                row.device_timestamp.isoformat(),
                row.received_at.isoformat(),
                row.distance,
                row.pressure,
                row.tilt_x,
                row.tilt_y,
                row.tilt_z,
                "" if row.rain is None else int(row.rain),
                "" if row.battery is None else row.battery,
                row.device_status or "",
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


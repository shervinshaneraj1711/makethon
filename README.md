# River Monitoring System

Version 1 proves the complete telemetry path from an ESP32 Bluetooth SPP serial
connection to a responsive browser dashboard and persistent SQLite history.

## V1 scope

- Bluetooth SPP serial ingestion with reconnect behavior.
- Strict CSV telemetry parsing.
- SQLite storage of raw and parsed readings.
- FastAPI read APIs and WebSocket live events.
- Responsive React dashboard, live/raw history tables, and CSV export.

No depth calculations, thresholds, charts, alerts, device commands, or AI are
part of Version 1. See [the progress tracker](docs/roadmap/version-progress.md).

## Telemetry format

Required fields:

```text
device,date,time,distance,pressure,tiltX,tiltY,tiltZ
```

Trailing optional fields are `rain,battery,status`. Example:

```text
Node01,16-07-2026,14:35:20,124.5,1.98,2.3,-1.1,180.4,0,92.5,ONLINE
```

Dates use `DD-MM-YYYY` and times use `HH:MM:SS`.

## Local setup

1. Create and activate a Python virtual environment, then install
   `requirements.txt`.
2. Run `npm install` inside `frontend`.
3. Copy `.env.example` values into your shell or local `.env` loader.
4. Pair the ESP32 in Windows and set `RIVER_COM_PORT` to its outgoing SPP port.
5. Build the frontend with `npm run build`.
6. Start the application:

```powershell
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000`. Other devices on the same network can use the
laptop's LAN IP address.

## Simulator mode

Set `RIVER_TRANSPORT=simulator` before starting the backend. The simulator uses
the same parser, database, API, and WebSocket pipeline as Bluetooth telemetry.
It is for development and demonstrations, not hardware validation.

## Verification

```powershell
python -m pytest
npm --prefix frontend test
npm --prefix frontend run build
```



The optional browser smoke test also requires Chromium once:

```powershell
.\.venv\Scripts\python.exe -m playwright install chromium
```

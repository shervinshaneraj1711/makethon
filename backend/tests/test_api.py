from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.config import Settings
from backend.app.main import create_app


def test_read_only_api_and_csv_export(tmp_path):
    settings = Settings(
        transport="simulator",
        database_url=f"sqlite:///{tmp_path / 'api.db'}",
        simulator_interval_seconds=60,
    )
    app = create_app(settings)

    with TestClient(app) as client:
        service = app.state.telemetry_service
        client.portal.call(
            service.ingest,
            "Node01,16-07-2026,14:35:20,124.5,1.98,2.3,-1.1,180.4,0",
        )

        status = client.get("/api/v1/status")
        history = client.get("/api/v1/readings")
        export = client.get("/api/v1/readings/export.csv")

    assert status.status_code == 200
    assert history.json()["items"][0]["device_id"] == "Node01"
    assert "raw_packet" in export.text.splitlines()[0]
    assert "Node01" in export.text


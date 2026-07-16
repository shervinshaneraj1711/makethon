import { ConnectionBanner } from "./components/ConnectionBanner";
import { ReadingTable } from "./components/ReadingTable";
import { SensorCards } from "./components/SensorCards";
import { formatDeviceTimestamp } from "./format";
import { useTelemetry } from "./hooks/useTelemetry";

export default function App() {
  const { connection, readings, latest, historyLoading, historyError } = useTelemetry();

  return (
    <main>
      <header className="site-header">
        <div className="identity">
          <span className="station-mark" aria-hidden="true"><i /><i /><i /></span>
          <div>
            <span className="eyebrow">Field station / Version 1</span>
            <h1>River Monitor</h1>
          </div>
        </div>
        <div className="device-stamp">
          <span className="eyebrow">Active node</span>
          <strong>{latest?.device_id ?? connection.latest_device_id ?? "Awaiting device"}</strong>
          <span>{latest ? formatDeviceTimestamp(latest.device_timestamp) : "No device timestamp"}</span>
        </div>
      </header>

      <ConnectionBanner connection={connection} />

      <section className="section-heading">
        <div>
          <span className="eyebrow">Live telemetry</span>
          <h2>Current conditions</h2>
        </div>
        <span className="truth-label">Direct sensor values · no calculations</span>
      </section>
      <SensorCards reading={latest} />

      <section className="data-panel raw-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">Wire view</span><h2>Raw telemetry</h2></div>
          <span>Latest 12 packets</span>
        </div>
        <ReadingTable readings={readings} mode="raw" />
      </section>

      <section className="data-panel history-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">SQLite archive</span><h2>Reading history</h2></div>
          <a className="export-button" href="/api/v1/readings/export.csv" download>
            Export CSV <span aria-hidden="true">↗</span>
          </a>
        </div>
        {historyError ? <p className="table-message error-message">{historyError}</p> : (
          <ReadingTable readings={readings} mode="history" loading={historyLoading} />
        )}
      </section>

      <footer>
        <span>River Monitoring System</span>
        <span>Bluetooth SPP · FastAPI · SQLite</span>
      </footer>
    </main>
  );
}


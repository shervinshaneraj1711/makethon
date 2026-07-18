import { useState, useEffect } from "react";
import { formatTimestamp } from "./format";
import { useTelemetry } from "./hooks/useTelemetry";
import { SensorCards } from "./components/SensorCards";
import { LiveChart } from "./components/LiveChart";
import { ReadingTable } from "./components/ReadingTable";
import { StatsPanel } from "./components/StatsPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { RawConsole } from "./components/RawConsole";
import "./styles.css";

export default function App() {
  const { connection, readings, latest, historyLoading, historyError } = useTelemetry();
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch("/api/v1/predict");
        if (res.ok) setPrediction(await res.json());
      } catch (err) {}
    };
    fetchPrediction();
    const interval = setInterval(fetchPrediction, 2500);
    return () => clearInterval(interval);
  }, []);

  const isConnected = connection.state === "connected";

  if (!latest) {
    return (
      <main>
        <div className="empty-state">
          <h2>Awaiting telemetry from backend...</h2>
          <p>The dashboard will automatically populate once hardware connects.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* 1. Header */}
      <header className="top-header">
        <div className="header-item">
          <h2>🌊 SMART RIVER MONITORING SYSTEM</h2>
        </div>
        <div className="header-divider" />
        <div className="header-item">
          <strong>Node: {latest?.device_id || "RiverNode01"}</strong>
          <span style={{ marginLeft: "10px" }} className={`status-dot ${isConnected ? 'green' : 'red'}`} />
          <span style={{ marginLeft: "5px" }}>{isConnected ? 'Online' : 'Offline'}</span>
        </div>
        <div className="header-divider" />
        <div className="header-item">
          <span>Last Sync</span>
          <strong style={{ marginLeft: "10px" }}>{formatTimestamp(latest.received_at)}</strong>
        </div>
        <div className="header-divider" />
        <div className="header-item">
          <span>Connection</span>
          <strong style={{ marginLeft: "10px" }}>{connection.port || "COM7"} (Bluetooth)</strong>
        </div>
      </header>

      {/* 2. Alert Banner */}
      {prediction && prediction.status !== "INSUFFICIENT_DATA" && (
        <div className={`alert-banner ${prediction.status.toLowerCase()}`}>
          <span style={{ fontSize: '1.2rem' }}>
            {prediction.status === 'SAFE' || prediction.status === 'STABLE' ? '🟢' : prediction.status === 'WARNING' ? '🟡' : '🔴'}
          </span>
          <div style={{ marginLeft: "1rem", display: "flex", flexDirection: "column" }}>
            <strong>{prediction.status === 'SAFE' || prediction.status === 'STABLE' ? 'River Status : SAFE' : prediction.status === 'WARNING' ? 'WARNING' : 'Flood Warning'}</strong>
            <span>{prediction.message}</span>
          </div>
        </div>
      )}

      {/* 3. Primary Sensors (Water + Trend + Risk + Buoy) */}
      <SensorCards reading={latest} prediction={prediction} />

      {/* 4. Middle Row: Chart & AI Analytics */}
      <div className="middle-row">
        <div style={{ flex: 3 }}>
          <div className="panel">
            <div className="panel-header">
              <h3>Live Water Level Chart</h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#2563eb' }}>● Live</span>
                <span style={{ color: '#f97316' }}>● Prediction</span>
                <span style={{ color: '#dc2626' }}>-- Threshold</span>
              </div>
            </div>
            <LiveChart readings={readings} prediction={prediction} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <AnalyticsPanel prediction={prediction} />
        </div>
      </div>

      {/* 5. Statistics */}
      <StatsPanel readings={readings} />

      {/* 6. History Table */}
      <div className="panel" style={{ marginTop: '1rem' }}>
        <div className="panel-header" style={{ marginBottom: '8px' }}>
          <h3 style={{ textAlign: 'left', width: 'auto', margin: 0 }}>Database History</h3>
          <a href="/api/v1/readings/export.csv" download className="export-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export CSV
          </a>
        </div>
        {historyError ? <p className="error-message">{historyError}</p> : (
          <ReadingTable readings={readings} loading={historyLoading} />
        )}
      </div>

      {/* 7. Developer Console */}
      <div style={{ marginTop: '1rem' }}>
        <RawConsole readings={readings} />
      </div>
    </main>
  );
}

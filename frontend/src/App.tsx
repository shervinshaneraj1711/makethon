import { useState, useEffect } from "react";
import { formatDeviceTimestamp, formatTimestamp } from "./format";
import { useTelemetry } from "./hooks/useTelemetry";
import { SensorCards } from "./components/SensorCards";
import { LiveChart } from "./components/LiveChart";
import { ReadingTable } from "./components/ReadingTable";
import { DeviceSettings } from "./components/DeviceSettings";
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
          <h2>RIVER MONITOR</h2>
          <span>App Title</span>
        </div>
        <div className="header-divider" />
        <div className="header-item">
          <strong>{latest?.device_id || "RiverNode01"}</strong>
          <span>Device ID</span>
        </div>
        <div className="header-divider" />
        <div className="header-item">
          <strong>{formatTimestamp(latest.received_at)}</strong>
          <span>Last Updated</span>
        </div>
        <div className="header-divider" />
        <div className="header-item">
          <div className={`status-indicator ${!isConnected ? 'disconnected' : ''}`}>
            <span className="status-dot" />
            <strong>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</strong>
          </div>
          <span>Status</span>
        </div>
        <div className="header-divider" />
        <div className="header-item">
          <strong>{connection.port || "COM7 (Serial)"}</strong>
          <span>Transport</span>
        </div>
      </header>

      {/* 2. Alert Banner */}
      {prediction && prediction.status !== "STABLE" && prediction.status !== "INSUFFICIENT_DATA" && (
        <div className="alert-banner">
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span><strong>CRITICAL ALERT:</strong> {prediction.message}</span>
        </div>
      )}

      {/* 3. Sensor Metrics */}
      <div>
        <h3 className="section-title">Live Sensor Metrics</h3>
        <SensorCards reading={latest} />
      </div>

      {/* 4. Middle Row: Chart and Settings */}
      <div className="middle-row">
        <div>
          <h3 className="section-title">Real-Time Chart</h3>
          <div className="panel">
            <div className="panel-header">
              <h3>Real-Time Water Level (cm) - Last 100 Readings</h3>
            </div>
            <LiveChart readings={readings} />
          </div>
        </div>
        <div>
          <h3 className="section-title">Device Settings</h3>
          <div className="panel">
            <DeviceSettings />
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Tables */}
      <div>
        <h3 className="section-title">Developer Archives</h3>
        <div className="bottom-row">
          <div className="panel">
            <div className="panel-header" style={{ justifyContent: 'flex-start' }}>
              <h3 style={{ textAlign: 'left', width: 'auto' }}>Raw Wire View</h3>
            </div>
            <ReadingTable readings={readings} mode="raw" />
          </div>
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '8px' }}>
              <h3 style={{ textAlign: 'left', width: 'auto', margin: 0 }}>Database History</h3>
              <a href="/api/v1/readings/export.csv" download className="export-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Expert History (CSV)
              </a>
            </div>
            {historyError ? <p className="error-message">{historyError}</p> : (
              <ReadingTable readings={readings} mode="history" loading={historyLoading} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

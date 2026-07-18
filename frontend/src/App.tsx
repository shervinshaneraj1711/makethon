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
      <main className="single-screen-layout">
        <div className="empty-state">
          <h2>Awaiting telemetry from backend...</h2>
          <p>The dashboard will automatically populate once hardware connects.</p>
        </div>
      </main>
    );
  }

  // Determine banner details based on prediction/level
  let bannerClass = "safe";
  let bannerIcon = "🟢";
  let bannerTitle = "SAFE";
  let bannerMessage = "Water level is stable.";

  if (prediction && prediction.status !== "INSUFFICIENT_DATA") {
    if (prediction.status === "CRITICAL") {
      bannerClass = "critical";
      bannerIcon = "🔴";
      bannerTitle = "DANGER";
      bannerMessage = prediction.message || "Water level has breached the danger threshold!";
    } else if (prediction.status === "WARNING") {
      bannerClass = "warning";
      bannerIcon = "🟡";
      bannerTitle = "WARNING";
      bannerMessage = prediction.message || "Water level is rising rapidly.";
    }
  }

  return (
    <main className="single-screen-layout">
      {/* HEADER */}
      <header className="top-header">
        <div className="header-brand">
          <h2>🌊 Smart River Monitoring System</h2>
        </div>
        <div className="header-details">
          <div className="header-meta">
            <span>Node:</span>
            <strong>{latest?.device_id || "RiverNode01"}</strong>
          </div>
          <div className="header-divider"></div>
          <div className="header-meta">
            <span>Status:</span>
            <span className={`status-dot ${isConnected ? 'green' : 'red'}`}></span>
            <strong>{isConnected ? 'Online' : 'Offline'}</strong>
          </div>
          <div className="header-divider"></div>
          <div className="header-meta">
            <span>Last Sync:</span>
            <strong>{formatTimestamp(latest.received_at)}</strong>
          </div>
          <div className="header-divider"></div>
          <div className="header-meta">
            <span>Connection:</span>
            <strong>{connection.port || "COM7"} (Bluetooth)</strong>
          </div>
          <div className="header-divider"></div>
          <button className="settings-btn" title="Settings">⚙️</button>
        </div>
      </header>

      {/* SECTION 1: Status Banner */}
      <div className={`alert-banner ${bannerClass}`}>
        <span className="banner-icon">{bannerIcon}</span>
        <div className="banner-text">
          <strong>{bannerTitle}</strong>
          <span> — {bannerMessage}</span>
        </div>
      </div>

      {/* SECTION 2: Four Cards */}
      <SensorCards reading={latest} prediction={prediction} />

      {/* SECTION 3: Chart & Prediction Panel */}
      <div className="middle-row">
        <div className="chart-panel">
          <div className="panel-header">
            <h3>Water Level Telemetry</h3>
          </div>
          <LiveChart readings={readings} prediction={prediction} />
        </div>
        <div className="prediction-panel-container">
          <AnalyticsPanel prediction={prediction} />
        </div>
      </div>

      {/* SECTION 4: Today's Summary */}
      <StatsPanel readings={readings} />

      {/* SECTION 5: Recent Measurements */}
      <div className="panel recent-measurements-panel">
        <div className="panel-header" style={{ marginBottom: '5px' }}>
          <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280", textAlign: "left" }}>
            Recent Measurements
          </h3>
        </div>
        {historyError ? <p className="error-message">{historyError}</p> : (
          <ReadingTable readings={readings} loading={historyLoading} />
        )}
      </div>

      {/* BOTTOM: Collapsed Developer Console */}
      <RawConsole readings={readings} />
    </main>
  );
}

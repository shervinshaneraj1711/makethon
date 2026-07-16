import { formatNumber } from "../format";
import type { Reading } from "../types";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  className?: string;
}

function MetricCard({ label, value, unit, className = "" }: MetricCardProps) {
  return (
    <article className={`metric-card ${className}`}>
      <span className="eyebrow">{label}</span>
      <div className="metric-value">
        <strong>{value}</strong>
        {unit && <span>{unit}</span>}
      </div>
    </article>
  );
}

export function SensorCards({ reading }: { reading: Reading | null }) {
  if (!reading) {
    return (
      <section className="empty-sensors">
        <span className="empty-ripple" aria-hidden="true" />
        <div>
          <h2>Waiting for the first packet</h2>
          <p>Sensor values will appear here exactly as the ESP32 sends them.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="sensor-grid" aria-label="Latest sensor readings">
      <MetricCard label="Water distance" value={formatNumber(reading.distance)} unit="cm" className="primary-card" />
      <MetricCard label="Pressure" value={formatNumber(reading.pressure, 3)} unit="raw" />
      <article className="metric-card tilt-card">
        <span className="eyebrow">Tilt orientation</span>
        <div className="axis-grid">
          <div><span>X</span><strong>{formatNumber(reading.tilt_x)}°</strong></div>
          <div><span>Y</span><strong>{formatNumber(reading.tilt_y)}°</strong></div>
          <div><span>Z</span><strong>{formatNumber(reading.tilt_z)}°</strong></div>
        </div>
      </article>
      {reading.rain !== null && (
        <MetricCard label="Rain sensor" value={reading.rain ? "Detected" : "Dry"} className={reading.rain ? "wet-card" : ""} />
      )}
      {reading.battery !== null && (
        <MetricCard label="Battery" value={formatNumber(reading.battery, 1)} unit="raw" />
      )}
      {reading.device_status !== null && (
        <MetricCard label="Device status" value={reading.device_status} />
      )}
    </section>
  );
}


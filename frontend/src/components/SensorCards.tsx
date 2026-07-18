import { formatNumber } from "../format";
import type { Reading } from "../types";

export function SensorCards({ reading }: { reading: Reading | null }) {
  if (!reading) return null;

  return (
    <div className="sensor-metrics-row">
      <div className={`sensor-card ${reading.alert ? 'alert-danger' : 'primary'}`}>
        <span className="card-label">WATER LEVEL</span>
        <div className="card-value">{formatNumber(reading.water_level, 1)} cm</div>
      </div>
      
      <div className="sensor-card">
        <div className="card-icon">📐</div>
        <span className="card-label">Roll</span>
        <div className="card-value">{formatNumber(reading.roll)}°</div>
      </div>
      
      <div className="sensor-card">
        <div className="card-icon">📐</div>
        <span className="card-label">Pitch</span>
        <div className="card-value">{formatNumber(reading.pitch)}°</div>
      </div>
      
      <div className="sensor-card">
        <div className="card-icon">🚨</div>
        <span className="card-label">Buzzer Alert</span>
        <div className="card-value" style={{ color: reading.alert ? '#dc2626' : 'inherit' }}>
          {reading.alert ? "ACTIVE" : "SAFE"}
        </div>
      </div>
    </div>
  );
}

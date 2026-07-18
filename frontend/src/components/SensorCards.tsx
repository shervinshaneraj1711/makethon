import { formatNumber } from "../format";
import type { Reading } from "../types";
import { Buoy } from "./Buoy";

export function SensorCards({ reading, prediction }: { reading: Reading | null, prediction: any }) {
  if (!reading) return null;

  const trendIcon = prediction && prediction.rate_cm_per_min > 0 ? "⬆" : prediction && prediction.rate_cm_per_min < 0 ? "⬇" : "➖";
  const trendText = prediction && prediction.rate_cm_per_min > 0 ? "Rising" : prediction && prediction.rate_cm_per_min < 0 ? "Falling" : "Stable";
  const rate = prediction ? prediction.rate_cm_per_min : 0;
  
  const risk = prediction ? prediction.flood_risk : 0;

  return (
    <div className="sensor-metrics-row">
      <div className={`sensor-card ${reading.water_level && reading.water_level >= 24 ? 'alert-danger' : 'primary'}`}>
        <span className="card-label">🌊 WATER LEVEL</span>
        <div className="card-value">{formatNumber(reading.water_level, 1)} cm</div>
        <div className="card-sub-value">
          {trendIcon} {trendText} <br />
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {rate > 0 ? '+' : ''}{rate} cm/min
          </span>
        </div>
      </div>
      
      <div className="sensor-card">
        <span className="card-label">📈 TREND</span>
        <div className="card-value" style={{ fontSize: '2rem' }}>
          {trendIcon} {trendText}
        </div>
        <div className="card-sub-value" style={{ marginTop: '0.5rem' }}>
          Rate: {rate} cm/min
        </div>
      </div>
      
      <div className="sensor-card">
        <span className="card-label">⚠️ FLOOD RISK</span>
        <div className="card-value" style={{ color: risk > 50 ? '#dc2626' : risk > 20 ? '#d97706' : '#16a34a' }}>
          {risk}%
        </div>
        <div className="card-sub-value" style={{ marginTop: '0.5rem' }}>
          Confidence: {prediction?.confidence || 0}%
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <Buoy reading={reading} />
      </div>
    </div>
  );
}

import { formatNumber } from "../format";
import type { Reading } from "../types";
import { Buoy } from "./Buoy";

export function SensorCards({ reading, prediction }: { reading: Reading | null, prediction: any }) {
  if (!reading) return null;

  // Constants
  const THRESHOLD = 24.0;
  const currentLevel = reading.water_level || 0;
  const remaining = Math.max(0, THRESHOLD - currentLevel);
  const rate = prediction ? prediction.rate_cm_per_min : 0;
  const risk = prediction ? prediction.flood_risk : 0;

  // Trend logic
  let trendText = "➖ Stable";
  let trendColor = "#6B7280"; // Gray
  if (rate > 0.01) {
    trendText = "↑ Rising";
    trendColor = "#DC2626"; // Red
  } else if (rate < -0.01) {
    trendText = "↓ Falling";
    trendColor = "#16A34A"; // Green
  }

  // Estimated Time To Flood logic
  let timeToFloodText = "No Flood Predicted";
  let timeToFloodValue = "∞";
  
  if (currentLevel >= THRESHOLD) {
    timeToFloodValue = "0";
    timeToFloodText = "Threshold Breached";
  } else if (rate > 0) {
    const mins = remaining / rate;
    timeToFloodValue = `${Math.round(mins)}`;
    timeToFloodText = "minutes to threshold";
  }

  // Gauge calculations
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk / 100) * circumference;
  const gaugeColor = risk > 50 ? "#DC2626" : risk > 20 ? "#D97706" : "#16A34A";

  return (
    <div className="sensor-metrics-row">
      {/* CARD 1: Water Level */}
      <div className="sensor-card">
        <span className="card-label">Water Level</span>
        <div className="card-value-large">{formatNumber(currentLevel, 1)} cm</div>
        <div className="card-sub-info">
          <div className="info-row">
            <span>Trend</span>
            <strong style={{ color: trendColor }}>{trendText}</strong>
          </div>
          <div className="info-row">
            <span>Rate</span>
            <strong>{rate > 0 ? "+" : ""}{formatNumber(rate, 2)} cm/min</strong>
          </div>
          <div className="info-divider"></div>
          <div className="info-row remaining-row">
            <span>Remaining to Flood Threshold</span>
            <strong>{formatNumber(remaining, 1)} cm</strong>
          </div>
        </div>
      </div>
      
      {/* CARD 2: Flood Risk */}
      <div className="sensor-card gauge-card">
        <span className="card-label">Flood Risk</span>
        <div className="gauge-container">
          <svg width="90" height="90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              stroke={gaugeColor} 
              strokeWidth="8" 
              fill="transparent"
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              transform="rotate(-90 50 50)" 
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
            <text x="50" y="56" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111827">{risk}%</text>
          </svg>
        </div>
        <span className="card-sub-label">Computed from Level, Trend & ML</span>
      </div>
      
      {/* CARD 3: Estimated Time To Flood */}
      <div className="sensor-card">
        <span className="card-label">Est. Time To Flood</span>
        <div className="card-value-large font-mono">{timeToFloodValue}</div>
        <span className="card-sub-label text-center" style={{ marginTop: "10px", fontSize: "0.85rem", color: "#6B7280" }}>
          {timeToFloodText}
        </span>
      </div>
      
      {/* CARD 4: Node Orientation */}
      <div className="sensor-card buoy-card">
        <span className="card-label" style={{ marginBottom: "5px" }}>Node Orientation</span>
        <Buoy reading={reading} />
      </div>
    </div>
  );
}

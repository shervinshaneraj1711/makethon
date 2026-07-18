import React from "react";
import { Reading } from "../types";

export const StatsPanel: React.FC<{ readings: Reading[] }> = ({ readings }) => {
  const validReadings = readings.filter(r => r.water_level !== null) as (Reading & { water_level: number })[];
  
  const packets = readings.length;
  let max = 0;
  let min = 0;
  let avg = 0;
  
  if (validReadings.length > 0) {
    const levels = validReadings.map(r => r.water_level);
    max = Math.max(...levels);
    min = Math.min(...levels);
    avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  }

  return (
    <div className="panel stats-panel" style={{ padding: "10px 16px" }}>
      <div className="panel-header" style={{ marginBottom: "5px" }}>
        <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280", textAlign: "left" }}>
          Today's Summary
        </h3>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Maximum</span>
          <strong className="stat-value">{max.toFixed(1)} cm</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Minimum</span>
          <strong className="stat-value">{min.toFixed(1)} cm</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average</span>
          <strong className="stat-value">{avg.toFixed(1)} cm</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Packets Received</span>
          <strong className="stat-value">{packets}</strong>
        </div>
      </div>
    </div>
  );
};

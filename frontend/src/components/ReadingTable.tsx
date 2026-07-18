import { formatDeviceTimestamp, formatNumber, formatTimestamp } from "../format";
import type { Reading } from "../types";

export function ReadingTable({ readings, loading = false }: { readings: Reading[], loading?: boolean }) {
  if (loading) return <p style={{ fontSize: "0.85rem", color: "#6B7280", padding: "10px" }}>Loading stored readings…</p>;
  if (!readings.length) return <p style={{ fontSize: "0.85rem", color: "#6B7280", padding: "10px" }}>No telemetry has been stored yet.</p>;

  // Sort readings chronologically for accurate trend estimation, then reverse back for display
  const chronological = [...readings].reverse();
  const enhancedReadings = chronological.map((reading, i) => {
    let trend = "➖";
    let trendColor = "#6B7280";
    let rate = 0;
    
    if (i > 0) {
      const prev = chronological[i - 1];
      // calculate rate in cm/min (assuming ~2 second updates from telemetry stream)
      rate = (reading.water_level || 0) - (prev.water_level || 0);
      rate = rate * 30; // 2 sec interval => *30 = 60s
      if (rate > 0.05) {
        trend = "↑";
        trendColor = "#DC2626";
      } else if (rate < -0.05) {
        trend = "↓";
        trendColor = "#16A34A";
      }
    }
    
    // Standard SCADA Risk computation (mirrors backend formula)
    const DANGER_LEVEL = 24.0;
    const current = reading.water_level || 0;
    const level_factor = Math.max(0, current / DANGER_LEVEL);
    const rate_factor = Math.max(0, rate / 1.0);
    let risk = Math.min(100, (level_factor * 0.4 + rate_factor * 0.6) * 100);
    if (rate <= 0) {
      risk = Math.min(20, (level_factor * 0.2) * 100);
    }
    if (current >= DANGER_LEVEL) {
      risk = 100;
    }
    
    // Status flag logic
    let status = "SAFE";
    let statusColor = "#16A34A";
    let statusBg = "#DCFCE7";
    if (current >= DANGER_LEVEL) {
      status = "DANGER";
      statusColor = "#991B1B";
      statusBg = "#FEE2E2";
    } else if (rate > 0.5) {
      status = "WARNING";
      statusColor = "#92400E";
      statusBg = "#FEF3C7";
    }

    return {
      ...reading,
      trend,
      trendColor,
      risk: Math.round(risk),
      status,
      statusColor,
      statusBg
    };
  }).reverse();

  return (
    <div className="table-wrapper" style={{ maxHeight: "160px", overflowY: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Water Level</th>
            <th>Trend</th>
            <th>Flood Risk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {enhancedReadings.slice(0, 15).map((reading) => (
            <tr key={reading.id}>
              <td>{reading.device_timestamp ? formatDeviceTimestamp(reading.device_timestamp).split(' ')[1] : formatTimestamp(reading.received_at).split(' ')[1]}</td>
              <td>{formatNumber(reading.water_level, 1)} cm</td>
              <td style={{ color: reading.trendColor, fontWeight: "bold" }}>{reading.trend}</td>
              <td>{reading.risk}%</td>
              <td>
                <span className="status-badge" style={{ backgroundColor: reading.statusBg, color: reading.statusColor }}>
                  {reading.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

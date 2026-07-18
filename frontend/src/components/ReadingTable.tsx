import { formatDeviceTimestamp, formatNumber, formatTimestamp } from "../format";
import type { Reading } from "../types";

export function ReadingTable({ readings, loading = false }: { readings: Reading[], loading?: boolean }) {
  if (loading) return <p>Loading stored readings…</p>;
  if (!readings.length) return <p>No telemetry has been stored yet.</p>;

  // Sort readings chronologically for trend calculation, then reverse for display
  const chronological = [...readings].reverse();
  const enhancedReadings = chronological.map((reading, i) => {
    let trend = "➖";
    let pred = reading.water_level || 0;
    
    if (i > 0) {
      const prev = chronological[i - 1];
      const diff = (reading.water_level || 0) - (prev.water_level || 0);
      if (diff > 0.1) {
        trend = "⬆";
        pred = (reading.water_level || 0) + (diff * 10);
      } else if (diff < -0.1) {
        trend = "⬇";
        pred = (reading.water_level || 0) + (diff * 10);
      }
    }
    
    return {
      ...reading,
      trend,
      pred
    };
  }).reverse();

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Water Level</th>
            <th>Trend</th>
            <th>10m Prediction</th>
            <th>Alert</th>
          </tr>
        </thead>
        <tbody>
          {enhancedReadings.slice(0, 50).map((reading) => (
            <tr key={reading.id}>
              <td>{reading.device_timestamp ? formatDeviceTimestamp(reading.device_timestamp).split(' ')[1] : formatTimestamp(reading.received_at).split(' ')[1]}</td>
              <td>{formatNumber(reading.water_level, 1)} cm</td>
              <td>{reading.trend}</td>
              <td>{formatNumber(reading.pred, 1)} cm</td>
              <td>
                <span className={`status-badge ${reading.alert ? 'alert' : ''}`} style={{ backgroundColor: reading.alert ? '#fecaca' : '#dcfce7', color: reading.alert ? '#991b1b' : '#166534' }}>
                  {reading.alert ? 'DANGER' : 'SAFE'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

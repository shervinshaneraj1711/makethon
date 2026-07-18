import { formatDeviceTimestamp, formatNumber, formatTimestamp } from "../format";
import type { Reading } from "../types";

export function ReadingTable({ readings, mode, loading = false }: { readings: Reading[], mode: "raw" | "history", loading?: boolean }) {
  if (loading) return <p>Loading stored readings…</p>;
  if (!readings.length) return <p>No telemetry has been stored yet.</p>;

  if (mode === "raw") {
    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Received Time</th>
              <th>Raw Packet (JSON)</th>
            </tr>
          </thead>
          <tbody>
            {readings.slice(0, 12).map((reading) => (
              <tr key={reading.id}>
                <td>{formatTimestamp(reading.received_at)}</td>
                <td className="raw-code">{reading.raw_packet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Device</th>
            <th>Water Lvl</th>
            <th>Roll</th>
            <th>Pitch</th>
            <th>Alert</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td>{reading.device_timestamp ? formatDeviceTimestamp(reading.device_timestamp).split(' ')[1] : formatTimestamp(reading.received_at).split(' ')[1]}</td>
              <td>{reading.device_id}</td>
              <td>{formatNumber(reading.water_level, 1)} cm</td>
              <td>{formatNumber(reading.roll)}°</td>
              <td>{formatNumber(reading.pitch)}°</td>
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

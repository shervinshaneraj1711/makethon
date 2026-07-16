import { formatDeviceTimestamp, formatNumber, formatTimestamp } from "../format";
import type { Reading } from "../types";

interface ReadingTableProps {
  readings: Reading[];
  mode: "raw" | "history";
  loading?: boolean;
}

function OptionalValue({ value }: { value: string | number | boolean | null }) {
  if (value === null) return <span className="muted">—</span>;
  if (typeof value === "boolean") return <>{value ? "Rain" : "Dry"}</>;
  return <>{value}</>;
}

export function ReadingTable({ readings, mode, loading = false }: ReadingTableProps) {
  if (loading) return <p className="table-message">Loading stored readings…</p>;
  if (!readings.length) return <p className="table-message">No telemetry has been stored yet.</p>;

  if (mode === "raw") {
    return (
      <div className="table-scroll">
        <table className="raw-table">
          <thead><tr><th>Received</th><th>Raw ESP32 packet</th></tr></thead>
          <tbody>
            {readings.slice(0, 12).map((reading) => (
              <tr key={reading.id}>
                <td>{formatTimestamp(reading.received_at)}</td>
                <td><code>{reading.raw_packet}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Device time</th><th>Device</th><th>Distance</th><th>Pressure</th>
            <th>Tilt X</th><th>Tilt Y</th><th>Tilt Z</th><th>Rain</th><th>Battery</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td>{formatDeviceTimestamp(reading.device_timestamp)}</td>
              <td>{reading.device_id}</td>
              <td>{formatNumber(reading.distance)}</td>
              <td>{formatNumber(reading.pressure, 3)}</td>
              <td>{formatNumber(reading.tilt_x)}</td>
              <td>{formatNumber(reading.tilt_y)}</td>
              <td>{formatNumber(reading.tilt_z)}</td>
              <td><OptionalValue value={reading.rain} /></td>
              <td><OptionalValue value={reading.battery} /></td>
              <td><OptionalValue value={reading.device_status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


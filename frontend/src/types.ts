export interface Reading {
  id: number;
  device_id: string;
  device_timestamp: string;
  received_at: string;
  distance: number;
  pressure: number;
  tilt_x: number;
  tilt_y: number;
  tilt_z: number;
  rain: boolean | null;
  battery: number | null;
  device_status: string | null;
  raw_packet: string;
}

export type ConnectionState =
  | "starting"
  | "connecting"
  | "connected"
  | "disconnected"
  | "configuration_required"
  | "stopped"
  | "backend_unavailable";

export interface ConnectionSnapshot {
  state: ConnectionState;
  transport: string;
  port: string | null;
  detail: string;
  last_update_at: string | null;
  latest_device_id: string | null;
}

export type LiveEvent =
  | { type: "connection"; data: ConnectionSnapshot }
  | { type: "reading"; data: Reading };


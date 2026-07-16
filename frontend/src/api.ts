import type { ConnectionSnapshot, Reading } from "./types";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchStatus(signal?: AbortSignal): Promise<ConnectionSnapshot> {
  return readJson(await fetch("/api/v1/status", { signal }));
}

export async function fetchReadings(
  limit = 100,
  offset = 0,
  signal?: AbortSignal,
): Promise<Reading[]> {
  const result = await readJson<{ items: Reading[] }>(
    await fetch(`/api/v1/readings?limit=${limit}&offset=${offset}`, { signal }),
  );
  return result.items;
}

export function liveWebSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/live`;
}


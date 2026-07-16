import { useCallback, useEffect, useRef, useState } from "react";

import { fetchReadings, fetchStatus, liveWebSocketUrl } from "../api";
import type { ConnectionSnapshot, LiveEvent, Reading } from "../types";

const unavailable: ConnectionSnapshot = {
  state: "backend_unavailable",
  transport: "unknown",
  port: null,
  detail: "The monitoring backend is unavailable",
  last_update_at: null,
  latest_device_id: null,
};

export function useTelemetry() {
  const [connection, setConnection] = useState<ConnectionSnapshot>(unavailable);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const retryTimer = useRef<number | undefined>(undefined);

  const refreshHistory = useCallback(async (signal?: AbortSignal) => {
    setHistoryLoading(true);
    try {
      setReadings(await fetchReadings(100, 0, signal));
      setHistoryError(null);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setHistoryError("Stored readings could not be loaded.");
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    void Promise.all([
      fetchStatus(abort.signal).then(setConnection).catch(() => setConnection(unavailable)),
      refreshHistory(abort.signal),
    ]);

    let socket: WebSocket | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      socket = new WebSocket(liveWebSocketUrl());
      socket.onmessage = (message) => {
        const event = JSON.parse(message.data) as LiveEvent;
        if (event.type === "connection") {
          setConnection(event.data);
        } else if (event.type === "reading") {
          setReadings((current) => [
            event.data,
            ...current.filter((item) => item.id !== event.data.id),
          ].slice(0, 100));
          setConnection((current) => ({
            ...current,
            state: "connected",
            detail: "Receiving telemetry",
            last_update_at: event.data.received_at,
            latest_device_id: event.data.device_id,
          }));
        }
      };
      socket.onopen = () => {
        void refreshHistory();
      };
      socket.onclose = () => {
        if (!closed) {
          setConnection((current) => ({
            ...current,
            state: "backend_unavailable",
            detail: "Live connection lost; retrying",
          }));
          retryTimer.current = window.setTimeout(connect, 2000);
        }
      };
      socket.onerror = () => socket?.close();
    };

    connect();
    return () => {
      closed = true;
      abort.abort();
      window.clearTimeout(retryTimer.current);
      socket?.close();
    };
  }, [refreshHistory]);

  return {
    connection,
    readings,
    latest: readings[0] ?? null,
    historyLoading,
    historyError,
    refreshHistory,
  };
}


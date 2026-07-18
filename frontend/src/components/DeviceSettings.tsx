import { useState } from "react";

export function DeviceSettings() {
  const [interval, setIntervalVal] = useState(2000);
  const [status, setStatus] = useState("");

  const handleSave = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch(`/api/v1/config?interval=${interval}`, { method: 'POST' });
      const data = await res.json();
      setStatus(data.status === 'success' ? "Saved successfully!" : "Failed to save.");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus("Error saving config.");
    }
  };

  return (
    <div className="settings-form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label>Settings:</label>
        <input type="text" value="RiverNode01" disabled />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label>Update Interval:</label>
        <select value={interval} onChange={(e) => setIntervalVal(Number(e.target.value))}>
          <option value={1000}>1000ms (1s)</option>
          <option value={2000}>2000ms (2s)</option>
          <option value={5000}>5000ms (5s)</option>
          <option value={10000}>10000ms (10s)</option>
        </select>
      </div>
      <button className="btn-primary" onClick={handleSave}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        Save Configuration
      </button>
      {status && <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{status}</span>}
    </div>
  );
}

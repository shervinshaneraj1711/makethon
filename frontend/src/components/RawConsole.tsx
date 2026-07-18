import React, { useState } from "react";
import { Reading } from "../types";

export const RawConsole: React.FC<{ readings: Reading[] }> = ({ readings }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="panel raw-console-panel">
      <div 
        className="panel-header console-header" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
      >
        <h3>Developer Console: Raw Telemetry</h3>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      
      {isOpen && (
        <div className="console-content" style={{ maxHeight: "300px", overflowY: "auto", padding: "1rem", backgroundColor: "#000", color: "#0f0", fontFamily: "monospace" }}>
          {readings.slice(0, 20).map(r => (
            <div key={r.id} style={{ marginBottom: "4px" }}>
              <span style={{ color: "#888" }}>{new Date(r.received_at).toLocaleTimeString()}</span> &gt; {r.raw_packet}
            </div>
          ))}
          {readings.length === 0 && <div>Waiting for data...</div>}
        </div>
      )}
    </div>
  );
};

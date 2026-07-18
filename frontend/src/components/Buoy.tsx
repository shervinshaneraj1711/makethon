import React from "react";
import { Reading } from "../types";

export const Buoy: React.FC<{ reading: Reading | null }> = ({ reading }) => {
  if (!reading) return null;

  const roll = reading.roll || 0;
  const pitch = reading.pitch || 0;
  
  // Constrain visual rotation
  const displayRoll = Math.max(-45, Math.min(45, roll));
  const displayPitch = Math.max(-45, Math.min(45, pitch));
  
  // Calculate vertical offset from pitch for 3D illusion
  const pitchOffset = displayPitch * -0.5;

  return (
    <div className="panel buoy-panel">
      <div className="panel-header">
        <h3>Node Orientation</h3>
      </div>
      
      <div className="buoy-container">
        {/* Animated Scene */}
        <div className="buoy-scene">
          <div className="sky">
             <span className="cloud c1">☁️</span>
             <span className="cloud c2">☁️</span>
          </div>
          <div className="water-surface">
            {/* The buoy rotates based on roll and moves up/down slightly based on pitch */}
            <div 
              className="buoy" 
              style={{ 
                transform: `translateY(${pitchOffset}px) rotate(${displayRoll}deg)`
              }}
            >
              <div className="buoy-top"></div>
              <div className="buoy-stripe"></div>
              <div className="buoy-base"></div>
            </div>
            
            <div className="wave w1"></div>
            <div className="wave w2"></div>
          </div>
        </div>

        {/* Readouts */}
        <div className="buoy-readouts">
          <div className="buoy-status">
            <span className="status-dot green"></span>
            <strong>{Math.abs(roll) > 15 || Math.abs(pitch) > 15 ? "UNSTABLE" : "STABLE"}</strong>
          </div>
          <div className="buoy-metrics">
            <div className="metric">
              <span className="label">Roll</span>
              <strong>{roll.toFixed(2)}°</strong>
            </div>
            <div className="metric">
              <span className="label">Pitch</span>
              <strong>{pitch.toFixed(2)}°</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

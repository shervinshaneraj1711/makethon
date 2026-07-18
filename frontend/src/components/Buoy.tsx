import React from "react";
import { Reading } from "../types";

export const Buoy: React.FC<{ reading: Reading | null }> = ({ reading }) => {
  if (!reading) return null;

  const roll = reading.roll || 0;
  const pitch = reading.pitch || 0;
  
  // Constrain visual rotation for clean rendering
  const displayRoll = Math.max(-45, Math.min(45, roll));
  const displayPitch = Math.max(-45, Math.min(45, pitch));
  const pitchOffset = displayPitch * -0.5;

  // Stability logic derived from roll & pitch
  const absRoll = Math.abs(roll);
  const absPitch = Math.abs(pitch);
  
  let stability: "Stable" | "Tilted" | "Critical" = "Stable";
  let stabilityColor = "#16A34A"; // Green
  
  if (absRoll > 25 || absPitch > 25) {
    stability = "Critical";
    stabilityColor = "#DC2626"; // Red
  } else if (absRoll > 10 || absPitch > 10) {
    stability = "Tilted";
    stabilityColor = "#D97706"; // Amber
  }

  return (
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

      {/* Readouts below image */}
      <div className="buoy-readouts">
        <div className="metric-row">
          <span className="label">Roll:</span>
          <strong>{roll.toFixed(1)}°</strong>
        </div>
        <div className="metric-row">
          <span className="label">Pitch:</span>
          <strong>{pitch.toFixed(1)}°</strong>
        </div>
        <div className="metric-row">
          <span className="label">Stability:</span>
          <strong style={{ color: stabilityColor }}>{stability}</strong>
        </div>
      </div>
    </div>
  );
};

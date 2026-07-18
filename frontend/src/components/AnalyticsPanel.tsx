import React from "react";

export const AnalyticsPanel: React.FC<{ prediction: any }> = ({ prediction }) => {
  const min10 = prediction?.predictions?.min10 !== undefined ? `${prediction.predictions.min10.toFixed(1)} cm` : "N/A";
  const min30 = prediction?.predictions?.min30 !== undefined ? `${prediction.predictions.min30.toFixed(1)} cm` : "N/A";
  const min60 = prediction?.predictions?.min60 !== undefined ? `${prediction.predictions.min60.toFixed(1)} cm` : "N/A";

  return (
    <div className="panel analytics-panel">
      <div className="panel-header" style={{ marginBottom: "15px" }}>
        <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280" }}>
          Prediction Panel
        </h3>
      </div>
      
      <div className="analytics-content" style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%", justifyContent: "center" }}>
        <div className="prediction-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>
          <span style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>10 min</span>
          <strong style={{ fontSize: "1.1rem", color: "#D97706" }}>{min10}</strong>
        </div>
        <div className="prediction-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>
          <span style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>30 min</span>
          <strong style={{ fontSize: "1.1rem", color: "#D97706" }}>{min30}</strong>
        </div>
        <div className="prediction-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>
          <span style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>60 min</span>
          <strong style={{ fontSize: "1.1rem", color: "#D97706" }}>{min60}</strong>
        </div>
        
        <div style={{ marginTop: "auto", paddingTop: "10px", textAlign: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#6B7280", fontStyle: "italic" }}>
            Predicted using ML Model
          </span>
        </div>
      </div>
    </div>
  );
};

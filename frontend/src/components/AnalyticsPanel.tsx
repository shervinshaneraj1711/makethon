import React from "react";

export const AnalyticsPanel: React.FC<{ prediction: any }> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="panel analytics-panel">
        <div className="panel-header">
          <h3>AI Analytics</h3>
        </div>
        <div className="panel-content empty">
          Waiting for predictive model...
        </div>
      </div>
    );
  }

  const { status, rate_cm_per_min, predictions, flood_risk, confidence } = prediction;
  
  return (
    <div className="panel analytics-panel">
      <div className="panel-header">
        <h3>AI Prediction</h3>
      </div>
      
      <div className="analytics-content">
        {/* Extrapolations */}
        {predictions ? (
          <div className="predictions-timeline">
            <div className="timeline-node">
              <span className="time-label">10 min</span>
              <strong className="predicted-val">{predictions.min10} cm</strong>
            </div>
            <div className="timeline-arrow">↓</div>
            <div className="timeline-node">
              <span className="time-label">30 min</span>
              <strong className="predicted-val">{predictions.min30} cm</strong>
            </div>
            <div className="timeline-arrow">↓</div>
            <div className="timeline-node">
              <span className="time-label">60 min</span>
              <strong className="predicted-val">{predictions.min60} cm</strong>
            </div>
          </div>
        ) : (
          <div className="predictions-timeline">
            <p>Water level stable. No flood predicted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

from datetime import datetime
from typing import List

def calculate_flood_prediction(readings: list) -> dict:
    """
    Calculate the rate of water rise and predict time until danger.
    Expects a chronological list of StoredReading objects.
    """
    # Filter out readings with null water_levels
    valid_readings = [r for r in readings if getattr(r, 'water_level', None) is not None]
    
    # Need at least 5 valid points to form a basic trend
    if len(valid_readings) < 5:
        return {"status": "INSUFFICIENT_DATA", "message": "Gathering more data..."}
    
    t0 = valid_readings[0].received_at.timestamp()
    x = [r.received_at.timestamp() - t0 for r in valid_readings]
    y = [r.water_level for r in valid_readings]

    N = len(y)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(x[i] * y[i] for i in range(N))
    sum_x2 = sum(x[i] ** 2 for i in range(N))
    
    denominator = (N * sum_x2 - sum_x ** 2)
    if denominator == 0:
        return {"status": "STABLE", "message": "Water level is perfectly stable."}
        
    # m is change in distance per second
    m = (N * sum_xy - sum_x * sum_y) / denominator
    
    # Convert to cm per minute
    rate_cm_per_min = m * 60.0

    # Let's say danger threshold is 24 cm water level
    DANGER_LEVEL = 24.0
    current_level = y[-1]
    
    # Calculate predictions
    pred_10 = round(current_level + rate_cm_per_min * 10, 2)
    pred_30 = round(current_level + rate_cm_per_min * 30, 2)
    pred_60 = round(current_level + rate_cm_per_min * 60, 2)
    predictions = {"min10": pred_10, "min30": pred_30, "min60": pred_60}
    
    # Calculate a flood risk percentage
    level_factor = max(0, current_level / DANGER_LEVEL)
    rate_factor = max(0, rate_cm_per_min / 1.0) # Assume 1.0 cm/min is highly critical
    flood_risk = int(min(100, (level_factor * 0.4 + rate_factor * 0.6) * 100))
    if rate_cm_per_min <= 0:
        flood_risk = int(min(20, (level_factor * 0.2) * 100)) # Minor risk if not rising
    if current_level >= DANGER_LEVEL:
        flood_risk = 100
    
    if current_level >= DANGER_LEVEL:
        return {
            "status": "CRITICAL",
            "rate_cm_per_min": round(rate_cm_per_min, 2),
            "message": "CRITICAL: Water has breached the danger threshold!",
            "predictions": predictions,
            "flood_risk": flood_risk,
            "confidence": 99
        }
        
    # If the rate is highly positive, water is rising quickly
    if rate_cm_per_min > 0.5:
        level_to_danger = DANGER_LEVEL - current_level
        minutes_to_danger = level_to_danger / rate_cm_per_min
        
        return {
            "status": "WARNING",
            "rate_cm_per_min": round(rate_cm_per_min, 2),
            "minutes_to_danger": int(minutes_to_danger),
            "message": f"WARNING: Water rising at {round(rate_cm_per_min, 2)} cm/min. Danger in ~{int(minutes_to_danger)} mins.",
            "predictions": predictions,
            "flood_risk": flood_risk,
            "confidence": 92
        }
    
    return {
        "status": "STABLE",
        "rate_cm_per_min": round(rate_cm_per_min, 2),
        "message": "Water level is stable.",
        "predictions": predictions,
        "flood_risk": flood_risk,
        "confidence": 95
    }

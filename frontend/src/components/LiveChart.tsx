import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export function LiveChart({ readings, prediction }: { readings: any[], prediction?: any }) {
  const chartData = [...readings].reverse().map(r => {
    return {
      time: r.device_timestamp 
        ? new Date(r.device_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : '',
      "Current Level": r.water_level !== null ? r.water_level : 0,
      "Prediction": null
    };
  });
  
  if (prediction?.predictions) {
     // Connect prediction line to the last real data point
     if (chartData.length > 0) {
        chartData[chartData.length - 1]["Prediction"] = chartData[chartData.length - 1]["Current Level"];
     }
     
     chartData.push({ time: "+10m", "Current Level": null, "Prediction": prediction.predictions.min10 });
     chartData.push({ time: "+30m", "Current Level": null, "Prediction": prediction.predictions.min30 });
     chartData.push({ time: "+60m", "Current Level": null, "Prediction": prediction.predictions.min60 });
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            fontSize={11} 
            tick={{ fill: '#6B7280' }} 
            tickMargin={8} 
            minTickGap={40}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={11} 
            tick={{ fill: '#6B7280' }} 
            domain={[0, 35]} 
            tickMargin={8}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: '12px', color: '#111827' }} />
          
          {/* Danger/Flood Threshold Line (Red) */}
          <ReferenceLine 
            y={24.0} 
            stroke="#dc2626" 
            strokeDasharray="4 4" 
            label={{ position: 'insideTopLeft', value: 'Flood Threshold (24.0 cm)', fill: '#dc2626', fontSize: 11, fontWeight: 'bold' }} 
          />

          {/* Normal Level Line (Green) */}
          <ReferenceLine 
            y={12.0} 
            stroke="#16a34a" 
            strokeDasharray="4 4" 
            label={{ position: 'insideBottomLeft', value: 'Normal Level (12.0 cm)', fill: '#16a34a', fontSize: 11, fontWeight: 'bold' }} 
          />

          <Area 
            type="monotone" 
            dataKey="Current Level" 
            stroke="#2563eb" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorLevel)" 
            isAnimationActive={true}
          />
          <Area 
            type="monotone" 
            dataKey="Prediction" 
            stroke="#f97316" 
            strokeDasharray="4 4"
            strokeWidth={2}
            fill="none" 
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

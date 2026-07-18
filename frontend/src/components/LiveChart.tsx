import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function LiveChart({ readings, prediction }: { readings: any[], prediction?: any }) {
  const chartData = [...readings].reverse().map(r => {
    return {
      time: r.device_timestamp 
        ? new Date(r.device_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : '',
      water_level: r.water_level !== null ? r.water_level : 0,
      predicted_level: null
    };
  });
  
  if (prediction?.predictions) {
     // Connect prediction line to the last real data point
     if (chartData.length > 0) {
        chartData[chartData.length - 1].predicted_level = chartData[chartData.length - 1].water_level;
     }
     
     chartData.push({ time: "+10m", water_level: null, predicted_level: prediction.predictions.min10 });
     chartData.push({ time: "+30m", water_level: null, predicted_level: prediction.predictions.min30 });
     chartData.push({ time: "+60m", water_level: null, predicted_level: prediction.predictions.min60 });
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            fontSize={11} 
            tick={{ fill: '#4b5563' }} 
            tickMargin={10} 
            minTickGap={30}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={11} 
            tick={{ fill: '#4b5563' }} 
            domain={[0, 40]} 
            tickMargin={10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: '#2563eb', fontWeight: 600 }}
          />
          <ReferenceLine y={24.0} stroke="#dc2626" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Flood Threshold', fill: '#dc2626', fontSize: 12 }} />
          <Area 
            type="monotone" 
            dataKey="water_level" 
            stroke="#2563eb" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorDistance)" 
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="predicted_level" 
            stroke="#f97316" 
            strokeDasharray="5 5"
            strokeWidth={2}
            fill="none" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

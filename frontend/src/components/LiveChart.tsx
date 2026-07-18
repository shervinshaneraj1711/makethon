import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function LiveChart({ readings }: { readings: any[] }) {
  const chartData = [...readings].reverse().map(r => {
    return {
      time: r.device_timestamp 
        ? new Date(r.device_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        : '',
      water_level: r.water_level !== null ? r.water_level : 0,
    };
  });

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
          <Area 
            type="monotone" 
            dataKey="water_level" 
            stroke="#2563eb" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorDistance)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

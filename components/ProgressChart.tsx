
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TimeSeriesDataPoint } from '../types';

interface ProgressChartProps {
  data: TimeSeriesDataPoint[];
  unit: string;
  color?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, unit, color = '#FFFFFF' }) => {
  if (data.length < 2) {
    return (
      <div className="h-64 w-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-[#1C1C1E]">
        <p className="text-sm text-[#8E8E93]">Not enough data points to chart</p>
      </div>
    );
  }

  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));
  // Add some padding to domain
  const domainMin = Math.floor(minVal * 0.95);
  const domainMax = Math.ceil(maxVal * 1.05);

  return (
    <div className="h-64 w-full bg-[#1C1C1E] rounded-2xl p-2 border border-[#2C2C2E] shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C2C2E" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#8E8E93', fontSize: 10}}
            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
            minTickGap={30}
          />
          <YAxis 
            domain={[domainMin, domainMax]} 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#8E8E93', fontSize: 10}}
            width={40}
          />
          <Tooltip 
            cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            formatter={(val: number) => [`${val} ${unit}`, 'Value']}
            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#chartColor)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

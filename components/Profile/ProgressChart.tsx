
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TimeSeriesDataPoint } from '../../types';

interface ProgressChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 w-full bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] flex items-center justify-center">
        <p className="text-sm text-[#8E8E93]">No data available for {title}</p>
      </div>
    );
  }

  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));
  const domainMin = Math.floor(minVal * 0.9);
  const domainMax = Math.ceil(maxVal * 1.1);

  return (
    <div className="h-64 w-full bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] shadow-sm">
      <h3 className="text-xs font-bold text-[#8E8E93] uppercase mb-4 tracking-wider">{title} Trend</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
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
            />
            <Tooltip 
              cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#FFFFFF" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#chartGradient)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

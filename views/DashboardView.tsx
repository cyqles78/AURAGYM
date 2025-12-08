import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { DailyStats } from '../types';
import { Flame, Droplets, Trophy, Activity, ArrowRight, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

interface DashboardViewProps {
  stats: DailyStats;
  onNavigate: (view: any) => void;
}

const activityData = [
  { day: 'M', val: 30 }, { day: 'T', val: 45 }, { day: 'W', val: 20 }, 
  { day: 'T', val: 60 }, { day: 'F', val: 50 }, { day: 'S', val: 80 }, { day: 'S', val: 40 }
];

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, onNavigate }) => {
  return (
    <div className="pb-28 pt-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Summary</h1>
          <p className="text-secondary text-sm font-medium">Monday, Oct 24</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center">
             <span className="text-xs font-bold text-white">AL</span>
        </div>
      </div>

      {/* Main Stats Card */}
      <GlassCard className="group" onClick={() => onNavigate('WORKOUTS')}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-2">
             <div className="p-1.5 bg-white text-black rounded-lg">
                <Flame size={18} fill="currentColor" />
             </div>
             <span className="text-sm font-bold text-white">Active Streak</span>
          </div>
          <div className="text-right">
             <span className="text-2xl font-bold text-white">12</span>
             <span className="text-xs text-secondary ml-1">Days</span>
          </div>
        </div>
        
        <div className="space-y-2">
             <div className="flex justify-between text-xs text-secondary font-medium">
                 <span>Weekly Goal</span>
                 <span>85%</span>
             </div>
             <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-white rounded-full"></div>
             </div>
        </div>
      </GlassCard>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col justify-between h-32" onClick={() => onNavigate('FOOD')}>
           <div className="flex justify-between items-start">
               <span className="text-xs font-bold text-secondary uppercase">Calories</span>
               <Flame size={16} className="text-white" />
           </div>
           <div>
               <p className="text-2xl font-bold text-white tracking-tight">{stats.caloriesConsumed}</p>
               <p className="text-xs text-secondary">of {stats.caloriesTarget} kcal</p>
           </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between h-32" onClick={() => onNavigate('FOOD')}>
           <div className="flex justify-between items-start">
               <span className="text-xs font-bold text-secondary uppercase">Protein</span>
               <Droplets size={16} className="text-white" />
           </div>
           <div>
               <p className="text-2xl font-bold text-white tracking-tight">{stats.proteinConsumed}g</p>
               <p className="text-xs text-secondary">of {stats.proteinTarget} g</p>
           </div>
        </GlassCard>
      </div>

      {/* Activity Chart Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-white">Volume</h3>
        </div>
        <GlassCard className="h-56 !p-0 overflow-hidden flex flex-col">
          <div className="p-5 flex justify-between items-center border-b border-border">
            <div>
               <p className="text-xs text-secondary font-semibold uppercase">Total Load</p>
               <p className="text-2xl font-bold text-white mt-1">12,450 kg</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  cursor={{ stroke: '#333', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="val" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
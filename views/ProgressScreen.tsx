
import React from 'react';
import { WeightEntry, ExercisePerformanceEntry } from '../types';
import { useProgressMetrics } from '../hooks/useProgressMetrics';
import { ProgressChart } from '../components/ProgressChart';
import { ArrowLeft, TrendingUp, TrendingDown, Award, Calendar } from 'lucide-react';

interface ProgressScreenProps {
  weightHistory: WeightEntry[];
  exerciseHistory: ExercisePerformanceEntry[];
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ 
  weightHistory, 
  exerciseHistory, 
  onBack 
}) => {
  const { 
    selectedMetric, 
    setSelectedMetric, 
    metricList, 
    chartData, 
    summary 
  } = useProgressMetrics(weightHistory, exerciseHistory);

  const isWeight = selectedMetric === 'Weight';
  const unit = isWeight ? 'kg' : 'kg (1RM)';
  const chartColor = isWeight ? '#FFFFFF' : '#30D158'; // White for weight, Green for strength

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center space-x-2 px-1">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Progress Tracking</h1>
      </div>

      {/* Metric Selector */}
      <div className="px-1">
        <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Select Metric</label>
        <div className="relative">
            <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-4 py-3 text-white appearance-none font-medium focus:outline-none focus:border-white transition-colors"
            >
                {metricList.map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Calendar size={16} className="text-[#8E8E93]" />
            </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary ? (
          <div className="grid grid-cols-2 gap-3 px-1">
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-4 rounded-2xl">
                  <p className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider mb-1">Current</p>
                  <p className="text-2xl font-bold text-white">{summary.current} <span className="text-xs font-normal text-[#8E8E93]">{unit}</span></p>
              </div>
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-4 rounded-2xl">
                  <p className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider mb-1">All Time Best</p>
                  <div className="flex items-center gap-2">
                     <p className="text-2xl font-bold text-white">{summary.allTimeHigh} <span className="text-xs font-normal text-[#8E8E93]">{unit}</span></p>
                     {summary.current === summary.allTimeHigh && (
                         <Award size={16} className="text-yellow-500" />
                     )}
                  </div>
              </div>
              
              <div className="col-span-2 bg-[#1C1C1E] border border-[#2C2C2E] p-4 rounded-2xl flex items-center justify-between">
                  <div>
                      <p className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider mb-1">Total Change</p>
                      <div className="flex items-center gap-2">
                          <span className={`text-xl font-bold ${summary.change > 0 ? (isWeight ? 'text-white' : 'text-accentGreen') : (isWeight ? 'text-accentGreen' : 'text-red-400')}`}>
                              {summary.change > 0 ? '+' : ''}{summary.change.toFixed(1)} {unit}
                          </span>
                      </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1 ${summary.percentageChange > 0 ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-400/10 text-red-400'}`}>
                      {summary.percentageChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="text-xs font-bold">{Math.abs(summary.percentageChange).toFixed(1)}%</span>
                  </div>
              </div>
          </div>
      ) : (
          <div className="p-8 text-center text-[#8E8E93]">No data available for this metric.</div>
      )}

      {/* Chart */}
      <div className="px-1">
         <h3 className="text-lg font-bold text-white mb-3">History</h3>
         <ProgressChart data={chartData} unit={unit} color={chartColor} />
      </div>

    </div>
  );
};

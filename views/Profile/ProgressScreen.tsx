
import React from 'react';
import { useProgressMetrics } from '../../hooks/useProgressMetrics';
import { ProgressChart } from '../../components/Profile/ProgressChart';
import { ArrowLeft, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface ProgressScreenProps {
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ onBack }) => {
  const { 
    isLoading,
    selectedMetric, 
    setSelectedMetric, 
    metricList, 
    chartData, 
    summary 
  } = useProgressMetrics();

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center space-x-2 px-1">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Progress Tracking</h1>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={32} />
        </div>
      ) : (
        <>
            {/* Metric Selector */}
            <div className="px-1">
                <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Select Metric</label>
                <select 
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-4 py-3 text-white appearance-none font-medium focus:outline-none focus:border-white transition-colors"
                >
                    {metricList.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Metric Summary */}
            {summary && (
                <div className="grid grid-cols-2 gap-3 px-1">
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-4 rounded-2xl">
                        <p className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider mb-1">Current</p>
                        <p className="text-2xl font-bold text-white">{summary.current} <span className="text-xs font-normal text-[#8E8E93]">{selectedMetric === 'Weight' ? 'kg' : 'kg 1RM'}</span></p>
                    </div>
                    
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-4 rounded-2xl flex flex-col justify-between">
                        <p className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider mb-1">Total Change</p>
                        <div className="flex items-center gap-2">
                             <div className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${summary.change > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                                {summary.change > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                {Math.abs(summary.change).toFixed(1)}
                             </div>
                             <span className="text-xs text-[#8E8E93]">from start</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="px-1">
                <ProgressChart data={chartData} title={selectedMetric} />
            </div>
        </>
      )}
    </div>
  );
};

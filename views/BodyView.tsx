import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { WeightEntry, MeasurementEntry, WeightGoal, ExercisePerformanceEntry } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, LineChart, Line } from 'recharts';
import { Camera, Ruler, TrendingUp, TrendingDown, Plus, X, Target, Edit2, Trophy, Dumbbell } from 'lucide-react';

interface BodyViewProps {
  weightHistory: WeightEntry[];
  measurements: MeasurementEntry[];
  onLogMeasurement: (type: string, value: number, unit: string) => void;
  weightGoal: WeightGoal;
  onUpdateWeightGoal: (goal: WeightGoal) => void;
  exerciseHistory: ExercisePerformanceEntry[];
}

export const BodyView: React.FC<BodyViewProps> = ({ 
  weightHistory, 
  measurements, 
  onLogMeasurement,
  weightGoal,
  onUpdateWeightGoal,
  exerciseHistory = []
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState('Weight');
  const [logValue, setLogValue] = useState('');
  
  // Goal Edit State
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editTargetWeight, setEditTargetWeight] = useState(weightGoal.targetWeight?.toString() || '');
  const [editTargetDate, setEditTargetDate] = useState(weightGoal.targetDate || '');

  // --- DATA PROCESSING: WEIGHT ---
  const sortedWeights = [...weightHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latest = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1] : null;
  const currentWeight = latest?.weight || 0;
  
  // Determine start weight: use goal start if active, else first recorded weight
  const startWeight = (weightGoal.isActive && weightGoal.startWeight) 
    ? weightGoal.startWeight 
    : (sortedWeights[0]?.weight || 0);

  const totalDiff = (currentWeight - startWeight).toFixed(1);
  const isGain = parseFloat(totalDiff) > 0;
  
  // Chart Data: Ensure chronological order
  const chartData = useMemo(() => {
    const dailyMap = new Map<string, WeightEntry>();
    weightHistory.forEach(entry => dailyMap.set(entry.date, entry));
    return Array.from(dailyMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightHistory]);

  // --- DATA PROCESSING: MEASUREMENTS ---
  const groupedMeasurements = useMemo(() => {
    const grouped: Record<string, MeasurementEntry[]> = {};
    measurements.forEach(m => {
        if (!grouped[m.type]) grouped[m.type] = [];
        grouped[m.type].push(m);
    });
    
    // Sort each group by date
    Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return grouped;
  }, [measurements]);

  // --- DATA PROCESSING: STRENGTH ---
  const strengthStats = useMemo(() => {
    const keyLifts = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Shoulder Press'];
    const stats: Record<string, { exerciseName: string, maxWeight: number, best1RM: number, prCount: number, lastDate: string }> = {};

    exerciseHistory.forEach(entry => {
        // Simple fuzzy match for key lifts
        const lift = keyLifts.find(k => entry.exerciseName.toLowerCase().includes(k.toLowerCase()));
        if (!lift) return;

        // Use standard name for grouping
        const groupName = lift === 'Shoulder Press' ? 'Overhead Press' : lift;

        if (!stats[groupName]) {
            stats[groupName] = { 
                exerciseName: groupName, 
                maxWeight: 0, 
                best1RM: 0, 
                prCount: 0, 
                lastDate: '' 
            };
        }

        if (entry.isPR) stats[groupName].prCount++;
        
        const sessionMaxWeight = Math.max(...entry.sets.map(s => s.weight || 0), 0);
        const sessionBest1RM = entry.bestSetEstimated1RM || 0;

        if (sessionMaxWeight > stats[groupName].maxWeight) stats[groupName].maxWeight = sessionMaxWeight;
        if (sessionBest1RM > stats[groupName].best1RM) stats[groupName].best1RM = sessionBest1RM;
        if (entry.date > stats[groupName].lastDate) stats[groupName].lastDate = entry.date;
    });

    return Object.values(stats);
  }, [exerciseHistory]);

  // --- HANDLERS ---

  const handleSave = () => {
    if (logValue) {
        const unit = logType === 'Weight' ? 'kg' : 'cm';
        onLogMeasurement(logType, parseFloat(logValue), unit);
        setLogValue('');
        setShowLogModal(false);
    }
  };

  const handleSaveGoal = () => {
      const targetW = parseFloat(editTargetWeight);
      if (isNaN(targetW) || !editTargetDate) return;

      onUpdateWeightGoal({
          isActive: true,
          targetWeight: targetW,
          targetDate: editTargetDate,
          startWeight: weightGoal.startWeight ?? currentWeight ?? null,
          startDate: weightGoal.startDate ?? latest?.date ?? new Date().toISOString()
      });
      setIsEditingGoal(false);
  };

  const handleClearGoal = () => {
      onUpdateWeightGoal({
          isActive: false,
          startDate: null,
          targetDate: null,
          startWeight: null,
          targetWeight: null
      });
      setEditTargetWeight('');
      setEditTargetDate('');
      setIsEditingGoal(false);
  };

  // --- RENDER ---

  return (
    <div className="pb-28 pt-6 space-y-6 relative">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Body Stats</h1>
        <button 
            onClick={() => setShowLogModal(true)}
            className="flex items-center space-x-1 text-xs font-bold text-black bg-white px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
        >
            <Plus size={14} className="mr-1" /> Log
        </button>
      </div>

      {/* 1. WEIGHT & GOAL DASHBOARD */}
      {!isEditingGoal ? (
          <GlassCard className="flex flex-col">
              {/* Header Stats */}
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">Current Weight</span>
                         {weightGoal.isActive && <Target size={12} className="text-accentBlue" />}
                      </div>
                      <h2 className="text-4xl font-bold text-white tracking-tight">{currentWeight} <span className="text-lg font-medium text-secondary">kg</span></h2>
                  </div>
                  
                  <div className="text-right">
                      {startWeight > 0 && (
                          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold mb-1 ${isGain ? 'bg-accentGreen/10 text-accentGreen' : 'bg-red-400/10 text-red-400'}`}>
                              {isGain ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
                              {Math.abs(parseFloat(totalDiff))} kg
                          </div>
                      )}
                      {weightGoal.isActive && weightGoal.targetWeight && (
                          <p className="text-xs text-secondary mt-1">Goal: <span className="text-white font-bold">{weightGoal.targetWeight} kg</span></p>
                      )}
                  </div>
              </div>

              {/* Chart */}
              <div className="h-40 w-full mb-4">
                  {chartData.length < 2 ? (
                      <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl text-xs text-secondary">
                          Add more weight entries to see trends
                      </div>
                  ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C2C2E" />
                            <XAxis dataKey="date" hide />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                            <Tooltip 
                            cursor={{ stroke: '#666', strokeWidth: 1 }}
                            contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(val) => [`${val} kg`]}
                            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                            />
                            {weightGoal.isActive && weightGoal.targetWeight && (
                                <ReferenceLine y={weightGoal.targetWeight} stroke="#0A84FF" strokeDasharray="3 3" />
                            )}
                            <Area type="monotone" dataKey="weight" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                      </ResponsiveContainer>
                  )}
              </div>

              {/* Goal Footer / Edit Button */}
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="flex gap-4">
                      <div>
                          <p className="text-[10px] text-secondary uppercase font-bold">Start</p>
                          <p className="text-sm font-bold text-white">{startWeight} kg</p>
                      </div>
                      {weightGoal.isActive && weightGoal.targetWeight && (
                          <div>
                              <p className="text-[10px] text-secondary uppercase font-bold">Remaining</p>
                              <p className="text-sm font-bold text-white">{(currentWeight - weightGoal.targetWeight).toFixed(1)} kg</p>
                          </div>
                      )}
                  </div>
                  <button onClick={() => setIsEditingGoal(true)} className="text-xs font-bold text-black bg-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-200">
                      <Edit2 size={12} /> {weightGoal.isActive ? 'Edit Goal' : 'Set Goal'}
                  </button>
              </div>
          </GlassCard>
      ) : (
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-white">Edit Goal</h2>
                 <button onClick={() => setIsEditingGoal(false)} className="text-secondary hover:text-white"><X size={18}/></button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Target Weight (kg)</label>
                    <input type="number" value={editTargetWeight} onChange={e => setEditTargetWeight(e.target.value)} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-bold" placeholder="e.g. 75" />
                </div>
                <div>
                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Target Date</label>
                    <input type="date" value={editTargetDate} onChange={e => setEditTargetDate(e.target.value)} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium" />
                </div>
                <div className="flex gap-3 pt-2">
                    {weightGoal.isActive && (
                        <button onClick={handleClearGoal} className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 font-bold text-sm bg-red-500/10">Remove</button>
                    )}
                    <button onClick={handleSaveGoal} className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm shadow-lg">Save Goal</button>
                </div>
            </div>
        </GlassCard>
      )}

      {/* 2. MEASUREMENTS PROGRESS */}
      <div className="space-y-3">
         <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Ruler size={18}/> Measurements</h3>
         </div>
         
         <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-white/5">
             {Object.keys(groupedMeasurements).length === 0 && (
                 <div className="p-6 text-center text-sm text-secondary">No measurements logged yet.</div>
             )}
             {Object.entries(groupedMeasurements).map(([type, entries]) => {
                const current = entries[entries.length - 1].value;
                const start = entries[0].value;
                const change = current - start;
                const data = entries.map(e => ({ val: e.value }));

                return (
                    <div key={type} className="p-4 flex items-center justify-between hover:bg-surfaceHighlight/50 transition">
                       <div className="flex-1">
                           <p className="text-xs text-secondary uppercase font-bold tracking-wider mb-0.5">{type}</p>
                           <div className="flex items-baseline gap-2">
                               <span className="text-lg font-bold text-white">{current} <span className="text-xs font-normal text-secondary">cm</span></span>
                               {entries.length > 1 && (
                                   <span className={`text-xs font-bold ${change > 0 ? 'text-accentGreen' : change < 0 ? 'text-accentBlue' : 'text-secondary'}`}>
                                       {change > 0 ? '+' : ''}{change.toFixed(1)}
                                   </span>
                               )}
                           </div>
                       </div>
                       
                       {/* Sparkline */}
                       <div className="h-8 w-24 mx-4">
                           {entries.length >= 2 ? (
                               <ResponsiveContainer width="100%" height="100%">
                                   <LineChart data={data}>
                                       <Line type="monotone" dataKey="val" stroke="#8E8E93" strokeWidth={2} dot={false} />
                                   </LineChart>
                               </ResponsiveContainer>
                           ) : (
                               <div className="h-full border-b border-white/10 w-full" />
                           )}
                       </div>
                    </div>
                );
             })}
         </div>
      </div>

      {/* 3. STRENGTH OVERVIEW */}
      <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-lg font-bold text-white flex items-center gap-2"><Dumbbell size={18}/> Strength Overview</h3>
          </div>

          {strengthStats.length === 0 ? (
              <GlassCard className="text-center py-6">
                  <p className="text-sm text-secondary">Log workouts with compound lifts (Squat, Bench, Deadlift) to see stats here.</p>
              </GlassCard>
          ) : (
              <div className="grid grid-cols-2 gap-3">
                  {strengthStats.map(stat => (
                      <GlassCard key={stat.exerciseName} className="!p-4 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-50">
                              {stat.prCount > 0 && <Trophy size={16} className="text-yellow-500" />}
                          </div>
                          <p className="text-[10px] text-secondary uppercase font-bold tracking-wider truncate mb-1">{stat.exerciseName}</p>
                          <p className="text-xl font-bold text-white">{Math.round(stat.best1RM)} <span className="text-xs font-normal text-secondary">kg (1RM)</span></p>
                          <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-[10px] text-secondary">Best: {stat.maxWeight}kg</span>
                              {stat.prCount > 0 && (
                                  <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded font-bold">{stat.prCount} PRs</span>
                              )}
                          </div>
                      </GlassCard>
                  ))}
              </div>
          )}
      </div>

      {/* 4. PROGRESS PHOTOS (Existing) */}
      <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-lg font-bold text-white flex items-center gap-2"><Camera size={18}/> Progress Photos</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
              {['Front', 'Side', 'Back'].map(view => (
                  <div key={view} className="aspect-[3/4] rounded-2xl bg-surfaceHighlight border border-border flex flex-col items-center justify-center text-secondary hover:bg-white hover:text-black transition cursor-pointer group">
                     <Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                     <span className="text-[10px] font-bold uppercase">{view}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* LOG MODAL */}
      {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/90 animate-in fade-in duration-200">
              <div className="bg-[#1C1C1E] w-full max-w-sm rounded-3xl border border-border p-6 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">Log Entry</h3>
                      <button onClick={() => setShowLogModal(false)} className="text-secondary hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                          {['Weight', 'Chest', 'Waist', 'Arms', 'Thighs'].map(t => (
                              <button 
                                key={t} 
                                onClick={() => setLogType(t)}
                                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${logType === t ? 'bg-white text-black border-white' : 'bg-surfaceHighlight text-secondary border-border'}`}
                              >
                                  {t}
                              </button>
                          ))}
                      </div>

                      <div>
                          <label className="text-xs text-secondary uppercase font-bold block mb-2">{logType} ({logType === 'Weight' ? 'kg' : 'cm'})</label>
                          <input 
                            type="number" 
                            value={logValue}
                            onChange={(e) => setLogValue(e.target.value)}
                            placeholder="0.0" 
                            className="w-full bg-surfaceHighlight border border-border rounded-xl p-4 text-white focus:outline-none focus:border-white font-bold text-2xl" 
                            autoFocus
                          />
                      </div>
                      
                      <button 
                        onClick={handleSave}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition"
                      >
                          Save Entry
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
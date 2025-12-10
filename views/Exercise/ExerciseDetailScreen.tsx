
import React, { useState, useMemo } from 'react';
import { Exercise, ExercisePerformanceEntry } from '../../types';
import { MuscleHeatmap } from '../../components/Body/MuscleHeatmap';
import { MuscleStatus } from '../../hooks/useRecoveryStatus';
import { ArrowLeft, Play, Trophy, BarChart2, BookOpen, Clock, Dumbbell, AlertCircle, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GlassCard } from '../../components/GlassCard';

interface ExerciseDetailScreenProps {
  exercise: Exercise;
  history: ExercisePerformanceEntry[];
  onBack: () => void;
}

export const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({ exercise, history, onBack }) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'GUIDE' | 'HISTORY'>('STATS');

  // --- BIOMETRICS ---
  // Synthesize a muscle status map to highlight ONLY the target muscles
  const targetMap = useMemo(() => {
      const map: Record<string, MuscleStatus> = {};
      
      // Primary -> FATIGUED color (Red/Hot) to indicate focus
      map[exercise.targetMuscle] = { 
          name: exercise.targetMuscle, 
          status: 'FATIGUED', 
          fatigueLevel: 100, 
          recoveryPercentage: 0, 
          color: '#ef4444' 
      };

      // Secondaries -> RECOVERING color (Orange)
      if (exercise.secondaryMuscles) {
          exercise.secondaryMuscles.forEach(m => {
              map[m] = { 
                  name: m, 
                  status: 'RECOVERING', 
                  fatigueLevel: 50, 
                  recoveryPercentage: 50, 
                  color: '#f59e0b' 
              };
          });
      }
      return map;
  }, [exercise]);

  // --- ANALYTICS ---
  const stats = useMemo(() => {
      let max1RM = 0;
      let maxVol = 0;
      let totalReps = 0;
      const chartData: any[] = [];

      // Sort history chronologically
      const sortedHistory = [...history].filter(h => h.exerciseName === exercise.name).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      sortedHistory.forEach(entry => {
          let dailyMax1RM = 0;
          let dailyVol = 0;

          entry.sets.forEach(s => {
              const w = s.weight || 0;
              const r = s.reps || 0;
              if (w > 0 && r > 0) {
                  // Epley
                  const e1rm = w * (1 + r/30);
                  if (e1rm > dailyMax1RM) dailyMax1RM = e1rm;
                  dailyVol += w * r;
                  totalReps += r;
              }
          });

          if (dailyMax1RM > max1RM) max1RM = dailyMax1RM;
          if (dailyVol > maxVol) maxVol = dailyVol;

          if (dailyMax1RM > 0) {
              chartData.push({
                  date: new Date(entry.date).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
                  value: Math.round(dailyMax1RM)
              });
          }
      });

      return { max1RM, maxVol, totalReps, chartData, sessionCount: sortedHistory.length };
  }, [history, exercise]);

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right h-screen flex flex-col overflow-y-auto no-scrollbar bg-black">
      
      {/* --- HERO HEADER --- */}
      <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center p-4">
              <button onClick={onBack} className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition">
                  <ArrowLeft size={20} />
              </button>
          </div>

          <div className="grid grid-cols-2 h-64 w-full">
              {/* Left: Video Placeholder */}
              <div className="bg-[#1C1C1E] border-r border-[#2C2C2E] relative flex flex-col items-center justify-center overflow-hidden group">
                  {exercise.videoUrl ? (
                      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                          <Play size={32} className="text-white fill-white opacity-80" />
                          {/* Real app would embed video here */}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center opacity-30">
                          <Dumbbell size={40} className="mb-2 text-white" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">No Video</span>
                      </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                      <span className="text-xs font-bold text-white uppercase bg-white/20 px-2 py-1 rounded backdrop-blur-md">{exercise.mechanic || 'Compound'}</span>
                  </div>
              </div>

              {/* Right: Biometric Map */}
              <div className="bg-[#101214] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-80">
                      <MuscleHeatmap statusMap={targetMap} />
                  </div>
                  <div className="absolute bottom-2 right-2 flex flex-col items-end pointer-events-none">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{exercise.targetMuscle}</span>
                      {exercise.secondaryMuscles && (
                          <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider opacity-80">{exercise.secondaryMuscles[0]}</span>
                      )}
                  </div>
              </div>
          </div>
          
          <div className="p-4 border-b border-white/10 bg-[#1C1C1E]">
              <h1 className="text-2xl font-bold text-white mb-1">{exercise.name}</h1>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{exercise.equipment}</span>
                  <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{exercise.difficulty || 'Intermediate'}</span>
              </div>
          </div>
      </div>

      {/* --- TABS --- */}
      <div className="px-4">
          <div className="flex p-1 bg-[#2C2C2E] rounded-xl border border-white/5">
              {['STATS', 'GUIDE', 'HISTORY'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      {/* --- TAB CONTENT --- */}
      
      {activeTab === 'STATS' && (
          <div className="px-4 space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
              {/* Record Cards */}
              <div className="grid grid-cols-3 gap-3">
                  <GlassCard className="!p-3 flex flex-col items-center justify-center gap-1 border-yellow-500/20 bg-yellow-500/5">
                      <Trophy size={16} className="text-yellow-500 mb-1" />
                      <span className="text-lg font-bold text-white">{Math.round(stats.max1RM)}<span className="text-xs text-yellow-500 ml-0.5">kg</span></span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Best 1RM</span>
                  </GlassCard>
                  
                  <GlassCard className="!p-3 flex flex-col items-center justify-center gap-1">
                      <BarChart2 size={16} className="text-cyan-400 mb-1" />
                      <span className="text-lg font-bold text-white">{(stats.maxVol / 1000).toFixed(1)}<span className="text-xs text-cyan-400 ml-0.5">k</span></span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Max Vol</span>
                  </GlassCard>

                  <GlassCard className="!p-3 flex flex-col items-center justify-center gap-1">
                      <Activity size={16} className="text-emerald-400 mb-1" />
                      <span className="text-lg font-bold text-white">{stats.totalReps}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Lifetime Reps</span>
                  </GlassCard>
              </div>

              {/* Chart */}
              <GlassCard>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUpIcon /> Strength Progression (1RM)
                  </h3>
                  {stats.chartData.length > 1 ? (
                      <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={stats.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                  <XAxis dataKey="date" hide />
                                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                  <Tooltip 
                                      contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#333', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                      itemStyle={{ color: '#fff' }}
                                  />
                                  <Line type="monotone" dataKey="value" stroke="#FACC15" strokeWidth={3} dot={{r: 3, fill: '#fff'}} activeDot={{r: 6}} />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  ) : (
                      <div className="h-32 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                          <p className="text-xs">Not enough data for chart.</p>
                      </div>
                  )}
              </GlassCard>
          </div>
      )}

      {activeTab === 'GUIDE' && (
          <div className="px-4 space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300 pb-20">
              <GlassCard>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BookOpen size={16} /> Instructions</h3>
                  {exercise.instructions && exercise.instructions.length > 0 ? (
                      <ol className="space-y-4">
                          {exercise.instructions.map((step, i) => (
                              <li key={i} className="flex gap-3 text-sm text-slate-300">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                                  <span className="leading-relaxed">{step}</span>
                              </li>
                          ))}
                      </ol>
                  ) : (
                      <div className="flex flex-col items-center py-8 text-slate-500">
                          <AlertCircle size={32} className="mb-2 opacity-50" />
                          <p className="text-xs">No specific instructions available.</p>
                      </div>
                  )}
              </GlassCard>

              <GlassCard className="bg-gradient-to-br from-blue-900/20 to-transparent border-blue-500/20">
                  <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Pro Tip</h3>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                      "Focus on a slow eccentric phase (2-3 seconds) to maximize muscle fiber recruitment and time under tension."
                  </p>
              </GlassCard>
          </div>
      )}

      {activeTab === 'HISTORY' && (
          <div className="px-4 space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-300 pb-20">
              {stats.sessionCount === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                      <p>No history yet. Start lifting!</p>
                  </div>
              ) : (
                  history.filter(h => h.exerciseName === exercise.name)
                         .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                         .map((entry) => (
                      <GlassCard key={entry.id} className="!p-4">
                          <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                              <span className="text-sm font-bold text-white flex items-center gap-2">
                                  <Clock size={14} className="text-slate-400"/>
                                  {new Date(entry.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                              </span>
                              {entry.bestSetEstimated1RM && (
                                  <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-white">
                                      1RM: {Math.round(entry.bestSetEstimated1RM)}kg
                                  </span>
                              )}
                          </div>
                          <div className="space-y-1">
                              {entry.sets.map((s, i) => (
                                  <div key={i} className="flex justify-between text-xs text-slate-400">
                                      <span>Set {i + 1}</span>
                                      <span className="text-white font-mono">{s.weight}kg x {s.reps}</span>
                                  </div>
                              ))}
                          </div>
                      </GlassCard>
                  ))
              )}
          </div>
      )}

    </div>
  );
};

const TrendingUpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);


import React, { useMemo } from 'react';
import { CompletedWorkout, ExercisePerformanceEntry } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Confetti } from '../components/Confetti';
import { Trophy, Share2, Check, Activity, Dumbbell, Clock, TrendingUp, TrendingDown, Flame } from 'lucide-react';

interface WorkoutSummaryScreenProps {
  workout: CompletedWorkout;
  prs: ExercisePerformanceEntry[];
  history: CompletedWorkout[]; // For comparison
  onClose: () => void;
}

export const WorkoutSummaryScreen: React.FC<WorkoutSummaryScreenProps> = ({ workout, prs, history, onClose }) => {
  
  // --- METRICS CALCULATION ---
  const durationMin = Math.round((workout.session.activeDuration || 0) / 60);
  const totalVolume = workout.summary.estimatedVolume || 0;
  const totalSets = workout.summary.totalSets;
  
  // Calculate Muscles Worked (Unique)
  const musclesWorked = useMemo(() => {
      const muscles = new Set<string>();
      workout.session.exercises.forEach(ex => {
          if(ex.targetMuscle) muscles.add(ex.targetMuscle);
      });
      return Array.from(muscles);
  }, [workout]);

  // Comparison Logic (vs last 3 sessions)
  const volumeComparison = useMemo(() => {
      if (history.length < 1) return null;
      // Get last 3 workouts (excluding current if it's already in history, though it shouldn't be for this pure calc usually)
      const recent = history.slice(-3); 
      if (recent.length === 0) return null;

      const avgVol = recent.reduce((sum, w) => sum + (w.summary.estimatedVolume || 0), 0) / recent.length;
      const diff = totalVolume - avgVol;
      const percent = avgVol > 0 ? (diff / avgVol) * 100 : 0;
      
      return {
          diff,
          percent: Math.round(percent),
          isPositive: diff >= 0
      };
  }, [history, totalVolume]);

  // Intensity Score (0-10)
  // Heuristic: Volume per minute. 
  // E.g. 5000kg / 60m = 83 kg/min. 
  // Let's cap "High Intensity" at ~200kg/min for a 10/10 score? This is arbitrary but fun.
  const intensityScore = useMemo(() => {
      if (durationMin === 0) return 0;
      const kgPerMin = totalVolume / durationMin;
      const score = Math.min(10, Math.round(kgPerMin / 20)); // Arbitrary scaling
      return Math.max(1, score);
  }, [totalVolume, durationMin]);

  const handleShare = () => {
      const prText = prs.length > 0 ? `\n🏆 ${prs.length} New PRs!` : '';
      const text = `Just finished a workout on AURAGYM!\n\n💪 ${workout.summary.name}\n⏱️ ${durationMin} mins\n🏋️ ${totalVolume} kg Volume${prText}`;
      if (navigator.share) {
          navigator.share({
              title: 'My Workout',
              text: text
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(text);
          alert("Summary copied to clipboard!");
      }
  };

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-bottom duration-500 relative min-h-screen">
      <Confetti />
      
      {/* Header */}
      <div className="text-center space-y-2 pt-8">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4 border border-accent/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
             <Trophy size={32} className="text-yellow-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Workout Complete!</h1>
          <p className="text-secondary font-medium">{workout.summary.name}</p>
      </div>

      {/* Hero Stat: Volume */}
      <GlassCard className="text-center py-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <p className="text-xs text-secondary uppercase font-bold tracking-[0.2em] mb-2">Total Volume</p>
          <div className="flex items-baseline justify-center gap-1">
             <span className="text-5xl font-black text-white tracking-tighter">{totalVolume.toLocaleString()}</span>
             <span className="text-lg font-bold text-accent">kg</span>
          </div>
          
          {/* Comparison Badge */}
          {volumeComparison && (
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mt-4 ${volumeComparison.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                  {volumeComparison.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(volumeComparison.percent)}% vs average
              </div>
          )}
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
          <GlassCard className="!p-4 flex flex-col items-center justify-center gap-1">
              <Clock size={18} className="text-accentBlue mb-1" />
              <span className="text-xl font-bold text-white">{durationMin}</span>
              <span className="text-[10px] text-secondary uppercase font-bold">Mins</span>
          </GlassCard>
          
          <GlassCard className="!p-4 flex flex-col items-center justify-center gap-1">
              <Activity size={18} className="text-accentGreen mb-1" />
              <span className="text-xl font-bold text-white">{totalSets}</span>
              <span className="text-[10px] text-secondary uppercase font-bold">Sets</span>
          </GlassCard>

          <GlassCard className="!p-4 flex flex-col items-center justify-center gap-1 relative overflow-hidden">
               {/* Gauge Background */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center">
                  <Flame size={18} className="text-orange-500 mb-1" />
                  <span className="text-xl font-bold text-white">{intensityScore}<span className="text-xs text-secondary">/10</span></span>
                  <span className="text-[10px] text-secondary uppercase font-bold">Intensity</span>
              </div>
          </GlassCard>
      </div>

      {/* PR Celebration Section */}
      {prs.length > 0 && (
          <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                  <Trophy size={18} className="text-yellow-500" /> New Records
              </h3>
              {prs.map((pr, idx) => (
                  <GlassCard key={idx} className="!p-4 border-yellow-500/30 bg-yellow-500/5 relative overflow-hidden flex items-center justify-between">
                      <div className="absolute top-0 right-0 p-12 bg-yellow-500/10 blur-2xl -mr-6 -mt-6"></div>
                      <div>
                          <p className="text-sm font-bold text-white">{pr.exerciseName}</p>
                          <p className="text-xs text-yellow-400 font-bold uppercase mt-0.5">New 1RM Record</p>
                      </div>
                      <div className="text-right">
                          <span className="text-xl font-bold text-white">{Math.round(pr.bestSetEstimated1RM || 0)}</span>
                          <span className="text-xs text-yellow-500 ml-1">kg</span>
                      </div>
                  </GlassCard>
              ))}
          </div>
      )}

      {/* Muscles Worked */}
      {musclesWorked.length > 0 && (
          <div className="space-y-3">
               <h3 className="text-lg font-bold text-white flex items-center gap-2 px-1">
                  <Dumbbell size={18} /> Muscles Targeted
              </h3>
              <div className="flex flex-wrap gap-2">
                  {musclesWorked.map(m => (
                      <span key={m} className="px-3 py-1.5 rounded-lg bg-surfaceHighlight border border-white/10 text-xs font-bold text-secondary">
                          {m}
                      </span>
                  ))}
              </div>
          </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
             onClick={handleShare}
             className="py-4 rounded-xl bg-surfaceHighlight border border-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition"
          >
              <Share2 size={18} /> Share
          </button>
          <button 
             onClick={onClose}
             className="py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
              <Check size={18} /> Done
          </button>
      </div>

    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutSession, ExercisePerformanceEntry } from '../../types';
import { useActiveWorkout } from '../../hooks/useActiveWorkout';
import { ArrowLeft, Play, Pause, ChevronRight, X, Minus, Plus, History } from 'lucide-react';
import { calculatePlates } from '../../utils/plateMath';

interface FocusSessionScreenProps {
  initialSession: WorkoutSession;
  exerciseHistory: ExercisePerformanceEntry[];
  onFinish: (session: WorkoutSession) => void;
  onBack: () => void;
}

export const FocusSessionScreen: React.FC<FocusSessionScreenProps> = ({
  initialSession,
  exerciseHistory,
  onFinish,
  onBack
}) => {
  const {
    session,
    elapsedSeconds,
    isPaused,
    restSeconds,
    restDuration,
    isResting,
    togglePause,
    toggleSetComplete,
    updateSetField,
    addRestTime,
    skipRest,
    finishSession
  } = useActiveWorkout({ initialSession, exerciseHistory, onComplete: onFinish });

  // Navigation State
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [activeSetIdx, setActiveSetIdx] = useState(0);
  
  // Visual State
  const [rpe, setRpe] = useState(8);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- DERIVED DATA ---
  const currentExercise = session.exercises[activeExerciseIdx];
  const currentSet = currentExercise?.sets[activeSetIdx];
  const totalSetsInExercise = currentExercise?.sets.length || 0;
  const isLastSetOfExercise = activeSetIdx === totalSetsInExercise - 1;
  const isLastExercise = activeExerciseIdx === session.exercises.length - 1;

  // Superset Logic: Peek next exercise
  const nextExercise = isLastSetOfExercise && !isLastExercise 
      ? session.exercises[activeExerciseIdx + 1] 
      : null;

  // --- GHOST METRICS (Previous Session Data) ---
  const ghostMetrics = useMemo(() => {
      if (!currentExercise) return null;
      const history = exerciseHistory
          .filter(h => h.exerciseName === currentExercise.name)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (history.length === 0) return null;
      const lastSession = history[0];
      // Try to match set index, otherwise fallback to last performed set
      const matchingSet = lastSession.sets[activeSetIdx] || lastSession.sets[lastSession.sets.length - 1];
      
      return matchingSet ? { weight: matchingSet.weight, reps: matchingSet.reps } : null;
  }, [currentExercise, activeSetIdx, exerciseHistory]);

  // --- HANDLERS ---

  const handleNext = () => {
      // 1. Mark Current Complete
      if (!currentSet.completed) {
          toggleSetComplete(activeExerciseIdx, activeSetIdx);
      }

      setIsTransitioning(true);

      setTimeout(() => {
          if (isLastSetOfExercise) {
              if (isLastExercise) {
                  finishSession();
              } else {
                  // Next Exercise
                  setActiveExerciseIdx(prev => prev + 1);
                  setActiveSetIdx(0);
              }
          } else {
              // Next Set (Trigger Rest)
              setActiveSetIdx(prev => prev + 1);
          }
          setIsTransitioning(false);
      }, 300);
  };

  const handleWeightChange = (delta: number) => {
      const current = parseFloat(currentSet.weight) || 0;
      const newVal = Math.max(0, current + delta);
      updateSetField(activeExerciseIdx, activeSetIdx, 'weight', newVal.toString());
  };

  const handleRepsChange = (delta: number) => {
      const current = parseFloat(currentSet.reps) || 0;
      const newVal = Math.max(0, current + delta);
      updateSetField(activeExerciseIdx, activeSetIdx, 'reps', newVal.toString());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentExercise) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col safe-area-top safe-area-bottom animate-in fade-in duration-500">
      
      {/* --- TOP HUD --- */}
      <div className="flex justify-between items-center px-4 py-2 pt-4">
          <button 
            onClick={onBack} 
            className="p-2 rounded-full hover:bg-white/10 text-secondary hover:text-white transition"
          >
              <ArrowLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
              <span className={`font-mono text-xl font-bold tracking-wider tabular-nums ${isPaused ? 'text-yellow-500' : 'text-white'}`}>
                  {formatTime(elapsedSeconds)}
              </span>
              <span className="text-[9px] text-secondary uppercase tracking-widest font-bold">Duration</span>
          </div>

          <button 
            onClick={togglePause} 
            className={`p-2 rounded-full transition ${isPaused ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
          >
              {isPaused ? <Play size={20} fill="black" /> : <Pause size={20} fill="white" />}
          </button>
      </div>

      {/* --- PROGRESS BAR --- */}
      <div className="px-4 mt-2 mb-4 flex gap-1 h-1">
          {session.exercises.map((ex, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 rounded-full transition-all duration-500 ${
                    i < activeExerciseIdx ? 'bg-accent' : 
                    i === activeExerciseIdx ? 'bg-white shadow-[0_0_10px_white]' : 
                    'bg-white/10'
                }`} 
              />
          ))}
      </div>

      {/* --- EXERCISE HEADER --- */}
      <div className="px-6 mb-4 text-center">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
              {currentExercise.name}
          </h2>
          <div className="inline-flex items-center gap-2 bg-surfaceHighlight px-3 py-1 rounded-full border border-white/5">
              <span className="text-accent font-bold text-xs tracking-wider">SET {activeSetIdx + 1}</span>
              <span className="text-secondary text-[10px] font-bold">OF {totalSetsInExercise}</span>
          </div>
      </div>

      {/* --- MAIN FOCUS CARD --- */}
      <div className={`flex-1 px-4 flex flex-col justify-start transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="bg-[#1C1C1E] border border-white/10 rounded-[32px] p-6 relative shadow-2xl overflow-hidden">
              
              {/* Ghost Metric Header */}
              {ghostMetrics && (
                  <div className="flex justify-center items-center gap-2 mb-6 opacity-50">
                      <History size={12} className="text-secondary" />
                      <span className="text-xs text-secondary font-mono">
                          Last: {ghostMetrics.weight}kg × {ghostMetrics.reps}
                      </span>
                  </div>
              )}

              {/* Weight Control Row */}
              <div className="mb-8">
                  <div className="flex justify-between items-end mb-2 px-2">
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">Weight (KG)</span>
                  </div>
                  <div className="flex items-center gap-4 bg-black/30 rounded-2xl p-2 border border-white/5">
                      <button 
                        onClick={() => handleWeightChange(-2.5)}
                        className="h-14 w-14 rounded-xl bg-[#2C2C2E] text-white flex items-center justify-center hover:bg-[#3A3A3C] active:scale-95 transition"
                      >
                          <Minus size={24} />
                      </button>
                      
                      <div className="flex-1 text-center">
                          <input 
                            type="number"
                            value={currentSet.weight}
                            onChange={(e) => updateSetField(activeExerciseIdx, activeSetIdx, 'weight', e.target.value)}
                            className="bg-transparent text-center text-5xl font-bold text-white outline-none w-full"
                          />
                      </div>

                      <button 
                        onClick={() => handleWeightChange(2.5)}
                        className="h-14 w-14 rounded-xl bg-[#2C2C2E] text-white flex items-center justify-center hover:bg-[#3A3A3C] active:scale-95 transition"
                      >
                          <Plus size={24} />
                      </button>
                  </div>
              </div>

              {/* Reps Control Row */}
              <div className="mb-8">
                  <div className="flex justify-between items-end mb-2 px-2">
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">Reps</span>
                  </div>
                  <div className="flex items-center gap-4 bg-black/30 rounded-2xl p-2 border border-white/5">
                      <button 
                        onClick={() => handleRepsChange(-1)}
                        className="h-14 w-14 rounded-xl bg-[#2C2C2E] text-white flex items-center justify-center hover:bg-[#3A3A3C] active:scale-95 transition"
                      >
                          <Minus size={24} />
                      </button>
                      
                      <div className="flex-1 text-center">
                          <input 
                            type="number"
                            value={currentSet.reps}
                            onChange={(e) => updateSetField(activeExerciseIdx, activeSetIdx, 'reps', e.target.value)}
                            className="bg-transparent text-center text-5xl font-bold text-white outline-none w-full"
                          />
                      </div>

                      <button 
                        onClick={() => handleRepsChange(1)}
                        className="h-14 w-14 rounded-xl bg-[#2C2C2E] text-white flex items-center justify-center hover:bg-[#3A3A3C] active:scale-95 transition"
                      >
                          <Plus size={24} />
                      </button>
                  </div>
              </div>

              {/* RPE Slider */}
              <div className="px-2">
                  <div className="flex justify-between text-[10px] text-secondary font-bold uppercase mb-3">
                      <span>Easy</span>
                      <span>Intensity (RPE)</span>
                      <span>Max</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" step="0.5" 
                    value={rpe} onChange={(e) => setRpe(parseFloat(e.target.value))}
                    className="w-full accent-white h-2 bg-surfaceHighlight rounded-full appearance-none cursor-pointer"
                  />
                  <div className="text-center mt-2 font-bold text-white text-lg">{rpe}</div>
              </div>

          </div>
      </div>

      {/* --- FOOTER ACTION --- */}
      <div className="p-4 pb-safe bg-gradient-to-t from-black via-black to-transparent mt-auto">
          {/* Next Up Badge */}
          {nextExercise && (
            <div className="flex justify-center mb-3 animate-pulse">
                <div className="bg-surfaceHighlight px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <span className="text-[10px] text-secondary font-bold uppercase">Next Up</span>
                    <span className="text-xs text-white font-bold">{nextExercise.name}</span>
                </div>
            </div>
          )}

          <button 
            onClick={handleNext}
            className="w-full h-16 rounded-2xl bg-white text-black font-black text-xl tracking-wide flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
              {isLastSetOfExercise && isLastExercise ? 'FINISH WORKOUT' : isLastSetOfExercise ? 'NEXT EXERCISE' : 'COMPLETE SET'}
              <ChevronRight size={24} strokeWidth={3} />
          </button>
      </div>

      {/* --- FULLSCREEN REST OVERLAY --- */}
      {isResting && (
          <div className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 safe-area-bottom">
              <div className="relative mb-12">
                  {/* Animated Ring */}
                  <svg className="w-64 h-64 -rotate-90">
                      <circle cx="128" cy="128" r="120" stroke="#1C1C1E" strokeWidth="8" fill="none" />
                      <circle 
                        cx="128" cy="128" r="120" 
                        stroke="#0A84FF" strokeWidth="8" fill="none" 
                        strokeDasharray={754} 
                        strokeDashoffset={754 - (754 * (restSeconds / restDuration))} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                      />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-black text-white tabular-nums">{formatTime(restSeconds)}</span>
                      <span className="text-accentBlue font-bold tracking-widest mt-2 uppercase">Resting</span>
                  </div>
              </div>

              <div className="flex gap-4 w-full max-w-xs px-4">
                  <button onClick={() => addRestTime(30)} className="flex-1 py-4 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/10 transition">+30s</button>
                  <button onClick={skipRest} className="flex-1 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition">Skip Rest</button>
              </div>

              {/* Next Up Preview */}
              <div className="absolute bottom-12 text-center opacity-60">
                  <p className="text-[10px] uppercase text-secondary font-bold mb-1 tracking-widest">Up Next</p>
                  <p className="text-white font-bold text-lg">Set {activeSetIdx + 1} of {totalSetsInExercise}</p>
              </div>
          </div>
      )}

      {/* --- PAUSE OVERLAY --- */}
      {isPaused && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center px-8 animate-in fade-in duration-200">
              <div className="w-full max-w-sm bg-[#1C1C1E] rounded-3xl border border-white/10 p-8 text-center shadow-2xl">
                    <Pause size={48} className="text-white mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-bold text-white mb-2">Workout Paused</h3>
                    <p className="text-secondary text-sm mb-8">Take a breather. Timer is stopped.</p>
                    <button 
                    onClick={togglePause}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                    >
                        <Play size={18} fill="black" /> Resume Workout
                    </button>
              </div>
          </div>
      )}
    </div>
  );
};
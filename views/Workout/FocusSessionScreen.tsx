
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WorkoutSession, ExercisePerformanceEntry } from '../../types';
import { useActiveWorkout } from '../../hooks/useActiveWorkout';
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle2, History, RotateCw, X, ChevronRight } from 'lucide-react';
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

  const handlePrev = () => {
      if (activeSetIdx > 0) {
          setActiveSetIdx(prev => prev - 1);
      } else if (activeExerciseIdx > 0) {
          setActiveExerciseIdx(prev => prev - 1);
          // Go to last set of previous exercise
          const prevEx = session.exercises[activeExerciseIdx - 1];
          setActiveSetIdx(prevEx.sets.length - 1);
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- SUB-COMPONENTS ---

  // 1. Visual Plate Loader (Inline)
  const BarbellVisualizer = ({ weight }: { weight: number }) => {
      const { plates } = calculatePlates(weight, 20); // Assume 20kg bar
      const getPlateColor = (p: number) => {
        if(p===25) return 'bg-[#FF3B30] h-16'; // Red
        if(p===20) return 'bg-[#007AFF] h-16'; // Blue
        if(p===15) return 'bg-[#FFCC00] h-14'; // Yellow
        if(p===10) return 'bg-[#34C759] h-12'; // Green
        if(p===5) return 'bg-white h-10';      // White
        return 'bg-slate-500 h-8';             // Small
      };

      return (
          <div className="h-20 flex items-center justify-center relative mt-4">
              {/* Bar */}
              <div className="absolute h-3 w-full bg-slate-600 rounded-full z-0"></div>
              {/* Collar */}
              <div className="absolute h-6 w-2 bg-slate-400 z-10 left-[10%]"></div>
              
              {/* Plates */}
              <div className="flex items-center gap-[2px] z-20 absolute left-[12%]">
                  {plates.map((p, i) => (
                      <div key={i} className={`w-3 border-r border-black/20 rounded-[2px] shadow-sm ${getPlateColor(p)}`}></div>
                  ))}
                  {plates.length === 0 && <span className="text-[10px] text-slate-500 ml-2 font-mono">EMPTY BAR</span>}
              </div>
              
              {/* Mirror for visual balance (optional, simplified to one side for clean HUD) */}
              <div className="flex items-center gap-[2px] z-20 absolute right-[12%] flex-row-reverse">
                  {plates.map((p, i) => (
                      <div key={i} className={`w-3 border-l border-black/20 rounded-[2px] shadow-sm ${getPlateColor(p)}`}></div>
                  ))}
              </div>
              <div className="absolute h-6 w-2 bg-slate-400 z-10 right-[10%]"></div>
          </div>
      );
  };

  if (!currentExercise) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center p-6 pb-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 text-white"><ArrowLeft size={24} /></button>
          <div className="flex flex-col items-center">
              <span className={`font-mono text-xl font-bold tracking-wider ${isPaused ? 'text-yellow-500' : 'text-white'}`}>
                  {formatTime(elapsedSeconds)}
              </span>
              <span className="text-[10px] text-secondary uppercase tracking-widest font-bold">Session Timer</span>
          </div>
          <button onClick={togglePause} className={`p-2 rounded-full ${isPaused ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
              {isPaused ? <Play size={20} fill="black" /> : <Pause size={20} fill="white" />}
          </button>
      </div>

      {/* --- PROGRESS BAR --- */}
      <div className="px-6 mb-4 flex gap-1">
          {session.exercises.map((ex, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < activeExerciseIdx ? 'bg-accent' : i === activeExerciseIdx ? 'bg-white' : 'bg-white/10'}`} />
          ))}
      </div>

      {/* --- MAIN STAGE (Focus Card) --- */}
      <div className={`flex-1 flex flex-col justify-center px-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          
          {/* Exercise Info */}
          <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{currentExercise.name}</h2>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
                  <span className="text-accent font-bold">SET {activeSetIdx + 1}</span>
                  <span className="text-secondary text-sm">OF {totalSetsInExercise}</span>
              </div>
          </div>

          {/* INPUTS CONTAINER */}
          <div className="flex gap-4 mb-6">
              
              {/* WEIGHT INPUT */}
              <div className="flex-1 bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 relative overflow-hidden group focus-within:border-accent transition-colors">
                  <span className="absolute top-4 left-0 right-0 text-center text-[10px] text-secondary uppercase font-bold tracking-widest">Weight (kg)</span>
                  
                  {/* Ghost Metric */}
                  {ghostMetrics?.weight && !currentSet.weight && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-6xl font-bold text-white/10">{ghostMetrics.weight}</span>
                      </div>
                  )}

                  <input 
                      type="number" 
                      value={currentSet.weight}
                      onChange={(e) => updateSetField(activeExerciseIdx, activeSetIdx, 'weight', e.target.value)}
                      className="w-full bg-transparent text-center text-6xl font-bold text-white outline-none relative z-10 py-4"
                      placeholder={ghostMetrics?.weight ? "" : "0"}
                  />
                  
                  {/* Visualizer Footer inside card */}
                  <BarbellVisualizer weight={parseFloat(currentSet.weight) || 0} />
              </div>

              {/* REPS INPUT */}
              <div className="flex-1 bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 relative overflow-hidden group focus-within:border-accent transition-colors flex flex-col justify-center">
                  <span className="absolute top-4 left-0 right-0 text-center text-[10px] text-secondary uppercase font-bold tracking-widest">Reps</span>
                  
                  {/* Ghost Metric */}
                  {ghostMetrics?.reps && !currentSet.reps && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-6xl font-bold text-white/10">{ghostMetrics.reps}</span>
                      </div>
                  )}

                  <input 
                      type="number" 
                      value={currentSet.reps}
                      onChange={(e) => updateSetField(activeExerciseIdx, activeSetIdx, 'reps', e.target.value)}
                      className="w-full bg-transparent text-center text-6xl font-bold text-white outline-none relative z-10"
                      placeholder={ghostMetrics?.reps ? "" : "0"}
                  />
              </div>
          </div>

          {/* RPE SLIDER (Visual Only for now, simulates intensity logging) */}
          <div className="mb-8 px-4">
              <div className="flex justify-between text-xs text-secondary font-bold uppercase mb-2">
                  <span>Easy</span>
                  <span>Intensity (RPE)</span>
                  <span>Max</span>
              </div>
              <input 
                type="range" min="1" max="10" step="0.5" 
                value={rpe} onChange={(e) => setRpe(parseFloat(e.target.value))}
                className="w-full accent-accent h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
              <div className="text-center mt-2 font-bold text-accent">{rpe}</div>
          </div>

      </div>

      {/* --- FOOTER CONTROLS --- */}
      <div className="p-6 pb-12 bg-gradient-to-t from-black via-black to-transparent">
          <div className="flex gap-4">
              <button 
                onClick={handlePrev}
                disabled={activeExerciseIdx === 0 && activeSetIdx === 0}
                className="h-16 w-16 rounded-2xl bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-secondary disabled:opacity-30"
              >
                  <RotateCw size={20} className="-scale-x-100" />
              </button>

              <button 
                onClick={handleNext}
                className="flex-1 h-16 rounded-2xl bg-white text-black font-black text-xl tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                  {isLastSetOfExercise && isLastExercise ? 'FINISH WORKOUT' : isLastSetOfExercise ? 'NEXT EXERCISE' : 'COMPLETE SET'}
                  <ChevronRight size={24} strokeWidth={3} />
              </button>
          </div>
      </div>

      {/* --- FULLSCREEN REST OVERLAY --- */}
      {isResting && (
          <div className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
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

              <div className="flex gap-6">
                  <button onClick={() => addRestTime(30)} className="px-8 py-3 rounded-full border border-white/20 text-white font-bold hover:bg-white/10">+30s</button>
                  <button onClick={skipRest} className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200">Skip Rest</button>
              </div>

              {/* Next Up Preview */}
              <div className="absolute bottom-12 text-center opacity-50">
                  <p className="text-xs uppercase text-secondary font-bold mb-1">Up Next</p>
                  <p className="text-white font-medium">Set {activeSetIdx + 1} of {totalSetsInExercise}</p>
              </div>
          </div>
      )}

    </div>
  );
};


import React, { useRef, useEffect } from 'react';
import { WorkoutSession, ExercisePerformanceEntry } from '../types';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { RestTimer } from '../components/RestTimer';
import { Minus, Plus, CheckCircle2, MoreHorizontal, Clock, Play, Pause, Trash2, SkipForward } from 'lucide-react';

interface ActiveWorkoutScreenProps {
  initialSession: WorkoutSession;
  exerciseHistory: ExercisePerformanceEntry[];
  onFinish: (session: WorkoutSession) => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({ 
  initialSession, 
  exerciseHistory, 
  onFinish 
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
    addSet,
    deleteSet,
    skipExercise,
    skipRest,
    addRestTime,
    finishSession
  } = useActiveWorkout({ 
    initialSession, 
    exerciseHistory, 
    onComplete: onFinish 
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col animate-in slide-in-from-bottom">
        {/* Session Header - High Z-index to stay above overlay */}
        <div className="bg-[#1C1C1E] px-4 pt-12 pb-4 sticky top-0 z-30 flex justify-between items-center border-b border-[#2C2C2E] shadow-xl">
            <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white">Active Session</h2>
                <div className="flex items-center gap-2">
                    <span className={`font-mono text-xl font-bold tracking-widest ${isPaused ? 'text-yellow-500' : 'text-white'}`}>
                        {formatTime(elapsedSeconds)}
                    </span>
                    {isPaused && <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">PAUSED</span>}
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={togglePause}
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isPaused ? 'bg-white text-black' : 'bg-[#2C2C2E] text-white hover:bg-[#3A3A3C]'}`}
                >
                    {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                </button>

                <button 
                    onClick={finishSession}
                    className="bg-accent text-black px-5 py-2 rounded-full font-bold hover:bg-white active:scale-95 transition-transform"
                >
                    Finish
                </button>
            </div>
        </div>

        {/* Content Wrapper - Relative to contain overlay properly */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
            
            {/* Pause Overlay - Absolute covering the content wrapper */}
            {isPaused && (
                <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center px-8 animate-in fade-in duration-200">
                    <div className="bg-[#1C1C1E] border border-yellow-500/30 p-8 rounded-3xl text-center shadow-2xl max-w-sm w-full">
                         <Pause size={48} className="text-yellow-500 mx-auto mb-4" />
                         <h3 className="text-2xl font-bold text-white mb-2">Workout Paused</h3>
                         <p className="text-secondary text-sm mb-6">Take a breather. Timer is stopped.</p>
                         <button 
                            onClick={togglePause}
                            className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                         >
                             <Play size={18} fill="black" /> Resume Workout
                         </button>
                    </div>
                </div>
            )}

            {/* Scrollable Exercises List */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
                {(session.exercises || []).map((exercise, exIdx) => (
                    <div key={exercise.id + exIdx} className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 space-y-4 shadow-lg">
                        <div className="flex justify-between items-start border-b border-[#2C2C2E] pb-3">
                            <div>
                                <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-xs text-[#8E8E93] bg-[#2C2C2E] px-2 py-0.5 rounded">
                                        <Clock size={12} />
                                        <span>{exercise.restTimeSeconds || 60}s</span>
                                    </div>
                                    <span className="text-xs text-[#8E8E93]">{exercise.targetMuscle}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-[30px_1fr_1fr_40px_30px] gap-2 px-1 text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider text-center">
                            <span>#</span>
                            <span>kg</span>
                            <span>Reps</span>
                            <span>Done</span>
                            <span></span>
                        </div>

                        <div className="space-y-2">
                            {(exercise.sets || []).map((set, setIdx) => (
                                <div 
                                    key={set.id} 
                                    className={`grid grid-cols-[30px_1fr_1fr_40px_30px] gap-2 items-center transition-all ${set.completed ? 'opacity-50' : 'opacity-100'}`}
                                >
                                    <span className="text-[#8E8E93] font-bold text-center bg-[#2C2C2E] rounded-md py-2.5 text-xs">{setIdx + 1}</span>
                                    <input 
                                        type="text" 
                                        value={set.weight}
                                        onChange={(e) => updateSetField(exIdx, setIdx, 'weight', e.target.value)}
                                        className="bg-[#000] border border-[#2C2C2E] rounded-xl text-center py-2.5 text-white font-bold outline-none focus:border-accent focus:bg-[#2C2C2E] transition-colors text-sm"
                                        inputMode="decimal"
                                        placeholder="0"
                                        disabled={isPaused}
                                    />
                                    <input 
                                        type="text" 
                                        value={set.reps}
                                        onChange={(e) => updateSetField(exIdx, setIdx, 'reps', e.target.value)}
                                        className="bg-[#000] border border-[#2C2C2E] rounded-xl text-center py-2.5 text-white font-bold outline-none focus:border-accent focus:bg-[#2C2C2E] transition-colors text-sm"
                                        inputMode="numeric"
                                        placeholder="0"
                                        disabled={isPaused}
                                    />
                                    <button 
                                        onClick={() => toggleSetComplete(exIdx, setIdx)}
                                        disabled={isPaused}
                                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${set.completed ? 'bg-[#30D158] text-white shadow-[0_0_15px_rgba(48,209,88,0.4)]' : 'bg-[#2C2C2E] text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
                                    >
                                        <CheckCircle2 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => deleteSet(set.id)}
                                        disabled={isPaused}
                                        className="h-10 w-8 flex items-center justify-center text-[#8E8E93] hover:text-red-400 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                             <button 
                                onClick={() => skipExercise(exercise.id)}
                                disabled={isPaused}
                                className="text-xs font-bold text-[#8E8E93] hover:text-white transition flex items-center gap-1 px-2 py-2"
                            >
                                <SkipForward size={14} /> Skip Exercise
                            </button>

                            <button 
                                onClick={() => addSet(exIdx)}
                                disabled={isPaused}
                                className="text-xs font-bold text-white bg-[#2C2C2E] border border-white/10 px-4 py-2.5 rounded-lg hover:bg-white/10 transition flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Set
                            </button>
                        </div>
                    </div>
                ))}

                {(!session.exercises || session.exercises.length === 0) && (
                    <div className="text-center py-20 text-[#8E8E93] bg-[#1C1C1E] rounded-2xl border border-dashed border-[#2C2C2E]">
                        <p>All exercises completed or skipped.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Rest Timer Overlay */}
        {isResting && (
            <RestTimer 
                secondsRemaining={restSeconds} 
                totalDuration={restDuration} 
                onSkip={skipRest} 
                onAdd={addRestTime} 
            />
        )}
    </div>
  );
};

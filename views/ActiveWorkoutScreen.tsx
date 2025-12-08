
import React, { useRef, useEffect } from 'react';
import { WorkoutSession, ExercisePerformanceEntry } from '../types';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { RestTimer } from '../components/RestTimer';
import { Minus, Plus, CheckCircle2, MoreHorizontal, Clock } from 'lucide-react';

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
    restSeconds,
    restDuration,
    isResting,
    toggleSetComplete,
    updateSetField,
    addSet,
    removeSet,
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
        {/* Session Header */}
        <div className="bg-[#1C1C1E] px-4 pt-12 pb-4 sticky top-0 z-10 flex justify-between items-center border-b border-[#2C2C2E]">
            <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white">Active Session</h2>
                <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-xl font-bold tracking-widest">{formatTime(elapsedSeconds)}</span>
                    <span className="text-xs text-[#8E8E93] bg-[#2C2C2E] px-1.5 py-0.5 rounded">Duration</span>
                </div>
            </div>
            <button 
                onClick={finishSession}
                className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 active:scale-95 transition-transform"
            >
                Finish
            </button>
        </div>

        {/* Exercises List */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
            {(session.exercises || []).map((exercise, exIdx) => (
                <div key={exercise.id + exIdx} className="space-y-4">
                    <div className="flex justify-between items-end border-b border-[#2C2C2E] pb-2">
                        <h3 className="text-xl font-bold text-white">{exercise.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-[#8E8E93]">
                             <Clock size={12} />
                             <span>{exercise.restTimeSeconds || 60}s rest</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-3 px-1 text-xs text-[#8E8E93] uppercase font-bold tracking-wider">
                        <span>Set</span>
                        <span className="text-center">kg</span>
                        <span className="text-center">Reps</span>
                        <span></span>
                    </div>

                    {(exercise.sets || []).map((set, setIdx) => (
                        <div 
                            key={set.id} 
                            className={`grid grid-cols-[30px_1fr_1fr_40px] gap-3 items-center transition-opacity ${set.completed ? 'opacity-50' : 'opacity-100'}`}
                        >
                            <span className="text-[#8E8E93] font-bold text-center bg-[#2C2C2E] rounded-md py-2">{setIdx + 1}</span>
                            <input 
                                type="text" 
                                value={set.weight}
                                onChange={(e) => updateSetField(exIdx, setIdx, 'weight', e.target.value)}
                                className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl text-center py-2.5 text-white font-bold outline-none focus:border-white focus:bg-[#2C2C2E] transition-colors"
                                inputMode="decimal"
                                placeholder="0"
                            />
                            <input 
                                type="text" 
                                value={set.reps}
                                onChange={(e) => updateSetField(exIdx, setIdx, 'reps', e.target.value)}
                                className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl text-center py-2.5 text-white font-bold outline-none focus:border-white focus:bg-[#2C2C2E] transition-colors"
                                inputMode="numeric"
                                placeholder="0"
                            />
                            <button 
                                onClick={() => toggleSetComplete(exIdx, setIdx)}
                                className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${set.completed ? 'bg-[#30D158] text-white shadow-[0_0_15px_rgba(48,209,88,0.4)]' : 'bg-[#2C2C2E] text-[#8E8E93] hover:bg-[#3A3A3C]'}`}
                            >
                                <CheckCircle2 size={20} />
                            </button>
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-2">
                        <button 
                            onClick={() => removeSet(exIdx)}
                            className="text-xs font-bold text-red-400 bg-red-400/10 px-4 py-3 rounded-lg hover:bg-red-400/20 transition disabled:opacity-50 flex items-center gap-1"
                            disabled={(exercise.sets || []).length <= 1}
                        >
                            <Minus size={14} /> Remove Set
                        </button>
                        <button 
                            onClick={() => addSet(exIdx)}
                            className="text-xs font-bold text-white bg-[#2C2C2E] border border-white/10 px-4 py-3 rounded-lg hover:bg-white/10 transition flex items-center gap-1"
                        >
                            <Plus size={14} /> Add Set
                        </button>
                    </div>
                </div>
            ))}
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

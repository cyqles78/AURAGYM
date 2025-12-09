
import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutSession, WorkoutSet, ExercisePerformanceEntry } from '../types';

interface UseActiveWorkoutProps {
  initialSession: WorkoutSession;
  exerciseHistory: ExercisePerformanceEntry[];
  onComplete: (session: WorkoutSession) => void;
}

export const useActiveWorkout = ({ initialSession, exerciseHistory, onComplete }: UseActiveWorkoutProps) => {
  const [session, setSession] = useState<WorkoutSession>(initialSession);
  
  // Timing State (Timestamp based for accuracy)
  const [startTime] = useState<number>(initialSession.startTime || Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0); // in milliseconds

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(60); 

  // Auto-scroll/Focus State
  const [activeSetFocus, setActiveSetFocus] = useState<{ exerciseIndex: number, setIndex: number } | null>(null);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: any;

    if (!isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        // Calculate active duration: Total elapsed wall time minus accumulated pause time
        const currentTotalElapsed = now - startTime;
        const netElapsed = currentTotalElapsed - totalPausedTime;
        setElapsedSeconds(Math.floor(netElapsed / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPaused, startTime, totalPausedTime]);

  // --- PAUSE / RESUME ---
  const togglePause = () => {
    if (isPaused) {
      // Resume
      if (pauseStartTime) {
        const pauseDuration = Date.now() - pauseStartTime;
        setTotalPausedTime(prev => prev + pauseDuration);
      }
      setPauseStartTime(null);
      setIsPaused(false);
    } else {
      // Pause
      setPauseStartTime(Date.now());
      setIsPaused(true);
    }
  };

  // --- REST TIMER ---
  useEffect(() => {
    let interval: any;
    // Only count down if NOT paused
    if (isResting && restSeconds > 0 && !isPaused) {
      interval = setInterval(() => setRestSeconds(t => t - 1), 1000);
    } else if (isResting && restSeconds === 0) {
      setIsResting(false);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds, isPaused]);

  // --- EXERCISE & SET MANAGEMENT ---

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    if (isPaused) return; // Prevent interaction when paused

    const updatedExercises = [...session.exercises];
    const currentExercise = updatedExercises[exerciseIndex];
    const targetSet = currentExercise.sets[setIndex];
    const wasCompleted = targetSet.completed;
    
    targetSet.completed = !wasCompleted;
    setSession({ ...session, exercises: updatedExercises });

    // Handle Logic when MARKING AS COMPLETE
    if (!wasCompleted) {
      const exerciseRestTime = currentExercise.restTimeSeconds || 60;
      
      // SUPERSET LOGIC
      if (currentExercise.supersetId) {
        // Find all exercises in this superset
        const supersetGroupIndices = updatedExercises
          .map((ex, idx) => ({ ...ex, idx }))
          .filter(ex => ex.supersetId === currentExercise.supersetId)
          .map(ex => ex.idx);
        
        const positionInGroup = supersetGroupIndices.indexOf(exerciseIndex);
        const isLastInSuperset = positionInGroup === supersetGroupIndices.length - 1;

        if (!isLastInSuperset) {
          // NOT the last exercise in superset -> Move to next exercise, SAME set index (if exists)
          const nextExerciseIndex = supersetGroupIndices[positionInGroup + 1];
          const nextExercise = updatedExercises[nextExerciseIndex];
          
          // Check if next exercise has this set
          if (nextExercise.sets[setIndex]) {
             // Transition immediately (Superset flow)
             setActiveSetFocus({ exerciseIndex: nextExerciseIndex, setIndex: setIndex });
             // Optional: Short transition timer? For now, instant.
             return; 
          }
        } else {
          // IS the last exercise -> Start Rest -> Loop back to first exercise, NEXT set
          startRest(exerciseRestTime);
          const firstExerciseIndex = supersetGroupIndices[0];
          const firstExercise = updatedExercises[firstExerciseIndex];
          
          if (firstExercise.sets[setIndex + 1]) {
             setActiveSetFocus({ exerciseIndex: firstExerciseIndex, setIndex: setIndex + 1 });
          }
          return;
        }
      } 
      
      // STANDARD STRAIGHT SET LOGIC
      // If next set exists in same exercise
      if (currentExercise.sets[setIndex + 1]) {
          startRest(exerciseRestTime);
          setActiveSetFocus({ exerciseIndex, setIndex: setIndex + 1 });
      } else {
          // Exercise complete
          startRest(exerciseRestTime);
      }
    }
  };

  const updateSetField = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    if (isPaused) return;

    const updatedExercises = session.exercises.map((ex, exIdx) => {
      if (exIdx !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, sIdx) => 
          sIdx === setIndex ? { ...s, [field]: value } : s
        )
      };
    });
    setSession({ ...session, exercises: updatedExercises });
  };

  const addSet = (exerciseIndex: number) => {
    if (isPaused) return;

    const updatedExercises = [...session.exercises];
    const exercise = updatedExercises[exerciseIndex];
    
    // Suggest values based on previous set or history
    const previousSetInSession = exercise.sets[exercise.sets.length - 1];
    let suggestedReps = '8';
    let suggestedWeight = '0';

    if (previousSetInSession) {
      suggestedReps = previousSetInSession.reps;
      suggestedWeight = previousSetInSession.weight;
    } else {
      const historyEntry = exerciseHistory
        .filter(h => h.exerciseName === exercise.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (historyEntry && historyEntry.sets.length > 0) {
        const lastSet = historyEntry.sets[historyEntry.sets.length - 1];
        suggestedReps = lastSet.reps.toString();
        suggestedWeight = (lastSet.weight || 0).toString();
      }
    }

    const newSet: WorkoutSet = {
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString()) + Math.random(),
      reps: suggestedReps,
      weight: suggestedWeight,
      completed: false
    };

    updatedExercises[exerciseIndex].sets.push(newSet);
    setSession({ ...session, exercises: updatedExercises });
  };

  const removeSet = (exerciseIndex: number) => {
    if (isPaused) return;
    const updatedExercises = [...session.exercises];
    if (updatedExercises[exerciseIndex].sets.length > 1) {
      updatedExercises[exerciseIndex].sets.pop();
      setSession({ ...session, exercises: updatedExercises });
    }
  };

  // Delete specific set by ID
  const deleteSet = (setId: string) => {
    if (isPaused) return;

    const updatedExercises = session.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.id !== setId)
    }));
    
    setSession({ ...session, exercises: updatedExercises });
  };

  // Skip entire exercise
  const skipExercise = (exerciseId: string) => {
    if (isPaused) return;
    
    // Filter out the exercise
    const updatedExercises = session.exercises.filter(ex => ex.id !== exerciseId);
    setSession({ ...session, exercises: updatedExercises });
  };

  // --- PREMIUM FEATURES (Warmup, Copy History, Notes) ---

  const addWarmupSets = (exerciseIndex: number) => {
    if (isPaused) return;

    const updatedExercises = [...session.exercises];
    const exercise = updatedExercises[exerciseIndex];
    
    // Determine working weight from first set, or default 20kg
    const workingSet = exercise.sets[0];
    const workingWeight = parseFloat(workingSet?.weight) || 20;

    // Helper to generate a new ID
    const genId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString()) + Math.random();

    const warmups: WorkoutSet[] = [
        { id: genId(), reps: '10', weight: (Math.round(workingWeight * 0.5 / 2.5) * 2.5).toString(), completed: false, isWarmup: true },
        { id: genId(), reps: '5', weight: (Math.round(workingWeight * 0.7 / 2.5) * 2.5).toString(), completed: false, isWarmup: true },
        { id: genId(), reps: '3', weight: (Math.round(workingWeight * 0.9 / 2.5) * 2.5).toString(), completed: false, isWarmup: true },
    ];

    updatedExercises[exerciseIndex].sets = [...warmups, ...exercise.sets];
    setSession({ ...session, exercises: updatedExercises });
  };

  const copySetsFromHistory = (exerciseIndex: number, historySets: {reps: number, weight?: number}[]) => {
     if (isPaused) return;

     const updatedExercises = [...session.exercises];
     
     // We map history sets to new workout sets
     const newSets: WorkoutSet[] = historySets.map(h => ({
         id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString()) + Math.random(),
         reps: h.reps.toString(),
         weight: (h.weight || 0).toString(),
         completed: false,
         isWarmup: false
     }));

     updatedExercises[exerciseIndex].sets = newSets;
     setSession({ ...session, exercises: updatedExercises });
  };

  const updateExerciseNote = (exerciseIndex: number, note: string) => {
      const updatedExercises = [...session.exercises];
      updatedExercises[exerciseIndex].notes = note;
      setSession({ ...session, exercises: updatedExercises });
  };

  // --- REST CONTROLS ---

  const startRest = (duration: number) => {
    setRestDuration(duration);
    setRestSeconds(duration);
    setIsResting(true);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestSeconds(0);
  };

  const addRestTime = (seconds: number) => {
    setRestSeconds(prev => prev + seconds);
  };

  // --- FINISH ---

  const finishSession = () => {
    // If paused, ensure we calculate final duration correctly
    let finalTotalPaused = totalPausedTime;
    if (isPaused && pauseStartTime) {
      finalTotalPaused += (Date.now() - pauseStartTime);
    }

    const now = Date.now();
    const finalActiveDurationSeconds = Math.floor((now - startTime - finalTotalPaused) / 1000);

    onComplete({ 
      ...session, 
      endTime: now,
      activeDuration: finalActiveDurationSeconds
    });
  };

  return {
    session,
    elapsedSeconds,
    isPaused,
    
    restSeconds,
    isResting,
    restDuration,
    activeSetFocus, // Expose focus state
    
    togglePause,
    toggleSetComplete,
    updateSetField,
    addSet,
    removeSet,
    deleteSet,
    skipExercise,
    addWarmupSets,
    copySetsFromHistory,
    updateExerciseNote,
    
    skipRest,
    addRestTime,
    finishSession
  };
};

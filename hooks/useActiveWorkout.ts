
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
    const targetSet = updatedExercises[exerciseIndex].sets[setIndex];
    const wasCompleted = targetSet.completed;
    
    targetSet.completed = !wasCompleted;
    setSession({ ...session, exercises: updatedExercises });

    // Start rest if marking as complete
    if (!wasCompleted) {
      const exerciseRestTime = updatedExercises[exerciseIndex].restTimeSeconds || 60;
      startRest(exerciseRestTime);
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

  // New Function: Delete specific set by ID
  const deleteSet = (setId: string) => {
    if (isPaused) return;

    const updatedExercises = session.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.id !== setId)
    }));
    
    setSession({ ...session, exercises: updatedExercises });
  };

  // New Function: Skip entire exercise
  const skipExercise = (exerciseId: string) => {
    if (isPaused) return;
    
    // Filter out the exercise
    const updatedExercises = session.exercises.filter(ex => ex.id !== exerciseId);
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
    
    togglePause,
    toggleSetComplete,
    updateSetField,
    addSet,
    removeSet,
    deleteSet,
    skipExercise,
    
    skipRest,
    addRestTime,
    finishSession
  };
};

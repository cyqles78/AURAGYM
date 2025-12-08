
import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkoutSession, WorkoutSet, ExercisePerformanceEntry } from '../types';

interface UseActiveWorkoutProps {
  initialSession: WorkoutSession;
  exerciseHistory: ExercisePerformanceEntry[];
  onComplete: (session: WorkoutSession) => void;
}

export const useActiveWorkout = ({ initialSession, exerciseHistory, onComplete }: UseActiveWorkoutProps) => {
  const [session, setSession] = useState<WorkoutSession>(initialSession);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(true);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(60); // Default 60s

  // Session Timer
  useEffect(() => {
    let interval: any;
    if (isSessionRunning) {
      interval = setInterval(() => setElapsedSeconds(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionRunning]);

  // Rest Timer
  useEffect(() => {
    let interval: any;
    if (isResting && restSeconds > 0) {
      interval = setInterval(() => setRestSeconds(t => t - 1), 1000);
    } else if (isResting && restSeconds === 0) {
      // Timer finished
      setIsResting(false);
      // Simple vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      // Optional: Play sound logic here
    }
    return () => clearInterval(interval);
  }, [isResting, restSeconds]);

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...session.exercises];
    const targetSet = updatedExercises[exerciseIndex].sets[setIndex];
    const wasCompleted = targetSet.completed;
    
    // Toggle state
    targetSet.completed = !wasCompleted;
    setSession({ ...session, exercises: updatedExercises });

    // Logic: If we just marked it as complete, start rest timer
    if (!wasCompleted) {
      const exerciseRestTime = updatedExercises[exerciseIndex].restTimeSeconds || 60;
      startRest(exerciseRestTime);
    }
  };

  const updateSetField = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
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
    const updatedExercises = [...session.exercises];
    const exercise = updatedExercises[exerciseIndex];
    
    // AI SUGGESTION LOGIC
    // 1. Check current session's previous set
    const previousSetInSession = exercise.sets[exercise.sets.length - 1];
    
    let suggestedReps = '8';
    let suggestedWeight = '0';

    if (previousSetInSession) {
      suggestedReps = previousSetInSession.reps;
      suggestedWeight = previousSetInSession.weight;
    } else {
      // 2. Check History if this is the first set
      const historyEntry = exerciseHistory
        .filter(h => h.exerciseName === exercise.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (historyEntry && historyEntry.sets.length > 0) {
        // Use the last set of the last workout
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
    const updatedExercises = [...session.exercises];
    if (updatedExercises[exerciseIndex].sets.length > 1) {
      updatedExercises[exerciseIndex].sets.pop();
      setSession({ ...session, exercises: updatedExercises });
    }
  };

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

  const finishSession = () => {
    setIsSessionRunning(false);
    onComplete({ ...session, endTime: Date.now() });
  };

  return {
    session,
    elapsedSeconds,
    restSeconds,
    isResting,
    restDuration,
    toggleSetComplete,
    updateSetField,
    addSet,
    removeSet,
    skipRest,
    addRestTime,
    finishSession
  };
};

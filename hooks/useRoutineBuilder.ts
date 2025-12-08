
import { useState, useCallback } from 'react';
import { Exercise, WorkoutPlan, WorkoutSet } from '../types';

interface UseRoutineBuilderProps {
  initialExercises: Exercise[]; // From the available library
  onSave: (routine: WorkoutPlan) => void;
}

export const useRoutineBuilder = ({ initialExercises, onSave }: UseRoutineBuilderProps) => {
  const [routineTitle, setRoutineTitle] = useState('New Routine');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [availableExercises] = useState<Exercise[]>(initialExercises);

  const addExercise = useCallback((exerciseId: string) => {
    const sourceExercise = initialExercises.find(ex => ex.id === exerciseId);
    if (!sourceExercise) return;

    const newExercise: Exercise = {
      ...sourceExercise,
      id: `${sourceExercise.id}_${Date.now()}_${Math.random()}`, // Unique ID for this instance
      sets: Array(3).fill({
        id: '',
        reps: '10',
        weight: '0',
        completed: false
      }).map((s, i) => ({ ...s, id: `set_${Date.now()}_${i}` }))
    };

    setSelectedExercises(prev => [...prev, newExercise]);
  }, [initialExercises]);

  const removeExercise = useCallback((instanceId: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== instanceId));
  }, []);

  const reorderExercises = useCallback((sourceIndex: number, destinationIndex: number) => {
    setSelectedExercises(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      return result;
    });
  }, []);

  const updateExerciseConfig = useCallback((instanceId: string, field: 'sets' | 'restTimeSeconds', value: any) => {
    setSelectedExercises(prev => prev.map(ex => {
      if (ex.id !== instanceId) return ex;

      if (field === 'sets') {
        const count = value as number;
        // Adjust sets array size
        let newSets = [...ex.sets];
        if (count > newSets.length) {
            const added = Array(count - newSets.length).fill(null).map((_, i) => ({
                id: `set_${Date.now()}_${i}`,
                reps: newSets[0]?.reps || '10',
                weight: newSets[0]?.weight || '0',
                completed: false
            }));
            newSets = [...newSets, ...added];
        } else if (count < newSets.length) {
            newSets = newSets.slice(0, count);
        }
        return { ...ex, sets: newSets };
      }

      if (field === 'restTimeSeconds') {
          return { ...ex, restTimeSeconds: value as number };
      }

      return ex;
    }));
  }, []);

  const updateSetDetails = useCallback((instanceId: string, reps: string) => {
      setSelectedExercises(prev => prev.map(ex => {
          if (ex.id !== instanceId) return ex;
          return {
              ...ex,
              sets: ex.sets.map(s => ({ ...s, reps }))
          };
      }));
  }, []);

  const saveRoutine = useCallback(() => {
    if (selectedExercises.length === 0) return;

    const routine: WorkoutPlan = {
      id: Date.now().toString(),
      title: routineTitle || 'Custom Routine',
      description: 'Custom built routine',
      duration: `${selectedExercises.length * 5 + 10} min`, // Rough estimate
      difficulty: 'Intermediate',
      tags: ['Custom'],
      exercises: selectedExercises
    };

    onSave(routine);
  }, [routineTitle, selectedExercises, onSave]);

  return {
    routineTitle,
    setRoutineTitle,
    selectedExercises,
    availableExercises,
    addExercise,
    removeExercise,
    reorderExercises,
    updateExerciseConfig,
    updateSetDetails,
    saveRoutine
  };
};

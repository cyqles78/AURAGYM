

import { WeightEntry, CompletedWorkout, Exercise } from '../types';

// Default Library Exercises
export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'def_1', name: 'Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', restTimeSeconds: 120, sets: [] },
  { id: 'def_2', name: 'Squat', targetMuscle: 'Legs', equipment: 'Barbell', restTimeSeconds: 180, sets: [] },
  { id: 'def_3', name: 'Deadlift', targetMuscle: 'Back', equipment: 'Barbell', restTimeSeconds: 180, sets: [] },
  { id: 'def_4', name: 'Overhead Press', targetMuscle: 'Shoulders', equipment: 'Barbell', restTimeSeconds: 120, sets: [] },
  { id: 'def_5', name: 'Dumbbell Row', targetMuscle: 'Back', equipment: 'Dumbbells', restTimeSeconds: 90, sets: [] },
  { id: 'def_6', name: 'Pull Up', targetMuscle: 'Back', equipment: 'Bodyweight', restTimeSeconds: 90, sets: [] },
  { id: 'def_7', name: 'Push Up', targetMuscle: 'Chest', equipment: 'Bodyweight', restTimeSeconds: 60, sets: [] },
  { id: 'def_8', name: 'Dumbbell Curl', targetMuscle: 'Biceps', equipment: 'Dumbbells', restTimeSeconds: 60, sets: [] },
  { id: 'def_9', name: 'Tricep Extension', targetMuscle: 'Triceps', equipment: 'Cable', restTimeSeconds: 60, sets: [] },
  { id: 'def_10', name: 'Leg Press', targetMuscle: 'Legs', equipment: 'Machine', restTimeSeconds: 120, sets: [] },
  { id: 'def_11', name: 'Lat Pulldown', targetMuscle: 'Back', equipment: 'Cable', restTimeSeconds: 90, sets: [] },
  { id: 'def_12', name: 'Lateral Raise', targetMuscle: 'Shoulders', equipment: 'Dumbbells', restTimeSeconds: 60, sets: [] },
];

// Mock Data
const MOCK_WEIGHT_HISTORY: WeightEntry[] = [
  { date: '2023-01-01', weight: 85.0 },
  { date: '2023-02-01', weight: 84.2 },
  { date: '2023-03-01', weight: 83.5 },
  { date: '2023-04-01', weight: 82.8 },
  { date: '2023-05-01', weight: 83.1 },
  { date: '2023-06-01', weight: 82.5 },
  { date: '2023-07-01', weight: 81.8 },
  { date: '2023-08-01', weight: 80.5 },
];

const MOCK_WORKOUT_LOGS: CompletedWorkout[] = [
  {
    id: 'w1',
    completedAt: '2023-06-01T10:00:00Z',
    session: {
      id: 's1',
      startTime: 0,
      status: 'completed',
      exercises: [
        {
          id: 'ex1', name: 'Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', restTimeSeconds: 90,
          sets: [
            { id: 'st1', reps: '10', weight: '60', completed: true },
            { id: 'st2', reps: '10', weight: '60', completed: true }
          ]
        },
        {
          id: 'ex2', name: 'Squat', targetMuscle: 'Legs', equipment: 'Barbell', restTimeSeconds: 120,
          sets: [
            { id: 'st3', reps: '8', weight: '80', completed: true }
          ]
        }
      ]
    },
    summary: { name: 'Upper Power', totalExercises: 2, totalSets: 3, sourceType: 'AD_HOC' }
  },
  {
    id: 'w2',
    completedAt: '2023-06-05T10:00:00Z',
    session: {
      id: 's2',
      startTime: 0,
      status: 'completed',
      exercises: [
        {
          id: 'ex1', name: 'Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', restTimeSeconds: 90,
          sets: [
            { id: 'st1', reps: '8', weight: '65', completed: true },
            { id: 'st2', reps: '8', weight: '65', completed: true }
          ]
        }
      ]
    },
    summary: { name: 'Upper Power', totalExercises: 1, totalSets: 2, sourceType: 'AD_HOC' }
  },
  {
    id: 'w3',
    completedAt: '2023-06-10T10:00:00Z',
    session: {
      id: 's3',
      startTime: 0,
      status: 'completed',
      exercises: [
        {
          id: 'ex1', name: 'Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', restTimeSeconds: 90,
          sets: [
            { id: 'st1', reps: '5', weight: '70', completed: true }
          ]
        },
        {
          id: 'ex2', name: 'Squat', targetMuscle: 'Legs', equipment: 'Barbell', restTimeSeconds: 120,
          sets: [
            { id: 'st3', reps: '5', weight: '90', completed: true }
          ]
        }
      ]
    },
    summary: { name: 'Upper Power', totalExercises: 2, totalSets: 2, sourceType: 'AD_HOC' }
  }
];

export const fetchWeightHistory = async (): Promise<WeightEntry[]> => {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(MOCK_WEIGHT_HISTORY), 300));
};

export const fetchWorkoutLog = async (): Promise<CompletedWorkout[]> => {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(MOCK_WORKOUT_LOGS), 300));
};
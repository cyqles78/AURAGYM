
import { WeightEntry, CompletedWorkout, Exercise } from '../types';

// Default Library Exercises
// Note: We use strict types matching the constants in types.ts
export const DEFAULT_EXERCISES: Exercise[] = [
  // --- CHEST ---
  { 
    id: 'def_bench_press', 
    name: 'Barbell Bench Press', 
    targetMuscle: 'Chest', 
    equipment: 'Barbell', 
    mechanic: 'Compound', 
    force: 'Push', 
    difficulty: 'Intermediate',
    instructions: ['Lie on bench', 'Lower bar to mid-chest', 'Press up explosively'], 
    restTimeSeconds: 120, 
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    sets: [] 
  },
  { 
    id: 'def_incline_db_press', 
    name: 'Incline Dumbbell Press', 
    targetMuscle: 'Chest', 
    equipment: 'Dumbbell', 
    mechanic: 'Compound', 
    force: 'Push',
    difficulty: 'Beginner',
    restTimeSeconds: 90, 
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    sets: [] 
  },
  { 
    id: 'def_cable_fly', 
    name: 'Cable Fly', 
    targetMuscle: 'Chest', 
    equipment: 'Cable', 
    mechanic: 'Isolation',
    force: 'Pull', 
    difficulty: 'Intermediate',
    restTimeSeconds: 60, 
    videoUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
    sets: [] 
  },

  // --- BACK ---
  { 
    id: 'def_deadlift', 
    name: 'Deadlift', 
    targetMuscle: 'Back', 
    equipment: 'Barbell', 
    mechanic: 'Compound',
    force: 'Pull',
    difficulty: 'Advanced',
    instructions: ['Feet shoulder width', 'Grip bar outside knees', 'Keep back flat', 'Drive through heels'],
    restTimeSeconds: 180, 
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    sets: [] 
  },
  { 
    id: 'def_pull_up', 
    name: 'Pull Up', 
    targetMuscle: 'Back', 
    equipment: 'Bodyweight', 
    mechanic: 'Compound',
    force: 'Pull',
    difficulty: 'Intermediate',
    restTimeSeconds: 90, 
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    sets: [] 
  },
  { 
    id: 'def_bb_row', 
    name: 'Bent Over Row', 
    targetMuscle: 'Back', 
    equipment: 'Barbell', 
    mechanic: 'Compound',
    force: 'Pull',
    difficulty: 'Intermediate',
    restTimeSeconds: 90, 
    videoUrl: 'https://www.youtube.com/watch?v=6FKQ8SgtwK0',
    sets: [] 
  },

  // --- LEGS (Quads/Hams/Glutes) ---
  { 
    id: 'def_squat', 
    name: 'Barbell Squat', 
    targetMuscle: 'Quads', 
    equipment: 'Barbell', 
    mechanic: 'Compound',
    force: 'Push',
    difficulty: 'Intermediate',
    restTimeSeconds: 180, 
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbGWL54',
    sets: [] 
  },
  { 
    id: 'def_leg_press', 
    name: 'Leg Press', 
    targetMuscle: 'Quads', 
    equipment: 'Machine', 
    mechanic: 'Compound',
    force: 'Push',
    difficulty: 'Beginner',
    restTimeSeconds: 90, 
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    sets: [] 
  },
  { 
    id: 'def_rdl', 
    name: 'Romanian Deadlift', 
    targetMuscle: 'Hamstrings', 
    equipment: 'Barbell', 
    mechanic: 'Compound',
    force: 'Pull',
    difficulty: 'Intermediate',
    restTimeSeconds: 90, 
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    sets: [] 
  },
  { 
    id: 'def_lunge', 
    name: 'Walking Lunge', 
    targetMuscle: 'Glutes', 
    equipment: 'Dumbbell', 
    mechanic: 'Compound',
    force: 'Push',
    difficulty: 'Beginner',
    restTimeSeconds: 60, 
    videoUrl: 'https://www.youtube.com/watch?v=L8fvyb5j6AI',
    sets: [] 
  },

  // --- SHOULDERS ---
  { 
    id: 'def_ohp', 
    name: 'Overhead Press', 
    targetMuscle: 'Shoulders', 
    equipment: 'Barbell', 
    mechanic: 'Compound',
    force: 'Push',
    difficulty: 'Intermediate',
    restTimeSeconds: 120, 
    videoUrl: 'https://www.youtube.com/watch?v=_RlRDWO2jfg',
    sets: [] 
  },
  { 
    id: 'def_lat_raise', 
    name: 'Lateral Raise', 
    targetMuscle: 'Shoulders', 
    equipment: 'Dumbbell', 
    mechanic: 'Isolation',
    force: 'Pull',
    difficulty: 'Beginner',
    restTimeSeconds: 60, 
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    sets: [] 
  },

  // --- ARMS ---
  { 
    id: 'def_bicep_curl', 
    name: 'Barbell Curl', 
    targetMuscle: 'Biceps', 
    equipment: 'Barbell', 
    mechanic: 'Isolation',
    force: 'Pull',
    difficulty: 'Beginner',
    restTimeSeconds: 60, 
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    sets: [] 
  },
  { 
    id: 'def_tricep_ext', 
    name: 'Tricep Rope Pushdown', 
    targetMuscle: 'Triceps', 
    equipment: 'Cable', 
    mechanic: 'Isolation',
    force: 'Push',
    difficulty: 'Beginner',
    restTimeSeconds: 60, 
    videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
    sets: [] 
  }
];

// --- MOCK API CALLS (Local Storage Simulation) ---

export const fetchWeightHistory = async (): Promise<WeightEntry[]> => {
  const stored = localStorage.getItem('auragym_weight_history');
  return stored ? JSON.parse(stored) : [];
};

export const fetchWorkoutLog = async (): Promise<CompletedWorkout[]> => {
  const stored = localStorage.getItem('auragym_completed_workouts');
  return stored ? JSON.parse(stored) : [];
};

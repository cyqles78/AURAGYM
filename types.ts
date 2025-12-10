
// --- STRICT CONSTANTS (For UI Generation) ---
export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 
  'Shoulders', 'Triceps', 'Biceps', 'Forearms', 'Abs', 'Cardio', 'Full Body', 'Other'
] as const;

export const EQUIPMENT_TYPES = [
  'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 
  'Kettlebell', 'Band', 'Smith Machine', 'Cardio Machine', 'Other'
] as const;

export const MECHANIC_TYPES = ['Compound', 'Isolation', 'N/A'] as const;
export const FORCE_TYPES = ['Push', 'Pull', 'Static', 'N/A'] as const;
export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

// --- DERIVED TYPES ---
export type TargetMuscle = typeof MUSCLE_GROUPS[number];
export type Equipment = typeof EQUIPMENT_TYPES[number];
export type Mechanic = typeof MECHANIC_TYPES[number];
export type Force = typeof FORCE_TYPES[number];
export type Difficulty = typeof DIFFICULTY_LEVELS[number];

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: TargetMuscle;
  equipment: Equipment;
  
  // Classification
  mechanic?: Mechanic;
  force?: Force;
  difficulty?: Difficulty;
  secondaryMuscles?: TargetMuscle[];
  
  // Instructions & Media
  instructions?: string[]; // Array of steps or single block text split by newline
  notes?: string;
  videoUrl?: string; 
  
  // Execution Defaults
  sets: WorkoutSet[]; // Default template sets
  restTimeSeconds: number; 
  supersetId?: string; 
  
  // System Flags
  isCustom?: boolean; // If true, user can delete it
  isDeleted?: boolean; // Soft delete flag
}

export interface WorkoutSet {
  id: string;
  reps: string; 
  weight: string; 
  completed: boolean;
  rpe?: number;
  isWarmup?: boolean; 
}

export interface WorkoutPlan {
  id: string;
  title: string;
  duration: string;
  difficulty: Difficulty;
  exercises: Exercise[];
  tags: string[];
  description?: string;
}

// --- NEW PROGRAM TYPES ---

export interface Program {
  id: string;
  name: string;
  description?: string;
  goal: string;          
  durationWeeks: number;
  daysPerWeek: number;
  createdAt: string;     
  weeks: ProgramWeek[];
}

export interface ProgramWeek {
  number: number;        
  days: ProgramDay[];
}

export interface ProgramDay {
  id: string;
  name: string;          
  focus: string;         
  sessionDuration: string; 
  exercises: Exercise[];   
}

export interface ProgramDayProgressRequest {
  programId: string;
  weekNumber: number;
  dayId: string;
  dayName: string;
  goal: string;
  exercises: {
    name: string;
    muscleGroup: string;
    currentSets: number;
    currentReps: string;
    recentPerformances: {
      date: string;
      setsCompleted: number;
      topSetReps?: number;
      topSetWeight?: number;
      estimated1RM?: number;
    }[];
  }[];
}

export interface ProgramDayProgressResult {
  dayId: string;
  name: string;
  focus: string;
  sessionDuration: string;
  exercises: Exercise[];
}

// -------------------------

export interface WorkoutSession {
  id: string;
  planId?: string;       
  programId?: string;    
  programDayId?: string; 
  startTime: number;
  endTime?: number;
  activeDuration?: number; 
  exercises: Exercise[]; 
  status: 'active' | 'completed';
}

export interface Recipe {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime: string;
  image?: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
}

export interface DailyStats {
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
  waterConsumed: number; 
  waterTarget: number;
  workoutsCompleted: number;
  streakDays: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface MeasurementEntry {
  id: string;
  date: string;
  type: string; 
  value: number;
  unit: string;
}

export interface WeightGoal {
  isActive: boolean;
  startDate: string | null;   
  targetDate: string | null;  
  startWeight: number | null;
  targetWeight: number | null;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  goal: string;
  subscription: 'Free' | 'Premium';
}

export type ViewState = 
    'DASHBOARD' | 
    'WORKOUTS' | 
    'BODY' | 
    'FOOD' | 
    'MORE' | 
    'EXERCISE_LIBRARY' |
    'EXERCISE_DETAIL';

// --- HISTORY & PR TRACKING ---

export interface CompletedWorkout {
  id: string;
  completedAt: string; 
  session: WorkoutSession;
  summary: {
    name: string;
    totalExercises: number;
    totalSets: number;
    estimatedVolume?: number; 
    sourceType: 'PLAN' | 'PROGRAM_DAY' | 'AD_HOC';
    planId?: string;
    programId?: string;
    programDayId?: string;
  };
}

export interface ExercisePerformanceEntry {
  id: string;
  date: string;              
  completedWorkoutId: string;
  exerciseName: string;
  targetMuscle?: string;
  exerciseId?: string;
  sets: {
    reps: number;
    weight?: number;
  }[];
  bestSetEstimated1RM?: number;
  isPR?: boolean;
}

export interface ExerciseStats {
  exerciseName: string;
  lastPerformance?: {
    date: string;
    totalSets: number;
    topSet?: { reps: number; weight?: number; estimated1RM?: number };
  };
  bestPerformance?: {
    date: string;
    reps: number;
    weight?: number;
    estimated1RM?: number;
  };
}

// --- FOOD LOGGING ---

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodLogEntry {
  id: string;
  date: string;       
  time?: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;     
  fats?: number;      
  source?: 'MANUAL' | 'RECIPE' | 'DATABASE';
  recipeId?: string;
  fdcId?: number;     
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface SearchableFoodItem {
  id: number;         
  name: string;
  calories: number;   
  protein: number;    
  carbs: number;      
  fats: number;       
  brand?: string;
  servingSize?: number;
  servingUnit?: string;
}

// --- PROGRESS TRACKING ---

export interface TimeSeriesDataPoint {
  date: string; 
  value: number;
}

export interface MetricSummary {
  current: number;
  start: number;
  change: number;
  percentageChange: number;
  allTimeHigh: number;
}

// --- AI MEAL PLANNING ---

export interface RecipeSummary {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealEntry {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipeName: string;
  recipeDetails: RecipeSummary;
  preparationTimeMinutes: number;
  ingredients?: string[];
}

export interface DayPlan {
  dayName: string;
  meals: MealEntry[];
}

export interface WeeklyMealPlan {
  planId: string;
  dateGenerated: string;
  days: DayPlan[];
}

export interface ShoppingListItem {
  ingredient: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
}

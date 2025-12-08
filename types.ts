

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  equipment: string;
  sets: WorkoutSet[];
  notes?: string;
  restTimeSeconds: number; // e.g. 90
}

export interface WorkoutSet {
  id: string;
  reps: string; // "8-10" or "10"
  weight: string; // "20kg"
  completed: boolean;
  rpe?: number;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: Exercise[];
  tags: string[];
  description?: string;
}

// --- NEW PROGRAM TYPES ---

export interface Program {
  id: string;
  name: string;
  description?: string;
  goal: string;          // e.g. "Hypertrophy", "Strength", "Fat loss"
  durationWeeks: number;
  daysPerWeek: number;
  createdAt: string;     // ISO date
  weeks: ProgramWeek[];
}

export interface ProgramWeek {
  number: number;        // 1-based week index
  days: ProgramDay[];
}

export interface ProgramDay {
  id: string;
  name: string;          // e.g. "Push A", "Legs", "Full Body"
  focus: string;         // e.g. "Chest & Triceps", "Lower body"
  sessionDuration: string; // e.g. "60 min"
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
  planId?: string;       // For standalone plans
  programId?: string;    // For programs
  programDayId?: string; // For programs
  startTime: number;
  endTime?: number;
  exercises: Exercise[]; // Copies of exercises with user-inputted data
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
  waterConsumed: number; // in 250ml increments
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
  type: string; // 'Waist', 'Chest', 'Arms', etc.
  value: number;
  unit: string;
}

export interface WeightGoal {
  isActive: boolean;
  startDate: string | null;   // ISO date (YYYY-MM-DD)
  targetDate: string | null;  // ISO date (YYYY-MM-DD)
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

export type ViewState = 'DASHBOARD' | 'WORKOUTS' | 'BODY' | 'FOOD' | 'MORE';

// --- HISTORY & PR TRACKING ---

export interface CompletedWorkout {
  id: string;
  completedAt: string; // ISO timestamp
  session: WorkoutSession;
  summary: {
    name: string;
    totalExercises: number;
    totalSets: number;
    estimatedVolume?: number; // sum(weight * reps) where possible
    sourceType: 'PLAN' | 'PROGRAM_DAY' | 'AD_HOC';
    planId?: string;
    programId?: string;
    programDayId?: string;
  };
}

export interface ExercisePerformanceEntry {
  id: string;
  date: string;              // ISO date (yyyy-mm-dd)
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
  date: string;       // ISO date: 'YYYY-MM-DD'
  time?: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;     // Optional for backward compatibility
  fats?: number;      // Optional for backward compatibility
  source?: 'MANUAL' | 'RECIPE' | 'DATABASE';
  recipeId?: string;
  fdcId?: number;     // USDA FoodData Central ID
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface SearchableFoodItem {
  id: number;         // FDC ID
  name: string;
  calories: number;   // kcal
  protein: number;    // g
  carbs: number;      // g
  fats: number;       // g
  brand?: string;
  servingSize?: number;
  servingUnit?: string;
}

// --- PROGRESS TRACKING ---

export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD
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
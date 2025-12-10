
import React, { useState, useEffect } from 'react';
import { ViewState, DailyStats, WorkoutPlan, Recipe, WeightEntry, UserProfile, WorkoutSession, MeasurementEntry, Program, CompletedWorkout, ExercisePerformanceEntry, FoodLogEntry, MealType, WeightGoal, MacroTargets, Exercise } from './types';
import { Navigation } from './components/Navigation';
import { DashboardView } from './views/DashboardView';
import { WorkoutsView } from './views/WorkoutsView';
import { FoodView } from './views/FoodView';
import { BodyView } from './views/BodyView';
import { MoreView } from './views/MoreView';
import { ExerciseLibraryScreen } from './views/Exercise/ExerciseLibraryScreen';
import { ExerciseDetailScreen } from './views/Exercise/ExerciseDetailScreen';
import { ArrowLeft } from 'lucide-react';
import { usePersistentState } from './hooks/usePersistentState';
import { DEFAULT_EXERCISES } from './services/DataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [history, setHistory] = useState<ViewState[]>(['DASHBOARD']);
  
  // Navigation State for Detail Views
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // --- GLOBAL NAVIGATION HANDLERS ---
  const handleNavigate = (view: ViewState) => {
    if (view === currentView) return;
    setHistory(prev => [...prev, view]);
    setCurrentView(view);
  };

  const handleBack = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevView = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setCurrentView(prevView);
  };

  // --- STATE (PERSISTED) ---
  const [user, setUser] = usePersistentState<UserProfile>('auragym_user_profile', {
    name: 'Alex Lifter',
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    goal: 'Hypertrophy',
    subscription: 'Premium'
  });

  const [stats, setStats] = usePersistentState<DailyStats>('auragym_daily_stats', {
    caloriesConsumed: 1850,
    caloriesTarget: 2500,
    proteinConsumed: 145,
    proteinTarget: 180,
    waterConsumed: 3,
    waterTarget: 8,
    workoutsCompleted: 3,
    streakDays: 12
  });

  const [macroTargets, setMacroTargets] = usePersistentState<MacroTargets>('auragym_macro_targets', {
    calories: 2400,
    protein: 160,
    carbs: 250,
    fats: 70
  });

  const [waterIntake, setWaterIntake] = usePersistentState<number>('auragym_water_intake', 3);

  const [workouts, setWorkouts] = usePersistentState<WorkoutPlan[]>('auragym_workouts', [
    {
      id: '1',
      title: 'Upper Body Power',
      duration: '60 min',
      difficulty: 'Intermediate',
      tags: ['Strength', 'Push/Pull'],
      exercises: [
        { 
            id: 'e1', name: 'Barbell Bench Press', targetMuscle: 'Chest', equipment: 'Barbell', restTimeSeconds: 120,
            sets: [
                { id: 's1', reps: '5', weight: '80', completed: false },
                { id: 's2', reps: '5', weight: '80', completed: false },
                { id: 's3', reps: '5', weight: '80', completed: false },
                { id: 's4', reps: '5', weight: '80', completed: false }
            ] 
        },
        { 
            id: 'e2', name: 'Bent Over Row', targetMuscle: 'Back', equipment: 'Barbell', restTimeSeconds: 90,
            sets: [
                { id: 's1', reps: '8', weight: '60', completed: false },
                { id: 's2', reps: '8', weight: '60', completed: false },
                { id: 's3', reps: '8', weight: '60', completed: false }
            ] 
        }
      ]
    }
  ]);

  const [customExercises, setCustomExercises] = usePersistentState<Exercise[]>('auragym_custom_exercises', []);
  
  // Merge default exercises with user custom exercises for the full library
  const fullExerciseLibrary = [...DEFAULT_EXERCISES, ...customExercises];

  const [programs, setPrograms] = usePersistentState<Program[]>('auragym_programs', []);

  const [recipes, setRecipes] = usePersistentState<Recipe[]>('auragym_recipes', [
    {
      id: '1',
      title: 'Protein-Packed Chicken Bowl',
      calories: 550,
      protein: 45,
      carbs: 60,
      fats: 15,
      prepTime: '20 min',
      ingredients: ['200g Chicken Breast', '1 cup Quinoa', 'Avocado', 'Spinach'],
      steps: ['Cook chicken', 'Boil quinoa', 'Mix everything'],
      tags: ['Lunch', 'High Protein']
    }
  ]);

  const [foodLog, setFoodLog] = usePersistentState<FoodLogEntry[]>('auragym_food_log', []);

  const [weightHistory, setWeightHistory] = usePersistentState<WeightEntry[]>('auragym_weight_history', [
    { date: '2023-01-01', weight: 85.0 },
    { date: '2023-02-01', weight: 84.2 },
    { date: '2023-03-01', weight: 83.5 },
    { date: '2023-04-01', weight: 82.8 },
    { date: '2023-05-01', weight: 83.1 },
    { date: '2023-06-01', weight: 82.5 },
  ]);
  
  const [measurements, setMeasurements] = usePersistentState<MeasurementEntry[]>('auragym_measurements', [
    { id: 'm1', date: '2023-06-01', type: 'Waist', value: 82, unit: 'cm' },
    { id: 'm2', date: '2023-06-01', type: 'Chest', value: 105, unit: 'cm' },
  ]);

  const [weightGoal, setWeightGoal] = usePersistentState<WeightGoal>(
    'auragym_weight_goal',
    {
      isActive: false,
      startDate: null,
      targetDate: null,
      startWeight: null,
      targetWeight: null,
    }
  );

  const [completedWorkouts, setCompletedWorkouts] = usePersistentState<CompletedWorkout[]>(
    'auragym_completed_workouts',
    []
  );

  const [exerciseHistory, setExerciseHistory] = usePersistentState<ExercisePerformanceEntry[]>(
    'auragym_exercise_history',
    []
  );

  // --- HELPERS ---

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const addFoodLogEntry = (entry: {
    name: string;
    calories: number;
    protein: number;
    carbs?: number;
    fats?: number;
    mealType: MealType;
    source?: 'MANUAL' | 'RECIPE';
    recipeId?: string;
  }) => {
    const calories = Number(entry.calories);
    const protein = Number(entry.protein);
    const carbs = Number(entry.carbs || 0);
    const fats = Number(entry.fats || 0);

    if (isNaN(calories) || calories <= 0) return;

    const newEntry: FoodLogEntry = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Date.now().toString(),
      date: getTodayDate(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: entry.mealType,
      name: entry.name || 'Food log',
      calories,
      protein,
      carbs,
      fats,
      source: entry.source,
      recipeId: entry.recipeId,
    };

    setFoodLog(prev => [newEntry, ...prev]);

    setStats(prev => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + calories,
      proteinConsumed: prev.proteinConsumed + protein,
    }));
  };

  // --- DATA UPDATE HANDLERS ---

  const handleCompleteSession = (completedWorkout: CompletedWorkout, performanceEntries: ExercisePerformanceEntry[]) => {
    // Save Completed Workout
    setCompletedWorkouts(prev => [...prev, completedWorkout]);
    
    // Save Exercise History
    setExerciseHistory(prev => [...prev, ...performanceEntries]);
    
    // Update Stats
    setStats(prev => ({ ...prev, workoutsCompleted: prev.workoutsCompleted + 1 }));

    console.log("Workout Saved:", completedWorkout);
  };

  const handleAddMeasurement = (type: string, value: number, unit: string) => {
    if (type === 'Weight') {
        const today = new Date().toISOString().split('T')[0];
        setWeightHistory(prev => [...prev, { date: today, weight: value }]);
    } else {
        const newEntry: MeasurementEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type,
            value,
            unit
        };
        setMeasurements(prev => [...prev, newEntry]);
    }
  };

  const handleQuickLog = (calories: number, protein: number, carbs: number, fats: number, name: string, mealType: MealType) => {
    addFoodLogEntry({
      name: name || 'Quick log',
      calories,
      protein,
      carbs,
      fats,
      mealType,
      source: 'MANUAL',
    });
  };

  const handleLogRecipeToToday = (recipe: Recipe, mealType: MealType) => {
    addFoodLogEntry({
      name: recipe.title,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      mealType,
      source: 'RECIPE',
      recipeId: recipe.id,
    });
  };

  const handleUpdateWeightGoal = (goal: WeightGoal) => {
    setWeightGoal(goal);
  };

  const handleUpdateProgram = (updatedProgram: Program) => {
    setPrograms(prev => prev.map(p => p.id === updatedProgram.id ? updatedProgram : p));
  };

  const handleAddCustomExercise = (ex: Exercise) => {
      setCustomExercises(prev => [...prev, ex]);
  };

  const handleUpdateCustomExercise = (updatedExercise: Exercise) => {
      setCustomExercises(prev => prev.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      // If we are currently viewing this exercise, update selection
      if (selectedExercise?.id === updatedExercise.id) {
          setSelectedExercise(updatedExercise);
      }
  };

  const handleDeleteCustomExercise = (exerciseId: string) => {
      setCustomExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      if (selectedExercise?.id === exerciseId) {
          setSelectedExercise(null);
          handleBack();
      }
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <DashboardView stats={{...stats, waterConsumed: waterIntake}} onNavigate={handleNavigate} />;
      case 'WORKOUTS':
        return (
          <WorkoutsView 
            plans={workouts} 
            programs={programs}
            customExercises={fullExerciseLibrary}
            onAddPlan={(p) => setWorkouts([p, ...workouts])} 
            onAddProgram={(p) => setPrograms([p, ...programs])}
            onUpdateProgram={handleUpdateProgram}
            onAddCustomExercise={handleAddCustomExercise}
            onUpdateCustomExercise={handleUpdateCustomExercise}
            onDeleteCustomExercise={handleDeleteCustomExercise}
            onCompleteSession={handleCompleteSession}
            completedWorkouts={completedWorkouts}
            exerciseHistory={exerciseHistory}
            onNavigate={handleNavigate}
          />
        );
      case 'EXERCISE_LIBRARY':
        return (
          <ExerciseLibraryScreen
            exercises={fullExerciseLibrary}
            history={exerciseHistory}
            onSelectExercise={(ex) => {
              setSelectedExercise(ex);
              handleNavigate('EXERCISE_DETAIL');
            }}
            onBack={handleBack}
            onAddCustomExercise={handleAddCustomExercise}
            onUpdateExercise={handleUpdateCustomExercise}
            onDeleteExercise={handleDeleteCustomExercise}
          />
        );
      case 'EXERCISE_DETAIL':
        if (!selectedExercise) {
           handleNavigate('EXERCISE_LIBRARY');
           return null;
        }
        return (
          <ExerciseDetailScreen 
            exercise={selectedExercise}
            history={exerciseHistory}
            onBack={handleBack}
            onUpdateExercise={handleUpdateCustomExercise}
            onDeleteExercise={handleDeleteCustomExercise}
          />
        );
      case 'BODY':
        return (
          <BodyView 
            weightHistory={weightHistory} 
            measurements={measurements} 
            onLogMeasurement={handleAddMeasurement}
            weightGoal={weightGoal}
            onUpdateWeightGoal={handleUpdateWeightGoal}
            exerciseHistory={exerciseHistory}
          />
        );
      case 'FOOD':
        return (
          <FoodView 
            recipes={recipes} 
            onAddRecipe={(r) => setRecipes([r, ...recipes])} 
            waterConsumed={waterIntake} 
            onUpdateWater={setWaterIntake} 
            foodLog={foodLog}
            onQuickLog={handleQuickLog}
            onLogRecipeToToday={handleLogRecipeToToday}
            macroTargets={macroTargets}
            onUpdateTargets={setMacroTargets}
          />
        );
      case 'MORE':
        return (
          <MoreView 
            user={user} 
            onUpdateUser={setUser} 
          />
        );
      default:
        return <DashboardView stats={stats} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background font-sans text-primary">
      {/* Global Header / Back Button Area */}
      {history.length > 1 && (
         <button 
           onClick={handleBack}
           className="fixed top-6 left-4 z-40 p-2.5 rounded-full bg-surface text-white border border-border shadow-card active:scale-95 transition-all"
         >
            <ArrowLeft size={20} />
         </button>
      )}

      {/* Content Scroll Wrapper */}
      <div className="h-screen overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-md px-4 min-h-full">
           {renderView()}
        </div>
      </div>

      {/* Bottom Nav */}
      <Navigation currentView={currentView} setView={handleNavigate} />

    </div>
  );
};

export default App;

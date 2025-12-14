import React, { useState, useMemo, useEffect } from 'react';
import { ViewState, DailyStats, WorkoutPlan, Recipe, WeightEntry, UserProfile, MeasurementEntry, Program, CompletedWorkout, ExercisePerformanceEntry, FoodLogEntry, WeightGoal, MacroTargets, Exercise } from './types';
import { Navigation } from './components/Navigation';
import { DashboardView } from './views/DashboardView';
import { WorkoutsView } from './views/WorkoutsView';
import { FoodView } from './views/FoodView';
import { BodyView } from './views/BodyView';
import { MoreView } from './views/MoreView';
import { ExerciseLibraryScreen } from './views/Exercise/ExerciseLibraryScreen';
import { ExerciseDetailScreen } from './views/Exercise/ExerciseDetailScreen';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './views/Auth/AuthScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { OfflineProvider } from './context/OfflineContext';
import { NetworkStatus } from './components/NetworkStatus';
import { OnboardingScreen } from './views/Onboarding/OnboardingScreen';
import { InteractiveTour } from './components/InteractiveTour';
import { usePersistentState } from './hooks/usePersistentState';
import { useQueryClient } from '@tanstack/react-query';
import {
  useExercises,
  useWorkouts,
  useLogs,
  useProfile,
  useCreateWorkout,
  useCreateExercise,
  useLogWorkout
} from './hooks/useSupabaseData';

// Fallback Default Data
import { DEFAULT_EXERCISES } from './services/DataService';

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [history, setHistory] = useState<ViewState[]>(['DASHBOARD']);
  const [showTour, setShowTour] = useState(false);
  
  const queryClient = useQueryClient();

  // Navigation State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // --- SUPABASE DATA HOOKS ---
  const { data: dbProfile, isLoading: profileLoading } = useProfile();
  const { data: dbExercises, isLoading: exercisesLoading } = useExercises();
  const { data: dbWorkouts, isLoading: workoutsLoading } = useWorkouts();
  const { data: dbLogs, isLoading: logsLoading } = useLogs();

  const createWorkoutMutation = useCreateWorkout();
  const createExerciseMutation = useCreateExercise();
  const logWorkoutMutation = useLogWorkout();

  // --- LOCAL STATE (Features not yet DB-backed) ---
  const [localStats, setLocalStats] = useState<DailyStats>({
    caloriesConsumed: 1850,
    caloriesTarget: 2500,
    proteinConsumed: 145,
    proteinTarget: 180,
    waterConsumed: 3,
    waterTarget: 8,
    workoutsCompleted: 0,
    streakDays: 0
  });

  const [macroTargets, setMacroTargets] = useState<MacroTargets>({
    calories: 2400,
    protein: 160,
    carbs: 250,
    fats: 70
  });

  const [waterIntake, setWaterIntake] = useState<number>(3);
  
  // PERSISTED PROGRAMS
  const [programs, setPrograms] = usePersistentState<Program[]>('auragym_programs', []);
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([
    { date: '2023-01-01', weight: 85.0 }
  ]);
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [weightGoal, setWeightGoal] = useState<WeightGoal>({
    isActive: false,
    startDate: null,
    targetDate: null,
    startWeight: null,
    targetWeight: null,
  });

  // --- DERIVED DATA ---

  const fullExerciseLibrary = useMemo(() => {
    if (!dbExercises || dbExercises.length === 0) return DEFAULT_EXERCISES;
    return dbExercises;
  }, [dbExercises]);

  const completedWorkouts = dbLogs || [];

  // Calculate Streak
  const currentStreak = useMemo(() => {
    if (!completedWorkouts.length) return 0;

    const sortedDates: string[] = Array.from<string>(new Set(completedWorkouts.map((w: CompletedWorkout) => w.completedAt.split('T')[0])))
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let currentDate = new Date(sortedDates[0]);
    streak++;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    return streak;
  }, [completedWorkouts]);

  const userProfile: UserProfile = dbProfile || {
    name: 'Guest User',
    level: 1,
    xp: 0,
    nextLevelXp: 1000,
    goal: 'General Fitness',
    subscription: 'Free',
    hasCompletedOnboarding: false
  };

  // --- TOUR CHECK ---
  useEffect(() => {
    const shouldShowTour = localStorage.getItem('auragym_show_tour');
    if (shouldShowTour === 'true') {
      localStorage.removeItem('auragym_show_tour');
      setTimeout(() => setShowTour(true), 1500);
    }
  }, []);

  // --- AUTH & LOADING GATES ---

  if (authLoading) return <LoadingSpinner />;
  if (profileLoading && !dbProfile) return <LoadingSpinner />;
  if (!user) return <AuthScreen />;

  const handleOnboardingFinish = async () => {
      console.log("Finishing onboarding...");
      if (dbProfile) {
          queryClient.setQueryData(['profile'], {
              ...dbProfile,
              hasCompletedOnboarding: true,
              goal: dbProfile.goal || 'General Fitness'
          });
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      localStorage.removeItem('auragym_show_tour'); 
      setCurrentView('DASHBOARD');
      setTimeout(() => {
          setShowTour(true);
      }, 1000);
  };

  if (dbProfile && (!dbProfile.hasCompletedOnboarding || !dbProfile.goal)) {
    return <OnboardingScreen user={dbProfile} onFinish={handleOnboardingFinish} />;
  }

  // --- NAVIGATION HANDLERS ---

  const handleNavigate = (view: ViewState) => {
    if (view === currentView) return;
    setHistory(prev => [...prev, view]);
    setCurrentView(view);
  };

  const handleBack = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    const prevView = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setCurrentView(prevView);
  };

  // --- ACTION HANDLERS ---

  const handleCompleteSession = (workout: CompletedWorkout, performanceEntries: ExercisePerformanceEntry[]) => {
    logWorkoutMutation.mutate({ workout, performance: performanceEntries });
  };

  const handleAddPlan = (plan: WorkoutPlan) => {
    createWorkoutMutation.mutate(plan);
  };

  const handleAddCustomExercise = (ex: Exercise) => {
    createExerciseMutation.mutate(ex);
  };

  // --- VIEW RENDERING ---

  const renderView = () => {
    switch (currentView) {
      case 'ONBOARDING':
        return <OnboardingScreen user={userProfile} onFinish={handleOnboardingFinish} />;
      case 'DASHBOARD':
        return (
          <DashboardView
            userProfile={userProfile}
            stats={{
              ...localStats,
              waterConsumed: waterIntake,
              workoutsCompleted: completedWorkouts.length,
              streakDays: currentStreak
            }}
            onNavigate={handleNavigate}
          />
        );
      case 'WORKOUTS':
        return (
          <WorkoutsView
            plans={dbWorkouts || []}
            programs={programs}
            customExercises={fullExerciseLibrary}
            onAddPlan={handleAddPlan}
            onAddProgram={(p) => setPrograms([p, ...programs])}
            onUpdateProgram={(p) => setPrograms(prev => prev.map(pr => pr.id === p.id ? p : pr))}
            onAddCustomExercise={handleAddCustomExercise}
            onUpdateCustomExercise={() => { }}
            onDeleteCustomExercise={() => { }}
            onCompleteSession={handleCompleteSession}
            completedWorkouts={completedWorkouts}
            exerciseHistory={[]}
            onNavigate={handleNavigate}
          />
        );
      case 'EXERCISE_LIBRARY':
        return (
          <ExerciseLibraryScreen
            onSelectExercise={(ex) => {
              setSelectedExercise(ex);
              handleNavigate('EXERCISE_DETAIL');
            }}
            onBack={handleBack}
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
            history={[]}
            onBack={handleBack}
          />
        );
      case 'BODY':
        return (
          <BodyView
            weightHistory={weightHistory}
            measurements={measurements}
            onLogMeasurement={(t, v, u) => {
              if (t === 'Weight') setWeightHistory([...weightHistory, { date: new Date().toISOString(), weight: v }]);
              else setMeasurements([...measurements, { id: Date.now().toString(), date: new Date().toISOString(), type: t, value: v, unit: u }]);
            }}
            weightGoal={weightGoal}
            onUpdateWeightGoal={setWeightGoal}
            exerciseHistory={[]}
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
            onQuickLog={(c, p, ca, f, n, m, id) => {
              const entry: FoodLogEntry = {
                id: Date.now().toString(), date: new Date().toISOString().split('T')[0],
                name: n, calories: c, protein: p, carbs: ca, fats: f, mealType: m, fdcId: id
              };
              setFoodLog([entry, ...foodLog]);
              setLocalStats(prev => ({ ...prev, caloriesConsumed: prev.caloriesConsumed + c, proteinConsumed: prev.proteinConsumed + p }));
            }}
            onLogRecipeToToday={() => { }}
            macroTargets={macroTargets}
            onUpdateTargets={setMacroTargets}
          />
        );
      case 'MORE':
        return (
          <MoreView
            user={userProfile}
            onUpdateUser={() => { }}
          />
        );
      default:
        return (
          <DashboardView
            userProfile={userProfile}
            stats={{
              ...localStats,
              workoutsCompleted: completedWorkouts.length,
              streakDays: currentStreak
            }}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background font-sans text-primary safe-area-top safe-area-bottom">
      <NetworkStatus />
      <div className="h-screen overflow-y-auto no-scrollbar pb-safe">
        <div className="mx-auto max-w-md px-4 min-h-full">
          {renderView()}
        </div>
      </div>

      {currentView !== 'ONBOARDING' && !((dbProfile && (!dbProfile.hasCompletedOnboarding || !dbProfile.goal))) && (
        <Navigation currentView={currentView} setView={handleNavigate} />
      )}

      {showTour && (
        <InteractiveTour onComplete={() => setShowTour(false)} />
      )}

    </div>
  );
};

const App = () => {
  return (
    <OfflineProvider>
      <AppContent />
    </OfflineProvider>
  );
};

export default App;
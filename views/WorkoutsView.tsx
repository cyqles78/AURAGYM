
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { WorkoutPlan, WorkoutSession, Program, ProgramDay, CompletedWorkout, ExercisePerformanceEntry, ProgramDayProgressRequest, ProgramDayProgressResult, Exercise } from '../types';
import { generateAIWorkout, generateAIProgram, ProgramContextInput, generateProgressedProgramDay } from '../services/geminiService';
import { Plus, Play, Clock, BarChart2, Sparkles, ChevronRight, ArrowLeft, Calendar, Layers, ChevronDown, History, Trophy, TrendingUp, AlertCircle, X, Dumbbell, Hammer } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, AreaChart, Area, Tooltip, CartesianGrid } from 'recharts';
import { ActiveWorkoutScreen } from './ActiveWorkoutScreen';
import { WorkoutBuilderView } from './WorkoutBuilderView';
import { WorkoutSummaryScreen } from './WorkoutSummaryScreen';

interface WorkoutsViewProps {
  plans: WorkoutPlan[];
  programs: Program[];
  customExercises: Exercise[]; // From App state
  onAddPlan: (plan: WorkoutPlan) => void;
  onAddProgram: (program: Program) => void;
  onUpdateProgram: (program: Program) => void;
  onAddCustomExercise: (ex: Exercise) => void; // Callback
  onCompleteSession: (completedWorkout: CompletedWorkout, performanceEntries: ExercisePerformanceEntry[]) => void;
  completedWorkouts: CompletedWorkout[];
  exerciseHistory: ExercisePerformanceEntry[];
}

type WorkoutsMode = 'LIST' | 'GENERATOR' | 'ACTIVE_SESSION' | 'CREATE_PLAN' | 'PROGRAM_BUILDER' | 'PROGRAM_DETAIL' | 'BUILDER' | 'SUMMARY';

interface ComputedExerciseStats {
  exerciseName: string;
  entries: ExercisePerformanceEntry[];
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

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ 
    plans = [], 
    programs = [], 
    customExercises = [],
    onAddPlan, 
    onAddProgram, 
    onUpdateProgram, 
    onAddCustomExercise,
    onCompleteSession, 
    completedWorkouts = [], 
    exerciseHistory = [] 
}) => {
  const [viewMode, setViewMode] = useState<WorkoutsMode>('LIST');
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  // Summary State
  const [lastSessionData, setLastSessionData] = useState<{
      workout: CompletedWorkout;
      prs: ExercisePerformanceEntry[];
  } | null>(null);

  // Single Workout Generator State
  const [goal, setGoal] = useState('Hypertrophy');
  const [level, setLevel] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);

  // Program Detail State
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  // AI Progression State
  const [progressPreview, setProgressPreview] = useState<ProgramDayProgressResult | null>(null);
  const [progressContext, setProgressContext] = useState<{programId: string, weekNumber: number, dayId: string} | null>(null);
  const [isProgressLoading, setIsProgressLoading] = useState(false);

  // Program Builder State
  const [wizardStep, setWizardStep] = useState(1);
  const [programContext, setProgramContext] = useState<ProgramContextInput>({
    goal: 'Hypertrophy',
    level: 'Intermediate',
    equipment: ['Dumbbells', 'Machines'],
    timePerSession: 60,
    constraints: '',
    daysPerWeek: 4,
    durationWeeks: 4,
    splitStyle: 'Upper/Lower',
    programName: ''
  });
  const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Exercise Detail Modal State
  const [selectedExerciseStats, setSelectedExerciseStats] = useState<ComputedExerciseStats | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoDate: string) => {
      return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // --- ANALYTICS CALCULATIONS ---

  const weeklyVolumeData = useMemo(() => {
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
    
    return last7Days.map(date => {
        const dayVolume = completedWorkouts
            .filter(w => w.completedAt.startsWith(date))
            .reduce((sum, w) => sum + (w.summary.estimatedVolume || 0), 0);
        
        const dateObj = new Date(date);
        return {
            fullDate: date,
            day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            volume: dayVolume
        };
    });
  }, [completedWorkouts]);

  const muscleFreqData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    
    const counts: Record<string, number> = {};
    exerciseHistory.forEach(ex => {
        if (new Date(ex.date) >= cutoff && ex.targetMuscle) {
            counts[ex.targetMuscle] = (counts[ex.targetMuscle] || 0) + 1;
        }
    });
    
    return Object.entries(counts)
        .map(([muscle, count]) => ({ muscle, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5
  }, [exerciseHistory]);

  const prProgressData = useMemo(() => {
    const grouped: Record<string, { date: string, val: number }[]> = {};
    
    exerciseHistory.forEach(ex => {
        if (ex.bestSetEstimated1RM && ex.bestSetEstimated1RM > 0) {
            if (!grouped[ex.exerciseName]) grouped[ex.exerciseName] = [];
            grouped[ex.exerciseName].push({
                date: ex.date,
                val: Math.round(ex.bestSetEstimated1RM)
            });
        }
    });
    
    // Convert to array and filter for interesting ones (at least 2 data points or very recent)
    return Object.entries(grouped)
        .map(([name, data]) => {
            const sorted = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return { 
                name, 
                data: sorted,
                latest: sorted[sorted.length-1].val,
                improvement: sorted.length > 1 ? sorted[sorted.length-1].val - sorted[0].val : 0
            };
        })
        .filter(item => item.data.length >= 2) 
        .sort((a, b) => b.latest - a.latest) // Sort by weight roughly
        .slice(0, 4); // Show top 4
  }, [exerciseHistory]);

  // --- HANDLERS ---

  const handleStartWorkout = (plan: WorkoutPlan) => {
    const newSession: WorkoutSession = {
        id: Date.now().toString(),
        planId: plan.id,
        startTime: Date.now(),
        exercises: JSON.parse(JSON.stringify(plan.exercises || [])), // Deep copy with fallback
        status: 'active'
    };
    setActiveSession(newSession);
    setViewMode('ACTIVE_SESSION');
  };

  const handleStartProgramDay = (program: Program, day: ProgramDay) => {
      const newSession: WorkoutSession = {
          id: Date.now().toString(),
          programId: program.id,
          programDayId: day.id,
          startTime: Date.now(),
          exercises: JSON.parse(JSON.stringify(day.exercises || [])),
          status: 'active'
      };
      setActiveSession(newSession);
      setViewMode('ACTIVE_SESSION');
  };

  const handleSessionFinished = (finishedSession: WorkoutSession) => {
    // 1. Calculate Stats & PRs
    const completedAt = new Date().toISOString();
    const completedWorkoutId = finishedSession.id;
    let totalVolume = 0;
    let totalSets = 0;
    const performanceEntries: ExercisePerformanceEntry[] = [];

    finishedSession.exercises.forEach(ex => {
        const validSets = ex.sets.filter(s => {
           const r = parseFloat(s.reps);
           // Count volume if completed
           return !isNaN(r) && r > 0 && s.completed;
        });
        
        const exerciseVolume = validSets.reduce((sum, s) => sum + (parseFloat(s.weight)||0) * (parseFloat(s.reps)||0), 0);
        totalVolume += exerciseVolume;
        totalSets += validSets.length;

        // PR Detection
        let bestSet1RM = 0;
        validSets.forEach(s => {
            const w = parseFloat(s.weight) || 0;
            const r = parseFloat(s.reps) || 0;
            if(w > 0 && r > 0) {
                // Epley Formula
                const e1rm = w * (1 + r/30);
                if(e1rm > bestSet1RM) bestSet1RM = e1rm;
            }
        });

        // Check History for PR
        const historyForEx = exerciseHistory.filter(h => h.exerciseName === ex.name);
        const historicalMax = Math.max(...historyForEx.map(h => h.bestSetEstimated1RM || 0), 0);
        const isPR = bestSet1RM > historicalMax && bestSet1RM > 0;

        if (validSets.length > 0) {
            performanceEntries.push({
              id: `${completedWorkoutId}_${ex.id}`,
              date: completedAt.split('T')[0],
              completedWorkoutId,
              exerciseName: ex.name,
              targetMuscle: ex.targetMuscle,
              exerciseId: ex.id,
              sets: validSets.map(s => ({ reps: parseFloat(s.reps)||0, weight: parseFloat(s.weight)||0 })),
              bestSetEstimated1RM: bestSet1RM > 0 ? bestSet1RM : undefined,
              isPR
            });
        }
    });

    // 2. Determine Session Name
    let sessionName = 'Workout';
    if (finishedSession.programId && finishedSession.programDayId) {
        const prog = programs.find(p => p.id === finishedSession.programId);
        const day = prog?.weeks?.flatMap(w => w.days).find(d => d.id === finishedSession.programDayId);
        if (day) sessionName = day.name;
    } else if (finishedSession.planId) {
        const plan = plans.find(p => p.id === finishedSession.planId);
        if (plan) sessionName = plan.title;
    }

    // 3. Construct Objects
    const completedWorkout: CompletedWorkout = {
        id: completedWorkoutId,
        completedAt,
        session: { ...finishedSession, status: 'completed' },
        summary: {
            name: sessionName,
            totalExercises: finishedSession.exercises.length,
            totalSets,
            estimatedVolume: totalVolume,
            sourceType: finishedSession.programId ? 'PROGRAM_DAY' : finishedSession.planId ? 'PLAN' : 'AD_HOC',
            planId: finishedSession.planId,
            programId: finishedSession.programId,
            programDayId: finishedSession.programDayId
        }
    };

    onCompleteSession(completedWorkout, performanceEntries);
    setActiveSession(null);
    
    // Switch to Summary View
    setLastSessionData({
        workout: completedWorkout,
        prs: performanceEntries.filter(p => p.isPR)
    });
    setViewMode('SUMMARY');
  };

  const handleGenerateSingle = async () => {
    setIsGenerating(true);
    const plan = await generateAIWorkout(goal, level, 'Barbell, Dumbbells, Bench');
    if (plan) {
      onAddPlan({ ...plan, id: Date.now().toString() });
      setViewMode('LIST');
    }
    setIsGenerating(false);
  };

  const handleGenerateProgram = async () => {
    setGenerationError(null);
    setIsGenerating(true);
    // Use fallback name if empty
    const finalContext = {
        ...programContext,
        programName: programContext.programName || `${programContext.goal} ${programContext.splitStyle}`
    };
    
    try {
        const program = await generateAIProgram(finalContext);
        if (program) {
            setGeneratedProgram({ ...program, id: Date.now().toString() });
        } else {
            setGenerationError("The AI couldn't generate a program right now. Please try again.");
        }
    } catch (error) {
        console.error(error);
        setGenerationError("An unexpected error occurred. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveProgram = () => {
      if (generatedProgram) {
          onAddProgram(generatedProgram);
          
          // Set selection state to view the new program
          setSelectedProgram(generatedProgram);
          setSelectedWeekIndex(0);

          // Reset Builder
          setGeneratedProgram(null);
          setWizardStep(1);
          setProgramContext(prev => ({ ...prev, programName: '' }));
          
          setViewMode('PROGRAM_DETAIL');
      }
  };

  const computeExerciseStats = (history: ExercisePerformanceEntry[], name: string): ComputedExerciseStats | null => {
      const entries = history
          .filter(h => h.exerciseName === name)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (entries.length === 0) return null;

      const lastEntry = entries[entries.length - 1];

      // Find Best Perf (PR)
      let bestPerf = { date: '', reps: 0, weight: 0, estimated1RM: 0 };
      entries.forEach(entry => {
          entry.sets.forEach(set => {
              if (set.weight && set.reps && set.weight > 0 && set.reps > 0) {
                  const e1rm = set.weight * (1 + set.reps / 30);
                  if (e1rm > bestPerf.estimated1RM) {
                      bestPerf = {
                          date: entry.date,
                          reps: set.reps,
                          weight: set.weight,
                          estimated1RM: e1rm
                      };
                  }
              }
          });
      });

      // Find Last Perf Top Set
      let lastPerfTopSet = { reps: 0, weight: 0, estimated1RM: 0 };
      lastEntry.sets.forEach(set => {
           if (set.weight && set.reps && set.weight > 0 && set.reps > 0) {
               const e1rm = set.weight * (1 + set.reps / 30);
               if (e1rm > lastPerfTopSet.estimated1RM) {
                   lastPerfTopSet = { reps: set.reps, weight: set.weight, estimated1RM: e1rm };
               }
           }
      });

      return {
          exerciseName: name,
          entries,
          lastPerformance: {
              date: lastEntry.date,
              totalSets: lastEntry.sets.length,
              topSet: lastPerfTopSet.estimated1RM > 0 ? lastPerfTopSet : undefined
          },
          bestPerformance: bestPerf.estimated1RM > 0 ? bestPerf : undefined
      };
  };

  const handleExerciseClick = (name: string) => {
      const stats = computeExerciseStats(exerciseHistory, name);
      if (stats) setSelectedExerciseStats(stats);
  };

  // --- AI PROGRESSION HANDLERS ---
  
  const handleAIAdjustDay = async (program: Program, weekNum: number, day: ProgramDay) => {
    setProgressContext({ programId: program.id, weekNumber: weekNum, dayId: day.id });
    setIsProgressLoading(true);
    
    // Build context from history
    const exercisesContext = (day.exercises || []).map(ex => {
      const recent = exerciseHistory
        .filter(h => h.exerciseName === ex.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(r => ({
           date: r.date,
           setsCompleted: r.sets.length,
           topSetReps: r.sets[0]?.reps,
           topSetWeight: r.sets[0]?.weight,
           estimated1RM: r.bestSetEstimated1RM
        }));

      return {
        name: ex.name,
        muscleGroup: ex.targetMuscle,
        currentSets: ex.sets.length,
        currentReps: ex.sets[0]?.reps || "8",
        recentPerformances: recent
      };
    });

    const request: ProgramDayProgressRequest = {
      programId: program.id,
      weekNumber: weekNum,
      dayId: day.id,
      dayName: day.name,
      goal: program.goal,
      exercises: exercisesContext
    };

    const result = await generateProgressedProgramDay(request);
    if (result) {
      setProgressPreview(result);
    }
    setIsProgressLoading(false);
  };

  const handleApplyProgress = () => {
    if (!selectedProgram || !progressPreview || !selectedProgram.weeks || !progressContext) return;

    // Correctly locate the week and day to update based on the saved context
    const updatedWeeks = selectedProgram.weeks.map(week => {
        if (week.number === progressContext.weekNumber) {
            return {
                ...week,
                days: week.days.map(day => {
                    if (day.id === progressContext.dayId) {
                        return {
                            ...day,
                            name: progressPreview.name,
                            focus: progressPreview.focus,
                            sessionDuration: progressPreview.sessionDuration,
                            exercises: progressPreview.exercises
                        };
                    }
                    return day;
                })
            };
        }
        return week;
    });

    const updatedProgram = {
        ...selectedProgram,
        weeks: updatedWeeks
    };

    onUpdateProgram(updatedProgram);
    setSelectedProgram(updatedProgram); // Update local view state immediately
    setProgressPreview(null);
    setProgressContext(null);
  };

  // Sort and limit recent workouts for display
  const recentWorkouts = [...completedWorkouts]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5);

  // --- SUB-VIEWS ---

  // 1. ACTIVE SESSION (USING NEW SCREEN)
  if (viewMode === 'ACTIVE_SESSION' && activeSession) {
    return (
        <ActiveWorkoutScreen 
            initialSession={activeSession} 
            exerciseHistory={exerciseHistory}
            onFinish={handleSessionFinished}
        />
    );
  }

  // 2. WORKOUT SUMMARY (NEW)
  if (viewMode === 'SUMMARY' && lastSessionData) {
      return (
          <WorkoutSummaryScreen 
            workout={lastSessionData.workout}
            prs={lastSessionData.prs}
            history={completedWorkouts}
            onClose={() => setViewMode('LIST')}
          />
      );
  }

  // 3. WORKOUT BUILDER
  if (viewMode === 'BUILDER') {
      return (
          <WorkoutBuilderView 
            initialLibrary={customExercises}
            onBack={() => setViewMode('LIST')}
            onSave={(plan) => {
                onAddPlan(plan);
                setViewMode('LIST');
            }}
            onAddCustomExercise={onAddCustomExercise}
          />
      );
  }

  // 4. SINGLE WORKOUT GENERATOR
  if (viewMode === 'GENERATOR') {
      return (
        <div className="pb-28 pt-6 space-y-6 min-h-screen">
            <div className="flex items-center space-x-2 mb-6">
                <button onClick={() => setViewMode('LIST')} className="p-2 rounded-full hover:bg-surfaceHighlight text-white"><ArrowLeft size={20}/></button>
                <h1 className="text-2xl font-bold text-white">Quick Workout</h1>
            </div>

            <GlassCard className="space-y-8">
                <div>
                    <label className="text-xs text-secondary uppercase tracking-wider font-bold mb-4 block">Primary Goal</label>
                    <div className="grid grid-cols-1 gap-3">
                        {['Build Muscle', 'Increase Strength', 'Lose Fat', 'Athletic Performance'].map(g => (
                            <button 
                                key={g}
                                onClick={() => setGoal(g)}
                                className={`text-sm py-4 px-5 rounded-2xl border text-left transition-all font-medium ${goal === g ? 'bg-white text-black border-white' : 'bg-surfaceHighlight border-border text-white'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-secondary uppercase tracking-wider font-bold mb-4 block">Experience Level</label>
                    <div className="flex justify-between gap-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLevel(l)}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${level === l ? 'bg-white text-black border-white' : 'bg-surfaceHighlight text-secondary border-border'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleGenerateSingle}
                    disabled={isGenerating}
                    className="w-full mt-4 bg-white text-black font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-200 active:scale-[0.98] transition-all flex justify-center items-center"
                >
                    {isGenerating ? <span className="animate-pulse">Building Plan...</span> : 'Generate Workout'}
                </button>
            </GlassCard>
        </div>
      )
  }

  // 5. PROGRAM BUILDER WIZARD
  if (viewMode === 'PROGRAM_BUILDER') {
      return (
          <div className="pb-28 pt-6 space-y-6 min-h-screen animate-in slide-in-from-right">
              <div className="flex items-center space-x-2 mb-6 px-1">
                  <button onClick={() => {
                      if (generatedProgram) {
                          setGeneratedProgram(null);
                          setWizardStep(4);
                      } else if (wizardStep > 1) {
                          setWizardStep(s => s - 1);
                      } else {
                          setViewMode('LIST');
                      }
                  }} className="p-2 rounded-full hover:bg-surfaceHighlight text-white"><ArrowLeft size={20}/></button>
                  <h1 className="text-2xl font-bold text-white">Program Builder</h1>
              </div>

              {/* Progress Indicator (only if not previewing) */}
              {!generatedProgram && (
                <div className="flex justify-between items-center px-4 mb-6 relative">
                    {[1, 2, 3, 4].map(step => (
                        <div key={step} className="flex flex-col items-center z-10">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${wizardStep >= step ? 'bg-white text-black border-white' : 'bg-surfaceHighlight text-secondary border-border'}`}>
                                {step}
                            </div>
                        </div>
                    ))}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-border -z-0 mx-8" />
                </div>
              )}

              {/* Steps */}
              {!generatedProgram && (
                <GlassCard className="space-y-6">
                    {/* Step 1: Goal & Level */}
                    {wizardStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right">
                            <h2 className="text-lg font-bold text-white">Step 1: Goal & Level</h2>
                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Primary Goal</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['Hypertrophy', 'Strength', 'Fat Loss', 'Recomp', 'Endurance'].map(g => (
                                        <button key={g} onClick={() => setProgramContext({...programContext, goal: g})} className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${programContext.goal === g ? 'bg-white text-black border-white' : 'bg-surfaceHighlight border-border text-slate-300'}`}>{g}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Experience Level</label>
                                <div className="flex gap-2">
                                    {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                        <button key={l} onClick={() => setProgramContext({...programContext, level: l})} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${programContext.level === l ? 'bg-white text-black border-white' : 'bg-surfaceHighlight border-border text-secondary'}`}>{l}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setWizardStep(2)} className="w-full py-4 bg-white text-black font-bold rounded-xl mt-2 flex items-center justify-center">Next <ChevronRight size={16} className="ml-1"/></button>
                        </div>
                    )}

                    {/* Step 2: Schedule */}
                    {wizardStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right">
                            <h2 className="text-lg font-bold text-white">Step 2: Schedule</h2>
                            
                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Days per Week: {programContext.daysPerWeek}</label>
                                <div className="flex justify-between items-center gap-4">
                                   <span className="text-xs text-secondary">2</span>
                                   <input type="range" min="2" max="6" step="1" value={programContext.daysPerWeek} onChange={(e) => setProgramContext({...programContext, daysPerWeek: Number(e.target.value)})} className="flex-1 accent-white h-2 bg-surfaceHighlight rounded-full appearance-none"/>
                                   <span className="text-xs text-secondary">6</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Program Duration</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[4, 6, 8, 12].map(w => (
                                        <button key={w} onClick={() => setProgramContext({...programContext, durationWeeks: w})} className={`py-2 rounded-xl text-xs font-bold border transition-all ${programContext.durationWeeks === w ? 'bg-white text-black border-white' : 'bg-surfaceHighlight border-border text-secondary'}`}>{w} wks</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Split Style</label>
                                <select value={programContext.splitStyle} onChange={(e) => setProgramContext({...programContext, splitStyle: e.target.value})} className="w-full bg-surfaceHighlight border border-border text-white rounded-xl p-3 outline-none text-sm">
                                    {['Full Body', 'Upper/Lower', 'Push/Pull/Legs', 'Bro Split', 'Custom'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Session Duration</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[30, 45, 60, 90].map(t => (
                                        <button key={t} onClick={() => setProgramContext({...programContext, timePerSession: t})} className={`py-2 rounded-xl text-xs font-bold border transition-all ${programContext.timePerSession === t ? 'bg-white text-black border-white' : 'bg-surfaceHighlight border-border text-secondary'}`}>{t}m</button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setWizardStep(3)} className="w-full py-4 bg-white text-black font-bold rounded-xl mt-2 flex items-center justify-center">Next <ChevronRight size={16} className="ml-1"/></button>
                        </div>
                    )}

                    {/* Step 3: Equipment & Constraints */}
                    {wizardStep === 3 && (
                         <div className="space-y-6 animate-in slide-in-from-right">
                            <h2 className="text-lg font-bold text-white">Step 3: Details</h2>
                            
                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Equipment Available</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Bodyweight', 'Dumbbells', 'Barbell', 'Machines', 'Cables', 'Kettlebell', 'Bands'].map(eq => (
                                        <button 
                                            key={eq} 
                                            onClick={() => {
                                                const newEq = programContext.equipment.includes(eq) ? programContext.equipment.filter(i => i !== eq) : [...programContext.equipment, eq];
                                                setProgramContext({...programContext, equipment: newEq});
                                            }}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${programContext.equipment.includes(eq) ? 'bg-white text-black border-white' : 'bg-surfaceHighlight border-border text-secondary'}`}
                                        >
                                            {eq}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Constraints / Injuries (Optional)</label>
                                <textarea 
                                    value={programContext.constraints}
                                    onChange={(e) => setProgramContext({...programContext, constraints: e.target.value})}
                                    placeholder="e.g. Lower back pain, no overhead press..."
                                    className="w-full bg-surfaceHighlight border border-border text-white rounded-xl p-3 outline-none focus:border-white h-24 text-sm resize-none"
                                />
                            </div>

                            <button onClick={() => setWizardStep(4)} className="w-full py-4 bg-white text-black font-bold rounded-xl mt-2 flex items-center justify-center">Next <ChevronRight size={16} className="ml-1"/></button>
                         </div>
                    )}

                    {/* Step 4: Finalize */}
                    {wizardStep === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right">
                             <h2 className="text-lg font-bold text-white">Step 4: Finalize</h2>
                             
                             <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Program Name</label>
                                <input 
                                    type="text" 
                                    placeholder={`e.g. ${programContext.goal} ${programContext.splitStyle}`}
                                    value={programContext.programName}
                                    onChange={(e) => setProgramContext({...programContext, programName: e.target.value})}
                                    className="w-full bg-surfaceHighlight border border-border text-white rounded-xl p-3 outline-none focus:border-white text-base font-bold"
                                />
                             </div>

                             <div className="bg-surfaceHighlight/50 p-4 rounded-xl border border-white/5 space-y-2">
                                <p className="text-xs text-secondary uppercase font-bold">Summary</p>
                                <p className="text-sm text-white">
                                    <span className="text-slate-400">Goal:</span> {programContext.goal} • {programContext.level}<br/>
                                    <span className="text-slate-400">Schedule:</span> {programContext.daysPerWeek}d/wk • {programContext.durationWeeks}wks<br/>
                                    <span className="text-slate-400">Split:</span> {programContext.splitStyle}
                                </p>
                             </div>

                             {generationError && (
                                 <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2">
                                     <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                     <p className="text-xs text-red-300">{generationError}</p>
                                 </div>
                             )}

                             <button 
                                onClick={handleGenerateProgram} 
                                disabled={isGenerating} 
                                className="w-full py-4 bg-white text-black font-bold rounded-xl mt-2 flex items-center justify-center shadow-lg shadow-white/10 hover:scale-[1.02] transition-transform"
                             >
                                {isGenerating ? <><Sparkles size={18} className="mr-2 animate-spin"/> Generating...</> : 'Generate Program'}
                             </button>
                        </div>
                    )}
                </GlassCard>
              )}

              {/* Preview */}
              {generatedProgram && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <GlassCard>
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <h2 className="text-2xl font-bold text-white mb-1">{generatedProgram.name}</h2>
                                   <p className="text-sm text-secondary">{generatedProgram.goal} • {generatedProgram.durationWeeks} Weeks</p>
                               </div>
                               <div className="bg-white text-black px-3 py-1 rounded-lg text-xs font-bold">Preview</div>
                           </div>
                           
                           <div className="space-y-6">
                               {(generatedProgram.weeks || []).map((week, wIdx) => (
                                   <div key={wIdx} className="space-y-3">
                                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Week {week.number}</h3>
                                       <div className="space-y-2">
                                           {(week.days || []).map((day, dIdx) => (
                                               <div key={dIdx} className="bg-surfaceHighlight border border-border rounded-xl overflow-hidden">
                                                   <details className="group">
                                                       <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5 transition list-none">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                                    {dIdx + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white">{day.name}</p>
                                                                    <p className="text-xs text-secondary">{day.focus} • {day.sessionDuration}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronDown size={16} className="text-secondary group-open:rotate-180 transition-transform" />
                                                       </summary>
                                                       <div className="px-4 pb-4 pt-0 border-t border-white/5 bg-black/20">
                                                           <div className="space-y-2 mt-3">
                                                               {(day.exercises || []).map((ex, eIdx) => (
                                                                   <div key={eIdx} className="flex justify-between text-xs">
                                                                       <span className="text-slate-300">{ex.name}</span>
                                                                       <span className="text-slate-500">{(ex.sets || []).length} sets</span>
                                                                   </div>
                                                               ))}
                                                           </div>
                                                       </div>
                                                   </details>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               ))}
                           </div>

                           <div className="flex gap-3 mt-8 pt-4 border-t border-white/10">
                               <button 
                                onClick={() => { setGeneratedProgram(null); setWizardStep(4); }} 
                                className="flex-1 py-3.5 rounded-xl border border-border text-white font-bold text-sm hover:bg-white/5"
                               >
                                Back & Adjust
                               </button>
                               <button 
                                onClick={handleSaveProgram} 
                                className="flex-1 py-3.5 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform"
                               >
                                Save Program
                               </button>
                           </div>
                       </GlassCard>
                   </div>
              )}
          </div>
      );
  }

  // 6. PROGRAM DETAIL VIEW
  if (viewMode === 'PROGRAM_DETAIL' && selectedProgram) {
    const validWeeks = (selectedProgram.weeks || []).filter(w => w.days && w.days.length > 0);
    const activeWeek = validWeeks[selectedWeekIndex] || validWeeks[0];

    return (
        <div className="pb-28 pt-6 space-y-6 min-h-screen animate-in slide-in-from-right relative">
            <div className="flex items-center space-x-2 mb-2 px-1">
                <button onClick={() => { setViewMode('LIST'); setSelectedProgram(null); }} className="p-2 rounded-full hover:bg-surfaceHighlight text-white"><ArrowLeft size={20}/></button>
                <h1 className="text-xl font-bold text-white truncate">{selectedProgram.name}</h1>
            </div>

            {/* Week Selector */}
            {validWeeks.length > 0 ? (
                <div className="flex overflow-x-auto gap-2 px-1 pb-2 no-scrollbar">
                    {validWeeks.map((week, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setSelectedWeekIndex(idx)}
                          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${selectedWeekIndex === idx ? 'bg-white text-black border-white' : 'bg-surfaceHighlight text-secondary border-border'}`}
                        >
                            Week {week.number}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="px-4 py-8 text-center text-slate-500 bg-surfaceHighlight rounded-2xl border border-white/5">
                    <p>No valid weeks found in this program.</p>
                </div>
            )}

            {activeWeek && (
                <div className="space-y-4">
                    {activeWeek.days?.map((day) => (
                        <GlassCard key={day.id} className="group relative overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{day.name}</h3>
                                    <p className="text-xs text-accentBlue font-medium">{day.focus}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-xs text-secondary bg-surfaceHighlight px-2 py-1 rounded flex items-center">
                                        <Clock size={12} className="mr-1"/> {day.sessionDuration}
                                    </span>
                                    <button
                                      onClick={() => handleAIAdjustDay(selectedProgram, activeWeek.number, day)}
                                      className="text-[10px] bg-accent/10 border border-accent/20 text-accent px-2 py-1 rounded-full flex items-center gap-1 hover:bg-accent/20 transition"
                                    >
                                        <Sparkles size={10} /> AI Adjust
                                    </button>
                                </div>
                            </div>
                            
                            {/* Exercise List */}
                            <div className="space-y-2 mb-4 flex-1">
                                {(day.exercises || []).length > 0 ? (
                                    day.exercises.map((ex, i) => (
                                        <div key={i} className="text-sm text-slate-300 flex justify-between border-b border-white/5 py-2 last:border-0 items-center">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                               <span className="h-1.5 w-1.5 rounded-full bg-accent/50 flex-shrink-0"></span>
                                               <span className="truncate font-medium">{ex.name}</span>
                                            </div>
                                            <div className="flex gap-3 text-xs text-slate-500 whitespace-nowrap">
                                                <span>{(ex.sets || []).length} sets</span>
                                                <span className="bg-surfaceHighlight px-1.5 py-0.5 rounded text-secondary">{ex.sets?.[0]?.reps || '0'} reps</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-2 text-xs text-secondary text-center italic">No exercises scheduled for this day</div>
                                )}
                            </div>

                            <button 
                              onClick={() => handleStartProgramDay(selectedProgram, day)}
                              className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center hover:bg-gray-200 transition mt-auto"
                            >
                                <Play size={16} fill="black" className="mr-2"/> Start Session
                            </button>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* AI Progression Preview Modal */}
            {(isProgressLoading || progressPreview) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  {isProgressLoading ? (
                      <div className="bg-[#1C1C1E] rounded-2xl p-6 flex flex-col items-center">
                          <Sparkles size={32} className="animate-spin text-accent mb-2" />
                          <p className="text-white font-bold">Adjusting Workout...</p>
                      </div>
                  ) : (
                      <div className="w-full max-w-md bg-[#1C1C1E] border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
                              <h3 className="font-bold text-white flex items-center gap-2">
                                  <Sparkles size={16} className="text-accent" /> AI Suggestion
                              </h3>
                              <button onClick={() => { setProgressPreview(null); setProgressContext(null); }}><X size={20} className="text-secondary" /></button>
                          </div>
                          
                          <div className="p-4 overflow-y-auto space-y-4">
                              <div className="bg-accent/5 p-3 rounded-xl border border-accent/10">
                                  <p className="text-xs text-accent mb-1 font-bold uppercase">Updated Plan</p>
                                  <p className="text-white font-bold">{progressPreview?.name}</p>
                                  <p className="text-xs text-slate-400">{progressPreview?.focus}</p>
                              </div>
                              
                              <div className="space-y-2">
                                  {(progressPreview?.exercises || []).map((ex, i) => (
                                      <div key={i} className="bg-surfaceHighlight p-3 rounded-xl border border-white/5">
                                          <p className="text-sm font-bold text-white">{ex.name}</p>
                                          <div className="flex gap-3 mt-1 text-xs text-slate-300">
                                              <span>{(ex.sets || []).length} Sets</span>
                                              <span>{ex.sets?.[0]?.reps} Reps</span>
                                              <span className="text-slate-500">{ex.sets?.[0]?.weight}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          
                          <div className="p-4 bg-surface border-t border-white/10 flex gap-3">
                              <button onClick={() => { setProgressPreview(null); setProgressContext(null); }} className="flex-1 py-3 rounded-xl text-slate-400 font-bold text-xs hover:text-white">Cancel</button>
                              <button onClick={handleApplyProgress} className="flex-1 py-3 bg-accent text-black rounded-xl font-bold text-xs hover:bg-white">Apply Updates</button>
                          </div>
                      </div>
                  )}
              </div>
            )}
        </div>
    );
  }

  // --- MAIN VIEW: LIST ---
  return (
    <div className="pb-28 pt-6 space-y-8">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Workouts</h1>
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1"><BarChart2 size={18}/> Training Insights</h2>
        
        {/* Horizontal Scroll Container for Stats */}
        <div className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar snap-x">
            
            {/* 1. Volume Chart */}
            <GlassCard className="min-w-[300px] w-[85vw] snap-center">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white">Weekly Volume</h3>
                    <span className="text-xs text-secondary font-medium">Last 7 Days</span>
                </div>
                <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyVolumeData}>
                            <defs>
                                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                cursor={{stroke: 'rgba(255,255,255,0.1)'}}
                                contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="volume" stroke="#FFFFFF" strokeWidth={2} fill="url(#colorVol)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 10}} dy={10}/>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* 2. Muscle Frequency */}
            <GlassCard className="min-w-[260px] w-[70vw] snap-center">
                <h3 className="text-sm font-bold text-white mb-4">Top Muscles</h3>
                <div className="space-y-3">
                    {muscleFreqData.length > 0 ? muscleFreqData.map((m, i) => (
                        <div key={m.muscle}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-white font-medium">{m.muscle}</span>
                                <span className="text-secondary">{m.count} sessions</span>
                            </div>
                            <div className="h-1.5 bg-surfaceHighlight rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-accentBlue rounded-full" 
                                    style={{ width: `${(m.count / Math.max(...muscleFreqData.map(d=>d.count))) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-xs text-secondary italic">No recent data</p>
                    )}
                </div>
            </GlassCard>

            {/* 3. Recent PRs */}
            <GlassCard className="min-w-[260px] w-[70vw] snap-center">
                <h3 className="text-sm font-bold text-white mb-4">Recent Records</h3>
                <div className="space-y-3">
                    {prProgressData.length > 0 ? prProgressData.map((pr, i) => (
                        <div key={pr.name} className="flex justify-between items-center border-b border-white/5 last:border-0 pb-2 last:pb-0">
                             <div>
                                 <p className="text-xs font-bold text-white truncate max-w-[120px]">{pr.name}</p>
                                 <p className="text-[10px] text-secondary">Est. 1RM</p>
                             </div>
                             <div className="text-right">
                                 <p className="text-sm font-bold text-white">{pr.latest} kg</p>
                                 {pr.improvement > 0 && (
                                     <span className="text-[10px] text-accentGreen flex items-center justify-end">
                                         <TrendingUp size={8} className="mr-0.5" /> +{pr.improvement}
                                     </span>
                                 )}
                             </div>
                        </div>
                    )) : (
                         <p className="text-xs text-secondary italic">Log more workouts to see PRs</p>
                    )}
                </div>
            </GlassCard>

        </div>
      </div>

      {/* Programs Section */}
      <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Calendar size={18}/> My Programs</h2>
              <button 
                onClick={() => setViewMode('PROGRAM_BUILDER')} 
                className="text-xs font-bold text-black bg-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-200"
              >
                  <Sparkles size={12} fill="black"/> New Program
              </button>
          </div>
          
          {programs.length === 0 ? (
              <GlassCard className="text-center py-8" onClick={() => setViewMode('PROGRAM_BUILDER')}>
                  <Layers className="mx-auto text-secondary mb-3 opacity-50" size={32}/>
                  <p className="text-white font-bold mb-1">No Active Programs</p>
                  <p className="text-xs text-secondary">Use AI to build a multi-week schedule tailored to your goals.</p>
              </GlassCard>
          ) : (
              <div className="grid grid-cols-1 gap-4">
                  {programs.map(prog => (
                      <GlassCard key={prog.id} onClick={() => { setSelectedProgram(prog); setSelectedWeekIndex(0); setViewMode('PROGRAM_DETAIL'); }}>
                          <div className="flex justify-between items-start">
                              <div>
                                  <h3 className="font-bold text-white text-lg">{prog.name}</h3>
                                  <p className="text-xs text-secondary mt-1">{prog.goal} • {prog.durationWeeks} Weeks</p>
                              </div>
                              <ChevronRight className="text-secondary"/>
                          </div>
                          <div className="mt-4 flex gap-2">
                              {/* Defensive check for weeks array */}
                              {(prog.weeks?.[0]?.days || []).slice(0,3).map((d, i) => (
                                  <div key={i} className="h-1.5 flex-1 bg-surfaceHighlight rounded-full overflow-hidden">
                                      <div className="h-full bg-accentBlue w-0"></div> {/* Progress placeholder */}
                                  </div>
                              ))}
                          </div>
                      </GlassCard>
                  ))}
              </div>
          )}
      </div>

      {/* Standalone Workouts Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Dumbbell size={18}/> Quick Workouts</h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => setViewMode('BUILDER')} 
                    className="flex items-center gap-1 bg-surfaceHighlight border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white hover:bg-white/10 transition"
                >
                    <Hammer size={12} /> Builder
                </button>
                <button onClick={() => setViewMode('GENERATOR')} className="h-8 w-8 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-white hover:bg-white hover:text-black transition">
                    <Plus size={16} />
                </button>
            </div>
        </div>

        {plans.map((plan) => (
          <GlassCard key={plan.id} className="group relative" onClick={() => handleStartWorkout(plan)}>
             <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex space-x-2 mb-2">
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-surfaceHighlight text-secondary uppercase tracking-wide">
                            {plan.difficulty}
                        </span>
                        {plan.tags.includes('Custom') && (
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-white text-black uppercase tracking-wide">
                                Custom
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                    <div className="flex items-center text-xs text-secondary mt-1">
                        <Clock size={12} className="mr-1" /> {plan.duration}
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-surfaceHighlight flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                      <Play size={16} fill="currentColor" />
                  </div>
             </div>

             <div className="space-y-1">
                 {plan.exercises.slice(0, 3).map((ex, i) => (
                     <div key={i} className="text-sm text-slate-400 flex items-center">
                         <div className="h-1 w-1 rounded-full bg-slate-600 mr-2"></div>
                         {ex.name} <span className="text-slate-600 mx-1">•</span> {ex.sets.length} sets
                     </div>
                 ))}
                 {plan.exercises.length > 3 && (
                     <div className="text-xs text-slate-600 pl-3">+{plan.exercises.length - 3} more</div>
                 )}
             </div>
          </GlassCard>
        ))}
        {plans.length === 0 && (
             <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl">
                 No workout plans found. Create one or generate with AI.
             </div>
        )}
      </div>
    </div>
  );
};

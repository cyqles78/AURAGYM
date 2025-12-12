import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { Exercise, WorkoutPlan, CompletedWorkout, ExercisePerformanceEntry, UserProfile } from '../types';

// --- DATA TRANSFORMATION HELPERS ---

const mapExerciseFromDB = (dbEx: any): Exercise => ({
  id: dbEx.id,
  name: dbEx.name,
  targetMuscle: dbEx.target_muscle,
  equipment: dbEx.equipment,
  mechanic: dbEx.mechanic || undefined,
  force: dbEx.force || undefined,
  difficulty: dbEx.difficulty || undefined,
  instructions: dbEx.instructions || [],
  videoUrl: dbEx.video_url || undefined,
  restTimeSeconds: dbEx.rest_time_seconds || 60,
  isCustom: dbEx.is_custom || false,
  sets: [] 
});

const mapExerciseToDB = (ex: Exercise, userId: string) => ({
  user_id: userId,
  name: ex.name,
  target_muscle: ex.targetMuscle,
  equipment: ex.equipment,
  mechanic: ex.mechanic,
  force: ex.force,
  difficulty: ex.difficulty,
  instructions: ex.instructions,
  video_url: ex.videoUrl,
  rest_time_seconds: ex.restTimeSeconds,
  is_custom: true 
});

const mapWorkoutPlanFromDB = (dbPlan: any): WorkoutPlan => ({
  id: dbPlan.id,
  title: dbPlan.title,
  duration: dbPlan.duration,
  difficulty: dbPlan.difficulty,
  description: dbPlan.description || undefined,
  tags: dbPlan.tags || [],
  exercises: dbPlan.exercises || [] 
});

const mapWorkoutPlanToDB = (plan: WorkoutPlan, userId: string) => ({
  user_id: userId,
  title: plan.title,
  description: plan.description,
  duration: plan.duration,
  difficulty: plan.difficulty,
  tags: plan.tags,
  exercises: plan.exercises 
});

const mapProfileFromDB = (dbProfile: any): UserProfile => ({
  name: dbProfile.name || 'User',
  level: dbProfile.level || 1,
  xp: dbProfile.xp || 0,
  nextLevelXp: 1000 * (dbProfile.level || 1), 
  goal: dbProfile.goal || 'General Fitness',
  subscription: dbProfile.subscription === 'Premium' ? 'Premium' : 'Free'
});

// --- HOOKS ---

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []).map(mapExerciseFromDB);
    }
  });
};

export const useWorkouts = () => {
  return useQuery({
    queryKey: ['workout_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapWorkoutPlanFromDB);
    }
  });
};

export const useLogs = () => {
  return useQuery({
    queryKey: ['workout_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((log: any) => ({
        id: log.id,
        completedAt: log.ended_at || log.started_at,
        session: {
          id: log.id,
          startTime: new Date(log.started_at).getTime(),
          endTime: log.ended_at ? new Date(log.ended_at).getTime() : undefined,
          activeDuration: log.active_duration_seconds,
          status: log.status,
          exercises: [] 
        },
        summary: {
          name: log.name || 'Workout',
          totalExercises: 0,
          totalSets: 0,
          estimatedVolume: log.total_volume,
          sourceType: log.plan_id ? 'PLAN' : 'AD_HOC',
          planId: log.plan_id
        }
      } as CompletedWorkout));
    }
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn("Profile fetch error:", error);
        return null; 
      }
      return mapProfileFromDB(data);
    }
  });
};

// --- MUTATIONS ---

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newExercise: Exercise) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('exercises')
        .insert(mapExerciseToDB(newExercise, user.id))
        .select()
        .single();

      if (error) throw error;
      return mapExerciseFromDB(data);
    },
    onSuccess: (data) => {
      // Optimistic update or simple invalidation
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedExercise: Exercise) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('exercises')
        .update(mapExerciseToDB(updatedExercise, user.id))
        .eq('id', updatedExercise.id);

      if (error) throw error;
      return updatedExercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exerciseId: string) => {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);
      if (error) throw error;
      return exerciseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPlan: WorkoutPlan) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('workout_plans')
        .insert(mapWorkoutPlanToDB(newPlan, user.id))
        .select()
        .single();

      if (error) throw error;
      return mapWorkoutPlanFromDB(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workout_plans'] });
    }
  });
};

export const useLogWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workout, performance }: { workout: CompletedWorkout, performance: ExercisePerformanceEntry[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Insert Log Header
      const { data: logData, error: logError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          plan_id: workout.summary.planId || null,
          name: workout.summary.name,
          started_at: new Date(workout.session.startTime).toISOString(),
          ended_at: workout.session.endTime ? new Date(workout.session.endTime).toISOString() : null,
          active_duration_seconds: workout.session.activeDuration,
          status: 'completed',
          total_volume: workout.summary.estimatedVolume
        })
        .select()
        .single();

      if (logError) throw logError;

      // 2. Insert Performance Rows
      if (performance.length > 0) {
        const perfRows = performance.map(p => ({
          user_id: user.id,
          log_id: logData.id,
          exercise_id: p.exerciseId, 
          exercise_name: p.exerciseName,
          target_muscle: p.targetMuscle,
          sets: p.sets,
          best_1rm: p.bestSetEstimated1RM,
          is_pr: p.isPR
        }));

        const { error: perfError } = await supabase
          .from('exercise_performance')
          .insert(perfRows);
        
        if (perfError) throw perfError;
      }

      return logData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); 
    }
  });
};
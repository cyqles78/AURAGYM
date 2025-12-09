
import { useMemo } from 'react';
import { ExercisePerformanceEntry } from '../types';

export interface MuscleStatus {
  name: string;
  lastTrained: string | null; // ISO Date
  recoveryPercentage: number; // 0-100
  hoursSince: number;
  status: 'FATIGUED' | 'RECOVERING' | 'READY';
  color: string;
}

// Configuration for recovery times (in hours)
const RECOVERY_CONFIG: Record<string, number> = {
  Chest: 48,
  Back: 48,
  Legs: 72,
  Quads: 72,
  Hamstrings: 72,
  Calves: 48,
  Shoulders: 48,
  Biceps: 24,
  Triceps: 24,
  Abs: 24,
  Glutes: 48
};

// Mapping generic targets to specific muscles for the heatmap
const MUSCLE_MAPPING: Record<string, string[]> = {
  'Chest': ['Chest'],
  'Back': ['Lats', 'Traps', 'LowerBack'],
  'Legs': ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  'Shoulders': ['Delts'],
  'Arms': ['Biceps', 'Triceps'],
  'Biceps': ['Biceps'],
  'Triceps': ['Triceps'],
  'Abs': ['Abs'],
  'Core': ['Abs']
};

export const useRecoveryStatus = (history: ExercisePerformanceEntry[]) => {
  
  const status = useMemo(() => {
    const now = new Date().getTime();
    const muscleLastTrained: Record<string, number> = {};

    // 1. Find last trained date for each muscle
    history.forEach(entry => {
      const entryTime = new Date(entry.date).getTime();
      // If the entry target maps to multiple specific muscles (e.g. "Legs" -> Quads, Hams), update all
      const targets = MUSCLE_MAPPING[entry.targetMuscle || ''] || [entry.targetMuscle || 'Unknown'];
      
      targets.forEach(muscle => {
        if (!muscleLastTrained[muscle] || entryTime > muscleLastTrained[muscle]) {
          muscleLastTrained[muscle] = entryTime;
        }
      });
    });

    // 2. Calculate status for all known muscle groups
    const result: Record<string, MuscleStatus> = {};
    const allMuscles = ['Chest', 'Lats', 'Traps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Delts', 'Biceps', 'Triceps', 'Abs'];

    let totalRecoveryScore = 0;

    allMuscles.forEach(muscle => {
      const lastTime = muscleLastTrained[muscle];
      const requiredHours = RECOVERY_CONFIG[muscle] || 48; // Default 48h
      
      let percentage = 100;
      let hoursSince = 999;

      if (lastTime) {
        const diffMs = now - lastTime;
        hoursSince = diffMs / (1000 * 60 * 60);
        percentage = Math.min(100, Math.round((hoursSince / requiredHours) * 100));
      }

      let statusStr: MuscleStatus['status'] = 'READY';
      let color = '#30D158'; // Green

      if (percentage < 50) {
        statusStr = 'FATIGUED';
        color = '#FF453A'; // Red
      } else if (percentage < 90) {
        statusStr = 'RECOVERING';
        color = '#FFD60A'; // Yellow
      }

      result[muscle] = {
        name: muscle,
        lastTrained: lastTime ? new Date(lastTime).toISOString() : null,
        recoveryPercentage: percentage,
        hoursSince,
        status: statusStr,
        color
      };

      totalRecoveryScore += percentage;
    });

    // 3. Global Score
    const globalReadiness = Math.round(totalRecoveryScore / allMuscles.length);

    // 4. Recommendation Logic
    const fatiguedMuscles = Object.values(result)
      .filter(m => m.status !== 'READY')
      .sort((a, b) => a.recoveryPercentage - b.recoveryPercentage);

    let recommendation = "You are fully recovered. Perfect day for a heavy compound session or testing PRs.";
    
    if (fatiguedMuscles.length > 0) {
      const worst = fatiguedMuscles[0];
      if (worst.name === 'Quads' || worst.name === 'Hamstrings') {
        recommendation = "Legs are fatigued. Consider an Upper Body Push or Pull focus today.";
      } else if (worst.name === 'Chest' || worst.name === 'Delts') {
        recommendation = "Push muscles need rest. Good day for Legs or Back.";
      } else if (worst.name === 'Lats') {
        recommendation = "Back is recovering. Focus on Pushing movements or Legs.";
      } else {
        recommendation = `Your ${worst.name} is recovering. Focus on other muscle groups.`;
      }
    }

    if (globalReadiness < 40) {
      recommendation = "Systemic fatigue is high. Consider an Active Recovery day, light cardio, or complete rest.";
    }

    return {
      muscleStatus: result,
      globalReadiness,
      recommendation,
      fatiguedCount: fatiguedMuscles.length
    };

  }, [history]);

  return status;
};

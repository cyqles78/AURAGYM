
import { useMemo } from 'react';
import { ExercisePerformanceEntry } from '../types';

export interface MuscleStatus {
  name: string;
  fatigueLevel: number; // 0 (Fresh) to 100+ (Fatigued)
  recoveryPercentage: number; // 100 (Fresh) to 0 (Fatigued)
  status: 'FATIGUED' | 'RECOVERING' | 'READY' | 'PRIME';
  color: string;
}

// Decay rate per hour (Higher = Faster recovery)
// 0.96 implies ~4% recovery per hour. 
// After 24h: 37% fatigue remains. After 48h: 14% remains.
const HOURLY_DECAY_RATE = 0.975; 

// Fatigue added per set (Base unit)
const FATIGUE_PER_SET = 12;

// Mapping: Exercise Name -> Impact on Muscles (0.0 - 1.0 multiplier)
const EXERCISE_IMPACT: Record<string, Record<string, number>> = {
  // LEGS
  'Squat': { 'Quads': 1.0, 'Glutes': 0.7, 'Hamstrings': 0.4, 'LowerBack': 0.4, 'Core': 0.3 },
  'Deadlift': { 'Hamstrings': 1.0, 'LowerBack': 0.9, 'Glutes': 0.8, 'Traps': 0.5, 'Forearms': 0.5 },
  'Leg Press': { 'Quads': 1.0, 'Glutes': 0.4 },
  'Lunges': { 'Quads': 0.8, 'Glutes': 0.8, 'Hamstrings': 0.5 },
  'Leg Extension': { 'Quads': 1.0 },
  'Leg Curl': { 'Hamstrings': 1.0 },
  'Calf Raise': { 'Calves': 1.0 },

  // PUSH
  'Bench Press': { 'Chest': 1.0, 'FrontDelts': 0.6, 'Triceps': 0.4 },
  'Overhead Press': { 'FrontDelts': 1.0, 'SideDelts': 0.6, 'Triceps': 0.5, 'UpperChest': 0.3 },
  'Incline Bench': { 'UpperChest': 1.0, 'FrontDelts': 0.7, 'Triceps': 0.4 },
  'Dips': { 'Triceps': 1.0, 'LowerChest': 0.6, 'FrontDelts': 0.4 },
  'Push Up': { 'Chest': 0.7, 'FrontDelts': 0.4, 'Triceps': 0.3, 'Core': 0.2 },
  'Lateral Raise': { 'SideDelts': 1.0 },
  'Tricep Extension': { 'Triceps': 1.0 },

  // PULL
  'Pull Up': { 'Lats': 1.0, 'Biceps': 0.5, 'RearDelts': 0.4, 'Forearms': 0.4 },
  'Barbell Row': { 'Lats': 0.8, 'Rhomboids': 0.8, 'Biceps': 0.4, 'LowerBack': 0.4 },
  'Lat Pulldown': { 'Lats': 1.0, 'Biceps': 0.4 },
  'Face Pull': { 'RearDelts': 1.0, 'Rhomboids': 0.7, 'SideDelts': 0.3 },
  'Bicep Curl': { 'Biceps': 1.0 },
  'Hammer Curl': { 'Biceps': 0.8, 'Forearms': 0.6 },
  
  // CORE
  'Plank': { 'Core': 1.0 },
  'Crunch': { 'Core': 1.0 },
};

// Fallback mapping for generic target muscles
const GENERIC_MAPPING: Record<string, string[]> = {
  'Chest': ['Chest', 'UpperChest', 'LowerChest'],
  'Back': ['Lats', 'Rhomboids', 'Traps', 'LowerBack'],
  'Legs': ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  'Shoulders': ['FrontDelts', 'SideDelts', 'RearDelts'],
  'Arms': ['Biceps', 'Triceps', 'Forearms'],
  'Abs': ['Core'],
};

export const useRecoveryStatus = (history: ExercisePerformanceEntry[]) => {
  
  const status = useMemo(() => {
    const now = new Date().getTime();
    const muscleFatigue: Record<string, number> = {};

    // Initialize all trackable muscles
    const allMuscles = [
      'Quads', 'Hamstrings', 'Glutes', 'Calves', 
      'Chest', 'UpperChest', 'LowerChest', 
      'Lats', 'Rhomboids', 'Traps', 'LowerBack',
      'FrontDelts', 'SideDelts', 'RearDelts',
      'Biceps', 'Triceps', 'Forearms', 'Core'
    ];
    
    allMuscles.forEach(m => muscleFatigue[m] = 0);

    // Process history chronologically
    // Limit to last 10 days to save performance and relevance
    const cutoff = now - (10 * 24 * 60 * 60 * 1000);
    const recentHistory = history.filter(h => new Date(h.date).getTime() > cutoff);

    recentHistory.forEach(entry => {
      const entryTime = new Date(entry.date).getTime();
      const hoursPassed = (now - entryTime) / (1000 * 60 * 60);
      
      // Calculate Base Fatigue for this entry
      // If we have sets, use them. Default to 3 sets if unknown.
      const setLoad = entry.sets.length > 0 ? entry.sets.length : 3;
      const baseEntryFatigue = setLoad * FATIGUE_PER_SET;

      // Determine Muscles Hit
      let impactMap: Record<string, number> = {};
      
      // 1. Check Specific Exercise Mapping
      // Try exact match or fuzzy match
      const exName = entry.exerciseName;
      const specificMatch = Object.keys(EXERCISE_IMPACT).find(k => exName.includes(k));
      
      if (specificMatch) {
        impactMap = EXERCISE_IMPACT[specificMatch];
      } else {
        // 2. Fallback to Generic Target
        const targets = GENERIC_MAPPING[entry.targetMuscle || ''] || [];
        targets.forEach(m => { impactMap[m] = 1.0; });
        
        // If still nothing, try to guess from name (simple heuristic)
        if (targets.length === 0) {
           if (exName.includes('Press')) { impactMap['Chest'] = 0.5; impactMap['Triceps'] = 0.3; }
           if (exName.includes('Row') || exName.includes('Pull')) { impactMap['Lats'] = 0.5; impactMap['Biceps'] = 0.3; }
           if (exName.includes('Squat') || exName.includes('Leg')) { impactMap['Quads'] = 0.5; }
        }
      }

      // Apply Fatigue with Decay
      // Current Residual Fatigue = Initial * Decay^Hours
      Object.entries(impactMap).forEach(([muscle, multiplier]) => {
        if (muscleFatigue[muscle] !== undefined) {
          const initialFatigue = baseEntryFatigue * multiplier;
          const residualFatigue = initialFatigue * Math.pow(HOURLY_DECAY_RATE, hoursPassed);
          muscleFatigue[muscle] += residualFatigue;
        }
      });
    });

    // Transform to Status Objects
    const result: Record<string, MuscleStatus> = {};
    let totalSystemicFatigue = 0;

    allMuscles.forEach(muscle => {
      const fatigue = muscleFatigue[muscle];
      
      // Cap recovery at 0-100%
      // Assume 100 fatigue is "Totally Fried" (0% recovery)
      const recoveryPct = Math.max(0, Math.min(100, 100 - fatigue));
      
      totalSystemicFatigue += fatigue;

      let statusStr: MuscleStatus['status'] = 'READY';
      let color = '#30D158'; // Green

      if (recoveryPct < 40) {
        statusStr = 'FATIGUED';
        color = '#FF453A'; // Red
      } else if (recoveryPct < 85) {
        statusStr = 'RECOVERING';
        color = '#FFD60A'; // Yellow
      } else if (recoveryPct > 95) {
        statusStr = 'PRIME';
        color = '#0A84FF'; // Blue/Cyan for Peak
      }

      result[muscle] = {
        name: muscle,
        fatigueLevel: fatigue,
        recoveryPercentage: Math.round(recoveryPct),
        status: statusStr,
        color
      };
    });

    // Global Score (Inverse of average fatigue, weighted slightly?)
    // Let's normalize systemic fatigue. 
    // If you did a full body workout yesterday (Fatigue ~ 200 total), readiness might be 50%.
    const normalizedSystemic = Math.min(100, totalSystemicFatigue / 4); 
    const globalReadiness = Math.round(100 - normalizedSystemic);

    // Recommendation Logic
    const sortedMuscles = Object.values(result).sort((a, b) => a.recoveryPercentage - b.recoveryPercentage);
    const mostFatigued = sortedMuscles[0];

    let recommendation = "System fully primed. Go for a PR.";
    
    if (globalReadiness < 30) {
      recommendation = "High systemic fatigue detected. Recommended: Rest Day or Light Mobility.";
    } else if (mostFatigued.recoveryPercentage < 50) {
      if (['Quads', 'Hamstrings', 'Glutes'].includes(mostFatigued.name)) {
        recommendation = `Lower body is recovering (${mostFatigued.name}). Focus on Upper Body or Cardio.`;
      } else if (['Chest', 'FrontDelts', 'Triceps'].includes(mostFatigued.name)) {
        recommendation = "Push muscles fatigued. Ideal time for a Pull day or Legs.";
      } else if (['Lats', 'Rhomboids', 'Biceps'].includes(mostFatigued.name)) {
        recommendation = "Pull chain is tired. Consider Push movements or Legs.";
      } else {
        recommendation = `${mostFatigued.name} needs rest. Train other groups.`;
      }
    }

    return {
      muscleStatus: result,
      globalReadiness,
      recommendation,
      fatiguedCount: sortedMuscles.filter(m => m.recoveryPercentage < 60).length
    };

  }, [history]);

  return status;
};

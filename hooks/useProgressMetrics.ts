import { useState, useEffect, useMemo } from 'react';
import { TimeSeriesDataPoint, MetricSummary, CompletedWorkout, WeightEntry, ExercisePerformanceEntry } from '../types';
import { fetchWeightHistory, fetchWorkoutLog } from '../services/DataService';

export const useProgressMetrics = (
  injectedWeights?: WeightEntry[], 
  injectedExerciseHistory?: ExercisePerformanceEntry[]
) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('Weight');
  const [metricList, setMetricList] = useState<string[]>(['Weight']);
  const [chartData, setChartData] = useState<TimeSeriesDataPoint[]>([]);
  
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<ExercisePerformanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Epley Formula
  const calculate1RM = (weight: number, reps: number) => Math.round(weight * (1 + reps / 30));

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      if (injectedWeights && injectedExerciseHistory) {
         setWeightHistory(injectedWeights);
         setPerformanceHistory(injectedExerciseHistory);
         
         const names = Array.from(new Set(injectedExerciseHistory.map(e => e.exerciseName))).sort();
         setMetricList(['Weight', ...names]);
         setIsLoading(false);
         return;
      }

      try {
        const [weights, workouts] = await Promise.all([
          fetchWeightHistory(),
          fetchWorkoutLog()
        ]);
        setWeightHistory(weights);
        
        // Transform workouts to performance history for unified handling
        const history: ExercisePerformanceEntry[] = [];
        workouts.forEach(w => {
            w.session.exercises.forEach(e => {
                let best1RM = 0;
                e.sets.forEach(s => {
                    if (s.completed && s.weight && s.reps) {
                        const wVal = parseFloat(s.weight);
                        const rVal = parseFloat(s.reps);
                        if (!isNaN(wVal) && !isNaN(rVal) && rVal > 0) {
                             const e1rm = calculate1RM(wVal, rVal);
                             if (e1rm > best1RM) best1RM = e1rm;
                        }
                    }
                });

                if (best1RM > 0) {
                     history.push({
                        id: `${w.id}_${e.id}`,
                        date: w.completedAt.split('T')[0],
                        completedWorkoutId: w.id,
                        exerciseName: e.name,
                        targetMuscle: e.targetMuscle,
                        sets: [], // Not used for this summary
                        bestSetEstimated1RM: best1RM
                    });
                }
            });
        });

        setPerformanceHistory(history);
        
        const names = Array.from(new Set(history.map(e => e.exerciseName))).sort();
        setMetricList(['Weight', ...names]);
        
      } catch (error) {
        console.error("Failed to load progress data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [injectedWeights, injectedExerciseHistory]);

  // Transform Data based on selection
  useEffect(() => {
    let data: TimeSeriesDataPoint[] = [];

    if (selectedMetric === 'Weight') {
        data = weightHistory.map(w => ({
            date: w.date,
            value: w.weight
        }));
    } else {
        const relevant = performanceHistory.filter(e => e.exerciseName === selectedMetric);
        data = relevant.map(e => ({
            date: e.date.includes('T') ? e.date.split('T')[0] : e.date,
            value: e.bestSetEstimated1RM || 0
        })).filter(d => d.value > 0);
    }

    // Sort chronologically
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setChartData(data);

  }, [selectedMetric, weightHistory, performanceHistory]);

  const summary: MetricSummary | null = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const start = chartData[0].value;
    const current = chartData[chartData.length - 1].value;
    const allTimeHigh = Math.max(...chartData.map(d => d.value));
    const change = current - start;
    const percentageChange = start !== 0 ? (change / start) * 100 : 0;

    return {
      current,
      start,
      change,
      percentageChange,
      allTimeHigh
    };
  }, [chartData]);

  return {
    isLoading,
    selectedMetric,
    setSelectedMetric,
    metricList,
    chartData,
    summary
  };
};
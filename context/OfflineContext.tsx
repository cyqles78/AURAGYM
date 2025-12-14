import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CompletedWorkout, ExercisePerformanceEntry } from '../types';

interface OfflineAction {
    id: string;
    type: 'LOG_WORKOUT';
    payload: any;
    createdAt: number;
}

interface OfflineContextType {
    isOnline: boolean;
    queue: OfflineAction[];
    addOfflineAction: (type: 'LOG_WORKOUT', payload: any) => void;
    syncQueue: () => Promise<void>;
    isSyncing: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
    isOnline: true,
    queue: [],
    addOfflineAction: () => { },
    syncQueue: async () => { },
    isSyncing: false,
});

export const OfflineProvider = ({ children }: { children?: React.ReactNode }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [queue, setQueue] = useState<OfflineAction[]>(() => {
        try {
            const stored = localStorage.getItem('auragym_offline_queue');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [isSyncing, setIsSyncing] = useState(false);

    const addOfflineAction = (type: 'LOG_WORKOUT', payload: any) => {
        const action: OfflineAction = {
            id: Date.now().toString() + Math.random(),
            type,
            payload,
            createdAt: Date.now(),
        };
        setQueue(prev => [...prev, action]);
        console.log('📥 Queued offline action:', type, payload.workout?.summary?.name);
    };

    // Logic extracted from useSupabaseData to handle insertion remotely
    const processLogWorkout = async ({ workout, performance, userId }: { workout: CompletedWorkout, performance: ExercisePerformanceEntry[], userId: string }) => {
        // 1. Insert Log Header
        const { data: logData, error: logError } = await supabase
            .from('workout_logs')
            .insert({
                user_id: userId,
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
                user_id: userId,
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
    };

    const syncQueue = async () => {
        if (queue.length === 0 || isSyncing) return;

        setIsSyncing(true);
        console.log('🔄 Syncing offline queue:', queue.length, 'items');

        // Copy queue to process
        const currentQueue = [...queue];
        const remainingQueue: OfflineAction[] = [];

        for (const action of currentQueue) {
            try {
                if (action.type === 'LOG_WORKOUT') {
                    await processLogWorkout(action.payload);
                    console.log('✅ Synced workout:', action.payload.workout.summary.name);
                }
            } catch (error) {
                console.error("❌ Failed to sync action:", action, error);
                remainingQueue.push(action); // Keep failed actions
            }
        }

        setQueue(remainingQueue);
        setIsSyncing(false);

        if (remainingQueue.length === 0) {
            console.log('✅ All offline data synced successfully!');
        }
    };

    // Persist Queue to localStorage
    useEffect(() => {
        localStorage.setItem('auragym_offline_queue', JSON.stringify(queue));
    }, [queue]);

    // Monitor Network Status
    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 Back online! Syncing...');
            setIsOnline(true);
            // Sync after a short delay to ensure connection is stable
            setTimeout(() => syncQueue(), 1000);
        };

        const handleOffline = () => {
            console.log('📴 Offline mode activated');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Try to sync on mount if there's queued data
        if (queue.length > 0 && navigator.onLine) {
            console.log('🔄 Found queued data on mount, syncing...');
            setTimeout(() => syncQueue(), 2000);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // Empty deps - we want this to run once on mount

    return (
        <OfflineContext.Provider value={{ isOnline, queue, addOfflineAction, syncQueue, isSyncing }}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => useContext(OfflineContext);
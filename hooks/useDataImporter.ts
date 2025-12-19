import { useState, useCallback } from 'react';
import { DataTransferService, ConflictResolution, AnalysisResult } from '../services/DataTransferService';
import { supabase } from '../services/supabaseClient';

type ImportStatus = 'IDLE' | 'ANALYZING' | 'RESOLVING' | 'IMPORTING' | 'SUCCESS' | 'ERROR';

interface ImportProgress {
    stage: string;
    percentage: number;
    currentItem?: string;
}

export const useDataImporter = () => {
    const [status, setStatus] = useState<ImportStatus>('IDLE');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [progress, setProgress] = useState<ImportProgress>({ stage: '', percentage: 0 });
    const [error, setError] = useState<string | null>(null);

    const startAnalysis = useCallback(async (file: File) => {
        setStatus('ANALYZING');
        setProgress({ stage: 'Reading backup file...', percentage: 10 });
        setError(null);

        try {
            const content = await file.text();
            setProgress({ stage: 'Analyzing conflicts...', percentage: 40 });

            const results = await DataTransferService.analyzeImport(content);
            setAnalysis(results);

            setProgress({ stage: 'Analysis complete', percentage: 100 });

            // If no conflicts, proceed directly to import
            if (results.conflicts.length === 0) {
                setTimeout(() => executeImport(results, []), 500);
            } else {
                setStatus('RESOLVING');
            }
        } catch (e: any) {
            console.error('Analysis error:', e);
            setError(e.message || 'Failed to analyze backup file');
            setStatus('ERROR');
        }
    }, []);

    const executeImport = async (data: AnalysisResult, resolutions: ConflictResolution[]) => {
        setStatus('IMPORTING');
        setProgress({ stage: 'Preparing import...', percentage: 5 });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication lost during import");

            let currentProgress = 5;
            const totalSteps = 9;
            const stepIncrement = 90 / totalSteps;

            // ========== STEP 1: Import New Exercises ==========
            if (data.newItems.exercises.length > 0) {
                setProgress({
                    stage: `Importing ${data.newItems.exercises.length} new exercises...`,
                    percentage: currentProgress
                });

                const cleanedEx = data.newItems.exercises.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id,
                    sets: typeof rest.sets === 'string' ? rest.sets : JSON.stringify(rest.sets || [])
                }));

                const { error: exError } = await supabase.from('exercises').insert(cleanedEx);
                if (exError) throw new Error(`Exercise import failed: ${exError.message}`);
            }
            currentProgress += stepIncrement;

            // ========== STEP 2: Import New Workout Plans ==========
            if (data.newItems.plans.length > 0) {
                setProgress({
                    stage: `Importing ${data.newItems.plans.length} new workout plans...`,
                    percentage: currentProgress
                });

                const cleanedPlans = data.newItems.plans.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id,
                    exercises: typeof rest.exercises === 'string' ? rest.exercises : JSON.stringify(rest.exercises || [])
                }));

                const { error: planError } = await supabase.from('workout_plans').insert(cleanedPlans);
                if (planError) throw new Error(`Workout plan import failed: ${planError.message}`);
            }
            currentProgress += stepIncrement;

            // ========== STEP 3: Import New Programs ==========
            if (data.newItems.programs.length > 0) {
                setProgress({
                    stage: `Importing ${data.newItems.programs.length} new programs...`,
                    percentage: currentProgress
                });

                const cleanedPrograms = data.newItems.programs.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id,
                    weeks: typeof rest.weeks === 'string' ? rest.weeks : JSON.stringify(rest.weeks || [])
                }));

                const { error: progError } = await supabase.from('programs').insert(cleanedPrograms);
                if (progError) throw new Error(`Program import failed: ${progError.message}`);
            }
            currentProgress += stepIncrement;

            // ========== STEP 4: Import New Recipes ==========
            if (data.newItems.recipes.length > 0) {
                setProgress({
                    stage: `Importing ${data.newItems.recipes.length} new recipes...`,
                    percentage: currentProgress
                });

                const cleanedRecipes = data.newItems.recipes.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id
                }));

                const { error: recipeError } = await supabase.from('recipes').insert(cleanedRecipes);
                if (recipeError) throw new Error(`Recipe import failed: ${recipeError.message}`);
            }
            currentProgress += stepIncrement;

            // ========== STEP 5: Process Conflicts ==========
            if (resolutions.length > 0) {
                setProgress({
                    stage: `Resolving ${resolutions.length} conflicts...`,
                    percentage: currentProgress
                });

                for (const res of resolutions) {
                    const item = data.conflicts.find(c => c.id === res.itemId);
                    if (!item) continue;

                    if (res.type === 'SKIP') continue;

                    const table = res.category === 'exercise' ? 'exercises' :
                        res.category === 'plan' ? 'workout_plans' :
                            res.category === 'program' ? 'programs' : 'recipes';

                    const matchField = res.category === 'exercise' || res.category === 'program' ? 'name' : 'title';
                    const matchVal = item.name || item.title;

                    if (res.type === 'OVERWRITE') {
                        const { id, created_at, user_id, ...updates } = item.importedItem;

                        // Ensure JSON fields are stringified
                        if (table === 'exercises' && updates.sets) {
                            updates.sets = typeof updates.sets === 'string' ? updates.sets : JSON.stringify(updates.sets);
                        }
                        if (table === 'workout_plans' && updates.exercises) {
                            updates.exercises = typeof updates.exercises === 'string' ? updates.exercises : JSON.stringify(updates.exercises);
                        }
                        if (table === 'programs' && updates.weeks) {
                            updates.weeks = typeof updates.weeks === 'string' ? updates.weeks : JSON.stringify(updates.weeks);
                        }

                        const { error: updateError } = await supabase
                            .from(table)
                            .update(updates)
                            .eq(matchField, matchVal)
                            .eq('user_id', user.id);

                        if (updateError) throw new Error(`Update failed for ${matchVal}: ${updateError.message}`);
                    } else if (res.type === 'KEEP_BOTH') {
                        const { id, created_at, ...newData } = item.importedItem;
                        const renamed = {
                            ...newData,
                            [matchField]: `${matchVal} (Imported)`,
                            user_id: user.id
                        };

                        // Ensure JSON fields are stringified
                        if (table === 'exercises' && renamed.sets) {
                            renamed.sets = typeof renamed.sets === 'string' ? renamed.sets : JSON.stringify(renamed.sets);
                        }
                        if (table === 'workout_plans' && renamed.exercises) {
                            renamed.exercises = typeof renamed.exercises === 'string' ? renamed.exercises : JSON.stringify(renamed.exercises);
                        }
                        if (table === 'programs' && renamed.weeks) {
                            renamed.weeks = typeof renamed.weeks === 'string' ? renamed.weeks : JSON.stringify(renamed.weeks);
                        }

                        const { error: insertError } = await supabase.from(table).insert(renamed);
                        if (insertError) throw new Error(`Insert failed for ${matchVal}: ${insertError.message}`);
                    }
                }
            }
            currentProgress += stepIncrement;

            // ========== STEP 6: Import Workout Logs ==========
            if (data.newItems.logs.length > 0) {
                setProgress({
                    stage: `Importing ${data.newItems.logs.length} workout logs...`,
                    percentage: currentProgress
                });

                const cleanedLogs = data.newItems.logs.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id
                }));

                const { error: logError } = await supabase.from('workout_logs').insert(cleanedLogs);
                if (logError) throw new Error(`Workout log import failed: ${logError.message}`);
            }
            currentProgress += stepIncrement;

            // ========== STEP 7: Import Food Logs ==========
            if (data.newItems.foodLogs.length > 0) {
                setProgress({
                    stage: `Importing ${data.newItems.foodLogs.length} food logs...`,
                    percentage: currentProgress
                });

                const cleanedFoodLogs = data.newItems.foodLogs.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id
                }));

                const { error: foodError } = await supabase.from('food_logs').insert(cleanedFoodLogs);
                if (foodError) throw new Error(`Food log import failed: ${foodError.message}`);
            }
            currentProgress += stepIncrement;

            // ========== STEP 8: Import Measurements ==========
            if (data.newItems.measurements.length > 0) {
                setProgress({
                    stage: `Importing ${data.newItems.measurements.length} measurements...`,
                    percentage: currentProgress
                });

                const cleanedMeasurements = data.newItems.measurements.map(({ id, created_at, ...rest }: any) => ({
                    ...rest,
                    user_id: user.id
                }));

                const { error: measError } = await supabase.from('measurements').insert(cleanedMeasurements);
                if (measError) throw new Error(`Measurement import failed: ${measError.message}`);
            }
            currentProgress += stepIncrement;

            // ========== FINAL STEP: Complete ==========
            setProgress({ stage: 'Import complete!', percentage: 100 });

            setTimeout(() => {
                setStatus('SUCCESS');
            }, 800);

        } catch (e: any) {
            console.error('Import error:', e);
            setError(e.message || 'Import failed unexpectedly');
            setStatus('ERROR');
        }
    };

    const reset = useCallback(() => {
        setStatus('IDLE');
        setAnalysis(null);
        setProgress({ stage: '', percentage: 0 });
        setError(null);
    }, []);

    return {
        status,
        analysis,
        progress,
        error,
        startAnalysis,
        executeImport,
        reset
    };
};
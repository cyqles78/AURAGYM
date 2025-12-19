import { supabase } from './supabaseClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BackupData {
    version: number;
    timestamp: number;
    appVersion: string;
    metadata: {
        userName: string;
        exportedAt: string;
        itemCounts: {
            exercises: number;
            workoutPlans: number;
            programs: number;
            workoutLogs: number;
            recipes: number;
            foodLogs: number;
        };
    };
    data: {
        profile: any;
        exercises: any[];
        workout_plans: any[];
        programs: any[];
        workout_logs: any[];
        exercise_performance: any[];
        recipes: any[];
        food_logs: any[];
        measurements: any[];
    };
}

export interface ConflictResolution {
    type: 'SKIP' | 'OVERWRITE' | 'KEEP_BOTH';
    itemId: string;
    normalizedName: string;
    category: 'exercise' | 'plan' | 'program' | 'recipe';
}

export interface ConflictItem {
    id: string;
    name?: string;
    title?: string;
    category: 'exercise' | 'plan' | 'program' | 'recipe';
    similarity: number;
    existingItem?: any;
    importedItem: any;
}

export interface AnalysisResult {
    newItems: {
        exercises: any[];
        plans: any[];
        programs: any[];
        logs: any[];
        recipes: any[];
        foodLogs: any[];
        measurements: any[];
    };
    conflicts: ConflictItem[];
    stats: {
        totalItems: number;
        newCount: number;
        conflictCount: number;
        duplicateCount: number;
    };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Normalize a name for comparison (lowercase, trim, remove special chars)
 */
function normalizeName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ');
}

// ============================================================================
// DATA TRANSFER SERVICE
// ============================================================================

export const DataTransferService = {
    /**
     * Export all user-specific data into a JSON file
     */
    async exportUserData(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required for export");

        try {
            // Fetch everything in parallel
            const [
                profile,
                exercises,
                plans,
                programs,
                logs,
                performance,
                recipes,
                foodLogs,
                measurements
            ] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('exercises').select('*').eq('user_id', user.id),
                supabase.from('workout_plans').select('*').eq('user_id', user.id),
                supabase.from('programs').select('*').eq('user_id', user.id),
                supabase.from('workout_logs').select('*').eq('user_id', user.id),
                supabase.from('exercise_performance').select('*').eq('user_id', user.id),
                supabase.from('recipes').select('*').eq('user_id', user.id),
                supabase.from('food_logs').select('*').eq('user_id', user.id),
                supabase.from('measurements').select('*').eq('user_id', user.id)
            ]);

            const backup: BackupData = {
                version: 2,
                timestamp: Date.now(),
                appVersion: '1.0.0',
                metadata: {
                    userName: profile.data?.name || 'Unknown',
                    exportedAt: new Date().toISOString(),
                    itemCounts: {
                        exercises: exercises.data?.length || 0,
                        workoutPlans: plans.data?.length || 0,
                        programs: programs.data?.length || 0,
                        workoutLogs: logs.data?.length || 0,
                        recipes: recipes.data?.length || 0,
                        foodLogs: foodLogs.data?.length || 0
                    }
                },
                data: {
                    profile: profile.data,
                    exercises: exercises.data || [],
                    workout_plans: plans.data || [],
                    programs: programs.data || [],
                    workout_logs: logs.data || [],
                    exercise_performance: performance.data || [],
                    recipes: recipes.data || [],
                    food_logs: foodLogs.data || [],
                    measurements: measurements.data || []
                }
            };

            // Trigger Download
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');

            link.href = url;
            link.download = `auragym_backup_${dateStr}_${timeStr}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Export failed:', error);
            throw new Error(`Export failed: ${error.message}`);
        }
    },

    /**
     * Export data as CSV (simplified format)
     */
    async exportAsCSV(dataType: 'exercises' | 'workouts' | 'logs'): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required for export");

        let csvContent = '';
        let filename = '';

        try {
            if (dataType === 'exercises') {
                const { data } = await supabase.from('exercises').select('*').eq('user_id', user.id);
                csvContent = 'Name,Target Muscle,Equipment,Sets,Reps,Rest Time\n';
                data?.forEach(ex => {
                    const sets = JSON.parse(ex.sets || '[]');
                    csvContent += `"${ex.name}","${ex.target_muscle}","${ex.equipment}",${sets.length},"${sets[0]?.reps || ''}",${ex.rest_time_seconds}\n`;
                });
                filename = 'auragym_exercises.csv';
            } else if (dataType === 'workouts') {
                const { data } = await supabase.from('workout_plans').select('*').eq('user_id', user.id);
                csvContent = 'Title,Duration,Difficulty,Exercise Count\n';
                data?.forEach(plan => {
                    const exercises = JSON.parse(plan.exercises || '[]');
                    csvContent += `"${plan.title}","${plan.duration}","${plan.difficulty}",${exercises.length}\n`;
                });
                filename = 'auragym_workouts.csv';
            } else if (dataType === 'logs') {
                const { data } = await supabase.from('workout_logs').select('*').eq('user_id', user.id);
                csvContent = 'Date,Workout Name,Duration,Total Sets,Volume\n';
                data?.forEach(log => {
                    csvContent += `"${log.started_at}","${log.name}","${log.duration_minutes}",${log.total_sets},${log.estimated_volume || 0}\n`;
                });
                filename = 'auragym_workout_logs.csv';
            }

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error: any) {
            throw new Error(`CSV export failed: ${error.message}`);
        }
    },

    /**
     * Analyze a backup file against current database state with smart conflict detection
     */
    async analyzeImport(fileContent: string): Promise<AnalysisResult> {
        let backup: BackupData;

        try {
            backup = JSON.parse(fileContent);
        } catch (error) {
            throw new Error("Invalid backup file format. Please ensure you're uploading a valid AURAGYM backup file.");
        }

        // Validate backup structure
        if (!backup.version || !backup.data) {
            throw new Error("Invalid backup file structure. This file may be corrupted.");
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        try {
            // Fetch current cloud state for comparison
            const [currEx, currPlans, currPrograms, currRecipes] = await Promise.all([
                supabase.from('exercises').select('*').eq('user_id', user.id),
                supabase.from('workout_plans').select('*').eq('user_id', user.id),
                supabase.from('programs').select('*').eq('user_id', user.id),
                supabase.from('recipes').select('*').eq('user_id', user.id)
            ]);

            const results: AnalysisResult = {
                newItems: {
                    exercises: [],
                    plans: [],
                    programs: [],
                    logs: backup.data.workout_logs || [],
                    recipes: [],
                    foodLogs: backup.data.food_logs || [],
                    measurements: backup.data.measurements || []
                },
                conflicts: [],
                stats: {
                    totalItems: 0,
                    newCount: 0,
                    conflictCount: 0,
                    duplicateCount: 0
                }
            };

            // Smart conflict detection for Exercises
            (backup.data.exercises || []).forEach(importedEx => {
                const importedName = normalizeName(importedEx.name);
                let bestMatch: any = null;
                let bestSimilarity = 0;

                (currEx.data || []).forEach(existingEx => {
                    const similarity = calculateSimilarity(importedName, normalizeName(existingEx.name));
                    if (similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestMatch = existingEx;
                    }
                });

                // Threshold: 0.85 = very similar, likely a duplicate
                if (bestSimilarity >= 0.85) {
                    results.conflicts.push({
                        id: importedEx.id || crypto.randomUUID(),
                        name: importedEx.name,
                        category: 'exercise',
                        similarity: bestSimilarity,
                        existingItem: bestMatch,
                        importedItem: importedEx
                    });
                } else {
                    results.newItems.exercises.push(importedEx);
                }
            });

            // Smart conflict detection for Workout Plans
            (backup.data.workout_plans || []).forEach(importedPlan => {
                const importedTitle = normalizeName(importedPlan.title);
                let bestMatch: any = null;
                let bestSimilarity = 0;

                (currPlans.data || []).forEach(existingPlan => {
                    const similarity = calculateSimilarity(importedTitle, normalizeName(existingPlan.title));
                    if (similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestMatch = existingPlan;
                    }
                });

                if (bestSimilarity >= 0.85) {
                    results.conflicts.push({
                        id: importedPlan.id || crypto.randomUUID(),
                        title: importedPlan.title,
                        category: 'plan',
                        similarity: bestSimilarity,
                        existingItem: bestMatch,
                        importedItem: importedPlan
                    });
                } else {
                    results.newItems.plans.push(importedPlan);
                }
            });

            // Smart conflict detection for Programs
            (backup.data.programs || []).forEach(importedProgram => {
                const importedName = normalizeName(importedProgram.name);
                let bestMatch: any = null;
                let bestSimilarity = 0;

                (currPrograms.data || []).forEach(existingProgram => {
                    const similarity = calculateSimilarity(importedName, normalizeName(existingProgram.name));
                    if (similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestMatch = existingProgram;
                    }
                });

                if (bestSimilarity >= 0.85) {
                    results.conflicts.push({
                        id: importedProgram.id || crypto.randomUUID(),
                        name: importedProgram.name,
                        category: 'program',
                        similarity: bestSimilarity,
                        existingItem: bestMatch,
                        importedItem: importedProgram
                    });
                } else {
                    results.newItems.programs.push(importedProgram);
                }
            });

            // Smart conflict detection for Recipes
            (backup.data.recipes || []).forEach(importedRecipe => {
                const importedTitle = normalizeName(importedRecipe.title);
                let bestMatch: any = null;
                let bestSimilarity = 0;

                (currRecipes.data || []).forEach(existingRecipe => {
                    const similarity = calculateSimilarity(importedTitle, normalizeName(existingRecipe.title));
                    if (similarity > bestSimilarity) {
                        bestSimilarity = similarity;
                        bestMatch = existingRecipe;
                    }
                });

                if (bestSimilarity >= 0.85) {
                    results.conflicts.push({
                        id: importedRecipe.id || crypto.randomUUID(),
                        title: importedRecipe.title,
                        category: 'recipe',
                        similarity: bestSimilarity,
                        existingItem: bestMatch,
                        importedItem: importedRecipe
                    });
                } else {
                    results.newItems.recipes.push(importedRecipe);
                }
            });

            // Calculate stats
            results.stats.totalItems =
                (backup.data.exercises?.length || 0) +
                (backup.data.workout_plans?.length || 0) +
                (backup.data.programs?.length || 0) +
                (backup.data.recipes?.length || 0);

            results.stats.newCount =
                results.newItems.exercises.length +
                results.newItems.plans.length +
                results.newItems.programs.length +
                results.newItems.recipes.length;

            results.stats.conflictCount = results.conflicts.length;
            results.stats.duplicateCount = results.conflicts.filter(c => c.similarity === 1).length;

            return results;
        } catch (error: any) {
            console.error('Analysis failed:', error);
            throw new Error(`Analysis failed: ${error.message}`);
        }
    },

    /**
     * Get backup file info without full analysis
     */
    async getBackupInfo(fileContent: string): Promise<BackupData['metadata']> {
        try {
            const backup: BackupData = JSON.parse(fileContent);
            return backup.metadata;
        } catch (error) {
            throw new Error("Unable to read backup file information");
        }
    }
};
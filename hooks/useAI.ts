import { useState, useCallback } from 'react';
import { AIService, AIError } from '../services/ai';
import { RecipePreferences, ProgramContextInput, MealPlanInput } from '../services/geminiService';
import { getOfflineRecipe } from '../services/offlineRecipes';
import { generateLocalProgram } from '../utils/programGenerator';

export const useAI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateRecipe = useCallback(async (prefs: RecipePreferences) => {
        setIsLoading(true);
        setError(null);
        try {
            const recipe = await AIService.generateRecipe(prefs);
            if (!recipe) return getOfflineRecipe(prefs.mealType, prefs.diet, prefs.calories);
            return recipe;
        } catch (e) {
            const msg = e instanceof AIError ? e.message : "AI generation failed";
            console.error("AI Error, falling back to local:", msg);
            return getOfflineRecipe(prefs.mealType, prefs.diet, prefs.calories);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateProgram = useCallback(async (ctx: ProgramContextInput) => {
        setIsLoading(true);
        setError(null);
        try {
            const program = await AIService.generateProgram(ctx);
            if (!program) throw new Error("AI returned empty");
            return program;
        } catch (e) {
            console.warn("AI failed, generating local program template...");
            return generateLocalProgram({
                goal: ctx.goal,
                daysPerWeek: ctx.daysPerWeek,
                durationWeeks: ctx.durationWeeks,
                level: ctx.level,
                programName: ctx.programName
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        generateRecipe,
        generateProgram
    };
};
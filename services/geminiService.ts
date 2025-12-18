
import { 
  WorkoutPlan, 
  Recipe, 
  Program, 
  ProgramDayProgressRequest, 
  ProgramDayProgressResult, 
  WeeklyMealPlan, 
  RecipePreferences, 
  ProgramContextInput, 
  MealPlanInput 
} from "../types";
import { AIService } from "./ai/AIService";
import { getOfflineRecipe } from "./offlineRecipes";

// Fix: Export types so that other modules (like FoodView, MealPlanGeneratorScreen, and useAI) can correctly import them from this service module
export type { 
  WorkoutPlan, 
  Recipe, 
  Program, 
  ProgramDayProgressRequest, 
  ProgramDayProgressResult, 
  WeeklyMealPlan, 
  RecipePreferences, 
  ProgramContextInput, 
  MealPlanInput 
};

/**
 * AI-powered Workout Generation
 */
export const generateAIWorkout = async (userGoal: string, level: string, equipment: string): Promise<WorkoutPlan | null> => {
  try {
    return await AIService.generateWorkout(userGoal, level, equipment);
  } catch (error) {
    console.error("Failed to generate AI workout:", error);
    return null;
  }
};

/**
 * AI-powered Recipe Generation with Offline Fallback
 */
export const generateAIRecipe = async (prefs: RecipePreferences): Promise<Recipe | null> => {
  try {
    const recipe = await AIService.generateRecipe(prefs);
    if (!recipe) throw new Error("AI returned empty recipe");
    return recipe;
  } catch (error) {
    console.warn("AI Recipe generation failed, falling back to offline content:", error);
    return getOfflineRecipe(prefs.mealType, prefs.diet, prefs.calories);
  }
};

/**
 * AI-powered Training Program Generation
 */
export const generateAIProgram = async (ctx: ProgramContextInput): Promise<Program | null> => {
  try {
    return await AIService.generateProgram(ctx);
  } catch (error) {
    console.error("Failed to generate AI program:", error);
    return null;
  }
};

/**
 * Progressive Overload AI Adjustment
 */
export const generateProgressedProgramDay = async (req: ProgramDayProgressRequest): Promise<ProgramDayProgressResult | null> => {
  try {
    return await AIService.generateProgressedDay(req);
  } catch (error) {
    console.error("Failed to calculate AI progression:", error);
    return null;
  }
};

/**
 * AI Weekly Meal Planning
 */
export const generateMealPlan = async (goals: MealPlanInput): Promise<WeeklyMealPlan | null> => {
  try {
    return await AIService.generateMealPlan(goals);
  } catch (error) {
    console.error("Failed to generate AI meal plan:", error);
    return null;
  }
};

/**
 * AI Exercise Enrichment (Details for custom exercises)
 */
export const suggestExerciseDetails = async (name: string): Promise<{ targetMuscle: string; equipment: string } | null> => {
  try {
    return await AIService.suggestExerciseDetails(name);
  } catch (error) {
    console.error("Failed to suggest exercise details:", error);
    return null;
  }
};

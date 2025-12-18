import { 
    Recipe, 
    WorkoutPlan, 
    WeeklyMealPlan, 
    Program, 
    ProgramDayProgressRequest, 
    ProgramDayProgressResult,
    RecipePreferences, 
    ProgramContextInput, 
    MealPlanInput 
} from '../../types';
import { IAIService } from './types';

export class MockAdapter implements IAIService {
    async generateRecipe(prefs: RecipePreferences): Promise<Recipe | null> {
        return {
            id: 'mock-recipe',
            title: `Mock ${prefs.diet} ${prefs.mealType}`,
            calories: prefs.calories,
            protein: Math.round(prefs.calories * 0.1),
            carbs: Math.round(prefs.calories * 0.1),
            fats: Math.round(prefs.calories * 0.05),
            prepTime: '15 min',
            ingredients: ['Sample Ingredient 1', 'Sample Ingredient 2'],
            steps: ['Prepare ingredients.', 'Cook until ready.', 'Serve and enjoy.'],
            tags: [prefs.diet, prefs.mealType]
        };
    }

    async generateWorkout(userGoal: string, level: string, equipment: string): Promise<WorkoutPlan | null> {
        return {
            id: 'mock-workout',
            title: `${userGoal} Session`,
            duration: '45 min',
            difficulty: 'Intermediate',
            exercises: [],
            tags: ['AI Fallback', level]
        };
    }

    async generateMealPlan(goals: MealPlanInput): Promise<WeeklyMealPlan | null> {
        return {
            planId: 'mock-plan',
            dateGenerated: new Date().toISOString(),
            days: []
        };
    }

    async generateProgram(ctx: ProgramContextInput): Promise<Program | null> {
        return {
            id: 'mock-program',
            name: ctx.programName,
            goal: ctx.goal,
            durationWeeks: ctx.durationWeeks,
            daysPerWeek: ctx.daysPerWeek,
            createdAt: new Date().toISOString(),
            weeks: []
        };
    }

    async generateProgressedDay(req: ProgramDayProgressRequest): Promise<ProgramDayProgressResult | null> {
        return null;
    }

    async suggestExerciseDetails(name: string): Promise<{ targetMuscle: string; equipment: string } | null> {
        return { targetMuscle: 'Full Body', equipment: 'None' };
    }

    async healthCheck(): Promise<boolean> {
        return true;
    }
}
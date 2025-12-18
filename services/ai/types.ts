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

export class AIError extends Error {
    constructor(public message: string, public code?: string, public retryable: boolean = true) {
        super(message);
        this.name = 'AIError';
    }
}

export interface IAIService {
    generateRecipe(prefs: RecipePreferences): Promise<Recipe | null>;
    generateWorkout(userGoal: string, level: string, equipment: string): Promise<WorkoutPlan | null>;
    generateMealPlan(goals: MealPlanInput): Promise<WeeklyMealPlan | null>;
    generateProgram(ctx: ProgramContextInput): Promise<Program | null>;
    generateProgressedDay(req: ProgramDayProgressRequest): Promise<ProgramDayProgressResult | null>;
    suggestExerciseDetails(name: string): Promise<{ targetMuscle: string; equipment: string } | null>;
    healthCheck(): Promise<boolean>;
}
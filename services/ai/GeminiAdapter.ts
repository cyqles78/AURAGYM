// Fix: Using the correct @google/genai library and following the updated initialization and generation patterns
import { GoogleGenAI, Type } from "@google/genai";
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
import { IAIService, AIError } from './types';

export class GeminiAdapter implements IAIService {
    // Fix: Guideline requires using process.env.API_KEY exclusively.
    // Fix: Initialization is performed within each method to ensure the most up-to-date key is used.

    private async generate<T>(
        modelName: string,
        prompt: string,
        schema?: any
    ): Promise<T | null> {
        // Fix: Ensure process.env.API_KEY is used directly.
        if (!process.env.API_KEY) {
            throw new AIError(
                "Gemini API key not configured",
                "NO_API_KEY",
                false
            );
        }

        try {
            // Fix: Create a new GoogleGenAI instance right before making an API call.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Fix: Use ai.models.generateContent directly with model name and contents.
            // Fix: Do not define model first and call generate content later.
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    // Fix: Use Type from @google/genai for the schema if provided.
                    responseSchema: schema,
                }
            });

            // Fix: Access .text property directly (not a method).
            const text = response.text;

            if (!text) {
                throw new AIError("Empty response from AI", "EMPTY_RESPONSE", true);
            }

            return JSON.parse(text) as T;
        } catch (error: any) {
            console.error(`Gemini Error [${modelName}]:`, error);

            // Check for quota/rate limit errors
            const isQuota = error.message?.includes('429') ||
                error.message?.includes('quota') ||
                error.message?.includes('RESOURCE_EXHAUSTED');

            // Check for API key errors
            const isAuthError = error.message?.includes('API key') ||
                error.message?.includes('401') ||
                error.message?.includes('403');

            throw new AIError(
                isQuota ? "AI Quota exceeded. Please try again later." :
                    isAuthError ? "Invalid API key. Please check your configuration." :
                        "AI failed to generate response",
                isQuota ? "QUOTA_EXCEEDED" :
                    isAuthError ? "AUTH_ERROR" :
                        "GENERATION_FAILED",
                isQuota // Only quota errors are retryable
            );
        }
    }

    async generateRecipe(prefs: RecipePreferences): Promise<Recipe | null> {
        const prompt = `You are a nutrition expert. Create a detailed ${prefs.diet} ${prefs.mealType} recipe.

Requirements:
- Target calories: ${prefs.calories} kcal
- Include these ingredients: ${prefs.ingredients.join(', ')}
- Diet type: ${prefs.diet}
- Meal type: ${prefs.mealType}

Provide a complete recipe with:
1. A creative title
2. Accurate macros (protein, carbs, fats)
3. Preparation time
4. Detailed ingredient list with quantities
5. Step-by-step cooking instructions
6. Relevant tags

Return ONLY valid JSON matching this structure:
{
  "id": "unique-id",
  "title": "Recipe Name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "prepTime": "XX min",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "steps": ["step 1", "step 2"],
  "tags": ["tag1", "tag2"]
}`;

        // Fix: Use gemini-3-flash-preview for Basic Text Tasks as recommended.
        return this.generate<Recipe>("gemini-3-flash-preview", prompt);
    }

    async generateWorkout(userGoal: string, level: string, equipment: string): Promise<WorkoutPlan | null> {
        const prompt = `You are a certified fitness trainer. Create a workout plan.

Requirements:
- Goal: ${userGoal}
- Experience level: ${level}
- Available equipment: ${equipment}

Provide a complete workout with:
1. A descriptive title
2. Estimated duration
3. Difficulty level
4. List of exercises with sets, reps, and rest periods
5. Relevant tags

Return ONLY valid JSON matching this structure:
{
  "id": "unique-id",
  "title": "Workout Name",
  "duration": "XX min",
  "difficulty": "Beginner|Intermediate|Advanced",
  "exercises": [],
  "tags": ["tag1", "tag2"]
}`;

        // Fix: Use gemini-3-flash-preview for Basic Text Tasks as recommended.
        return this.generate<WorkoutPlan>("gemini-3-flash-preview", prompt);
    }

    async generateMealPlan(goals: MealPlanInput): Promise<WeeklyMealPlan | null> {
        const prompt = `You are a nutrition expert. Create a 7-day meal plan.

Requirements:
- Daily calories: ${goals.calories} kcal
- Daily protein: ${goals.protein}g
- Dietary restrictions: ${goals.restrictions || 'None'}

Provide a complete meal plan with:
1. 7 days of meals (breakfast, lunch, dinner, snacks)
2. Each meal should have calorie and macro information
3. Variety across the week
4. Preparation times

Return ONLY valid JSON matching this structure:
{
  "planId": "unique-id",
  "dateGenerated": "ISO-date-string",
  "days": [
    {
      "dayName": "Monday",
      "meals": [
        {
          "mealType": "Breakfast|Lunch|Dinner|Snack",
          "recipeName": "Meal Name",
          "recipeDetails": {
            "calories": number,
            "protein": number,
            "carbs": number,
            "fats": number
          },
          "preparationTimeMinutes": number,
          "ingredients": ["ingredient1", "ingredient2"]
        }
      ]
    }
  ]
}`;

        // Fix: Use gemini-3-flash-preview for Basic Text Tasks as recommended.
        return this.generate<WeeklyMealPlan>("gemini-3-flash-preview", prompt);
    }

    async generateProgram(ctx: ProgramContextInput): Promise<Program | null> {
        const prompt = `You are an expert strength and conditioning coach. Design a comprehensive training program.

Requirements:
- Program name: ${ctx.programName}
- Goal: ${ctx.goal}
- Experience level: ${ctx.level}
- Duration: ${ctx.durationWeeks} weeks
- Frequency: ${ctx.daysPerWeek} days per week
- Available equipment: ${ctx.equipment.join(', ')}
- Time per session: ${ctx.timePerSession} minutes
- Split style: ${ctx.splitStyle}
- Constraints: ${ctx.constraints || 'None'}

Provide a complete program with:
1. Progressive weekly structure
2. Specific exercises for each day
3. Sets, reps, and rest periods
4. Focus areas for each session

Return ONLY valid JSON matching the Program type structure.`;

        // Fix: Use gemini-3-pro-preview for Complex Text Tasks as recommended.
        return this.generate<Program>("gemini-3-pro-preview", prompt);
    }

    async generateProgressedDay(req: ProgramDayProgressRequest): Promise<ProgramDayProgressResult | null> {
        const prompt = `You are a strength coach. Adjust this workout for progressive overload.

Current workout data:
${JSON.stringify(req, null, 2)}

Based on recent performances, suggest:
1. Updated sets/reps
2. Weight increases where appropriate
3. Exercise variations if needed
4. Maintain the same focus and structure

Return ONLY valid JSON matching the ProgramDayProgressResult type structure.`;

        // Fix: Use gemini-3-flash-preview for text generation tasks.
        return this.generate<ProgramDayProgressResult>("gemini-3-flash-preview", prompt);
    }

    async suggestExerciseDetails(name: string): Promise<{ targetMuscle: string; equipment: string } | null> {
        const prompt = `For the exercise "${name}", suggest the primary target muscle and required equipment.

Return ONLY valid JSON with this exact structure:
{
  "targetMuscle": "Muscle Group",
  "equipment": "Equipment Type"
}

Use these muscle groups: Chest, Back, Quads, Hamstrings, Glutes, Calves, Shoulders, Triceps, Biceps, Forearms, Abs, Cardio, Full Body, Other
Use these equipment types: Barbell, Dumbbell, Machine, Cable, Bodyweight, Kettlebell, Band, Smith Machine, Cardio Machine, Other`;

        // Fix: Correct property Type from correct @google/genai library.
        const schema = {
            type: Type.OBJECT,
            properties: {
                targetMuscle: {
                    type: Type.STRING,
                    description: "Primary muscle group targeted"
                },
                equipment: {
                    type: Type.STRING,
                    description: "Required equipment"
                }
            },
            required: ["targetMuscle", "equipment"]
        };

        // Fix: Use gemini-3-flash-preview for text generation tasks.
        return this.generate<{ targetMuscle: string; equipment: string }>("gemini-3-flash-preview", prompt, schema);
    }

    async healthCheck(): Promise<boolean> {
        try {
            // Fix: Create new instance for each call.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: "Say 'OK'"
            });
            // Fix: Access .text directly.
            return !!result.text;
        } catch (error) {
            console.error("Gemini health check failed:", error);
            return false;
        }
    }
}
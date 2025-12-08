
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutPlan, Recipe, Program, ProgramDayProgressRequest, ProgramDayProgressResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAIWorkout = async (userGoal: string, level: string, equipment: string): Promise<WorkoutPlan | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  const model = "gemini-2.5-flash";
  const prompt = `Create a detailed, high-quality workout plan for a ${level} level user with the goal of "${userGoal}". Available equipment: ${equipment}. 
  Includes specific sets, rep ranges, and rest times.
  Return a strictly valid JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  targetMuscle: { type: Type.STRING },
                  equipment: { type: Type.STRING },
                  restTimeSeconds: { type: Type.INTEGER },
                  notes: { type: Type.STRING },
                  sets: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reps: { type: Type.STRING },
                            weight: { type: Type.STRING },
                            completed: { type: Type.BOOLEAN }
                        }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as WorkoutPlan;

  } catch (error) {
    console.error("Error generating workout:", error);
    return null;
  }
};

export interface RecipePreferences {
  mealType: string;
  diet: string;
  calories: number;
  ingredients: string[];
}

export const generateAIRecipe = async (prefs: RecipePreferences): Promise<Recipe | null> => {
  if (!apiKey) {
      console.error("API Key is missing");
      return null;
  }

  const model = "gemini-2.5-flash";
  const prompt = `You are a Michelin-star fitness chef.

  Create ONE detailed RECIPE in JSON.

  User preferences:
  - Meal type: ${prefs.mealType}
  - Diet style: ${prefs.diet}
  - Target calories: about ${prefs.calories} kcal
  - Must include ingredients: ${prefs.ingredients.join(", ") || "none (chef's choice)"}

  Return a JSON object with this EXACT structure:

  {
    "id": "string",
    "title": "string",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "prepTime": "string",
    "ingredients": string[],
    "steps": string[],
    "tags": string[]
  }

  Strict rules:
  1. calories must be within about ±25% of ${prefs.calories}.
  2. protein, carbs, fats must be realistic positive numbers.
  3. ingredients must be a list of 4–15 human-readable ingredient strings (e.g. "200g Chicken Breast").
  4. steps must be a list of 3–10 short instructions.
  5. Include ALL 'must include' ingredients in the ingredients array.
  6. tags must include: "${prefs.mealType}", "${prefs.diet}".
  7. Respond with JSON ONLY, no extra commentary.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            calories: { type: Type.INTEGER },
            protein: { type: Type.INTEGER },
            carbs: { type: Type.INTEGER },
            fats: { type: Type.INTEGER },
            prepTime: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "calories", "protein", "carbs", "fats", "ingredients", "steps"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    console.log("[AI Recipe raw JSON]", text);
    const recipe = JSON.parse(text) as Recipe;

    // --- Sanity Checks & Post-Processing ---

    // 1. Validate Calories Range (±25%)
    const lower = prefs.calories * 0.75;
    const upper = prefs.calories * 1.25;
    if (recipe.calories < lower || recipe.calories > upper) {
       console.warn(`AI recipe calories (${recipe.calories}) out of range [${lower}-${upper}], adjusting.`);
       recipe.calories = Math.round(Math.min(Math.max(recipe.calories, lower), upper));
    }

    // 2. Ensure Required Ingredients
    if (prefs.ingredients && prefs.ingredients.length > 0) {
        if (!recipe.ingredients) recipe.ingredients = [];
        const existingIngs = recipe.ingredients.map(i => i.toLowerCase());
        
        for (const must of prefs.ingredients) {
            const mustLower = must.toLowerCase();
            // Check if any ingredient string contains the required ingredient
            if (!existingIngs.some(i => i.includes(mustLower))) {
                console.warn(`AI missed required ingredient: ${must}. Adding it.`);
                recipe.ingredients.push(`${must} (added per request)`);
            }
        }
    }

    // 3. Validate Arrays
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length < 3) {
        console.error("AI returned insufficient ingredients");
        return null;
    }
    if (!Array.isArray(recipe.steps) || recipe.steps.length < 3) {
        console.error("AI returned insufficient steps");
        return null;
    }

    // 4. Defaults & Clean-up
    if (!recipe.id) recipe.id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString());
    if (!recipe.title) recipe.title = `${prefs.diet} ${prefs.mealType}`;
    if (!recipe.prepTime) recipe.prepTime = "20 min";
    if (!Array.isArray(recipe.tags)) recipe.tags = [];

    // Ensure tags present
    if (!recipe.tags.includes(prefs.mealType)) recipe.tags.push(prefs.mealType);
    if (!recipe.tags.includes(prefs.diet)) recipe.tags.push(prefs.diet);

    return recipe;

  } catch (error) {
    console.error("Error generating recipe:", error);
    return null;
  }
};

// --- PROGRAM GENERATION ---

export interface ProgramContextInput {
  goal: string;
  level: string;
  equipment: string[];
  timePerSession: number;
  constraints: string;
  daysPerWeek: number;
  durationWeeks: number;
  splitStyle: string;
  programName: string;
}

export const generateAIProgram = async (ctx: ProgramContextInput): Promise<Program | null> => {
  if (!apiKey) return null;

  const model = "gemini-2.5-flash"; // Using flash for larger context generation
  
  // Revised prompt to be more explicit about structure requirements
  const prompt = `You are an expert strength coach.

  Design a fully detailed ${ctx.durationWeeks}-week training PROGRAM in JSON.
  
  User context:
  - Goal: ${ctx.goal}
  - Level: ${ctx.level}
  - Split: ${ctx.splitStyle}
  - Frequency: ${ctx.daysPerWeek} days per week
  - Available equipment: ${ctx.equipment.join(", ") || "Bodyweight only"}
  - Typical session length: ${ctx.timePerSession} minutes
  - Constraints/injuries: ${ctx.constraints || "None"}
  
  Return a JSON object matching this structure exactly (property names and nesting):
  
  Program {
    id: string
    name: string
    description: string
    goal: string
    durationWeeks: number
    daysPerWeek: number
    createdAt: string
    weeks: ProgramWeek[]
  }
  
  ProgramWeek {
    number: number
    days: ProgramDay[]
  }
  
  ProgramDay {
    id: string
    name: string          // e.g. "Upper A", "Lower B"
    focus: string         // e.g. "Chest & Triceps"
    sessionDuration: string // e.g. "60 min"
    exercises: Exercise[]
  }
  
  Exercise {
    id: string
    name: string
    targetMuscle: string
    equipment: string
    restTimeSeconds: number
    notes: string
    sets: WorkoutSet[]
  }
  
  WorkoutSet {
    id: string
    reps: string
    weight: string
    completed: boolean
  }
  
  STRICT RULES:
  
  1. weeks MUST contain exactly ${ctx.durationWeeks} items, with numbers 1..${ctx.durationWeeks}.
  2. Each week.days MUST contain exactly ${ctx.daysPerWeek} days (no empty arrays).
  3. Each ProgramDay.exercises MUST contain between 4 and 8 exercises (no empty arrays).
  4. Each Exercise.sets MUST contain 3–5 sets, with realistic reps (6–15) and weights (can be strings like "bodyweight" or "0" if unknown).
  5. Fill ALL fields with sensible values. Do NOT leave days or exercises empty.
  6. Return ONLY valid JSON matching this schema. No comments, no extra text.`;
  

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            goal: { type: Type.STRING },
            durationWeeks: { type: Type.INTEGER },
            daysPerWeek: { type: Type.INTEGER },
            createdAt: { type: Type.STRING },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        focus: { type: Type.STRING },
                        sessionDuration: { type: Type.STRING },
                        exercises: {
                           type: Type.ARRAY,
                           items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              targetMuscle: { type: Type.STRING },
                              equipment: { type: Type.STRING },
                              restTimeSeconds: { type: Type.INTEGER },
                              notes: { type: Type.STRING },
                              sets: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        reps: { type: Type.STRING },
                                        weight: { type: Type.STRING },
                                        completed: { type: Type.BOOLEAN }
                                    }
                                }
                              }
                            }
                           }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    console.log("[AI Program raw JSON]", text);

    const program = JSON.parse(text) as Program;

    // Validate structure: If weeks or days are missing, consider it a failed generation
    if (!program.weeks || program.weeks.length === 0) {
        console.warn("AI returned no weeks");
        return null;
    }

    const hasEmptyDays = program.weeks.some(w => !w.days || w.days.length === 0);
    if (hasEmptyDays) {
        console.warn("AI returned weeks with no days. Rejecting result.");
        return null;
    }

    if (ctx.programName) program.name = ctx.programName;
    program.createdAt = new Date().toISOString();
    
    return program;

  } catch (error) {
    console.error("Error generating program:", error);
    return null;
  }
};

// --- PROGRESSION GENERATION ---

export const generateProgressedProgramDay = async (req: ProgramDayProgressRequest): Promise<ProgramDayProgressResult | null> => {
  if (!apiKey) return null;

  const model = "gemini-2.5-flash";
  const prompt = `Act as an expert strength coach. Adjust this workout day based on recent performance history to ensure progressive overload.
  
  Context:
  - Program: ${req.programId}
  - Week: ${req.weekNumber}
  - Day: ${req.dayName} (${req.goal})
  
  Exercises & History:
  ${JSON.stringify(req.exercises, null, 2)}
  
  Rules:
  1. If performance is consistent/improving (good 1RM, completed sets), apply progressive overload (increase weight 2.5-5%, OR +1 rep, OR +1 set).
  2. If performance stalled/regressed, maintain or slightly reduce volume/intensity (deload).
  3. If NO history is provided (empty recentPerformances), assume this is a standard linear progression for the next session. You MUST make a slight adjustment to indicate progression (e.g. increase reps by 1-2, or increase weight by 2.5%, or add 1 set).
  4. Do NOT return the exact same values as the current prescription. The user requested an adjustment, so you must provide a logical progression.
  5. Keep the same exercise names unless a variation is absolutely necessary.
  
  Return strictly valid JSON matching ProgramDayProgressResult.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dayId: { type: Type.STRING },
            name: { type: Type.STRING },
            focus: { type: Type.STRING },
            sessionDuration: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  targetMuscle: { type: Type.STRING },
                  equipment: { type: Type.STRING },
                  restTimeSeconds: { type: Type.INTEGER },
                  notes: { type: Type.STRING },
                  sets: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reps: { type: Type.STRING },
                            weight: { type: Type.STRING },
                            completed: { type: Type.BOOLEAN }
                        }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ProgramDayProgressResult;

  } catch (error) {
    console.error("Error generating progression:", error);
    return null;
  }
};

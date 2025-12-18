// Offline Recipe Templates - Used when API is unavailable

import { Recipe } from '../types';

export const RECIPE_TEMPLATES: Record<string, Recipe[]> = {
    // Breakfast recipes
    Breakfast: [
        {
            id: 'breakfast-1',
            title: 'High-Protein Oatmeal Bowl',
            calories: 450,
            protein: 35,
            carbs: 55,
            fats: 12,
            prepTime: '10 min',
            ingredients: [
                '80g Rolled Oats',
                '1 scoop Protein Powder (vanilla)',
                '200ml Almond Milk',
                '1 Banana (sliced)',
                '15g Almonds (chopped)',
                '1 tbsp Honey'
            ],
            steps: [
                'Cook oats with almond milk for 3-4 minutes',
                'Stir in protein powder until smooth',
                'Top with sliced banana and almonds',
                'Drizzle with honey and serve'
            ],
            tags: ['Breakfast', 'High Protein', 'Quick']
        },
        {
            id: 'breakfast-2',
            title: 'Egg White Veggie Scramble',
            calories: 320,
            protein: 32,
            carbs: 28,
            fats: 8,
            prepTime: '12 min',
            ingredients: [
                '6 Egg Whites',
                '100g Spinach',
                '80g Bell Peppers (diced)',
                '50g Mushrooms (sliced)',
                '2 slices Whole Wheat Toast',
                'Salt and Pepper to taste'
            ],
            steps: [
                'Sauté vegetables in a non-stick pan',
                'Add egg whites and scramble until cooked',
                'Season with salt and pepper',
                'Serve with toasted whole wheat bread'
            ],
            tags: ['Breakfast', 'Low Fat', 'Vegetarian']
        }
    ],

    // Lunch recipes
    Lunch: [
        {
            id: 'lunch-1',
            title: 'Grilled Chicken Power Bowl',
            calories: 550,
            protein: 48,
            carbs: 52,
            fats: 14,
            prepTime: '20 min',
            ingredients: [
                '200g Chicken Breast',
                '150g Brown Rice (cooked)',
                '100g Broccoli',
                '80g Cherry Tomatoes',
                '50g Avocado',
                '2 tbsp Olive Oil',
                'Lemon juice and herbs'
            ],
            steps: [
                'Season and grill chicken breast until cooked through',
                'Steam broccoli for 5 minutes',
                'Assemble bowl with rice, chicken, and vegetables',
                'Top with avocado and drizzle with olive oil and lemon'
            ],
            tags: ['Lunch', 'High Protein', 'Balanced']
        },
        {
            id: 'lunch-2',
            title: 'Tuna Quinoa Salad',
            calories: 480,
            protein: 38,
            carbs: 45,
            fats: 16,
            prepTime: '15 min',
            ingredients: [
                '150g Canned Tuna (in water)',
                '120g Quinoa (cooked)',
                '100g Mixed Greens',
                '80g Cucumber (diced)',
                '50g Feta Cheese',
                '2 tbsp Balsamic Vinaigrette'
            ],
            steps: [
                'Cook quinoa according to package instructions',
                'Mix greens, cucumber, and cooled quinoa',
                'Add drained tuna and crumbled feta',
                'Toss with balsamic vinaigrette'
            ],
            tags: ['Lunch', 'High Protein', 'Quick']
        }
    ],

    // Dinner recipes
    Dinner: [
        {
            id: 'dinner-1',
            title: 'Lean Beef Stir-Fry',
            calories: 580,
            protein: 45,
            carbs: 58,
            fats: 18,
            prepTime: '25 min',
            ingredients: [
                '200g Lean Beef (sliced thin)',
                '150g Jasmine Rice (cooked)',
                '150g Mixed Vegetables (bell peppers, snap peas, carrots)',
                '2 cloves Garlic (minced)',
                '2 tbsp Soy Sauce',
                '1 tbsp Sesame Oil'
            ],
            steps: [
                'Cook rice according to package instructions',
                'Stir-fry beef in sesame oil until browned',
                'Add vegetables and garlic, cook for 5 minutes',
                'Add soy sauce and toss everything together',
                'Serve over rice'
            ],
            tags: ['Dinner', 'High Protein', 'Asian']
        },
        {
            id: 'dinner-2',
            title: 'Baked Salmon with Sweet Potato',
            calories: 520,
            protein: 42,
            carbs: 48,
            fats: 18,
            prepTime: '30 min',
            ingredients: [
                '180g Salmon Fillet',
                '200g Sweet Potato',
                '150g Asparagus',
                '1 tbsp Olive Oil',
                'Lemon wedges',
                'Herbs and spices'
            ],
            steps: [
                'Preheat oven to 400°F (200°C)',
                'Cube sweet potato and toss with olive oil',
                'Place salmon and sweet potato on baking sheet',
                'Bake for 20 minutes, add asparagus for last 10 minutes',
                'Serve with lemon wedges'
            ],
            tags: ['Dinner', 'High Protein', 'Omega-3']
        }
    ],

    // Snack recipes
    Snack: [
        {
            id: 'snack-1',
            title: 'Protein Greek Yogurt Parfait',
            calories: 280,
            protein: 28,
            carbs: 32,
            fats: 6,
            prepTime: '5 min',
            ingredients: [
                '200g Greek Yogurt (0% fat)',
                '80g Mixed Berries',
                '30g Granola',
                '1 tbsp Honey',
                '10g Chia Seeds'
            ],
            steps: [
                'Layer Greek yogurt in a glass',
                'Add mixed berries',
                'Top with granola and chia seeds',
                'Drizzle with honey'
            ],
            tags: ['Snack', 'High Protein', 'Quick']
        },
        {
            id: 'snack-2',
            title: 'Protein Energy Balls',
            calories: 240,
            protein: 18,
            carbs: 28,
            fats: 8,
            prepTime: '15 min',
            ingredients: [
                '1 scoop Protein Powder',
                '80g Rolled Oats',
                '30g Peanut Butter',
                '20g Honey',
                '20g Dark Chocolate Chips',
                '1 tbsp Chia Seeds'
            ],
            steps: [
                'Mix all ingredients in a bowl',
                'Roll into 8-10 small balls',
                'Refrigerate for 30 minutes',
                'Store in airtight container for up to 1 week'
            ],
            tags: ['Snack', 'High Protein', 'Meal Prep']
        }
    ]
};

// Diet-specific templates
export const DIET_TEMPLATES: Record<string, Recipe[]> = {
    Vegan: [
        {
            id: 'vegan-1',
            title: 'Chickpea Buddha Bowl',
            calories: 480,
            protein: 22,
            carbs: 68,
            fats: 14,
            prepTime: '20 min',
            ingredients: [
                '200g Chickpeas (cooked)',
                '150g Quinoa (cooked)',
                '100g Kale',
                '80g Sweet Potato (roasted)',
                '50g Tahini Dressing',
                '20g Pumpkin Seeds'
            ],
            steps: [
                'Roast chickpeas with spices at 400°F for 20 minutes',
                'Cook quinoa and massage kale with lemon',
                'Roast sweet potato cubes',
                'Assemble bowl and drizzle with tahini',
                'Top with pumpkin seeds'
            ],
            tags: ['Vegan', 'High Protein', 'Balanced']
        }
    ],
    'Low Carb': [
        {
            id: 'lowcarb-1',
            title: 'Keto Chicken Avocado Salad',
            calories: 520,
            protein: 45,
            carbs: 12,
            fats: 35,
            prepTime: '15 min',
            ingredients: [
                '200g Grilled Chicken',
                '1 whole Avocado',
                '100g Mixed Greens',
                '50g Cherry Tomatoes',
                '30g Parmesan Cheese',
                '3 tbsp Olive Oil Dressing'
            ],
            steps: [
                'Grill or use pre-cooked chicken',
                'Slice avocado and halve tomatoes',
                'Toss greens with olive oil dressing',
                'Top with chicken, avocado, and parmesan'
            ],
            tags: ['Low Carb', 'Keto', 'High Protein']
        }
    ],
    'High Protein': [
        {
            id: 'highprotein-1',
            title: 'Double Protein Power Meal',
            calories: 620,
            protein: 68,
            carbs: 48,
            fats: 16,
            prepTime: '25 min',
            ingredients: [
                '200g Chicken Breast',
                '150g Cottage Cheese',
                '150g Brown Rice',
                '100g Broccoli',
                '2 Egg Whites',
                'Spices and herbs'
            ],
            steps: [
                'Grill chicken breast with seasonings',
                'Cook brown rice',
                'Steam broccoli',
                'Scramble egg whites',
                'Serve chicken over rice with cottage cheese and vegetables'
            ],
            tags: ['High Protein', 'Bodybuilding', 'Muscle Gain']
        }
    ]
};

// Function to get a random recipe based on preferences
export function getOfflineRecipe(mealType: string, diet: string, targetCalories: number): Recipe {
    // Try to get diet-specific recipe first
    let recipes: Recipe[] = [];

    if (diet !== 'Balanced' && DIET_TEMPLATES[diet]) {
        recipes = DIET_TEMPLATES[diet];
    } else if (RECIPE_TEMPLATES[mealType]) {
        recipes = RECIPE_TEMPLATES[mealType];
    } else {
        // Fallback to any recipe
        recipes = Object.values(RECIPE_TEMPLATES).flat();
    }

    // Find recipe closest to target calories
    const sorted = recipes.sort((a, b) =>
        Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories)
    );

    // Get the closest match and adjust calories if needed
    const recipe = { ...sorted[0] };

    // Adjust calories to be closer to target (within 20%)
    const calorieRatio = targetCalories / recipe.calories;
    if (calorieRatio > 0.8 && calorieRatio < 1.2) {
        recipe.calories = Math.round(recipe.calories * calorieRatio);
        recipe.protein = Math.round(recipe.protein * calorieRatio);
        recipe.carbs = Math.round(recipe.carbs * calorieRatio);
        recipe.fats = Math.round(recipe.fats * calorieRatio);
    }

    // Add diet tag if not present
    if (!recipe.tags.includes(diet)) {
        recipe.tags.push(diet);
    }

    // Generate unique ID
    recipe.id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return recipe;
}

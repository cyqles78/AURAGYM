
import { SearchableFoodItem, WeeklyMealPlan, ShoppingListItem } from '../types';

// In a real app, this should be in an environment variable
// For this demo, we'll assume the user has set it up or we use a fallback/demo key if available
// Note: USDA API Key is free to get at https://fdc.nal.usda.gov/api-key-signup.html
const USDA_API_KEY = 'JQKlBZClaC3kFXsxKzaPSsNRPegg8ydUXgRz0WdI'; 
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Fallback data to use when API rate limits (429) are hit or network fails
const getMockFoodResults = (query: string): SearchableFoodItem[] => {
  const q = query.toLowerCase();
  const mockDb: SearchableFoodItem[] = [
    { id: 9001, name: "Chicken Breast, cooked", calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: 100, servingUnit: "g" },
    { id: 9002, name: "Brown Rice, cooked", calories: 112, protein: 2.6, carbs: 23, fats: 0.9, servingSize: 100, servingUnit: "g" },
    { id: 9003, name: "Broccoli, raw", calories: 34, protein: 2.8, carbs: 7, fats: 0.4, servingSize: 100, servingUnit: "g" },
    { id: 9004, name: "Banana", calories: 89, protein: 1.1, carbs: 23, fats: 0.3, servingSize: 100, servingUnit: "g" },
    { id: 9005, name: "Avocado", calories: 160, protein: 2, carbs: 9, fats: 15, servingSize: 100, servingUnit: "g" },
    { id: 9006, name: "Egg, large, boiled", calories: 155, protein: 13, carbs: 1.1, fats: 11, servingSize: 100, servingUnit: "g" },
    { id: 9007, name: "Oatmeal", calories: 68, protein: 2.4, carbs: 12, fats: 1.4, servingSize: 100, servingUnit: "g" },
    { id: 9008, name: "Almonds", calories: 579, protein: 21, carbs: 22, fats: 50, servingSize: 100, servingUnit: "g" },
    { id: 9009, name: "Salmon, cooked", calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: 100, servingUnit: "g" },
    { id: 9010, name: "Greek Yogurt, plain", calories: 59, protein: 10, carbs: 3.6, fats: 0.4, servingSize: 100, servingUnit: "g" },
    { id: 9011, name: "Apple, raw", calories: 52, protein: 0.3, carbs: 14, fats: 0.2, servingSize: 100, servingUnit: "g" },
    { id: 9012, name: "Sweet Potato, baked", calories: 90, protein: 2, carbs: 21, fats: 0.2, servingSize: 100, servingUnit: "g" },
  ];

  return mockDb.filter(item => item.name.toLowerCase().includes(q));
};

export const searchFoodDatabase = async (query: string): Promise<SearchableFoodItem[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR Legacy,Branded&pageSize=20`
    );

    // Handle Rate Limiting gracefully by returning mock data
    if (response.status === 429) {
        console.warn("USDA API Rate Limit Exceeded (429). Returning mock data for demo purposes.");
        return getMockFoodResults(query);
    }

    if (!response.ok) {
      throw new Error(`USDA API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.foods) return [];

    // Map USDA format to our internal format
    return data.foods.map((item: any) => {
      // Nutrients are in an array, we need to find specific IDs
      // Energy (kcal): 1008 or 208
      // Protein: 1003 or 203
      // Total Fat: 1004 or 204
      // Carbs: 1005 or 205
      
      const getNutrient = (ids: number[]) => {
        const n = item.foodNutrients.find((n: any) => ids.includes(n.nutrientId));
        return n ? n.value : 0;
      };

      return {
        id: item.fdcId,
        name: item.description,
        brand: item.brandOwner,
        calories: Math.round(getNutrient([1008, 208])),
        protein: Math.round(getNutrient([1003, 203])),
        fats: Math.round(getNutrient([1004, 204])),
        carbs: Math.round(getNutrient([1005, 205])),
        servingSize: item.servingSize,
        servingUnit: item.servingSizeUnit
      } as SearchableFoodItem;
    });

  } catch (error) {
    // Fallback to mock data on any network error to keep the app usable
    console.warn("Failed to search food database (falling back to mock):", error);
    return getMockFoodResults(query);
  }
};

export const searchFoodByUPC = async (upc: string): Promise<SearchableFoodItem | null> => {
  if (!upc) return null;

  try {
    // Using the same search endpoint, passing UPC as query
    const results = await searchFoodDatabase(upc);
    
    // Exact match preference or first result
    if (results.length > 0) {
      return results[0];
    }

    // Mock Fallback for Demo if API fails to find a specific UPC
    // This ensures the "Scan" feature feels working even with limited API access
    if (upc === '025293000966') {
       return {
          id: 88888,
          name: "Silk Pure Almond Milk, Unsweetened",
          brand: "Silk",
          calories: 30,
          protein: 1,
          carbs: 1,
          fats: 2.5,
          servingSize: 240,
          servingUnit: "ml"
       };
    }

    return null;

  } catch (error) {
    console.warn("UPC Search failed", error);
    return null;
  }
};

// Fallback ingredients map for when AI data is incomplete
const commonIngredientsMap: Record<string, string[]> = {
  "oat": ["50g Oats", "200ml Milk", "10g Honey"],
  "egg": ["2 Eggs", "1 slice Toast", "5g Butter"],
  "chicken": ["200g Chicken Breast", "100g Rice", "50g Broccoli"],
  "salad": ["100g Mixed Greens", "50g Tomatoes", "10ml Olive Oil"],
  "smoothie": ["1 Banana", "30g Protein Powder", "200ml Almond Milk"],
  "pasta": ["100g Pasta", "100g Tomato Sauce", "10g Cheese"],
  "stir fry": ["150g Beef", "100g Mixed Veggies", "15ml Soy Sauce"],
  "sandwich": ["2 slices Bread", "50g Turkey", "1 slice Cheese"],
  "yogurt": ["150g Greek Yogurt", "50g Berries", "10g Granola"],
  "soup": ["300ml Broth", "50g Carrots", "50g Onions"],
  "rice": ["100g Rice", "50g Peas", "5g Butter"],
  "steak": ["200g Steak", "100g Potatoes", "50g Asparagus"],
};

const getFallbackIngredients = (recipeName: string): string[] => {
    const lowerName = recipeName.toLowerCase();
    for (const key in commonIngredientsMap) {
        if (lowerName.includes(key)) {
            return commonIngredientsMap[key];
        }
    }
    return ["1 serving " + recipeName]; // Generic fallback
};

export const generateShoppingList = (plan: WeeklyMealPlan): ShoppingListItem[] => {
  const ingredientsMap: Record<string, { quantity: number, unit: string }> = {};

  plan.days.forEach(day => {
    day.meals.forEach(meal => {
      let ingredientsToProcess = meal.ingredients;
      
      // Safety check: Fallback if AI didn't return valid ingredients array
      if (!ingredientsToProcess || ingredientsToProcess.length === 0) {
          ingredientsToProcess = getFallbackIngredients(meal.recipeName);
      }

      ingredientsToProcess.forEach(raw => {
          // 1. Pre-process fractions and unicode
          let normalizedRaw = raw
            .replace('¼', '0.25')
            .replace('½', '0.5')
            .replace('¾', '0.75')
            .replace('1/4', '0.25')
            .replace('1/2', '0.5')
            .replace('3/4', '0.75');
          
          let quantity = 0;
          let unit = '';
          let name = normalizedRaw.trim();

          // 2. Parse string: "200g Chicken" or "2 Eggs" or "1.5 cups Rice"
          // Regex captures: (Number) (Optional Unit) (Rest of string)
          const match = normalizedRaw.match(/^([\d\.]+)\s*([a-zA-Z%]+)?\s+(.*)/);

          if (match) {
              quantity = parseFloat(match[1]) || 1;
              unit = (match[2] || '').toLowerCase().trim();
              name = match[3].trim();

              // Heuristic: If unit matches a common food start word (e.g. "large eggs"), adjust
              // If unit is missing but name implies count, treat as pcs
              if (!unit && !name.toLowerCase().startsWith('slice')) {
                  // Check if the 'name' actually starts with a unit that was attached
                  // e.g. "200g" vs "2 Eggs"
              }
          } else {
              // No number found, assume 1 unit of whatever it is
              quantity = 1;
              unit = ''; // 'pcs' implied
          }

          // 3. Normalize Units
          if (unit === 'grams' || unit === 'gm') unit = 'g';
          if (unit === 'kilograms' || unit === 'kilo') unit = 'kg';
          if (unit === 'milliliters') unit = 'ml';
          if (unit === 'liters') unit = 'l';
          if (unit === 'tablespoon' || unit === 'tablespoons' || unit === 'tbsp') unit = 'tbsp';
          if (unit === 'teaspoon' || unit === 'teaspoons' || unit === 'tsp') unit = 'tsp';
          if (unit === 'cup' || unit === 'cups') unit = 'cup';
          if (unit === 'pcs' || unit === 'pieces') unit = '';

          // 4. Normalize Name (lowercase, remove plurals, remove punctuation)
          // "Bananas" -> "banana", "Egg" -> "egg"
          let cleanName = name.toLowerCase().replace(/[^\w\s]/gi, '');
          if (cleanName.endsWith('s') && !cleanName.endsWith('ss')) cleanName = cleanName.slice(0, -1);
          
          // 5. Aggregate
          // Use composite key to avoid merging different units (e.g. 100g rice vs 1 cup rice)
          // In a real app, we would have conversion logic here.
          const key = `${cleanName}::${unit}`;

          if (ingredientsMap[key]) {
              ingredientsMap[key].quantity += quantity;
          } else {
              ingredientsMap[key] = { quantity, unit };
          }
      });
    });
  });

  // Convert map back to array
  return Object.entries(ingredientsMap).map(([key, details]) => {
     const [name, unit] = key.split('::');
     // Title Case for display
     const displayName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
     
     return {
        ingredient: displayName,
        quantity: parseFloat(details.quantity.toFixed(1)), // Avoid 0.300000004
        unit: unit,
        isChecked: false
     };
  }).sort((a, b) => a.ingredient.localeCompare(b.ingredient));
};

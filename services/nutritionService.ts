
import { SearchableFoodItem } from '../types';

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

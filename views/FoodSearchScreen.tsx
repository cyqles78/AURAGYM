
import React, { useState, useEffect, useCallback } from 'react';
import { Search, ArrowLeft, Loader2, Plus, AlertCircle } from 'lucide-react';
import { searchFoodDatabase } from '../services/nutritionService';
import { SearchableFoodItem, MealType } from '../types';
import { LogFoodModal } from '../components/LogFoodModal';
import { GlassCard } from '../components/GlassCard';

interface FoodSearchScreenProps {
  onBack: () => void;
  onLogFood: (name: string, calories: number, protein: number, carbs: number, fats: number, mealType: MealType, fdcId: number) => void;
}

export const FoodSearchScreen: React.FC<FoodSearchScreenProps> = ({ onBack, onLogFood }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableFoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<SearchableFoodItem | null>(null);
  const [error, setError] = useState('');

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        setError('');
        try {
          const data = await searchFoodDatabase(query);
          setResults(data);
          if (data.length === 0) setError('No foods found');
        } catch (err) {
          setError('Failed to fetch results');
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
      
      {/* Header & Search Bar */}
      <div className="bg-[#1C1C1E] p-4 pb-6 border-b border-[#2C2C2E] sticky top-0 z-10">
         <div className="flex items-center gap-3 mb-4">
             <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                 <ArrowLeft size={20} />
             </button>
             <h2 className="text-lg font-bold text-white">Log Food</h2>
         </div>
         
         <div className="relative">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
             <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food (e.g. Avocado, Chicken)..."
                className="w-full bg-[#2C2C2E] text-white pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:ring-1 focus:ring-white font-medium"
                autoFocus
             />
             {loading && (
                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     <Loader2 size={18} className="text-white animate-spin" />
                 </div>
             )}
         </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {query.length < 2 && !loading && (
              <div className="text-center py-10 text-[#8E8E93]">
                  <p>Type at least 2 characters to search</p>
              </div>
          )}

          {error && (
              <div className="flex flex-col items-center justify-center py-10 text-[#8E8E93] gap-2">
                  <AlertCircle size={32} />
                  <p>{error}</p>
              </div>
          )}

          {results.map((food) => (
              <GlassCard 
                key={food.id} 
                className="!p-4 active:scale-[0.98] transition-transform cursor-pointer flex justify-between items-center group"
                onClick={() => setSelectedFood(food)}
              >
                  <div className="min-w-0 pr-4">
                      <h3 className="text-white font-bold truncate text-base">{food.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#8E8E93]">
                          <span className="text-white font-medium">{food.calories} kcal</span>
                          <span>•</span>
                          <span className="text-accentBlue">{food.protein}g Pro</span>
                          {food.brand && (
                              <>
                                <span>•</span>
                                <span className="truncate">{food.brand}</span>
                              </>
                          )}
                      </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                      <Plus size={18} />
                  </div>
              </GlassCard>
          ))}
          
          {results.length > 0 && (
             <p className="text-center text-xs text-[#8E8E93] py-4">Data provided by USDA FoodData Central</p>
          )}
      </div>

      {/* Modal Overlay */}
      {selectedFood && (
          <LogFoodModal 
             food={selectedFood}
             onClose={() => setSelectedFood(null)}
             onLog={(name, cals, prot, carbs, fats, mealType, fdcId) => {
                 onLogFood(name, cals, prot, carbs, fats, mealType, fdcId);
                 // Optional: Keep screen open or close it? 
                 // Usually nice to close search if done, but user might log more.
                 // For this specific flow, we'll keep search open but clear query or show success toast?
                 // Let's just close modal for now, user is still on search screen.
                 setSelectedFood(null);
                 onBack(); // Go back to main dashboard after successful log
             }}
          />
      )}

    </div>
  );
};

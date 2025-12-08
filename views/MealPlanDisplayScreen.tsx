

import React, { useState } from 'react';
import { ArrowLeft, Clock, Flame, Droplets, Calendar, ChevronRight } from 'lucide-react';
import { WeeklyMealPlan, MealEntry } from '../types';
import { GlassCard } from '../components/GlassCard';

interface MealPlanDisplayScreenProps {
  plan: WeeklyMealPlan;
  onBack: () => void;
}

export const MealPlanDisplayScreen: React.FC<MealPlanDisplayScreenProps> = ({ plan, onBack }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const currentDay = plan.days[selectedDayIndex];

  // Calculate stats for current day
  const dayStats = currentDay.meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.recipeDetails.calories,
      protein: acc.protein + meal.recipeDetails.protein,
      carbs: acc.carbs + meal.recipeDetails.carbs,
      fats: acc.fats + meal.recipeDetails.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center space-x-2 px-1">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
             <h1 className="text-xl font-bold text-white">Weekly Plan</h1>
             <p className="text-xs text-secondary">Generated {new Date(plan.dateGenerated).toLocaleDateString()}</p>
          </div>
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto gap-2 px-1 pb-2 no-scrollbar">
          {plan.days.map((day, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-xl border transition-all ${
                    selectedDayIndex === idx 
                    ? 'bg-white text-black border-white' 
                    : 'bg-surfaceHighlight text-secondary border-border'
                }`}
              >
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1">Day</span>
                  <span className="text-lg font-bold leading-none">{idx + 1}</span>
              </button>
          ))}
      </div>

      {/* Daily Summary */}
      <GlassCard className="flex justify-between items-center py-4 px-6">
          <div className="text-center">
              <p className="text-[10px] text-secondary uppercase font-bold">Calories</p>
              <p className="text-xl font-bold text-white">{dayStats.calories}</p>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-center">
              <p className="text-[10px] text-secondary uppercase font-bold">Protein</p>
              <p className="text-xl font-bold text-accentBlue">{dayStats.protein}g</p>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
           <div className="text-center">
              <p className="text-[10px] text-secondary uppercase font-bold">Carbs</p>
              <p className="text-xl font-bold text-accentGreen">{dayStats.carbs}g</p>
          </div>
      </GlassCard>

      {/* Meals List */}
      <div className="space-y-4">
          <h2 className="text-lg font-bold text-white px-1 flex items-center gap-2">
              <Calendar size={18} /> {currentDay.dayName || `Day ${selectedDayIndex + 1}`} Menu
          </h2>
          
          {currentDay.meals.map((meal, idx) => (
              <MealCard key={idx} meal={meal} />
          ))}
      </div>
    </div>
  );
};

const MealCard: React.FC<{ meal: MealEntry }> = ({ meal }) => {
    return (
        <GlassCard className="flex flex-col gap-3 group">
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accentBlue bg-accentBlue/10 px-2 py-1 rounded-md mb-2 inline-block">
                        {meal.mealType}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">{meal.recipeName}</h3>
                </div>
                <div className="flex items-center text-xs text-secondary bg-surfaceHighlight px-2 py-1 rounded-full">
                    <Clock size={12} className="mr-1" /> {meal.preparationTimeMinutes}m
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-secondary border-t border-white/5 pt-3 mt-1">
                <div className="flex items-center gap-1">
                    <Flame size={12} className="text-white"/> <span className="text-white font-bold">{meal.recipeDetails.calories}</span> kcal
                </div>
                <div className="flex items-center gap-1">
                    <Droplets size={12} className="text-accentBlue"/> <span className="text-white font-bold">{meal.recipeDetails.protein}g</span> prot
                </div>
            </div>
            
            {/* Ingredients Preview */}
            {meal.ingredients && meal.ingredients.length > 0 && (
                <div className="text-xs text-slate-500 truncate">
                    {meal.ingredients.join(", ")}
                </div>
            )}
        </GlassCard>
    );
};
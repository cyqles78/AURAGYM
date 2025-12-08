
import React, { useState, useEffect } from 'react';
import { SearchableFoodItem, MealType } from '../types';
import { X, Check, Flame, Droplets } from 'lucide-react';

interface LogFoodModalProps {
  food: SearchableFoodItem;
  onClose: () => void;
  onLog: (
    name: string,
    calories: number,
    protein: number,
    carbs: number,
    fats: number,
    mealType: MealType,
    fdcId: number
  ) => void;
}

export const LogFoodModal: React.FC<LogFoodModalProps> = ({ food, onClose, onLog }) => {
  const [servings, setServings] = useState<string>('1.0');
  const [mealType, setMealType] = useState<MealType>('Snack');
  
  // Calculate displayed macros based on serving multiplier
  const multiplier = parseFloat(servings) || 0;
  
  const displayMacros = {
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier),
    carbs: Math.round(food.carbs * multiplier),
    fats: Math.round(food.fats * multiplier),
  };

  const handleLog = () => {
    if (multiplier <= 0) return;
    
    // Construct a name that includes serving info if available
    let logName = food.name;
    if (food.servingSize && food.servingUnit) {
      // e.g., "Banana (1.5 x 100 g)"
      logName = `${food.name} (${multiplier} x ${food.servingSize} ${food.servingUnit})`;
    } else if (multiplier !== 1) {
      logName = `${food.name} (${multiplier} servings)`;
    }

    onLog(
      logName,
      displayMacros.calories,
      displayMacros.protein,
      displayMacros.carbs,
      displayMacros.fats,
      mealType,
      food.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#1C1C1E] rounded-[24px] border border-[#2C2C2E] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="pr-4">
             <h2 className="text-xl font-bold text-white leading-tight">{food.name}</h2>
             {food.brand && <p className="text-xs text-[#8E8E93] mt-1">{food.brand}</p>}
          </div>
          <button onClick={onClose} className="p-2 bg-[#2C2C2E] rounded-full text-white hover:bg-white hover:text-black transition">
            <X size={20}/>
          </button>
        </div>

        {/* Macro Summary Card */}
        <div className="bg-[#2C2C2E]/50 rounded-2xl p-4 mb-6 border border-white/5">
           <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                   <Flame size={18} className="text-white" fill="white" />
                   <span className="text-2xl font-bold text-white">{displayMacros.calories}</span>
                   <span className="text-xs text-[#8E8E93] font-bold uppercase mt-1">kcal</span>
               </div>
               <div className="text-right">
                   <p className="text-xs text-[#8E8E93]">Per Serving</p>
                   <p className="text-sm font-medium text-white">
                      {food.servingSize ? `${food.servingSize} ${food.servingUnit}` : '100g / 1 unit'}
                   </p>
               </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
               <div className="bg-[#1C1C1E] p-2 rounded-xl border border-white/5 text-center">
                   <p className="text-[10px] text-[#8E8E93] uppercase font-bold">Protein</p>
                   <p className="text-lg font-bold text-accentBlue">{displayMacros.protein}g</p>
               </div>
               <div className="bg-[#1C1C1E] p-2 rounded-xl border border-white/5 text-center">
                   <p className="text-[10px] text-[#8E8E93] uppercase font-bold">Carbs</p>
                   <p className="text-lg font-bold text-accentGreen">{displayMacros.carbs}g</p>
               </div>
               <div className="bg-[#1C1C1E] p-2 rounded-xl border border-white/5 text-center">
                   <p className="text-[10px] text-[#8E8E93] uppercase font-bold">Fats</p>
                   <p className="text-lg font-bold text-yellow-500">{displayMacros.fats}g</p>
               </div>
           </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 flex-1 overflow-y-auto">
             <div>
                  <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Meal Type</label>
                  <div className="grid grid-cols-4 gap-2">
                      {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                          <button
                            key={type}
                            onClick={() => setMealType(type as MealType)}
                            className={`text-[10px] font-bold py-2 rounded-lg border transition-all ${mealType === type ? 'bg-white text-black border-white' : 'bg-[#2C2C2E] text-[#8E8E93] border-[#2C2C2E]'}`}
                          >
                              {type}
                          </button>
                      ))}
                  </div>
             </div>

             <div>
                  <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Number of Servings</label>
                  <div className="flex items-center gap-3">
                      <button onClick={() => setServings(Math.max(0.5, parseFloat(servings) - 0.5).toString())} className="h-12 w-12 rounded-xl bg-[#2C2C2E] text-white font-bold text-xl hover:bg-white/10 transition">-</button>
                      <input 
                        type="number" 
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="flex-1 bg-[#2C2C2E] h-12 rounded-xl text-center text-white font-bold text-xl outline-none focus:border focus:border-white"
                      />
                      <button onClick={() => setServings((parseFloat(servings) + 0.5).toString())} className="h-12 w-12 rounded-xl bg-[#2C2C2E] text-white font-bold text-xl hover:bg-white/10 transition">+</button>
                  </div>
             </div>
        </div>

        <button 
            onClick={handleLog}
            className="w-full mt-6 bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2"
        >
            <Check size={18} /> Log Food
        </button>

      </div>
    </div>
  );
};

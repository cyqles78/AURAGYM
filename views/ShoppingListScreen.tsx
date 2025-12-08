import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, ShoppingCart, Trash2, RefreshCw } from 'lucide-react';
import { ShoppingListItem, WeeklyMealPlan } from '../types';
import { generateShoppingList } from '../services/nutritionService';
import { GlassCard } from '../components/GlassCard';

interface ShoppingListScreenProps {
  plan: WeeklyMealPlan;
  onBack: () => void;
}

export const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ plan, onBack }) => {
  const [list, setList] = useState<ShoppingListItem[]>([]);

  // Generate list on mount
  useEffect(() => {
    generateList();
  }, [plan]);

  const generateList = () => {
    const items = generateShoppingList(plan);
    setList(items);
  };

  const toggleItem = (index: number) => {
    const updated = [...list];
    updated[index].isChecked = !updated[index].isChecked;
    setList(updated);
  };

  const remainingCount = list.filter(i => !i.isChecked).length;

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center space-x-2 px-1">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
             <h1 className="text-2xl font-bold text-white">Shopping List</h1>
             <p className="text-xs text-secondary">{remainingCount} items remaining</p>
          </div>
          <button 
            onClick={generateList}
            className="p-2 bg-surfaceHighlight rounded-full text-white hover:bg-white hover:text-black transition"
            title="Regenerate List"
          >
            <RefreshCw size={20} />
          </button>
      </div>

      {list.length === 0 ? (
        <GlassCard className="text-center py-10">
           <ShoppingCart size={48} className="mx-auto text-secondary mb-4 opacity-50" />
           <p className="text-white font-bold">Your list is empty.</p>
           <p className="text-xs text-secondary mb-4">Ingredients will appear here once you generate a meal plan.</p>
           <button onClick={generateList} className="text-xs font-bold bg-white text-black px-4 py-2 rounded-full">
             Refresh List
           </button>
        </GlassCard>
      ) : (
        <div className="space-y-2">
           {list.map((item, idx) => (
               <div 
                 key={idx}
                 onClick={() => toggleItem(idx)}
                 className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
                    item.isChecked 
                    ? 'bg-surfaceHighlight/30 border-transparent opacity-50' 
                    : 'bg-surfaceHighlight border-white/5'
                 }`}
               >
                   <div className={`h-6 w-6 rounded-full border flex items-center justify-center mr-4 transition-colors ${
                       item.isChecked ? 'bg-accentGreen border-accentGreen text-black' : 'border-secondary text-transparent'
                   }`}>
                       <CheckCircle2 size={16} />
                   </div>
                   <div className="flex-1">
                       <p className={`font-medium ${item.isChecked ? 'text-slate-500 line-through' : 'text-white'}`}>
                           {item.ingredient}
                       </p>
                   </div>
                   <div className="text-xs font-bold text-secondary bg-black/20 px-2 py-1 rounded-md">
                       {item.quantity} {item.unit}
                   </div>
               </div>
           ))}
        </div>
      )}
    </div>
  );
};
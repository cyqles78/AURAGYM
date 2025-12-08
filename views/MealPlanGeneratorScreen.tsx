

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, ChefHat } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { MealPlanInput, generateMealPlan } from '../services/geminiService';
import { WeeklyMealPlan } from '../types';

interface MealPlanGeneratorScreenProps {
  onBack: () => void;
  onPlanGenerated: (plan: WeeklyMealPlan) => void;
  initialTargets?: { calories: number; protein: number };
}

export const MealPlanGeneratorScreen: React.FC<MealPlanGeneratorScreenProps> = ({ 
  onBack, 
  onPlanGenerated,
  initialTargets 
}) => {
  const [calories, setCalories] = useState<number>(initialTargets?.calories || 2000);
  const [protein, setProtein] = useState<number>(initialTargets?.protein || 150);
  const [restrictions, setRestrictions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const input: MealPlanInput = {
        calories,
        protein,
        restrictions
      };
      
      const plan = await generateMealPlan(input);
      
      if (plan) {
        onPlanGenerated(plan);
      } else {
        setError("Failed to generate meal plan. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center space-x-2 px-1">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">Meal Plan AI</h1>
      </div>

      <GlassCard className="space-y-6">
        <div className="text-center pb-4 border-b border-white/5">
            <div className="h-16 w-16 bg-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                <ChefHat size={32} />
            </div>
            <h2 className="text-lg font-bold text-white">Design Your Week</h2>
            <p className="text-sm text-secondary px-4">
                Let AI craft a perfect 7-day meal plan matching your macros and taste preferences.
            </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
            <div>
                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Daily Calorie Target</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range" 
                        min="1200" max="4000" step="50" 
                        value={calories} 
                        onChange={(e) => setCalories(Number(e.target.value))}
                        className="flex-1 accent-white h-2 bg-surfaceHighlight rounded-full appearance-none"
                    />
                    <div className="w-20 text-right font-bold text-white text-lg">{calories}</div>
                </div>
            </div>

            <div>
                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Daily Protein Target (g)</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="range" 
                        min="50" max="300" step="5" 
                        value={protein} 
                        onChange={(e) => setProtein(Number(e.target.value))}
                        className="flex-1 accent-white h-2 bg-surfaceHighlight rounded-full appearance-none"
                    />
                    <div className="w-20 text-right font-bold text-white text-lg">{protein}g</div>
                </div>
            </div>

            <div>
                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Preferences / Restrictions</label>
                <textarea 
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    placeholder="e.g. Vegetarian, No dairy, High fiber, Cheap ingredients..."
                    className="w-full h-32 bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none resize-none text-sm"
                />
            </div>
        </div>

        {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
            </div>
        )}

        <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100"
        >
            {isGenerating ? (
                <>
                    <Sparkles size={18} className="mr-2 animate-spin" /> Generating Plan...
                </>
            ) : (
                <>
                    <Sparkles size={18} className="mr-2" /> Generate My Weekly Plan
                </>
            )}
        </button>
      </GlassCard>
    </div>
  );
};
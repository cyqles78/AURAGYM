import React, { useState, useMemo, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Recipe, FoodLogEntry, MealType, MacroTargets, WeeklyMealPlan } from '../types';
import { generateAIRecipe, RecipePreferences } from '../services/geminiService';
import { Zap, Clock, ChevronRight, PlusCircle, ArrowLeft, Droplets, Check, ChefHat, X, Plus, Sparkles, Flame, Coffee, Utensils, Moon, Edit2, Search, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, ReferenceLine, Cell } from 'recharts';
import { FoodSearchScreen } from './FoodSearchScreen';
import { MealPlanGeneratorScreen } from './MealPlanGeneratorScreen';
import { MealPlanDisplayScreen } from './MealPlanDisplayScreen';
import { ShoppingListScreen } from './ShoppingListScreen';

interface FoodViewProps {
    recipes: Recipe[];
    onAddRecipe: (r: Recipe) => void;
    waterConsumed: number;
    onUpdateWater: (amount: number) => void;
    foodLog: FoodLogEntry[];
    onQuickLog: (cals: number, protein: number, carbs: number, fats: number, name: string, mealType: MealType, fdcId?: number) => void;
    onLogRecipeToToday: (recipe: Recipe, mealType: MealType) => void;
    macroTargets: MacroTargets;
    onUpdateTargets: (targets: MacroTargets) => void;
}

export const FoodView: React.FC<FoodViewProps> = ({
    recipes,
    onAddRecipe,
    waterConsumed,
    onUpdateWater,
    foodLog,
    onQuickLog,
    onLogRecipeToToday,
    macroTargets,
    onUpdateTargets
}) => {
    const [loading, setLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showQuickLog, setShowQuickLog] = useState(false);
    const [showEditTargets, setShowEditTargets] = useState(false);
    const [showSearchScreen, setShowSearchScreen] = useState(false);

    // Weekly Meal Plan State
    const [showPlanGenerator, setShowPlanGenerator] = useState(false);
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyMealPlan | null>(null);
    const [showShoppingList, setShowShoppingList] = useState(false);

    // Wizard State
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [prefs, setPrefs] = useState<RecipePreferences>({
        mealType: 'Lunch',
        diet: 'Balanced',
        calories: 600,
        ingredients: []
    });
    const [tempIng, setTempIng] = useState('');

    // Quick Log State
    const [quickCals, setQuickCals] = useState('');
    const [quickProt, setQuickProt] = useState('');
    const [quickCarbs, setQuickCarbs] = useState('');
    const [quickFats, setQuickFats] = useState('');
    const [quickName, setQuickName] = useState('');
    const [quickMealType, setQuickMealType] = useState<MealType>('Snack');

    // Edit Targets State
    const [editTargets, setEditTargets] = useState<MacroTargets>(macroTargets);

    // Detail View State
    const [detailMealType, setDetailMealType] = useState<MealType>('Dinner');

    // --- DATA COMPUTATIONS ---

    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = foodLog.filter(e => e.date === today);

    const dailyTotals = useMemo(() => {
        return todaysEntries.reduce((acc, curr) => ({
            calories: acc.calories + curr.calories,
            protein: acc.protein + curr.protein,
            carbs: acc.carbs + (curr.carbs || 0),
            fats: acc.fats + (curr.fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    }, [todaysEntries]);

    const last7DaysData = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const key = d.toISOString().split('T')[0];

            const cals = foodLog
                .filter(e => e.date === key)
                .reduce((sum, e) => sum + e.calories, 0);

            return {
                date: key,
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                calories: cals,
                target: macroTargets.calories
            };
        });
    }, [foodLog, macroTargets.calories]);

    // --- HANDLERS ---

    const handleWizardComplete = async () => {
        setLoading(true);
        setWizardStep(0); // reset for next time, keep loading shown
        setShowWizard(false);
        const recipe = await generateAIRecipe(prefs);
        if (recipe) {
            const newRecipe = { ...recipe, id: Date.now().toString() };
            onAddRecipe(newRecipe);
            setSelectedRecipe(newRecipe);
        }
        setLoading(false);
    };

    const handleSaveQuickLog = () => {
        onQuickLog(
            Number(quickCals),
            Number(quickProt),
            Number(quickCarbs),
            Number(quickFats),
            quickName,
            quickMealType
        );
        setQuickCals('');
        setQuickProt('');
        setQuickCarbs('');
        setQuickFats('');
        setQuickName('');
        setQuickMealType('Snack');
        setShowQuickLog(false);
    };

    const handleSaveTargets = () => {
        onUpdateTargets(editTargets);
        setShowEditTargets(false);
    };

    // Sync edit state when modal opens
    useEffect(() => {
        if (showEditTargets) setEditTargets(macroTargets);
    }, [showEditTargets, macroTargets]);

    // --- SUB-VIEW: SEARCH SCREEN ---
    if (showSearchScreen) {
        return (
            <FoodSearchScreen
                onBack={() => setShowSearchScreen(false)}
                onLogFood={(name, cals, prot, carbs, fats, mealType, fdcId) => {
                    onQuickLog(cals, prot, carbs, fats, name, mealType, fdcId);
                }}
            />
        );
    }

    // --- SUB-VIEW: MEAL PLAN GENERATOR ---
    if (showPlanGenerator) {
        return (
            <MealPlanGeneratorScreen
                onBack={() => setShowPlanGenerator(false)}
                onPlanGenerated={(plan) => {
                    setWeeklyPlan(plan);
                    setShowPlanGenerator(false); // Switch to display
                }}
                initialTargets={{ calories: macroTargets.calories, protein: macroTargets.protein }}
            />
        );
    }

    // --- SUB-VIEW: SHOPPING LIST ---
    if (showShoppingList && weeklyPlan) {
        return (
            <ShoppingListScreen
                plan={weeklyPlan}
                onBack={() => setShowShoppingList(false)}
            />
        );
    }

    // --- SUB-VIEW: MEAL PLAN DISPLAY ---
    if (weeklyPlan) {
        return (
            <MealPlanDisplayScreen
                plan={weeklyPlan}
                onBack={() => setWeeklyPlan(null)}
                onViewShoppingList={() => setShowShoppingList(true)}
                onLogMeal={(meal) => {
                    onQuickLog(
                        meal.recipeDetails.calories,
                        meal.recipeDetails.protein,
                        meal.recipeDetails.carbs,
                        meal.recipeDetails.fats,
                        meal.recipeName,
                        meal.mealType as MealType
                    );
                }}
            />
        );
    }

    // --- SUB-VIEW: RECIPE DETAIL ---
    if (selectedRecipe) {
        return (
            <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedRecipe(null)} className="h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <button className="text-accentBlue text-sm font-semibold">Edit</button>
                </div>

                <div className="relative h-56 rounded-[24px] bg-surfaceHighlight overflow-hidden flex items-center justify-center border border-border">
                    <ChefHat size={48} className="text-secondary opacity-30" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                        <h1 className="text-2xl font-bold text-white leading-tight">{selectedRecipe.title}</h1>
                        <p className="text-sm text-gray-300 mt-1">{selectedRecipe.prepTime} • {selectedRecipe.tags?.[0]}</p>
                    </div>
                </div>

                {/* Log to Today Control */}
                <div className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-secondary uppercase font-semibold">Log as</span>
                        <select
                            value={detailMealType}
                            onChange={e => setDetailMealType(e.target.value as MealType)}
                            className="bg-surfaceHighlight text-xs text-white px-2 py-1.5 rounded-lg border border-white/10 focus:outline-none"
                        >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            onLogRecipeToToday(selectedRecipe, detailMealType);
                            setSelectedRecipe(null); // Return to main screen after logging
                        }}
                        className="px-4 py-2 rounded-full bg-accentGreen text-black text-xs font-bold hover:brightness-110 transition flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        Log Meal
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-surface border border-border p-3 rounded-2xl">
                        <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">Protein</p>
                        <p className="text-lg font-bold text-white">{selectedRecipe.protein}g</p>
                    </div>
                    <div className="bg-surface border border-border p-3 rounded-2xl">
                        <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">Cals</p>
                        <p className="text-lg font-bold text-white">{selectedRecipe.calories}</p>
                    </div>
                    <div className="bg-surface border border-border p-3 rounded-2xl">
                        <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">Carbs</p>
                        <p className="text-lg font-bold text-white">{selectedRecipe.carbs}g</p>
                    </div>
                    <div className="bg-surface border border-border p-3 rounded-2xl">
                        <p className="text-[10px] text-secondary uppercase font-bold tracking-wider">Fat</p>
                        <p className="text-lg font-bold text-white">{selectedRecipe.fats}g</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Ingredients</h3>
                        <ul className="space-y-3">
                            {selectedRecipe.ingredients?.map((ing, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-300 pb-3 border-b border-border last:border-0">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white mt-1.5 mr-3 flex-shrink-0"></div>
                                    {ing}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Preparation</h3>
                        <div className="space-y-6">
                            {selectedRecipe.steps?.map((step, i) => (
                                <div key={i} className="flex">
                                    <div className="h-6 w-6 rounded-full bg-surfaceHighlight border border-border text-xs font-bold text-white flex items-center justify-center flex-shrink-0 mr-4 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // --- DERIVED DATA: MEAL GROUPS ---
    const meals: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const entriesByMeal = meals.map(meal => {
        const entries = todaysEntries.filter(e => e.mealType === meal);
        const calories = entries.reduce((sum, e) => sum + e.calories, 0);
        const protein = entries.reduce((sum, e) => sum + e.protein, 0);
        return { meal, entries, calories, protein };
    });

    // --- MAIN VIEW: DASHBOARD ---
    return (
        <div className="pb-24 pt-4 space-y-5">
            <div className="flex justify-between items-center px-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">Nutrition</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPlanGenerator(true)}
                        className="flex items-center space-x-1 text-xs font-bold text-white border border-white/20 bg-white/5 px-3 py-2 rounded-full active:scale-95 transition"
                    >
                        <Calendar size={12} className="mr-1" />
                        Plan
                    </button>
                    <button
                        onClick={() => setShowWizard(true)}
                        disabled={loading}
                        className="flex items-center space-x-1 text-xs font-bold text-black bg-white px-3 py-2 rounded-full active:scale-95 transition"
                    >
                        {loading ? <span className="animate-spin mr-1">●</span> : <Sparkles size={12} className="mr-1 fill-black" />}
                        AI
                    </button>
                </div>
            </div>

            {/* TODAY'S MACROS & WATER */}
            <GlassCard className="space-y-5 !p-4">
                <div className="flex items-stretch justify-between">
                    {/* Left: Macros */}
                    <div className="flex-1 pr-6 border-r border-border flex flex-col justify-between">

                        {/* Calories Header */}
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-sm font-semibold text-white">Today's Macros</span>
                            <button onClick={() => setShowEditTargets(true)} className="text-xs text-accentBlue font-medium flex items-center hover:text-white transition">
                                Edit <Edit2 size={10} className="ml-1" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-3xl font-bold text-white tracking-tight">{dailyTotals.calories}</span>
                                <span className="text-sm text-secondary mb-1">/ {macroTargets.calories} kcal</span>
                            </div>
                            <div className="h-2 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((dailyTotals.calories / macroTargets.calories) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Macro Bars */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Protein */}
                            <div>
                                <div className="flex justify-between text-[10px] text-secondary uppercase font-bold mb-1">
                                    <span>Prot</span>
                                    <span>{dailyTotals.protein}/{macroTargets.protein}</span>
                                </div>
                                <div className="h-1.5 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                                    <div className="h-full bg-accentBlue rounded-full" style={{ width: `${Math.min((dailyTotals.protein / macroTargets.protein) * 100, 100)}%` }} />
                                </div>
                            </div>
                            {/* Carbs */}
                            <div>
                                <div className="flex justify-between text-[10px] text-secondary uppercase font-bold mb-1">
                                    <span>Carb</span>
                                    <span>{dailyTotals.carbs}/{macroTargets.carbs}</span>
                                </div>
                                <div className="h-1.5 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                                    <div className="h-full bg-accentGreen rounded-full" style={{ width: `${Math.min((dailyTotals.carbs / macroTargets.carbs) * 100, 100)}%` }} />
                                </div>
                            </div>
                            {/* Fats */}
                            <div>
                                <div className="flex justify-between text-[10px] text-secondary uppercase font-bold mb-1">
                                    <span>Fat</span>
                                    <span>{dailyTotals.fats}/{macroTargets.fats}</span>
                                </div>
                                <div className="h-1.5 w-full bg-surfaceHighlight rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min((dailyTotals.fats / macroTargets.fats) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Water */}
                    <div className="w-[90px] pl-5 flex flex-col items-center justify-center">
                        <div className="relative h-24 w-12 bg-surfaceHighlight rounded-full overflow-hidden mb-3 border border-white/5">
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-blue-500/80 transition-all duration-500"
                                style={{ height: `${Math.min((waterConsumed / 8) * 100, 100)}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Droplets size={16} className={`transition-colors ${waterConsumed > 4 ? 'text-white' : 'text-secondary'}`} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onUpdateWater(Math.max(0, waterConsumed - 1))}
                                className="h-8 w-8 rounded-full bg-surfaceHighlight text-white flex items-center justify-center active:scale-95 transition font-bold text-base border border-white/10"
                            >
                                −
                            </button>
                            <span className="text-sm font-bold text-white w-4 text-center">{waterConsumed}</span>
                            <button
                                onClick={() => onUpdateWater(waterConsumed + 1)}
                                className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition font-bold text-base"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Primary Log Action */}
            <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setShowSearchScreen(true)} className="py-3.5 rounded-[16px] bg-white text-black font-bold flex flex-col items-center justify-center active:scale-95 transition shadow-lg shadow-white/10">
                    <Search size={20} className="mb-1" />
                    <span className="text-xs">Search</span>
                </button>
                <button onClick={() => setShowQuickLog(true)} className="py-3.5 rounded-[16px] bg-surfaceHighlight border border-border text-white font-medium flex flex-col items-center justify-center active:scale-95 transition">
                    <Zap size={20} className="mb-1 text-secondary" />
                    <span className="text-xs">Manual</span>
                </button>
            </div>

            {/* TODAY'S MEALS LOG */}
            <div className="space-y-3">
                <h3 className="text-base font-bold text-white px-1">Today's Meals</h3>
                {todaysEntries.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-sm text-secondary">No meals logged yet today.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {entriesByMeal.map(group => {
                            // Helper for icons based on meal type
                            const Icon = group.meal === 'Breakfast' ? Coffee
                                : group.meal === 'Lunch' ? Utensils
                                    : group.meal === 'Dinner' ? Moon
                                        : Zap;

                            if (group.entries.length === 0) return null;

                            return (
                                <GlassCard key={group.meal} className="!p-4">
                                    <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <Icon size={14} className="text-accentBlue" />
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">{group.meal}</span>
                                        </div>
                                        <span className="text-xs text-secondary font-medium">
                                            {group.calories} kcal • {group.protein}g P
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {group.entries.map(entry => (
                                            <div key={entry.id} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-300 truncate mr-2">{entry.name}</span>
                                                <span className="text-slate-500 whitespace-nowrap text-xs">
                                                    {entry.calories} kcal
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* WEEKLY CALORIES CHART */}
            <div className="pt-2">
                <GlassCard>
                    <h3 className="text-sm font-bold text-white mb-3">Weekly Calories</h3>
                    <div className="h-32 w-full">
                        {last7DaysData.every(d => d.calories === 0) ? (
                            <div className="h-full flex items-center justify-center text-xs text-secondary italic border border-dashed border-white/5 rounded-xl">
                                No nutrition data this week
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={last7DaysData}>
                                    <ReferenceLine y={macroTargets.calories} stroke="#333" strokeDasharray="3 3" />
                                    <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                                        {last7DaysData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.calories > macroTargets.calories ? '#EF4444' : '#FFFFFF'}
                                                fillOpacity={entry.calories > macroTargets.calories ? 0.8 : 1}
                                            />
                                        ))}
                                    </Bar>
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#8E8E93', fontSize: 10 }}
                                        dy={10}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Recipes List */}
            <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="text-base font-bold text-white">Your Menu</h3>
                </div>

                <div className="space-y-2.5">
                    {recipes.map((recipe) => (
                        <GlassCard key={recipe.id} className="flex gap-4 items-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors pointer-events-none" />

                            <div onClick={() => setSelectedRecipe(recipe)} className="flex-1 flex gap-4 items-center cursor-pointer min-w-0">
                                <div className="h-14 w-14 rounded-xl bg-surfaceHighlight flex items-center justify-center text-secondary flex-shrink-0">
                                    <ChefHat size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold truncate text-base">{recipe.title}</h4>
                                    <div className="flex items-center text-xs text-secondary mt-1 space-x-3">
                                        <span className="text-accentBlue font-medium">{recipe.protein}g Pro</span>
                                        <span>•</span>
                                        <span>{recipe.calories} kcal</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => onLogRecipeToToday(recipe, 'Lunch')}
                                    className="h-10 w-10 rounded-full bg-surfaceHighlight border border-white/5 flex items-center justify-center text-accentGreen hover:bg-accentGreen hover:text-black transition z-10"
                                    title="Quick Log"
                                >
                                    <Plus size={18} />
                                </button>
                                <ChevronRight size={18} className="text-secondary" />
                            </div>
                        </GlassCard>
                    ))}
                    {recipes.length === 0 && (
                        <p className="text-center text-sm text-secondary py-8">Tap 'AI Chef' to design your first meal.</p>
                    )}
                </div>
            </div>

            {/* --- WIZARD MODAL --- */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-2xl p-4 pb-28 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#1C1C1E] rounded-[24px] border border-border p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles size={20} className="fill-white" /> AI Chef
                            </h2>
                            <button onClick={() => setShowWizard(false)} className="bg-surfaceHighlight p-2 rounded-full text-white active:scale-95 transition"><X size={18} /></button>
                        </div>

                        {/* Step 0: Meal Type */}
                        {wizardStep === 0 && (
                            <div className="space-y-6">
                                <p className="text-lg text-white font-medium">What are we cooking?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                                        <button key={type} onClick={() => { setPrefs({ ...prefs, mealType: type }); setWizardStep(1); }} className="py-4 rounded-2xl bg-surfaceHighlight border border-border text-white hover:bg-white hover:text-black transition font-semibold">
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 1: Diet */}
                        {wizardStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right">
                                <p className="text-lg text-white font-medium">Any diet preferences?</p>
                                <div className="space-y-2">
                                    {['Balanced', 'Low Carb', 'High Protein', 'Vegan', 'Paleo'].map(diet => (
                                        <button key={diet} onClick={() => { setPrefs({ ...prefs, diet: diet }); setWizardStep(2); }} className="w-full py-4 px-6 rounded-2xl bg-surfaceHighlight border border-border text-white text-left hover:bg-white hover:text-black transition font-semibold flex justify-between items-center group">
                                            {diet}
                                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Cals & Ingredients */}
                        {wizardStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right">
                                <div>
                                    <p className="text-lg text-white font-medium mb-4">Calorie Target: <span className="text-accentBlue">{prefs.calories}</span></p>
                                    <input type="range" min="200" max="1500" step="50" value={prefs.calories} onChange={e => setPrefs({ ...prefs, calories: Number(e.target.value) })} className="w-full accent-white h-2 bg-surfaceHighlight rounded-full appearance-none" />
                                </div>

                                <div>
                                    <p className="text-lg text-white font-medium mb-2">Must Include (Optional)</p>
                                    <div className="flex gap-2">
                                        <input type="text" value={tempIng} onChange={e => setTempIng(e.target.value)} placeholder="e.g. Chicken, Avocado..." className="flex-1 bg-surfaceHighlight rounded-xl px-4 text-white focus:outline-none focus:ring-1 focus:ring-white" />
                                        <button onClick={() => { if (tempIng) { setPrefs({ ...prefs, ingredients: [...prefs.ingredients, tempIng] }); setTempIng(''); } }} className="bg-white text-black p-3 rounded-xl font-bold"><Plus size={20} /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {prefs.ingredients.map(ing => (
                                            <span key={ing} className="bg-surfaceHighlight border border-border text-xs px-3 py-1 rounded-full text-white flex items-center gap-1">
                                                {ing} <X size={12} className="cursor-pointer" onClick={() => setPrefs({ ...prefs, ingredients: prefs.ingredients.filter(i => i !== ing) })} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleWizardComplete} className="w-full py-4 mt-4 bg-white text-black font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition">
                                    Generate Recipe
                                </button>
                            </div>
                        )}

                        <div className="flex justify-center mt-6 gap-2">
                            {[0, 1, 2].map(step => (
                                <div key={step} className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === step ? 'w-8 bg-white' : 'w-2 bg-surfaceHighlight'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- QUICK LOG MODAL --- */}
            {showQuickLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-2xl p-4 pb-28 animate-in fade-in">
                    <div className="w-full max-w-sm bg-[#1C1C1E] rounded-[24px] border border-border p-6 shadow-2xl max-h-[70vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Quick Log</h2>
                            <button onClick={() => setShowQuickLog(false)} className="text-secondary hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Food Name</label>
                                <input type="text" value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="e.g. Banana" className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium text-lg" autoFocus />
                            </div>

                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Meal Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setQuickMealType(type as MealType)}
                                            className={`text-[10px] font-bold py-2 rounded-lg border transition-all ${quickMealType === type ? 'bg-white text-black border-white' : 'bg-surfaceHighlight text-secondary border-border'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Calories</label>
                                    <input type="number" value={quickCals} onChange={e => setQuickCals(e.target.value)} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium text-lg" placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Protein (g)</label>
                                    <input type="number" value={quickProt} onChange={e => setQuickProt(e.target.value)} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium text-lg" placeholder="0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Carbs (g)</label>
                                    <input type="number" value={quickCarbs} onChange={e => setQuickCarbs(e.target.value)} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium text-lg" placeholder="Optional" />
                                </div>
                                <div>
                                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Fats (g)</label>
                                    <input type="number" value={quickFats} onChange={e => setQuickFats(e.target.value)} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium text-lg" placeholder="Optional" />
                                </div>
                            </div>

                            <button onClick={handleSaveQuickLog} className="w-full bg-white text-black font-bold py-3.5 rounded-xl mt-2">Log Food</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT TARGETS MODAL --- */}
            {showEditTargets && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-2xl p-4 pb-28 animate-in fade-in">
                    <div className="w-full max-w-sm bg-[#1C1C1E] rounded-[24px] border border-border p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Edit Targets</h2>
                            <button onClick={() => setShowEditTargets(false)} className="text-secondary hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-secondary font-bold uppercase mb-2 block">Daily Calories</label>
                                <input type="number" value={editTargets.calories} onChange={e => setEditTargets({ ...editTargets, calories: Number(e.target.value) })} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-bold text-lg" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Protein</label>
                                    <input type="number" value={editTargets.protein} onChange={e => setEditTargets({ ...editTargets, protein: Number(e.target.value) })} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Carbs</label>
                                    <input type="number" value={editTargets.carbs} onChange={e => setEditTargets({ ...editTargets, carbs: Number(e.target.value) })} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium" />
                                </div>
                                <div>
                                    <label className="text-xs text-secondary font-bold uppercase mb-2 block">Fats</label>
                                    <input type="number" value={editTargets.fats} onChange={e => setEditTargets({ ...editTargets, fats: Number(e.target.value) })} className="w-full bg-surfaceHighlight border border-border rounded-xl p-3 text-white focus:border-white focus:outline-none font-medium" />
                                </div>
                            </div>

                            <button onClick={handleSaveTargets} className="w-full bg-accent text-black font-bold py-3.5 rounded-xl mt-4">Save Targets</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
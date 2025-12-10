
import React, { useState, useMemo } from 'react';
import { Exercise, ExercisePerformanceEntry, MUSCLE_GROUPS, EQUIPMENT_TYPES, TargetMuscle, Equipment } from '../../types';
import { Search, Filter, Trophy, ChevronRight, Dumbbell, Activity, Medal, Plus, Edit2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { ExerciseEditModal } from '../../components/ExerciseEditModal';

interface ExerciseLibraryScreenProps {
  exercises: Exercise[]; 
  history: ExercisePerformanceEntry[]; 
  onSelectExercise: (exercise: Exercise) => void;
  onBack: () => void;
  onAddCustomExercise?: (exercise: Exercise) => void;
  onUpdateExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

type MasteryLevel = 'Novice' | 'Regular' | 'Pro' | 'Elite';

export const ExerciseLibraryScreen: React.FC<ExerciseLibraryScreenProps> = ({ 
  exercises, 
  history, 
  onSelectExercise,
  onBack,
  onAddCustomExercise,
  onUpdateExercise,
  onDeleteExercise
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterType, setFilterType] = useState<'Muscle' | 'Equipment'>('Muscle');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>(undefined);

  // --- FILTERS ---
  const muscles = ['All', ...MUSCLE_GROUPS];
  const equipment = ['All', ...EQUIPMENT_TYPES];

  // --- MASTERY LOGIC ---
  const getMastery = (exerciseName: string): { level: MasteryLevel; count: number; color: string } => {
    const count = history.filter(h => h.exerciseName === exerciseName).length;
    
    if (count > 100) return { level: 'Elite', count, color: 'text-yellow-400' };
    if (count > 50) return { level: 'Pro', count, color: 'text-cyan-400' };
    if (count > 10) return { level: 'Regular', count, color: 'text-emerald-400' };
    return { level: 'Novice', count, color: 'text-slate-500' };
  };

  // --- FILTERING ---
  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' 
        ? true 
        : filterType === 'Muscle' 
          ? ex.targetMuscle === activeFilter
          : ex.equipment === activeFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [exercises, search, activeFilter, filterType]);

  const handleEditClick = (e: React.MouseEvent, ex: Exercise) => {
      e.stopPropagation();
      setEditingExercise(ex);
      setShowEditModal(true);
  };

  const handleSave = (ex: Exercise) => {
      if (editingExercise) {
          // Update Mode
          onUpdateExercise && onUpdateExercise(ex);
      } else {
          // Create Mode
          onAddCustomExercise && onAddCustomExercise(ex);
      }
  };

  return (
    <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right h-screen flex flex-col relative">
      {/* Header */}
      <div className="px-1 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">Encyclopedia</h1>
            <button 
                onClick={() => { setEditingExercise(undefined); setShowEditModal(true); }}
                className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition active:scale-90 shadow-lg"
            >
                <Plus size={20} />
            </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search exercises..."
                className="w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-white transition-colors"
            />
        </div>

        {/* Filter Toggles */}
        <div className="flex gap-2 mb-3">
            <button 
                onClick={() => { setFilterType('Muscle'); setActiveFilter('All'); }}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${filterType === 'Muscle' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-slate-700'}`}
            >
                By Muscle
            </button>
            <button 
                onClick={() => { setFilterType('Equipment'); setActiveFilter('All'); }}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${filterType === 'Equipment' ? 'bg-white text-black border-white' : 'bg-transparent text-slate-400 border-slate-700'}`}
            >
                By Equipment
            </button>
        </div>

        {/* Horizontal Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {(filterType === 'Muscle' ? muscles : equipment).map(item => (
                <button
                    key={item}
                    onClick={() => setActiveFilter(item)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        activeFilter === item 
                        ? 'bg-[#2C2C2E] text-white border-white/20 shadow-lg' 
                        : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5'
                    }`}
                >
                    {item}
                </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-1 pb-20 custom-scrollbar">
          <div className="grid grid-cols-1 gap-3">
              {filteredExercises.map(ex => {
                  const mastery = getMastery(ex.name);
                  
                  return (
                    <GlassCard 
                        key={ex.id} 
                        className="!p-4 active:scale-[0.99] transition-transform cursor-pointer group border-l-4 relative"
                        style={{ borderLeftColor: mastery.level === 'Elite' ? '#FACC15' : mastery.level === 'Pro' ? '#22D3EE' : 'transparent' }}
                        onClick={() => onSelectExercise(ex)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white truncate">{ex.name}</h3>
                                    {mastery.level === 'Elite' && <Medal size={14} className="text-yellow-400 fill-yellow-400/20" />}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Activity size={12}/> {ex.targetMuscle}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span className="flex items-center gap-1"><Dumbbell size={12}/> {ex.equipment}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#000]/30 border border-white/5 ${mastery.color}`}>
                                    {mastery.level}
                                </div>
                                <span className="text-[10px] text-slate-600">{mastery.count} sets</span>
                            </div>
                        </div>
                        
                        {/* Edit Button (Absolute) - only show on hover for desktop, or make it distinct */}
                        <button 
                            onClick={(e) => handleEditClick(e, ex)}
                            className="absolute right-2 top-2 p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Edit2 size={14} />
                        </button>
                    </GlassCard>
                  );
              })}
              
              {filteredExercises.length === 0 && (
                  <div className="text-center py-10 text-slate-500">
                      <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                      <p>No exercises found.</p>
                  </div>
              )}
          </div>
      </div>

      {/* Editor Modal */}
      {showEditModal && (
          <ExerciseEditModal 
            exercise={editingExercise}
            onClose={() => setShowEditModal(false)}
            onSave={handleSave}
            onDelete={onDeleteExercise}
          />
      )}
    </div>
  );
};

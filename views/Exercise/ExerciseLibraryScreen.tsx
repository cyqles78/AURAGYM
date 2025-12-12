import React, { useState, useMemo } from 'react';
import { Exercise, MUSCLE_GROUPS, EQUIPMENT_TYPES, TargetMuscle, Equipment, ExercisePerformanceEntry } from '../../types';
import { Search, Filter, Trophy, ChevronRight, Dumbbell, Activity, Medal, Plus, Edit2, Loader2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { ExerciseEditModal } from '../../components/ExerciseEditModal';
import { useExercises, useLogs, useCreateExercise, useUpdateExercise, useDeleteExercise } from '../../hooks/useSupabaseData';

interface ExerciseLibraryScreenProps {
  onSelectExercise: (exercise: Exercise) => void;
  onBack: () => void;
  // Props for external handlers removed, as we handle data internally now
}

type MasteryLevel = 'Novice' | 'Regular' | 'Pro' | 'Elite';

export const ExerciseLibraryScreen: React.FC<ExerciseLibraryScreenProps> = ({ 
  onSelectExercise,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterType, setFilterType] = useState<'Muscle' | 'Equipment'>('Muscle');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>(undefined);

  // --- DATA FETCHING ---
  const { data: exercises = [], isLoading: exercisesLoading, error: exercisesError } = useExercises();
  const { data: logs = [], isLoading: logsLoading } = useLogs();

  const createMutation = useCreateExercise();
  const updateMutation = useUpdateExercise();
  const deleteMutation = useDeleteExercise();

  // --- FILTERS ---
  const muscles = ['All', ...MUSCLE_GROUPS];
  const equipment = ['All', ...EQUIPMENT_TYPES];

  // --- DERIVE HISTORY FOR MASTERY ---
  // In a real optimized app, we'd fetch aggregate stats via SQL View or RPC
  // For now, we derive mastery from client-side logs for simplicity
  const history = useMemo(() => {
      const entries: ExercisePerformanceEntry[] = [];
      // This is a rough estimation since we don't have the granular performance rows loaded here 
      // without a separate query. For purely visual mastery, we can skip or implement a light hook.
      // We will skip mastery calculation strictly for this refactor step to keep performance high,
      // or implement a `useExerciseStats` hook later.
      return entries;
  }, [logs]);

  // Temporary mock function until we have granular performance data hook
  const getMastery = (exerciseName: string): { level: MasteryLevel; count: number; color: string } => {
    return { level: 'Novice', count: 0, color: 'text-slate-500' };
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

  const handleSave = async (ex: Exercise) => {
      if (editingExercise) {
          updateMutation.mutate(ex, {
              onSuccess: () => setShowEditModal(false)
          });
      } else {
          createMutation.mutate(ex, {
              onSuccess: () => setShowEditModal(false)
          });
      }
  };

  const handleDelete = async (id: string) => {
      if (confirm("Delete this exercise? This cannot be undone.")) {
          deleteMutation.mutate(id, {
              onSuccess: () => setShowEditModal(false)
          });
      }
  };

  if (exercisesLoading) {
      return (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-accent" size={32} />
              <p className="text-secondary text-sm">Loading Library...</p>
          </div>
      );
  }

  if (exercisesError) {
      return (
          <div className="h-full flex flex-col items-center justify-center space-y-4 p-6 text-center">
              <AlertCircle className="text-red-500" size={32} />
              <p className="text-white font-bold">Failed to load exercises</p>
              <p className="text-secondary text-xs">{(exercisesError as any).message}</p>
          </div>
      );
  }

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
                        style={{ borderLeftColor: 'transparent' }}
                        onClick={() => onSelectExercise(ex)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white truncate">{ex.name}</h3>
                                    {ex.isCustom && <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">CUSTOM</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Activity size={12}/> {ex.targetMuscle}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span className="flex items-center gap-1"><Dumbbell size={12}/> {ex.equipment}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <ChevronRight size={16} className="text-secondary" />
                            </div>
                        </div>
                        
                        {/* Edit Button (Absolute - Only for custom or admin) */}
                        {ex.isCustom && (
                            <button 
                                onClick={(e) => handleEditClick(e, ex)}
                                className="absolute right-2 top-2 p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Edit2 size={14} />
                            </button>
                        )}
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
            onDelete={editingExercise ? () => handleDelete(editingExercise.id) : undefined}
          />
      )}
    </div>
  );
};
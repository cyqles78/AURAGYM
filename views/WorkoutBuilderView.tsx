
import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Search, GripVertical, Trash2, Dumbbell, Settings } from 'lucide-react';
import { Exercise, WorkoutPlan } from '../types';
import { useRoutineBuilder } from '../hooks/useRoutineBuilder';
import { ExerciseCreationModal } from '../components/ExerciseCreationModal';

interface WorkoutBuilderViewProps {
  initialLibrary: Exercise[];
  onSave: (routine: WorkoutPlan) => void;
  onBack: () => void;
  onAddCustomExercise: (ex: Exercise) => void;
}

export const WorkoutBuilderView: React.FC<WorkoutBuilderViewProps> = ({ 
  initialLibrary, 
  onSave, 
  onBack,
  onAddCustomExercise
}) => {
  const {
    routineTitle,
    setRoutineTitle,
    selectedExercises,
    availableExercises,
    addExercise,
    removeExercise,
    reorderExercises,
    updateExerciseConfig,
    updateSetDetails,
    saveRoutine
  } = useRoutineBuilder({ initialExercises: initialLibrary, onSave });

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filteredLibrary = availableExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- DRAG AND DROP HANDLERS ---

  const handleDragStart = (e: React.DragEvent, id: string, type: 'NEW' | 'REORDER', index?: number) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('id', id);
    if (index !== undefined) {
      e.dataTransfer.setData('index', index.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    const id = e.dataTransfer.getData('id');

    if (type === 'NEW') {
      addExercise(id);
    }
    setDraggingId(null);
  };

  const handleDropOnItem = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to canvas drop
    const type = e.dataTransfer.getData('type');
    
    if (type === 'REORDER') {
      const sourceIndex = parseInt(e.dataTransfer.getData('index'));
      if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
        reorderExercises(sourceIndex, targetIndex);
      }
    } else if (type === 'NEW') {
      const id = e.dataTransfer.getData('id');
      addExercise(id);
      // Note: Ideally we insert at specific index, but addExercise appends. 
      // Reordering usually happens after adding in simple implementation.
    }
    setDraggingId(null);
  };

  return (
    <div className="pb-28 pt-6 space-y-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-1 flex-shrink-0">
        <div className="flex items-center space-x-2">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                <ArrowLeft size={20} />
            </button>
            <input 
                type="text" 
                value={routineTitle}
                onChange={(e) => setRoutineTitle(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-white text-xl font-bold text-white outline-none w-48 sm:w-64"
                placeholder="Routine Name"
            />
        </div>
        <button 
            onClick={saveRoutine}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-200 transition"
        >
            <Save size={16} /> Save
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
          
          {/* LEFT PANEL: LIBRARY */}
          <div className="flex flex-col gap-4 bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] overflow-hidden">
              <div className="flex gap-2">
                  <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search exercises..."
                        className="w-full bg-[#2C2C2E] text-white pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-white"
                      />
                  </div>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="p-2 bg-[#2C2C2E] rounded-xl text-white hover:bg-white hover:text-black transition"
                    title="Create Custom Exercise"
                  >
                      <Plus size={20} />
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredLibrary.map(ex => (
                      <div 
                        key={ex.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ex.id, 'NEW')}
                        className="bg-[#2C2C2E] p-3 rounded-xl border border-transparent hover:border-white/20 cursor-grab active:cursor-grabbing flex items-center justify-between group"
                      >
                          <div>
                              <p className="text-sm font-bold text-white">{ex.name}</p>
                              <p className="text-xs text-[#8E8E93]">{ex.targetMuscle} • {ex.equipment}</p>
                          </div>
                          <GripVertical size={16} className="text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                  ))}
                  {filteredLibrary.length === 0 && (
                      <p className="text-center text-xs text-[#8E8E93] py-4">No exercises found.</p>
                  )}
              </div>
          </div>

          {/* RIGHT PANEL: CANVAS */}
          <div 
            className={`md:col-span-2 bg-[#1C1C1E] rounded-2xl p-4 border flex flex-col overflow-hidden transition-colors ${draggingId ? 'border-dashed border-accent' : 'border-[#2C2C2E]'}`}
            onDragOver={handleDragOver}
            onDrop={handleDropOnCanvas}
          >
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-sm font-bold text-[#8E8E93] uppercase tracking-wider">Workout Canvas</h2>
                 <span className="text-xs text-[#8E8E93]">{selectedExercises.length} Exercises</span>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                 {selectedExercises.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-[#8E8E93] opacity-50 border-2 border-dashed border-[#2C2C2E] rounded-xl m-4">
                         <Dumbbell size={48} className="mb-2" />
                         <p className="font-bold">Drag exercises here</p>
                     </div>
                 ) : (
                     selectedExercises.map((ex, idx) => (
                         <div 
                            key={ex.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, ex.id, 'REORDER', idx)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDropOnItem(e, idx)}
                            className="bg-[#000] p-4 rounded-xl border border-[#2C2C2E] flex flex-col gap-3 group relative"
                         >
                             <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                     <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#2C2C2E] rounded">
                                         <GripVertical size={18} className="text-[#8E8E93]" />
                                     </div>
                                     <span className="text-xs font-bold text-[#8E8E93] w-6">#{idx + 1}</span>
                                     <div>
                                         <p className="text-base font-bold text-white">{ex.name}</p>
                                         <p className="text-xs text-[#8E8E93]">{ex.targetMuscle}</p>
                                     </div>
                                 </div>
                                 <button 
                                    onClick={() => removeExercise(ex.id)}
                                    className="p-2 text-[#8E8E93] hover:text-red-400 transition"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             </div>

                             {/* Configuration */}
                             <div className="grid grid-cols-3 gap-4 pl-10 border-t border-[#2C2C2E] pt-3">
                                 <div>
                                     <label className="text-[10px] font-bold text-[#8E8E93] uppercase block mb-1">Sets</label>
                                     <div className="flex items-center gap-2">
                                         <button onClick={() => updateExerciseConfig(ex.id, 'sets', Math.max(1, ex.sets.length - 1))} className="bg-[#2C2C2E] w-6 h-6 rounded flex items-center justify-center text-white">-</button>
                                         <span className="text-sm font-bold text-white w-4 text-center">{ex.sets.length}</span>
                                         <button onClick={() => updateExerciseConfig(ex.id, 'sets', ex.sets.length + 1)} className="bg-[#2C2C2E] w-6 h-6 rounded flex items-center justify-center text-white">+</button>
                                     </div>
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-bold text-[#8E8E93] uppercase block mb-1">Target Reps</label>
                                     <input 
                                        type="text" 
                                        value={ex.sets[0]?.reps || '10'}
                                        onChange={(e) => updateSetDetails(ex.id, e.target.value)}
                                        className="w-full bg-[#2C2C2E] text-white text-xs px-2 py-1.5 rounded outline-none focus:ring-1 focus:ring-white text-center"
                                     />
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-bold text-[#8E8E93] uppercase block mb-1">Rest (s)</label>
                                     <input 
                                        type="number" 
                                        value={ex.restTimeSeconds}
                                        onChange={(e) => updateExerciseConfig(ex.id, 'restTimeSeconds', parseInt(e.target.value))}
                                        className="w-full bg-[#2C2C2E] text-white text-xs px-2 py-1.5 rounded outline-none focus:ring-1 focus:ring-white text-center"
                                     />
                                 </div>
                             </div>
                         </div>
                     ))
                 )}
             </div>
          </div>
      </div>

      {showCreateModal && (
          <ExerciseCreationModal 
            onClose={() => setShowCreateModal(false)}
            onSave={(ex) => {
                onAddCustomExercise(ex);
                // Optionally auto-add to routine
            }}
          />
      )}
    </div>
  );
};

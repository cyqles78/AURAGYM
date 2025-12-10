
import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, AlertCircle, Video, Info } from 'lucide-react';
import { 
  Exercise, 
  MUSCLE_GROUPS, 
  EQUIPMENT_TYPES, 
  MECHANIC_TYPES, 
  FORCE_TYPES, 
  DIFFICULTY_LEVELS,
  TargetMuscle,
  Equipment,
  Mechanic,
  Force,
  Difficulty
} from '../types';

interface ExerciseEditModalProps {
  exercise?: Exercise; // If present, we are in Edit mode. If null, Create mode.
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
}

export const ExerciseEditModal: React.FC<ExerciseEditModalProps> = ({ 
  exercise, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  // --- FORM STATE ---
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<TargetMuscle>('Chest');
  const [equipment, setEquipment] = useState<Equipment>('Barbell');
  
  const [mechanic, setMechanic] = useState<Mechanic>('N/A');
  const [force, setForce] = useState<Force>('N/A');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  
  const [videoUrl, setVideoUrl] = useState('');
  const [instructionsText, setInstructionsText] = useState('');

  const [error, setError] = useState<string | null>(null);

  // --- SYNC STATE ON OPEN ---
  // This useEffect ensures that when the modal is opened with a new exercise prop,
  // all form fields are reset to that exercise's values immediately.
  useEffect(() => {
    if (exercise) {
        setName(exercise.name);
        setTargetMuscle(exercise.targetMuscle);
        setEquipment(exercise.equipment);
        setMechanic(exercise.mechanic || 'N/A');
        setForce(exercise.force || 'N/A');
        setDifficulty(exercise.difficulty || 'Intermediate');
        setVideoUrl(exercise.videoUrl || '');
        setInstructionsText(exercise.instructions?.join('\n') || '');
    } else {
        // Reset to defaults for "Create New" mode
        setName('');
        setTargetMuscle('Chest');
        setEquipment('Barbell');
        setMechanic('N/A');
        setForce('N/A');
        setDifficulty('Intermediate');
        setVideoUrl('');
        setInstructionsText('');
    }
    setError(null);
  }, [exercise]);

  // --- HANDLERS ---

  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      setError("Exercise name is required.");
      return;
    }

    const updatedExercise: Exercise = {
      id: exercise?.id || `custom_${Date.now()}`,
      name: name.trim(),
      targetMuscle,
      equipment,
      mechanic: mechanic === 'N/A' ? undefined : mechanic,
      force: force === 'N/A' ? undefined : force,
      difficulty,
      videoUrl: videoUrl.trim() || undefined,
      instructions: instructionsText.trim() ? instructionsText.split('\n').filter(l => l.trim().length > 0) : [],
      sets: exercise?.sets || [], // Preserve existing sets template if any
      restTimeSeconds: exercise?.restTimeSeconds || 60,
      isCustom: exercise?.isCustom ?? true // Default to true if creating new
    };

    onSave(updatedExercise);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && exercise?.id) {
        if(confirm("Are you sure you want to delete this exercise? This cannot be undone.")) {
            onDelete(exercise.id);
            onClose();
        }
    }
  };

  // --- RENDER HELPERS ---
  
  const SegmentControl = <T extends string>({ 
    options, 
    value, 
    onChange 
  }: { 
    options: readonly T[], 
    value: T, 
    onChange: (val: T) => void 
  }) => (
    <div className="flex bg-[#2C2C2E] p-1 rounded-xl overflow-x-auto no-scrollbar">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
            value === opt 
              ? 'bg-white text-black shadow-md' 
              : 'text-[#8E8E93] hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1C1C1E] rounded-3xl border border-[#2C2C2E] flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2C2C2E]">
            <h2 className="text-xl font-bold text-white">
                {exercise ? 'Edit Exercise' : 'Create Exercise'}
            </h2>
            <button onClick={onClose} className="p-2 bg-[#2C2C2E] rounded-full text-white hover:bg-white hover:text-black transition">
                <X size={20} />
            </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Section 1: Basics */}
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Name <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Barbell Squat"
                        className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl p-4 text-white text-lg font-bold outline-none placeholder:text-[#555]"
                        autoFocus={!exercise}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Target Muscle</label>
                        <div className="relative">
                            <select 
                                value={targetMuscle}
                                onChange={(e) => setTargetMuscle(e.target.value as TargetMuscle)}
                                className="w-full bg-[#2C2C2E] text-white p-3 rounded-xl appearance-none outline-none focus:ring-1 focus:ring-white font-medium"
                            >
                                {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8E8E93]">▼</div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Equipment</label>
                        <div className="relative">
                            <select 
                                value={equipment}
                                onChange={(e) => setEquipment(e.target.value as Equipment)}
                                className="w-full bg-[#2C2C2E] text-white p-3 rounded-xl appearance-none outline-none focus:ring-1 focus:ring-white font-medium"
                            >
                                {EQUIPMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8E8E93]">▼</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Classification */}
            <div className="space-y-4 pt-4 border-t border-[#2C2C2E]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Info size={16} className="text-blue-400"/> Classification</h3>
                
                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Mechanic</label>
                    {SegmentControl({ options: MECHANIC_TYPES, value: mechanic, onChange: (val) => setMechanic(val) })}
                </div>

                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Force Type</label>
                    {SegmentControl({ options: FORCE_TYPES, value: force, onChange: (val) => setForce(val) })}
                </div>

                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Difficulty</label>
                    {SegmentControl({ options: DIFFICULTY_LEVELS, value: difficulty, onChange: (val) => setDifficulty(val) })}
                </div>
            </div>

            {/* Section 3: Details */}
            <div className="space-y-4 pt-4 border-t border-[#2C2C2E]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Video size={16} className="text-red-400"/> Media & Guide</h3>
                
                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Video URL (YouTube/Vimeo)</label>
                    <input 
                        type="text" 
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl p-3 text-white outline-none placeholder:text-[#555] text-sm"
                    />
                </div>

                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Instructions (One step per line)</label>
                    <textarea 
                        value={instructionsText}
                        onChange={(e) => setInstructionsText(e.target.value)}
                        placeholder="1. Set up the bar...&#10;2. Grip shoulder width...&#10;3. Lower slowly..."
                        className="w-full h-32 bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl p-3 text-white outline-none placeholder:text-[#555] text-sm resize-none"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2C2C2E] flex gap-3 bg-[#1C1C1E] rounded-b-3xl">
            {exercise?.isCustom && onDelete && (
                <button 
                    onClick={handleDelete}
                    className="p-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
                >
                    <Trash2 size={20} />
                </button>
            )}
            
            <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-xl bg-[#2C2C2E] text-white font-bold hover:bg-[#3A3A3C] transition"
            >
                Cancel
            </button>
            
            <button 
                onClick={handleSave}
                className="flex-[2] py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition shadow-lg flex items-center justify-center gap-2"
            >
                <Check size={18} /> Save Exercise
            </button>
        </div>

      </div>
    </div>
  );
};

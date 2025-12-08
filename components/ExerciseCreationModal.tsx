
import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { suggestExerciseDetails } from '../services/geminiService';
import { Exercise } from '../types';

interface ExerciseCreationModalProps {
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}

export const ExerciseCreationModal: React.FC<ExerciseCreationModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAISuggest = async () => {
    if (!name || name.length < 3) {
        setError("Please enter a valid exercise name first.");
        return;
    }
    
    setIsSuggesting(true);
    setError(null);
    const suggestion = await suggestExerciseDetails(name);
    
    if (suggestion) {
        setTargetMuscle(suggestion.targetMuscle);
        setEquipment(suggestion.equipment);
    } else {
        setError("AI couldn't find details for this exercise. Please enter them manually.");
    }
    setIsSuggesting(false);
  };

  const handleSave = () => {
    if (!name || !targetMuscle) {
        setError("Name and Muscle Group are required.");
        return;
    }

    const newExercise: Exercise = {
        id: `custom_${Date.now()}`,
        name,
        targetMuscle,
        equipment: equipment || 'None',
        videoUrl,
        sets: [], // Empty sets for template
        restTimeSeconds: 60,
    };

    onSave(newExercise);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">New Exercise</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
                <X size={20} />
            </button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Exercise Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bulgarian Split Squat"
                    className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl p-3 text-white outline-none"
                    autoFocus
                />
            </div>

            <button 
                onClick={handleAISuggest}
                disabled={isSuggesting || !name}
                className="w-full py-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50"
            >
                {isSuggesting ? <Sparkles size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Auto-Fill Details with AI
            </button>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Muscle Group</label>
                    <input 
                        type="text" 
                        value={targetMuscle}
                        onChange={(e) => setTargetMuscle(e.target.value)}
                        placeholder="e.g. Legs"
                        className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl p-3 text-white outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Equipment</label>
                    <input 
                        type="text" 
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        placeholder="e.g. Dumbbells"
                        className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl p-3 text-white outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs text-[#8E8E93] font-bold uppercase mb-2 block">Video URL (Optional)</label>
                <input 
                    type="text" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl p-3 text-white outline-none"
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            <button 
                onClick={handleSave}
                className="w-full py-4 bg-white text-black font-bold rounded-xl mt-2 hover:bg-gray-200 transition"
            >
                Save Exercise
            </button>
        </div>
      </div>
    </div>
  );
};

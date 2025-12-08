
import React from 'react';
import { Play, SkipForward, Plus, X } from 'lucide-react';

interface RestTimerProps {
  secondsRemaining: number;
  totalDuration: number;
  onSkip: () => void;
  onAdd: (seconds: number) => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ secondsRemaining, totalDuration, onSkip, onAdd }) => {
  const progress = Math.max(0, Math.min(100, (secondsRemaining / totalDuration) * 100));
  
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (secondsRemaining <= 0) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-2xl flex items-center justify-between relative overflow-hidden">
        {/* Progress Background */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-accentBlue transition-all duration-1000 linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-accentBlue/10 flex items-center justify-center">
            <span className="text-accentBlue font-bold font-mono">{formatTime(secondsRemaining)}</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Resting...</p>
            <p className="text-xs text-[#8E8E93]">Next set coming up</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onAdd(30)}
            className="p-2 rounded-full hover:bg-white/5 text-white active:scale-90 transition"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={onSkip}
            className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-gray-200 active:scale-95 transition"
          >
            <SkipForward size={14} fill="black" /> Skip
          </button>
        </div>
      </div>
    </div>
  );
};

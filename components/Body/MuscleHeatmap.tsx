
import React, { useState } from 'react';
import { MuscleStatus } from '../../hooks/useRecoveryStatus';
import { Info } from 'lucide-react';

interface MuscleHeatmapProps {
  statusMap: Record<string, MuscleStatus>;
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ statusMap }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [view, setView] = useState<'FRONT' | 'BACK'>('FRONT');

  // Helper to get color safely
  const getColor = (name: string) => statusMap[name]?.color || '#30D158'; // Default Green

  const handleMuscleClick = (muscle: string) => {
    setSelectedMuscle(muscle);
    // Auto-hide tooltip after 3s
    setTimeout(() => setSelectedMuscle(null), 3000);
  };

  return (
    <div className="relative w-full aspect-[3/4] flex items-center justify-center py-4">
      
      {/* View Toggle */}
      <button 
        onClick={() => setView(v => v === 'FRONT' ? 'BACK' : 'FRONT')}
        className="absolute top-4 right-4 bg-[#2C2C2E] px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 z-10"
      >
        {view === 'FRONT' ? 'View Back' : 'View Front'}
      </button>

      {/* SVG Canvas */}
      <svg viewBox="0 0 200 400" className="h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {view === 'FRONT' ? (
          <g transform="translate(100, 200) scale(1) translate(-100, -200)">
            {/* Head */}
            <circle cx="100" cy="40" r="15" fill="#3A3A3C" />
            
            {/* Traps (Visible from front) */}
            <path 
              d="M85 55 L115 55 L125 70 L75 70 Z" 
              fill={getColor('Traps')} 
              className="transition-colors duration-500"
              onClick={() => handleMuscleClick('Traps')}
            />

            {/* Delts */}
            <path d="M65 65 Q75 55 85 65 L85 90 Q70 90 65 65" fill={getColor('Delts')} onClick={() => handleMuscleClick('Delts')} className="cursor-pointer transition-colors duration-500" />
            <path d="M135 65 Q125 55 115 65 L115 90 Q130 90 135 65" fill={getColor('Delts')} onClick={() => handleMuscleClick('Delts')} className="cursor-pointer transition-colors duration-500" />

            {/* Chest (Pecs) */}
            <path 
              d="M85 70 L115 70 L115 95 Q100 105 85 95 Z" 
              fill={getColor('Chest')} 
              onClick={() => handleMuscleClick('Chest')}
              className="cursor-pointer hover:opacity-80 transition-colors duration-500"
            />

            {/* Biceps */}
            <path d="M65 92 L83 92 L80 120 L68 120 Z" fill={getColor('Biceps')} onClick={() => handleMuscleClick('Biceps')} className="cursor-pointer transition-colors duration-500" />
            <path d="M135 92 L117 92 L120 120 L132 120 Z" fill={getColor('Biceps')} onClick={() => handleMuscleClick('Biceps')} className="cursor-pointer transition-colors duration-500" />

            {/* Abs */}
            <path 
              d="M88 100 L112 100 L110 150 L90 150 Z" 
              fill={getColor('Abs')} 
              onClick={() => handleMuscleClick('Abs')}
              className="cursor-pointer transition-colors duration-500"
            />

            {/* Quads */}
            <path d="M88 155 L112 155 L110 165 L88 165 Z" fill="#2C2C2E" /> {/* Hips */}
            <path 
              d="M85 165 L98 165 L95 240 L82 240 Z" 
              fill={getColor('Quads')} 
              onClick={() => handleMuscleClick('Quads')}
              className="cursor-pointer transition-colors duration-500"
            />
            <path 
              d="M115 165 L102 165 L105 240 L118 240 Z" 
              fill={getColor('Quads')} 
              onClick={() => handleMuscleClick('Quads')}
              className="cursor-pointer transition-colors duration-500"
            />

            {/* Calves (Front view) */}
            <path d="M83 250 L94 250 L92 310 L85 310 Z" fill={getColor('Calves')} onClick={() => handleMuscleClick('Calves')} className="cursor-pointer transition-colors duration-500" />
            <path d="M117 250 L106 250 L108 310 L115 310 Z" fill={getColor('Calves')} onClick={() => handleMuscleClick('Calves')} className="cursor-pointer transition-colors duration-500" />
          </g>
        ) : (
          <g transform="translate(100, 200) scale(1) translate(-100, -200)">
             {/* Head */}
             <circle cx="100" cy="40" r="15" fill="#3A3A3C" />

             {/* Traps */}
             <path 
               d="M80 60 L120 60 L100 100 Z" 
               fill={getColor('Traps')} 
               onClick={() => handleMuscleClick('Traps')}
               className="cursor-pointer transition-colors duration-500"
             />

             {/* Lats */}
             <path 
               d="M80 70 L70 110 L95 140 L100 100 Z" 
               fill={getColor('Lats')} 
               onClick={() => handleMuscleClick('Lats')}
               className="cursor-pointer transition-colors duration-500"
             />
             <path 
               d="M120 70 L130 110 L105 140 L100 100 Z" 
               fill={getColor('Lats')} 
               onClick={() => handleMuscleClick('Lats')}
               className="cursor-pointer transition-colors duration-500"
             />

             {/* Triceps */}
             <path d="M60 80 L75 80 L75 110 L65 110 Z" fill={getColor('Triceps')} onClick={() => handleMuscleClick('Triceps')} className="cursor-pointer transition-colors duration-500" />
             <path d="M140 80 L125 80 L125 110 L135 110 Z" fill={getColor('Triceps')} onClick={() => handleMuscleClick('Triceps')} className="cursor-pointer transition-colors duration-500" />

             {/* Glutes */}
             <circle cx="90" cy="165" r="12" fill={getColor('Glutes')} onClick={() => handleMuscleClick('Glutes')} className="cursor-pointer transition-colors duration-500" />
             <circle cx="110" cy="165" r="12" fill={getColor('Glutes')} onClick={() => handleMuscleClick('Glutes')} className="cursor-pointer transition-colors duration-500" />

             {/* Hamstrings */}
             <rect x="82" y="180" width="14" height="60" rx="4" fill={getColor('Hamstrings')} onClick={() => handleMuscleClick('Hamstrings')} className="cursor-pointer transition-colors duration-500" />
             <rect x="104" y="180" width="14" height="60" rx="4" fill={getColor('Hamstrings')} onClick={() => handleMuscleClick('Hamstrings')} className="cursor-pointer transition-colors duration-500" />

             {/* Calves */}
             <path d="M83 250 L94 250 L92 300 L85 300 Z" fill={getColor('Calves')} onClick={() => handleMuscleClick('Calves')} className="cursor-pointer transition-colors duration-500" />
             <path d="M117 250 L106 250 L108 300 L115 300 Z" fill={getColor('Calves')} onClick={() => handleMuscleClick('Calves')} className="cursor-pointer transition-colors duration-500" />
          </g>
        )}
      </svg>

      {/* Interactive Tooltip */}
      {selectedMuscle && statusMap[selectedMuscle] && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1C1E] border border-white/20 p-3 rounded-xl shadow-xl flex flex-col items-center animate-in slide-in-from-bottom-2 fade-in z-20 w-48">
           <p className="text-white font-bold text-sm uppercase tracking-wide">{selectedMuscle}</p>
           <div className="w-full h-1 bg-white/10 rounded-full mt-2 mb-1 overflow-hidden">
              <div 
                className="h-full transition-all duration-500" 
                style={{ 
                  width: `${statusMap[selectedMuscle].recoveryPercentage}%`, 
                  backgroundColor: statusMap[selectedMuscle].color 
                }}
              />
           </div>
           <p className="text-[10px] text-[#8E8E93]">
             {statusMap[selectedMuscle].recoveryPercentage}% Recovered
           </p>
           {statusMap[selectedMuscle].hoursSince < 100 && (
             <p className="text-[10px] text-[#8E8E93]">
                Last trained: {Math.round(statusMap[selectedMuscle].hoursSince)}h ago
             </p>
           )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#30D158]" />
            <span className="text-[8px] text-[#8E8E93] uppercase font-bold">Ready</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#FFD60A]" />
            <span className="text-[8px] text-[#8E8E93] uppercase font-bold">Recov.</span>
         </div>
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#FF453A]" />
            <span className="text-[8px] text-[#8E8E93] uppercase font-bold">Tired</span>
         </div>
      </div>
    </div>
  );
};

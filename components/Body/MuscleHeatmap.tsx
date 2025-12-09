
import React, { useState, useEffect } from 'react';
import { MuscleStatus } from '../../hooks/useRecoveryStatus';
import { Scan, RotateCw } from 'lucide-react';

interface MuscleHeatmapProps {
  statusMap: Record<string, MuscleStatus>;
}

export const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ statusMap }) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [view, setView] = useState<'FRONT' | 'BACK'>('FRONT');
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Reset scanner on view change
    setIsScanning(true);
    const t = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(t);
  }, [view]);

  // --- ANATOMICAL PATHS ---
  // Using simplified vector shapes approximating muscular anatomy
  // ViewBox: 0 0 400 800

  // Helper to resolve color from statusMap with fallback
  // Maps detailed specific muscles (from hook) to visual groups if needed
  const getFill = (key: string) => {
    // If specific muscle exists in map, use it
    if (statusMap[key]) {
        // Use gradient based on status
        if (statusMap[key].status === 'FATIGUED') return 'url(#gradFatigued)';
        if (statusMap[key].status === 'RECOVERING') return 'url(#gradRecovering)';
        if (statusMap[key].status === 'PRIME') return 'url(#gradPrime)';
        return 'url(#gradReady)';
    }
    // Fallback/Grouping
    if (key === 'Abs' || key === 'Obliques') return statusMap['Core']?.status === 'FATIGUED' ? 'url(#gradFatigued)' : 'url(#gradReady)';
    return 'url(#gradNeutral)'; // Not tracked or neutral
  };

  const getOpacity = (key: string) => {
      // Highlight opacity based on status
      const pct = statusMap[key]?.recoveryPercentage ?? 100;
      // Fatigued muscles glow brighter (lower recovery = higher opacity of "red")
      if (pct < 50) return 0.9;
      return 0.6;
  };

  const handleMuscleClick = (key: string) => {
      // Map visual keys back to data keys if necessary
      const dataKey = key === 'Abs' ? 'Core' : key;
      setSelectedMuscle(dataKey);
      setTimeout(() => setSelectedMuscle(null), 3000);
  };

  return (
    <div className="relative w-full aspect-[1/2] flex items-center justify-center bg-[#101214] rounded-3xl overflow-hidden border border-white/5 shadow-inner">
      
      {/* --- UI OVERLAYS --- */}
      
      {/* View Toggle */}
      <button 
        onClick={() => setView(v => v === 'FRONT' ? 'BACK' : 'FRONT')}
        className="absolute top-4 right-4 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/10 z-20 flex items-center gap-1 hover:bg-white/10 transition"
      >
        <RotateCw size={10} />
        {view === 'FRONT' ? 'Anterior' : 'Posterior'}
      </button>

      {/* Legend */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
         <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
            <span className="text-[9px] text-cyan-100 font-medium tracking-wider">PRIME</span>
         </div>
         <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-emerald-100 font-medium tracking-wider">READY</span>
         </div>
         <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_red]" />
            <span className="text-[9px] text-red-100 font-medium tracking-wider">STRAIN</span>
         </div>
      </div>

      {/* Scanner Effect */}
      <div 
        className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent transition-transform duration-[2000ms] ease-linear ${isScanning ? 'translate-y-full' : '-translate-y-full'}`}
        style={{ height: '50%' }}
      >
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyan-400/50 shadow-[0_0_15px_cyan]"></div>
      </div>

      {/* --- SVG MAP --- */}
      <svg viewBox="0 0 400 800" className="h-full w-full drop-shadow-2xl">
        <defs>
            {/* LIVING TISSUE GRADIENTS */}
            
            {/* Prime (Cyan/Blue Pulse) */}
            <linearGradient id="gradPrime" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>

            {/* Ready (Emerald/Teal) */}
            <linearGradient id="gradReady" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>

            {/* Recovering (Yellow/Orange) */}
            <linearGradient id="gradRecovering" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.5" />
            </linearGradient>

            {/* Fatigued (Red/Crimson Burn) */}
            <linearGradient id="gradFatigued" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#b91c1c" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.9" />
            </linearGradient>

            {/* Neutral (Tech Grey) */}
            <linearGradient id="gradNeutral" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4b5563" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1f2937" stopOpacity="0.1" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        <g transform="translate(200, 400) scale(1.3) translate(-200, -400)"> {/* Centering and Scaling */}
            
            {/* SILHOUETTE BASE (Wireframe look) */}
            {view === 'FRONT' && (
                <path d="M140 100 Q200 80 260 100 L270 140 Q290 160 310 200 L290 350 L270 320 L275 450 L260 500 L270 700 L240 780 L230 700 L220 500 L200 450 L180 500 L170 700 L160 780 L130 700 L140 500 L125 450 L130 320 L110 350 L90 200 Q110 160 130 140 Z" 
                      fill="none" stroke="#374151" strokeWidth="1" opacity="0.3" />
            )}

            {/* --- ANTERIOR (FRONT) MUSCLES --- */}
            {view === 'FRONT' && (
                <g id="anterior">
                    {/* Traps (Upper) */}
                    <path 
                        d="M160 145 Q200 135 240 145 L230 160 Q200 170 170 160 Z" 
                        fill={getFill('Traps')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Traps')}
                    />

                    {/* Deltoids (Shoulders) */}
                    <path 
                        d="M130 150 Q160 140 170 160 L165 200 Q140 210 130 180 Z" 
                        fill={getFill('SideDelts')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('SideDelts')}
                    />
                    <path 
                        d="M270 150 Q240 140 230 160 L235 200 Q260 210 270 180 Z" 
                        fill={getFill('SideDelts')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('SideDelts')}
                    />

                    {/* Pecs (Chest) */}
                    <path 
                        d="M170 165 L200 165 L200 210 Q170 220 165 190 Z" 
                        fill={getFill('Chest')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Chest')}
                    />
                    <path 
                        d="M230 165 L200 165 L200 210 Q230 220 235 190 Z" 
                        fill={getFill('Chest')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Chest')}
                    />

                    {/* Biceps */}
                    <path 
                        d="M135 200 L160 200 L155 240 L130 230 Z" 
                        fill={getFill('Biceps')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Biceps')}
                    />
                    <path 
                        d="M265 200 L240 200 L245 240 L270 230 Z" 
                        fill={getFill('Biceps')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Biceps')}
                    />

                    {/* Forearms */}
                    <path 
                        d="M125 240 L150 245 L140 300 L120 290 Z" 
                        fill={getFill('Forearms')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Forearms')}
                    />
                    <path 
                        d="M275 240 L250 245 L260 300 L280 290 Z" 
                        fill={getFill('Forearms')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Forearms')}
                    />

                    {/* Abs (Rectus Abdominis) */}
                    <g onClick={() => handleMuscleClick('Core')} className="cursor-pointer hover:brightness-125 transition-all duration-500">
                        <path d="M185 215 L215 215 L213 235 L187 235 Z" fill={getFill('Core')} opacity="0.9"/>
                        <path d="M187 240 L213 240 L211 260 L189 260 Z" fill={getFill('Core')} opacity="0.9"/>
                        <path d="M189 265 L211 265 L210 290 L190 290 Z" fill={getFill('Core')} opacity="0.9"/>
                    </g>

                    {/* Obliques */}
                    <path d="M170 230 Q180 260 185 290 L170 300 L160 240 Z" fill={getFill('Core')} opacity="0.7" onClick={() => handleMuscleClick('Core')}/>
                    <path d="M230 230 Q220 260 215 290 L230 300 L240 240 Z" fill={getFill('Core')} opacity="0.7" onClick={() => handleMuscleClick('Core')}/>

                    {/* Quads (Thighs) */}
                    <g onClick={() => handleMuscleClick('Quads')} className="cursor-pointer hover:brightness-125 transition-all duration-500">
                        {/* Right Quad */}
                        <path d="M165 310 L195 310 L190 430 L170 430 Z" fill={getFill('Quads')} />
                        <path d="M165 330 Q150 380 170 430 L165 310 Z" fill={getFill('Quads')} opacity="0.8" /> {/* Vastus Lateralis */}
                        
                        {/* Left Quad */}
                        <path d="M235 310 L205 310 L210 430 L230 430 Z" fill={getFill('Quads')} />
                        <path d="M235 330 Q250 380 230 430 L235 310 Z" fill={getFill('Quads')} opacity="0.8" />
                    </g>

                    {/* Calves (Anterior view - Tibialis) */}
                    <path d="M170 460 L185 460 L180 550 L175 550 Z" fill={getFill('Calves')} onClick={() => handleMuscleClick('Calves')} className="cursor-pointer"/>
                    <path d="M230 460 L215 460 L220 550 L225 550 Z" fill={getFill('Calves')} onClick={() => handleMuscleClick('Calves')} className="cursor-pointer"/>
                </g>
            )}

            {/* --- POSTERIOR (BACK) MUSCLES --- */}
            {view === 'BACK' && (
                <g id="posterior">
                    {/* Traps (Back) */}
                    <path 
                        d="M170 140 L230 140 L215 190 L185 190 Z" 
                        fill={getFill('Traps')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Traps')}
                    />

                    {/* Rear Delts */}
                    <path d="M130 150 L170 150 L165 180 L140 170 Z" fill={getFill('RearDelts')} onClick={() => handleMuscleClick('RearDelts')}/>
                    <path d="M270 150 L230 150 L235 180 L260 170 Z" fill={getFill('RearDelts')} onClick={() => handleMuscleClick('RearDelts')}/>

                    {/* Lats (V-Taper) */}
                    <path 
                        d="M170 190 L230 190 L215 280 L185 280 Z" 
                        fill={getFill('Lats')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Lats')}
                    />
                    <path d="M170 190 L145 220 L165 270 L185 280 Z" fill={getFill('Lats')} opacity="0.8" onClick={() => handleMuscleClick('Lats')}/>
                    <path d="M230 190 L255 220 L235 270 L215 280 Z" fill={getFill('Lats')} opacity="0.8" onClick={() => handleMuscleClick('Lats')}/>

                    {/* Lower Back (Erectors) */}
                    <path d="M190 280 L210 280 L210 310 L190 310 Z" fill={getFill('LowerBack')} onClick={() => handleMuscleClick('LowerBack')}/>

                    {/* Triceps */}
                    <path d="M135 180 L160 185 L155 230 L140 225 Z" fill={getFill('Triceps')} onClick={() => handleMuscleClick('Triceps')}/>
                    <path d="M265 180 L240 185 L245 230 L260 225 Z" fill={getFill('Triceps')} onClick={() => handleMuscleClick('Triceps')}/>

                    {/* Glutes */}
                    <path 
                        d="M165 310 Q200 300 235 310 Q240 350 230 360 Q200 370 170 360 Q160 350 165 310 Z" 
                        fill={getFill('Glutes')} className="transition-all duration-500 cursor-pointer hover:brightness-125"
                        onClick={() => handleMuscleClick('Glutes')}
                    />

                    {/* Hamstrings */}
                    <path d="M175 370 L195 370 L190 440 L175 440 Z" fill={getFill('Hamstrings')} onClick={() => handleMuscleClick('Hamstrings')}/>
                    <path d="M225 370 L205 370 L210 440 L225 440 Z" fill={getFill('Hamstrings')} onClick={() => handleMuscleClick('Hamstrings')}/>

                    {/* Calves (Gastrocnemius) */}
                    <path d="M170 460 Q190 480 190 500 L185 540 L175 540 Q160 500 170 460 Z" fill={getFill('Calves')} onClick={() => handleMuscleClick('Calves')}/>
                    <path d="M230 460 Q210 480 210 500 L215 540 L225 540 Q240 500 230 460 Z" fill={getFill('Calves')} onClick={() => handleMuscleClick('Calves')}/>
                </g>
            )}
        </g>
      </svg>

      {/* Tooltip Overlay */}
      {selectedMuscle && statusMap[selectedMuscle] && (
        <div className="absolute bottom-4 inset-x-4 bg-black/80 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 z-30">
           <div className="flex justify-between items-start mb-2">
               <div>
                   <h3 className="text-white font-bold text-lg uppercase tracking-wider">{selectedMuscle}</h3>
                   <p className="text-[10px] text-slate-400 font-mono">BIO-METRIC STATUS</p>
               </div>
               <div className={`px-2 py-1 rounded text-xs font-bold ${
                   statusMap[selectedMuscle].status === 'PRIME' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' :
                   statusMap[selectedMuscle].status === 'READY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                   statusMap[selectedMuscle].status === 'FATIGUED' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
               }`}>
                   {statusMap[selectedMuscle].status}
               </div>
           </div>
           
           <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${statusMap[selectedMuscle].recoveryPercentage}%`, 
                  backgroundColor: statusMap[selectedMuscle].color,
                  boxShadow: `0 0 10px ${statusMap[selectedMuscle].color}`
                }}
              />
           </div>
           <div className="flex justify-between mt-2 text-xs text-slate-300">
               <span>Fatigue Load: {Math.round(statusMap[selectedMuscle].fatigueLevel)}</span>
               <span>{statusMap[selectedMuscle].recoveryPercentage}% Recov.</span>
           </div>
        </div>
      )}
    </div>
  );
};

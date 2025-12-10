
import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { calculatePlates } from '../utils/plateMath';

interface PlateCalculatorProps {
  targetWeight: number;
  onClose: () => void;
}

export const PlateCalculator: React.FC<PlateCalculatorProps> = ({ targetWeight, onClose }) => {
  const [weight, setWeight] = useState(targetWeight);
  const [barWeight, setBarWeight] = useState(20);
  const [calculation, setCalculation] = useState(calculatePlates(targetWeight, 20));

  useEffect(() => {
    setCalculation(calculatePlates(weight, barWeight));
  }, [weight, barWeight]);

  // --- VISUAL HELPERS ---

  const getPlateColor = (p: number) => {
    switch(p) {
        case 25: return 'bg-[#FF3B30] border-[#D63026]'; // Red
        case 20: return 'bg-[#007AFF] border-[#0066D6]'; // Blue
        case 15: return 'bg-[#FFCC00] border-[#D6AB00]'; // Yellow
        case 10: return 'bg-[#34C759] border-[#248A3D]'; // Green
        case 5: return 'bg-white border-slate-300';       // White
        case 2.5: return 'bg-zinc-800 border-zinc-900';   // Black
        default: return 'bg-zinc-400 border-zinc-500';    // Grey (1.25)
    }
  };

  const getPlateHeight = (p: number) => {
      // Proportional heights based on standard diameters
      if (p >= 15) return 'h-32'; // 450mm
      if (p === 10) return 'h-24';
      if (p === 5) return 'h-16';
      if (p === 2.5) return 'h-12';
      return 'h-10';
  };

  const getPlateWidth = (p: number) => {
      // Thinner plates for lighter weights
      if (p >= 20) return 'w-8';
      if (p >= 10) return 'w-6';
      return 'w-4';
  };

  const getTextColor = (p: number) => {
      if (p === 5) return 'text-black';
      return 'text-white/90';
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[32px] p-6 w-full max-w-sm shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Plate Loading</h3>
            <button onClick={onClose} className="p-2 bg-[#2C2C2E] rounded-full text-white hover:bg-white hover:text-black transition">
                <X size={20} />
            </button>
        </div>

        {/* Inputs */}
        <div className="flex gap-4 mb-8">
            <div className="flex-1">
                <label className="text-[10px] text-[#8E8E93] uppercase font-bold mb-1 block">Target (kg)</label>
                <input 
                    type="number" 
                    value={weight}
                    onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#2C2C2E] text-white font-bold text-2xl p-4 rounded-2xl outline-none focus:ring-1 focus:ring-white transition-all text-center"
                />
            </div>
            <div className="w-1/3">
                <label className="text-[10px] text-[#8E8E93] uppercase font-bold mb-1 block">Bar (kg)</label>
                <button 
                    onClick={() => setBarWeight(b => b === 20 ? 15 : 20)}
                    className="w-full bg-[#2C2C2E] text-white font-bold text-xl p-4 rounded-2xl hover:bg-[#3A3A3C] transition-colors"
                >
                    {barWeight}
                </button>
            </div>
        </div>

        {/* --- VISUALIZER --- */}
        <div className="relative h-40 bg-[#101214] rounded-3xl border border-[#2C2C2E] flex items-center justify-center mb-6 overflow-hidden">
             
             {/* The Barbell Sleeve */}
             <div className="absolute left-0 right-0 h-5 bg-gradient-to-b from-zinc-400 to-zinc-600 z-0"></div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-zinc-500 rounded-sm z-0"></div> {/* Collar stop */}

             {/* Plates Stack */}
             <div className="flex items-center gap-[2px] z-10 pr-8">
                 {calculation.plates.length === 0 ? (
                     <span className="text-xs font-bold text-[#8E8E93] bg-[#1C1C1E] px-3 py-1 rounded-full border border-[#2C2C2E]">Empty Bar</span>
                 ) : (
                     calculation.plates.map((p, i) => (
                         <div 
                            key={i}
                            className={`
                                ${getPlateColor(p)} ${getPlateHeight(p)} ${getPlateWidth(p)}
                                border-r-[3px] rounded-[4px] shadow-lg flex items-center justify-center
                                relative group transition-transform hover:scale-105
                            `}
                         >
                             <span className={`text-[9px] font-bold -rotate-90 whitespace-nowrap ${getTextColor(p)}`}>{p}</span>
                         </div>
                     ))
                 )}
             </div>
        </div>

        {/* --- SUMMARY --- */}
        <div className="bg-[#2C2C2E]/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#8E8E93] uppercase font-bold">Load Per Side</span>
                <span className="text-xs text-white font-mono">{calculation.plates.length} plates</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {calculation.plates.length > 0 ? (
                    calculation.plates.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-[#1C1C1E] px-2.5 py-1.5 rounded-lg border border-white/5">
                            <div className={`w-2 h-2 rounded-full ${getPlateColor(p).split(' ')[0]}`}></div>
                            <span className="text-sm font-bold text-white">{p}</span>
                        </div>
                    ))
                ) : (
                    <span className="text-sm text-[#8E8E93] italic">No plates needed</span>
                )}
            </div>

            {/* Remainder Warning */}
            {calculation.remainder > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="text-xs text-orange-400">
                        <span className="font-bold">Impossible Weight</span>
                        <p className="opacity-80">Off by {calculation.remainder.toFixed(2)}kg</p>
                    </div>
                    <button 
                        onClick={() => setWeight(calculation.closestValidWeight)}
                        className="flex items-center gap-1.5 bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-orange-500/20 transition"
                    >
                        <RefreshCw size={12} /> Round to {calculation.closestValidWeight}kg
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

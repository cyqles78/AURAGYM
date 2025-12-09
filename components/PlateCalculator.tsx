
import React, { useState, useEffect } from 'react';
import { X, Circle } from 'lucide-react';

interface PlateCalculatorProps {
  targetWeight: number;
  onClose: () => void;
}

export const PlateCalculator: React.FC<PlateCalculatorProps> = ({ targetWeight, onClose }) => {
  const [weight, setWeight] = useState(targetWeight);
  const [barWeight, setBarWeight] = useState(20);

  const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  
  const calculatePlates = () => {
    let remaining = (weight - barWeight) / 2;
    const plates: number[] = [];
    
    if (remaining <= 0) return [];

    AVAILABLE_PLATES.forEach(plate => {
      while (remaining >= plate) {
        plates.push(plate);
        remaining -= plate;
      }
    });

    return plates;
  };

  const plates = calculatePlates();

  // Helper to get plate color
  const getPlateColor = (p: number) => {
    switch(p) {
        case 25: return 'bg-red-600';
        case 20: return 'bg-blue-600';
        case 15: return 'bg-yellow-500';
        case 10: return 'bg-green-600';
        case 5: return 'bg-white text-black';
        default: return 'bg-gray-400 text-black';
    }
  };

  // Helper to get height proportional to size (visual candy)
  const getPlateHeight = (p: number) => {
      // Base height 60px, max 120px
      const min = 40;
      const max = 120;
      const scale = (p / 25) * (max - min) + min;
      return `${scale}px`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Plate Calculator</h3>
            <button onClick={onClose} className="p-2 bg-[#2C2C2E] rounded-full text-white hover:bg-white hover:text-black transition">
                <X size={20} />
            </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
                <label className="text-[10px] text-[#8E8E93] uppercase font-bold mb-1 block">Target Weight (kg)</label>
                <input 
                    type="number" 
                    value={weight}
                    onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#2C2C2E] text-white font-bold text-2xl p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
                />
            </div>
            <div>
                <label className="text-[10px] text-[#8E8E93] uppercase font-bold mb-1 block">Bar Weight (kg)</label>
                <div className="flex items-center gap-2">
                     <button onClick={() => setBarWeight(20)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${barWeight === 20 ? 'bg-white text-black' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>20</button>
                     <button onClick={() => setBarWeight(15)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${barWeight === 15 ? 'bg-white text-black' : 'bg-[#2C2C2E] text-[#8E8E93]'}`}>15</button>
                </div>
            </div>
        </div>

        {/* Visualizer */}
        <div className="bg-[#101214] rounded-2xl p-6 mb-6 flex items-center justify-center relative min-h-[160px] overflow-hidden">
             {/* Barbell Bar */}
             <div className="absolute left-0 right-0 h-4 bg-gray-600 rounded-full z-0"></div>
             
             {/* Plates */}
             <div className="flex items-center justify-center gap-1 z-10 relative">
                 {plates.length === 0 ? (
                     <p className="text-[#8E8E93] text-xs font-medium bg-[#101214] px-2">Empty Bar</p>
                 ) : (
                     plates.map((p, i) => (
                         <div 
                            key={i}
                            className={`w-4 rounded-sm border border-black/20 ${getPlateColor(p)} shadow-lg flex items-center justify-center`}
                            style={{ height: getPlateHeight(p) }}
                            title={`${p}kg`}
                         >
                         </div>
                     ))
                 )}
             </div>
        </div>

        {/* List Breakdown */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#8E8E93] uppercase font-bold border-b border-white/5 pb-2 mb-2">
                <span>Plate</span>
                <span>Per Side</span>
            </div>
            {AVAILABLE_PLATES.map(p => {
                const count = plates.filter(x => x === p).length;
                if (count === 0) return null;
                return (
                    <div key={p} className="flex justify-between items-center text-white text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Circle size={12} className={getPlateColor(p).split(' ')[0] + ' text-transparent rounded-full fill-current'} />
                            {p} kg
                        </div>
                        <span>x {count}</span>
                    </div>
                );
            })}
        </div>

        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Total Load</span>
            <p className="text-2xl font-bold text-white">{(barWeight + plates.reduce((a,b) => a+b, 0)*2)} kg</p>
        </div>

      </div>
    </div>
  );
};

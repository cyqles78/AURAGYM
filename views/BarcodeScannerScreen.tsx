
import React, { useState, useEffect } from 'react';
import { X, Camera, Zap, AlertCircle } from 'lucide-react';

interface BarcodeScannerScreenProps {
  onClose: () => void;
  onScan: (upc: string) => void;
}

export const BarcodeScannerScreen: React.FC<BarcodeScannerScreenProps> = ({ onClose, onScan }) => {
  const [scanning, setScanning] = useState(true);
  const [permission, setPermission] = useState(true);

  // Simulate scanning process
  useEffect(() => {
    // In a real app, we would request camera permissions here
    setPermission(true);
  }, []);

  const handleSimulateScan = () => {
    // Simulate finding a barcode
    // Returning a known UPC for Silk Almond Milk as a demo
    const MOCK_UPC = '025293000966';
    onScan(MOCK_UPC);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-300">
      
      {/* Camera Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
         <button onClick={onClose} className="bg-black/50 p-2 rounded-full text-white backdrop-blur-md">
             <X size={24} />
         </button>
         <div className="bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
             <span className="text-xs font-bold text-white uppercase tracking-wider">Scanner Active</span>
         </div>
         <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Viewfinder Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
          
          {/* Simulated Camera Feed Background */}
          <div className="absolute inset-0 bg-gray-900">
              {/* This simulates a camera feed simply by being a dark grey box in this web demo */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          </div>

          {/* Scanner Overlay UI */}
          <div className="relative z-10 w-64 h-48 border-2 border-accent/50 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]">
              {/* Corner Markers */}
              <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-accent rounded-tl-xl"></div>
              <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-4 border-r-4 border-accent rounded-tr-xl"></div>
              <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-4 border-l-4 border-accent rounded-bl-xl"></div>
              <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-accent rounded-br-xl"></div>

              {/* Scanning Laser Line Animation */}
              <div className="w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>

          <p className="relative z-10 text-white font-medium mt-8 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
              Align barcode within the frame
          </p>

          {/* Demo Trigger - Since we can't actually scan in web preview */}
          <button 
            onClick={handleSimulateScan}
            className="absolute bottom-24 bg-white text-black font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2 z-20"
          >
              <Zap size={18} fill="black" /> Tap to Simulate Scan
          </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-90px); opacity: 0.5; }
          50% { transform: translateY(90px); opacity: 1; }
          100% { transform: translateY(-90px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

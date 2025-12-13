import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export const NetworkStatus: React.FC = () => {
  const { isOnline, queue, isSyncing } = useOffline();

  if (isOnline && queue.length === 0 && !isSyncing) return null;

  return (
    <div className="fixed top-2 right-2 z-[100] flex flex-col gap-2 pointer-events-none">
      {!isOnline && (
        <div className="bg-red-500/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/10 animate-pulse">
          <WifiOff size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Offline Mode</span>
        </div>
      )}

      {isOnline && (queue.length > 0 || isSyncing) && (
        <div className="bg-yellow-500/90 text-black backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/10">
          <RefreshCw size={14} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isSyncing ? 'Syncing...' : `${queue.length} Pending`}
          </span>
        </div>
      )}
    </div>
  );
};
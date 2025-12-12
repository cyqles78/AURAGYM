import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-white gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-sm font-bold tracking-widest text-secondary uppercase">Loading Aura...</p>
    </div>
  );
};
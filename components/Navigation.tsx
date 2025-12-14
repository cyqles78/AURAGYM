import React from 'react';
import { Dumbbell, User, Utensils, LayoutDashboard, Menu } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'WORKOUTS', icon: Dumbbell, label: 'Train', tour: 'quick-start' }, // Added tour ID here
    { id: 'BODY', icon: User, label: 'Body' },
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home' },
    { id: 'FOOD', icon: Utensils, label: 'Food' },
    { id: 'MORE', icon: Menu, label: 'More' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
      <div className="glass-panel mx-auto max-w-md rounded-2xl px-2 py-3 shadow-2xl shadow-black/50">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                data-tour={item.tour} // Apply data-tour attribute
                className={`
                  relative flex flex-col items-center justify-center w-full py-1
                  transition-all duration-300
                  ${isActive ? 'text-accent' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                {isActive && (
                  <div className="absolute -top-4 w-8 h-1 bg-accent rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                )}
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
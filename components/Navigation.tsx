import React from 'react';
import { Dumbbell, User, Utensils, LayoutDashboard, Menu } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'WORKOUTS', icon: Dumbbell, label: 'Train', tour: 'quick-start' },
    { id: 'BODY', icon: User, label: 'Body' },
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Home' },
    { id: 'FOOD', icon: Utensils, label: 'Food' },
    { id: 'MORE', icon: Menu, label: 'More' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-1" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <div className="glass-panel w-full rounded-[20px] px-1 py-2 shadow-2xl shadow-black/50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                data-tour={item.tour}
                className={`
                  relative flex flex-col items-center justify-center flex-1 py-2 px-1
                  transition-all duration-200 rounded-xl
                  ${isActive ? 'text-accent' : 'text-slate-500'}
                  active:scale-95
                `}
                style={{ minHeight: '56px' }}
              >
                {isActive && (
                  <div className="absolute -top-2 w-6 h-0.5 bg-accent rounded-full" />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
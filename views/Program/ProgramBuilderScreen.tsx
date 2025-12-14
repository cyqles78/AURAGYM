import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Hammer, Zap, Calendar, Dumbbell, Check, Layers, ChevronRight } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Program } from '../../types';
import { generateLocalProgram, createEmptyProgram, ProgramInput } from '../../utils/programGenerator';

interface ProgramBuilderScreenProps {
  onBack: () => void;
  onProgramCreated: (program: Program) => void;
}

type BuilderStep = 'CHOICE' | 'WIZARD_GOAL' | 'WIZARD_DETAILS' | 'GENERATING';

export const ProgramBuilderScreen: React.FC<ProgramBuilderScreenProps> = ({ onBack, onProgramCreated }) => {
  const [step, setStep] = useState<BuilderStep>('CHOICE');
  
  // Wizard State
  const [goal, setGoal] = useState('Hypertrophy');
  const [days, setDays] = useState(3);
  const [weeks, setWeeks] = useState(4);
  const [level, setLevel] = useState('Intermediate');

  // --- HANDLERS ---

  const handleManualBuild = () => {
      const emptyProgram = createEmptyProgram();
      onProgramCreated(emptyProgram);
  };

  const handleGenerate = () => {
      setStep('GENERATING');
      
      // Artificial delay to make it feel "smart"
      setTimeout(() => {
          const input: ProgramInput = {
              goal,
              daysPerWeek: days,
              durationWeeks: weeks,
              level,
              programName: `${goal} ${days} Day Split`
          };
          
          try {
              const program = generateLocalProgram(input);
              onProgramCreated(program);
          } catch (e) {
              console.error("Generation failed", e);
              // Fallback?
              setStep('WIZARD_DETAILS');
          }
      }, 1500);
  };

  // --- RENDER STEPS ---

  if (step === 'CHOICE') {
      return (
          <div className="pb-28 pt-6 space-y-6 h-screen flex flex-col animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center space-x-2 px-1">
                  <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                      <ArrowLeft size={20} />
                  </button>
                  <h1 className="text-2xl font-bold text-white">New Program</h1>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-6 px-2">
                  
                  {/* Smart Generator Option */}
                  <button 
                    onClick={() => setStep('WIZARD_GOAL')}
                    className="group relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-3xl p-8 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                              <Sparkles size={32} className="text-indigo-300" />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-2">Smart Generator</h2>
                          <p className="text-indigo-200 text-sm leading-relaxed">
                              Answer 3 questions and let our engine build a perfect split for you instantly.
                          </p>
                      </div>
                  </button>

                  {/* Manual Builder Option */}
                  <button 
                    onClick={handleManualBuild}
                    className="group relative overflow-hidden bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                      <div className="relative z-10">
                          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                              <Hammer size={32} className="text-slate-300" />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-2">Build Manually</h2>
                          <p className="text-slate-400 text-sm leading-relaxed">
                              Start from a blank canvas. Design your weeks, days, and exercises from scratch.
                          </p>
                      </div>
                  </button>

              </div>
          </div>
      );
  }

  if (step === 'WIZARD_GOAL') {
      return (
          <div className="pb-28 pt-6 space-y-8 animate-in slide-in-from-right">
              <div className="flex items-center space-x-2 px-1">
                  <button onClick={() => setStep('CHOICE')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                      <ArrowLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Step 1 of 2</span>
              </div>

              <div className="px-1">
                  <h2 className="text-3xl font-bold text-white mb-2">What is your primary focus?</h2>
                  <p className="text-slate-400 text-sm">We will adjust sets, reps, and volume accordingly.</p>
              </div>

              <div className="space-y-3">
                  {[
                      { id: 'Hypertrophy', label: 'Build Muscle', icon: Dumbbell, desc: 'Moderate weight, 8-12 reps.' },
                      { id: 'Strength', label: 'Max Strength', icon: Zap, desc: 'Heavy weight, 3-5 reps.' },
                      { id: 'Endurance', label: 'Endurance', icon: ActivityIcon, desc: 'Light weight, 15+ reps.' }
                  ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => { setGoal(item.id); setStep('WIZARD_DETAILS'); }}
                        className="w-full bg-[#1C1C1E] border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition active:scale-[0.98]"
                      >
                          <div className="flex items-center gap-4">
                              <div className="bg-white/5 p-3 rounded-xl">
                                  <item.icon size={24} className="text-white" />
                              </div>
                              <div className="text-left">
                                  <h3 className="font-bold text-white text-lg">{item.label}</h3>
                                  <p className="text-xs text-slate-400">{item.desc}</p>
                              </div>
                          </div>
                          <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  if (step === 'WIZARD_DETAILS') {
      return (
          <div className="pb-28 pt-6 space-y-8 animate-in slide-in-from-right">
              <div className="flex items-center space-x-2 px-1">
                  <button onClick={() => setStep('WIZARD_GOAL')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                      <ArrowLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Step 2 of 2</span>
              </div>

              <div className="px-1">
                  <h2 className="text-3xl font-bold text-white mb-2">Fine Tuning</h2>
                  <p className="text-slate-400 text-sm">Configure your schedule and timeline.</p>
              </div>

              <GlassCard className="space-y-8">
                  {/* Days Per Week */}
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <label className="text-white font-bold flex items-center gap-2">
                              <Calendar size={18} className="text-accent"/> Days Per Week
                          </label>
                          <span className="text-2xl font-black text-white">{days}</span>
                      </div>
                      <input 
                        type="range" min="2" max="6" step="1" 
                        value={days} onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full accent-white h-2 bg-surfaceHighlight rounded-full appearance-none"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold px-1">
                          <span>2 Days</span>
                          <span>6 Days</span>
                      </div>
                  </div>

                  {/* Duration */}
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <label className="text-white font-bold flex items-center gap-2">
                              <Layers size={18} className="text-accent"/> Program Length
                          </label>
                          <span className="text-2xl font-black text-white">{weeks} <span className="text-sm font-normal text-secondary">Wks</span></span>
                      </div>
                      <input 
                        type="range" min="4" max="12" step="4" 
                        value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}
                        className="w-full accent-white h-2 bg-surfaceHighlight rounded-full appearance-none"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold px-1">
                          <span>4 Weeks</span>
                          <span>12 Weeks</span>
                      </div>
                  </div>
              </GlassCard>

              <button 
                onClick={handleGenerate}
                className="w-full py-4 bg-white text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
              >
                  <Sparkles size={20} /> Generate Program
              </button>
          </div>
      );
  }

  if (step === 'GENERATING') {
      return (
          <div className="h-screen flex flex-col items-center justify-center pb-32 px-8 text-center animate-in fade-in">
              <div className="relative mb-8">
                  <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse"></div>
                  <Sparkles size={48} className="text-white relative z-10 animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analyzing Volume...</h2>
              <p className="text-slate-400 text-sm">Building optimal splits based on {goal} goals.</p>
          </div>
      );
  }

  return null;
};

const ActivityIcon = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

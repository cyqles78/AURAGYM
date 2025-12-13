import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Trophy, Zap, ArrowRight, User, Ruler, Weight, CheckCircle2, WifiOff } from 'lucide-react';
import { useUpdateProfile } from '../../hooks/useSupabaseData';

interface OnboardingScreenProps {
  user: UserProfile;
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ user, onFinish }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: 'Male',
    height: '',
    weight: '',
    goal: 'Hypertrophy'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateProfile = useUpdateProfile();

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        gender: formData.gender as any,
        height: parseFloat(formData.height) || undefined,
        currentWeight: parseFloat(formData.weight) || undefined,
        goal: formData.goal,
        hasCompletedOnboarding: true
      });
      onFinish();
    } catch (e) {
      console.error("Onboarding failed", e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col safe-area-top safe-area-bottom overflow-hidden">
      
      {/* Progress Dots */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 z-20">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} 
          />
        ))}
      </div>

      <div className="flex-1 relative">
        
        {/* STEP 1: WELCOME */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
            <div className="h-32 w-32 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                <Trophy size={64} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-center mb-4 tracking-tighter">Welcome to<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">AURAGYM</span></h1>
            <p className="text-center text-slate-400 text-lg leading-relaxed max-w-xs">
                The premium gym log designed for focus, flow, and serious progress.
            </p>
        </div>

        {/* STEP 2: PHILOSOPHY */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0' : step < 2 ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
            <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
                <div className="bg-[#1C1C1E] p-6 rounded-3xl border border-white/10 flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Focus HUD</h3>
                        <p className="text-sm text-slate-400 mt-1">Immersive tracking interface designed for one-handed use during sets.</p>
                    </div>
                </div>
                
                <div className="bg-[#1C1C1E] p-6 rounded-3xl border border-white/10 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                        <WifiOff size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Gym Mode</h3>
                        <p className="text-sm text-slate-400 mt-1">Full offline support. Your workout continues even if the wifi drops.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* STEP 3: YOU */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 ${step === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><User size={24} className="text-accent" /> About You</h2>
            
            <div className="w-full max-w-sm space-y-6">
                
                {/* Gender */}
                <div className="flex bg-[#1C1C1E] p-1 rounded-2xl">
                    {['Male', 'Female', 'Other'].map(g => (
                        <button
                            key={g}
                            onClick={() => setFormData({...formData, gender: g})}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.gender === g ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative">
                        <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-2"><Ruler size={10}/> Height (cm)</label>
                        <input 
                            type="number" 
                            value={formData.height}
                            onChange={(e) => setFormData({...formData, height: e.target.value})}
                            placeholder="180"
                            className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-700"
                        />
                    </div>
                    <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative">
                        <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-2"><Weight size={10}/> Weight (kg)</label>
                        <input 
                            type="number" 
                            value={formData.weight}
                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                            placeholder="80"
                            className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-700"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-3 pl-1">Primary Goal</label>
                    <div className="grid grid-cols-1 gap-2">
                        {['Hypertrophy', 'Strength', 'Endurance'].map(g => (
                            <button
                                key={g}
                                onClick={() => setFormData({...formData, goal: g})}
                                className={`p-4 rounded-2xl text-left font-bold transition-all border ${formData.goal === g ? 'bg-accent/10 border-accent text-accent' : 'bg-[#1C1C1E] border-transparent text-slate-400'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>

      </div>

      {/* Footer Nav */}
      <div className="p-6 pb-safe bg-gradient-to-t from-black via-black to-transparent">
          {step < 3 ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
              >
                  Next <ArrowRight size={20} />
              </button>
          ) : (
              <button 
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full py-4 bg-accent text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-transform"
              >
                  {isSubmitting ? 'Setting up...' : 'Start Journey'} <CheckCircle2 size={20} />
              </button>
          )}
      </div>

    </div>
  );
};
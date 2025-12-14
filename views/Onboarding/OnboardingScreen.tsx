import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Trophy, Zap, ArrowRight, User, Ruler, Weight, CheckCircle2, WifiOff, Target, TrendingUp, Dumbbell } from 'lucide-react';
import { useUpdateProfile } from '../../hooks/useSupabaseData';
import { supabase } from '../../services/supabaseClient';

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
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error("Not authenticated");

            // 1. Update profile with onboarding data
            await updateProfile.mutateAsync({
                gender: formData.gender as any,
                height: parseFloat(formData.height) || undefined,
                currentWeight: parseFloat(formData.weight) || undefined,
                goal: formData.goal,
                hasCompletedOnboarding: true
            });

            // 2. Create initial weight log if weight was provided
            if (formData.weight) {
                await supabase.from('weight_history').insert({
                    user_id: authUser.id,
                    date: new Date().toISOString(),
                    weight: parseFloat(formData.weight)
                });
            }

            // 3. Trigger tour mode
            localStorage.setItem('auragym_show_tour', 'true');

            onFinish();
        } catch (e) {
            console.error("Onboarding failed", e);
            setIsSubmitting(false);
        }
    };

    const goalDescriptions: Record<string, string> = {
        'Hypertrophy': 'Build muscle mass and size',
        'Strength': 'Maximize power and 1RM',
        'Endurance': 'Improve stamina and conditioning'
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col safe-area-top safe-area-bottom overflow-hidden">

            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 animate-pulse" style={{ animationDuration: '8s' }}></div>

            {/* Progress Dots */}
            <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 z-20">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-white shadow-[0_0_10px_white]' : 'w-2 bg-white/20'}`}
                    />
                ))}
            </div>

            <div className="flex-1 relative">

                {/* STEP 1: WELCOME */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                        <div className="relative h-32 w-32 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                            <Trophy size={64} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-center mb-4 tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Welcome to<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">AURAGYM</span>
                    </h1>
                    <p className="text-center text-slate-400 text-lg leading-relaxed max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        The premium gym companion designed for <span className="text-white font-bold">focus</span>, <span className="text-white font-bold">flow</span>, and serious <span className="text-white font-bold">progress</span>.
                    </p>
                </div>

                {/* STEP 2: PHILOSOPHY */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${step === 2 ? 'opacity-100 translate-x-0' : step < 2 ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    <h2 className="text-3xl font-black mb-8 text-center">What Makes Us<br />Different</h2>
                    <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
                        <div className="glass-panel p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                <Zap size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl mb-1">Focus HUD</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Immersive full-screen tracking. One set at a time. Zero distractions. Pure flow state.</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                <WifiOff size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl mb-1">Gym Mode</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Full offline support. Your workout continues even when the WiFi drops. Auto-syncs later.</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl mb-1">Smart Tracking</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Ghost metrics from your last session. See your progress in real-time. Beat your PRs.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STEP 3: GOAL SELECTION */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${step === 3 ? 'opacity-100 translate-x-0' : step < 3 ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    <div className="mb-8 text-center">
                        <div className="inline-flex p-4 bg-accent/10 rounded-full mb-4">
                            <Target size={32} className="text-accent" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">What's Your Goal?</h2>
                        <p className="text-slate-400">We'll personalize your experience</p>
                    </div>

                    <div className="w-full max-w-sm space-y-3">
                        {(['Hypertrophy', 'Strength', 'Endurance'] as const).map((g, idx) => (
                            <button
                                key={g}
                                onClick={() => setFormData({ ...formData, goal: g })}
                                className={`w-full p-6 rounded-2xl text-left font-bold transition-all border-2 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={`absolute inset-0 transition-opacity ${formData.goal === g ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5"></div>
                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                                </div>

                                <div className={`relative z-10 flex items-center justify-between ${formData.goal === g ? 'text-white' : 'text-slate-400'}`}>
                                    <div>
                                        <div className="text-xl font-black mb-1">{g}</div>
                                        <div className="text-xs opacity-75">{goalDescriptions[g]}</div>
                                    </div>
                                    <div className={`transition-all ${formData.goal === g ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                                        <CheckCircle2 size={24} className="text-accent" />
                                    </div>
                                </div>

                                <div className={`absolute inset-0 border-2 rounded-2xl transition-all ${formData.goal === g ? 'border-accent shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'border-white/10'}`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* STEP 4: BIOMETRICS */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${step === 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                    <div className="mb-8 text-center">
                        <div className="inline-flex p-4 bg-blue-500/10 rounded-full mb-4">
                            <User size={32} className="text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">About You</h2>
                        <p className="text-slate-400 text-sm">Help us track your progress</p>
                    </div>

                    <div className="w-full max-w-sm space-y-6">

                        {/* Gender */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <label className="text-xs text-slate-500 uppercase font-bold block mb-3 pl-1">Gender</label>
                            <div className="flex glass-panel p-1.5 rounded-2xl">
                                {['Male', 'Female', 'Other'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.gender === g ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Height & Weight */}
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                            <div className="glass-panel p-5 rounded-2xl relative group">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-3">
                                    <Ruler size={12} className="text-blue-400" /> Height (cm)
                                </label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    placeholder="180"
                                    className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-slate-700 group-focus-within:text-accent transition-colors"
                                />
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            </div>

                            <div className="glass-panel p-5 rounded-2xl relative group">
                                <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-3">
                                    <Weight size={12} className="text-green-400" /> Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    placeholder="80"
                                    className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-slate-700 group-focus-within:text-accent transition-colors"
                                />
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            </div>
                        </div>

                        <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                            <div className="flex items-start gap-3">
                                <Dumbbell size={20} className="text-blue-400 mt-0.5" />
                                <div className="text-xs text-slate-400 leading-relaxed">
                                    <span className="text-white font-bold">Your weight will be logged</span> as your starting point. Track your transformation over time in the Body section.
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Footer Nav */}
            <div className="relative z-20 p-6 pb-safe bg-gradient-to-t from-black via-black to-transparent">
                {step < 4 ? (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
                    >
                        Continue <ArrowRight size={20} />
                    </button>
                ) : (
                    <button
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-white to-slate-200 text-black font-black rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
                                Setting up...
                            </>
                        ) : (
                            <>
                                Start Your Journey <CheckCircle2 size={20} />
                            </>
                        )}
                    </button>
                )}

                {step > 1 && step < 4 && (
                    <button
                        onClick={() => setStep(s => s - 1)}
                        className="w-full mt-3 py-3 text-slate-500 font-bold text-sm hover:text-white transition-colors"
                    >
                        Back
                    </button>
                )}
            </div>

        </div>
    );
};
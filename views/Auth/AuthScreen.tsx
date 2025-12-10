import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { GlassCard } from '../../components/GlassCard';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Dumbbell } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const auth = supabase.auth as any;

    try {
      if (isSignUp) {
        const { error } = await auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        // Compatibility for v1 (signIn) and v2 (signInWithPassword)
        if (auth.signInWithPassword) {
            const { error } = await auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } else {
            const { error } = await auth.signIn({
                email,
                password,
            });
            if (error) throw error;
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-surfaceHighlight/20 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accentBlue/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-sm relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding */}
        <div className="text-center space-y-4">
            <div className="h-20 w-20 bg-surfaceHighlight rounded-2xl border border-white/10 mx-auto flex items-center justify-center shadow-2xl">
                <Dumbbell size={32} className="text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">AURAGYM</h1>
                <p className="text-secondary text-sm">Elevate your performance</p>
            </div>
        </div>

        {/* Auth Card */}
        <GlassCard className="p-8 backdrop-blur-xl">
           <form onSubmit={handleAuth} className="space-y-4">
              
              {/* Toggle */}
              <div className="flex p-1 bg-surfaceHighlight rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-black shadow-md' : 'text-secondary hover:text-white'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-black shadow-md' : 'text-secondary hover:text-white'}`}
                  >
                    Sign Up
                  </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                   <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="space-y-4">
                  <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full bg-surfaceHighlight border border-border focus:border-white rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none transition-colors text-sm font-medium"
                        required
                      />
                  </div>

                  <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-surfaceHighlight border border-border focus:border-white rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none transition-colors text-sm font-medium"
                        required
                        minLength={6}
                      />
                  </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-black font-bold rounded-xl mt-6 hover:bg-gray-200 transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} />
                      </>
                  )}
              </button>

           </form>
        </GlassCard>

        <p className="text-center text-xs text-secondary">
            By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
};
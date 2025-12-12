import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { GlassCard } from '../../components/GlassCard';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Dumbbell, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If sign up successful but no session, it usually means email confirmation is required
        if (data.user && !data.session) {
           setSuccessMessage('Account created! Please check your email to confirm your registration.');
        } else if (data.user && data.session) {
           // Auto-logged in (if email confirmation is off)
           // Context will handle redirect
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#1C1C1E] to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accentBlue/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-sm relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Branding */}
        <div className="text-center space-y-4">
            <div className="h-20 w-20 bg-[#1C1C1E] rounded-2xl border border-white/10 mx-auto flex items-center justify-center shadow-2xl relative group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-lg group-hover:bg-white/10 transition-all"></div>
                <Dumbbell size={32} className="text-white relative z-10" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">AURAGYM</h1>
                <p className="text-[#8E8E93] text-sm font-medium">Elevate your performance</p>
            </div>
        </div>

        {/* Auth Card */}
        <GlassCard className="p-8 backdrop-blur-xl border border-white/10 bg-[#1C1C1E]/80">
           <form onSubmit={handleAuth} className="space-y-4">
              
              {/* Toggle */}
              <div className="flex p-1 bg-[#2C2C2E] rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(null); setSuccessMessage(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-black shadow-md' : 'text-[#8E8E93] hover:text-white'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setError(null); setSuccessMessage(null); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-black shadow-md' : 'text-[#8E8E93] hover:text-white'}`}
                  >
                    Sign Up
                  </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                   <AlertCircle size={14} className="mt-0.5 flex-shrink-0" /> 
                   <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-medium">
                   <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> 
                   <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                  <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-white transition-colors" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-[#555] outline-none transition-all text-sm font-medium"
                        required
                        disabled={loading}
                      />
                  </div>

                  <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-white transition-colors" />
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-[#2C2C2E] border border-transparent focus:border-white rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-[#555] outline-none transition-all text-sm font-medium"
                        required
                        minLength={6}
                        disabled={loading}
                      />
                  </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-black font-bold rounded-xl mt-6 hover:bg-gray-200 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} />
                      </>
                  )}
              </button>

           </form>
        </GlassCard>

        <p className="text-center text-xs text-[#555]">
            By continuing, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
};
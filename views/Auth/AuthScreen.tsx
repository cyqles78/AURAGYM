import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/GlassCard';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Dumbbell, CheckCircle2, User, Eye, EyeOff, Sparkles, KeyRound, ArrowLeft } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signInWithUsernameOrEmail, resetPassword } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const resetState = () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isRecovery) {
        // --- PASSWORD RECOVERY ---
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccessMessage('Recovery link sent! Check your email inbox.');

      } else if (isSignUp) {
        // --- SIGN UP FLOW ---
        const cleanUsername = username.trim().toLowerCase().replace(/\s/g, '');

        if (cleanUsername.length < 3) {
          throw new Error("Username must be at least 3 characters.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        // 1. Check Username Uniqueness
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          throw new Error("Username is already taken. Please choose another.");
        }

        // 2. Check Email Existence (Custom Pre-check)
        // We do this to give a clearer, more helpful error message than the default auth response.
        const { data: existingEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (existingEmail) {
          throw new Error("An account already exists for this email. Please use the Log In tab.");
        }

        // 3. Create Auth User
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // 4. Immediately Save Username & Profile Data
        // We use upsert to ensure the profile matches our form data perfectly immediately after user creation.
        if (data.user) {
          console.log('Creating profile for user:', data.user.id);
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: cleanUsername,
              email: email,
              name: cleanUsername // Default display name to username
            }, {
              onConflict: 'id'
            });

          if (updateError) {
            console.error("Profile update failed:", updateError);
            // Show error to user
            throw new Error(`Profile creation failed: ${updateError.message}. Please contact support with username: ${cleanUsername}`);
          } else {
            console.log('Profile created successfully with username:', cleanUsername);
          }
        }

        // 5. Handle Result
        if (data.session) {
          // Auto-login successful (Email confirmation disabled or implicit)
          // App.tsx will detect session change
        } else {
          setSuccessMessage('Account created! Please check your email to confirm.');
          setIsSignUp(false);
        }

      } else {
        // --- LOG IN FLOW ---
        const { error } = await signInWithUsernameOrEmail(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Content */}
      <div className="w-full max-w-sm relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="h-20 w-20 bg-gradient-to-br from-[#1C1C1E] to-[#000] rounded-3xl border border-white/10 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)] relative group">
            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-md group-hover:bg-white/10 transition-all duration-500"></div>
            <Dumbbell size={32} className="text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">AURAGYM</h1>
            <p className="text-[#8E8E93] text-sm font-medium tracking-wide">Elevate your performance</p>
          </div>
        </div>

        {/* Auth Card */}
        <GlassCard className="p-8 backdrop-blur-2xl border border-white/10 bg-[#121214]/60 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-5">

            {/* Mode Toggles */}
            {!isRecovery && (
              <div className="grid grid-cols-2 p-1 bg-[#1C1C1E] rounded-xl mb-6 border border-white/5">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); resetState(); }}
                  className={`py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${!isSignUp ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-[#8E8E93] hover:text-white'}`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); resetState(); }}
                  className={`py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${isSignUp ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-[#8E8E93] hover:text-white'}`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Recovery Header */}
            {isRecovery && (
              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <KeyRound size={20} className="text-accentBlue" />
                </div>
                <h3 className="text-lg font-bold text-white">Reset Password</h3>
                <p className="text-xs text-[#8E8E93] mt-1">Enter your email to receive a reset link</p>
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-medium animate-in slide-in-from-top-2">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Sign Up: Username Field */}
              {isSignUp && !isRecovery && (
                <div className="relative group animate-in slide-in-from-left duration-300">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="Username"
                    className="w-full bg-[#1C1C1E] border border-white/5 focus:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#555] outline-none transition-all text-sm font-medium"
                    required={isSignUp}
                    minLength={3}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Main Input (Email or User/Email) */}
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-white transition-colors" />
                <input
                  type={isRecovery || isSignUp ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSignUp || isRecovery ? "Email address" : "Username or Email"}
                  className="w-full bg-[#1C1C1E] border border-white/5 focus:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#555] outline-none transition-all text-sm font-medium"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field (Not needed for Recovery) */}
              {!isRecovery && (
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-[#1C1C1E] border border-white/5 focus:border-white/20 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-[#555] outline-none transition-all text-sm font-medium"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}
            </div>

            {/* Extras: Remember Me / Forgot Password */}
            {!isSignUp && !isRecovery && (
              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-white border-white' : 'border-[#555]'}`}>
                    {rememberMe && <CheckCircle2 size={12} className="text-black" />}
                  </div>
                  Remember me
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRecovery(true); resetState(); }}
                  className="text-white hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl mt-2 hover:bg-gray-200 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isRecovery ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Log In'}
                  {!isRecovery && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </>
              )}
            </button>

            {/* Back to Login (Recovery Mode) */}
            {isRecovery && (
              <button
                type="button"
                onClick={() => { setIsRecovery(false); resetState(); }}
                className="w-full text-xs font-bold text-[#8E8E93] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            )}

          </form>
        </GlassCard>

        {isSignUp && !isRecovery && (
          <div className="flex items-center justify-center gap-2 text-xs text-[#555]">
            <Sparkles size={12} className="text-yellow-500" />
            <span>Join 10,000+ athletes today</span>
          </div>
        )}
      </div>
    </div>
  );
};
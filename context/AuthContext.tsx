import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithUsernameOrEmail: (input: string, password: string) => Promise<{ data: any; error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => { },
  signInWithUsernameOrEmail: async () => ({ data: null, error: null }),
  resetPassword: async () => ({ data: null, error: null }),
});

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const previousUserId = user?.id;
      const newUserId = session?.user?.id;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Clear all cached data when user changes (sign in/out or switch accounts)
      if (previousUserId !== newUserId) {
        queryClient.clear();
        console.log('Auth state changed - cleared React Query cache');
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id, queryClient]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithUsernameOrEmail = async (input: string, password: string) => {
    // 1. Determine if input is Email or Username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(input);

    let emailToUse = input;

    if (!isEmail) {
      // 2. It's a username. Query the 'profiles' table to find the associated email.
      // NOTE: This relies on RLS allowing access to read the 'email' column from 'profiles'.
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', input) // Case-insensitive match
        .maybeSingle();

      if (error || !data || !data.email) {
        // Return a clear error if the username doesn't exist
        return { data: null, error: { message: 'Username not found.' } };
      }
      emailToUse = data.email;
    }

    // 3. Authenticate using the resolved Email
    return await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signInWithUsernameOrEmail, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
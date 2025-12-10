import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

// Types are not exported in v1, use any for compatibility
type User = any;
type Session = any;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    // Compatible with Supabase v1 and v2 via checking available methods
    const auth = supabase.auth as any;

    const getSession = async () => {
      try {
        if (auth.getSession) {
            // v2
            const { data, error } = await auth.getSession();
            if (error) console.warn("Error getting session:", error.message);
            setSession(data.session);
            setUser(data.session?.user ?? null);
        } else if (auth.session) {
            // v1
            const session = auth.session();
            setSession(session);
            setUser(session?.user ?? null);
        }
      } catch (err) {
        console.warn("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state
    const { data } = auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      // Handle v1 (returns subscription directly) vs v2 (returns object with subscription)
      const subscription = data?.subscription || data;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      await (supabase.auth as any).signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
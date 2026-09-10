import { authService } from '@/src/services/authService';
import { Profile } from '@/src/types';
import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((sess) => {
      setSession(sess);
      if (sess?.user) {
        authService.getProfile(sess.user.id).then(setProfile);
      }
      setLoading(false);
    });

    const subscription = authService.onAuthStateChange((sess) => {
      setSession(sess);
      if (sess?.user) {
        authService.getProfile(sess.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (session?.user) {
      const p = await authService.getProfile(session.user.id);
      setProfile(p);
    }
  }

  async function signUp(email: string, password: string, username?: string) {
    const res = await authService.signUp(email, password, username);
    if (!res.error && res.user) {
      await refreshProfile();
    }
    return { error: res.error };
  }

  async function signIn(email: string, password: string) {
    const res = await authService.signIn(email, password);
    if (!res.error && res.session?.user) {
      await authService.getProfile(res.session.user.id).then(setProfile);
    }
    return { error: res.error };
  }

  async function signOut() {
    await authService.signOut();
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

import { User as FirebaseUser } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { authService } from '@/src/services/authService';
import { Profile } from '@/src/types';

type AuthContextType = {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await authService.getProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function refreshProfile() {
    if (user) {
      const p = await authService.getProfile(user.uid);
      setProfile(p);
    }
  }

  async function signUp(email: string, password: string, username?: string) {
    const res = await authService.signUp(email, password, username);
    return { error: res.error };
  }

  async function signIn(email: string, password: string) {
    const res = await authService.signIn(email, password);
    return { error: res.error };
  }

  async function signOut() {
    await authService.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

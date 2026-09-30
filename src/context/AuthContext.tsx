import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider } from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { authService } from '@/src/services/authService';
import { Profile } from '@/src/types';

const WEB_CLIENT_ID = '44041238737-ppq4ns8gdnamckv1pisgfj1b90lgg9rq.apps.googleusercontent.com';

// GoogleSignin is a native module — only available in standalone builds, not Expo Go
let GoogleSignin: any = null;
let statusCodes: any = {};
if (Platform.OS !== 'web') {
  try {
    const mod = require('@react-native-google-signin/google-signin');
    GoogleSignin = mod.GoogleSignin;
    statusCodes = mod.statusCodes;
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, offlineAccess: false });
  } catch {
    // Expo Go: native module not available
  }
}

type AuthContextType = {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  emailVerificationDismissed: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendVerificationEmail: () => Promise<{ error: string | null }>;
  checkEmailVerified: () => Promise<boolean>;
  dismissEmailVerification: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerificationDismissed, setEmailVerificationDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await authService.getProfile(firebaseUser.uid);
        setProfile(p);
        try {
          const dismissed = await AsyncStorage.getItem(`@yachay_dismiss_verify_${firebaseUser.uid}`);
          setEmailVerificationDismissed(dismissed === 'true');
        } catch {}
      } else {
        setProfile(null);
        setEmailVerificationDismissed(false);
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

  async function signInWithGoogle(): Promise<{ error: string | null }> {
    if (typeof document !== 'undefined') {
      const res = await authService.signInWithGoogle();
      return { error: res.error };
    }

    if (!GoogleSignin) {
      return { error: 'El inicio con Google requiere la app instalada (APK). En Expo Go, usa correo y contraseña.' };
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) return { error: 'No se pudo obtener el token de Google.' };
      const credential = GoogleAuthProvider.credential(idToken);
      const res = await authService.signInWithGoogleCredential(credential);
      return { error: res.error };
    } catch (e: any) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) return { error: null };
      if (e.code === statusCodes.IN_PROGRESS) return { error: null };
      if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { error: 'Google Play Services no disponible en este dispositivo.' };
      }
      return { error: e.message || 'Error al iniciar sesión con Google.' };
    }
  }

  async function signOut() {
    setEmailVerificationDismissed(false);
    await authService.signOut();
  }

  async function sendVerificationEmail(): Promise<{ error: string | null }> {
    return authService.sendVerificationEmail(user);
  }

  async function checkEmailVerified(): Promise<boolean> {
    const updated = await authService.reloadUser();
    if (updated) {
      setUser(Object.assign(Object.create(Object.getPrototypeOf(updated)), updated));
      return updated.emailVerified;
    }
    return false;
  }

  async function dismissEmailVerification(): Promise<void> {
    setEmailVerificationDismissed(true);
    if (user) {
      try {
        await AsyncStorage.setItem(`@yachay_dismiss_verify_${user.uid}`, 'true');
      } catch {}
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        emailVerificationDismissed,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
        sendVerificationEmail,
        checkEmailVerified,
        dismissEmailVerification,
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

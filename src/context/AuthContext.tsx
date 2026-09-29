import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import Constants, { AppOwnership } from 'expo-constants';
import { GoogleAuthProvider } from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';


import { authService } from '@/src/services/authService';
import { Profile } from '@/src/types';

const ANDROID_CLIENT_ID = '44041238737-90mk82k676tdoo2a6u8pjeqoda81s4kk.apps.googleusercontent.com';
const WEB_CLIENT_ID = '44041238737-ppq4ns8gdnamckv1pisgfj1b90lgg9rq.apps.googleusercontent.com';

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

  const [, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
  const googleResolveRef = useRef<((v: { error: string | null }) => void) | null>(null);

  useEffect(() => {
    if (!googleResponse) return;
    if (googleResponse.type === 'success') {
      const idToken =
        googleResponse.params?.id_token ||
        (googleResponse as any).authentication?.idToken;
      const accessToken = (googleResponse as any).authentication?.accessToken;

      if (!idToken && !accessToken) {
        googleResolveRef.current?.({ error: 'No se pudo obtener el token de autenticación de Google.' });
        googleResolveRef.current = null;
        return;
      }
      const credential = GoogleAuthProvider.credential(idToken ?? null, accessToken ?? null);
      authService.signInWithGoogleCredential(credential)
        .then((res) => googleResolveRef.current?.({ error: res.error }))
        .catch((err) => googleResolveRef.current?.({ error: err?.message || 'Error al autenticar con Google en Firebase.' }))
        .finally(() => { googleResolveRef.current = null; });
    } else if (googleResponse.type === 'dismiss' || googleResponse.type === 'cancel') {
      googleResolveRef.current?.({ error: null });
      googleResolveRef.current = null;
    } else if (googleResponse.type === 'error') {
      const errorMsg =
        (googleResponse.params as any)?.error_description ||
        googleResponse.error?.message ||
        'Error al iniciar sesión con Google.';
      googleResolveRef.current?.({ error: errorMsg });
      googleResolveRef.current = null;
    }
  }, [googleResponse]);

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

    if (Constants.appOwnership === AppOwnership.Expo) {
      return {
        error:
          'El inicio con Google está restringido por Google dentro de Expo Go (requiere el paquete nativo com.yachay.app). Para probar en Expo Go, ingresa con tu correo y contraseña, o pruébalo en la versión Web.',
      };
    }

    return new Promise((resolve) => {
      googleResolveRef.current = resolve;
      promptGoogleAsync().catch((err) => {
        resolve({ error: err?.message || 'Error al abrir ventana de Google.' });
        googleResolveRef.current = null;
      });
    });
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

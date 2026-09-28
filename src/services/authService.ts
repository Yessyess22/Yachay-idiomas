import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { Platform } from 'react-native';

import { supabase } from '@/src/services/supabase';
import { Profile } from '@/src/types';
import { auth } from './firebase';
import { leaderboardService } from './leaderboardService';

function translateFirebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':  'Este correo ya está registrado.',
    'auth/invalid-email':         'El correo electrónico no es válido.',
    'auth/weak-password':         'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found':        'No existe una cuenta con ese correo.',
    'auth/wrong-password':        'Contraseña incorrecta.',
    'auth/invalid-credential':    'Correo o contraseña incorrectos.',
    'auth/too-many-requests':     'Demasiados intentos fallidos. Intenta más tarde.',
    'auth/network-request-failed':'Sin conexión a internet.',
    'auth/popup-blocked':         'La ventana emergente de Google fue bloqueada. Permite las ventanas emergentes en tu navegador.',
    'auth/operation-not-allowed': 'El inicio con Google no está habilitado en Firebase Console.',
    'auth/operation-not-supported-in-this-environment': 'El inicio con Google en la app móvil requiere credenciales nativas SHA-1 en Firebase. Usa tu correo y contraseña.',
    'auth/invalid-api-key':       'Clave de autenticación no configurada en el dispositivo.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo vinculada a otro método.',
  };
  return map[code] ?? 'Ocurrió un error. Inténtalo de nuevo.';
}

async function syncSupabaseSession(user: User | null): Promise<void> {
  if (!user) {
    try {
      await supabase.auth.signOut();
    } catch {}
    return;
  }
  try {
    const idToken = await user.getIdToken();
    await supabase.auth.setSession({ access_token: idToken, refresh_token: '' });
  } catch (err) {
    console.warn('[authService] Error syncing token with Supabase:', err);
  }
}

export const authService = {
  async signUp(email: string, password: string, username?: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Enviar correo de verificación automáticamente
      try {
        await sendEmailVerification(user);
      } catch (emailErr: any) {
        console.warn('[authService] Error al enviar correo de verificación:', emailErr);
      }

      await syncSupabaseSession(user);
      const finalUsername = username || email.split('@')[0];
      const { error: profileError } = await supabase.from('profiles').insert({
        firebase_uid: user.uid,
        username: finalUsername,
        avatar_url: null,
        total_xp: 0,
        streak_count: 0,
        gems: 0,
        lives: 5,
      });
      if (profileError) {
        console.warn('Profile creation warning:', profileError.message);
      }
      // Inicializar también en leaderboard_weekly para sincronización en tiempo real
      try {
        await supabase.from('leaderboard_weekly').upsert({
          firebase_uid: user.uid,
          weekly_xp: 0,
          league_tier: 'bronze',
          updated_at: new Date().toISOString(),
        });
      } catch {}

      return { user, error: null };
    } catch (e: any) {
      return { user: null, error: translateFirebaseError(e.code) };
    }
  },

  async sendVerificationEmail(targetUser?: User | null): Promise<{ error: string | null }> {
    try {
      const currentUser = targetUser || auth.currentUser;
      if (!currentUser) return { error: 'No hay ningún usuario autenticado.' };
      await sendEmailVerification(currentUser);
      return { error: null };
    } catch (e: any) {
      console.warn('[authService] Error al reenviar verificación:', e);
      if (e.code === 'auth/too-many-requests') {
        return { error: 'Firebase ha limitado los reenvíos por seguridad (demasiadas peticiones). Por favor espera 1 minuto antes de volver a presionar reenviar.' };
      }
      return { error: translateFirebaseError(e.code) };
    }
  },

  async reloadUser(): Promise<User | null> {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      return auth.currentUser;
    } catch (e) {
      console.warn('[authService] Error al recargar usuario:', e);
      return auth.currentUser;
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await syncSupabaseSession(user);
      return { user, error: null };
    } catch (e: any) {
      return { user: null, error: translateFirebaseError(e.code) };
    }
  },

  async signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
    try {
      if (Platform.OS !== 'web') {
        return {
          user: null,
          error: 'El inicio rápido con Google requiere configuración de credenciales SHA-1 en Firebase Console. Por favor ingresa con tu correo y contraseña.',
        };
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await syncSupabaseSession(user);

      // Comprobar si ya existe perfil del usuario en Supabase
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('firebase_uid')
        .eq('firebase_uid', user.uid)
        .maybeSingle();

      if (!existingProfile) {
        const finalUsername = user.displayName || user.email?.split('@')[0] || 'Yachachiq';
        await supabase.from('profiles').insert({
          firebase_uid: user.uid,
          username: finalUsername,
          avatar_url: user.photoURL || null,
          total_xp: 0,
          streak_count: 1,
          gems: 0,
          lives: 5,
        });

        try {
          await supabase.from('leaderboard_weekly').upsert({
            firebase_uid: user.uid,
            weekly_xp: 0,
            league_tier: 'bronze',
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      return { user, error: null };
    } catch (e: any) {
      if (
        e.code === 'auth/popup-closed-by-user' ||
        e.code === 'auth/cancelled-popup-request'
      ) {
        return { user: null, error: null };
      }
      return { user: null, error: translateFirebaseError(e.code) || e.message };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      await firebaseSignOut(auth);
    } catch (e: any) {
      console.warn('[authService] Error al cerrar sesión en Firebase:', e);
    }

    try {
      await supabase.auth.signOut();
    } catch (e: any) {
      console.warn('[authService] Error al cerrar sesión en Supabase:', e);
    }

    return { error: null };
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  async getProfile(uid: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('firebase_uid', uid)
      .single();

    if (error || !data) {
      return {
        firebase_uid: uid,
        username: 'Yachachiq',
        avatar_url: null,
        total_xp: 0,
        created_at: new Date().toISOString(),
        streak_count: 1,
        streak_freeze_count: 0,
        gems: 0,
        lives: 5,
      };
    }
    return data as Profile;
  },

  async updateGameState(
    uid: string,
    data: {
      lives: number;
      gems: number;
      xp: number;
      streakDays: number;
      avatarUrl?: string | null;
      streakFreezeCount?: number;
      lastActiveDate?: string | null;
      lastLifeLostAt?: string | null;
    }
  ): Promise<void> {
    const payload: Record<string, any> = {
      lives: data.lives,
      gems: data.gems,
      total_xp: data.xp,
      streak_count: data.streakDays,
    };
    if (data.avatarUrl !== undefined) {
      payload.avatar_url = data.avatarUrl;
    }
    if (data.streakFreezeCount !== undefined) {
      payload.streak_freeze_count = data.streakFreezeCount;
    }
    if (data.lastActiveDate !== undefined) {
      payload.last_active_date = data.lastActiveDate;
    }
    if (data.lastLifeLostAt !== undefined) {
      payload.last_life_lost_at = data.lastLifeLostAt;
    }
    await supabase
      .from('profiles')
      .update(payload)
      .eq('firebase_uid', uid);

    // Sincronizar automáticamente en la tabla de clasificación semanal
    await leaderboardService.syncUserTotalXp(uid, data.xp).catch(() => {});
  },

  async updateProfile(
    uid: string,
    data: { username?: string; avatar_url?: string | null }
  ): Promise<{ error: string | null }> {
    const payload: Record<string, any> = {};
    if (data.username !== undefined) payload.username = data.username.trim();
    if (data.avatar_url !== undefined) payload.avatar_url = data.avatar_url ? data.avatar_url : null;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('firebase_uid', uid);

    return { error: error ? error.message : null };
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      await syncSupabaseSession(user);
      callback(user);
    });
  },
};

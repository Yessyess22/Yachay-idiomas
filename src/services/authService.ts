import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';

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
      await syncSupabaseSession(user);
      const finalUsername = username || email.split('@')[0];
      const { error: profileError } = await supabase.from('profiles').insert({
        firebase_uid: user.uid,
        username: finalUsername,
        avatar_url: null,
        total_xp: 0,
        streak_count: 1,
        gems: 100,
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

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await syncSupabaseSession(user);
      return { user, error: null };
    } catch (e: any) {
      return { user: null, error: translateFirebaseError(e.code) };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      await firebaseSignOut(auth);
      await supabase.auth.signOut();
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
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
        gems: 100,
        lives: 5,
      };
    }
    return data as Profile;
  },

  async updateGameState(
    uid: string,
    data: { lives: number; gems: number; xp: number; streakDays: number; avatarUrl?: string | null }
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
    await supabase
      .from('profiles')
      .update(payload)
      .eq('firebase_uid', uid);

    // Sincronizar automáticamente en la tabla de clasificación semanal
    await leaderboardService.syncUserTotalXp(uid, data.xp).catch(() => {});
  },

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      await syncSupabaseSession(user);
      callback(user);
    });
  },
};

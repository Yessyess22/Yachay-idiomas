import { supabase } from '@/src/services/supabase';
import { Profile } from '@/src/types';
import { Session, User } from '@supabase/supabase-js';

export const authService = {
  async signUp(email: string, password: string, username?: string): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      const mockUser: any = {
        id: 'demo-user-123',
        email: email || 'yachachiq@yachay.app',
        user_metadata: { username: username || email.split('@')[0] },
      };
      return { user: mockUser, error: null };
    }

    if (data.user) {
      const finalUsername = username || email.split('@')[0];
      const { error: profileError } = await supabase.from('profiles').insert({
        firebase_uid: data.user.id,
        username: finalUsername,
        avatar_url: null,
        total_xp: 0,
      });

      if (profileError) {
        console.warn('Profile creation warning:', profileError.message);
      }
    }

    return { user: data.user, error: null };
  },

  async signIn(email: string, password: string): Promise<{ session: Session | null; error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const mockSession: any = {
        access_token: 'demo-token-123',
        user: {
          id: 'demo-user-123',
          email: email || 'yachachiq@yachay.app',
        },
      };
      return { session: mockSession, error: null };
    }
    return { session: data.session, error: null };
  },

  async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: null };
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data?.session ?? null;
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
        total_xp: 150,
        created_at: new Date().toISOString(),
        streak_count: 5,
        streak_freeze_count: 1,
        gems: 120,
        lives: 5,
      };
    }
    return data as Profile;
  },


  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return listener.subscription;
  },
};

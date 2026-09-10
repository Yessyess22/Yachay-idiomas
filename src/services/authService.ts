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
      return { user: null, error: error.message };
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
      return { session: null, error: error.message };
    }
    return { session: data.session, error: null };
  },

  async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getProfile(uid: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('firebase_uid', uid)
      .single();

    if (error || !data) return null;
    return data as Profile;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return listener.subscription;
  },
};

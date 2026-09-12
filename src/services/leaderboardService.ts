import { supabase } from './supabase';
import { LeaderboardEntry } from '../types';

export const leaderboardService = {
  async fetchWeeklyLeaderboard(): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('firebase_uid, username, avatar_url, total_xp')
        .order('total_xp', { ascending: false })
        .limit(20);

      if (error) return { data: null, error: error.message };

      const entries: LeaderboardEntry[] = (data || []).map((p, idx) => ({
        firebase_uid: p.firebase_uid,
        username: p.username || 'Estudiante Quechua',
        avatar_url: p.avatar_url,
        weekly_xp: p.total_xp,
        league_tier: idx < 3 ? 'gold' : idx < 8 ? 'silver' : 'bronze',
        rank: idx + 1,
      }));

      return { data: entries, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al obtener tabla de líderes' };
    }
  },
};

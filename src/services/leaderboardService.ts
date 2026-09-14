import { supabase } from './supabase';
import { LeaderboardEntry } from '../types';

export const leaderboardService = {
  async fetchWeeklyLeaderboard(): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('leaderboard_weekly')
        .select('firebase_uid, weekly_xp, league_tier, profiles(username, avatar_url)')
        .order('weekly_xp', { ascending: false })
        .limit(20);

      if (error) return { data: null, error: error.message };

      const entries: LeaderboardEntry[] = (data || []).map((row: any, idx: number) => ({
        firebase_uid: row.firebase_uid,
        username: row.profiles?.username || 'Estudiante Quechua',
        avatar_url: row.profiles?.avatar_url ?? null,
        weekly_xp: row.weekly_xp,
        league_tier: row.league_tier as LeaderboardEntry['league_tier'],
        rank: idx + 1,
      }));

      return { data: entries, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al obtener tabla de líderes' };
    }
  },
};

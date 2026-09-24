import { supabase } from './supabase';
import { LeaderboardEntry } from '../types';


export function computeLeagueTier(xp: number): LeaderboardEntry['league_tier'] {
  if (xp >= 1000) return 'gold';
  if (xp >= 250) return 'silver';
  return 'bronze';
}

export const leaderboardService = {
  /**
   * Obtiene la tabla semanal sincronizada con la base de datos (profiles + leaderboard_weekly).
   * Si hay perfiles en la base de datos que aún no tienen registro semanal, se sincronizan automáticamente.
   */
  async fetchWeeklyLeaderboard(
    currentUid?: string,
    currentXp?: number
  ): Promise<{ data: LeaderboardEntry[] | null; error: string | null }> {
    try {
      // 1. Obtener todos los perfiles reales registrados en la BD
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('firebase_uid, username, avatar_url, total_xp');

      // 2. Obtener los registros de la tabla semanal
      const { data: weeklyRows } = await supabase
        .from('leaderboard_weekly')
        .select('firebase_uid, weekly_xp, league_tier, updated_at');

      if (pError && (!weeklyRows || weeklyRows.length === 0)) {
        return { data: null, error: pError.message };
      }

      const weeklyMap = new Map<string, { weekly_xp: number; league_tier: string }>();
      (weeklyRows || []).forEach((row: any) => {
        weeklyMap.set(row.firebase_uid, {
          weekly_xp: row.weekly_xp ?? 0,
          league_tier: row.league_tier || computeLeagueTier(row.weekly_xp ?? 0),
        });
      });

      const missingInserts: { firebase_uid: string; weekly_xp: number; league_tier: string }[] = [];
      const entryMap = new Map<string, LeaderboardEntry>();

      // Procesar cada perfil registrado en Supabase
      (profiles || []).forEach((p: any) => {
        const weeklyInfo = weeklyMap.get(p.firebase_uid);
        let userXp = weeklyInfo !== undefined ? weeklyInfo.weekly_xp : (p.total_xp ?? 0);

        // Si es el usuario activo y tiene XP más reciente en sesión
        if (currentUid && p.firebase_uid === currentUid && typeof currentXp === 'number') {
          userXp = Math.max(userXp, currentXp);
        }

        const tier = computeLeagueTier(userXp);

        entryMap.set(p.firebase_uid, {
          firebase_uid: p.firebase_uid,
          username: p.username || 'Estudiante Quechua',
          avatar_url: p.avatar_url ?? null,
          weekly_xp: userXp,
          league_tier: tier,
        });

        // Si no existía en leaderboard_weekly o su XP difiere, sincronizar
        if (!weeklyInfo || weeklyInfo.weekly_xp !== userXp) {
          missingInserts.push({
            firebase_uid: p.firebase_uid,
            weekly_xp: userXp,
            league_tier: tier,
          });
        }
      });

      // Si el usuario actual no estuviera en profiles todavía (caso de carrera asíncrona)
      if (currentUid && !entryMap.has(currentUid)) {
        const localXp = currentXp ?? 0;
        const tier = computeLeagueTier(localXp);
        entryMap.set(currentUid, {
          firebase_uid: currentUid,
          username: 'Tú (Estudiante)',
          avatar_url: null,
          weekly_xp: localXp,
          league_tier: tier,
        });
        missingInserts.push({
          firebase_uid: currentUid,
          weekly_xp: localXp,
          league_tier: tier,
        });
      }

      // Sincronizar en segundo plano los registros faltantes hacia Supabase leaderboard_weekly
      if (missingInserts.length > 0) {
        Promise.all(
          missingInserts.map((row) =>
            supabase.from('leaderboard_weekly').upsert({
              firebase_uid: row.firebase_uid,
              weekly_xp: row.weekly_xp,
              league_tier: row.league_tier,
              updated_at: new Date().toISOString(),
            })
          )
        ).catch((err) => {
          console.warn('[leaderboardService] Error al sincronizar registros de liga en segundo plano:', err);
        });
      }

      // Convertir a lista y ordenar descendentemente por XP
      const list = Array.from(entryMap.values()).sort((a, b) => b.weekly_xp - a.weekly_xp);

      // Asignar rangos (#1, #2, #3...)
      const entries: LeaderboardEntry[] = list.map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

      return { data: entries, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al obtener tabla de líderes' };
    }
  },

  async recordWeeklyXp(userId: string, xpGained: number): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('leaderboard_weekly')
        .select('weekly_xp')
        .eq('firebase_uid', userId)
        .maybeSingle();

      const newWeeklyXp = (existing?.weekly_xp ?? 0) + xpGained;
      const tier = computeLeagueTier(newWeeklyXp);
      await supabase.from('leaderboard_weekly').upsert({
        firebase_uid: userId,
        weekly_xp: newWeeklyXp,
        league_tier: tier,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[leaderboardService] Error recording weekly xp:', err);
    }
  },

  async syncUserTotalXp(userId: string, totalXp: number): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('leaderboard_weekly')
        .select('weekly_xp')
        .eq('firebase_uid', userId)
        .maybeSingle();

      const finalXp = Math.max(existing?.weekly_xp ?? 0, totalXp);
      const tier = computeLeagueTier(finalXp);
      await supabase.from('leaderboard_weekly').upsert({
        firebase_uid: userId,
        weekly_xp: finalXp,
        league_tier: tier,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[leaderboardService] Error syncing user total xp:', err);
    }
  },
};

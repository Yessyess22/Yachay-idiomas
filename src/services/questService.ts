import { supabase } from './supabase';
import { DailyQuest, Badge } from '../types';

export const questService = {
  async fetchDailyQuests(userId: string): Promise<{ data: DailyQuest[] | null; error: string | null }> {
    try {
      const { data: quests, error: qError } = await supabase.from('daily_quests').select('*');
      if (qError) return { data: null, error: qError.message };

      const { data: uQuests } = await supabase
        .from('user_quests')
        .select('*')
        .eq('firebase_uid', userId);

      const uQuestsMap = new Map(uQuests?.map((uq) => [uq.quest_id, uq]) || []);

      const formatted: DailyQuest[] = (quests || []).map((q) => {
        const uq = uQuestsMap.get(q.id);
        return {
          ...q,
          current_progress: uq?.current_progress || 0,
          completed: uq?.completed || false,
        };
      });

      return { data: formatted, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al obtener misiones' };
    }
  },

  async fetchBadges(userId: string): Promise<{ data: Badge[] | null; error: string | null }> {
    try {
      const { data: badges, error: bError } = await supabase.from('badges').select('*');
      if (bError) return { data: null, error: bError.message };

      const { data: uBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('firebase_uid', userId);

      const unlockedSet = new Set(uBadges?.map((ub) => ub.badge_id) || []);

      const formatted: Badge[] = (badges || []).map((b) => ({
        ...b,
        unlocked: unlockedSet.has(b.id),
      }));

      return { data: formatted, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al obtener logros' };
    }
  },
};

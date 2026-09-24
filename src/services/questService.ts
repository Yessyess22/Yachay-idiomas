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

  async updateQuestProgress(
    userId: string,
    questType: 'xp_gain' | 'lesson_count' | 'perfect_lesson' | 'streak_maintain',
    amount = 1
  ): Promise<void> {
    try {
      const { data: quests } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('quest_type', questType);

      if (!quests || quests.length === 0) return;

      for (const q of quests) {
        const { data: uq } = await supabase
          .from('user_quests')
          .select('*')
          .eq('firebase_uid', userId)
          .eq('quest_id', q.id)
          .maybeSingle();

        const currentProg = (uq?.current_progress ?? 0) + amount;
        const isCompleted = currentProg >= q.target_amount;

        await supabase.from('user_quests').upsert({
          firebase_uid: userId,
          quest_id: q.id,
          current_progress: currentProg,
          completed: isCompleted,
        });
      }
    } catch (err) {
      console.warn('[questService] Error updating quest progress:', err);
    }
  },

  async claimQuestReward(
    userId: string,
    questId: number
  ): Promise<{ success: boolean; xpReward: number; gemReward: number }> {
    try {
      const { data: q } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (!q) return { success: false, xpReward: 0, gemReward: 0 };

      await supabase
        .from('user_quests')
        .update({ claimed_at: new Date().toISOString() })
        .eq('firebase_uid', userId)
        .eq('quest_id', questId);

      return { success: true, xpReward: q.xp_reward, gemReward: q.gem_reward };
    } catch {
      return { success: false, xpReward: 0, gemReward: 0 };
    }
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { DailyQuest, Badge } from '../types';

export const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 1,
    title: 'Estudiante Dedicado',
    description: 'Completa 1 lección de Quechua hoy',
    target_amount: 1,
    xp_reward: 15,
    gem_reward: 5,
    quest_type: 'lesson_count',
  },
  {
    id: 2,
    title: 'Sed de Sabiduría',
    description: 'Acumula 20 XP estudiando en lecciones',
    target_amount: 20,
    xp_reward: 20,
    gem_reward: 10,
    quest_type: 'xp_gain',
  },
  {
    id: 3,
    title: 'Mente Brillante',
    description: 'Completa 1 lección perfecta sin cometer errores',
    target_amount: 1,
    xp_reward: 25,
    gem_reward: 15,
    quest_type: 'perfect_lesson',
  },
  {
    id: 4,
    title: 'Racha Sagrada',
    description: 'Practica hoy y mantén viva tu racha andina',
    target_amount: 1,
    xp_reward: 10,
    gem_reward: 5,
    quest_type: 'streak_maintain',
  },
];

interface LocalUserQuest {
  quest_id: number;
  current_progress: number;
  completed: boolean;
  claimed_at?: string | null;
  date_key?: string; // YYYY-MM-DD para reinicio diario
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const questService = {
  async fetchDailyQuests(userId: string): Promise<{ data: DailyQuest[] | null; error: string | null }> {
    try {
      const todayKey = getTodayKey();
      const storageKey = `@yachay_user_quests_${userId}`;

      // 1. Obtener misiones desde Supabase con fallback a DEFAULT_DAILY_QUESTS
      let quests: DailyQuest[] = [];
      const { data: dbQuests, error: qError } = await supabase
        .from('daily_quests')
        .select('*')
        .order('id');

      if (!qError && dbQuests && dbQuests.length > 0) {
        quests = dbQuests;
      } else {
        quests = DEFAULT_DAILY_QUESTS;
      }

      // 2. Leer estado local (AsyncStorage) para robustez offline
      let localMap: Record<number, LocalUserQuest> = {};
      try {
        const rawLocal = await AsyncStorage.getItem(storageKey);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          // Si es del mismo día, mantener el progreso; si es un día nuevo, reiniciar
          if (parsed.date_key === todayKey && parsed.quests) {
            localMap = parsed.quests;
          }
        }
      } catch (_) {}

      // 3. Obtener progreso de usuario desde Supabase
      const { data: uQuests } = await supabase
        .from('user_quests')
        .select('*')
        .eq('firebase_uid', userId);

      const uQuestsMap = new Map(uQuests?.map((uq) => [uq.quest_id, uq]) || []);

      const formatted: DailyQuest[] = quests.map((q) => {
        const uq = uQuestsMap.get(q.id);
        const local = localMap[q.id];

        const current_progress = Math.max(
          uq?.current_progress || 0,
          local?.current_progress || 0
        );
        const completed = Boolean(
          uq?.completed || local?.completed || current_progress >= q.target_amount
        );
        const claimed = Boolean(uq?.claimed_at || local?.claimed_at);

        return {
          ...q,
          current_progress,
          completed,
          claimed,
        };
      });

      return { data: formatted, error: null };
    } catch (err: any) {
      // Fallback seguro a misiones predeterminadas
      return { data: DEFAULT_DAILY_QUESTS, error: null };
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
      const todayKey = getTodayKey();
      const storageKey = `@yachay_user_quests_${userId}`;

      // 1. Obtener misiones que coincidan con questType
      let questsToUpdate = DEFAULT_DAILY_QUESTS.filter((q) => q.quest_type === questType);
      const { data: dbQuests } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('quest_type', questType);

      if (dbQuests && dbQuests.length > 0) {
        questsToUpdate = dbQuests;
      }

      if (questsToUpdate.length === 0) return;

      // 2. Leer estado local
      let localState: { date_key: string; quests: Record<number, LocalUserQuest> } = {
        date_key: todayKey,
        quests: {},
      };
      try {
        const rawLocal = await AsyncStorage.getItem(storageKey);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (parsed.date_key === todayKey && parsed.quests) {
            localState = parsed;
          }
        }
      } catch (_) {}

      for (const q of questsToUpdate) {
        const localQ = localState.quests[q.id];
        const nextProgress = (localQ?.current_progress || 0) + amount;
        const isCompleted = nextProgress >= q.target_amount;

        localState.quests[q.id] = {
          quest_id: q.id,
          current_progress: nextProgress,
          completed: isCompleted,
          claimed_at: localQ?.claimed_at || null,
          date_key: todayKey,
        };

        // Guardar también en Supabase de forma no bloqueante
        supabase
          .from('user_quests')
          .upsert({
            firebase_uid: userId,
            quest_id: q.id,
            current_progress: nextProgress,
            completed: isCompleted,
          })
          .then(() => {}, () => {});
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(localState));
    } catch (err) {
      console.warn('[questService] Error updating quest progress:', err);
    }
  },

  async claimQuestReward(
    userId: string,
    questId: number
  ): Promise<{ success: boolean; xpReward: number; gemReward: number }> {
    try {
      const todayKey = getTodayKey();
      const storageKey = `@yachay_user_quests_${userId}`;

      // Buscar misión
      let questData = DEFAULT_DAILY_QUESTS.find((item) => item.id === questId);
      const { data: q } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('id', questId)
        .maybeSingle();

      if (q) questData = q;
      if (!questData) return { success: false, xpReward: 0, gemReward: 0 };

      const claimedAt = new Date().toISOString();

      // 1. Guardar en local storage
      try {
        const rawLocal = await AsyncStorage.getItem(storageKey);
        let localState: any = { date_key: todayKey, quests: {} };
        if (rawLocal) {
          localState = JSON.parse(rawLocal);
        }
        if (!localState.quests) localState.quests = {};
        localState.quests[questId] = {
          quest_id: questId,
          current_progress: questData.target_amount,
          completed: true,
          claimed_at: claimedAt,
          date_key: todayKey,
        };
        await AsyncStorage.setItem(storageKey, JSON.stringify(localState));
      } catch (_) {}

      // 2. Guardar en Supabase
      await supabase
        .from('user_quests')
        .upsert({
          firebase_uid: userId,
          quest_id: questId,
          completed: true,
          claimed_at: claimedAt,
        });

      return { success: true, xpReward: questData.xp_reward, gemReward: questData.gem_reward };
    } catch {
      return { success: false, xpReward: 0, gemReward: 0 };
    }
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/services/supabase';
import { LevelProgress } from '@/src/types';

export const progressService = {
  async fetchLevelProgress(
    userId: string,
    levelId: number
  ): Promise<{ data: LevelProgress | null; error: string | null }> {
    const { data, error } = await supabase
      .from('level_progress')
      .select('*')
      .eq('firebase_uid', userId)
      .eq('level_id', levelId)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as LevelProgress, error: null };
  },

  async recordExamResult(
    userId: string,
    levelId: number,
    score: number,
    passThreshold: number
  ): Promise<{ passed: boolean; error: string | null }> {
    const passed = score >= passThreshold;

    if (passed) {
      try {
        const key = `@yachay_passed_levels_${userId}`;
        const raw = await AsyncStorage.getItem(key);
        const list: number[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(levelId)) {
          list.push(levelId);
          await AsyncStorage.setItem(key, JSON.stringify(list));
        }
      } catch {}
    }

    try {
      const { error } = await supabase.from('level_progress').upsert({
        firebase_uid: userId,
        level_id: levelId,
        unlocked: true,
        exam_score: score,
        passed_at: passed ? new Date().toISOString() : null,
      });

      if (error) return { passed, error: error.message };
    } catch {}

    return { passed, error: null };
  },

  async unlockNextLevel(
    userId: string,
    nextLevelId: number
  ): Promise<{ error: string | null }> {
    try {
      const key = `@yachay_unlocked_levels_${userId}`;
      const raw = await AsyncStorage.getItem(key);
      const list: number[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(nextLevelId)) {
        list.push(nextLevelId);
        await AsyncStorage.setItem(key, JSON.stringify(list));
      }
    } catch {}

    try {
      const { error } = await supabase.from('level_progress').upsert({
        firebase_uid: userId,
        level_id: nextLevelId,
        unlocked: true,
        exam_score: null,
        passed_at: null,
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: null };
    }
  },

  async fetchPassedLevels(userId: string): Promise<Set<number>> {
    const passed = new Set<number>();
    try {
      const key = `@yachay_passed_levels_${userId}`;
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const list: number[] = JSON.parse(raw);
        list.forEach((id) => passed.add(id));
      }
    } catch {}

    try {
      const { data } = await supabase
        .from('level_progress')
        .select('level_id, passed_at')
        .eq('firebase_uid', userId)
        .not('passed_at', 'is', null);

      if (data) {
        data.forEach((row) => passed.add(row.level_id));
      }
    } catch {}

    return passed;
  },
};

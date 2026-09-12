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

    const { error } = await supabase.from('level_progress').upsert({
      firebase_uid: userId,
      level_id: levelId,
      unlocked: passed,
      exam_score: score,
      passed_at: passed ? new Date().toISOString() : null,
    });

    if (error) return { passed: false, error: error.message };
    return { passed, error: null };
  },

  async unlockNextLevel(
    userId: string,
    nextLevelId: number
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.from('level_progress').upsert({
      firebase_uid: userId,
      level_id: nextLevelId,
      unlocked: true,
      exam_score: null,
      passed_at: null,
    });

    return { error: error?.message ?? null };
  },
};

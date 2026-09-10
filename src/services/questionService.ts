import { supabase } from '@/src/services/supabase';
import { QuestionOption, QuestionWithOptions } from '@/src/types';

export const questionService = {
  async fetchQuestionsByLesson(
    lessonId: number
  ): Promise<{ data: QuestionWithOptions[] | null; error: string | null }> {
    // 1. Obtener preguntas de la lección
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('id', { ascending: true });

    if (qError) return { data: null, error: qError.message };
    if (!questions || questions.length === 0) return { data: [], error: null };

    // 2. Obtener opciones para estas preguntas
    const questionIds = questions.map((q) => q.id);
    const { data: options, error: oError } = await supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds);

    if (oError) return { data: null, error: oError.message };

    // 3. Agrupar opciones por pregunta
    const optionsMap = new Map<number, QuestionOption[]>();
    (options || []).forEach((opt) => {
      const existing = optionsMap.get(opt.question_id) || [];
      existing.push(opt);
      optionsMap.set(opt.question_id, existing);
    });

    const result: QuestionWithOptions[] = questions.map((q) => ({
      ...q,
      options: optionsMap.get(q.id) || [],
    }));

    return { data: result, error: null };
  },

  async recordLessonProgress(
    lessonId: number,
    userId: string,
    xpEarned: number = 10
  ): Promise<{ success: boolean; error: string | null }> {
    const { error: pError } = await supabase.from('lesson_progress').upsert({
      firebase_uid: userId,
      lesson_id: lessonId,
      completed: true,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    });

    if (pError) return { success: false, error: pError.message };

    // Actualizar XP total en el perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('firebase_uid', userId)
      .single();

    const currentXp = profile?.total_xp || 0;

    await supabase
      .from('profiles')
      .update({ total_xp: currentXp + xpEarned })
      .eq('firebase_uid', userId);

    return { success: true, error: null };
  },
};

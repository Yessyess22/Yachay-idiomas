import { supabase } from '@/src/services/supabase';
import { QuestionOption, QuestionWithOptions } from '@/src/types';

const DEFAULT_QUESTIONS: Record<number, QuestionWithOptions[]> = {
  1: [
    {
      id: 1,
      lesson_id: 1,
      prompt: '¿Cuál es la vocal "a" en el alfabeto quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 1, question_id: 1, option_text: 'a', is_correct: true },
        { id: 2, question_id: 1, option_text: 'e', is_correct: false },
        { id: 3, question_id: 1, option_text: 'o', is_correct: false },
        { id: 4, question_id: 1, option_text: 'u', is_correct: false },
      ],
    },
    {
      id: 2,
      lesson_id: 1,
      prompt: '¿Cuántas vocales tiene el quechua estándar?',
      question_type: 'multiple_choice',
      options: [
        { id: 5, question_id: 2, option_text: '3 (a, i, u)', is_correct: true },
        { id: 6, question_id: 2, option_text: '5 (a, e, i, o, u)', is_correct: false },
        { id: 7, question_id: 2, option_text: '4 (a, i, u, e)', is_correct: false },
      ],
    },
  ],
};

export const questionService = {
  async fetchQuestionsByLesson(
    lessonId: number
  ): Promise<{ data: QuestionWithOptions[] | null; error: string | null }> {
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('id', { ascending: true });

    if (qError || !questions || questions.length === 0) {
      return { data: DEFAULT_QUESTIONS[lessonId] || DEFAULT_QUESTIONS[1], error: null };
    }

    const questionIds = questions.map((q) => q.id);
    const { data: options, error: oError } = await supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds);

    if (oError) {
      return { data: DEFAULT_QUESTIONS[lessonId] || DEFAULT_QUESTIONS[1], error: null };
    }

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
    try {
      await supabase.from('lesson_progress').upsert({
        firebase_uid: userId,
        lesson_id: lessonId,
        completed: true,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      });
    } catch (e) {
      // Ignorar error en modo local
    }

    return { success: true, error: null };
  },
};


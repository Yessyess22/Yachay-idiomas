import { supabase } from '@/src/services/supabase';
import { ExamWithQuestions, QuestionOption, QuestionWithOptions } from '@/src/types';

export const examService = {
  async fetchExamByLevel(
    levelId: number
  ): Promise<{ data: ExamWithQuestions | null; error: string | null }> {
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('level_id', levelId)
      .single();

    if (examError) return { data: null, error: examError.message };
    if (!exam) return { data: null, error: 'No se encontró examen para este nivel.' };

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', exam.id)
      .order('id', { ascending: true });

    if (qError) return { data: null, error: qError.message };

    const questionIds = (questions ?? []).map((q: { id: number }) => q.id);
    const { data: options, error: oError } = await supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds);

    if (oError) return { data: null, error: oError.message };

    const optionsMap = new Map<number, QuestionOption[]>();
    (options ?? []).forEach((opt: QuestionOption) => {
      const arr = optionsMap.get(opt.question_id) ?? [];
      arr.push(opt);
      optionsMap.set(opt.question_id, arr);
    });

    const enriched: QuestionWithOptions[] = (questions ?? []).map(
      (q: QuestionWithOptions) => ({ ...q, options: optionsMap.get(q.id) ?? [] })
    );

    return { data: { ...exam, questions: enriched }, error: null };
  },
};

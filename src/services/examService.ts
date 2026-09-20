import { supabase } from '@/src/services/supabase';
import { ExamWithQuestions, QuestionOption, QuestionWithOptions } from '@/src/types';

/**
 * Preguntas de examen embebidas por nivel como fallback.
 * Se usan cuando Supabase no tiene exámenes configurados para ese nivel.
 */
const EXAM_FALLBACK: Record<number, { title: string; pass_threshold: number; questions: QuestionWithOptions[] }> = {
  1: {
    title: 'Examen: Vocales Quechuas',
    pass_threshold: 60,
    questions: [
      {
        id: 101, lesson_id: 1, question_type: 'multiple_choice',
        prompt: '¿Cuáles son las 3 únicas vocales del alfabeto Quechua oficial?',
        options: [
          { id: 1001, question_id: 101, option_text: 'a, i, u', is_correct: true },
          { id: 1002, question_id: 101, option_text: 'a, e, i, o, u', is_correct: false },
          { id: 1003, question_id: 101, option_text: 'a, e, u', is_correct: false },
        ],
      },
      {
        id: 102, lesson_id: 1, question_type: 'multiple_choice',
        prompt: '"Inti" significa en español:',
        options: [
          { id: 1004, question_id: 102, option_text: 'Sol', is_correct: true },
          { id: 1005, question_id: 102, option_text: 'Luna', is_correct: false },
          { id: 1006, question_id: 102, option_text: 'Estrella', is_correct: false },
        ],
      },
      {
        id: 103, lesson_id: 1, question_type: 'multiple_choice',
        prompt: '¿Qué palabra quechua con vocal "u" significa "paloma"?',
        options: [
          { id: 1007, question_id: 103, option_text: 'Urpi', is_correct: true },
          { id: 1008, question_id: 103, option_text: 'Wasi', is_correct: false },
          { id: 1009, question_id: 103, option_text: 'Allqo', is_correct: false },
        ],
      },
      {
        id: 104, lesson_id: 1, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "agua" en quechua?',
        options: [
          { id: 1010, question_id: 104, option_text: 'Yaku', is_correct: true },
          { id: 1011, question_id: 104, option_text: 'Inti', is_correct: false },
          { id: 1012, question_id: 104, option_text: 'Urpi', is_correct: false },
        ],
      },
      {
        id: 105, lesson_id: 1, question_type: 'multiple_choice',
        prompt: '"Allin" en quechua significa:',
        options: [
          { id: 1013, question_id: 105, option_text: 'Bueno / Bien', is_correct: true },
          { id: 1014, question_id: 105, option_text: 'Malo / Difícil', is_correct: false },
          { id: 1015, question_id: 105, option_text: 'Grande / Poderoso', is_correct: false },
        ],
      },
    ],
  },
  2: {
    title: 'Examen: Consonantes Quechuas',
    pass_threshold: 60,
    questions: [
      {
        id: 201, lesson_id: 2, question_type: 'multiple_choice',
        prompt: 'La consonante "q" del quechua se articula desde:',
        options: [
          { id: 2001, question_id: 201, option_text: 'La garganta profunda (zona uvular)', is_correct: true },
          { id: 2002, question_id: 201, option_text: 'Los labios', is_correct: false },
          { id: 2003, question_id: 201, option_text: 'Los dientes', is_correct: false },
        ],
      },
      {
        id: 202, lesson_id: 2, question_type: 'multiple_choice',
        prompt: '¿Cómo se escribe "oro" en quechua?',
        options: [
          { id: 2004, question_id: 202, option_text: 'Quri', is_correct: true },
          { id: 2005, question_id: 202, option_text: 'Kuri', is_correct: false },
          { id: 2006, question_id: 202, option_text: 'Guri', is_correct: false },
        ],
      },
      {
        id: 203, lesson_id: 2, question_type: 'multiple_choice',
        prompt: '"Mishki" en quechua significa:',
        options: [
          { id: 2007, question_id: 203, option_text: 'Dulce / Delicioso', is_correct: true },
          { id: 2008, question_id: 203, option_text: 'Amargo', is_correct: false },
          { id: 2009, question_id: 203, option_text: 'Salado', is_correct: false },
        ],
      },
      {
        id: 204, lesson_id: 2, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "casa" en quechua?',
        options: [
          { id: 2010, question_id: 204, option_text: 'Wasi', is_correct: true },
          { id: 2011, question_id: 204, option_text: 'Quri', is_correct: false },
          { id: 2012, question_id: 204, option_text: 'Mishki', is_correct: false },
        ],
      },
      {
        id: 205, lesson_id: 2, question_type: 'multiple_choice',
        prompt: 'El sonido "ch" en quechua (como en "chaski") se pronuncia similar a:',
        options: [
          { id: 2013, question_id: 205, option_text: 'ch en "chocolate"', is_correct: true },
          { id: 2014, question_id: 205, option_text: 'c en "cielo"', is_correct: false },
          { id: 2015, question_id: 205, option_text: 'g en "gato"', is_correct: false },
        ],
      },
    ],
  },
  3: {
    title: 'Examen: Palabras Esenciales',
    pass_threshold: 60,
    questions: [
      {
        id: 301, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "Hola / Buen día" en quechua?',
        options: [
          { id: 3001, question_id: 301, option_text: 'Allianchu / Rimaykullayki', is_correct: true },
          { id: 3002, question_id: 301, option_text: 'Tupananchiskama', is_correct: false },
          { id: 3003, question_id: 301, option_text: 'Allin', is_correct: false },
        ],
      },
      {
        id: 302, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '"Tupananchiskama" significa:',
        options: [
          { id: 3004, question_id: 302, option_text: 'Hasta que nos volvamos a ver / Adiós', is_correct: true },
          { id: 3005, question_id: 302, option_text: 'Buenos días', is_correct: false },
          { id: 3006, question_id: 302, option_text: 'Gracias', is_correct: false },
        ],
      },
      {
        id: 303, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "1" (uno) en quechua?',
        options: [
          { id: 3007, question_id: 303, option_text: 'Huk', is_correct: true },
          { id: 3008, question_id: 303, option_text: 'Iskay', is_correct: false },
          { id: 3009, question_id: 303, option_text: 'Kimsa', is_correct: false },
        ],
      },
      {
        id: 304, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '¿Cuánto es "Iskay" en español?',
        options: [
          { id: 3010, question_id: 304, option_text: '2 (dos)', is_correct: true },
          { id: 3011, question_id: 304, option_text: '1 (uno)', is_correct: false },
          { id: 3012, question_id: 304, option_text: '3 (tres)', is_correct: false },
        ],
      },
      {
        id: 305, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '"Paykunam allinmi" — ¿qué expresa esta frase?',
        options: [
          { id: 3013, question_id: 305, option_text: 'Ellos/Ellas están bien', is_correct: true },
          { id: 3014, question_id: 305, option_text: 'Nosotros estamos bien', is_correct: false },
          { id: 3015, question_id: 305, option_text: 'Yo estoy bien', is_correct: false },
        ],
      },
    ],
  },
};

export const examService = {
  async fetchExamByLevel(
    levelId: number
  ): Promise<{ data: ExamWithQuestions | null; error: string | null }> {
    // 1. Intentar obtener examen desde Supabase
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('level_id', levelId)
      .single();

    if (!examError && exam) {
      // Examen encontrado — cargar sus preguntas
      // Las preguntas del examen usan exam_id si existe, o buscar por el nivel
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('lesson_id', exam.id)
        .order('id', { ascending: true });

      if (!qError && questions && questions.length > 0) {
        const questionIds = questions.map((q: { id: number }) => q.id);
        const { data: options } = await supabase
          .from('question_options')
          .select('*')
          .in('question_id', questionIds);

        const optionsMap = new Map<number, QuestionOption[]>();
        (options ?? []).forEach((opt: QuestionOption) => {
          const arr = optionsMap.get(opt.question_id) ?? [];
          arr.push(opt);
          optionsMap.set(opt.question_id, arr);
        });

        const enriched: QuestionWithOptions[] = questions.map(
          (q: QuestionWithOptions) => ({ ...q, options: optionsMap.get(q.id) ?? [] })
        );

        return { data: { ...exam, questions: enriched }, error: null };
      }
    }

    // 2. Fallback: usar preguntas locales predefinidas para el nivel
    const fallback = EXAM_FALLBACK[levelId];
    if (fallback) {
      return {
        data: {
          id: levelId * 1000, // ID sintético para no colisionar
          level_id: levelId,
          title: fallback.title,
          pass_threshold: fallback.pass_threshold,
          questions: fallback.questions,
        },
        error: null,
      };
    }

    return { data: null, error: `No hay examen disponible para el nivel ${levelId}.` };
  },
};

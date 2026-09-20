import { supabase } from '@/src/services/supabase';
import { ExamWithQuestions, QuestionOption, QuestionWithOptions } from '@/src/types';

/**
 * Preguntas de examen embebidas por nivel como fallback.
 * Se usan cuando Supabase no tiene exámenes configurados para ese nivel.
 *
 * El levelId aquí corresponde al category_id (1=Abecedario, 2=Números,
 * 3=Palabras), igual que en categoryService/DEFAULT_LESSONS, para que el
 * nodo "EXAMEN" de cada nivel en Inicio muestre contenido que en verdad
 * pertenece a ese nivel (antes levelId coincidía con un lesson_id suelto,
 * por lo que el examen de "Números" terminaba mostrando preguntas de
 * consonantes).
 */
const EXAM_FALLBACK: Record<number, { title: string; pass_threshold: number; questions: QuestionWithOptions[] }> = {
  // Nivel 1 — Abecedario (lecciones 1 Vocales + 2 Consonantes)
  1: {
    title: 'Examen de Abecedario',
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
        id: 104, lesson_id: 2, question_type: 'multiple_choice',
        prompt: 'La consonante "q" del quechua se articula desde:',
        options: [
          { id: 1010, question_id: 104, option_text: 'La garganta profunda (zona uvular)', is_correct: true },
          { id: 1011, question_id: 104, option_text: 'Los labios', is_correct: false },
          { id: 1012, question_id: 104, option_text: 'Los dientes', is_correct: false },
        ],
      },
      {
        id: 105, lesson_id: 2, question_type: 'multiple_choice',
        prompt: '¿Cómo se escribe "oro" en quechua?',
        options: [
          { id: 1013, question_id: 105, option_text: 'Quri', is_correct: true },
          { id: 1014, question_id: 105, option_text: 'Kuri', is_correct: false },
          { id: 1015, question_id: 105, option_text: 'Guri', is_correct: false },
        ],
      },
      {
        id: 106, lesson_id: 2, question_type: 'multiple_choice',
        prompt: '"Mishki" en quechua significa:',
        options: [
          { id: 1016, question_id: 106, option_text: 'Dulce / Delicioso', is_correct: true },
          { id: 1017, question_id: 106, option_text: 'Amargo', is_correct: false },
          { id: 1018, question_id: 106, option_text: 'Salado', is_correct: false },
        ],
      },
    ],
  },
  // Nivel 2 — Números (lecciones 3 del 1 al 5 + 4 del 6 al 10)
  2: {
    title: 'Examen de Números',
    pass_threshold: 60,
    questions: [
      {
        id: 201, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "uno" en quechua?',
        options: [
          { id: 2001, question_id: 201, option_text: 'Huk', is_correct: true },
          { id: 2002, question_id: 201, option_text: 'Iskay', is_correct: false },
          { id: 2003, question_id: 201, option_text: 'Kimsa', is_correct: false },
        ],
      },
      {
        id: 202, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '"Kimsa" significa en español:',
        options: [
          { id: 2004, question_id: 202, option_text: 'Tres', is_correct: true },
          { id: 2005, question_id: 202, option_text: 'Dos', is_correct: false },
          { id: 2006, question_id: 202, option_text: 'Cuatro', is_correct: false },
        ],
      },
      {
        id: 203, lesson_id: 3, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "cinco" en quechua?',
        options: [
          { id: 2007, question_id: 203, option_text: 'Pichqa', is_correct: true },
          { id: 2008, question_id: 203, option_text: 'Tawa', is_correct: false },
          { id: 2009, question_id: 203, option_text: 'Soqta', is_correct: false },
        ],
      },
      {
        id: 204, lesson_id: 4, question_type: 'multiple_choice',
        prompt: '"Qanchis" corresponde en español a:',
        options: [
          { id: 2010, question_id: 204, option_text: 'Siete', is_correct: true },
          { id: 2011, question_id: 204, option_text: 'Ocho', is_correct: false },
          { id: 2012, question_id: 204, option_text: 'Nueve', is_correct: false },
        ],
      },
      {
        id: 205, lesson_id: 4, question_type: 'multiple_choice',
        prompt: '¿Qué número quechua es "Pusaq"?',
        options: [
          { id: 2013, question_id: 205, option_text: 'Ocho (8)', is_correct: true },
          { id: 2014, question_id: 205, option_text: 'Nueve (9)', is_correct: false },
          { id: 2015, question_id: 205, option_text: 'Seis (6)', is_correct: false },
        ],
      },
      {
        id: 206, lesson_id: 4, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "diez" en quechua?',
        options: [
          { id: 2016, question_id: 206, option_text: 'Chunka', is_correct: true },
          { id: 2017, question_id: 206, option_text: 'Isqon', is_correct: false },
          { id: 2018, question_id: 206, option_text: 'Pusaq', is_correct: false },
        ],
      },
    ],
  },
  // Nivel 3 — Palabras (lecciones 5 Saludos + 6 Familia)
  3: {
    title: 'Examen de Palabras Esenciales',
    pass_threshold: 60,
    questions: [
      {
        id: 301, lesson_id: 5, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "Hola / Buen día" en quechua?',
        options: [
          { id: 3001, question_id: 301, option_text: 'Allianchu / Rimaykullayki', is_correct: true },
          { id: 3002, question_id: 301, option_text: 'Tupananchiskama', is_correct: false },
          { id: 3003, question_id: 301, option_text: 'Allin', is_correct: false },
        ],
      },
      {
        id: 302, lesson_id: 5, question_type: 'multiple_choice',
        prompt: '"Tupananchiskama" significa:',
        options: [
          { id: 3004, question_id: 302, option_text: 'Hasta que nos volvamos a ver / Adiós', is_correct: true },
          { id: 3005, question_id: 302, option_text: 'Buenos días', is_correct: false },
          { id: 3006, question_id: 302, option_text: 'Gracias', is_correct: false },
        ],
      },
      {
        id: 303, lesson_id: 5, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "gracias" en quechua?',
        options: [
          { id: 3007, question_id: 303, option_text: 'Añay / Sulpayki', is_correct: true },
          { id: 3008, question_id: 303, option_text: 'Allinmi', is_correct: false },
          { id: 3009, question_id: 303, option_text: 'Mana', is_correct: false },
        ],
      },
      {
        id: 304, lesson_id: 6, question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "mamá" en quechua?',
        options: [
          { id: 3010, question_id: 304, option_text: 'Mama', is_correct: true },
          { id: 3011, question_id: 304, option_text: 'Tayta', is_correct: false },
          { id: 3012, question_id: 304, option_text: 'Wawa', is_correct: false },
        ],
      },
      {
        id: 305, lesson_id: 6, question_type: 'multiple_choice',
        prompt: '"Tayta" significa en español:',
        options: [
          { id: 3013, question_id: 305, option_text: 'Padre / Papá', is_correct: true },
          { id: 3014, question_id: 305, option_text: 'Madre / Mamá', is_correct: false },
          { id: 3015, question_id: 305, option_text: 'Hermano', is_correct: false },
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

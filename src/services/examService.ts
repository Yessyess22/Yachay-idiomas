import { supabase } from '@/src/services/supabase';
import { ExamWithQuestions, QuestionOption, QuestionWithOptions } from '@/src/types';

/**
 * Preguntas de examen estructuradas y mixtas por nivel.
 * Evalúan de forma integral las lecciones del nivel combinando:
 * - Opción múltiple conceptual
 * - Completar palabras / sílabas (fill_blank)
 * - Emparejar pares de términos (matching_pairs)
 * - Banco de palabras para armar frases (word_bank)
 * - Comprensión auditiva (listening)
 */
const EXAM_FALLBACK: Record<number, { title: string; pass_threshold: number; questions: QuestionWithOptions[] }> = {
  // ── NIVEL 1: EXAMEN MIXTO DE FONÉTICA Y RUNASIMI (VOCALES + CONSONANTES) ──
  1: {
    title: 'Examen de Fonética y Runasimi',
    pass_threshold: 70,
    questions: [
      {
        id: 101,
        lesson_id: 1,
        question_type: 'multiple_choice',
        prompt: '¿Cuáles son las 3 únicas vocales fonémicas del sistema originario del Runasimi?',
        options: [
          { id: 1001, question_id: 101, option_text: 'A, I, U (Sistema trivocálico)', is_correct: true },
          { id: 1002, question_id: 101, option_text: 'A, E, I, O, U (Cinco vocales)', is_correct: false },
          { id: 1003, question_id: 101, option_text: 'A, E, U', is_correct: false },
          { id: 1004, question_id: 101, option_text: 'E, I, O', is_correct: false },
        ],
      },
      {
        id: 102,
        lesson_id: 1,
        question_type: 'listening',
        audioWord: 'Inti',
        prompt: 'Escucha el audio y selecciona la palabra quechua y su significado en español:',
        options: [
          { id: 1005, question_id: 102, option_text: 'Inti (Sol sagrado)', is_correct: true },
          { id: 1006, question_id: 102, option_text: 'Urpi (Paloma)', is_correct: false },
          { id: 1007, question_id: 102, option_text: 'Wasi (Casa)', is_correct: false },
          { id: 1008, question_id: 102, option_text: 'Quri (Oro)', is_correct: false },
        ],
      },
      {
        id: 103,
        lesson_id: 2,
        question_type: 'fill_blank',
        prompt: 'Completa la consonante posvelar profunda para formar "Oro": "__uri"',
        options: [
          { id: 1009, question_id: 103, option_text: 'Q (Quri)', is_correct: true },
          { id: 1010, question_id: 103, option_text: 'K (Kuri)', is_correct: false },
          { id: 1011, question_id: 103, option_text: 'M (Muri)', is_correct: false },
          { id: 1012, question_id: 103, option_text: 'W (Wuri)', is_correct: false },
        ],
      },
      {
        id: 104,
        lesson_id: 2,
        question_type: 'multiple_choice',
        prompt: '¿Cómo se diferencia la articulación de la consonante "Q" frente a la "K" en Quechua?',
        options: [
          { id: 1013, question_id: 104, option_text: 'La "Q" es posvelar (fondo de la garganta) y la "K" es velar común', is_correct: true },
          { id: 1014, question_id: 104, option_text: 'La "Q" se pronuncia con los labios y la "K" con los dientes', is_correct: false },
          { id: 1015, question_id: 104, option_text: 'Ambas suenan exactamente igual al español', is_correct: false },
          { id: 1016, question_id: 104, option_text: 'La "Q" es una letra muda en quechua', is_correct: false },
        ],
      },
      {
        id: 105,
        lesson_id: 1,
        question_type: 'matching_pairs',
        prompt: 'Empareja los términos mixtos de vocales y consonantes con su traducción:',
        pairs: [
          { qu: 'Inti', es: 'Sol' },
          { qu: 'Quri', es: 'Oro' },
          { qu: 'Wasi', es: 'Casa' },
          { qu: 'Urpi', es: 'Paloma' },
        ],
        options: [
          { id: 1017, question_id: 105, option_text: 'Inti • Quri • Wasi • Urpi', is_correct: true },
        ],
      },
      {
        id: 106,
        lesson_id: 2,
        question_type: 'word_bank',
        prompt: 'Toca las palabras en orden para formar la frase en quechua: "Casa de oro"',
        correctSentence: 'Quri wasi',
        words: ['Quri', 'wasi', 'Inti', 'Allin'],
        options: [
          { id: 1018, question_id: 106, option_text: 'Quri wasi', is_correct: true },
        ],
      },
      {
        id: 107,
        lesson_id: 2,
        question_type: 'listening',
        audioWord: 'Mishki',
        prompt: 'Escucha el audio "Mishki" (dulce/delicioso). ¿Qué sonido especial contiene?',
        options: [
          { id: 1019, question_id: 107, option_text: 'El sonido fricativo suave "SH"', is_correct: true },
          { id: 1020, question_id: 107, option_text: 'El sonido posvelar "Q"', is_correct: false },
          { id: 1021, question_id: 107, option_text: 'El sonido lateral palatal "LL"', is_correct: false },
          { id: 1022, question_id: 107, option_text: 'La vocal "O"', is_correct: false },
        ],
      },
      {
        id: 108,
        lesson_id: 1,
        question_type: 'fill_blank',
        prompt: 'Completa la vocal para formar la palabra "Bueno / Bien": "All__n"',
        options: [
          { id: 1023, question_id: 108, option_text: 'i (Allin)', is_correct: true },
          { id: 1024, question_id: 108, option_text: 'u (Allun)', is_correct: false },
          { id: 1025, question_id: 108, option_text: 'a (Allan)', is_correct: false },
          { id: 1026, question_id: 108, option_text: 'e (Allen)', is_correct: false },
        ],
      },
      {
        id: 109,
        lesson_id: 1,
        question_type: 'speaking',
        prompt: 'Usa el micrófono para pronunciar la palabra quechua sagrada:',
        targetWord: 'Inti',
        translation: 'Sol sagrado',
        options: [
          { id: 1027, question_id: 109, option_text: 'Inti', is_correct: true },
        ],
      },
      {
        id: 110,
        lesson_id: 2,
        question_type: 'speaking',
        prompt: 'Pronuncia con la garganta la consonante posvelar profunda "Q":',
        targetWord: 'Quri',
        translation: 'Oro',
        options: [
          { id: 1028, question_id: 110, option_text: 'Quri', is_correct: true },
        ],
      },
    ],
  },

  // ── NIVEL 2: EXAMEN MIXTO DE YUPAYKUNA (NÚMEROS 1 AL 10) ──────────────────
  2: {
    title: 'Examen de Números del 1 al 10',
    pass_threshold: 70,
    questions: [
      {
        id: 201,
        lesson_id: 3,
        question_type: 'multiple_choice',
        prompt: '¿Cómo se dice "Uno" (1) y "Dos" (2) en quechua?',
        options: [
          { id: 2001, question_id: 201, option_text: 'Huk e Iskay', is_correct: true },
          { id: 2002, question_id: 201, option_text: 'Kimsa y Tawa', is_correct: false },
          { id: 2003, question_id: 201, option_text: 'Soqta y Qanchis', is_correct: false },
          { id: 2004, question_id: 201, option_text: 'Pichqa y Chunka', is_correct: false },
        ],
      },
      {
        id: 202,
        lesson_id: 3,
        question_type: 'matching_pairs',
        prompt: 'Empareja los primeros números del 1 al 5:',
        pairs: [
          { qu: 'Huk', es: '1' },
          { qu: 'Iskay', es: '2' },
          { qu: 'Kimsa', es: '3' },
          { qu: 'Tawa', es: '4' },
          { qu: 'Pichqa', es: '5' },
        ],
        options: [
          { id: 2005, question_id: 202, option_text: 'Huk • Iskay • Kimsa • Tawa • Pichqa', is_correct: true },
        ],
      },
      {
        id: 203,
        lesson_id: 4,
        question_type: 'listening',
        audioWord: 'Chunka',
        prompt: 'Escucha el audio y selecciona el número quechua correspondiente:',
        options: [
          { id: 2006, question_id: 203, option_text: 'Chunka (10)', is_correct: true },
          { id: 2007, question_id: 203, option_text: 'Isqon (9)', is_correct: false },
          { id: 2008, question_id: 203, option_text: 'Pusaq (8)', is_correct: false },
          { id: 2009, question_id: 203, option_text: 'Soqta (6)', is_correct: false },
        ],
      },
      {
        id: 204,
        lesson_id: 4,
        question_type: 'matching_pairs',
        prompt: 'Empareja los números avanzados del 6 al 10:',
        pairs: [
          { qu: 'Soqta', es: '6' },
          { qu: 'Qanchis', es: '7' },
          { qu: 'Pusaq', es: '8' },
          { qu: 'Isqon', es: '9' },
          { qu: 'Chunka', es: '10' },
        ],
        options: [
          { id: 2010, question_id: 204, option_text: 'Soqta • Qanchis • Pusaq • Isqon • Chunka', is_correct: true },
        ],
      },
      {
        id: 205,
        lesson_id: 3,
        question_type: 'fill_blank',
        prompt: 'Completa la secuencia: "Huk, Iskay, ___, Tawa, Pichqa"',
        options: [
          { id: 2011, question_id: 205, option_text: 'Kimsa (3)', is_correct: true },
          { id: 2012, question_id: 205, option_text: 'Soqta (6)', is_correct: false },
          { id: 2013, question_id: 205, option_text: 'Pusaq (8)', is_correct: false },
          { id: 2014, question_id: 205, option_text: 'Chunka (10)', is_correct: false },
        ],
      },
      {
        id: 206,
        lesson_id: 4,
        question_type: 'word_bank',
        prompt: 'Ordena los números de menor a mayor: 6, 7, 8',
        correctSentence: 'Soqta Qanchis Pusaq',
        words: ['Pusaq', 'Soqta', 'Qanchis', 'Chunka'],
        options: [
          { id: 2015, question_id: 206, option_text: 'Soqta Qanchis Pusaq', is_correct: true },
        ],
      },
      {
        id: 207,
        lesson_id: 4,
        question_type: 'multiple_choice',
        prompt: 'Si "Qanchis" es 7 y "Pusaq" es 8, ¿qué número es "Isqon"?',
        options: [
          { id: 2016, question_id: 207, option_text: 'Nueve (9)', is_correct: true },
          { id: 2017, question_id: 207, option_text: 'Seis (6)', is_correct: false },
          { id: 2018, question_id: 207, option_text: 'Diez (10)', is_correct: false },
          { id: 2019, question_id: 207, option_text: 'Cinco (5)', is_correct: false },
        ],
      },
      {
        id: 208,
        lesson_id: 3,
        question_type: 'word_bank',
        prompt: 'Toca las palabras para formar la frase: "Tres casas"',
        correctSentence: 'Kimsa wasi',
        words: ['wasi', 'Kimsa', 'Huk', 'Tawa'],
        options: [
          { id: 2020, question_id: 208, option_text: 'Kimsa wasi', is_correct: true },
        ],
      },
      {
        id: 209,
        lesson_id: 3,
        question_type: 'speaking',
        prompt: 'Usa el micrófono y pronuncia el número "Uno" en quechua:',
        targetWord: 'Huk',
        translation: 'Uno',
        options: [
          { id: 2021, question_id: 209, option_text: 'Huk', is_correct: true },
        ],
      },
    ],
  },

  // ── NIVEL 3: EXAMEN MIXTO DE RIMAYKUNA (SALUDOS Y FAMILIA) ────────────────
  3: {
    title: 'Examen de Saludos y Familia Andina',
    pass_threshold: 70,
    questions: [
      {
        id: 301,
        lesson_id: 5,
        question_type: 'multiple_choice',
        prompt: 'Si alguien te saluda con "Allillanchu?", ¿cuál es la respuesta tradicional correcta?',
        options: [
          { id: 3001, question_id: 301, option_text: 'Allillanmi (Estoy bien)', is_correct: true },
          { id: 3002, question_id: 301, option_text: 'Añay (Gracias)', is_correct: false },
          { id: 3003, question_id: 301, option_text: 'Tupananchiskama (Hasta luego)', is_correct: false },
          { id: 3004, question_id: 301, option_text: 'Manan (No)', is_correct: false },
        ],
      },
      {
        id: 302,
        lesson_id: 5,
        question_type: 'listening',
        audioWord: 'Añay',
        prompt: 'Escucha el audio y selecciona la traducción en español:',
        options: [
          { id: 3005, question_id: 302, option_text: 'Gracias', is_correct: true },
          { id: 3006, question_id: 302, option_text: 'Buenos días', is_correct: false },
          { id: 3007, question_id: 302, option_text: 'Hasta mañana', is_correct: false },
          { id: 3008, question_id: 302, option_text: 'Por favor', is_correct: false },
        ],
      },
      {
        id: 303,
        lesson_id: 6,
        question_type: 'matching_pairs',
        prompt: 'Empareja los miembros del Ayllu (familia):',
        pairs: [
          { qu: 'Tayta', es: 'Padre' },
          { qu: 'Mama', es: 'Madre' },
          { qu: 'Wawa', es: 'Bebé' },
          { qu: 'Awicha', es: 'Abuela' },
        ],
        options: [
          { id: 3009, question_id: 303, option_text: 'Tayta • Mama • Wawa • Awicha', is_correct: true },
        ],
      },
      {
        id: 304,
        lesson_id: 5,
        question_type: 'word_bank',
        prompt: 'Ordena las palabras para formar la despedida andina: "Hasta volver a encontrarnos"',
        correctSentence: 'Tupananchiskama',
        words: ['Tupananchiskama', 'Allin', 'Añay'],
        options: [
          { id: 3010, question_id: 304, option_text: 'Tupananchiskama', is_correct: true },
        ],
      },
      {
        id: 305,
        lesson_id: 5,
        question_type: 'fill_blank',
        prompt: 'Completa el saludo nocturno: "Allin ___" (Buenas noches)',
        options: [
          { id: 3011, question_id: 305, option_text: 'tuta', is_correct: true },
          { id: 3012, question_id: 305, option_text: "p'unchaw", is_correct: false },
          { id: 3013, question_id: 305, option_text: 'suka', is_correct: false },
          { id: 3014, question_id: 305, option_text: 'wasi', is_correct: false },
        ],
      },
      {
        id: 306,
        lesson_id: 6,
        question_type: 'multiple_choice',
        prompt: 'En la familia quechua, ¿cómo se llama el abuelo respetado?',
        options: [
          { id: 3015, question_id: 306, option_text: 'Awichu', is_correct: true },
          { id: 3016, question_id: 306, option_text: 'Awicha', is_correct: false },
          { id: 3017, question_id: 306, option_text: 'Churi', is_correct: false },
          { id: 3018, question_id: 306, option_text: 'Tayta', is_correct: false },
        ],
      },
      {
        id: 307,
        lesson_id: 6,
        question_type: 'word_bank',
        prompt: 'Forma la frase: "Padre sabio"',
        correctSentence: 'Yachachiq tayta',
        words: ['tayta', 'Yachachiq', 'Mama', 'Wawa'],
        options: [
          { id: 3019, question_id: 307, option_text: 'Yachachiq tayta', is_correct: true },
        ],
      },
      {
        id: 308,
        lesson_id: 5,
        question_type: 'matching_pairs',
        prompt: 'Empareja los saludos y expresiones de cortesía:',
        pairs: [
          { qu: 'Allillanchu', es: '¿Cómo estás?' },
          { qu: 'Allillanmi', es: 'Estoy bien' },
          { qu: 'Añay', es: 'Gracias' },
          { qu: 'Tupananchiskama', es: 'Hasta luego' },
        ],
        options: [
          { id: 3020, question_id: 308, option_text: 'Allillanchu • Allillanmi • Añay • Tupananchiskama', is_correct: true },
        ],
      },
      {
        id: 309,
        lesson_id: 5,
        question_type: 'speaking',
        prompt: 'Usa el micrófono y di en voz alta el saludo tradicional quechua:',
        targetWord: 'Allillanchu',
        translation: '¿Cómo estás?',
        options: [
          { id: 3021, question_id: 309, option_text: 'Allillanchu', is_correct: true },
        ],
      },
    ],
  },
};

export const examService = {
  async fetchExamByLevel(levelId: number): Promise<{ data: ExamWithQuestions | null; error: string | null }> {
    // 1. Priorizar el banco curricular dinámico enriquecido (Vocales + Consonantes mixtas, pares, banco de palabras, audios)
    const fallback = EXAM_FALLBACK[levelId];
    if (fallback) {
      return {
        data: {
          id: levelId,
          level_id: levelId,
          title: fallback.title,
          pass_threshold: fallback.pass_threshold,
          questions: fallback.questions,
        },
        error: null,
      };
    }

    try {
      // 2. Intentar consultar examen formal en Supabase si no existe pack local
      const { data: examRow, error: examErr } = await supabase
        .from('exams')
        .select('*')
        .eq('level_id', levelId)
        .maybeSingle();

      if (!examErr && examRow) {
        const { data: examQuestions, error: qErr } = await supabase
          .from('exam_questions')
          .select(`
            question:questions(
              id,
              lesson_id,
              prompt,
              question_type,
              options:question_options(id, question_id, option_text, is_correct)
            )
          `)
          .eq('exam_id', examRow.id);

        if (!qErr && examQuestions && examQuestions.length > 0) {
          const questions: QuestionWithOptions[] = examQuestions
            .map((eq: any) => eq.question)
            .filter(Boolean);

          if (questions.length > 0) {
            return {
              data: {
                ...examRow,
                questions,
              },
              error: null,
            };
          }
        }
      }
    } catch {
      // Fallback seguro
    }

    return { data: null, error: 'Examen no disponible para este nivel.' };
  },
};

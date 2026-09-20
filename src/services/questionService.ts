import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/services/supabase';
import { QuestionOption, QuestionWithOptions } from '@/src/types';

const DEFAULT_QUESTIONS: Record<number, QuestionWithOptions[]> = {
  1: [
    {
      id: 1,
      lesson_id: 1,
      prompt: '¿Cuáles son las 3 únicas vocales fonémicas del alfabeto Quechua oficial?',
      question_type: 'multiple_choice',
      options: [
        { id: 1, question_id: 1, option_text: 'a, i, u (Sistema trivocálico)', is_correct: true },
        { id: 2, question_id: 1, option_text: 'a, e, i, o, u (Cinco vocales)', is_correct: false },
        { id: 3, question_id: 1, option_text: 'a, i, u, e (Cuatro vocales)', is_correct: false },
      ],
    },
    {
      id: 2,
      lesson_id: 1,
      prompt: '¿Por qué las letras "e" y "o" no se escriben en el quechua estándar oficial?',
      question_type: 'multiple_choice',
      options: [
        { id: 4, question_id: 2, option_text: 'Son alófonos que suenan al abrirse cerca de la consonante "q"', is_correct: true },
        { id: 5, question_id: 2, option_text: 'Fueron eliminadas por influencia del español', is_correct: false },
        { id: 6, question_id: 2, option_text: 'El quechua nunca tuvo esos sonidos en el habla', is_correct: false },
      ],
    },
    {
      id: 3,
      lesson_id: 1,
      prompt: '¿Qué vocal abierta completa la palabra quechua "__llin" (bueno / bien)?',
      question_type: 'multiple_choice',
      options: [
        { id: 7, question_id: 3, option_text: 'a (Allin)', is_correct: true },
        { id: 8, question_id: 3, option_text: 'i (Illin)', is_correct: false },
        { id: 9, question_id: 3, option_text: 'u (Ullin)', is_correct: false },
      ],
    },
    {
      id: 4,
      lesson_id: 1,
      prompt: '"Inti" comienza con vocal "i" y significa en español:',
      question_type: 'multiple_choice',
      options: [
        { id: 10, question_id: 4, option_text: 'Sol sagrado', is_correct: true },
        { id: 11, question_id: 4, option_text: 'Luna andina', is_correct: false },
        { id: 12, question_id: 4, option_text: 'Estrella del alba', is_correct: false },
      ],
    },
    {
      id: 5,
      lesson_id: 1,
      prompt: '¿Qué palabra quechua con vocal "u" significa "paloma" o "mensajera"?',
      question_type: 'multiple_choice',
      options: [
        { id: 13, question_id: 5, option_text: 'Urpi', is_correct: true },
        { id: 14, question_id: 5, option_text: 'Allqo (Perro)', is_correct: false },
        { id: 15, question_id: 5, option_text: 'Wasi (Casa)', is_correct: false },
      ],
    },
  ],
  2: [
    {
      id: 6,
      lesson_id: 2,
      prompt: 'La consonante posvelar "q" del quechua se articula desde:',
      question_type: 'multiple_choice',
      options: [
        { id: 16, question_id: 6, option_text: 'La garganta profunda (zona uvular/posvelar)', is_correct: true },
        { id: 17, question_id: 6, option_text: 'Los labios como una "p"', is_correct: false },
        { id: 18, question_id: 6, option_text: 'Los dientes como una "t"', is_correct: false },
      ],
    },
    {
      id: 7,
      lesson_id: 2,
      prompt: '¿Cómo se escribe "oro" en quechua utilizando la consonante posvelar?',
      question_type: 'multiple_choice',
      options: [
        { id: 19, question_id: 7, option_text: 'Quri', is_correct: true },
        { id: 20, question_id: 7, option_text: 'Kuri', is_correct: false },
        { id: 21, question_id: 7, option_text: 'Qollqe (Plata)', is_correct: false },
      ],
    },
    {
      id: 8,
      lesson_id: 2,
      prompt: '¿Qué significa el término quechua "Mishki", que contiene el sonido "sh"?',
      question_type: 'multiple_choice',
      options: [
        { id: 22, question_id: 8, option_text: 'Dulce / Delicioso', is_correct: true },
        { id: 23, question_id: 8, option_text: 'Amargo / Agrio', is_correct: false },
        { id: 24, question_id: 8, option_text: 'Salado / Seco', is_correct: false },
      ],
    },
    {
      id: 9,
      lesson_id: 2,
      prompt: '¿Cómo se dice "casa" u "hogar" en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 25, question_id: 9, option_text: 'Wasi', is_correct: true },
        { id: 26, question_id: 9, option_text: 'Mayu (Río)', is_correct: false },
        { id: 27, question_id: 9, option_text: 'Urqu (Cerro)', is_correct: false },
      ],
    },
    {
      id: 10,
      lesson_id: 2,
      prompt: 'En el Achahala quechua, ¿cómo se pronuncia la consonante palatal "ll"?',
      question_type: 'multiple_choice',
      options: [
        { id: 28, question_id: 10, option_text: 'Apoyando el dorso de la lengua al paladar [ʎ] (como en "Allin")', is_correct: true },
        { id: 29, question_id: 10, option_text: 'Exactamente igual a la "sh"', is_correct: false },
        { id: 30, question_id: 10, option_text: 'Como una "l" simple', is_correct: false },
      ],
    },
  ],
  3: [
    {
      id: 11,
      lesson_id: 3,
      prompt: '¿Qué número quechua representa la unidad y origen ("uno")?',
      question_type: 'multiple_choice',
      options: [
        { id: 31, question_id: 11, option_text: 'Huk', is_correct: true },
        { id: 32, question_id: 11, option_text: 'Iskay (Dos)', is_correct: false },
        { id: 33, question_id: 11, option_text: 'Kinsa (Tres)', is_correct: false },
      ],
    },
    {
      id: 12,
      lesson_id: 3,
      prompt: 'Si sumas "Huk" (1) más "Iskay" (2), ¿qué número obtienes en Quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 34, question_id: 12, option_text: 'Kinsa (3)', is_correct: true },
        { id: 35, question_id: 12, option_text: 'Tawa (4)', is_correct: false },
        { id: 36, question_id: 12, option_text: 'Pichqa (5)', is_correct: false },
      ],
    },
    {
      id: 13,
      lesson_id: 3,
      prompt: 'El concepto sagrado inca "Tawantinsuyu" hace referencia a cuatro regiones. ¿Qué número es "cuatro"?',
      question_type: 'multiple_choice',
      options: [
        { id: 37, question_id: 13, option_text: 'Tawa', is_correct: true },
        { id: 38, question_id: 13, option_text: 'Soqta (6)', is_correct: false },
        { id: 39, question_id: 13, option_text: 'Chunka (10)', is_correct: false },
      ],
    },
    {
      id: 14,
      lesson_id: 3,
      prompt: '¿Cómo se denomina el número "cinco" en Quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 40, question_id: 14, option_text: 'Pichqa', is_correct: true },
        { id: 41, question_id: 14, option_text: 'Qanchis (7)', is_correct: false },
        { id: 42, question_id: 14, option_text: 'Pusaq (8)', is_correct: false },
      ],
    },
    {
      id: 15,
      lesson_id: 3,
      prompt: '"Iskay" representa en el pensamiento andino el principio de dualidad complementaria. ¿Qué número es?',
      question_type: 'multiple_choice',
      options: [
        { id: 43, question_id: 15, option_text: 'Dos (2)', is_correct: true },
        { id: 44, question_id: 15, option_text: 'Uno (1)', is_correct: false },
        { id: 45, question_id: 15, option_text: 'Tres (3)', is_correct: false },
      ],
    },
  ],
  4: [
    {
      id: 16,
      lesson_id: 4,
      prompt: '¿Cuál es el número quechua que sigue inmediatamente a "Pichqa" (5)?',
      question_type: 'multiple_choice',
      options: [
        { id: 46, question_id: 16, option_text: 'Soqta (6)', is_correct: true },
        { id: 47, question_id: 16, option_text: 'Qanchis (7)', is_correct: false },
        { id: 48, question_id: 16, option_text: 'Pusaq (8)', is_correct: false },
      ],
    },
    {
      id: 17,
      lesson_id: 4,
      prompt: 'El número "Qanchis" corresponde en español a:',
      question_type: 'multiple_choice',
      options: [
        { id: 49, question_id: 17, option_text: 'Siete (7)', is_correct: true },
        { id: 50, question_id: 17, option_text: 'Ocho (8)', is_correct: false },
        { id: 51, question_id: 17, option_text: 'Nueve (9)', is_correct: false },
      ],
    },
    {
      id: 18,
      lesson_id: 4,
      prompt: 'Si tienes "Soqta" (6) y le sumas "Iskay" (2), ¿qué número quechua resulta?',
      question_type: 'multiple_choice',
      options: [
        { id: 52, question_id: 18, option_text: 'Pusaq (8)', is_correct: true },
        { id: 53, question_id: 18, option_text: 'Isqon (9)', is_correct: false },
        { id: 54, question_id: 18, option_text: 'Chunka (10)', is_correct: false },
      ],
    },
    {
      id: 19,
      lesson_id: 4,
      prompt: '¿Qué cifra representa "Isqon", el último dígito antes de la decena?',
      question_type: 'multiple_choice',
      options: [
        { id: 55, question_id: 19, option_text: 'Nueve (9)', is_correct: true },
        { id: 56, question_id: 19, option_text: 'Diez (10)', is_correct: false },
        { id: 57, question_id: 19, option_text: 'Ocho (8)', is_correct: false },
      ],
    },
    {
      id: 20,
      lesson_id: 4,
      prompt: 'En el sistema decimal quechua, ¿cómo se llama la decena base ("diez")?',
      question_type: 'multiple_choice',
      options: [
        { id: 58, question_id: 20, option_text: 'Chunka', is_correct: true },
        { id: 59, question_id: 20, option_text: 'Pachak (Cien)', is_correct: false },
        { id: 60, question_id: 20, option_text: 'Waranqa (Mil)', is_correct: false },
      ],
    },
  ],
  5: [
    {
      id: 21,
      lesson_id: 5,
      prompt: '¿Cómo se saluda con cortesía preguntando "¿Cómo estás?" en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 61, question_id: 21, option_text: 'Allillanchu', is_correct: true },
        { id: 62, question_id: 21, option_text: 'Allinmi (Estoy bien)', is_correct: false },
        { id: 63, question_id: 21, option_text: 'Añay (Gracias)', is_correct: false },
      ],
    },
    {
      id: 22,
      lesson_id: 5,
      prompt: 'Ante el saludo "¿Allillanchu?", ¿cuál es la respuesta afirmativa correcta con el validador "-mi"?',
      question_type: 'multiple_choice',
      options: [
        { id: 64, question_id: 22, option_text: 'Allillanmi (Estoy bien)', is_correct: true },
        { id: 65, question_id: 22, option_text: 'Manan (No)', is_correct: false },
        { id: 66, question_id: 22, option_text: 'Ripuni (Me voy)', is_correct: false },
      ],
    },
    {
      id: 23,
      lesson_id: 5,
      prompt: '¿Cómo se dice "gracias" con profundo respeto en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 67, question_id: 23, option_text: 'Añay / Sulpayki', is_correct: true },
        { id: 68, question_id: 23, option_text: 'Allin tuta (Buenas noches)', is_correct: false },
        { id: 69, question_id: 23, option_text: 'Ama hina kaychu (Por favor)', is_correct: false },
      ],
    },
    {
      id: 24,
      lesson_id: 5,
      prompt: 'La despedida "Tupananchiskama" expresa en su sufijo "-kama":',
      question_type: 'multiple_choice',
      options: [
        { id: 70, question_id: 24, option_text: '"Hasta" volver a encontrarnos (límite temporal de esperanza)', is_correct: true },
        { id: 71, question_id: 24, option_text: 'Un adiós definitivo y para siempre', is_correct: false },
        { id: 72, question_id: 24, option_text: 'Una orden imperativa', is_correct: false },
      ],
    },
    {
      id: 25,
      lesson_id: 5,
      prompt: '¿Qué expresión se utiliza para desear "buenos días" en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 73, question_id: 25, option_text: 'Allin p\'unchay', is_correct: true },
        { id: 74, question_id: 25, option_text: 'Allin tuta (Buenas noches)', is_correct: false },
        { id: 75, question_id: 25, option_text: 'Allin sukha (Buenas tardes)', is_correct: false },
      ],
    },
  ],
  6: [
    {
      id: 26,
      lesson_id: 6,
      prompt: 'En la cosmovisión del Ayllu, ¿cómo se dice "padre" o figura de respeto paterno?',
      question_type: 'multiple_choice',
      options: [
        { id: 76, question_id: 26, option_text: 'Tayta', is_correct: true },
        { id: 77, question_id: 26, option_text: 'Mama (Madre)', is_correct: false },
        { id: 78, question_id: 26, option_text: 'Wawqi (Hermano)', is_correct: false },
      ],
    },
    {
      id: 27,
      lesson_id: 6,
      prompt: '¿Cómo se dice "madre" o "mamá" en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 79, question_id: 27, option_text: 'Mama', is_correct: true },
        { id: 80, question_id: 27, option_text: 'Pana (Hermana)', is_correct: false },
        { id: 81, question_id: 27, option_text: 'Awicha (Abuela)', is_correct: false },
      ],
    },
    {
      id: 28,
      lesson_id: 6,
      prompt: '¿Quién utiliza exclusivamente el término "Churi" para referirse a su hijo o hija?',
      question_type: 'multiple_choice',
      options: [
        { id: 82, question_id: 28, option_text: 'El padre (varón)', is_correct: true },
        { id: 83, question_id: 28, option_text: 'La madre hacia el recién nacido', is_correct: false },
        { id: 84, question_id: 28, option_text: 'Los tíos hacia sobrinos', is_correct: false },
      ],
    },
    {
      id: 29,
      lesson_id: 6,
      prompt: '¿Qué término de parentesco utiliza una mujer para llamar a su hijo/a o bebé?',
      question_type: 'multiple_choice',
      options: [
        { id: 85, question_id: 29, option_text: 'Wawa', is_correct: true },
        { id: 86, question_id: 29, option_text: 'Tura (Hermano de mujer)', is_correct: false },
        { id: 87, question_id: 29, option_text: 'Yana (Amigo)', is_correct: false },
      ],
    },
    {
      id: 30,
      lesson_id: 6,
      prompt: '¿Cómo se llama con cariño a la abuela en el quechua tradicional andino?',
      question_type: 'multiple_choice',
      options: [
        { id: 88, question_id: 30, option_text: 'Awicha / Hatun mama', is_correct: true },
        { id: 89, question_id: 30, option_text: 'Ususi (Hija de varón)', is_correct: false },
        { id: 90, question_id: 30, option_text: 'Ipa (Tía)', is_correct: false },
      ],
    },
  ],
  7: [
    {
      id: 31,
      lesson_id: 7,
      prompt: '¿Cuál es el orden numérico correcto del 1 al 3 en Quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 91, question_id: 31, option_text: 'Huk, Iskay, Kinsa', is_correct: true },
        { id: 92, question_id: 31, option_text: 'Iskay, Huk, Kinsa', is_correct: false },
        { id: 93, question_id: 31, option_text: 'Kinsa, Tawa, Huk', is_correct: false },
      ],
    },
    {
      id: 32,
      lesson_id: 7,
      prompt: '¿Qué sufijo regular indica plural en la gramática Quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 94, question_id: 32, option_text: '-kuna (e.g. wasi -> wasikuna)', is_correct: true },
        { id: 95, question_id: 32, option_text: '-mi (validador testimonial)', is_correct: false },
        { id: 96, question_id: 32, option_text: '-chu (marcador interrogativo)', is_correct: false },
      ],
    },
  ],
  8: [
    {
      id: 33,
      lesson_id: 8,
      prompt: '¿Cómo se expresa cortesía al saludar diciendo "¿Cómo estás?" en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 97, question_id: 33, option_text: 'Allillanchu', is_correct: true },
        { id: 98, question_id: 33, option_text: 'Allinmi', is_correct: false },
        { id: 99, question_id: 33, option_text: 'Tupananchiskama', is_correct: false },
      ],
    },
    {
      id: 34,
      lesson_id: 8,
      prompt: 'La respuesta correcta a "Allillanchu?" con sufijo de certeza es:',
      question_type: 'multiple_choice',
      options: [
        { id: 100, question_id: 34, option_text: 'Allillanmi', is_correct: true },
        { id: 101, question_id: 34, option_text: 'Manan', is_correct: false },
        { id: 102, question_id: 34, option_text: 'Sulpayki', is_correct: false },
      ],
    },
  ],
  9: [
    {
      id: 35,
      lesson_id: 9,
      prompt: 'En el sistema de parentesco andino, ¿cómo se dice "padre" en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 103, question_id: 35, option_text: 'Tayta', is_correct: true },
        { id: 104, question_id: 35, option_text: 'Mama', is_correct: false },
        { id: 105, question_id: 35, option_text: 'Churi', is_correct: false },
      ],
    },
    {
      id: 36,
      lesson_id: 9,
      prompt: '¿Qué término exclusivo utiliza una madre para llamar a su hijo/a o bebé?',
      question_type: 'multiple_choice',
      options: [
        { id: 106, question_id: 36, option_text: 'Wawa', is_correct: true },
        { id: 107, question_id: 36, option_text: 'Abuelo', is_correct: false },
        { id: 108, question_id: 36, option_text: 'Hermano', is_correct: false },
      ],
    },
  ],
  10: [
    {
      id: 37,
      lesson_id: 10,
      prompt: '¿Cómo se dice el color "rojo" sagrado en quechua?',
      question_type: 'multiple_choice',
      options: [
        { id: 109, question_id: 37, option_text: 'Puka', is_correct: true },
        { id: 110, question_id: 37, option_text: 'Qomer (Verde)', is_correct: false },
        { id: 111, question_id: 37, option_text: 'Anqas (Azul)', is_correct: false },
      ],
    },
    {
      id: 38,
      lesson_id: 10,
      prompt: '"Qomer" corresponde al color de la naturaleza y vegetación:',
      question_type: 'multiple_choice',
      options: [
        { id: 112, question_id: 38, option_text: 'Verde', is_correct: true },
        { id: 113, question_id: 38, option_text: 'Azul', is_correct: false },
        { id: 114, question_id: 38, option_text: 'Amarillo', is_correct: false },
      ],
    },
  ],
};

function isTrivialQuestion(q: QuestionWithOptions): boolean {
  const p = q.prompt.toLowerCase();
  if (
    p.includes('cuál es la vocal "a"') ||
    p.includes('cual es la vocal a') ||
    p.includes('cómo se escribe la vocal "i"') ||
    p.includes('como se escribe la vocal i') ||
    p.includes('suena igual que la "u"')
  ) {
    return true;
  }
  // Detectar preguntas obvias donde todas las opciones son letras de 1 caracter ('a', 'e', 'i', 'o', 'u')
  if (q.options.length > 0 && q.options.every((o) => o.option_text.trim().length === 1)) {
    return true;
  }
  return false;
}

export const questionService = {
  async fetchQuestionsByLesson(
    lessonId: number
  ): Promise<{ data: QuestionWithOptions[] | null; error: string | null }> {
    // Si tenemos preguntas pedagógicas curadas para esta lección, utilizarlas para garantizar alta calidad didáctica
    if (DEFAULT_QUESTIONS[lessonId]) {
      return { data: DEFAULT_QUESTIONS[lessonId], error: null };
    }

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

    // Si la base de datos devuelve preguntas triviales de 1 letra, usar el banco pedagógico curado
    if (result.some(isTrivialQuestion)) {
      return { data: DEFAULT_QUESTIONS[lessonId] || DEFAULT_QUESTIONS[1], error: null };
    }

    return { data: result, error: null };
  },

  async recordLessonProgress(
    lessonId: number,
    userId: string,
    xpEarned: number = 10
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const storageKey = `@yachay_completed_lessons_${userId}`;
      const localData = await AsyncStorage.getItem(storageKey);
      const list: number[] = localData ? JSON.parse(localData) : [];
      if (!list.includes(lessonId)) {
        list.push(lessonId);
        await AsyncStorage.setItem(storageKey, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('AsyncStorage lesson progress error:', e);
    }

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

  async getCompletedLessonIds(userId: string): Promise<number[]> {
    const set = new Set<number>();
    try {
      const storageKey = `@yachay_completed_lessons_${userId}`;
      const localData = await AsyncStorage.getItem(storageKey);
      if (localData) {
        const list: number[] = JSON.parse(localData);
        list.forEach((id) => set.add(id));
      }
    } catch {}

    try {
      const { data } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('firebase_uid', userId)
        .eq('completed', true);
      if (data) {
        data.forEach((row) => set.add(row.lesson_id));
      }
    } catch {}

    return Array.from(set);
  },
};


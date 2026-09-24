import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/services/supabase';
import { QuestionOption, QuestionWithOptions } from '@/src/types';
import {
  lessonContentToQuestions,
  LESSON_CONTENT_PACKS,
} from '@/src/content/lessonContent';
import {
  queuePendingLessonProgress,
  getPendingLessonProgress,
  clearPendingLessonProgress,
} from '@/src/services/offlineCache';

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

const EXPANDED_LESSON_BANK: Record<number, { prompt: string; options: string[]; correct: string }[]> = {
  1: [
    { prompt: '¿Cuál es la palabra correcta para “bueno / bien” en quechua?', options: ['Allin', 'Ayllu', 'Kusa'], correct: 'Allin' },
    { prompt: '¿Qué vocal forma la base de la palabra “Inti”?', options: ['i', 'e', 'o'], correct: 'i' },
    { prompt: '¿Qué palabra significa “paloma” o “mensajera” en quechua?', options: ['Urpi', 'Wasi', 'Puka'], correct: 'Urpi' },
    { prompt: '¿Qué expresión usa la vocal “u” en su pronunciación?', options: ['Urqu', 'Maya', 'Sami'], correct: 'Urqu' },
    { prompt: '¿Qué opción representa correctamente la vocal abierta “a”?', options: ['A', 'E', 'O'], correct: 'A' },
    { prompt: '¿Qué palabra es la mejor muestra de la vocal “i” en quechua?', options: ['Inti', 'Qhapaq', 'Puna'], correct: 'Inti' },
    { prompt: '¿Cuál de estas palabras contiene la vocal “u” con sentido de “río” o “lugar alto”?', options: ['Urqu', 'Misk’i', 'Rumi'], correct: 'Urqu' },
    { prompt: '¿Qué palabra quechua expresa “sol sagrado” y usa la vocal “i”?', options: ['Inti', 'Qhapaq', 'Maya'], correct: 'Inti' },
  ],
  2: [
    { prompt: '¿Cómo se dice “oro” en quechua?', options: ['Quri', 'Kuri', 'Rumi'], correct: 'Quri' },
    { prompt: '¿Qué palabra significa “dulce / delicioso” en quechua?', options: ['Mishki', 'Qhawa', 'Pacha'], correct: 'Mishki' },
    { prompt: '¿Cómo se dice “casa” en quechua?', options: ['Wasi', 'Mayu', 'Punku'], correct: 'Wasi' },
    { prompt: '¿Qué sonido caracteriza la consonante “q”?', options: ['Garganta profunda', 'Labios', 'Dientes'], correct: 'Garganta profunda' },
    { prompt: '¿Qué sonido representa mejor la “ll” del quechua?', options: ['[ʎ] palatal', '[sh]', '[r] vibrante'], correct: '[ʎ] palatal' },
    { prompt: '¿Qué palabra contiene la secuencia “sh” y significa “delicioso”?', options: ['Mishki', 'Qhapaq', 'Ayllu'], correct: 'Mishki' },
    { prompt: '¿Cuál es una buena ilustración de la consonante posvelar “q”?', options: ['Quri', 'Puka', 'Maya'], correct: 'Quri' },
    { prompt: '¿Qué opción enfatiza la articulación del sonido “ll”?', options: ['Allin', 'Kuska', 'Ukhu'], correct: 'Allin' },
  ],
  3: [
    { prompt: '¿Cuál es la forma quechua de “uno”?', options: ['Huk', 'Iskay', 'Kimsa'], correct: 'Huk' },
    { prompt: '¿Qué número significa “dos”?', options: ['Iskay', 'Tawa', 'Pichqa'], correct: 'Iskay' },
    { prompt: '¿Cómo se dice “tres” en quechua?', options: ['Kimsa', 'Pusaq', 'Qanchis'], correct: 'Kimsa' },
    { prompt: '¿Qué número es “cuatro”?', options: ['Tawa', 'Isqon', 'Soqta'], correct: 'Tawa' },
    { prompt: '¿Cuál corresponde a “cinco”?', options: ['Pichqa', 'Chunka', 'Huk'], correct: 'Pichqa' },
    { prompt: '¿Qué palabra es “seis” en quechua?', options: ['Soqta', 'Qanchis', 'Pusaq'], correct: 'Soqta' },
    { prompt: '¿Cuál significa “siete”?', options: ['Qanchis', 'Isqon', 'Kimsa'], correct: 'Qanchis' },
    { prompt: '¿Qué número se escribe “ocho”?', options: ['Pusaq', 'Chunka', 'Tawa'], correct: 'Pusaq' },
    { prompt: '¿Cómo se dice “nueve” en quechua?', options: ['Isqon', 'Suqta', 'Huk'], correct: 'Isqon' },
    { prompt: '¿Qué palabra corresponde a “diez”?', options: ['Chunka', 'Pichqa', 'Iskay'], correct: 'Chunka' },
  ],
  4: [
    { prompt: '¿Qué número sigue después de “Pichqa” (5)?', options: ['Soqta', 'Qanchis', 'Pusaq'], correct: 'Soqta' },
    { prompt: '¿Cuál es “siete” en quechua?', options: ['Qanchis', 'Isqon', 'Kimsa'], correct: 'Qanchis' },
    { prompt: '¿Qué palabra significa “ocho”?', options: ['Pusaq', 'Soqta', 'Tawa'], correct: 'Pusaq' },
    { prompt: '¿Cómo se dice “nueve”?', options: ['Isqon', 'Huk', 'Chunka'], correct: 'Isqon' },
    { prompt: '¿Cuál es el número “diez”?', options: ['Chunka', 'Pichqa', 'Iskay'], correct: 'Chunka' },
    { prompt: '¿Qué número viene antes de “Tawa” (4)?', options: ['Kimsa', 'Pichqa', 'Huk'], correct: 'Kimsa' },
    { prompt: '¿Cuál es la secuencia correcta del 1 al 5 en Quechua?', options: ['Huk, Iskay, Kimsa, Tawa, Pichqa', 'Iskay, Huk, Tawa, Kimsa, Pichqa', 'Pichqa, Tawa, Kimsa, Iskay, Huk'], correct: 'Huk, Iskay, Kimsa, Tawa, Pichqa' },
    { prompt: '¿Qué valor corresponde a “Soqta”?', options: ['Seis', 'Siete', 'Nueve'], correct: 'Seis' },
    { prompt: '¿Cómo se dice “cinco” en quechua?', options: ['Pichqa', 'Qanchis', 'Pusaq'], correct: 'Pichqa' },
    { prompt: '¿Qué palabra del conteo es más cercana a “diez”?', options: ['Chunka', 'Isqon', 'Pusaq'], correct: 'Chunka' },
  ],
  5: [
    { prompt: '¿Cómo se dice “buenos días” en quechua?', options: ['Allin p’unchaw', 'Allin tuta', 'Añay'], correct: 'Allin p’unchaw' },
    { prompt: '¿Cuál es la forma para saludar “¿cómo estás?”', options: ['Allillanchu', 'Tupananchiskama', 'Puka'], correct: 'Allillanchu' },
    { prompt: '¿Qué expresión significa “gracias”?', options: ['Añay', 'Urqu', 'Qhapaq'], correct: 'Añay' },
    { prompt: '¿Cómo dices “buenas noches” en quechua?', options: ['Allin tuta', 'Allin p’unchaw', 'Wasi'], correct: 'Allin tuta' },
    { prompt: '¿Qué frase se usa para despedirse con “hasta volver a encontrarnos”?', options: ['Tupananchiskama', 'Allillanmi', 'Mishki'], correct: 'Tupananchiskama' },
    { prompt: '¿Cuándo se responde “Allillanmi”?', options: ['Cuando se responde con certeza a “Allillanchu”', 'Cuando se quiere decir “uno”', 'Cuando se habla del sol'], correct: 'Cuando se responde con certeza a “Allillanchu”' },
    { prompt: '¿Cuál de estas expresiones no es un saludo?', options: ['Tupananchiskama', 'Allin p’unchaw', 'Allillanchu'], correct: 'Tupananchiskama' },
    { prompt: '¿Qué frase tiene un sentido de agradecimiento profundo?', options: ['Añay / Sulpayki', 'Huk / Iskay', 'Maya / Pacha'], correct: 'Añay / Sulpayki' },
    { prompt: '¿Cómo se interpreta “allillanmi”?', options: ['Estoy bien', 'Buenas noches', 'Gracias'], correct: 'Estoy bien' },
    { prompt: '¿Qué saludo reconoce el momento del día?', options: ['Allin p’unchaw', 'Quri', 'Rumi'], correct: 'Allin p’unchaw' },
  ],
  6: [
    { prompt: '¿Cómo se dice “padre” en quechua?', options: ['Tayta', 'Mama', 'Wawa'], correct: 'Tayta' },
    { prompt: '¿Qué palabra significa “madre”?', options: ['Mama', 'Tura', 'Awicha'], correct: 'Mama' },
    { prompt: '¿Cómo se dice “hijo/hija” en el uso tradicional del padre?', options: ['Churi', 'Wawa', 'Pana'], correct: 'Churi' },
    { prompt: '¿Qué término utiliza una madre para un hijo o bebé?', options: ['Wawa', 'Churi', 'Awicha'], correct: 'Wawa' },
    { prompt: '¿Qué palabra se usa para la abuela?', options: ['Awicha', 'Tayta', 'Pana'], correct: 'Awicha' },
    { prompt: '¿Qué término se usa para “hermano de la mujer”?', options: ['Tura', 'Churi', 'Mama'], correct: 'Tura' },
    { prompt: '¿Cuál es el nombre correcto de la figura paterna en la familia andina?', options: ['Tayta', 'Ayllu', 'Maya'], correct: 'Tayta' },
    { prompt: '¿Qué palabra se usa para “hija de varón” o un matiz cercano al parentesco?', options: ['Pana', 'Tura', 'Urqu'], correct: 'Pana' },
    { prompt: '¿Qué término se refiere al hogar o familia ampliada?', options: ['Ayllu', 'Puka', 'Qhapaq'], correct: 'Ayllu' },
    { prompt: '¿Cuál es el término para la madre de la familia?', options: ['Mama', 'Tayta', 'Churi'], correct: 'Mama' },
  ],
  7: [
    { prompt: '¿Qué sufijo se usa para formar plural en quechua?', options: ['-kuna', '-mi', '-chu'], correct: '-kuna' },
    { prompt: '¿Cuál es la ordenación correcta del 1 al 3?', options: ['Huk, Iskay, Kimsa', 'Iskay, Huk, Kimsa', 'Kimsa, Tawa, Huk'], correct: 'Huk, Iskay, Kimsa' },
    { prompt: '¿Qué palabra indica “casa” y su plural correcto?', options: ['Wasi -> wasikuna', 'Wasi -> wasimi', 'Wasi -> wasichu'], correct: 'Wasi -> wasikuna' },
    { prompt: '¿Qué término señala una afirmación con certeza?', options: ['-mi', '-kuna', '-pa'], correct: '-mi' },
    { prompt: '¿Qué marcador interrogativo es típico en quechua?', options: ['-chu', '-kuna', '-y'], correct: '-chu' },
    { prompt: '¿Qué palabra significa “familia / ayllu”?', options: ['Ayllu', 'Pochi', 'Misk’i'], correct: 'Ayllu' },
    { prompt: '¿Cuál de estas opciones es un ejemplo correcto de plural?', options: ['Wawakuna', 'Wasimi', 'Hukchu'], correct: 'Wawakuna' },
    { prompt: '¿Qué forma verbal suele insinuar afirmación clara?', options: ['-mi', '-q', '-n'], correct: '-mi' },
  ],
  8: [
    { prompt: '¿Cómo se expresa “¿cómo estás?” con cortesía?', options: ['Allillanchu', 'Allin tuta', 'Wawa'], correct: 'Allillanchu' },
    { prompt: '¿Cuál es la respuesta habitual a “Allillanchu”?', options: ['Allillanmi', 'Tupananchiskama', 'Quri'], correct: 'Allillanmi' },
    { prompt: '¿Qué significa “Allillanmi”?', options: ['Estoy bien', 'Hasta luego', 'Gracias'], correct: 'Estoy bien' },
    { prompt: '¿Qué expresión se usa para despedirse con cariño?', options: ['Tupananchiskama', 'Allin p’unchaw', 'Qhapaq'], correct: 'Tupananchiskama' },
    { prompt: '¿Cuál es la forma de agradecer de forma respetuosa?', options: ['Sulpayki / Añay', 'Maya / Ayllu', 'Wasi / Quri'], correct: 'Sulpayki / Añay' },
    { prompt: '¿Qué frase es un saludo del día?', options: ['Allin p’unchaw', 'Chunka', 'Tura'], correct: 'Allin p’unchaw' },
    { prompt: '¿Qué expresión se usa para “buenas noches”?', options: ['Allin tuta', 'Allin p’unchaw', 'Allillanchu'], correct: 'Allin tuta' },
    { prompt: '¿Qué opción puede servir como respuesta de cortesía común?', options: ['Allillanmi', 'Puka', 'Huk'], correct: 'Allillanmi' },
  ],
  9: [
    { prompt: '¿Cómo se dice “padre” en el marco del parentesco andino?', options: ['Tayta', 'Mama', 'Pana'], correct: 'Tayta' },
    { prompt: '¿Qué término usa una madre para su hijo o bebé?', options: ['Wawa', 'Tura', 'Awicha'], correct: 'Wawa' },
    { prompt: '¿Qué palabra se usa para “abuela”?', options: ['Awicha', 'Pana', 'Tura'], correct: 'Awicha' },
    { prompt: '¿Cómo se dice “hermano de una mujer”?', options: ['Tura', 'Tayta', 'Mama'], correct: 'Tura' },
    { prompt: '¿Qué término de la familia se relaciona con “hijo o hija” expresado por el padre?', options: ['Churi', 'Wawa', 'Ayllu'], correct: 'Churi' },
    { prompt: '¿Qué palabra alude a la familia extendida?', options: ['Ayllu', 'Puka', 'Mishki'], correct: 'Ayllu' },
    { prompt: '¿Qué palabra se asocia con “madre”?', options: ['Mama', 'Tura', 'Quri'], correct: 'Mama' },
    { prompt: '¿Qué término unifica la red de parentesco andino?', options: ['Ayllu', 'Wasi', 'Punku'], correct: 'Ayllu' },
  ],
  10: [
    { prompt: '¿Cómo se dice “rojo” en quechua?', options: ['Puka', 'Qomer', 'Anqas'], correct: 'Puka' },
    { prompt: '¿Qué palabra corresponde al “verde” de la naturaleza?', options: ['Qomer', 'Puka', 'Yana'], correct: 'Qomer' },
    { prompt: '¿Cómo se dice “azul” o “indigo”?', options: ['Anqas', 'Puka', 'Quri'], correct: 'Anqas' },
    { prompt: '¿Qué color está asociado a la tierra y la vegetación?', options: ['Qomer', 'Puka', 'Mishki'], correct: 'Qomer' },
    { prompt: '¿Qué opción representa “rojo sacramental”?', options: ['Puka', 'Qomer', 'Allin'], correct: 'Puka' },
    { prompt: '¿Qué término puede indicar “negro” o “oscuro”?', options: ['Yana', 'Puka', 'Quri'], correct: 'Yana' },
    { prompt: '¿Qué color es opuesto a “Puka” en una escala básica?', options: ['Qomer', 'Ayllu', 'Tayta'], correct: 'Qomer' },
    { prompt: '¿Cuál de estas palabras es un color andino reconocido?', options: ['Anqas', 'Wawa', 'Maya'], correct: 'Anqas' },
  ],
};

function expandLessonQuestionSet(lessonId: number, questions: QuestionWithOptions[]): QuestionWithOptions[] {
  const desiredBank = EXPANDED_LESSON_BANK[lessonId];
  if (!desiredBank) return questions;
  if (questions.length >= desiredBank.length) return questions;

  let nextId = Math.max(0, ...questions.map((question) => question.id)) + 1;
  const additional: QuestionWithOptions[] = desiredBank.slice(questions.length).map((entry, index) => {
    const optionTextList = entry.options.map((optionText, optionIndex) => ({
      id: nextId + index * 100 + optionIndex + 1,
      question_id: nextId + index * 100,
      option_text: optionText,
      is_correct: optionText === entry.correct,
    }));

    const questionId = nextId + index * 100;
    return {
      id: questionId,
      lesson_id: lessonId,
      prompt: entry.prompt,
      question_type: 'multiple_choice',
      options: optionTextList,
    };
  });

  return [...questions, ...additional];
}

export const questionService = {
  async fetchQuestionsByLesson(
    lessonId: number
  ): Promise<{ data: QuestionWithOptions[] | null; error: string | null }> {
    const contentPack = LESSON_CONTENT_PACKS[lessonId];
    if (contentPack) {
      return { data: lessonContentToQuestions(contentPack), error: null };
    }

    const defaultPack = DEFAULT_QUESTIONS[lessonId] || DEFAULT_QUESTIONS[1];
    const enrichedDefaultPack = expandLessonQuestionSet(lessonId, defaultPack);

    // Si tenemos preguntas pedagógicas curadas para esta lección, utilizarlas para garantizar alta calidad didáctica
    if (DEFAULT_QUESTIONS[lessonId]) {
      return { data: enrichedDefaultPack, error: null };
    }

    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('id', { ascending: true });

    if (qError || !questions || questions.length === 0) {
      return { data: enrichedDefaultPack, error: null };
    }

    const questionIds = questions.map((q) => q.id);
    const { data: options, error: oError } = await supabase
      .from('question_options')
      .select('*')
      .in('question_id', questionIds);

    if (oError) {
      return { data: enrichedDefaultPack, error: null };
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
      return { data: enrichedDefaultPack, error: null };
    }

    const expandedResult = expandLessonQuestionSet(lessonId, result);
    return { data: expandedResult.length >= 8 ? expandedResult : enrichedDefaultPack, error: null };
  },

  async recordLessonProgress(
    lessonId: number,
    userId: string,
    xpEarned: number = 10
  ): Promise<{ success: boolean; error: string | null }> {
    const completedAt = new Date().toISOString();
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
      const { error } = await supabase.from('lesson_progress').upsert({
        firebase_uid: userId,
        lesson_id: lessonId,
        completed: true,
        xp_earned: xpEarned,
        completed_at: completedAt,
      });
      if (error) {
        await queuePendingLessonProgress(userId, { lessonId, xpEarned, completedAt });
      }
    } catch {
      await queuePendingLessonProgress(userId, { lessonId, xpEarned, completedAt });
    }

    return { success: true, error: null };
  },

  async syncPendingProgress(userId: string): Promise<void> {
    try {
      const pending = await getPendingLessonProgress(userId);
      if (pending.length === 0) return;

      for (const item of pending) {
        const { error } = await supabase.from('lesson_progress').upsert({
          firebase_uid: userId,
          lesson_id: item.lessonId,
          completed: true,
          xp_earned: item.xpEarned,
          completed_at: item.completedAt,
        });
        if (error) {
          // Si falla, detener y mantener la cola restante
          return;
        }
      }
      await clearPendingLessonProgress(userId);
    } catch (err) {
      console.warn('[questionService] Error al sincronizar progreso pendiente:', err);
    }
  },

  async getCompletedLessonIds(userId: string): Promise<number[]> {
    // Intentar sincronizar progreso pendiente primero
    this.syncPendingProgress(userId).catch(() => {});

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

import { QuestionWithOptions } from '@/src/types';

export interface LessonVocabularyEntry {
  quechua: string;
  spanish: string;
  phonetic?: string;
  usage?: string;
  note?: string;
}

export type LessonExerciseType =
  | 'multiple_choice'
  | 'listening'
  | 'fill_blank'
  | 'text_input'
  | 'word_bank'
  | 'matching_pairs'
  | 'speaking'
  | 'true_false'
  | 'image_match';

export interface LessonExerciseEntry {
  id: string;
  type?: LessonExerciseType;
  prompt: string;
  options?: string[];
  correct: string;
  acceptedAnswers?: string[];
  clue?: string;
  wordBank?: string[];
}

export interface LessonContentPack {
  lessonId: number;
  title: string;
  focus: string;
  vocabulary: LessonVocabularyEntry[];
  exercises: LessonExerciseEntry[];
}

export const LESSON_CONTENT_PACKS: Record<number, LessonContentPack> = {
  1: {
    lessonId: 1,
    title: 'Fonética y vocales',
    focus: 'Reconocer las vocales del quechua y entender su uso en palabras reales.',
    vocabulary: [
      { quechua: 'A', spanish: 'vocal abierta', phonetic: 'a', usage: 'Ayllu', note: 'Vocal central del sistema quechua.' },
      { quechua: 'I', spanish: 'vocal cerrada', phonetic: 'i', usage: 'Inti', note: 'Base de palabras como Inti.' },
      { quechua: 'U', spanish: 'vocal posterior', phonetic: 'u', usage: 'Urpi', note: 'Presente en palabras como Urpi.' },
      { quechua: 'Inti', spanish: 'sol', phonetic: 'in-ti', usage: "Inti t'inkay", note: 'Palabra emblemática con i.' },
      { quechua: 'Urpi', spanish: 'paloma', phonetic: 'ur-pi', usage: 'Urpi sapa', note: 'Palabra con u.' },
      { quechua: 'Allin', spanish: 'bueno / bien', phonetic: 'a-llin', usage: "Allin p'unchaw", note: 'Muy usado en saludos y cortesía.' },
    ],
    exercises: [
      { id: 'phon-01', type: 'multiple_choice', prompt: '¿Cuáles son las tres vocales principales del quechua oficial?', options: ['a, i, u', 'a, e, i', 'e, o, u', 'a, u, o'], correct: 'a, i, u' },
      { id: 'phon-02', type: 'multiple_choice', prompt: '¿Qué vocal se usa en “Inti”?', options: ['i', 'e', 'o', 'u'], correct: 'i' },
      { id: 'phon-03', type: 'fill_blank', prompt: 'Completa la vocal: “U__pi” = paloma', options: ['r', 'n', 'm', 'p'], correct: 'r', clue: 'La palabra empieza con “Ur”.' },
      { id: 'phon-04', type: 'text_input', prompt: 'Escribe la palabra en quechua para “sol”.', correct: 'Inti', acceptedAnswers: ['inti', 'Inti'] },
      { id: 'phon-05', type: 'multiple_choice', prompt: '¿Qué palabra corresponde a “bueno / bien”?', options: ['Allin', 'Wasi', 'Yaya', 'Puka'], correct: 'Allin' },
      { id: 'phon-06', type: 'multiple_choice', prompt: '¿Qué vocal domina la palabra “Urpi”?', options: ['u', 'a', 'e', 'o'], correct: 'u' },
      { id: 'phon-07', type: 'matching_pairs', prompt: 'Empareja cada vocal con su ejemplo.', correct: 'a • i • u', options: ['a', 'i', 'u'], wordBank: ['A', 'I', 'U'] },
      { id: 'phon-08', type: 'listening', prompt: 'Escucha y elige la palabra con la vocal “i”.', options: ['Inti', 'Urpi', 'Wasi', 'Quri'], correct: 'Inti', clue: 'Es el sol sagrado.' },
      { id: 'phon-09', type: 'multiple_choice', prompt: '¿Qué palabra puede representar “paloma”?', options: ['Urpi', 'Allin', 'Yaku', 'Mama'], correct: 'Urpi' },
      { id: 'phon-10', type: 'multiple_choice', prompt: '¿Qué opción está en el orden correcto de vocales?', options: ['a, i, u', 'u, a, i', 'i, u, a', 'a, u, e'], correct: 'a, i, u' },
      { id: 'phon-11', type: 'fill_blank', prompt: 'Completa: “All__n” = bueno / bien', options: ['i', 'u', 'a', 'e'], correct: 'i', clue: 'La palabra es “Allin”.' },
      { id: 'phon-12', type: 'multiple_choice', prompt: '¿Qué palabra contiene la vocal “u” y significa “paloma”?', options: ['Urpi', 'Quri', 'Mama', 'Puka'], correct: 'Urpi' },
    ],
  },
  2: {
    lessonId: 2,
    title: 'Consonantes quechua',
    focus: 'Reconocer sonidos clave del quechua como q, ll, sh y su uso en palabras reales.',
    vocabulary: [
      { quechua: 'Quri', spanish: 'oro', phonetic: 'ku-ri', usage: 'Quri qhapaq', note: 'La q se articula desde la garganta.' },
      { quechua: 'Mishki', spanish: 'dulce / delicioso', phonetic: 'mish-ki', usage: 'Mishki kanka', note: 'Incluye el sonido sh.' },
      { quechua: 'Wasi', spanish: 'casa', phonetic: 'wa-si', usage: 'Wasi pampa', note: 'Palabra muy útil.' },
      { quechua: 'Allin', spanish: 'bueno / bien', phonetic: 'a-llin', usage: 'Allin yachay', note: 'La ll se pronuncia palatal.' },
      { quechua: 'Mayu', spanish: 'río', phonetic: 'ma-yu', usage: 'Mayu qhichwa', note: 'Palabra de entorno natural.' },
      { quechua: 'Urqu', spanish: 'cerro', phonetic: 'ur-qu', usage: 'Urqu suni', note: 'Muestra el sonido q.' },
    ],
    exercises: [
      { id: 'cons-01', type: 'multiple_choice', prompt: '¿Qué sonido caracteriza la consonante “q”?', options: ['Garganta profunda', 'Labios', 'Dientes', 'Lengua al frente'], correct: 'Garganta profunda' },
      { id: 'cons-02', type: 'multiple_choice', prompt: '¿Cómo se dice “oro” en quechua?', options: ['Quri', 'Kuri', 'Rumi', 'Wasi'], correct: 'Quri' },
      { id: 'cons-03', type: 'fill_blank', prompt: 'Completa: “M__shki” = dulce', options: ['i', 'a', 'u', 'e'], correct: 'i', clue: 'La palabra tiene sh.' },
      { id: 'cons-04', type: 'text_input', prompt: 'Escribe la palabra quechua para “casa”.', correct: 'Wasi', acceptedAnswers: ['wasi', 'Wasi'] },
      { id: 'cons-05', type: 'multiple_choice', prompt: '¿Qué palabra hace referencia a “dulce / delicioso”?', options: ['Mishki', 'Quri', 'Mayu', 'Urqu'], correct: 'Mishki' },
      { id: 'cons-06', type: 'multiple_choice', prompt: '¿Qué sonido representa mejor la “ll”?', options: ['[ʎ] palatal', '[sh]', '[r] vibrante', '[k] gutural'], correct: '[ʎ] palatal' },
      { id: 'cons-07', type: 'matching_pairs', prompt: 'Empareja cada palabra con su significado.', correct: 'Quri • Mishki • Wasi', options: ['Quri', 'Mishki', 'Wasi'], wordBank: ['oro', 'dulce', 'casa'] },
      { id: 'cons-08', type: 'listening', prompt: 'Escucha la palabra y elige la que corresponde al audio.', options: ['Quri', 'Urqu', 'Allin', 'Mama'], correct: 'Quri', clue: 'Es oro.' },
      { id: 'cons-09', type: 'multiple_choice', prompt: '¿Qué palabra significa “río”?', options: ['Mayu', 'Wasi', 'Quri', 'Puka'], correct: 'Mayu' },
      { id: 'cons-10', type: 'multiple_choice', prompt: '¿Qué opción se asocia mejor a la “ll” de “Allin”?', options: ['Palatal / ʎ', 'Labial / p', 'Garganta / q', 'Vibrante / r'], correct: 'Palatal / ʎ' },
      { id: 'cons-11', type: 'fill_blank', prompt: 'Completa: “Ur__” = cerro', options: ['q', 'p', 't', 's'], correct: 'q', clue: 'La q es muy característica.' },
      { id: 'cons-12', type: 'multiple_choice', prompt: '¿Qué palabra contiene el sonido “sh”?', options: ['Mishki', 'Quri', 'Inti', 'Mama'], correct: 'Mishki' },
    ],
  },
  3: {
    lessonId: 3,
    title: 'Números del 1 al 10',
    focus: 'Reconocimiento, secuenciación y uso básico de los números en quechua.',
    vocabulary: [
      { quechua: 'Huk', spanish: 'uno', phonetic: 'uk', usage: 'Huk wasi', note: 'Unidad y origen.' },
      { quechua: 'Iskay', spanish: 'dos', phonetic: 'is-kay', usage: 'Iskay wawqi', note: 'Dualidad complementaria.' },
      { quechua: 'Kimsa', spanish: 'tres', phonetic: 'kim-sa', usage: "Kimsa p'unchaw", note: 'Tercera unidad.' },
      { quechua: 'Tawa', spanish: 'cuatro', phonetic: 'ta-wa', usage: 'Tawa runa', note: 'También asociado a Tawantinsuyu.' },
      { quechua: 'Pichqa', spanish: 'cinco', phonetic: 'pich-qa', usage: 'Pichqa watapi', note: 'Número central en conteo.' },
      { quechua: 'Soqta', spanish: 'seis', phonetic: 'soq-ta', usage: 'Soqta uywa', note: 'Se sigue a Pichqa.' },
      { quechua: 'Qanchis', spanish: 'siete', phonetic: 'qan-chis', usage: 'Qanchis punta', note: 'Número de la semana.' },
      { quechua: 'Pusaq', spanish: 'ocho', phonetic: 'pu-saq', usage: 'Pusaq wallpa', note: 'Número de la rueda.' },
      { quechua: 'Isqon', spanish: 'nueve', phonetic: 'is-qon', usage: "Isqon p'unchaw", note: 'Se usa en conteo y edades.' },
      { quechua: 'Chunka', spanish: 'diez', phonetic: 'chun-ka', usage: 'Chunka watayuq', note: 'Base de conteo decimal.' },
    ],
    exercises: [
      { id: 'num-01', type: 'multiple_choice', prompt: '¿Cuál es la palabra quechua para “uno”?', options: ['Huk', 'Iskay', 'Kimsa', 'Chunka'], correct: 'Huk' },
      { id: 'num-02', type: 'multiple_choice', prompt: '¿Qué número corresponde a “dos”?', options: ['Pichqa', 'Iskay', 'Soqta', 'Qanchis'], correct: 'Iskay' },
      { id: 'num-03', type: 'fill_blank', prompt: 'Completa la palabra que falta: “___” = dos', options: ['Iskay', 'Qanchis', 'Pusaq', 'Soqta'], correct: 'Iskay', clue: 'Es el número que sigue a Huk.' },
      { id: 'num-04', type: 'text_input', prompt: 'Escribe la palabra quechua para “cuatro”.', correct: 'Tawa', acceptedAnswers: ['tawa', 'Tawa'] },
      { id: 'num-05', type: 'multiple_choice', prompt: '¿Qué palabra significa “cinco”?', options: ['Pichqa', 'Isqon', 'Soqta', 'Pusaq'], correct: 'Pichqa' },
      { id: 'num-06', type: 'multiple_choice', prompt: '¿Qué número sigue después de “Pichqa”?', options: ['Soqta', 'Tawa', 'Iskay', 'Kimsa'], correct: 'Soqta' },
      { id: 'num-07', type: 'matching_pairs', prompt: 'Empareja cada número con su traducción.', correct: 'Huk • Iskay • Kimsa • Tawa', options: ['Huk', 'Iskay', 'Kimsa', 'Tawa'], wordBank: ['Huk', 'Iskay', 'Kimsa', 'Tawa'] },
      { id: 'num-08', type: 'multiple_choice', prompt: '¿Qué palabra corresponde a “ocho”?', options: ['Pusaq', 'Chunka', 'Kimsa', 'Qanchis'], correct: 'Pusaq' },
      { id: 'num-09', type: 'listening', prompt: 'Escucha la palabra y elige la que corresponda al audio.', options: ['Isqon', 'Soqta', 'Pichqa', 'Tawa'], correct: 'Isqon', clue: 'Se pronuncia “isqon”.' },
      { id: 'num-10', type: 'multiple_choice', prompt: '¿Cuál es la forma quechua para “diez”?', options: ['Chunka', 'Huk', 'Iskay', 'Pusaq'], correct: 'Chunka' },
      { id: 'num-11', type: 'multiple_choice', prompt: '¿Qué secuencia está en orden correcto del 1 al 5?', options: ['Huk, Iskay, Kimsa, Tawa, Pichqa', 'Iskay, Huk, Pichqa, Tawa, Kimsa', 'Tawa, Kimsa, Iskay, Huk, Pichqa'], correct: 'Huk, Iskay, Kimsa, Tawa, Pichqa' },
      { id: 'num-12', type: 'multiple_choice', prompt: '¿Qué palabra completa la frase: “___ wasi” si quieres decir “una casa”?', options: ['Huk', 'Chunka', 'Qanchis', 'Soqta'], correct: 'Huk' },
    ],
  },
  4: {
    lessonId: 4,
    title: 'Números avanzados',
    focus: 'Ampliar el conteo con números del 6 al 10 y reconocer secuencias.',
    vocabulary: [
      { quechua: 'Soqta', spanish: 'seis', phonetic: 'soq-ta', usage: 'Soqta uywa', note: 'Se sigue a Pichqa.' },
      { quechua: 'Qanchis', spanish: 'siete', phonetic: 'qan-chis', usage: "Qanchis p'unchaw", note: 'Número de la semana.' },
      { quechua: 'Pusaq', spanish: 'ocho', phonetic: 'pu-saq', usage: 'Pusaq wallpa', note: 'Número de objetos y ciclos.' },
      { quechua: 'Isqon', spanish: 'nueve', phonetic: 'is-qon', usage: 'Isqon watayuq', note: 'Cuenta más alta antes de diez.' },
      { quechua: 'Chunka', spanish: 'diez', phonetic: 'chun-ka', usage: 'Chunka runa', note: 'Base del conteo decimal.' },
      { quechua: 'Pichqa', spanish: 'cinco', phonetic: 'pich-qa', usage: "Pichqa p'unchaw", note: 'Punto de referencia antes de seis.' },
    ],
    exercises: [
      { id: 'advnum-01', type: 'multiple_choice', prompt: '¿Qué número corresponde a “seis”?', options: ['Soqta', 'Qanchis', 'Pusaq', 'Isqon'], correct: 'Soqta' },
      { id: 'advnum-02', type: 'multiple_choice', prompt: '¿Cómo se dice “siete” en quechua?', options: ['Qanchis', 'Pusaq', 'Chunka', 'Kimsa'], correct: 'Qanchis' },
      { id: 'advnum-03', type: 'fill_blank', prompt: 'Completa: “Pusa_” = ocho', options: ['q', 'k', 't', 'm'], correct: 'q', clue: 'La palabra termina con “q”.' },
      { id: 'advnum-04', type: 'text_input', prompt: 'Escribe la palabra quechua para “nueve”.', correct: 'Isqon', acceptedAnswers: ['isqon', 'Isqon'] },
      { id: 'advnum-05', type: 'multiple_choice', prompt: '¿Qué número viene después de “Pichqa”?', options: ['Soqta', 'Qanchis', 'Huk', 'Kimsa'], correct: 'Soqta' },
      { id: 'advnum-06', type: 'multiple_choice', prompt: '¿Cuál es el número “diez”?', options: ['Chunka', 'Soqta', 'Pusaq', 'Huk'], correct: 'Chunka' },
      { id: 'advnum-07', type: 'matching_pairs', prompt: 'Empareja cada número con su valor.', correct: 'Soqta • Qanchis • Pusaq • Isqon', options: ['Soqta', 'Qanchis', 'Pusaq', 'Isqon'], wordBank: ['seis', 'siete', 'ocho', 'nueve'] },
      { id: 'advnum-08', type: 'listening', prompt: 'Escucha el número y elige la respuesta correcta.', options: ['Qanchis', 'Soqta', 'Pusaq', 'Isqon'], correct: 'Qanchis', clue: 'Es siete.' },
      { id: 'advnum-09', type: 'multiple_choice', prompt: '¿Qué opción ordena bien del 5 al 10?', options: ['Pichqa, Soqta, Qanchis, Pusaq, Isqon, Chunka', 'Soqta, Pichqa, Qanchis, Pusaq, Isqon, Chunka', 'Pichqa, Qanchis, Soqta, Isqon, Pusaq, Chunka'], correct: 'Pichqa, Soqta, Qanchis, Pusaq, Isqon, Chunka' },
      { id: 'advnum-10', type: 'multiple_choice', prompt: '¿Qué palabra significa “ocho”?', options: ['Pusaq', 'Chunka', 'Kimsa', 'Qanchis'], correct: 'Pusaq' },
      { id: 'advnum-11', type: 'fill_blank', prompt: 'Completa: “Isq__n” = nueve', options: ['o', 'a', 'e', 'u'], correct: 'o', clue: 'Es un número casi de diez.' },
      { id: 'advnum-12', type: 'multiple_choice', prompt: '¿Qué número va antes que “Chunka”?', options: ['Isqon', 'Kimsa', 'Huk', 'Qanchis'], correct: 'Isqon' },
    ],
  },
  5: {
    lessonId: 5,
    title: 'Saludos y cortesía',
    focus: 'Expresiones básicas para saludar, agradecer y despedirse con respeto.',
    vocabulary: [
      { quechua: 'Allillanchu', spanish: '¿cómo estás?', phonetic: 'a-lli-yan-chu', usage: 'Allillanchu, sutiyki?', note: 'Saludo de cortesía.' },
      { quechua: 'Allillanmi', spanish: 'estoy bien', phonetic: 'a-lli-yan-mi', usage: 'Allillanmi, graciass', note: 'Respuesta afirmativa.' },
      { quechua: 'Allin p’unchaw', spanish: 'buenos días', phonetic: 'a-llin p’un-chaw', usage: 'Allin p’unchaw, tayta', note: 'Saludo matutino.' },
      { quechua: 'Allin tuta', spanish: 'buenas noches', phonetic: 'a-llin tu-ta', usage: 'Allin tuta', note: 'Despedida nocturna.' },
      { quechua: 'Añay', spanish: 'gracias', phonetic: 'a-ñay', usage: 'Añay, yachachiq', note: 'Agradecimiento profundo.' },
      { quechua: 'Tupananchiskama', spanish: 'hasta volver a encontrarnos', phonetic: 'tu-pa-nan-chi-ska-ma', usage: 'Tupananchiskama', note: 'Despedida cordial.' },
      { quechua: 'Sulpayki', spanish: 'gracias a ti / muchas gracias', phonetic: 'sul-pay-ki', usage: 'Sulpayki', note: 'Expresa aprecio.' },
      { quechua: 'Yupaychani', spanish: 'te agradezco / valoro', phonetic: 'yu-pay-cha-ni', usage: 'Yupaychani', note: 'Agradecimiento más expresivo.' },
    ],
    exercises: [
      { id: 'greet-01', type: 'multiple_choice', prompt: '¿Cómo se dice “¿cómo estás?” en quechua?', options: ['Allillanchu', 'Allin tuta', 'Tupananchiskama', 'Wasi'], correct: 'Allillanchu' },
      { id: 'greet-02', type: 'multiple_choice', prompt: '¿Qué expresión significa “estoy bien”?', options: ['Allillanmi', 'Puka', 'Urqu', 'Quri'], correct: 'Allillanmi' },
      { id: 'greet-03', type: 'fill_blank', prompt: 'Completa: “Allin ___” = buenos días', options: ['p’unchaw', 'tuta', 'wasi', 'quri'], correct: "p’unchaw", clue: 'Es la palabra para “día”.' },
      { id: 'greet-04', type: 'text_input', prompt: 'Escribe “gracias” en quechua.', correct: 'Añay', acceptedAnswers: ['añay', 'Añay'] },
      { id: 'greet-05', type: 'multiple_choice', prompt: '¿Cómo se despide con “hasta volver a encontrarnos”?', options: ['Tupananchiskama', 'Allillanmi', 'Huk', 'Yupaychani'], correct: 'Tupananchiskama' },
      { id: 'greet-06', type: 'multiple_choice', prompt: '¿Qué frase se usa para “buenas noches”?', options: ['Allin tuta', 'Allin p’unchaw', 'Allillanchu', 'Mishki'], correct: 'Allin tuta' },
      { id: 'greet-07', type: 'matching_pairs', prompt: 'Empareja cada saludo con su significado.', correct: 'Allillanchu • Allin p’unchaw • Allin tuta', options: ['Allillanchu', 'Allin p’unchaw', 'Allin tuta'], wordBank: ['¿cómo estás?', 'buenos días', 'buenas noches'] },
      { id: 'greet-08', type: 'multiple_choice', prompt: '¿Qué expresión expresa agradecimiento más profundo?', options: ['Añay', 'Huk', 'Quri', 'Urqu'], correct: 'Añay' },
      { id: 'greet-09', type: 'listening', prompt: 'Escucha la expresión y elige la traducción correcta.', options: ['Buenos días', 'Buenas noches', 'Gracias', 'Hasta luego'], correct: 'Buenos días', clue: 'Se escucha en la mañana.' },
      { id: 'greet-10', type: 'multiple_choice', prompt: '¿Qué expresión puede usarse como “muchas gracias”?', options: ['Sulpayki', 'Iskay', 'Qanchis', 'Puka'], correct: 'Sulpayki' },
      { id: 'greet-11', type: 'multiple_choice', prompt: '¿Cuál de estas expresiones es una despedida cordial?', options: ['Tupananchiskama', 'Allillanchu', 'Mishki', 'Kimsa'], correct: 'Tupananchiskama' },
      { id: 'greet-12', type: 'multiple_choice', prompt: '¿Qué opción equivale mejor a “te agradezco”?', options: ['Yupaychani', 'Soqta', 'Pichqa', 'Awicha'], correct: 'Yupaychani' },
    ],
  },
  6: {
    lessonId: 6,
    title: 'Familia y comunidad',
    focus: 'Aprender vocabulario de parentesco y relaciones dentro del ayllu y la comunidad.',
    vocabulary: [
      { quechua: 'Tayta', spanish: 'padre', phonetic: 'tay-ta', usage: 'Tayta y mama', note: 'Figura paterna de respeto.' },
      { quechua: 'Mama', spanish: 'madre', phonetic: 'ma-ma', usage: 'Mama wasi', note: 'Eje central del hogar.' },
      { quechua: 'Wawa', spanish: 'hijo / bebé', phonetic: 'wa-wa', usage: 'Wawa sonqo', note: 'Término familiar para niño o bebé.' },
      { quechua: 'Churi', spanish: 'hijo / hija', phonetic: 'chu-ri', usage: 'Churi y wawa', note: 'Uso del padre hacia su descendencia.' },
      { quechua: 'Pana', spanish: 'hermana / sobrina', phonetic: 'pa-na', usage: 'Pana y tayta', note: 'Relación de reciprocidad familiar.' },
      { quechua: 'Awicha', spanish: 'abuela', phonetic: 'a-wi-cha', usage: 'Awicha warmi', note: 'Figura de respeto mayor.' },
      { quechua: 'Tura', spanish: 'hermano de la mujer', phonetic: 'tu-ra', usage: 'Tura y pana', note: 'Relación del parentesco andino.' },
      { quechua: 'Ayllu', spanish: 'familia extendida / comunidad', phonetic: 'ay-yu', usage: 'Ayllu runa', note: 'Base social del tejido andino.' },
    ],
    exercises: [
      { id: 'family-01', type: 'multiple_choice', prompt: '¿Cómo se dice “padre” en quechua?', options: ['Tayta', 'Mama', 'Awicha', 'Wawa'], correct: 'Tayta' },
      { id: 'family-02', type: 'multiple_choice', prompt: '¿Qué palabra significa “madre”?', options: ['Mama', 'Tura', 'Pana', 'Urqu'], correct: 'Mama' },
      { id: 'family-03', type: 'fill_blank', prompt: 'Completa: “Wa__” = bebé / hijo', options: ['w', 'a', 'q', 'p'], correct: 'w', clue: 'La palabra empieza con “Wa”.' },
      { id: 'family-04', type: 'text_input', prompt: 'Escribe la palabra quechua para “abuela”.', correct: 'Awicha', acceptedAnswers: ['awicha', 'Awicha'] },
      { id: 'family-05', type: 'multiple_choice', prompt: '¿Qué término usa el padre para referirse a su hijo o hija?', options: ['Churi', 'Awicha', 'Tura', 'Puka'], correct: 'Churi' },
      { id: 'family-06', type: 'multiple_choice', prompt: '¿Qué palabra se relaciona con la familia ampliada o comunidad?', options: ['Ayllu', 'Quri', 'Mayu', 'Mishki'], correct: 'Ayllu' },
      { id: 'family-07', type: 'matching_pairs', prompt: 'Empareja cada familiar con su significado.', correct: 'Tayta • Mama • Wawa', options: ['Tayta', 'Mama', 'Wawa'], wordBank: ['padre', 'madre', 'bebé / hijo'] },
      { id: 'family-08', type: 'multiple_choice', prompt: '¿Cómo se dice “hermana / sobrina” en algunas relaciones andinas?', options: ['Pana', 'Tura', 'Qhapaq', 'Allin'], correct: 'Pana' },
      { id: 'family-09', type: 'listening', prompt: 'Escucha la palabra y elige el parentesco correcto.', options: ['Tayta', 'Mama', 'Awicha', 'Wawa'], correct: 'Mama', clue: 'Es la madre.' },
      { id: 'family-10', type: 'multiple_choice', prompt: '¿Qué palabra se usa para “hermano de la mujer”?', options: ['Tura', 'Churi', 'Wawa', 'Tayta'], correct: 'Tura' },
      { id: 'family-11', type: 'multiple_choice', prompt: '¿Qué opción representa mejor a la familia extendida?', options: ['Ayllu', 'Quri', 'Mishki', 'Urqu'], correct: 'Ayllu' },
      { id: 'family-12', type: 'multiple_choice', prompt: '¿Cuál de estas palabras significa “abuela”?', options: ['Awicha', 'Pana', 'Tura', 'Churi'], correct: 'Awicha' },
    ],
  },
  7: {
    lessonId: 7,
    title: 'Gramática básica',
    focus: 'Entender sufijos y formas básicas que aparecen en frases cotidianas.',
    vocabulary: [
      { quechua: '-kuna', spanish: 'plural', phonetic: '-ku-na', usage: 'Wasi-kuna', note: 'Marca grupos o plural.' },
      { quechua: '-mi', spanish: 'certeza / enfásis', phonetic: '-mi', usage: 'Allinmi', note: 'Se usa para afirmar algo.' },
      { quechua: '-chu', spanish: 'interrogación', phonetic: '-chu', usage: 'Allillanchu?', note: 'Forma pregunta.' },
      { quechua: 'Ayllu', spanish: 'familia / comunidad', phonetic: 'ay-yu', usage: 'Ayllu runa', note: 'Núcleo social andino.' },
      { quechua: 'Wawakuna', spanish: 'niños', phonetic: 'wa-wa-ku-na', usage: 'Wawakuna yachachkaq', note: 'Plural de wawa.' },
      { quechua: 'Wasikuna', spanish: 'casas', phonetic: 'wa-si-ku-na', usage: 'Wasikuna', note: 'Plural útil y cotidiano.' },
    ],
    exercises: [
      { id: 'grammar-01', type: 'multiple_choice', prompt: '¿Qué sufijo indica plural en quechua?', options: ['-kuna', '-mi', '-chu', '-pa'], correct: '-kuna' },
      { id: 'grammar-02', type: 'multiple_choice', prompt: '¿Qué marcador se usa para preguntar?', options: ['-chu', '-kuna', '-mi', '-ya'], correct: '-chu' },
      { id: 'grammar-03', type: 'fill_blank', prompt: 'Completa: “Wasi__” = casas', options: ['kuna', 'mi', 'chu', 'pa'], correct: 'kuna', clue: 'Es el plural.' },
      { id: 'grammar-04', type: 'text_input', prompt: 'Escribe la forma plural de “wawa” (bebé / niño).', correct: 'Wawakuna', acceptedAnswers: ['wawakuna', 'Wawakuna'] },
      { id: 'grammar-05', type: 'multiple_choice', prompt: '¿Qué sufijo reforza una afirmación?', options: ['-mi', '-kuna', '-chu', '-qa'], correct: '-mi' },
      { id: 'grammar-06', type: 'multiple_choice', prompt: '¿Qué palabra significa “familia extendida / comunidad”?', options: ['Ayllu', 'Wasi', 'Quri', 'Tayta'], correct: 'Ayllu' },
      { id: 'grammar-07', type: 'matching_pairs', prompt: 'Empareja cada sufijo con su función.', correct: '-kuna • -mi • -chu', options: ['-kuna', '-mi', '-chu'], wordBank: ['plural', 'certeza', 'pregunta'] },
      { id: 'grammar-08', type: 'multiple_choice', prompt: '¿Cuál de estas opciones es un ejemplo correcto de plural?', options: ['Wasikuna', 'Wasi-mi', 'Wasi-chu', 'Wasi-pa'], correct: 'Wasikuna' },
      { id: 'grammar-09', type: 'listening', prompt: 'Escucha la palabra y selecciona la forma plural.', options: ['Wawa', 'Wawakuna', 'Wasi', 'Allin'], correct: 'Wawakuna', clue: 'Es más de un niño.' },
      { id: 'grammar-10', type: 'multiple_choice', prompt: '¿Qué frase se forma con interrogación correcta?', options: ['Allillanchu?', 'Wasi-mi', 'Ayllu-kuna', 'Tayta-qa'], correct: 'Allillanchu?' },
      { id: 'grammar-11', type: 'multiple_choice', prompt: '¿Cuál es la mejor traducción de “Allinmi”?', options: ['Estoy bien', 'Gracias', 'Buenas noches', 'Hijo'], correct: 'Estoy bien' },
      { id: 'grammar-12', type: 'multiple_choice', prompt: '¿Qué palabra se suma con “-kuna” para decir “casas”?', options: ['Wasi', 'Ayllu', 'Tayta', 'Puka'], correct: 'Wasi' },
    ],
  },
};

export function lessonContentToQuestions(pack: LessonContentPack): QuestionWithOptions[] {
  return pack.exercises.map((entry, index) => {
    const questionType: QuestionWithOptions['question_type'] =
      entry.type && entry.type !== 'multiple_choice' ? entry.type : 'multiple_choice';

    return {
      id: index + 1,
      lesson_id: pack.lessonId,
      prompt: entry.prompt,
      question_type: questionType,
      options: (entry.options ?? []).map((optionText, optionIndex) => ({
        id: optionIndex + 1,
        question_id: index + 1,
        option_text: optionText,
        is_correct: optionText === entry.correct,
      })),
    };
  });
}

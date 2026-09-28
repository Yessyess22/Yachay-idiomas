import { QuestionWithOptions } from '@/src/types';

export interface LessonVocabularyEntry {
  quechua: string;
  spanish: string;
  phonetic?: string;
  usage?: string;
  note?: string;
  illustration?: string;
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

export function lessonContentToQuestions(pack: LessonContentPack): QuestionWithOptions[] {
  return pack.exercises.map((ex, index) => ({
    id: index + 1,
    lesson_id: pack.lessonId,
    prompt: ex.prompt,
    question_type: (ex.type as any) || 'multiple_choice',
    options: (ex.options || [ex.correct]).map((optText, optIdx) => ({
      id: index * 10 + optIdx + 1,
      question_id: index + 1,
      option_text: optText,
      is_correct: optText === ex.correct,
    })),
  }));
}

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
  // ── NIVEL 1 · LECCIÓN 0: ABECEDARIO QUECHUA ──────────────────────────
  7: {
    lessonId: 7,
    title: 'Abecedario Quechua Ilustrado',
    focus: 'Aprende las 25 letras del alfabeto oficial del Runa Simi con dibujos y palabras andinas.',
    vocabulary: [
      {
        quechua: '📖 El Alfabeto Oficial (Achahala)',
        spanish: '25 letras en total (3 vocales + 22 consonantes)',
        phonetic: 'Qichwa Achahala simi',
        usage: '3 vocales (A, I, U) · 22 consonantes',
        note: 'El alfabeto oficial del Quechua Estándar tiene exactamente 25 letras: 3 vocales (A, I, U) y 22 consonantes. En el quechua oficial no existen las vocales "e" ni "o" (sistema trivocálico). Incluye sonidos andinos propios sin equivalente en español como QH, Q\', PH y K\'.',
        illustration: '📖',
      },
      {
        quechua: 'A (Allqu)',
        spanish: 'Letra A — Allqu (Perro)',
        phonetic: 'all-qu',
        usage: 'Allqu = Perro leal y protector',
        note: '1/25 · Primera vocal del quechua. Vocal abierta.',
        illustration: '🐕',
      },
      {
        quechua: 'CH (Chaki)',
        spanish: 'Letra CH — Chaki (Pie)',
        phonetic: 'cha-ki',
        usage: 'Chaki = Pie / Pata',
        note: '2/25 · Consonante africada palatal sorda, similar al español.',
        illustration: '🦶',
      },
      {
        quechua: "CH' (Ch'aska)",
        spanish: "Letra CH' — Ch'aska (Estrella)",
        phonetic: "ch'as-ka",
        usage: "Ch'aska = Lucero del amanecer / Estrella",
        note: '3/25 · Consonante africada glotalizada (con un corte seco de aire).',
        illustration: '⭐',
      },
      {
        quechua: 'H (Hatun)',
        spanish: 'Letra H — Hatun (Grande)',
        phonetic: 'ha-tun',
        usage: 'Hatun = Grande / Inmenso',
        note: '4/25 · Consonante fricativa aspirada. En quechua SÍ se pronuncia (no es muda).',
        illustration: '🏔️',
      },
      {
        quechua: 'I (Inti)',
        spanish: 'Letra I — Inti (Sol)',
        phonetic: 'in-ti',
        usage: 'Inti = Sol',
        note: '5/25 · Segunda vocal del quechua. Vocal cerrada anterior.',
        illustration: '☀️',
      },
      {
        quechua: 'K (Killa)',
        spanish: 'Letra K — Killa (Luna)',
        phonetic: 'ki-lla',
        usage: 'Killa = Luna y mes',
        note: '6/25 · Consonante oclusiva velar simple.',
        illustration: '🌙',
      },
      {
        quechua: 'KH (Khuchi)',
        spanish: 'Letra KH — Khuchi (Cerdo)',
        phonetic: 'khu-chi',
        usage: 'Khuchi = Cerdo / Chancho',
        note: '7/25 · Consonante velar aspirada (se pronuncia con un soplo fuerte de aire).',
        illustration: '🐷',
      },
      {
        quechua: "K' (K'uychi)",
        spanish: "Letra K' — K'uychi (Arcoíris)",
        phonetic: "k'uy-chi",
        usage: "K'uychi = Arcoíris sagrado",
        note: '8/25 · Consonante velar glotalizada con explosión suave en la garganta.',
        illustration: '🌈',
      },
      {
        quechua: 'L (Lawa)',
        spanish: 'Letra L — Lawa (Sopa andina)',
        phonetic: 'la-wa',
        usage: 'Lawa = Crema / Sopa de maíz',
        note: '9/25 · Consonante alveolar lateral sonora, igual que en español.',
        illustration: '🥣',
      },
      {
        quechua: 'LL (Llama)',
        spanish: 'Letra LL — Llama (Camélido)',
        phonetic: 'lla-ma',
        usage: 'Llama = Animal sagrado de los Andes',
        note: '10/25 · Consonante palatal lateral sonora.',
        illustration: '🦙',
      },
      {
        quechua: 'M (Misi)',
        spanish: 'Letra M — Misi (Gato)',
        phonetic: 'mi-si',
        usage: 'Misi = Gato doméstico',
        note: '11/25 · Consonante bilabial nasal sonora.',
        illustration: '🐈',
      },
      {
        quechua: 'N (Nina)',
        spanish: 'Letra N — Nina (Fuego)',
        phonetic: 'ni-na',
        usage: 'Nina = Fuego / Llama viva',
        note: '12/25 · Consonante alveolar nasal sonora.',
        illustration: '🔥',
      },
      {
        quechua: 'Ñ (Ñan)',
        spanish: 'Letra Ñ — Ñan (Camino)',
        phonetic: 'ñan',
        usage: 'Ñan = Camino / Sendero andino',
        note: '13/25 · Consonante palatal nasal sonora.',
        illustration: '🛤️',
      },
      {
        quechua: 'P (Puma)',
        spanish: 'Letra P — Puma (Puma)',
        phonetic: 'pu-ma',
        usage: 'Puma = Felino guardián andino',
        note: '14/25 · Consonante bilabial oclusiva simple.',
        illustration: '🐆',
      },
      {
        quechua: 'PH (Phuyu)',
        spanish: 'Letra PH — Phuyu (Nube)',
        phonetic: 'phu-yu',
        usage: 'Phuyu = Nube / Niebla',
        note: '15/25 · Consonante bilabial aspirada con golpe de aire.',
        illustration: '☁️',
      },
      {
        quechua: "P' (P'acha)",
        spanish: "Letra P' — P'acha (Ropa)",
        phonetic: "p'a-cha",
        usage: "P'acha = Vestimenta / Ropa",
        note: '16/25 · Consonante bilabial glotalizada.',
        illustration: '👘',
      },
      {
        quechua: 'Q (Quri)',
        spanish: 'Letra Q — Quri (Oro)',
        phonetic: 'qu-ri (desde la garganta)',
        usage: 'Quri = Metal precioso sagrado',
        note: '17/25 · Consonante posvelar o uvular profunda articulada en la úvula.',
        illustration: '🥇',
      },
      {
        quechua: 'QH (Qhawa)',
        spanish: 'Letra QH — Qhawa (Mirar / Observar)',
        phonetic: 'qha-wa',
        usage: 'Qhaway = Observar atentamente',
        note: '18/25 · Consonante uvular aspirada exclusiva del quechua.',
        illustration: '👁️',
      },
      {
        quechua: "Q' (Q'omer)",
        spanish: "Letra Q' — Q'omer (Verde)",
        phonetic: "q'o-mer",
        usage: "Q'omer = Color verde de las plantas",
        note: '19/25 · Consonante uvular glotalizada.',
        illustration: '🌿',
      },
      {
        quechua: 'R (Rumi)',
        spanish: 'Letra R — Rumi (Piedra)',
        phonetic: 'ru-mi',
        usage: 'Rumi = Piedra / Roca',
        note: '20/25 · Consonante alveolar vibrante simple.',
        illustration: '🪨',
      },
      {
        quechua: "S (Sach'a)",
        spanish: "Letra S — Sach'a (Árbol)",
        phonetic: "sa-ch'a",
        usage: "Sach'a = Árbol / Bosque",
        note: '21/25 · Consonante alveolar fricativa sorda.',
        illustration: '🌳',
      },
      {
        quechua: "T (T'ika)",
        spanish: "Letra T — T'ika (Flor)",
        phonetic: "t'i-ka",
        usage: "T'ika = Flor colorida",
        note: '22/25 · Consonante dental oclusiva sorda.',
        illustration: '🌸',
      },
      {
        quechua: 'U (Urpi)',
        spanish: 'Letra U — Urpi (Paloma)',
        phonetic: 'ur-pi',
        usage: 'Urpi = Paloma hermosa andina',
        note: '23/25 · Tercera vocal del quechua. Vocal cerrada posterior.',
        illustration: '🕊️',
      },
      {
        quechua: 'W (Wasi)',
        spanish: 'Letra W — Wasi (Casa)',
        phonetic: 'wa-si',
        usage: 'Wasi = Casa y hogar',
        note: '24/25 · Semiconsonante bilabial sonora (suena como "hu" en huevo).',
        illustration: '🏠',
      },
      {
        quechua: 'Y (Yaku)',
        spanish: 'Letra Y — Yaku (Agua)',
        phonetic: 'ya-ku',
        usage: 'Yaku = Agua de vida',
        note: '25/25 · Semiconsonante palatal sonora.',
        illustration: '💧',
      },
    ],
    exercises: [
      {
        id: 'abc-01',
        type: 'multiple_choice',
        prompt: '¿Qué animal representa la palabra quechua "Urpi"?',
        options: ['Paloma', 'Perro', 'Llama', 'Puma'],
        correct: 'Paloma',
        clue: 'Urpi significa paloma en quechua.',
      },
      {
        id: 'abc-02',
        type: 'multiple_choice',
        prompt: '¿Cuáles son las 3 únicas vocales del Quechua oficial?',
        options: ['A, I, U (Trivocálico)', 'A, E, I, O, U', 'A, E, U', 'I, U, O'],
        correct: 'A, I, U (Trivocálico)',
        clue: 'El quechua es trivocálico: Allqu (A), Inti (I), Urpi (U).',
      },
      {
        id: 'abc-03',
        type: 'multiple_choice',
        prompt: '¿Qué palabra quechua representa al perro?',
        options: ['Allqu', 'Urpi', 'Inti', 'Wasi'],
        correct: 'Allqu',
        clue: 'Allqu significa perro en Runasimi.',
      },
      {
        id: 'abc-04',
        type: 'multiple_choice',
        prompt: '¿Qué significa la palabra "Inti" en español?',
        options: ['Sol', 'Luna', 'Estrella', 'Fuego'],
        correct: 'Sol',
        clue: 'Inti es el Sol en quechua.',
      },
      {
        id: 'abc-05',
        type: 'multiple_choice',
        prompt: '¿Cuántas letras tiene en total el alfabeto oficial del Quechua Estándar?',
        options: ['25 letras (3 vocales + 22 consonantes)', '27 letras', '21 letras', '30 letras'],
        correct: '25 letras (3 vocales + 22 consonantes)',
        clue: 'Aprobado por las normas académicas oficiales.',
      },
    ],
  },
  // ── NIVEL 1 · LECCIÓN 1: VOCALES DEL RUNASIMI ────────────────────────
  1: {
    lessonId: 1,
    title: 'Vocales del Runasimi',
    focus: 'Aprende las 3 vocales básicas (A, I, U) y su pronunciación en el Quechua originario.',
    vocabulary: [
      {
        quechua: 'Urpi',
        spanish: 'Paloma',
        phonetic: 'ur-pi',
        usage: 'Urpi munay (Paloma hermosa)',
        note: 'Urpi = Paloma. Símbolo de paz y mensajera espiritual andina que empieza con la vocal U.',
        illustration: '🕊️',
      },
      {
        quechua: 'Inti',
        spanish: 'Sol',
        phonetic: 'in-ti',
        usage: 'Inti tayta (Padre Sol)',
        note: 'Inti = Sol. Empieza con la vocal I.',
        illustration: '☀️',
      },
      {
        quechua: 'Allqu',
        spanish: 'Perro',
        phonetic: 'all-qu',
        usage: 'Allqu kawsan (El perro vive feliz)',
        note: 'Allqu = Perro leal y protector del hogar andino que empieza con la vocal A.',
        illustration: '🐕',
      },
      {
        quechua: 'Allin',
        spanish: 'Bueno / Bien',
        phonetic: 'a-llin',
        usage: "Allin p'unchaw (Buenos días)",
        note: 'Palabra fundamental del saludo andino que empieza con la vocal A.',
        illustration: '✨',
      },
    ],
    exercises: [
      {
        id: 'vow-01',
        type: 'multiple_choice',
        prompt: '¿Cuáles son las 3 vocales del sistema originario del Runasimi?',
        options: ['A, I, U (Trivocálico)', 'A, E, O', 'E, I, U', 'A, E, I'],
        correct: 'A, I, U (Trivocálico)',
        clue: 'El quechua originario solo tiene tres vocales: A (Allqu), I (Inti), U (Urpi).',
      },
      {
        id: 'vow-02',
        type: 'multiple_choice',
        prompt: '¿Qué significa la palabra quechua "Urpi"?',
        options: ['Paloma', 'Sol', 'Perro', 'Casa'],
        correct: 'Paloma',
        clue: 'Urpi representa a la paloma andina.',
      },
      {
        id: 'vow-03',
        type: 'multiple_choice',
        prompt: '¿Qué palabra quechua significa "Sol"?',
        options: ['Inti', 'Urpi', 'Allqu', 'Wasi'],
        correct: 'Inti',
        clue: 'Es el Sol en quechua.',
      },
      {
        id: 'vow-04',
        type: 'multiple_choice',
        prompt: '¿Qué animal representa la palabra quechua "Allqu"?',
        options: ['Perro', 'Gato', 'Llama', 'Puma'],
        correct: 'Perro',
        clue: 'Allqu es el amigo fiel de cuatro patas.',
      },
      {
        id: 'vow-05',
        type: 'matching_pairs',
        prompt: 'Empareja las palabras con su significado:',
        correct: 'Urpi • Inti • Allqu',
        options: ['Urpi', 'Inti', 'Allqu'],
        wordBank: ['Paloma', 'Sol', 'Perro'],
      },
      {
        id: 'vow-06',
        type: 'text_input',
        prompt: 'Escribe la palabra quechua para "Paloma":',
        correct: 'Urpi',
        acceptedAnswers: ['urpi', 'Urpi'],
      },
    ],
  },

  // ── NIVEL 1 · LECCIÓN 2: CONSONANTES DEL RUNASIMI ───────────────────
  2: {
    lessonId: 2,
    title: 'Consonantes y Fonética',
    focus: 'Reconoce y pronuncia sonidos clave como Q, K, LL, CH y SH en palabras reales.',
    vocabulary: [
      {
        quechua: 'Quri',
        spanish: 'Oro',
        phonetic: 'qu-ri',
        usage: 'Quri wasi (Casa de oro)',
        note: 'La "Q" es posvelar: se pronuncia desde el fondo de la garganta.',
      },
      {
        quechua: 'Kanka',
        spanish: 'Asado / Carne',
        phonetic: 'kan-ka',
        usage: 'Kanka aycha (Carne asada)',
        note: 'La "K" es oclusiva velar, similar a la "k" o "c" en español.',
      },
      {
        quechua: 'Allin',
        spanish: 'Bueno / Bien',
        phonetic: 'a-llin',
        usage: 'Allin yachay (Buen saber)',
        note: 'La "LL" es palatal: la lengua se apoya en el paladar.',
      },
      {
        quechua: 'Mishki',
        spanish: 'Dulce / Delicioso',
        phonetic: 'mish-ki',
        usage: 'Mishki ruru (Fruta dulce)',
        note: 'Contiene el sonido suave "SH".',
      },
      {
        quechua: 'Wasi',
        spanish: 'Casa / Hogar',
        phonetic: 'wa-si',
        usage: 'Hatun wasi (Casa grande)',
        note: 'Palabra quechua muy común con "W".',
      },
      {
        quechua: 'Urqu',
        spanish: 'Cerro / Montaña',
        phonetic: 'ur-qu',
        usage: 'Urqu suni (Cerro alto)',
        note: 'Termina con el sonido posvelar "Q".',
      },
    ],
    exercises: [
      {
        id: 'cons-01',
        type: 'multiple_choice',
        prompt: '¿Cómo se articula la consonante "Q" en Quechua?',
        options: ['Desde el fondo de la garganta (posvelar)', 'Con la punta de los labios', 'Con los dientes', 'Igual a la S'],
        correct: 'Desde el fondo de la garganta (posvelar)',
        clue: 'Es un sonido uvular profundo característico del Runasimi.',
      },
      {
        id: 'cons-02',
        type: 'multiple_choice',
        prompt: '¿Cómo se dice "Oro" en quechua?',
        options: ['Quri', 'Wasi', 'Mishki', 'Urqu'],
        correct: 'Quri',
      },
      {
        id: 'cons-03',
        type: 'listening',
        prompt: 'Escucha el audio y selecciona la palabra que significa "Casa".',
        options: ['Wasi', 'Quri', 'Mishki', 'Kanka'],
        correct: 'Wasi',
      },
      {
        id: 'cons-04',
        type: 'multiple_choice',
        prompt: '¿Qué palabra significa "Dulce o Delicioso"?',
        options: ['Mishki', 'Urqu', 'Kanka', 'Allin'],
        correct: 'Mishki',
      },
      {
        id: 'cons-05',
        type: 'fill_blank',
        prompt: 'Completa la consonante de "Oro": "__uri"',
        options: ['Q', 'M', 'W', 'S'],
        correct: 'Q',
        clue: 'Empieza con la consonante posvelar Q.',
      },
      {
        id: 'cons-06',
        type: 'matching_pairs',
        prompt: 'Empareja cada palabra con su traducción:',
        correct: 'Quri • Wasi • Mishki',
        options: ['Quri', 'Wasi', 'Mishki'],
        wordBank: ['Oro', 'Casa', 'Dulce / Delicioso'],
      },
    ],
  },

  // ── NIVEL 2 · LECCIÓN 1: NÚMEROS DEL 1 AL 5 ─────────────────────────
  3: {
    lessonId: 3,
    title: 'Números del 1 al 5',
    focus: 'Aprende a contar, pronunciar y escribir del 1 al 5 en Quechua.',
    vocabulary: [
      { quechua: 'Huk', spanish: 'Uno (1)', phonetic: 'huk', usage: 'Huk wasi (Una casa)', note: 'Representa la unidad.' },
      { quechua: 'Iskay', spanish: 'Dos (2)', phonetic: 'is-kay', usage: 'Iskay runa (Dos personas)', note: 'Representa la dualidad andina.' },
      { quechua: 'Kimsa', spanish: 'Tres (3)', phonetic: 'kim-sa', usage: 'Kimsa urpi (Tres palomas)', note: 'Número sagrado andino (3 mundos).' },
      { quechua: 'Tawa', spanish: 'Cuatro (4)', phonetic: 'ta-wa', usage: 'Tawantinsuyu (Las 4 regiones)', note: 'Base de las 4 direcciones del Tahuantinsuyo.' },
      { quechua: 'Pichqa', spanish: 'Cinco (5)', phonetic: 'pich-qa', usage: 'Pichqa chaka (Cinco puentes)', note: 'Número cinco.' },
    ],
    exercises: [
      {
        id: 'num-01',
        type: 'multiple_choice',
        prompt: '¿Cómo se dice "Uno" (1) en quechua?',
        options: ['Huk', 'Iskay', 'Kimsa', 'Tawa'],
        correct: 'Huk',
      },
      {
        id: 'num-02',
        type: 'multiple_choice',
        prompt: '¿Qué número representa la palabra "Iskay"?',
        options: ['Dos (2)', 'Uno (1)', 'Cuatro (4)', 'Cinco (5)'],
        correct: 'Dos (2)',
      },
      {
        id: 'num-03',
        type: 'listening',
        prompt: 'Escucha y selecciona la palabra que significa "Tres" (3).',
        options: ['Kimsa', 'Huk', 'Pichqa', 'Tawa'],
        correct: 'Kimsa',
      },
      {
        id: 'num-04',
        type: 'multiple_choice',
        prompt: '¿Cómo se dice "Cuatro" (4) en quechua?',
        options: ['Tawa', 'Pichqa', 'Huk', 'Iskay'],
        correct: 'Tawa',
        clue: 'Relacionado con "Tawantinsuyu".',
      },
      {
        id: 'num-05',
        type: 'matching_pairs',
        prompt: 'Empareja los números con su valor:',
        correct: 'Huk • Iskay • Kimsa • Tawa • Pichqa',
        options: ['Huk', 'Iskay', 'Kimsa', 'Tawa', 'Pichqa'],
        wordBank: ['Uno (1)', 'Dos (2)', 'Tres (3)', 'Cuatro (4)', 'Cinco (5)'],
      },
      {
        id: 'num-06',
        type: 'text_input',
        prompt: 'Escribe la palabra quechua para el número cinco (5):',
        correct: 'Pichqa',
        acceptedAnswers: ['pichqa', 'Pichqa', 'pishqa'],
      },
    ],
  },

  // ── NIVEL 2 · LECCIÓN 2: NÚMEROS DEL 6 AL 10 ────────────────────────
  4: {
    lessonId: 4,
    title: 'Números del 6 al 10',
    focus: 'Aprende a contar del 6 al 10 y completa la decena en Quechua.',
    vocabulary: [
      { quechua: 'Soqta', spanish: 'Seis (6)', phonetic: 'soq-ta', usage: 'Soqta inti (Seis soles)', note: 'Número seis.' },
      { quechua: 'Qanchis', spanish: 'Siete (7)', phonetic: 'qan-chis', usage: "Qanchis p'unchaw (Siete días)", note: 'Número siete.' },
      { quechua: 'Pusaq', spanish: 'Ocho (8)', phonetic: 'pu-saq', usage: 'Pusaq rumi (Ocho piedras)', note: 'Número ocho.' },
      { quechua: 'Isqon', spanish: 'Nueve (9)', phonetic: 'is-qon', usage: 'Isqon killa (Nueve lunas)', note: 'Número nueve.' },
      { quechua: 'Chunka', spanish: 'Diez (10)', phonetic: 'chun-ka', usage: 'Chunka wasi (Diez casas)', note: 'Base decimal del sistema quechua.' },
    ],
    exercises: [
      {
        id: 'advnum-01',
        type: 'multiple_choice',
        prompt: '¿Cómo se dice "Seis" (6) en quechua?',
        options: ['Soqta', 'Qanchis', 'Pusaq', 'Chunka'],
        correct: 'Soqta',
      },
      {
        id: 'advnum-02',
        type: 'multiple_choice',
        prompt: '¿Qué número representa la palabra "Qanchis"?',
        options: ['Siete (7)', 'Seis (6)', 'Ocho (8)', 'Nueve (9)'],
        correct: 'Siete (7)',
      },
      {
        id: 'advnum-03',
        type: 'listening',
        prompt: 'Escucha el audio y selecciona la palabra para "Diez" (10).',
        options: ['Chunka', 'Isqon', 'Pusaq', 'Soqta'],
        correct: 'Chunka',
      },
      {
        id: 'advnum-04',
        type: 'multiple_choice',
        prompt: '¿Cómo se dice "Ocho" (8) en quechua?',
        options: ['Pusaq', 'Soqta', 'Isqon', 'Chunka'],
        correct: 'Pusaq',
      },
      {
        id: 'advnum-05',
        type: 'matching_pairs',
        prompt: 'Empareja los números con su valor:',
        correct: 'Soqta • Qanchis • Pusaq • Isqon • Chunka',
        options: ['Soqta', 'Qanchis', 'Pusaq', 'Isqon', 'Chunka'],
        wordBank: ['Seis (6)', 'Siete (7)', 'Ocho (8)', 'Nueve (9)', 'Diez (10)'],
      },
      {
        id: 'advnum-06',
        type: 'text_input',
        prompt: 'Escribe la palabra quechua para diez (10):',
        correct: 'Chunka',
        acceptedAnswers: ['chunka', 'Chunka'],
      },
    ],
  },

  // ── NIVEL 3 · LECCIÓN 1: SALUDOS Y CORTESÍA ─────────────────────────
  5: {
    lessonId: 5,
    title: 'Saludos y Cortesía',
    focus: 'Aprende expresiones andinas para saludar, agradecer y despedirte con respeto.',
    vocabulary: [
      {
        quechua: 'Allillanchu',
        spanish: '¿Cómo estás? / ¿Estás bien?',
        phonetic: 'a-lli-llan-chu',
        usage: 'Allillanchu, masiy? (¿Estás bien, amigo?)',
        note: 'El saludo más común y afectuoso en los Andes.',
      },
      {
        quechua: 'Allillanmi',
        spanish: 'Estoy bien',
        phonetic: 'a-lli-llan-mi',
        usage: 'Allillanmi kashani (Estoy bien)',
        note: 'Respuesta tradicional afirmativa a "Allillanchu".',
      },
      {
        quechua: 'Añay',
        spanish: 'Gracias',
        phonetic: 'a-ñay',
        usage: 'Añay, taytay (Gracias, señor/papá)',
        note: 'Expresión de gratitud sincera.',
      },
      {
        quechua: 'Tupananchiskama',
        spanish: 'Hasta volver a encontrarnos',
        phonetic: 'tu-pa-nan-chis-ka-ma',
        usage: 'Tupananchiskama, panay (Hasta luego, hermana)',
        note: 'En la cosmovisión andina no existe el "adiós definitivo", sino el "hasta volver a vernos".',
      },
      {
        quechua: "Allin p'unchaw",
        spanish: 'Buenos días',
        phonetic: "a-llin p'un-chaw",
        usage: "Allin p'unchaw kachun (Que sea un buen día)",
        note: 'Saludo matutino.',
      },
      {
        quechua: 'Allin tuta',
        spanish: 'Buenas noches',
        phonetic: 'a-llin tu-ta',
        usage: 'Allin tuta puñuy (Duerme buenas noches)',
        note: 'Saludo o despedida nocturna.',
      },
    ],
    exercises: [
      {
        id: 'greet-01',
        type: 'multiple_choice',
        prompt: '¿Cómo se saluda preguntando "¿Cómo estás?" en Quechua?',
        options: ['Allillanchu', 'Añay', 'Tupananchiskama', 'Allin tuta'],
        correct: 'Allillanchu',
      },
      {
        id: 'greet-02',
        type: 'multiple_choice',
        prompt: 'Si alguien te dice "Allillanchu?", ¿cómo respondes que estás bien?',
        options: ['Allillanmi', 'Añay', 'Manan', 'Tupananchiskama'],
        correct: 'Allillanmi',
      },
      {
        id: 'greet-03',
        type: 'listening',
        prompt: 'Escucha el audio y selecciona la palabra que significa "Gracias".',
        options: ['Añay', 'Allillanchu', 'Allin tuta', 'Tayta'],
        correct: 'Añay',
      },
      {
        id: 'greet-04',
        type: 'multiple_choice',
        prompt: '¿Qué significa la expresión "Tupananchiskama"?',
        options: ['Hasta volver a encontrarnos', 'Buenos días', 'Muchas gracias', 'Por favor'],
        correct: 'Hasta volver a encontrarnos',
      },
      {
        id: 'greet-05',
        type: 'matching_pairs',
        prompt: 'Empareja cada saludo con su significado:',
        correct: 'Allillanchu • Allillanmi • Añay • Tupananchiskama',
        options: ['Allillanchu', 'Allillanmi', 'Añay', 'Tupananchiskama'],
        wordBank: ['¿Cómo estás?', 'Estoy bien', 'Gracias', 'Hasta luego'],
      },
    ],
  },

  // ── NIVEL 3 · LECCIÓN 2: FAMILIA ANDINA ──────────────────────────────
  6: {
    lessonId: 6,
    title: 'Familia Andina (Ayllu)',
    focus: 'Aprende a nombrar a los miembros de la familia y los lazos de parentesco.',
    vocabulary: [
      {
        quechua: 'Tayta',
        spanish: 'Padre / Papá / Señor',
        phonetic: 'tay-ta',
        usage: 'Munana tayta (Querido padre)',
        note: 'Término de gran respeto y cariño.',
      },
      {
        quechua: 'Mama',
        spanish: 'Madre / Mamá',
        phonetic: 'ma-ma',
        usage: 'Mama Pachamama (Madre Tierra)',
        note: 'Madre nutricia y protectora.',
      },
      {
        quechua: 'Wawa',
        spanish: 'Bebé / Hijo o hija de una madre',
        phonetic: 'wa-wa',
        usage: 'Uchuy wawa (Pequeño bebé)',
        note: 'La madre llama "wawa" a sus hijos.',
      },
      {
        quechua: 'Churi',
        spanish: 'Hijo varón de un padre',
        phonetic: 'chu-ri',
        usage: 'Churi munay (Hijo querido)',
        note: 'El padre llama "churi" a su hijo.',
      },
      {
        quechua: 'Awicha',
        spanish: 'Abuela',
        phonetic: 'a-wi-cha',
        usage: 'Awicha yachachiq (Abuela sabia)',
        note: 'Guardián de la sabiduría ancestral.',
      },
      {
        quechua: 'Awichu',
        spanish: 'Abuelo',
        phonetic: 'a-wi-chu',
        usage: 'Awichu kuraq (Abuelo mayor)',
        note: 'Abuelo respetado.',
      },
    ],
    exercises: [
      {
        id: 'fam-01',
        type: 'multiple_choice',
        prompt: '¿Cómo se dice "Padre" en quechua?',
        options: ['Tayta', 'Mama', 'Wawa', 'Awicha'],
        correct: 'Tayta',
      },
      {
        id: 'fam-02',
        type: 'multiple_choice',
        prompt: '¿Cómo se dice "Madre" en quechua?',
        options: ['Mama', 'Tayta', 'Awichu', 'Churi'],
        correct: 'Mama',
      },
      {
        id: 'fam-03',
        type: 'listening',
        prompt: 'Escucha el audio y selecciona la palabra para "Bebé / Hijo".',
        options: ['Wawa', 'Tayta', 'Awicha', 'Mama'],
        correct: 'Wawa',
      },
      {
        id: 'fam-04',
        type: 'multiple_choice',
        prompt: '¿Qué significa "Awicha"?',
        options: ['Abuela', 'Padre', 'Hijo', 'Hermana'],
        correct: 'Abuela',
      },
      {
        id: 'fam-05',
        type: 'matching_pairs',
        prompt: 'Empareja los miembros de la familia:',
        correct: 'Tayta • Mama • Wawa • Awicha',
        options: ['Tayta', 'Mama', 'Wawa', 'Awicha'],
        wordBank: ['Padre', 'Madre', 'Bebé / Hijo', 'Abuela'],
      },
      {
        id: 'fam-06',
        type: 'text_input',
        prompt: 'Escribe la palabra quechua para "Padre":',
        correct: 'Tayta',
        acceptedAnswers: ['tayta', 'Tayta'],
      },
    ],
  },
};

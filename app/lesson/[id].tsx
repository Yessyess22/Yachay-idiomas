import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Illustrations } from '@/constants/illustrations';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { questionService } from '@/src/services/questionService';
import { leaderboardService } from '@/src/services/leaderboardService';
import { questService } from '@/src/services/questService';
import { saveQuestionsToCache, loadQuestionsFromCache } from '@/src/services/offlineCache';
import { QuestionOption, QuestionWithOptions } from '@/src/types';
import { AudioPronounceButton } from '@/components/yachay/audio-pronounce-button';
import { Button } from '@/components/yachay/button';
import { ConfettiBurst } from '@/components/yachay/confetti-burst';
import { SparkleBurst } from '@/components/yachay/sparkle-burst';
import { ProgressBar } from '@/components/yachay/progress-bar';
import { PronunciationExercise } from '@/components/yachay/exercises/pronunciation-exercise';
import { WordBankExercise } from '@/components/yachay/exercises/word-bank-exercise';
import { MatchingPairsExercise } from '@/components/yachay/exercises/matching-pairs-exercise';
import { useYachiBounce } from '@/hooks/use-yachi-bounce';
import { extractCorePhoneme } from '@/src/utils/phoneticGuide';
import { LESSON_CONTENT_PACKS, LessonContentPack, LessonExerciseEntry, LessonVocabularyEntry } from '@/src/content/lessonContent';
import { LessonTeaching } from '@/components/yachay/lesson-teaching';
import { playQuechuaAudio } from '@/src/services/voiceService';
import {
  isSoundEnabled,
  setSoundEnabled,
  playCorrectSound,
  playIncorrectSound,
  playCompleteSound,
  playTapSound,
} from '@/src/services/soundService';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const CREAM = '#FAF7F2';
const GREEN = '#00C853';
const GREEN_DARK = '#009624';
const RED = '#FF3366';
type VocabCard = LessonVocabularyEntry;

/**
 * Tarjetas de vocabulario fijas para lecciones cuyas preguntas son trivia
 * conceptual (no traducciones palabra-a-palabra), donde buildVocabCards()
 * no puede extraer un vocablo real con regex. Ej: lección 1 pregunta "¿Cuáles
 * son las 3 únicas vocales fonémicas...?" no tiene una palabra quechua que
 * extraer, y el heurístico terminaba usando el enunciado completo como si
 * fuera la palabra a pronunciar.
 */
const VOCAB_OVERRIDES: Record<number, VocabCard[]> = {
  1: [
    { quechua: 'a', spanish: 'Vocal abierta — como en "Allin" (bueno/bien)' },
    { quechua: 'i', spanish: 'Vocal cerrada — como en "Inti" (sol sagrado)' },
    { quechua: 'u', spanish: 'Vocal posterior — como en "Urpi" (paloma)' },
  ],
  // Lección 2 (Consonantes): se usan palabras reales como blanco de audio en vez
  // de la consonante aislada (ej. "q" o "ll" sueltas sonarían mal por TTS), pero
  // conservando la explicación articulatoria en el texto de significado.
  2: [
    { quechua: 'Quri', spanish: 'Oro — la "q" se pronuncia desde la garganta (posvelar)' },
    { quechua: 'Mishki', spanish: 'Dulce / Delicioso — con el sonido "sh"' },
    { quechua: 'Wasi', spanish: 'Casa / Hogar' },
    { quechua: 'Allin', spanish: 'Bueno / Bien — con la consonante palatal "ll" [ʎ]' },
  ],
  3: [
    { quechua: 'Huk', spanish: 'Uno' },
    { quechua: 'Iskay', spanish: 'Dos' },
    { quechua: 'Kimsa', spanish: 'Tres' },
    { quechua: 'Tawa', spanish: 'Cuatro' },
    { quechua: 'Pichqa', spanish: 'Cinco' },
  ],
  4: [
    { quechua: 'Suqta', spanish: 'Seis' },
    { quechua: 'Qanchis', spanish: 'Siete' },
    { quechua: 'Pusaq', spanish: 'Ocho' },
    { quechua: 'Isqon', spanish: 'Nueve' },
    { quechua: 'Chunka', spanish: 'Diez' },
  ],
  5: [
    { quechua: 'Allillanchu', spanish: '¿Cómo estás?' },
    { quechua: 'Allillanmi', spanish: 'Estoy bien' },
    { quechua: 'Añay', spanish: 'Gracias' },
    { quechua: 'Tupananchiskama', spanish: 'Hasta volver a encontrarnos' },
    { quechua: "Allin p'unchaw", spanish: 'Buenos días' },
    { quechua: 'Allin tuta', spanish: 'Buenas noches' },
  ],
  6: [
    { quechua: 'Tayta', spanish: 'Padre' },
    { quechua: 'Mama', spanish: 'Madre' },
    { quechua: 'Churi', spanish: 'Hijo o hija para un padre' },
    { quechua: 'Wawa', spanish: 'Bebé o hijo/a para una madre' },
    { quechua: 'Awicha', spanish: 'Abuela' },
    { quechua: 'Tura', spanish: 'Hermano de una mujer' },
  ],
};

type Exercise =
  | {
      kind: 'quiz';
      id: string;
      prompt: string;
      options: QuestionOption[];
      correctAnswer: string;
    }
  | {
      kind: 'listening';
      id: string;
      prompt: string;
      targetWord: string;
      options: { id: number; text: string; is_correct: boolean }[];
      correctAnswer: string;
    }
  | {
      kind: 'speaking';
      id: string;
      prompt: string;
      targetWord: string;
      translation: string;
      correctAnswer: string;
      isPhrase: boolean;
    }
  | {
      kind: 'fill_blank';
      id: string;
      prompt: string;
      clueText: string;
      targetWord: string;
      options: { id: number; text: string; is_correct: boolean }[];
      correctAnswer: string;
    }
  | {
      kind: 'text_input';
      id: string;
      prompt: string;
      clueText: string;
      targetWord: string;
      correctAnswer: string;
      acceptedAnswers?: string[];
    }
  | {
      kind: 'true_false';
      id: string;
      prompt: string;
      statement: string;
      targetWord: string;
      options: { id: number; text: string; is_correct: boolean }[];
      correctAnswer: string;
    }
  | {
      kind: 'image_match';
      id: string;
      prompt: string;
      targetWord: string;
      options: { id: number; text: string; is_correct: boolean }[];
      correctAnswer: string;
    }
  | {
      kind: 'word_bank';
      id: string;
      prompt: string;
      correctSentence: string;
      words: string[];
      correctAnswer: string;
    }
  | {
      kind: 'matching_pairs';
      id: string;
      prompt: string;
      pairs: { qu: string; es: string }[];
      correctAnswer: string;
    };

/**
 * Emojis usados como "imagen" en el ejercicio de emparejar audio-imagen,
 * para vocabulario con un significado concreto y representable visualmente
 * (números, familia, objetos). Solo se genera el ejercicio cuando hay al
 * menos 2 palabras de la lección con emoji definido aquí.
 */
const VOCAB_EMOJI: Record<string, string> = {
  huk: '1️⃣', iskay: '2️⃣', kimsa: '3️⃣', tawa: '4️⃣', pichqa: '5️⃣',
  suqta: '6️⃣', qanchis: '7️⃣', pusaq: '8️⃣', isqon: '9️⃣', chunka: '🔟',
  mama: '👩', tayta: '👨', tura: '🧑', pana: '👧', awicha: '👵',
  wasi: '🏠', quri: '🥇', mishki: '🍬',
};

/**
 * Detecta si un texto corresponde a vocabulario o explicaciones en español.
 */
function isSpanishText(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  const spanishKeywords = [
    'hasta que', 'hasta luego', 'buenos días', 'buenos dias', 'gracias', 'cómo estás', 'como estas',
    'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'mamá', 'mama', 'papá', 'papa', 'hermano', 'hermana', 'abuela', 'abuelo', 'familia',
    'como la', 'como "', 'no se pronuncia', 'no existe', 'de la garganta', 'consonante',
    'vocal', 'respuesta', 'forma de decir', 'número', 'numero', 'dicho por', 'significa', 'quiere decir'
  ];
  if (spanishKeywords.some((kw) => t.includes(kw))) return true;
  // Letras o acentos que no existen en Quechua estándar (e.g. b, d, g, v, z, acentos agudos á, é, ó, ú)
  if (/[áéóúbdgvz]/.test(t) && !t.includes('q')) return true;
  return false;
}

/**
 * Determina la dirección de la pregunta y extrae quechua/español correctamente.
 *
 * Casos:
 *  1. ¿Cómo se dice "ESPAÑOL" en quechua? → quechua=correct.option_text, español=palabra_en_comillas
 *  2. "QUECHUA" significa / es una forma de decir / etc. → quechua=palabra_en_comillas, español=correct.option_text
 *  3. ¿Cómo suena la consonante "QUECHUA"? → quechua=palabra_en_comillas, español=correct.option_text
 *  4. Red de seguridad bidireccional para garantizar que NUNCA se inviertan.
 */
function buildVocabCards(questions: QuestionWithOptions[]): VocabCard[] {
  const seen = new Set<string>();
  const cards: VocabCard[] = [];

  for (const q of questions) {
    const correct = q.options.find((o) => o.is_correct);
    if (!correct) continue;

    const prompt = q.prompt;
    const lp = prompt.toLowerCase();

    // Extraer la primera palabra entre comillas del prompt
    const qmatch = prompt.match(/['"''""«»]([^'"'""«»]{1,50})['"''""«»]/);
    const quotedWord = qmatch?.[1]?.trim() ?? null;

    let quechua: string;
    let spanish: string;

    // ¿La pregunta pide traducir HACIA el Quechua?
    // Ej: '¿Cómo se dice "uno" en quechua?', '¿Cómo se escribe "mamá" en quechua?'
    const isAskingForQuechua =
      (lp.includes('cómo se') || lp.includes('como se') || lp.includes('se dice') || lp.includes('se escribe') || lp.includes('traduce')) &&
      (lp.includes('en quechua') || lp.includes('al quechua'));

    if (isAskingForQuechua) {
      // La palabra entre comillas es español ("uno"), y la respuesta correcta es Quechua ("huk")
      quechua = correct.option_text;
      spanish = quotedWord ?? prompt;
    } else if (quotedWord) {
      // La palabra entre comillas es Quechua ("Tupananchiskama", "Allianchu", "q", "tawa"),
      // y la respuesta correcta es su significado o sonido en español.
      quechua = quotedWord;
      spanish = correct.option_text;
    } else {
      // Sin comillas en el prompt: verificar cuál de los dos es español
      if (!isSpanishText(correct.option_text)) {
        quechua = correct.option_text;
        spanish = prompt;
      } else {
        quechua = prompt;
        spanish = correct.option_text;
      }
    }

    // RED DE SEGURIDAD ABSOLUTA:
    // Si la variable 'quechua' contiene texto en español y 'spanish' no, invertirlos.
    if (isSpanishText(quechua) && !isSpanishText(spanish)) {
      const temp = quechua;
      quechua = spanish;
      spanish = temp;
    }

    const key = quechua.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push({ quechua: quechua.trim(), spanish: spanish.trim() });
  }
  return cards;
}

/**
 * Normaliza texto para comparar respuestas escritas por el usuario contra la
 * respuesta esperada (minúsculas, sin tildes ni signos, sin espacios extra).
 */
function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['".,¡!¿?]/g, '')
    .replace(/\s+/g, ' ');
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function buildExerciseList(questions: QuestionWithOptions[], vocabCards: VocabCard[]): Exercise[] {
  const list: Exercise[] = [];

  // 1. Agregar preguntas normales
  questions.forEach((q, idx) => {
    const correct = q.options.find((o) => o.is_correct);
    list.push({
      kind: 'quiz',
      id: `quiz-${q.id || idx}`,
      prompt: q.prompt,
      options: shuffle(q.options),
      correctAnswer: correct?.option_text || '',
    });
  });

  // 2. Intercalar ejercicio(s) de Listening con vocabulario.
  // Con suficiente vocabulario (≥3 tarjetas) se generan 2 ejercicios de
  // listening en vez de 1, dejando la última tarjeta libre para "speaking".
  const listeningTargetCount = vocabCards.length >= 3 ? 2 : vocabCards.length > 0 ? 1 : 0;
  for (let t = 0; t < listeningTargetCount; t++) {
    const targetVocab = vocabCards[t];
    const otherVocabs = vocabCards
      .filter((_, idx) => idx !== t)
      .map((v) => v.quechua);
    const distractors = otherVocabs.length >= 2 ? otherVocabs.slice(0, 2) : ['Urpi', 'Inti'];
    const listeningOptions = [
      { id: 101, text: targetVocab.quechua, is_correct: true },
      ...distractors.map((d, i) => ({ id: 102 + i, text: d, is_correct: false })),
    ].sort(() => Math.random() - 0.5);

    list.push({
      kind: 'listening',
      id: `listening-${targetVocab.quechua}`,
      prompt: 'Escucha el audio y selecciona la palabra correcta en Quechua:',
      targetWord: targetVocab.quechua,
      options: listeningOptions,
      correctAnswer: targetVocab.quechua,
    });
  }

  // 2.5 Agregar ejercicio de "Completa la palabra" (fill-in-the-blank), usando
  // una tarjeta de vocabulario distinta a las ya usadas en Listening cuando sea posible.
  if (vocabCards.length > 0) {
    const blankIdx = listeningTargetCount < vocabCards.length ? listeningTargetCount : 0;
    const targetVocab = vocabCards[blankIdx];
    const otherVocabs = vocabCards
      .filter((_, idx) => idx !== blankIdx)
      .map((v) => v.quechua);
    const distractors = otherVocabs.length >= 2 ? otherVocabs.slice(0, 2) : ['Sumaq', 'Kawsay'];
    const blankOptions = [
      { id: 201, text: targetVocab.quechua, is_correct: true },
      ...distractors.map((d, i) => ({ id: 202 + i, text: d, is_correct: false })),
    ].sort(() => Math.random() - 0.5);

    list.push({
      kind: 'fill_blank',
      id: `fillblank-${targetVocab.quechua}`,
      prompt: 'Completa la palabra que falta en Quechua:',
      clueText: targetVocab.spanish,
      targetWord: targetVocab.quechua,
      options: blankOptions,
      correctAnswer: targetVocab.quechua,
    });
  }

  // 2.6 Agregar ejercicio de "Traducir" (texto libre), usando otra tarjeta
  // de vocabulario distinta a Listening/Fill-blank cuando sea posible.
  if (vocabCards.length > 0) {
    const blankIdx = listeningTargetCount < vocabCards.length ? listeningTargetCount : 0;
    const textIdx = blankIdx + 1 < vocabCards.length ? blankIdx + 1 : 0;
    const targetVocab = vocabCards[textIdx];
    list.push({
      kind: 'text_input',
      id: `textinput-${targetVocab.quechua}`,
      prompt: 'Escribe la palabra en Quechua:',
      clueText: targetVocab.spanish,
      targetWord: targetVocab.quechua,
      correctAnswer: targetVocab.quechua,
    });
  }

  // 2.7 Agregar ejercicio de "Verdadero o Falso": requiere al menos 2
  // tarjetas de vocabulario para poder armar un enunciado falso creíble.
  if (vocabCards.length >= 2) {
    const blankIdx = listeningTargetCount < vocabCards.length ? listeningTargetCount : 0;
    const textIdx = blankIdx + 1 < vocabCards.length ? blankIdx + 1 : 0;
    const tfIdx = (textIdx + 1) % vocabCards.length;
    const targetVocab = vocabCards[tfIdx];
    const isStatementTrue = Math.random() < 0.5;
    const shownSpanish = isStatementTrue
      ? targetVocab.spanish
      : vocabCards[(tfIdx + 1) % vocabCards.length].spanish;

    list.push({
      kind: 'true_false',
      id: `truefalse-${targetVocab.quechua}`,
      prompt: '¿Verdadero o falso?',
      statement: `"${targetVocab.quechua}" significa: ${shownSpanish}`,
      targetWord: targetVocab.quechua,
      options: [
        { id: 401, text: 'Verdadero', is_correct: isStatementTrue },
        { id: 402, text: 'Falso', is_correct: !isStatementTrue },
      ],
      correctAnswer: targetVocab.quechua,
    });
  }

  // 2.8 Agregar ejercicio de "Emparejar con imagen" (audio → pictograma),
  // solo si al menos 2 palabras de la lección tienen un emoji representativo.
  const emojiCards = vocabCards.filter((v) => VOCAB_EMOJI[v.quechua.toLowerCase()]);
  if (emojiCards.length >= 2) {
    const target = emojiCards[0];
    const distractorPool = emojiCards.slice(1).map((v) => VOCAB_EMOJI[v.quechua.toLowerCase()]);
    const distractors = distractorPool.length >= 2 ? distractorPool.slice(0, 2) : [...distractorPool, '❓'];
    const imageOptions = [
      { id: 501, text: VOCAB_EMOJI[target.quechua.toLowerCase()], is_correct: true },
      ...distractors.map((d, i) => ({ id: 502 + i, text: d, is_correct: false })),
    ].sort(() => Math.random() - 0.5);

    list.push({
      kind: 'image_match',
      id: `imagematch-${target.quechua}`,
      prompt: 'Escucha el audio y toca la imagen correcta:',
      targetWord: target.quechua,
      options: imageOptions,
      correctAnswer: target.quechua,
    });
  }

  // 2.9 Agregar ejercicio de banco de palabras para reconstruir frases breves.
  if (vocabCards.length >= 2) {
    const anchor = vocabCards[Math.min(1, vocabCards.length - 1)];
    const phraseWords = anchor.quechua.split(/\s+/).filter(Boolean);
    const extraWords = vocabCards
      .filter((v) => v.quechua !== anchor.quechua)
      .flatMap((v) => v.quechua.split(/\s+/).filter(Boolean))
      .filter((v) => !phraseWords.includes(v))
      .slice(0, 4);
    const bankWords = [...phraseWords, ...extraWords].sort(() => Math.random() - 0.5);

    list.push({
      kind: 'word_bank',
      id: `wordbank-${anchor.quechua}`,
      prompt: 'Arma la frase correcta usando las palabras del banco:',
      correctSentence: anchor.quechua,
      words: bankWords,
      correctAnswer: anchor.quechua,
    });
  }

  // 2.10 Agregar ejercicio de emparejar vocabulario con su significado.
  if (vocabCards.length >= 2) {
    const pairs = vocabCards.slice(0, Math.min(vocabCards.length, 4)).map((v) => ({
      qu: v.quechua,
      es: v.spanish.replace(/^[^:]+:\s*/, '').trim() || v.spanish,
    }));

    list.push({
      kind: 'matching_pairs',
      id: `matching-${pairs[0]?.qu || 'pair'}`,
      prompt: 'Relaciona cada palabra con su significado:',
      pairs,
      correctAnswer: pairs.map((p) => p.qu).join(', '),
    });
  }

  // 3. Agregar ejercicio de Pronunciación / Speaking. Si el vocabulario
  // objetivo es una frase (ej. saludos de varias palabras), se evalúa
  // completa en vez de truncarla con extractCorePhoneme (pensado para
  // fonemas/palabras sueltas).
  if (vocabCards.length > 0) {
    const target = vocabCards[vocabCards.length - 1];
    const isPhrase = target.quechua.trim().includes(' ');
    const coreTarget = isPhrase ? target.quechua.trim() : extractCorePhoneme(target.quechua);
    list.push({
      kind: 'speaking',
      id: `speaking-${coreTarget}`,
      prompt: isPhrase ? 'Pronuncia esta frase en voz alta en Quechua:' : 'Pronuncia en voz alta en Quechua:',
      targetWord: coreTarget,
      translation: target.spanish,
      correctAnswer: coreTarget,
      isPhrase,
    });
  }

  return shuffle(list);
}

function toExerciseOptions(options: string[], correct: string, startId: number) {
  return options.map((text, index) => ({
    id: startId + index,
    text,
    is_correct: text === correct,
  }));
}

function resolvePackTarget(entry: LessonExerciseEntry, pack: LessonContentPack): VocabCard {
  const candidates = [entry.correct, entry.clue].filter(Boolean).map((value) => value!.toLowerCase());
  const match = pack.vocabulary.find((item) =>
    candidates.some((candidate) =>
      item.spanish.toLowerCase().includes(candidate) ||
      candidate.includes(item.spanish.toLowerCase()),
    ),
  );

  return match ?? {
    quechua: entry.correct,
    spanish: entry.clue ?? 'Practica esta respuesta',
  };
}

function buildPackExerciseList(pack: LessonContentPack): Exercise[] {
  return shuffle(pack.exercises).map((entry, index) => {
    const target = resolvePackTarget(entry, pack);
    const options = toExerciseOptions(
      shuffle(entry.options ?? []),
      entry.correct,
      index * 10 + 1,
    );

    switch (entry.type) {
      case 'listening':
        return {
          kind: 'listening',
          id: entry.id,
          prompt: entry.prompt,
          targetWord: target.quechua,
          options: options.length > 0 ? options : toExerciseOptions(pack.vocabulary.map((item) => item.quechua), target.quechua, index * 10 + 1),
          correctAnswer: entry.correct,
        };
      case 'fill_blank':
        return {
          kind: 'fill_blank',
          id: entry.id,
          prompt: entry.prompt,
          clueText: entry.clue ?? target.spanish,
          targetWord: target.quechua,
          options,
          correctAnswer: entry.correct,
        };
      case 'text_input':
        return {
          kind: 'text_input',
          id: entry.id,
          prompt: entry.prompt,
          clueText: entry.clue ?? target.spanish,
          targetWord: entry.correct,
          correctAnswer: entry.correct,
          acceptedAnswers: entry.acceptedAnswers,
        };
      case 'true_false':
        return {
          kind: 'true_false',
          id: entry.id,
          prompt: entry.prompt,
          statement: entry.clue ?? entry.prompt,
          targetWord: target.quechua,
          options,
          correctAnswer: entry.correct,
        };
      case 'image_match':
        return {
          kind: 'image_match',
          id: entry.id,
          prompt: entry.prompt,
          targetWord: target.quechua,
          options,
          correctAnswer: entry.correct,
        };
      case 'word_bank':
        return {
          kind: 'word_bank',
          id: entry.id,
          prompt: entry.prompt,
          correctSentence: entry.correct,
          words: shuffle(entry.wordBank ?? entry.options ?? entry.correct.split(/\s+/)),
          correctAnswer: entry.correct,
        };
      case 'matching_pairs': {
        const pairs = shuffle(
          (entry.options ?? []).map((word, pairIndex) => ({
            qu: word,
            es: entry.wordBank?.[pairIndex] ?? '',
          })),
        );
        return {
          kind: 'matching_pairs',
          id: entry.id,
          prompt: entry.prompt,
          pairs,
          correctAnswer: entry.correct,
        };
      }
      case 'speaking':
        return {
          kind: 'speaking',
          id: entry.id,
          prompt: entry.prompt,
          targetWord: target.quechua,
          translation: target.spanish,
          correctAnswer: target.quechua,
          isPhrase: target.quechua.includes(' '),
        };
      default:
        return {
          kind: 'quiz',
          id: entry.id,
          prompt: entry.prompt,
          options: (entry.options ?? []).map((text, optionIndex) => ({
            id: index * 10 + optionIndex + 1,
            question_id: index + 1,
            option_text: text,
            is_correct: text === entry.correct,
          })),
          correctAnswer: entry.correct,
        };
    }
  });
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id as string, 10);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estados de fase pedagógica (Fase 1: Enseñanza -> Fase 2: Práctica)
  const [lessonPhase, setLessonPhase] = useState<'teach' | 'practice'>('teach');
  const [teachingPack, setTeachingPack] = useState<LessonContentPack | null>(null);

  // Estados de selección y feedback modal
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState('');

  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [lessonVocabulary, setLessonVocabulary] = useState<VocabCard[]>([]);
  const [missedWords, setMissedWords] = useState<{ quechua: string; spanish: string }[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<{ id: string; prompt: string; options: string[]; correct: string }[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewSelected, setReviewSelected] = useState<string | null>(null);
  const [reviewAnswered, setReviewAnswered] = useState(false);

  const { user, refreshProfile } = useAuth();
  const { gems, streakDays, addGems, addXp, hasDoubleXp } = useGame();
  const router = useRouter();

  const totalLessonXp = hasDoubleXp ? 20 : 10;
  const xpPenaltyPerError = hasDoubleXp ? 4 : 2;
  const [lostLessonXp, setLostLessonXp] = useState(0);
  const [showXpExhaustedModal, setShowXpExhaustedModal] = useState(false);

  function handleRestartLesson() {
    setShowXpExhaustedModal(false);
    setCurrentIndex(0);
    setIsAnswered(false);
    setSelectedOptionId(null);
    setTypedAnswer('');
    setCorrectAnswerText('');
    setReviewMode(false);
    setReviewQueue([]);
    setMissedWords([]);
    setLostLessonXp(0);
  }

  function handleLessonError() {
    bounceYachi();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    playIncorrectSound();

    const newLost = lostLessonXp + xpPenaltyPerError;
    setLostLessonXp(newLost);

    if (newLost > totalLessonXp) {
      // Ha sobrepasado la exp total que te da la lección por errar tanto
      setShowXpExhaustedModal(true);
    }
  }

  // Animación de la mascota Yachi (rebote/celebración)
  const { style: yachiAnimStyle, bounce: bounceYachi, celebrate: celebrateYachi } = useYachiBounce();

  useEffect(() => {
    let isMounted = true;
    if (!lessonId) return;

    (async () => {
      try {
        const contentPack = LESSON_CONTENT_PACKS[lessonId];
        if (contentPack) {
          setTeachingPack(contentPack);
          setLessonVocabulary(contentPack.vocabulary);
          setExercises(buildPackExerciseList(contentPack));
          setLessonPhase('teach');
          setLoading(false);
          return;
        }

        let qs: QuestionWithOptions[] | null = await loadQuestionsFromCache<QuestionWithOptions[]>(String(lessonId));

        if (!qs) {
          const { data, error } = await questionService.fetchQuestionsByLesson(lessonId);
          if (!isMounted) return;
          if (error) {
            setError(error);
            setLoading(false);
            return;
          }
          qs = data ?? [];
          if (qs.length > 0) {
            await saveQuestionsToCache(String(lessonId), qs);
          }
        }

        if (!isMounted) return;
        const vCards = VOCAB_OVERRIDES[lessonId] ?? buildVocabCards(qs);
        setLessonVocabulary(vCards);
        setExercises(buildExerciseList(qs, vCards));
      } catch {
        if (isMounted) {
          setError('No se pudo cargar la lección. Verifica tu conexión a internet.');
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  useEffect(() => {
    isSoundEnabled().then(setSoundOn);
  }, []);

  async function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    await setSoundEnabled(next);
  }

  function buildReviewOptions(word: string, fallbackGloss: string): string[] {
    const pool = [fallbackGloss, ...lessonVocabulary.map((v) => v.spanish).filter(Boolean)];
    const uniquePool = Array.from(new Set(pool.map((item) => item.trim()).filter(Boolean)));
    const translatedOptions = uniquePool.filter((item) => item.toLowerCase() !== fallbackGloss.toLowerCase());
    const picked = translatedOptions.slice(0, 3);
    const options = [...picked, fallbackGloss].sort(() => Math.random() - 0.5);
    return Array.from(new Set(options)).slice(0, 4);
  }

  function registerMissedWord(exercise: Exercise | null | undefined) {
    if (!exercise) return;

    let target: string | null = null;
    if (exercise.kind === 'quiz') {
      target = !isSpanishText(exercise.correctAnswer) ? exercise.correctAnswer : null;
    } else if (exercise.kind === 'listening' || exercise.kind === 'fill_blank' || exercise.kind === 'true_false' || exercise.kind === 'image_match') {
      target = exercise.targetWord;
    } else if (exercise.kind === 'text_input') {
      target = !isSpanishText(exercise.correctAnswer) ? exercise.correctAnswer : exercise.targetWord;
    } else if (exercise.kind === 'word_bank') {
      target = exercise.correctSentence;
    }

    if (!target || isSpanishText(target)) return;

    const normalizedTarget = target.trim();
    const known = lessonVocabulary.find((v) => v.quechua.toLowerCase() === normalizedTarget.toLowerCase());
    const spanishValue = known?.spanish || 'Repasa esta palabra';

    setMissedWords((prev) => {
      if (prev.some((item) => item.quechua.toLowerCase() === normalizedTarget.toLowerCase())) {
        return prev;
      }
      return [...prev, { quechua: normalizedTarget, spanish: spanishValue }];
    });
  }

  function buildReviewQueueFromMissedWords(): { id: string; prompt: string; options: string[]; correct: string }[] {
    if (missedWords.length === 0) return [];

    return missedWords.slice(0, 3).map((item) => ({
      id: `review-${item.quechua}`,
      prompt: `¿Qué significa “${item.quechua}” en español?`,
      options: buildReviewOptions(item.quechua, item.spanish),
      correct: item.spanish,
    }));
  }

  // ─── Quiz & Ejercicios ────────────────────────────────────
  const currentExercise = exercises[currentIndex];
  const listeningWord = currentExercise?.kind === 'listening' ? currentExercise.targetWord : undefined;

  // Reproduce automáticamente el audio la primera vez que aparece un ejercicio de listening
  useEffect(() => {
    if (listeningWord) {
      playQuechuaAudio(listeningWord).catch(() => {});
    }
  }, [currentExercise?.id, listeningWord]);

  function handleSelectOption(optId: number) {
    if (isAnswered) return;
    setSelectedOptionId(optId);
    playTapSound();
  }

  function handleExerciseResult(correct: boolean, targetText?: string) {
    if (isAnswered || !currentExercise) return;

    let answerText = targetText ?? currentExercise.correctAnswer;

    if (currentExercise.kind === 'quiz') {
      const rightOpt = currentExercise.options.find((o) => o.is_correct);
      answerText = rightOpt?.option_text || currentExercise.correctAnswer;
    } else if (
      currentExercise.kind === 'listening' ||
      currentExercise.kind === 'fill_blank' ||
      currentExercise.kind === 'true_false' ||
      currentExercise.kind === 'image_match'
    ) {
      answerText = currentExercise.targetWord;
    } else if (currentExercise.kind === 'text_input') {
      answerText = currentExercise.targetWord;
    } else if (currentExercise.kind === 'word_bank') {
      answerText = currentExercise.correctSentence;
    } else if (currentExercise.kind === 'matching_pairs') {
      answerText = currentExercise.pairs.map((pair) => pair.qu).join(' • ');
    }

    setCorrectAnswerText(answerText);
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      celebrateYachi();
      setSparkleKey((k) => k + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playCorrectSound();
    } else {
      registerMissedWord(currentExercise);
      handleLessonError();
    }
  }

  function handleCheckAnswer() {
    if (isAnswered || !currentExercise) return;

    let correct = false;

    if (currentExercise.kind === 'quiz') {
      const selected = currentExercise.options.find((o) => o.id === selectedOptionId);
      correct = selected?.is_correct ?? false;
    } else if (
      currentExercise.kind === 'listening' ||
      currentExercise.kind === 'fill_blank' ||
      currentExercise.kind === 'true_false' ||
      currentExercise.kind === 'image_match'
    ) {
      const selected = currentExercise.options.find((o) => o.id === selectedOptionId);
      correct = selected?.is_correct ?? false;
    } else if (currentExercise.kind === 'text_input') {
      const acceptedAnswers = currentExercise.acceptedAnswers ?? [currentExercise.correctAnswer];
      correct = acceptedAnswers.some((answer) => normalizeAnswer(typedAnswer) === normalizeAnswer(answer));
    }

    handleExerciseResult(correct);
  }

  function handleSpeakingSuccess(score: number) {
    handleExerciseResult(true, currentExercise.correctAnswer);
  }

  function handleSpeakingFail() {
    handleExerciseResult(false, currentExercise.correctAnswer);
  }

  async function handleNextExercise() {
    setIsAnswered(false);
    setSelectedOptionId(null);
    setTypedAnswer('');
    setCorrectAnswerText('');
    // Nota: NO cambiar isCorrect a false aquí para evitar que el Modal muestre "Casi lo logras" durante la animación de cierre

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const reviewQueueData = buildReviewQueueFromMissedWords();
    if (reviewQueueData.length > 0) {
      setReviewQueue(reviewQueueData);
      setReviewIndex(0);
      setReviewSelected(null);
      setReviewAnswered(false);
      setReviewMode(true);
      return;
    }

    await finishLesson();
  }

  async function finishLesson() {
    setReviewMode(false);
    setReviewQueue([]);
    setReviewIndex(0);
    setReviewSelected(null);
    setReviewAnswered(false);
    setCompleted(true);
    celebrateYachi();
    setSparkleKey((k) => k + 1);
    playCompleteSound();
    const earnedXp = Math.max(1, totalLessonXp - lostLessonXp);
    addXp(earnedXp);
    addGems(15);
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      await questionService.recordLessonProgress(lessonId, uid, earnedXp);
      leaderboardService.recordWeeklyXp(uid, earnedXp).catch(() => {});
      questService.updateQuestProgress(uid, 'lesson_count', 1).catch(() => {});
      questService.updateQuestProgress(uid, 'xp_gain', earnedXp).catch(() => {});
      await refreshProfile();
    }
  }

  function handleReviewSelect(option: string) {
    if (reviewAnswered) return;
    setReviewSelected(option);
    setReviewAnswered(true);
  }

  async function handleReviewNext() {
    const nextIndex = reviewIndex + 1;
    if (nextIndex < reviewQueue.length) {
      setReviewIndex(nextIndex);
      setReviewSelected(null);
      setReviewAnswered(false);
      return;
    }

    await finishLesson();
  }

  // ─── Estados globales de carga / error ─────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  if (error || (lessonPhase === 'practice' && exercises.length === 0)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error || 'No se encontraron preguntas en esta lección.'}
        </Text>
        <Button label="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  // ─── Fase 1: Enseñanza Previa y Vocabulario ────────────────
  if (lessonPhase === 'teach' && teachingPack) {
    return (
      <LessonTeaching
        title={teachingPack.title}
        focus={teachingPack.focus}
        vocabulary={teachingPack.vocabulary}
        onComplete={() => {
          setCurrentIndex(0);
          setLessonPhase('practice');
        }}
        onBack={() => router.back()}
      />
    );
  }

  if (reviewMode && reviewQueue.length > 0) {
    const currentReview = reviewQueue[reviewIndex];
    const isReviewCorrect = reviewSelected === currentReview.correct;

    return (
      <View style={styles.centered}>
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Repaso inteligente</Text>
          <Text style={styles.reviewSubtitle}>Revisa lo que fallaste antes de cerrar la lección.</Text>
          <Text style={styles.reviewPrompt}>{currentReview.prompt}</Text>
          <View style={styles.reviewOptionsList}>
            {currentReview.options.map((option) => {
              const selected = reviewSelected === option;
              const isCorrect = option === currentReview.correct;
              const showSuccess = reviewAnswered && isCorrect;
              const showError = reviewAnswered && selected && !isCorrect;

              return (
                <TouchableOpacity
                  key={`${currentReview.id}-${option}`}
                  style={[
                    styles.reviewOption,
                    selected && styles.reviewOptionSelected,
                    showSuccess && styles.reviewOptionCorrect,
                    showError && styles.reviewOptionWrong,
                  ]}
                  onPress={() => handleReviewSelect(option)}
                  disabled={reviewAnswered}
                >
                  <Text style={styles.reviewOptionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {reviewAnswered && (
            <Text style={[styles.reviewFeedback, isReviewCorrect ? styles.reviewFeedbackSuccess : styles.reviewFeedbackError]}>
              {isReviewCorrect ? '¡Bien! Esa significa la palabra correcta.' : `Correcto: ${currentReview.correct}`}
            </Text>
          )}
          <View style={styles.reviewActions}>
            <Button
              label={reviewIndex + 1 < reviewQueue.length ? 'Siguiente' : 'Finalizar'}
              onPress={handleReviewNext}
              disabled={!reviewAnswered}
            />
          </View>
        </View>
      </View>
    );
  }

  // ─── Lección Completada ────────────────────────────────────
  if (completed) {
    return (
      <View style={styles.centered}>
        <ConfettiBurst />
        <View style={styles.congratsLlamaWrap}>
          <SparkleBurst key={sparkleKey} />
          <Animated.View style={yachiAnimStyle}>
            <Image
              source={Illustrations.llamaSigueAsi}
              style={styles.congratsLlama}
              contentFit="contain"
            />
          </Animated.View>
        </View>
        <Text style={styles.congratsTitle}>¡Lección Completada! 🎉</Text>
        <Text style={styles.congratsSub}>
          ¡Sumaste +{Math.max(1, totalLessonXp - lostLessonXp)} XP y +15 Gemas!
        </Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>
            🔥 {Math.max(1, streakDays)} {Math.max(1, streakDays) === 1 ? 'día' : 'días'} de racha
          </Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={styles.statBadge}>💎 +15 Gemas</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statBadge}>⚡ +{Math.max(1, totalLessonXp - lostLessonXp)} XP</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statBadge}>🪙 100% Hecho</Text>
          </View>
        </View>

        {/* Puente Virtuoso hacia la Biblioteca Andina (Explorar) */}
        <View style={styles.cultureCrossLinkCard}>
          <View style={styles.cultureCrossLinkHeader}>
            <Text style={styles.cultureCrossLinkTag}>💡 CURIOSIDAD CULTURAL ANDINA</Text>
            <Text style={styles.cultureCrossLinkEmoji}>🏔️</Text>
          </View>
          <Text style={styles.cultureCrossLinkTitle}>
            ¿Quieres profundizar en el origen de las palabras y tradiciones?
          </Text>
          <Text style={styles.cultureCrossLinkDesc}>
            En la Biblioteca Andina puedes leer cuentos ancestrales, explorar gastronomía y escuchar modismos sin exámenes ni vidas.
          </Text>
          <TouchableOpacity
            style={styles.cultureCrossLinkBtn}
            onPress={() => router.replace('/(tabs)/explore')}
            activeOpacity={0.85}
          >
            <Text style={styles.cultureCrossLinkBtnText}>Explorar en la Biblioteca Andina →</Text>
          </TouchableOpacity>
        </View>

        <Button label="Continuar al Inicio →" onPress={() => router.back()} />
      </View>
    );
  }

  // ─── Fase Ejercicios Interactivos ─────────────────────────
  const progressPercent = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <View style={styles.container}>
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <ProgressBar
          progress={progressPercent}
          height={14}
          color={GREEN}
          trackColor="#E8E2D9"
          style={styles.progressBarBg}
        />
        <View style={styles.lessonXpPill}>
          <Text style={styles.lessonXpIcon}>⚡</Text>
          <Text style={styles.lessonXpText}>{Math.max(0, totalLessonXp - lostLessonXp)} XP</Text>
        </View>
        <View style={styles.gemsPill}>
          <Text style={styles.gemIcon}>💎</Text>
          <Text style={styles.gemsCountText}>{gems}</Text>
        </View>
        <TouchableOpacity style={styles.soundToggleBtn} onPress={toggleSound}>
          <Text style={styles.soundToggleIcon}>{soundOn ? '🔊' : '🔇'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.exerciseScroll} showsVerticalScrollIndicator={false}>
        {/* Cabecera del ejercicio con mascota Yachi */}
        <View style={styles.mascotSpeechRow}>
          <Animated.View style={yachiAnimStyle}>
            <Image
              source={Illustrations.llamaPregunta}
              style={styles.mascotImg}
              contentFit="contain"
            />
          </Animated.View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechBadge}>
              {currentExercise.kind === 'listening'
                ? '🎧 COMPRENSIÓN AUDITIVA'
                : currentExercise.kind === 'speaking'
                ? '🎙️ PRÁCTICA DE PRONUNCIACIÓN'
                : currentExercise.kind === 'fill_blank'
                ? '✍️ COMPLETA LA PALABRA'
                : currentExercise.kind === 'text_input'
                ? '⌨️ TRADUCIR'
                : currentExercise.kind === 'true_false'
                ? '✅ VERDADERO O FALSO'
                : currentExercise.kind === 'image_match'
                ? '🖼️ EMPAREJAR CON IMAGEN'
                : currentExercise.kind === 'word_bank'
                ? '🧩 ARMAR FRASE'
                : currentExercise.kind === 'matching_pairs'
                ? '🔗 EMPAREJAR CON SIGNIFICADO'
                : '📝 PREGUNTA INTERACTIVA'}
            </Text>
            <Text style={styles.speechText}>{currentExercise.prompt}</Text>
          </View>
        </View>

        {/* ── 1. EJERCICIO MULTIPLE CHOICE ── */}
        {currentExercise.kind === 'quiz' && (
          <View style={styles.optionsList}>
            {currentExercise.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionBase,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => handleSelectOption(option.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.option_text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── 2. EJERCICIO LISTENING (AUDITIVO) ── */}
        {currentExercise.kind === 'listening' && (
          <View style={styles.listeningContainer}>
            <View style={styles.listeningPromptBox}>
              <Text style={styles.listeningHint}>Toca para escuchar la voz Quechua:</Text>
              <View style={styles.listeningAudioRow}>
                <AudioPronounceButton text={currentExercise.targetWord} size="large" showLabel />
                <AudioPronounceButton
                  text={currentExercise.targetWord}
                  size="medium"
                  slow
                  icon="🐢"
                  label="Más lento"
                  showLabel
                />
              </View>
            </View>

            <View style={styles.optionsList}>
              {currentExercise.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionBase, isSelected && styles.optionSelected]}
                    onPress={() => handleSelectOption(opt.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 2.5 EJERCICIO FILL-IN-THE-BLANK (COMPLETA LA PALABRA) ── */}
        {currentExercise.kind === 'fill_blank' && (
          <View style={styles.blankContainer}>
            <View style={styles.blankClueBox}>
              <Text style={styles.blankClueLabel}>Significa:</Text>
              <Text style={styles.blankClueText}>{currentExercise.clueText}</Text>
              <View style={styles.blankLine}>
                <Text style={styles.blankLineText}>
                  {selectedOptionId
                    ? currentExercise.options.find((o) => o.id === selectedOptionId)?.text
                    : '_____'}
                </Text>
              </View>
            </View>

            <View style={styles.wordBankRow}>
              {currentExercise.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.wordChip, isSelected && styles.wordChipSelected]}
                    onPress={() => handleSelectOption(opt.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.wordChipText, isSelected && styles.wordChipTextSelected]}>
                      {opt.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 2.6 EJERCICIO TEXT INPUT (TRADUCIR CON TECLADO) ── */}
        {currentExercise.kind === 'text_input' && (
          <View style={styles.textInputContainer}>
            <View style={styles.blankClueBox}>
              <Text style={styles.blankClueLabel}>Significa:</Text>
              <Text style={styles.blankClueText}>{currentExercise.clueText}</Text>
            </View>
            <TextInput
              style={[styles.textInputBox, isAnswered && styles.textInputDisabled]}
              placeholder="Escribe en Quechua..."
              placeholderTextColor="#B8AFA3"
              value={typedAnswer}
              onChangeText={setTypedAnswer}
              editable={!isAnswered}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* ── 2.7 EJERCICIO VERDADERO O FALSO ── */}
        {currentExercise.kind === 'true_false' && (
          <View style={styles.tfContainer}>
            <View style={styles.tfStatementBox}>
              <Text style={styles.tfStatementText}>{currentExercise.statement}</Text>
            </View>
            <View style={styles.tfOptionsRow}>
              {currentExercise.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isTrueOpt = opt.text === 'Verdadero';
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.tfButton, isSelected && styles.tfButtonSelected]}
                    onPress={() => handleSelectOption(opt.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.tfButtonText}>{isTrueOpt ? '✅ Verdadero' : '❌ Falso'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 2.8 EJERCICIO EMPAREJAR CON IMAGEN (AUDIO → PICTOGRAMA) ── */}
        {currentExercise.kind === 'image_match' && (
          <View style={styles.imageMatchContainer}>
            <View style={styles.listeningPromptBox}>
              <Text style={styles.listeningHint}>Toca para escuchar la voz Quechua:</Text>
              <AudioPronounceButton text={currentExercise.targetWord} size="large" showLabel />
            </View>
            <View style={styles.imageGrid}>
              {currentExercise.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.imageTile, isSelected && styles.imageTileSelected]}
                    onPress={() => handleSelectOption(opt.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.imageTileEmoji}>{opt.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 2.9 EJERCICIO BANCO DE PALABRAS ── */}
        {currentExercise.kind === 'word_bank' && (
          <View style={styles.wordBankExerciseContainer}>
            <WordBankExercise
              prompt={currentExercise.prompt}
              correctSentence={currentExercise.correctSentence}
              words={currentExercise.words}
              onCheck={(isCorrect) => handleExerciseResult(isCorrect, currentExercise.correctSentence)}
              disabled={isAnswered}
            />
          </View>
        )}

        {/* ── 2.10 EJERCICIO EMPAREJAR PARES ── */}
        {currentExercise.kind === 'matching_pairs' && (
          <View style={styles.matchingPairsExerciseContainer}>
            <MatchingPairsExercise
              pairs={currentExercise.pairs}
              onComplete={(isCorrect) =>
                handleExerciseResult(isCorrect, currentExercise.pairs.map((pair) => pair.qu).join(' • '))
              }
              onWrongMatch={() => {
                handleLessonError();
              }}
              disabled={isAnswered}
            />
          </View>
        )}

        {/* ── 3. EJERCICIO SPEAKING (PRONUNCIACIÓN CON MIC) ── */}
        {currentExercise.kind === 'speaking' && (
          <View style={styles.speakingContainer}>
            <PronunciationExercise
              key={`speaking-${currentExercise.id}-${currentIndex}`}
              expectedText={currentExercise.targetWord}
              translation={currentExercise.translation}
              isPhrase={currentExercise.isPhrase}
              onSuccess={handleSpeakingSuccess}
              onFail={handleSpeakingFail}
            />
          </View>
        )}
      </ScrollView>

      {/* Footer inferior (botón comprobar para tipos seleccionables; los ejercicios de palabra y pares se validan internamente) */}
      {currentExercise.kind !== 'speaking' && currentExercise.kind !== 'word_bank' && currentExercise.kind !== 'matching_pairs' && (
        <View style={styles.footer}>
          {(() => {
            const isDisabled =
              currentExercise.kind === 'text_input' ? !typedAnswer.trim() : !selectedOptionId;
            return <Button label="COMPROBAR" onPress={handleCheckAnswer} disabled={isDisabled} />;
          })()}
        </View>
      )}

      {/* ── MODAL FLOTANTE AL CENTRO PARA CORRECTO / INCORRECTO (Requisito 11) ── */}
      <Modal
        transparent
        animationType="none"
        visible={isAnswered}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              isCorrect ? styles.modalCardSuccess : styles.modalCardDanger,
            ]}
          >
            {/* Llama Yachi animada */}
            <View style={styles.modalLlamaWrap}>
              {isCorrect && <SparkleBurst key={sparkleKey} />}
              <Animated.View style={yachiAnimStyle}>
                <Image
                  source={isCorrect ? Illustrations.llamaExcelente : Illustrations.llamaPiensa}
                  style={styles.modalLlama}
                  contentFit="contain"
                />
              </Animated.View>
            </View>

            {/* Título de feedback */}
            <Text
              style={[
                styles.modalTitle,
                isCorrect ? styles.modalTitleSuccess : styles.modalTitleDanger,
              ]}
            >
              {isCorrect ? '¡Allinmi! ¡Excelente! 🌟' : '¡Casi lo logras!'}
            </Text>

            {/* Subtítulo */}
            <Text style={styles.modalSub}>
              {isCorrect
                ? '¡Respuesta correcta! Sigue acumulando tu experiencia.'
                : 'La respuesta correcta en Quechua es:'}
            </Text>

            {/* Notificación de XP descontada de la lección */}
            {!isCorrect && (
              <View style={[styles.xpPenaltyBadge, lostLessonXp > totalLessonXp && styles.xpPenaltyBadgeDanger]}>
                <Text style={[styles.xpPenaltyText, lostLessonXp > totalLessonXp && styles.xpPenaltyTextDanger]}>
                  {lostLessonXp > totalLessonXp
                    ? `⚠️ Sobrepasaste la XP total de la lección (-${lostLessonXp} XP / ${totalLessonXp} XP)`
                    : `⚡ -${xpPenaltyPerError} XP de la lección • Te quedan ${Math.max(0, totalLessonXp - lostLessonXp)} XP`}
                </Text>
              </View>
            )}

            {/* Palabra Quechua con pronunciación de audio */}
            {correctAnswerText ? (
              <View style={styles.modalWordPill}>
                <Text style={styles.modalWordText}>{correctAnswerText}</Text>
                <AudioPronounceButton text={correctAnswerText} size="small" />
              </View>
            ) : null}

            {/* Botón de acción centrado */}
            <Button
              label={
                isCorrect
                  ? '¡Continuar! →'
                  : lostLessonXp > totalLessonXp
                  ? 'Reiniciar Lección ↺'
                  : 'Entendido'
              }
              onPress={
                isCorrect
                  ? handleNextExercise
                  : lostLessonXp > totalLessonXp
                  ? handleRestartLesson
                  : handleNextExercise
              }
              variant={isCorrect ? 'primary' : 'danger'}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Modal cuando se sobrepasa la XP total de la lección por errar tanto */}
      <Modal
        transparent
        animationType="fade"
        visible={showXpExhaustedModal}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.modalCardDanger]}>
            <View style={styles.modalLlamaWrap}>
              <Animated.View style={yachiAnimStyle}>
                <Image
                  source={Illustrations.llamaPiensa}
                  style={styles.modalLlama}
                  contentFit="contain"
                />
              </Animated.View>
            </View>

            <Text style={[styles.modalTitle, styles.modalTitleDanger]}>
              ¡Experiencia Agotada! 🔄
            </Text>

            <Text style={styles.modalSub}>
              Has sobrepasado los {totalLessonXp} XP de esta lección debido a múltiples errores.
            </Text>

            <View style={styles.xpPenaltyBadgeDanger}>
              <Text style={styles.xpPenaltyTextDanger}>
                Para asegurar tu aprendizaje de este tema, reiniciaremos la lección desde el primer ejercicio.
              </Text>
            </View>

            <Button
              label="Reiniciar Lección ↺"
              onPress={handleRestartLesson}
              variant="danger"
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM, paddingTop: 46 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: CREAM,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 22, color: '#7A6A5A', fontWeight: '900' },
  soundToggleBtn: { padding: 4, marginLeft: 2 },
  soundToggleIcon: { fontSize: 18 },
  progressBarBg: {
    flex: 1,
  },
  lessonXpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    gap: 3,
  },
  lessonXpIcon: { fontSize: 13 },
  lessonXpText: { fontSize: 12, fontWeight: '900', color: '#B45309' },
  gemsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  gemIcon: { fontSize: 14 },
  gemsCountText: { fontSize: 13, fontWeight: '900', color: '#1D4ED8' },
  xpPenaltyBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginVertical: 8,
    alignItems: 'center',
  },
  xpPenaltyBadgeDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  xpPenaltyText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  xpPenaltyTextDanger: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  gemsLostBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginVertical: 8,
    alignItems: 'center',
  },
  gemsLostText: {
    color: '#1E40AF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Scroll de ejercicios
  exerciseScroll: {
    paddingBottom: 24,
  },

  // Mascota Speech Row
  mascotSpeechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  mascotImg: {
    width: 65,
    height: 65,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 3,
  },
  speechBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  speechText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A1A0A',
    lineHeight: 20,
  },

  // Opciones
  optionsList: { paddingHorizontal: 20 },
  optionBase: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderBottomWidth: 4,
  },
  optionSelected: {
    borderColor: TEAL,
    backgroundColor: '#E0F2F1',
    borderBottomColor: TEAL_DARK,
  },
  optionText: { fontSize: 17, fontWeight: '700', color: '#2A1A0A' },
  optionTextSelected: { color: TEAL_DARK, fontWeight: '800' },

  // Listening
  listeningContainer: {
    gap: 16,
  },
  listeningPromptBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    gap: 12,
  },
  listeningAudioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listeningHint: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Fill-in-the-blank
  blankContainer: {
    gap: 16,
  },
  blankClueBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    gap: 10,
  },
  blankClueLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  blankClueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A1A0A',
    textAlign: 'center',
  },
  blankLine: {
    borderBottomWidth: 3,
    borderBottomColor: TEAL,
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 140,
    alignItems: 'center',
  },
  blankLineText: {
    fontSize: 20,
    fontWeight: '900',
    color: TEAL_DARK,
    letterSpacing: 1,
  },
  wordBankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  wordChip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 4,
  },
  wordChipSelected: {
    borderColor: TEAL,
    backgroundColor: '#E0F2F1',
    borderBottomColor: TEAL_DARK,
  },
  wordChipText: { fontSize: 16, fontWeight: '800', color: '#2A1A0A' },
  wordChipTextSelected: { color: TEAL_DARK },

  // Text input (traducir)
  textInputContainer: {
    gap: 16,
    paddingHorizontal: 20,
  },
  textInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#2A1A0A',
  },
  textInputDisabled: {
    opacity: 0.6,
  },

  // Verdadero o Falso
  tfContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  tfStatementBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
  },
  tfStatementText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2A1A0A',
    textAlign: 'center',
    lineHeight: 24,
  },
  tfOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tfButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 4,
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E2D9',
  },
  tfButtonSelected: {
    borderColor: TEAL,
    backgroundColor: '#E0F2F1',
    borderBottomColor: TEAL_DARK,
  },
  tfButtonText: { fontSize: 16, fontWeight: '900', color: '#2A1A0A' },

  // Emparejar con imagen
  imageMatchContainer: {
    gap: 16,
  },
  wordBankExerciseContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  matchingPairsExerciseContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 20,
  },
  imageTile: {
    width: 96,
    height: 96,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
  },
  imageTileSelected: {
    borderColor: TEAL,
    backgroundColor: '#E0F2F1',
    borderBottomColor: TEAL_DARK,
  },
  imageTileEmoji: { fontSize: 44 },

  // Speaking
  speakingContainer: {
    paddingHorizontal: 20,
  },

  // Footer inferior
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
  },
  // Modal Flotante al Centro (Requisito 11)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalCardSuccess: {
    borderColor: GREEN,
  },
  modalCardDanger: {
    borderColor: RED,
  },
  modalLlamaWrap: {
    marginBottom: 12,
  },
  modalLlama: {
    width: 80,
    height: 80,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalTitleSuccess: {
    color: GREEN_DARK,
  },
  modalTitleDanger: {
    color: RED,
  },
  modalSub: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 14,
  },
  modalWordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    gap: 10,
    marginBottom: 20,
  },
  modalWordText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2A1A0A',
  },
  modalButton: {
    width: '100%',
  },

  // Review screen
  reviewCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00701A',
    textAlign: 'center',
    marginBottom: 8,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#5F6D76',
    textAlign: 'center',
    marginBottom: 16,
  },
  reviewPrompt: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A1A0A',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  reviewOption: {
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  reviewOptionSelected: {
    borderColor: TEAL,
    backgroundColor: '#E0F2F1',
  },
  reviewOptionCorrect: {
    borderColor: '#00C853',
    backgroundColor: '#E8F8F0',
  },
  reviewOptionWrong: {
    borderColor: '#E56868',
    backgroundColor: '#FDECEC',
  },
  reviewOptionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A1A0A',
    textAlign: 'center',
  },
  reviewFeedback: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
  },
  reviewFeedbackSuccess: {
    color: '#00701A',
  },
  reviewFeedbackError: {
    color: '#FF3366',
  },
  reviewActions: {
    marginTop: 4,
  },

  // Congrats screen
  congratsLlamaWrap: { marginBottom: 16 },
  congratsLlama: { width: 140, height: 145 },
  congratsTitle: { fontSize: 26, fontWeight: '900', color: '#2A1A0A', marginBottom: 6 },
  congratsSub: { fontSize: 15, color: '#7A6A5A', marginBottom: 14, textAlign: 'center' },
  streakBadge: {
    backgroundColor: '#FFF4E0',
    borderWidth: 1.5,
    borderColor: '#F5C87A',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  streakBadgeText: { fontSize: 15, fontWeight: '900', color: '#B7791F' },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E8E2D9',
  },
  statBadge: { fontSize: 15, fontWeight: '900', color: '#2A1A0A' },
  errorText: {
    color: RED,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
  },
  cultureCrossLinkCard: {
    width: '100%',
    backgroundColor: '#F3FAF8',
    borderColor: '#C7E8E0',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cultureCrossLinkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cultureCrossLinkTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00C853',
    letterSpacing: 0.8,
  },
  cultureCrossLinkEmoji: {
    fontSize: 18,
  },
  cultureCrossLinkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00701A',
    marginBottom: 4,
  },
  cultureCrossLinkDesc: {
    fontSize: 12,
    color: '#4A6266',
    lineHeight: 18,
    marginBottom: 12,
  },
  cultureCrossLinkBtn: {
    backgroundColor: '#00C853',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cultureCrossLinkBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

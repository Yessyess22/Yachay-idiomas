import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Illustrations } from '@/constants/illustrations';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { questionService } from '@/src/services/questionService';
import { QuestionOption, QuestionWithOptions } from '@/src/types';
import { AudioPronounceButton } from '@/components/yachay/audio-pronounce-button';
import { PronunciationExercise } from '@/components/yachay/exercises/pronunciation-exercise';
import { extractCorePhoneme, getQuechuaPhoneticGuide } from '@/src/utils/phoneticGuide';

type Phase = 'theory' | 'quiz';

const TEAL = '#1B8B8C';
const TEAL_DARK = '#136566';
const CREAM = '#FAF7F2';
const GOLD = '#E5A00D';
const GREEN = '#27AE60';
const GREEN_DARK = '#1E8449';
const RED = '#EA5455';
const RED_DARK = '#C0392B';

type VocabCard = { quechua: string; spanish: string };

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

function buildExerciseList(questions: QuestionWithOptions[], vocabCards: VocabCard[]): Exercise[] {
  const list: Exercise[] = [];

  // 1. Agregar preguntas normales
  questions.forEach((q, idx) => {
    const correct = q.options.find((o) => o.is_correct);
    list.push({
      kind: 'quiz',
      id: `quiz-${q.id || idx}`,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: correct?.option_text || '',
    });
  });

  // 2. Intercalar ejercicio de Listening con vocabulario
  if (vocabCards.length > 0) {
    const firstVocab = vocabCards[0];
    const otherVocabs = vocabCards.slice(1).map((v) => v.quechua);
    const distractors = otherVocabs.length >= 2 ? otherVocabs.slice(0, 2) : ['Urpi', 'Inti'];
    const listeningOptions = [
      { id: 101, text: firstVocab.quechua, is_correct: true },
      ...distractors.map((d, i) => ({ id: 102 + i, text: d, is_correct: false })),
    ].sort(() => Math.random() - 0.5);

    list.push({
      kind: 'listening',
      id: `listening-${firstVocab.quechua}`,
      prompt: 'Escucha el audio y selecciona la palabra correcta en Quechua:',
      targetWord: firstVocab.quechua,
      options: listeningOptions,
      correctAnswer: firstVocab.quechua,
    });
  }

  // 3. Agregar ejercicio de Pronunciación / Speaking
  if (vocabCards.length > 0) {
    const target = vocabCards[vocabCards.length - 1];
    const coreTarget = extractCorePhoneme(target.quechua);
    list.push({
      kind: 'speaking',
      id: `speaking-${coreTarget}`,
      prompt: 'Pronuncia en voz alta en Quechua:',
      targetWord: coreTarget,
      translation: target.spanish,
      correctAnswer: coreTarget,
    });
  }

  return list;
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id as string, 10);

  const [phase, setPhase] = useState<Phase>('theory');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabCards, setVocabCards] = useState<VocabCard[]>([]);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estado de auto-evaluación de pronunciación en teoría
  const [theoryPhase, setTheoryPhase] = useState<'practice' | 'selfeval' | 'done' | null>(null);
  const [theoryAttempts, setTheoryAttempts] = useState(0);

  // Estados de selección y feedback modal
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswerText, setCorrectAnswerText] = useState('');

  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, refreshProfile } = useAuth();
  const { lives, xp, checkAnswer, addGems } = useGame();
  const router = useRouter();

  // Animación de rebote para Yachi
  const yachiScale = useSharedValue(1);
  const yachiAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: yachiScale.value }],
  }));

  function bounceYachi() {
    yachiScale.value = withSequence(
      withSpring(1.25, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );
  }

  useEffect(() => {
    if (lessonId) loadLessonData();
  }, [lessonId]);

  async function loadLessonData() {
    setLoading(true);
    setError('');
    const { data, error } = await questionService.fetchQuestionsByLesson(lessonId);
    if (error) {
      setError(error);
    } else {
      const qs = data ?? [];
      const vCards = buildVocabCards(qs);
      setVocabCards(vCards);
      setExercises(buildExerciseList(qs, vCards));
    }
    setLoading(false);
  }

  // ─── Teoría ──────────────────────────────────────────────
  function handleVocabNext() {
    setTheoryPhase(null);
    setTheoryAttempts(0);
    if (vocabIndex + 1 < vocabCards.length) {
      setVocabIndex((i: number) => i + 1);
    } else {
      setPhase('quiz');
    }
  }

  function handleTheoryYes(corePhoneme: string) {
    setTheoryPhase('done');
    bounceYachi();
  }

  function handleTheoryNo() {
    const next = theoryAttempts + 1;
    setTheoryAttempts(next);
    if (next >= 2) {
      setTheoryPhase('done');
      bounceYachi();
    } else {
      setTheoryPhase('practice');
    }
  }

  // ─── Quiz & Ejercicios ────────────────────────────────────
  const currentExercise = exercises[currentIndex];

  function handleSelectOption(optId: number) {
    if (isAnswered) return;
    setSelectedOptionId(optId);
  }

  function handleCheckAnswer() {
    if (isAnswered || !currentExercise) return;

    let correct = false;
    let targetAnswer = currentExercise.correctAnswer;

    if (currentExercise.kind === 'quiz') {
      const selected = currentExercise.options.find((o) => o.id === selectedOptionId);
      correct = selected?.is_correct ?? false;
      const rightOpt = currentExercise.options.find((o) => o.is_correct);
      targetAnswer = rightOpt?.option_text || '';
    } else if (currentExercise.kind === 'listening') {
      const selected = currentExercise.options.find((o) => o.id === selectedOptionId);
      correct = selected?.is_correct ?? false;
      targetAnswer = currentExercise.targetWord;
    }

    setCorrectAnswerText(targetAnswer);
    setIsCorrect(correct);
    setIsAnswered(true);
    checkAnswer(correct);
    bounceYachi();
  }

  function handleSpeakingSuccess(score: number) {
    setCorrectAnswerText(currentExercise.correctAnswer);
    setIsCorrect(true);
    setIsAnswered(true);
    checkAnswer(true);
    bounceYachi();
  }

  function handleSpeakingFail() {
    setCorrectAnswerText(currentExercise.correctAnswer);
    setIsCorrect(false);
    setIsAnswered(true);
    checkAnswer(false);
    bounceYachi();
  }

  async function handleNextExercise() {
    setIsAnswered(false);
    setSelectedOptionId(null);
    setCorrectAnswerText('');
    // Nota: NO cambiar isCorrect a false aquí para evitar que el Modal muestre "Casi lo logras" durante la animación de cierre

    if (lives <= 0) {
      router.replace('/blocked' as any);
      return;
    }

    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
      addGems(15);
      const uid = user?.uid || (user as any)?.id;
      if (uid) {
        await questionService.recordLessonProgress(lessonId, uid, 10);
        await refreshProfile();
      }
    }
  }

  // ─── Estados globales de carga / error ─────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  if (error || exercises.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error || 'No se encontraron preguntas en esta lección.'}
        </Text>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Lección Completada ────────────────────────────────────
  if (completed) {
    return (
      <View style={styles.centered}>
        <Animated.View style={yachiAnimStyle}>
          <Image
            source={Illustrations.llamaSigueAsi}
            style={styles.congratsLlama}
            contentFit="contain"
          />
        </Animated.View>
        <Text style={styles.congratsTitle}>¡Lección Completada! 🎉</Text>
        <Text style={styles.congratsSub}>¡Sumaste +10 XP y +15 Yachay Coins!</Text>
        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={styles.statBadge}>❤️ {lives}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statBadge}>⚡ +10 XP</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statBadge}>🪙 +15 Coins</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Continuar al Inicio →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Fase Vocabulario / Teoría ────────────────────────────
  if (phase === 'theory') {
    if (vocabCards.length === 0) {
      setPhase('quiz');
      return null;
    }
    const card = vocabCards[vocabIndex];
    const isLast = vocabIndex + 1 >= vocabCards.length;
    const progressPct = ((vocabIndex + 1) / vocabCards.length) * 100;

    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: TEAL }]} />
          </View>
          <Text style={styles.phaseLabel}>VOCABULARIO</Text>
        </View>

        <ScrollView contentContainerStyle={styles.theoryContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.theoryYachiWrap, yachiAnimStyle]}>
            <Image
              source={Illustrations.logoYachayConLlama}
              style={styles.theoryYachi}
              contentFit="contain"
            />
          </Animated.View>

          {/* Tarjeta interactiva con audio Meta MMS-TTS y Entrenador de Pronunciación */}
          {(() => {
            // Extraer el fonema/palabra real (si card.quechua es descripción larga, sacár el fonema)
            const corePhoneme = extractCorePhoneme(card.quechua);
            const guide = getQuechuaPhoneticGuide(corePhoneme);
            const isShortWord = corePhoneme.length <= 4;
            const quechuaFontSize = corePhoneme.length === 1 ? 72
              : corePhoneme.length <= 3 ? 52
              : corePhoneme.length <= 6 ? 36
              : 24;
            return (
              <View style={styles.vocabCard}>
                {/* Significado en español */}
                <Text style={styles.vocabLabel}>Significado en español:</Text>
                <Text style={styles.vocabSpanish}>{card.spanish}</Text>

                <View style={styles.vocabDivider} />

                {/* Fonema o Palabra Quechua grande */}
                <Text style={styles.vocabLabel}>En Quechua:</Text>
                <View style={styles.theoryWordRow}>
                  <Text
                    style={[styles.vocabQuechua, { fontSize: quechuaFontSize }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {corePhoneme}
                  </Text>
                  {isShortWord && (
                    <View style={styles.theoryIpaBadge}>
                      <Text style={styles.theoryIpaText}>{guide.ipa}</Text>
                    </View>
                  )}
                </View>

                {/* Botón para escuchar síntesis auténtica */}
                <View style={styles.audioRow}>
                  <AudioPronounceButton text={corePhoneme} size="large" showLabel />
                </View>

                {/* Guía Fonética estilo "people → pipol" */}
                <View style={styles.articulatoryGuideBox}>
                  <View style={styles.articulatoryGuideHeader}>
                    <Text style={styles.articulatoryGuideIcon}>👄</Text>
                    <Text style={styles.articulatoryGuideTitle}>Cómo pronunciar</Text>
                  </View>
                  {/* Línea principal: "k → se pronuncia [k]" */}
                  <Text style={styles.phoneticSpellingText}>{guide.phoneticSpelling}</Text>
                  {/* Consejo breve SOLO si es significativamente distinto al phoneticSpelling */}
                  {guide.articulatoryTip && guide.articulatoryTip !== guide.phoneticSpelling && (
                    <Text style={styles.articulatoryGuideTip}>{guide.articulatoryTip}</Text>
                  )}
                </View>

                {/* Entrenador Interactivo — Auto-evaluación */}
                <View style={styles.theoryCoachSection}>
                  {/* Fase: Práctica (inicial y tras "no pude") */}
                  {(theoryPhase === null || theoryPhase === 'practice') && (
                    <View style={styles.theoryPracticeBox}>
                      <Text style={styles.theoryPracticeHint}>
                        🎧 Escucha el audio y di la palabra en voz alta.
                        {theoryAttempts > 0 ? '\n¡Inténtalo de nuevo!' : ''}
                      </Text>
                      <TouchableOpacity
                        style={styles.theoryTriedBtn}
                        onPress={() => setTheoryPhase('selfeval')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.theoryTriedBtnText}>🎙️ Ya lo intenté →</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Fase: Auto-evaluación */}
                  {theoryPhase === 'selfeval' && (
                    <View style={styles.theorySelfevalBox}>
                      <Text style={styles.theorySelfevalQ}>
                        ¿Pudiste pronunciar "{corePhoneme}"?
                      </Text>
                      <View style={styles.theorySelfevalBtns}>
                        <TouchableOpacity
                          style={[styles.theorySelfevalBtn, styles.theorySelfevalYes]}
                          onPress={() => handleTheoryYes(corePhoneme)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.theorySelfevalBtnText}>✅ ¡Sí!</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.theorySelfevalBtn, styles.theorySelfevalNo]}
                          onPress={handleTheoryNo}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.theorySelfevalBtnText}>
                            {theoryAttempts >= 1 ? '⏭️ Continuar' : '🔄 Practicar más'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {theoryAttempts >= 1 && (
                        <Text style={styles.theorySkipHint}>
                          Puedes continuar y practicar más adelante.
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Fase: Completado */}
                  {theoryPhase === 'done' && (
                    <View style={styles.theoryDoneBox}>
                      <Text style={styles.theoryDoneTitle}>¡Allinmi! 🌟</Text>
                      <Text style={styles.theoryDoneText}>
                        Pronunciación de "{corePhoneme}" practicada.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })()}
          <Text style={styles.theoryHint}>
            Palabra {vocabIndex + 1} de {vocabCards.length} — Escucha y practica la pronunciación antes de continuar
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleVocabNext} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{isLast ? '¡Comenzar práctica! 🚀' : 'Siguiente →'}</Text>
          </TouchableOpacity>
        </View>
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
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.livesRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={[styles.heartIcon, i >= lives && styles.heartLost]}>
              {i < lives ? '❤️' : '🖤'}
            </Text>
          ))}
          <Text style={styles.livesCountText}>{lives}</Text>
        </View>
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
              <AudioPronounceButton text={currentExercise.targetWord} size="large" showLabel />
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

        {/* ── 3. EJERCICIO SPEAKING (PRONUNCIACIÓN CON MIC) ── */}
        {currentExercise.kind === 'speaking' && (
          <View style={styles.speakingContainer}>
            <PronunciationExercise
              expectedText={currentExercise.targetWord}
              translation={currentExercise.translation}
              onSuccess={handleSpeakingSuccess}
              onFail={handleSpeakingFail}
            />
          </View>
        )}
      </ScrollView>

      {/* Footer inferior (botón comprobar solo para quiz y listening) */}
      {currentExercise.kind !== 'speaking' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.buttonPrimary, !selectedOptionId && styles.buttonDisabled]}
            onPress={handleCheckAnswer}
            disabled={!selectedOptionId}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>COMPROBAR</Text>
          </TouchableOpacity>
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
            <Animated.View style={yachiAnimStyle}>
              <Image
                source={isCorrect ? Illustrations.llamaExcelente : Illustrations.llamaPiensa}
                style={styles.modalLlama}
                contentFit="contain"
              />
            </Animated.View>

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
                ? '+10 XP ganados en este ejercicio'
                : 'La respuesta correcta en Quechua es:'}
            </Text>

            {/* Notificación de vida perdida */}
            {!isCorrect && (
              <View style={styles.livesLostBadge}>
                <Text style={styles.livesLostText}>
                  💔 -1 Vida • Te quedan {lives} {lives === 1 ? 'vida' : 'vidas'}
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
            <TouchableOpacity
              style={[
                styles.modalButton,
                isCorrect ? styles.modalBtnSuccess : styles.modalBtnDanger,
              ]}
              onPress={handleNextExercise}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>
                {isCorrect ? '¡Continuar! →' : 'Entendido'}
              </Text>
            </TouchableOpacity>
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
  progressBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: '#E8E2D9',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 7,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: 1,
  },
  livesRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  heartIcon: { fontSize: 16 },
  heartLost: { opacity: 0.3 },
  livesCountText: { fontSize: 13, fontWeight: '900', color: '#C0392B', marginLeft: 4 },
  livesLostBadge: {
    backgroundColor: '#FDEDEC',
    borderColor: '#F5B7B1',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginVertical: 8,
    alignItems: 'center',
  },
  livesLostText: {
    color: '#C0392B',
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
  listeningHint: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },

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
  buttonPrimary: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: GREEN_DARK,
  },
  buttonDisabled: { backgroundColor: '#D8D8D8', borderBottomColor: '#B0B0B0' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },

  // Vocab card
  theoryContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingBottom: 50,
  },
  theoryYachiWrap: { marginBottom: 20 },
  theoryYachi: { width: 130, height: 130 },
  vocabCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    borderWidth: 2,
    borderColor: TEAL,
    borderBottomWidth: 5,
    marginBottom: 16,
    alignItems: 'center',
  },
  vocabLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#8A8A8A',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  vocabSpanish: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2A1A0A',
    textAlign: 'center',
  },
  vocabDivider: {
    width: 48,
    height: 3,
    backgroundColor: TEAL,
    borderRadius: 2,
    marginVertical: 14,
  },
  vocabQuechua: {
    fontSize: 32,
    fontWeight: '900',
    color: TEAL,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  theoryWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 4,
  },
  theoryIpaBadge: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#B2DFDB',
  },
  theoryIpaText: {
    fontSize: 16,
    fontWeight: '800',
    color: TEAL,
  },
  audioRow: {
    marginTop: 12,
    marginBottom: 8,
  },
  articulatoryGuideBox: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E8DFD5',
    marginVertical: 12,
  },
  articulatoryGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  articulatoryGuideIcon: {
    fontSize: 18,
  },
  articulatoryGuideTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6A5545',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articulatoryGuideTip: {
    fontSize: 13,
    color: '#4A3B32',
    lineHeight: 19,
    fontWeight: '500',
    marginTop: 6,
  },
  phoneticSpellingText: {
    fontSize: 15,
    fontWeight: '800',
    color: TEAL,
    lineHeight: 22,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  articulatoryExampleRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEAE3',
  },
  articulatoryExampleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A7565',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  articulatoryExampleText: {
    fontSize: 13,
    color: '#3A2E26',
  },
  theoryCoachSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },

  theoryPracticeBox: {
    alignItems: 'center',
    gap: 10,
  },
  theoryPracticeHint: {
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 19,
  },
  theoryTriedBtn: {
    backgroundColor: TEAL,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  theoryTriedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  theorySelfevalBox: {
    alignItems: 'center',
    gap: 10,
  },
  theorySelfevalQ: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  theorySelfevalBtns: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  theorySelfevalBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 160,
    elevation: 2,
  },
  theorySelfevalYes: {
    backgroundColor: GREEN,
    borderBottomWidth: 3,
    borderBottomColor: GREEN_DARK,
  },
  theorySelfevalNo: {
    backgroundColor: GOLD,
    borderBottomWidth: 3,
    borderBottomColor: '#B7860A',
  },
  theorySelfevalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  theorySkipHint: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  theoryDoneBox: {
    width: '100%',
    backgroundColor: '#E8F8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  theoryDoneTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: GREEN,
    marginBottom: 2,
  },
  theoryDoneText: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
  },
  feedbackPass: {
    backgroundColor: '#E8F8F0',
    borderColor: GREEN,
  },
  feedbackRetry: {
    backgroundColor: '#FFF8E7',
    borderColor: GOLD,
  },
  boldText: {
    fontWeight: '700',
    color: '#222222',
  },
  theoryHint: { fontSize: 13, color: '#7A6A5A', fontWeight: '700', marginTop: 8 },

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
  modalLlama: {
    width: 80,
    height: 80,
    marginBottom: 12,
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
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
  },
  modalBtnSuccess: {
    backgroundColor: GREEN,
    borderBottomColor: GREEN_DARK,
  },
  modalBtnDanger: {
    backgroundColor: RED,
    borderBottomColor: RED_DARK,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  // Congrats screen
  congratsLlama: { width: 140, height: 145, marginBottom: 16 },
  congratsTitle: { fontSize: 26, fontWeight: '900', color: '#2A1A0A', marginBottom: 6 },
  congratsSub: { fontSize: 15, color: '#7A6A5A', marginBottom: 20, textAlign: 'center' },
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
});

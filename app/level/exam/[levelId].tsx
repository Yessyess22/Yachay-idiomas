import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Illustrations } from '@/constants/illustrations';
import { BrandColors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { examService } from '@/src/services/examService';
import { progressService } from '@/src/services/progressService';
import { leaderboardService } from '@/src/services/leaderboardService';
import { questService } from '@/src/services/questService';
import { playQuechuaAudio } from '@/src/services/voiceService';
import { playCorrectSound, playIncorrectSound, playCompleteSound, playTapSound } from '@/src/services/soundService';
import { ExamWithQuestions, QuestionOption, QuestionWithOptions } from '@/src/types';
import { useYachiBounce } from '@/hooks/use-yachi-bounce';
import { MatchingPairsExercise } from '@/components/yachay/exercises/matching-pairs-exercise';
import { WordBankExercise } from '@/components/yachay/exercises/word-bank-exercise';
import { PronunciationExercise } from '@/components/yachay/exercises/pronunciation-exercise';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#FFB300';
const CREAM = '#FAF7F2';
const RED = '#FF3366';
const GREEN = '#00C853';
const MUTED = '#64748B';

export default function LevelExamScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const parsedLevelId = parseInt(levelId as string, 10);

  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  const [phase, setPhase] = useState<'briefing' | 'exam' | 'reinforcement' | 'result'>('briefing');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ronda de refuerzo para preguntas falladas
  const [missedQuestions, setMissedQuestions] = useState<QuestionWithOptions[]>([]);
  const [reinforcementIndex, setReinforcementIndex] = useState(0);

  // Estados de respuesta por pregunta
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { user } = useAuth();
  const { addXp, addGems } = useGame();
  const router = useRouter();

  const { style: yachiAnimStyle, bounce: bounceYachi, celebrate: celebrateYachi } = useYachiBounce();

  useEffect(() => {
    let isMounted = true;
    examService.fetchExamByLevel(parsedLevelId).then(({ data, error: err }) => {
      if (!isMounted) return;
      if (err || !data) {
        setError(err ?? 'No se encontró el examen.');
      } else {
        setExam(data);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [parsedLevelId]);

  const activeQuestionList = phase === 'reinforcement' ? missedQuestions : (exam?.questions || []);
  const activeIndex = phase === 'reinforcement' ? reinforcementIndex : currentIndex;
  const currentQuestion: QuestionWithOptions | undefined = activeQuestionList[activeIndex];

  // Reproducir audio automáticamente en preguntas de listening
  useEffect(() => {
    if ((phase === 'exam' || phase === 'reinforcement') && currentQuestion?.question_type === 'listening' && currentQuestion.audioWord) {
      setIsPlayingAudio(true);
      playQuechuaAudio(currentQuestion.audioWord)
        .catch(() => {})
        .finally(() => setIsPlayingAudio(false));
    }
  }, [activeIndex, phase, currentQuestion]);

  function playAudio(slow = false) {
    if (!currentQuestion?.audioWord || isPlayingAudio) return;
    playTapSound();
    setIsPlayingAudio(true);
    playQuechuaAudio(currentQuestion.audioWord, { slow })
      .catch(() => {})
      .finally(() => setIsPlayingAudio(false));
  }

  function handleSelectOption(option: QuestionOption) {
    if (isAnswered) return;
    playTapSound();
    setSelectedOption(option);
  }

  function registerMissedQuestion(q: QuestionWithOptions) {
    if (phase === 'exam') {
      setMissedQuestions((prev) => {
        if (prev.some((item) => item.id === q.id)) return prev;
        return [...prev, q];
      });
    }
  }

  function handleCheckOption() {
    if (!selectedOption || isAnswered || !currentQuestion) return;
    const correct = selectedOption.is_correct;
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      if (phase === 'exam') setCorrectCount((n) => n + 1);
      bounceYachi();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playCorrectSound();
    } else {
      registerMissedQuestion(currentQuestion);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      playIncorrectSound();
    }
  }

  function handleInteractiveResult(correct: boolean) {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      if (phase === 'exam') setCorrectCount((n) => n + 1);
      bounceYachi();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playCorrectSound();
    } else {
      registerMissedQuestion(currentQuestion);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      playIncorrectSound();
    }
  }

  function handleSpeakingResult(score: number) {
    if (isAnswered || !currentQuestion) return;
    const correct = score >= 60;
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      if (phase === 'exam') setCorrectCount((n) => n + 1);
      bounceYachi();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playCorrectSound();
    } else {
      registerMissedQuestion(currentQuestion);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      playIncorrectSound();
    }
  }

  async function finalizeExam() {
    if (!exam) return;
    setSaving(true);
    const total = exam.questions.length;
    const score = Math.round((correctCount / total) * 100);
    const didPass = score >= exam.pass_threshold;
    setPassed(didPass);

    if (didPass) {
      celebrateYachi();
      playCompleteSound();
      addXp(50);
      addGems(30);
    } else {
      playIncorrectSound();
    }

    if (user?.uid) {
      await progressService.recordExamResult(user.uid, parsedLevelId, score, exam.pass_threshold);
      if (didPass) {
        await progressService.unlockNextLevel(user.uid, parsedLevelId + 1);
        leaderboardService.recordWeeklyXp(user.uid, 50).catch(() => {});
        questService.updateQuestProgress(user.uid, 'xp_gain', 50).catch(() => {});
      }
    }

    setSaving(false);
    setPhase('result');
  }

  async function handleNextQuestion() {
    if (!exam) return;

    if (phase === 'exam') {
      if (currentIndex + 1 < exam.questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(false);
      } else {
        // Fin de la primera vuelta: si hay preguntas falladas, pasar a la ronda de refuerzo
        if (missedQuestions.length > 0) {
          setPhase('reinforcement');
          setReinforcementIndex(0);
          setSelectedOption(null);
          setIsAnswered(false);
          setIsCorrect(false);
        } else {
          await finalizeExam();
        }
      }
    } else if (phase === 'reinforcement') {
      if (reinforcementIndex + 1 < missedQuestions.length) {
        setReinforcementIndex((i) => i + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(false);
      } else {
        // Ronda de refuerzo terminada
        await finalizeExam();
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>Preparando el examen…</Text>
      </View>
    );
  }

  if (error || !exam) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Examen no disponible.'}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (saving) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.savingText}>Calificando tu examen…</Text>
      </View>
    );
  }

  // ─── PANTALLA 1: BRIEFING PREVIO DEL EXAMEN ────────────────
  if (phase === 'briefing') {
    return (
      <View style={styles.container}>
        <View style={styles.briefingHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.examTag}>EVALUACIÓN SUMATIVA</Text>
        </View>

        <ScrollView contentContainerStyle={styles.briefingScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.briefingCard}>
            <Text style={styles.briefingIcon}>👑</Text>
            <Text style={styles.briefingTitle}>{exam.title}</Text>
            <Text style={styles.briefingSubtitle}>
              Demuestra tu sabiduría en esta prueba integral de nivel.
            </Text>

            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>📋 Reglas del examen:</Text>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  {exam.questions.length} preguntas dinámicas (selección, audios, micrófono, pares y frases).
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Nota mínima para aprobar: <Text style={styles.ruleBold}>{exam.pass_threshold}%</Text>.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Ronda de Refuerzo final para repasar cualquier respuesta incorrecta.
                </Text>
              </View>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleBullet}>•</Text>
                <Text style={styles.ruleText}>
                  Recompensa al superar el nivel: <Text style={styles.ruleGold}>+50 XP • +30 Gemas 💎</Text>.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startExamBtn}
              onPress={() => setPhase('exam')}
              activeOpacity={0.88}
            >
              <Text style={styles.startExamBtnText}>¡Comenzar Examen de Nivel! ➔</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── PANTALLA 3: RESULTADOS DEL EXAMEN ────────────────────
  if (phase === 'result') {
    const score = Math.round((correctCount / exam.questions.length) * 100);
    return (
      <View style={styles.centered}>
        <Animated.View style={yachiAnimStyle}>
          <Image
            source={passed ? Illustrations.llamaExcelente : Illustrations.llamaPiensa}
            style={styles.resultYachi}
            contentFit="contain"
          />
        </Animated.View>
        <Text style={styles.resultTitle}>{passed ? '¡Nivel Superado con Éxito!' : 'Sigue practicando'}</Text>
        <Text style={styles.resultScore}>
          {correctCount} de {exam.questions.length} respuestas correctas — {score}%
        </Text>
        <Text style={styles.resultThreshold}>
          Nota mínima requerida: {exam.pass_threshold}%
        </Text>
        {passed && (
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardsText}>🎉 Recompensa: +50 XP • +30 Gemas 💎</Text>
          </View>
        )}
        {passed && parsedLevelId === 3 ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#D97706', marginBottom: 10 }]}
            onPress={() => router.replace('/certificate' as any)}
          >
            <Text style={styles.primaryBtnText}>🎓 ¡Ver mi Diploma de Graduación! ➔</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.primaryBtn, passed ? styles.btnSuccess : styles.btnDanger]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.primaryBtnText}>{passed ? 'Continuar en tu Ruta ➔' : 'Volver a Repasar'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── PANTALLA 2: EJECUCIÓN DEL EXAMEN / REFUERZO ──────────
  if (!currentQuestion) return null;

  const totalQuestions = phase === 'reinforcement' ? missedQuestions.length : exam.questions.length;
  const progress = ((activeIndex + 1) / totalQuestions) * 100;
  const isInteractive =
    currentQuestion.question_type === 'matching_pairs' ||
    currentQuestion.question_type === 'word_bank' ||
    currentQuestion.question_type === 'speaking';

  return (
    <View style={styles.container}>
      {/* Header con progreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              phase === 'reinforcement' && styles.progressFillReinforcement,
            ]}
          />
        </View>
        <Text style={styles.examCounter}>
          {activeIndex + 1}/{totalQuestions}
        </Text>
      </View>

      {/* Banner de Ronda de Refuerzo */}
      {phase === 'reinforcement' && (
        <View style={styles.reinforcementBanner}>
          <Text style={styles.reinforcementIcon}>🎯</Text>
          <View style={styles.reinforcementCopy}>
            <Text style={styles.reinforcementTitle}>Ronda de Refuerzo</Text>
            <Text style={styles.reinforcementDesc}>
              ¡Repasemos esta pregunta para consolidar tu conocimiento!
            </Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.examScroll} showsVerticalScrollIndicator={false}>
        {/* Título de la pregunta */}
        <View style={styles.questionWrap}>
          <Text style={styles.questionTypeTag}>
            {currentQuestion.question_type === 'speaking'
              ? '🎙️ PRÁCTICA DE PRONUNCIACIÓN'
              : currentQuestion.question_type === 'listening'
              ? '🎧 COMPRENSIÓN AUDITIVA'
              : currentQuestion.question_type === 'matching_pairs'
              ? '🔄 EMPAREJAR PARES'
              : currentQuestion.question_type === 'word_bank'
              ? '🧩 ORDENAR PALABRAS'
              : currentQuestion.question_type === 'fill_blank'
              ? '✍️ COMPLETAR PALABRA'
              : '❓ PREGUNTA CONCEPTUAL'}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
        </View>

        {/* Reproductor en preguntas de listening */}
        {currentQuestion.question_type === 'listening' && currentQuestion.audioWord && (
          <View style={styles.audioPlayerCard}>
            <Text style={styles.audioPlayerPrompt}>Escucha la pronunciación:</Text>
            <View style={styles.audioButtonsRow}>
              <TouchableOpacity
                style={[styles.audioPlayBtn, isPlayingAudio && styles.audioPlaying]}
                onPress={() => playAudio(false)}
                activeOpacity={0.82}
              >
                <Text style={styles.audioPlayIcon}>🔊</Text>
                <Text style={styles.audioPlayText}>Escuchar normal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.audioPlayBtnSlow, isPlayingAudio && styles.audioPlaying]}
                onPress={() => playAudio(true)}
                activeOpacity={0.82}
              >
                <Text style={styles.audioPlayIcon}>🐢</Text>
                <Text style={styles.audioPlayText}>Escuchar lento</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ejercicio interactivo: Speaking con micrófono */}
        {currentQuestion.question_type === 'speaking' && (
          <View style={styles.interactiveBox}>
            <PronunciationExercise
              key={`speaking-${currentQuestion.id}-${activeIndex}`}
              expectedText={currentQuestion.targetWord || currentQuestion.prompt}
              translation={currentQuestion.translation}
              isPhrase={(currentQuestion.targetWord || '').includes(' ')}
              onSuccess={(score) => handleSpeakingResult(score)}
              onFail={() => handleSpeakingResult(0)}
            />
          </View>
        )}

        {/* Ejercicio interactivo: Matching Pairs */}
        {currentQuestion.question_type === 'matching_pairs' && currentQuestion.pairs && (
          <View style={styles.interactiveBox}>
            <MatchingPairsExercise
              key={`matching-${currentQuestion.id}-${activeIndex}`}
              pairs={currentQuestion.pairs}
              onComplete={handleInteractiveResult}
              onWrongMatch={() => {
                bounceYachi();
                playIncorrectSound();
              }}
              disabled={isAnswered}
            />
          </View>
        )}

        {/* Ejercicio interactivo: Word Bank */}
        {currentQuestion.question_type === 'word_bank' && currentQuestion.words && currentQuestion.correctSentence && (
          <View style={styles.interactiveBox}>
            <WordBankExercise
              key={`wordbank-${currentQuestion.id}-${activeIndex}`}
              prompt={currentQuestion.prompt}
              correctSentence={currentQuestion.correctSentence}
              words={currentQuestion.words}
              onCheck={handleInteractiveResult}
              disabled={isAnswered}
            />
          </View>
        )}

        {/* Opciones de selección para multiple_choice, fill_blank y listening */}
        {!isInteractive && (
          <View style={styles.optionsList}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionCard,
                    isSelected && !isAnswered && styles.optionSelected,
                    isAnswered && isSelected && (isCorrect ? styles.optionCorrect : styles.optionWrong),
                    isAnswered && !isSelected && opt.is_correct && styles.optionCorrect,
                  ]}
                  onPress={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      isAnswered && (opt.is_correct || isSelected) && styles.optionTextResult,
                    ]}
                  >
                    {opt.option_text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer de acción y retroalimentación */}
      <View
        style={[
          styles.footer,
          isAnswered && (isCorrect ? styles.footerSuccess : styles.footerError),
        ]}
      >
        {isAnswered ? (
          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackEmoji}>{isCorrect ? '🌟' : '💡'}</Text>
              <View style={styles.feedbackCopy}>
                <Text
                  style={[
                    styles.feedbackTitle,
                    isCorrect ? styles.textSuccess : styles.textError,
                  ]}
                >
                  {isCorrect ? '¡Excelente respuesta!' : 'Respuesta incorrecta'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isCorrect ? styles.btnSuccess : styles.btnDanger,
              ]}
              onPress={handleNextQuestion}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>
                {activeIndex + 1 < totalQuestions
                  ? 'Siguiente Pregunta ➔'
                  : phase === 'exam' && missedQuestions.length > 0
                  ? 'Ir a Ronda de Refuerzo ➔'
                  : 'Ver Calificación Final ➔'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : !isInteractive ? (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              !selectedOption && styles.primaryBtnDisabled,
            ]}
            onPress={handleCheckOption}
            disabled={!selectedOption}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Comprobar Respuesta</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF8F3',
    paddingTop: 44,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FBF8F3',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: MUTED,
    fontWeight: '600',
  },
  savingText: {
    marginTop: 12,
    fontSize: 15,
    color: TEAL_DARK,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: RED,
    textAlign: 'center',
    marginBottom: 16,
  },

  // ─── BRIEFING SCREEN ──────────────────────────────────────
  briefingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 22,
    color: MUTED,
    fontWeight: '800',
  },
  examTag: {
    fontSize: 12,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 0.8,
  },
  briefingScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
  },
  briefingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#EBDCB9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  briefingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  briefingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2A241E',
    textAlign: 'center',
    marginBottom: 6,
  },
  briefingSubtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  rulesBox: {
    backgroundColor: '#FFFDF7',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F2E4C2',
    width: '100%',
    marginBottom: 24,
    gap: 10,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A322A',
    marginBottom: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleBullet: {
    fontSize: 16,
    color: GOLD,
    fontWeight: '900',
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: '#55514B',
    lineHeight: 18,
  },
  ruleBold: {
    fontWeight: '800',
    color: TEAL_DARK,
  },
  ruleGold: {
    fontWeight: '800',
    color: '#B7791F',
  },
  startExamBtn: {
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  startExamBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  // ─── EXAM RUNNER HEADER ───────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  progressBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#EAE3D6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 5,
  },
  progressFillReinforcement: {
    backgroundColor: '#E67E22',
  },
  examCounter: {
    fontSize: 13,
    fontWeight: '800',
    color: MUTED,
  },

  reinforcementBanner: {
    backgroundColor: '#FEF5E7',
    borderWidth: 1.5,
    borderColor: '#FAD7A0',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reinforcementIcon: {
    fontSize: 24,
  },
  reinforcementCopy: {
    flex: 1,
  },
  reinforcementTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B9770E',
  },
  reinforcementDesc: {
    fontSize: 12,
    color: '#7E5109',
    marginTop: 2,
    lineHeight: 16,
  },

  examScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
  },
  questionWrap: {
    marginBottom: 20,
  },
  questionTypeTag: {
    fontSize: 11,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2A241E',
    lineHeight: 28,
  },

  audioPlayerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E8DFD3',
    marginBottom: 20,
    alignItems: 'center',
    gap: 10,
  },
  audioPlayerPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
  },
  audioButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  audioPlayBtn: {
    flex: 1,
    backgroundColor: '#E8F5F5',
    borderColor: '#BEE3E3',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  audioPlayBtnSlow: {
    flex: 1,
    backgroundColor: '#FFF9E6',
    borderColor: '#FCE7A6',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  audioPlaying: {
    opacity: 0.6,
  },
  audioPlayIcon: {
    fontSize: 16,
  },
  audioPlayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C2B29',
  },

  interactiveBox: {
    marginBottom: 20,
  },

  optionsList: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E8E1D5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  optionSelected: {
    borderColor: TEAL,
    backgroundColor: '#EBF6F6',
  },
  optionCorrect: {
    borderColor: GREEN,
    backgroundColor: '#E8F5E9',
  },
  optionWrong: {
    borderColor: RED,
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A241E',
  },
  optionTextSelected: {
    color: TEAL_DARK,
    fontWeight: '800',
  },
  optionTextResult: {
    fontWeight: '800',
  },

  // ─── FOOTER ───────────────────────────────────────────────
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E1D5',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  footerSuccess: {
    backgroundColor: '#E8F8F5',
    borderTopColor: '#A3E4D7',
  },
  footerError: {
    backgroundColor: '#FDEDEC',
    borderTopColor: '#FADBD8',
  },
  feedbackContainer: {
    gap: 14,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedbackEmoji: {
    fontSize: 26,
  },
  feedbackCopy: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  textSuccess: {
    color: '#117A65',
  },
  textError: {
    color: '#922B21',
  },

  primaryBtn: {
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnDisabled: {
    backgroundColor: '#D1CAC0',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnSuccess: {
    backgroundColor: TEAL,
  },
  btnDanger: {
    backgroundColor: '#E67E22',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // ─── RESULTADOS ───────────────────────────────────────────
  resultYachi: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2A241E',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 17,
    fontWeight: '700',
    color: TEAL_DARK,
    marginBottom: 4,
    textAlign: 'center',
  },
  resultThreshold: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardBadge: {
    backgroundColor: '#FEF9E7',
    borderWidth: 1.5,
    borderColor: '#F9E79F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
  },
  rewardsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B7791F',
    textAlign: 'center',
  },
});

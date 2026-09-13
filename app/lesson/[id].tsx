import { Illustrations } from '@/constants/illustrations';
import { BrandColors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { questionService } from '@/src/services/questionService';
import { QuestionOption, QuestionWithOptions } from '@/src/types';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

type Phase = 'theory' | 'quiz';

const TEAL = '#1B8B8C';
const CREAM = '#FAF7F2';
const GOLD = '#E5A00D';
const GREEN = '#27AE60';
const RED = '#EA5455';

// Deriva tarjetas de teoría a partir de las preguntas de la lección
function buildTheoryCards(questions: QuestionWithOptions[], lessonTitle: string) {
  const uniqueTerms = Array.from(
    new Map(
      questions
        .filter((q) => q.prompt.includes('→') || q.prompt.includes('-'))
        .slice(0, 3)
        .map((q) => [q.prompt, q.prompt])
    ).values()
  );

  return [
    { title: lessonTitle, body: 'Repasa el vocabulario andino antes de comenzar la lección.' },
    ...uniqueTerms.map((term) => ({ title: 'Vocabulario Clave', body: term })),
  ];
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id as string, 10);

  const [phase, setPhase] = useState<Phase>('theory');
  const [theoryIndex, setTheoryIndex] = useState(0);
  const [theoryCards, setTheoryCards] = useState<{ title: string; body: string }[]>([]);

  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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
    if (lessonId) loadQuestions();
  }, [lessonId]);

  async function loadQuestions() {
    setLoading(true);
    setError('');
    const { data, error } = await questionService.fetchQuestionsByLesson(lessonId);
    if (error) {
      setError(error);
    } else {
      const qs = data ?? [];
      setQuestions(qs);
      setTheoryCards(buildTheoryCards(qs, `Lección ${lessonId}`));
    }
    setLoading(false);
  }

  // ─── Teoría ──────────────────────────────────────────────
  function handleTheoryNext() {
    if (theoryIndex + 1 < theoryCards.length) {
      setTheoryIndex((i) => i + 1);
    } else {
      setPhase('quiz');
    }
  }

  // ─── Quiz ─────────────────────────────────────────────────
  function handleSelectOption(option: QuestionOption) {
    if (isAnswered) return;
    setSelectedOption(option);
  }

  function handleCheckAnswer() {
    if (!selectedOption || isAnswered) return;
    const correct = selectedOption.is_correct;
    setIsAnswered(true);
    setIsCorrect(correct);
    checkAnswer(correct);
    bounceYachi();
  }

  async function handleNextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
      addGems(15);
      if (user?.id) {
        await questionService.recordLessonProgress(lessonId, user.id, 10);
        await refreshProfile();
      }
    }
  }

  // ─── Estados globales ─────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  if (error || questions.length === 0) {
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
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Continuar al Inicio →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Fase Teoría ──────────────────────────────────────────
  if (phase === 'theory') {
    const card = theoryCards[theoryIndex];
    const isLast = theoryIndex + 1 >= theoryCards.length;
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${((theoryIndex + 1) / theoryCards.length) * 100}%`,
                  backgroundColor: TEAL,
                },
              ]}
            />
          </View>
          <Text style={styles.phaseLabel}>TEORÍA</Text>
        </View>

        <ScrollView contentContainerStyle={styles.theoryContent}>
          <Animated.View style={[styles.theoryYachiWrap, yachiAnimStyle]}>
            <Image
              source={Illustrations.logoYachayConLlama}
              style={styles.theoryYachi}
              contentFit="contain"
            />
          </Animated.View>
          <View style={styles.theoryCard}>
            <Text style={styles.theoryCardTitle}>{card.title}</Text>
            <Text style={styles.theoryCardBody}>{card.body}</Text>
          </View>
          <Text style={styles.theoryHint}>
            Paso {theoryIndex + 1} de {theoryCards.length}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleTheoryNext}>
            <Text style={styles.buttonText}>{isLast ? '¡Comenzar Quiz! 🚀' : 'Siguiente →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Fase Quiz ────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* TopBar Duolingo Style */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.livesRow}>
          {Array.from({ length: lives }).map((_, i) => (
            <Text key={i} style={styles.heartIcon}>
              ❤️
            </Text>
          ))}
        </View>
      </View>

      {/* Mascota Yachi con Speech Bubble */}
      <View style={styles.mascotSpeechRow}>
        <Animated.View style={yachiAnimStyle}>
          <Image
            source={Illustrations.llamaPregunta}
            style={styles.mascotImg}
            contentFit="contain"
          />
        </Animated.View>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>Selecciona la opción correcta en Quechua:</Text>
        </View>
      </View>

      {/* Pregunta */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>
      </View>

      {/* Opciones */}
      <View style={styles.optionsList}>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOption?.id === option.id;
          let cardStyle = styles.optionCard;
          if (isSelected) cardStyle = styles.optionSelected;
          if (isAnswered && isSelected) {
            cardStyle = isCorrect ? styles.optionCorrect : styles.optionIncorrect;
          } else if (isAnswered && option.is_correct) {
            cardStyle = styles.optionCorrect;
          }

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionBase, cardStyle]}
              onPress={() => handleSelectOption(option)}
              disabled={isAnswered}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  isAnswered && option.is_correct && styles.optionTextCorrect,
                ]}
              >
                {option.option_text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Footer Action Bar */}
      <View
        style={[
          styles.footer,
          isAnswered && (isCorrect ? styles.footerSuccess : styles.footerDanger),
        ]}
      >
        {isAnswered ? (
          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackRow}>
              <Animated.View style={yachiAnimStyle}>
                <Image
                  source={isCorrect ? Illustrations.llamaExcelente : Illustrations.llamaPiensa}
                  style={styles.feedbackLlama}
                  contentFit="contain"
                />
              </Animated.View>
              <View>
                <Text
                  style={[
                    styles.feedbackTitle,
                    isCorrect ? styles.textSuccess : styles.textDanger,
                  ]}
                >
                  {isCorrect ? '¡Excelente! Allinmi! 🌟' : '¡Casi! Inténtalo de nuevo'}
                </Text>
                <Text style={styles.feedbackSub}>
                  {isCorrect
                    ? '+10 XP ganados en este ejercicio'
                    : 'La respuesta correcta está destacada en verde'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.buttonPrimary, isCorrect ? styles.btnSuccess : styles.btnDanger]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.buttonText}>Siguiente →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.buttonPrimary, !selectedOption && styles.buttonDisabled]}
            onPress={handleCheckAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.buttonText}>COMPROBAR</Text>
          </TouchableOpacity>
        )}
      </View>
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
  livesRow: { flexDirection: 'row', gap: 2 },
  heartIcon: { fontSize: 16 },

  // Mascot row
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
  speechText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A1A0A',
  },

  // Teoría
  theoryContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  theoryYachiWrap: { marginBottom: 20 },
  theoryYachi: { width: 130, height: 130 },
  theoryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: TEAL,
    borderBottomWidth: 4,
    marginBottom: 16,
  },
  theoryCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: TEAL,
    marginBottom: 10,
  },
  theoryCardBody: { fontSize: 16, color: '#2A1A0A', lineHeight: 24 },
  theoryHint: { fontSize: 13, color: '#7A6A5A', fontWeight: '700', marginTop: 8 },

  // Quiz
  questionContainer: { paddingHorizontal: 20, marginBottom: 20 },
  questionPrompt: { fontSize: 22, fontWeight: '900', color: '#2A1A0A', lineHeight: 30 },
  optionsList: { flex: 1, paddingHorizontal: 20 },
  optionBase: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderBottomWidth: 4,
  },
  optionCard: {},
  optionSelected: { borderColor: '#1CB0F6', backgroundColor: '#EBF7FF', borderBottomColor: '#1899D6' },
  optionCorrect: { borderColor: GREEN, backgroundColor: '#E8F6EF', borderBottomColor: '#1E8449' },
  optionIncorrect: { borderColor: RED, backgroundColor: '#FCEBEB', borderBottomColor: '#C0392B' },
  optionText: { fontSize: 17, fontWeight: '700', color: '#2A1A0A' },
  optionTextSelected: { color: '#1899D6' },
  optionTextCorrect: { color: '#1E8449' },

  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#E8E2D9',
    backgroundColor: '#FFFFFF',
  },
  footerSuccess: { backgroundColor: '#E8F6EF', borderColor: GREEN },
  footerDanger: { backgroundColor: '#FCEBEB', borderColor: RED },
  feedbackContainer: { alignItems: 'stretch' },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  feedbackLlama: { width: 56, height: 56, borderRadius: 28 },
  feedbackTitle: { fontSize: 19, fontWeight: '900' },
  feedbackSub: { fontSize: 12, color: '#7A6A5A', marginTop: 2 },
  textSuccess: { color: GREEN },
  textDanger: { color: RED },

  buttonPrimary: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#1E8449',
  },
  btnSuccess: { backgroundColor: GREEN, borderBottomColor: '#1E8449' },
  btnDanger: { backgroundColor: RED, borderBottomColor: '#C0392B' },
  buttonDisabled: { backgroundColor: '#D8D8D8', borderBottomColor: '#B0B0B0' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },

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

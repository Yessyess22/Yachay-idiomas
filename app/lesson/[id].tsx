import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { questionService } from '@/src/services/questionService';
import { QuestionOption, QuestionWithOptions } from '@/src/types';
import { Illustrations } from '@/constants/illustrations';
import { BrandColors } from '@/src/constants/theme';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
  withTiming,
} from 'react-native-reanimated';

type Phase = 'theory' | 'quiz';

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
    { title: lessonTitle, body: 'Repasa el vocabulario antes de comenzar el quiz.' },
    ...uniqueTerms.map((term) => ({ title: 'Vocabulario', body: term })),
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
        <ActivityIndicator size="large" color={BrandColors.brandGreen} />
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
        <Text style={styles.congratsTitle}>¡Lección Completada!</Text>
        <Text style={styles.congratsSub}>Has ganado +10 XP en Quechua</Text>
        <View style={styles.statRow}>
          <Text style={styles.statBadge}>❤️ {lives}</Text>
          <Text style={styles.statBadge}>⚡ {xp} XP</Text>
        </View>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Continuar</Text>
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
                  backgroundColor: BrandColors.brandNavy,
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
            {theoryIndex + 1} / {theoryCards.length}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleTheoryNext}>
            <Text style={styles.buttonText}>{isLast ? '¡Comenzar Quiz!' : 'Siguiente →'}</Text>
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
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.livesRow}>
          {Array.from({ length: lives }).map((_, i) => (
            <Text key={i} style={styles.heartIcon}>❤️</Text>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionPrompt}>{currentQuestion.prompt}</Text>
      </View>

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
              <Text
                style={[
                  styles.feedbackTitle,
                  isCorrect ? styles.textSuccess : styles.textDanger,
                ]}
              >
                {isCorrect ? '¡Excelente!' : 'Respuesta incorrecta'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.buttonPrimary,
                isCorrect ? styles.btnSuccess : styles.btnDanger,
              ]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.buttonPrimary, !selectedOption && styles.buttonDisabled]}
            onPress={handleCheckAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.buttonText}>Comprobar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: 50 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  closeBtn: { marginRight: 8 },
  closeBtnText: { fontSize: 22, color: '#aaa', fontWeight: 'bold' },
  progressBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e5e5',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BrandColors.success,
    borderRadius: 7,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.brandNavy,
    letterSpacing: 1,
  },
  livesRow: { flexDirection: 'row', gap: 2 },
  heartIcon: { fontSize: 14 },

  // Teoría
  theoryContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  theoryYachiWrap: { marginBottom: 24 },
  theoryYachi: { width: 120, height: 120 },
  theoryCard: {
    width: '100%',
    backgroundColor: BrandColors.bgLight,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: BrandColors.brandGreen + '40',
    marginBottom: 16,
  },
  theoryCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.brandNavy,
    marginBottom: 10,
  },
  theoryCardBody: { fontSize: 16, color: '#444', lineHeight: 24 },
  theoryHint: { fontSize: 13, color: '#bbb', marginTop: 8 },

  // Quiz
  questionContainer: { paddingHorizontal: 24, marginBottom: 24 },
  questionPrompt: { fontSize: 22, fontWeight: 'bold', color: '#333', lineHeight: 30 },
  optionsList: { flex: 1, paddingHorizontal: 20 },
  optionBase: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#f7f7f7',
    marginBottom: 12,
  },
  optionCard: {},
  optionSelected: { borderColor: '#1CB0F6', backgroundColor: '#DDF4FF' },
  optionCorrect: { borderColor: BrandColors.success, backgroundColor: BrandColors.successLight },
  optionIncorrect: { borderColor: BrandColors.danger, backgroundColor: BrandColors.dangerLight },
  optionText: { fontSize: 18, fontWeight: '600', color: '#333' },
  optionTextSelected: { color: '#1899D6' },
  optionTextCorrect: { color: '#2e7d32' },

  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  footerSuccess: { backgroundColor: BrandColors.successLight, borderColor: '#bbf293' },
  footerDanger: { backgroundColor: BrandColors.dangerLight, borderColor: '#ffc1c4' },
  feedbackContainer: { alignItems: 'stretch' },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  feedbackLlama: { width: 52, height: 52, borderRadius: 26 },
  feedbackTitle: { fontSize: 20, fontWeight: 'bold' },
  textSuccess: { color: '#2e7d32' },
  textDanger: { color: '#d32f2f' },

  buttonPrimary: {
    backgroundColor: BrandColors.success,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSuccess: { backgroundColor: BrandColors.success },
  btnDanger: { backgroundColor: BrandColors.danger },
  buttonDisabled: { backgroundColor: '#e5e5e5' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },

  congratsLlama: { width: 140, height: 145, marginBottom: 16 },
  congratsTitle: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  congratsSub: { fontSize: 16, color: '#666', marginBottom: 16 },
  statRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statBadge: { fontSize: 16, fontWeight: '700', color: '#444' },
  errorText: {
    color: BrandColors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

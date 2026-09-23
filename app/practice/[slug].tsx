import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { BrandColors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { categoryService } from '@/src/services/categoryService';
import { questionService } from '@/src/services/questionService';
import { QuestionWithOptions } from '@/src/types';
import { playCorrectSound, playIncorrectSound, playTapSound } from '@/src/services/soundService';

const DURATION_SEC = 60;
const MAX_QUESTIONS = 15;
const XP_PER_CORRECT = 10;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Modo Práctica cronometrado: repasa preguntas de lecciones ya completadas
 * de la categoría. No afecta vidas (solo suma XP en aciertos vía
 * checkAnswer(true)) ni marca lecciones como completadas de nuevo.
 */
export default function PracticeScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { checkAnswer } = useGame();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slug) loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slug]);

  useEffect(() => {
    if (loading || finished || error) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, finished, error]);

  async function loadData() {
    setLoading(true);
    setError('');

    const { data: category, error: catErr } = await categoryService.fetchCategoryBySlug(slug as string);
    if (catErr || !category) {
      setError(catErr || 'Categoría no encontrada');
      setLoading(false);
      return;
    }

    const userId = user?.uid || (user as any)?.id;
    const { data: lessons } = await categoryService.fetchLessonsWithProgress(category.id, userId);
    const completedIds = (lessons ?? []).filter((l) => l.progress?.completed).map((l) => l.id);

    if (completedIds.length === 0) {
      setError('Completa al menos una lección de esta categoría para poder practicar.');
      setLoading(false);
      return;
    }

    const results = await Promise.all(completedIds.map((id) => questionService.fetchQuestionsByLesson(id)));
    const allQuestions = results.flatMap((r) => r.data ?? []);

    if (allQuestions.length === 0) {
      setError('No encontramos preguntas para practicar en esta categoría todavía.');
      setLoading(false);
      return;
    }

    setQuestions(shuffle(allQuestions).slice(0, MAX_QUESTIONS));
    setLoading(false);
  }

  const currentQuestion = questions[currentIndex];

  function handleSelect(optId: number) {
    if (isAnswered) return;
    setSelectedOptionId(optId);
    playTapSound();
  }

  function handleCheck() {
    if (isAnswered || !currentQuestion || !selectedOptionId) return;
    const selected = currentQuestion.options.find((o) => o.id === selectedOptionId);
    const correct = selected?.is_correct ?? false;
    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setCorrectCount((n) => n + 1);
      checkAnswer(true); // solo suma XP, nunca resta vidas en modo práctica
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playCorrectSound();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      playIncorrectSound();
    }
  }

  function handleNext() {
    setSelectedOptionId(null);
    setIsAnswered(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setFinished(true);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={BrandColors.brandGreen} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const timeUsed = DURATION_SEC - timeLeft;
    return (
      <View style={styles.centered}>
        <Text style={styles.resultTitle}>⏱️ ¡Práctica terminada!</Text>
        <Text style={styles.resultScore}>
          {correctCount} / {questions.length} correctas
        </Text>
        <Text style={styles.resultSub}>Tiempo usado: {timeUsed}s</Text>
        <Text style={styles.resultXp}>+{correctCount * XP_PER_CORRECT} XP ganados</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={[styles.timerBadge, timeLeft <= 10 && styles.timerBadgeUrgent]}>
          <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.practiceLabel}>PRÁCTICA RÁPIDA</Text>
        <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

        <View style={styles.options}>
          {currentQuestion.options.map((opt) => {
            const sel = selectedOptionId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optBase,
                  sel && !isAnswered && styles.optSelected,
                  isAnswered && sel && (isCorrect ? styles.optCorrect : styles.optWrong),
                  isAnswered && !sel && opt.is_correct && styles.optCorrect,
                ]}
                onPress={() => handleSelect(opt.id)}
                disabled={isAnswered}
              >
                <Text style={styles.optText}>{opt.option_text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isAnswered ? (
          <TouchableOpacity style={[styles.btn, isCorrect ? styles.btnSuccess : styles.btnDanger]} onPress={handleNext}>
            <Text style={styles.btnText}>
              {currentIndex + 1 < questions.length ? 'Siguiente' : 'Ver resultado'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, !selectedOptionId && styles.btnDisabled]}
            onPress={handleCheck}
            disabled={!selectedOptionId}
          >
            <Text style={styles.btnText}>Comprobar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  closeBtn: { marginRight: 4 },
  closeBtnText: { fontSize: 22, color: '#aaa', fontWeight: 'bold' },
  progressBg: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e5e5',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BrandColors.accentOrange,
    borderRadius: 7,
  },
  timerBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  timerBadgeUrgent: {
    backgroundColor: BrandColors.dangerLight,
  },
  timerText: { fontSize: 13, fontWeight: '900', color: BrandColors.brandNavy },
  scroll: { paddingHorizontal: 24, paddingBottom: 20 },
  practiceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: BrandColors.accentOrange,
    letterSpacing: 1,
    marginBottom: 10,
  },
  questionText: { fontSize: 22, fontWeight: 'bold', color: '#333', lineHeight: 30, marginBottom: 20 },
  options: { gap: 12 },
  optBase: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#f7f7f7',
  },
  optSelected: { borderColor: '#1CB0F6', backgroundColor: '#DDF4FF' },
  optCorrect: { borderColor: BrandColors.brandGreen, backgroundColor: '#E8F5E9' },
  optWrong: { borderColor: BrandColors.danger, backgroundColor: BrandColors.dangerLight },
  optText: { fontSize: 17, fontWeight: '600', color: '#333' },
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: BrandColors.brandGreen,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSuccess: { backgroundColor: BrandColors.success },
  btnDanger: { backgroundColor: BrandColors.danger },
  btnDisabled: { backgroundColor: '#e5e5e5' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  resultScore: { fontSize: 18, color: '#444', marginBottom: 6 },
  resultSub: { fontSize: 14, color: '#888', marginBottom: 4 },
  resultXp: { fontSize: 16, fontWeight: '800', color: BrandColors.brandGreen, marginBottom: 24 },
  errorText: { color: BrandColors.danger, fontSize: 16, marginBottom: 16, textAlign: 'center' },
});

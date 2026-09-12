import { Illustrations } from '@/constants/illustrations';
import { BrandColors } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { examService } from '@/src/services/examService';
import { progressService } from '@/src/services/progressService';
import { ExamWithQuestions, QuestionOption } from '@/src/types';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

export default function LevelExamScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const parsedLevelId = parseInt(levelId as string, 10);

  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  const yachiScale = useSharedValue(1);
  const yachiAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: yachiScale.value }],
  }));

  function bounceYachi() {
    yachiScale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 200 })
    );
  }

  useEffect(() => {
    loadExam();
  }, [parsedLevelId]);

  async function loadExam() {
    setLoading(true);
    const { data, error } = await examService.fetchExamByLevel(parsedLevelId);
    if (error || !data) {
      setError(error ?? 'No se encontró el examen.');
    } else {
      setExam(data);
    }
    setLoading(false);
  }

  function handleSelect(option: QuestionOption) {
    if (isAnswered) return;
    setSelectedOption(option);
  }

  function handleCheck() {
    if (!selectedOption || isAnswered) return;
    const correct = selectedOption.is_correct;
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) setCorrectCount((n) => n + 1);
    bounceYachi();
  }

  async function handleNext() {
    if (!exam) return;
    if (currentIndex + 1 < exam.questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Examen terminado — calcular puntaje
      setSaving(true);
      const total = exam.questions.length;
      const score = Math.round((correctCount / total) * 100);
      const didPass = score >= exam.pass_threshold;
      setPassed(didPass);

      if (user?.id) {
        await progressService.recordExamResult(user.id, parsedLevelId, score, exam.pass_threshold);
        if (didPass) {
          await progressService.unlockNextLevel(user.id, parsedLevelId + 1);
        }
      }

      setSaving(false);
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

  if (error || !exam) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Examen no disponible.'}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (saving) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={BrandColors.brandGreen} />
        <Text style={styles.savingText}>Guardando resultado…</Text>
      </View>
    );
  }

  if (finished) {
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
        <Text style={styles.resultTitle}>{passed ? '¡Nivel Superado!' : 'Inténtalo de nuevo'}</Text>
        <Text style={styles.resultScore}>
          {correctCount} / {exam.questions.length} correctas — {score}%
        </Text>
        <Text style={styles.resultThreshold}>
          Mínimo requerido: {exam.pass_threshold}%
        </Text>
        <TouchableOpacity
          style={[styles.btn, passed ? styles.btnSuccess : styles.btnDanger]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.btnText}>{passed ? 'Continuar' : 'Volver al Inicio'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = exam.questions[currentIndex];
  const progress = ((currentIndex + 1) / exam.questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.examLabel}>EXAMEN</Text>
      </View>

      {/* Pregunta */}
      <View style={styles.questionWrap}>
        <Text style={styles.examSubtitle}>{exam.title}</Text>
        <Text style={styles.questionText}>{question.prompt}</Text>
      </View>

      {/* Opciones */}
      <View style={styles.options}>
        {question.options.map((opt) => {
          const sel = selectedOption?.id === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optBase,
                sel && !isAnswered && styles.optSelected,
                isAnswered && sel && (isCorrect ? styles.optCorrect : styles.optWrong),
                isAnswered && !sel && opt.is_correct && styles.optCorrect,
              ]}
              onPress={() => handleSelect(opt)}
              disabled={isAnswered}
            >
              <Text style={styles.optText}>{opt.option_text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          isAnswered && (isCorrect ? styles.footerOk : styles.footerBad),
        ]}
      >
        {isAnswered ? (
          <View>
            <View style={styles.feedbackRow}>
              <Animated.View style={yachiAnimStyle}>
                <Image
                  source={isCorrect ? Illustrations.llamaExcelente : Illustrations.llamaPiensa}
                  style={styles.feedbackImg}
                  contentFit="contain"
                />
              </Animated.View>
              <Text
                style={[
                  styles.feedbackText,
                  isCorrect ? styles.colorSuccess : styles.colorDanger,
                ]}
              >
                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.btn, isCorrect ? styles.btnSuccess : styles.btnDanger]}
              onPress={handleNext}
            >
              <Text style={styles.btnText}>
                {currentIndex + 1 < exam.questions.length ? 'Siguiente' : 'Ver resultado'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.btn, !selectedOption && styles.btnDisabled]}
            onPress={handleCheck}
            disabled={!selectedOption}
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
    gap: 8,
  },
  closeBtn: { marginRight: 8 },
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
    backgroundColor: BrandColors.brandNavy,
    borderRadius: 7,
  },
  examLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.brandNavy,
    letterSpacing: 1,
  },
  questionWrap: { paddingHorizontal: 24, marginBottom: 20 },
  examSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.brandNavy,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: { fontSize: 22, fontWeight: 'bold', color: '#333', lineHeight: 30 },
  options: { flex: 1, paddingHorizontal: 20 },
  optBase: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#f7f7f7',
    marginBottom: 12,
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
  footerOk: { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  footerBad: { backgroundColor: BrandColors.dangerLight, borderColor: '#FFCDD2' },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  feedbackImg: { width: 48, height: 48 },
  feedbackText: { fontSize: 18, fontWeight: 'bold' },
  colorSuccess: { color: '#2e7d32' },
  colorDanger: { color: '#c62828' },
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
  resultYachi: { width: 150, height: 150, marginBottom: 20 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  resultScore: { fontSize: 18, color: '#444', marginBottom: 6 },
  resultThreshold: { fontSize: 14, color: '#888', marginBottom: 24 },
  savingText: { marginTop: 12, fontSize: 15, color: '#666' },
  errorText: { color: BrandColors.danger, fontSize: 16, marginBottom: 16, textAlign: 'center' },
});

import { useAuth } from '@/src/context/AuthContext';
import { questionService } from '@/src/services/questionService';
import { QuestionOption, QuestionWithOptions } from '@/src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id as string, 10);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

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
      setQuestions(data ?? []);
    }
    setLoading(false);
  }

  function handleSelectOption(option: QuestionOption) {
    if (isAnswered) return;
    setSelectedOption(option);
  }

  function handleCheckAnswer() {
    if (!selectedOption || isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(selectedOption.is_correct);
  }

  async function handleNextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Lección finalizada
      setCompleted(true);
      if (user?.id) {
        await questionService.recordLessonProgress(lessonId, user.id, 10);
        await refreshProfile();
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58cc02" />
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
          <Text style={styles.buttonText}>Volver a la Lección</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={styles.centered}>
        <Text style={styles.congratsIcon}>🎉</Text>
        <Text style={styles.congratsTitle}>¡Lección Completada!</Text>
        <Text style={styles.congratsSub}>Has ganado +10 XP en Quechua</Text>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Top Bar con progreso */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
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

          if (isSelected) {
            cardStyle = styles.optionSelected;
          }

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

      {/* Footer con botón de acción */}
      <View style={[styles.footer, isAnswered && (isCorrect ? styles.footerSuccess : styles.footerDanger)]}>
        {isAnswered ? (
          <View style={styles.feedbackContainer}>
            <Text style={[styles.feedbackTitle, isCorrect ? styles.textSuccess : styles.textDanger]}>
              {isCorrect ? '¡Excelente!' : 'Respuesta incorrecta'}
            </Text>
            <TouchableOpacity
              style={[styles.buttonPrimary, isCorrect ? styles.btnSuccess : styles.btnDanger]}
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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
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
  },
  closeBtn: {
    marginRight: 16,
  },
  closeBtnText: {
    fontSize: 22,
    color: '#aaa',
    fontWeight: 'bold',
  },
  progressBarBg: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e5e5',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#58cc02',
    borderRadius: 7,
  },
  questionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  questionPrompt: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 30,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionBase: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#f7f7f7',
    marginBottom: 12,
  },
  optionCard: {},
  optionSelected: {
    borderColor: '#84d800',
    backgroundColor: '#ddf4c5',
  },
  optionCorrect: {
    borderColor: '#58cc02',
    backgroundColor: '#d7ffb8',
  },
  optionIncorrect: {
    borderColor: '#ff4b4b',
    backgroundColor: '#ffdadc',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    color: '#4b9400',
  },
  optionTextCorrect: {
    color: '#2e7d32',
  },
  footer: {
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  footerSuccess: {
    backgroundColor: '#d7ffb8',
    borderColor: '#bbf293',
  },
  footerDanger: {
    backgroundColor: '#ffdadc',
    borderColor: '#ffc1c4',
  },
  feedbackContainer: {
    alignItems: 'stretch',
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  textSuccess: {
    color: '#2e7d32',
  },
  textDanger: {
    color: '#d32f2f',
  },
  buttonPrimary: {
    backgroundColor: '#58cc02',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSuccess: {
    backgroundColor: '#58cc02',
  },
  btnDanger: {
    backgroundColor: '#ff4b4b',
  },
  buttonDisabled: {
    backgroundColor: '#e5e5e5',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  congratsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  congratsSub: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  errorText: {
    color: '#e53935',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

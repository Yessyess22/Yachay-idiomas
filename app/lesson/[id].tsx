import { supabase } from '@/lib/supabase';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Exercise = {
  id: string;
  type: string;
  question: string;
  correct_answer: string;
  options: string[] | null;
  audio_url: string | null;
  image_url: string | null;
  order_index: number;
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (id) fetchExercises();
  }, [id]);

  async function fetchExercises() {
    setLoading(true);
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setExercises(data ?? []);
    }
    setLoading(false);
  }

  function handleSelectAnswer(option: string) {
    if (hasAnswered) return; // evita cambiar respuesta después de confirmar
    setSelectedAnswer(option);
  }

  function handleCheckAnswer() {
    if (!selectedAnswer) return;
    setHasAnswered(true);

    const current = exercises[currentIndex];
    if (selectedAnswer === current.correct_answer) {
      setCorrectCount((prev) => prev + 1);
    }
  }

  function handleNext() {
    const isLast = currentIndex === exercises.length - 1;

    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Esta lección aún no tiene ejercicios.</Text>
      </View>
    );
  }

  if (finished) {
    const percentage = Math.round((correctCount / exercises.length) * 100);
    return (
      <View style={styles.centered}>
        <Text style={styles.resultTitle}>¡Lección completada!</Text>
        <Text style={styles.resultScore}>
          {correctCount} de {exercises.length} correctas ({percentage}%)
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Volver al curso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = exercises[currentIndex];
  const isCorrect = selectedAnswer === current.correct_answer;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Ejercicio ${currentIndex + 1} de ${exercises.length}` }} />

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentIndex + 1) / exercises.length) * 100}%` },
          ]}
        />
      </View>

      <Text style={styles.question}>{current.question}</Text>

      <View style={styles.optionsContainer}>
        {(current.options ?? []).map((option) => {
          const isSelected = selectedAnswer === option;
          const showAsCorrect = hasAnswered && option === current.correct_answer;
          const showAsWrong = hasAnswered && isSelected && option !== current.correct_answer;

          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                isSelected && !hasAnswered && styles.optionSelected,
                showAsCorrect && styles.optionCorrect,
                showAsWrong && styles.optionWrong,
              ]}
              onPress={() => handleSelectAnswer(option)}
              disabled={hasAnswered}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {hasAnswered && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? '¡Correcto! 🎉' : `Incorrecto. La respuesta era: ${current.correct_answer}`}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, !selectedAnswer && !hasAnswered && styles.buttonDisabled]}
        onPress={hasAnswered ? handleNext : handleCheckAnswer}
        disabled={!selectedAnswer && !hasAnswered}
      >
        <Text style={styles.primaryButtonText}>
          {hasAnswered ? 'Continuar' : 'Comprobar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e5e5e5',
    borderRadius: 5,
    marginBottom: 30,
    marginTop: 10,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#58cc02',
    borderRadius: 5,
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  optionSelected: {
    borderColor: '#1cb0f6',
    backgroundColor: '#ddf4ff',
  },
  optionCorrect: {
    borderColor: '#58cc02',
    backgroundColor: '#d7ffb8',
  },
  optionWrong: {
    borderColor: '#ff4b4b',
    backgroundColor: '#ffdfe0',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
  },
  feedback: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
  },
  feedbackCorrect: {
    backgroundColor: '#d7ffb8',
  },
  feedbackWrong: {
    backgroundColor: '#ffdfe0',
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  primaryButton: {
    marginTop: 'auto',
    backgroundColor: '#58cc02',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  resultScore: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 30,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
  },
});
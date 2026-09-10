import { useAuth } from '@/src/context/AuthContext';
import { categoryService } from '@/src/services/categoryService';
import { Category, LessonWithProgress } from '@/src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (slug) loadData();
  }, [slug]);

  async function loadData() {
    setLoading(true);
    setError('');

    // 1. Obtener datos de la categoría
    const { data: catData, error: catErr } = await categoryService.fetchCategoryBySlug(slug as string);
    if (catErr || !catData) {
      setError(catErr || 'Categoría no encontrada');
      setLoading(false);
      return;
    }
    setCategory(catData);

    // 2. Obtener lecciones de esta categoría
    const { data: lessonsData, error: lessErr } = await categoryService.fetchLessonsWithProgress(
      catData.id,
      user?.id
    );

    if (lessErr) {
      setError(lessErr);
    } else {
      setLessons(lessonsData ?? []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    );
  }

  if (error || !category) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Categoría no encontrada'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{category.name}</Text>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isCompleted = item.progress?.completed;
          return (
            <TouchableOpacity
              style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: item.id.toString() } })}
            >
              <View style={styles.lessonNumberBadge}>
                <Text style={styles.lessonNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.lessonDescription}>{item.description}</Text>
                ) : null}
              </View>
              <View style={styles.statusBadge}>
                {isCompleted ? (
                  <Text style={styles.completedBadgeText}>✅ +{item.progress?.xp_earned} XP</Text>
                ) : (
                  <Text style={styles.startBadgeText}>Iniciar →</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay lecciones registradas en esta categoría.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    padding: 8,
    marginRight: 8,
  },
  backArrowText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  list: {
    paddingBottom: 30,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  lessonCardCompleted: {
    borderColor: '#58cc02',
    backgroundColor: '#f4fbf0',
  },
  lessonNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#58cc02',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  lessonDescription: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  statusBadge: {
    marginLeft: 8,
  },
  completedBadgeText: {
    color: '#2b8a3e',
    fontWeight: 'bold',
    fontSize: 13,
  },
  startBadgeText: {
    color: '#1c7ed6',
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    color: '#e53935',
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#58cc02',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
});

import { useAuth } from '@/src/context/AuthContext';
import { categoryService } from '@/src/services/categoryService';
import { STORIES } from '@/src/content/stories';
import { Category, LessonWithProgress } from '@/src/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TEAL = '#00C853';
const CREAM = '#FAF7F2';
const GOLD = '#FFB300';
const GREEN = '#00C853';

export default function CategoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    // 1. Obtener datos de la categoría
    const { data: catData, error: catErr } = await categoryService.fetchCategoryBySlug(
      slug as string
    );
    if (catErr || !catData) {
      setError(catErr || 'Categoría no encontrada');
      setLoading(false);
      return;
    }
    setCategory(catData);

    // 2. Obtener lecciones de esta categoría con progreso real
    const userId = user?.uid || (user as any)?.id;
    const { data: lessonsData, error: lessErr } =
      await categoryService.fetchLessonsWithProgress(catData.id, userId);

    if (lessErr) {
      setError(lessErr);
    } else {
      setLessons(lessonsData ?? []);
    }

    setLoading(false);
  }, [slug, user]);

  // useFocusEffect para que el progreso se vuelva a pedir cada vez que se regresa
  useFocusEffect(
    useCallback(() => {
      if (slug) loadData();
    }, [slug, loadData])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={TEAL} />
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
      {/* Header Teal con estética Yachay */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrowBtn} onPress={() => router.back()}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerSubtitle}>MÓDULO DE APRENDIZAJE</Text>
          <Text style={styles.title}>{category.name}</Text>
        </View>
        <Image
          source={require('@/assets/images/logros/logro_principiante_chullo.png')}
          style={styles.headerBadgeImg}
        />
      </View>

      <View style={styles.andineBorder} />

      {/* Accesos a Lecciones guiadas con Yachi / Práctica rápida */}
      {(Boolean(STORIES[slug as string]) || lessons.some((l) => l.progress?.completed)) && (
        <View style={styles.actionsRow}>
          {STORIES[slug as string] && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/story/[slug]', params: { slug: slug as string } })}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Abrir lecciones guiadas con Yachi"
            >
              <Text style={styles.actionBtnText}>📖 Lecciones guiadas con Yachi</Text>
            </TouchableOpacity>
          )}
          {lessons.some((l) => l.progress?.completed) && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/practice/[slug]', params: { slug: slug as string } })}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Abrir práctica rápida"
            >
              <Text style={styles.actionBtnText}>⏱️ Práctica rápida</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Lista de Lecciones */}
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isCompleted = item.progress?.completed;
          return (
            <TouchableOpacity
              style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}
              onPress={() =>
                router.push({ pathname: '/lesson/[id]', params: { id: item.id.toString() } })
              }
              activeOpacity={0.88}
            >
              <View
                style={[
                  styles.lessonNumberBadge,
                  isCompleted ? styles.badgeCompleted : styles.badgeActive,
                ]}
              >
                <Text style={styles.lessonNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{item.title}</Text>
                <Text style={styles.lessonDescription}>
                  {item.description || 'Practica vocabulario y frases interactivas'}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                {isCompleted ? (
                  <View style={styles.completedTag}>
                    <Text style={styles.completedBadgeText}>
                      ✓ +{item.progress?.xp_earned || 10} XP
                    </Text>
                  </View>
                ) : (
                  <View style={styles.startTag}>
                    <Text style={styles.startBadgeText}>EMPEZAR →</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Image
              source={require('@/assets/images/llamita/07_feliz.png')}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Próximamente más lecciones</Text>
            <Text style={styles.emptyText}>
              Estamos preparando nuevas lecciones para esta categoría.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  emptyImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CREAM,
  },
  header: {
    backgroundColor: TEAL,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backArrowText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  headerTextCol: {
    flex: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerBadgeImg: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  andineBorder: {
    height: 4,
    backgroundColor: GOLD,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: TEAL,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderBottomWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  lessonCardCompleted: {
    borderColor: GREEN,
    backgroundColor: '#F3F9F5',
  },
  lessonNumberBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  badgeActive: {
    backgroundColor: TEAL,
  },
  badgeCompleted: {
    backgroundColor: GREEN,
  },
  lessonNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2A1A0A',
    marginBottom: 2,
  },
  lessonDescription: {
    fontSize: 12,
    color: '#7A6A5A',
  },
  statusBadge: {
    marginLeft: 8,
  },
  completedTag: {
    backgroundColor: '#E8F6EF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN,
  },
  completedBadgeText: {
    color: GREEN,
    fontWeight: '900',
    fontSize: 12,
  },
  startTag: {
    backgroundColor: TEAL,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#136566',
  },
  startBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  errorText: {
    color: '#E53935',
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: TEAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2A1A0A',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#7A6A5A',
    textAlign: 'center',
  },
});

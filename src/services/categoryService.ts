import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/services/supabase';
import { Category, LessonWithProgress } from '@/src/types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Abecedario', slug: 'abecedario', icon_url: null, sort_order: 1 },
  { id: 2, name: 'Números', slug: 'numeros', icon_url: null, sort_order: 2 },
  { id: 3, name: 'Palabras', slug: 'palabras', icon_url: null, sort_order: 3 },
];

const DEFAULT_LESSONS: Record<number, LessonWithProgress[]> = {
  1: [
    { id: 1, category_id: 1, title: 'Vocales del Quechua', description: 'Aprende las vocales del alfabeto quechua', sort_order: 1, progress: null },
    { id: 2, category_id: 1, title: 'Consonantes Básicas', description: 'Consonantes más comunes: p, t, k, q, m, n...', sort_order: 2, progress: null },
  ],
  2: [
    { id: 3, category_id: 2, title: 'Números del 1 al 5', description: 'Aprende a contar del uno al cinco en quechua', sort_order: 1, progress: null },
    { id: 4, category_id: 2, title: 'Números del 6 al 10', description: 'Continúa contando del seis al diez en quechua', sort_order: 2, progress: null },
  ],
  3: [
    { id: 5, category_id: 3, title: 'Saludos y Despedidas', description: 'Las frases de saludo más usadas en quechua', sort_order: 1, progress: null },
    { id: 6, category_id: 3, title: 'Familia', description: 'Nombres de los miembros de tu familia', sort_order: 2, progress: null },
  ],
};

export const categoryService = {
  async fetchCategories(): Promise<{ data: Category[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return { data: DEFAULT_CATEGORIES, error: null };
    }
    return { data: data as Category[], error: null };
  },

  async fetchCategoryBySlug(slug: string): Promise<{ data: Category | null; error: string | null }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const found = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
      return { data: found || DEFAULT_CATEGORIES[0], error: null };
    }
    return { data: data as Category, error: null };
  },

  async fetchLessonsWithProgress(
    categoryId: number,
    userId?: string
  ): Promise<{ data: LessonWithProgress[] | null; error: string | null }> {
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true });

    if (lessonsError || !lessons || lessons.length === 0) {
      return { data: DEFAULT_LESSONS[categoryId] || [], error: null };
    }

    if (!userId) {
      const lessonsFormatted: LessonWithProgress[] = lessons.map((l) => ({
        ...l,
        progress: null,
      }));
      return { data: lessonsFormatted, error: null };
    }

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('firebase_uid', userId);

    const progressMap = new Map(
      (progressData || []).map((p) => [p.lesson_id, p])
    );

    let localCompletedSet = new Set<number>();
    if (userId) {
      try {
        const storageKey = `@yachay_completed_lessons_${userId}`;
        const localData = await AsyncStorage.getItem(storageKey);
        if (localData) {
          const list: number[] = JSON.parse(localData);
          list.forEach((id) => localCompletedSet.add(id));
        }
      } catch {}
    }

    const result: LessonWithProgress[] = lessons.map((lesson) => {
      const dbProgress = progressMap.get(lesson.id);
      const isLocalDone = localCompletedSet.has(lesson.id);
      return {
        ...lesson,
        progress: dbProgress || (isLocalDone ? {
          firebase_uid: userId || '',
          lesson_id: lesson.id,
          completed: true,
          xp_earned: 10,
          completed_at: new Date().toISOString(),
        } : null),
      };
    });

    return { data: result, error: null };
  },
};


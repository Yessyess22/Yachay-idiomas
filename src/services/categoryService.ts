import { supabase } from '@/src/services/supabase';
import { Category, LessonWithProgress } from '@/src/types';

export const categoryService = {
  async fetchCategories(): Promise<{ data: Category[] | null; error: string | null }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data as Category[], error: null };
  },

  async fetchCategoryBySlug(slug: string): Promise<{ data: Category | null; error: string | null }> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Category, error: null };
  },

  async fetchLessonsWithProgress(
    categoryId: number,
    userId?: string
  ): Promise<{ data: LessonWithProgress[] | null; error: string | null }> {
    // 1. Obtener lecciones
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true });

    if (lessonsError) return { data: null, error: lessonsError.message };
    if (!lessons) return { data: [], error: null };

    // 2. Si no hay userId, retornar progreso nulo
    if (!userId) {
      const lessonsFormatted: LessonWithProgress[] = lessons.map((l) => ({
        ...l,
        progress: null,
      }));
      return { data: lessonsFormatted, error: null };
    }

    // 3. Obtener progreso de lecciones del usuario
    const { data: progressData, error: progressError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('firebase_uid', userId);

    if (progressError) {
      console.warn('Progress fetch warning:', progressError.message);
    }

    const progressMap = new Map((progressData || []).map((p) => [p.lesson_id, p]));

    const result: LessonWithProgress[] = lessons.map((lesson) => ({
      ...lesson,
      progress: progressMap.get(lesson.id) ?? null,
    }));

    return { data: result, error: null };
  },
};

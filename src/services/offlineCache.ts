/**
 * offlineCache.ts
 * Almacena las preguntas de lecciones en AsyncStorage para que la app
 * funcione sin conexión durante 24 horas después de la última descarga.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'yachay_lesson_';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

/**
 * Guarda preguntas de una lección en caché local.
 */
export async function saveQuestionsToCache<T>(lessonId: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, savedAt: Date.now() };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${lessonId}`, JSON.stringify(entry));
  } catch (err) {
    console.warn('[offlineCache] No se pudo guardar en caché:', err);
  }
}

/**
 * Lee preguntas de la caché local. Devuelve null si no existe o expiró.
 */
export async function loadQuestionsFromCache<T>(lessonId: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${lessonId}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.savedAt;
    if (age > TTL_MS) {
      // Expirado: limpiar y devolver null
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${lessonId}`);
      return null;
    }
    return entry.data;
  } catch (err) {
    console.warn('[offlineCache] No se pudo leer caché:', err);
    return null;
  }
}

/**
 * Limpia la caché de una lección específica o de todas las lecciones.
 */
export async function clearLessonCache(lessonId?: string): Promise<void> {
  try {
    if (lessonId) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${lessonId}`);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const lessonKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      if (lessonKeys.length > 0) {
        await AsyncStorage.multiRemove(lessonKeys);
      }
    }
  } catch (err) {
    console.warn('[offlineCache] No se pudo limpiar caché:', err);
  }
}

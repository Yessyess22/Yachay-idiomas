// ============================================================
// Tipos base de dominio — Yachay Idiomas
// Sprint 1 — Tarea S1-T09
// Basado en: docs/09-BD-SPEC.md (esquema normalizado)
// ============================================================

// ============================================================
// PERFIL DE USUARIO
// ============================================================
export interface Profile {
  firebase_uid: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  created_at: string; // ISO 8601
  streak_count?: number;
  last_active_date?: string | null;
  streak_freeze_count?: number;
  gems?: number;
  lives?: number;
  last_life_lost_at?: string | null;
}

// ============================================================
// CONTENIDO: CATEGORÍAS, LECCIONES, PREGUNTAS
// ============================================================
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  sort_order: number;
}

export interface Lesson {
  id: number;
  category_id: number;
  title: string;
  description: string | null;
  sort_order: number;
}

export type QuestionType =
  | 'multiple_choice'
  | 'text_input'
  | 'image_match'
  | 'word_bank'
  | 'matching_pairs'
  | 'listening'
  | 'speaking';

export interface Question {
  id: number;
  lesson_id: number;
  prompt: string;
  question_type: QuestionType;
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
}

/** Pregunta enriquecida con sus opciones (para renderizado en pantalla) */
export interface QuestionWithOptions extends Question {
  options: QuestionOption[];
}

// ============================================================
// GAMIFICACIÓN: TIENDA, MISIONES, LOGROS, LIGAS
// ============================================================
export interface ShopItem {
  id: number;
  name: string;
  description: string;
  price_gems: number;
  item_type: 'streak_freeze' | 'refill_lives' | 'xp_boost';
  icon_name: string;
}

export interface DailyQuest {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  xp_reward: number;
  gem_reward: number;
  quest_type: 'xp_gain' | 'lesson_count' | 'perfect_lesson' | 'streak_maintain';
  current_progress?: number;
  completed?: boolean;
}

export interface Badge {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  requirement_type: 'streak_days' | 'total_xp' | 'completed_lessons' | 'gems_earned';
  requirement_value: number;
  unlocked?: boolean;
}

export interface LeaderboardEntry {
  firebase_uid: string;
  username: string;
  avatar_url: string | null;
  weekly_xp: number;
  league_tier: 'bronze' | 'silver' | 'gold' | 'emerald' | 'diamond';
  rank?: number;
}

// ============================================================
// NIVELES Y EXÁMENES
// ============================================================
export interface Level {
  id: number;
  category_id: number;
  title: string;
  level_number: number;
}

export interface Exam {
  id: number;
  level_id: number;
  title: string;
  pass_threshold: number; // porcentaje mínimo (1–100)
}

/** Examen enriquecido con sus preguntas */
export interface ExamWithQuestions extends Exam {
  questions: QuestionWithOptions[];
}

// ============================================================
// PROGRESO DEL USUARIO
// ============================================================
export interface LessonProgress {
  firebase_uid: string;
  lesson_id: number;
  completed: boolean;
  xp_earned: number;
  completed_at: string | null; // ISO 8601
}

export interface LevelProgress {
  firebase_uid: string;
  level_id: number;
  unlocked: boolean;
  exam_score: number | null; // 0–100
  passed_at: string | null;  // ISO 8601
}

/** Lección enriquecida con el progreso del usuario autenticado */
export interface LessonWithProgress extends Lesson {
  progress: LessonProgress | null;
}

// ============================================================
// TRADUCTOR
// ============================================================
export type Language = 'es' | 'qu';

export interface TranslationHistory {
  id: number;
  firebase_uid: string;
  source_lang: Language;
  target_lang: Language;
  source_text: string;
  translated_text: string;
  created_at: string;
}

export interface TranslationRequest {
  source_lang: Language;
  target_lang: Language;
  source_text: string;
}


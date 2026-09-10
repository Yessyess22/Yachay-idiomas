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

export type QuestionType = 'multiple_choice' | 'text_input' | 'image_match';

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

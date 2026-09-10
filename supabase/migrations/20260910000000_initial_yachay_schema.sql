-- ============================================================
-- YACHAY IDIOMAS — Migración inicial del esquema
-- Versión: 1.0 | Fecha: 2026-09-10
-- Basado en: docs/09-BD-SPEC.md (esquema normalizado 3FN)
-- Auth: Firebase Auth + Supabase PostgreSQL
-- NOTA: profiles.firebase_uid es TEXT (Firebase UIDs no son UUIDs)
-- ============================================================

-- ============================================================
-- MÓDULO DE USUARIOS Y PERFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  firebase_uid  TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  avatar_url    TEXT,
  total_xp      INTEGER NOT NULL DEFAULT 0
                CHECK (total_xp >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MÓDULO DE CONTENIDO: CATEGORÍAS
-- (Abecedario, Números, Palabras)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  icon_url    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
              CHECK (sort_order >= 0)
);

-- ============================================================
-- MÓDULO DE CONTENIDO: LECCIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
               CHECK (sort_order >= 0)
);

-- ============================================================
-- MÓDULO DE CONTENIDO: PREGUNTAS
-- (sin columna options JSONB — extraída a question_options para 1FN)
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id             SERIAL PRIMARY KEY,
  lesson_id      INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prompt         TEXT NOT NULL,
  question_type  TEXT NOT NULL DEFAULT 'multiple_choice'
                 CHECK (question_type IN ('multiple_choice', 'text_input', 'image_match'))
);

-- ============================================================
-- MÓDULO DE CONTENIDO: OPCIONES DE PREGUNTAS
-- (tabla separada para cumplir 1FN — sin arrays en una celda)
-- ============================================================
CREATE TABLE IF NOT EXISTS question_options (
  id           SERIAL PRIMARY KEY,
  question_id  INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text  TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- MÓDULO DE NIVELES Y EXÁMENES
-- ============================================================
CREATE TABLE IF NOT EXISTS levels (
  id            SERIAL PRIMARY KEY,
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  level_number  INTEGER NOT NULL
                CHECK (level_number > 0),
  UNIQUE (category_id, level_number)
);

CREATE TABLE IF NOT EXISTS exams (
  id              SERIAL PRIMARY KEY,
  level_id        INTEGER NOT NULL UNIQUE REFERENCES levels(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  pass_threshold  INTEGER NOT NULL DEFAULT 70
                  CHECK (pass_threshold BETWEEN 1 AND 100)
);

-- Tabla de unión M:N entre exams y questions
-- PK compuesta natural, sin surrogate key
CREATE TABLE IF NOT EXISTS exam_questions (
  exam_id      INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id  INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (exam_id, question_id)
);

-- ============================================================
-- MÓDULO DE PROGRESO DEL USUARIO
-- (PK compuesta natural — sin surrogate SERIAL innecesario)
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  firebase_uid  TEXT    NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  lesson_id     INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  xp_earned     INTEGER NOT NULL DEFAULT 0
                CHECK (xp_earned >= 0),
  completed_at  TIMESTAMPTZ,
  PRIMARY KEY (firebase_uid, lesson_id)
);

CREATE TABLE IF NOT EXISTS level_progress (
  firebase_uid  TEXT    NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  level_id      INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  unlocked      BOOLEAN NOT NULL DEFAULT FALSE,
  exam_score    INTEGER CHECK (exam_score BETWEEN 0 AND 100),
  passed_at     TIMESTAMPTZ,
  PRIMARY KEY (firebase_uid, level_id)
);

-- ============================================================
-- MÓDULO DE TRADUCTOR (HISTORIAL DE TRADUCCIONES)
-- ============================================================
CREATE TABLE IF NOT EXISTS translation_history (
  id              SERIAL PRIMARY KEY,
  firebase_uid    TEXT NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  source_lang     TEXT NOT NULL CHECK (source_lang IN ('es', 'qu')),
  target_lang     TEXT NOT NULL CHECK (target_lang IN ('es', 'qu')),
  source_text     TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_languages CHECK (source_lang <> target_lang)
);

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lessons_category    ON lessons(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson    ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_q_options_question  ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_levels_category     ON levels(category_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions      ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_uid ON lesson_progress(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_level_progress_uid  ON level_progress(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_translation_uid     ON translation_history(firebase_uid);

-- ============================================================
-- RLS — Row Level Security con Firebase JWT
-- (auth.jwt() ->> 'sub') retorna el Firebase UID del token
-- Tablas de contenido: lectura pública para usuarios autenticados
-- Tablas de progreso/perfil: solo el propietario
-- ============================================================

-- Tablas privadas (solo el propietario puede leer y escribir)
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: solo propietario"
  ON profiles FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

CREATE POLICY "lesson_progress: solo propietario"
  ON lesson_progress FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

CREATE POLICY "level_progress: solo propietario"
  ON level_progress FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

CREATE POLICY "translation_history: solo propietario"
  ON translation_history FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

-- Tablas de contenido (lectura pública para cualquier usuario autenticado)
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: lectura pública autenticada"
  ON categories FOR SELECT USING (auth.jwt() IS NOT NULL);

CREATE POLICY "lessons: lectura pública autenticada"
  ON lessons FOR SELECT USING (auth.jwt() IS NOT NULL);

CREATE POLICY "questions: lectura pública autenticada"
  ON questions FOR SELECT USING (auth.jwt() IS NOT NULL);

CREATE POLICY "question_options: lectura pública autenticada"
  ON question_options FOR SELECT USING (auth.jwt() IS NOT NULL);

CREATE POLICY "levels: lectura pública autenticada"
  ON levels FOR SELECT USING (auth.jwt() IS NOT NULL);

CREATE POLICY "exams: lectura pública autenticada"
  ON exams FOR SELECT USING (auth.jwt() IS NOT NULL);

CREATE POLICY "exam_questions: lectura pública autenticada"
  ON exam_questions FOR SELECT USING (auth.jwt() IS NOT NULL);

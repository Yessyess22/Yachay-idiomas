-- ============================================================
-- YACHAY IDIOMAS — Migración de Gamificación y Tipos de Ejercicios
-- Versión: 2.0 | Fecha: 2026-09-12
-- ============================================================

-- 1. Campos de Gamificación en la tabla profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 0 CHECK (streak_count >= 0),
  ADD COLUMN IF NOT EXISTS last_active_date DATE,
  ADD COLUMN IF NOT EXISTS streak_freeze_count INTEGER NOT NULL DEFAULT 0 CHECK (streak_freeze_count >= 0),
  ADD COLUMN IF NOT EXISTS gems INTEGER NOT NULL DEFAULT 100 CHECK (gems >= 0),
  ADD COLUMN IF NOT EXISTS lives INTEGER NOT NULL DEFAULT 5 CHECK (lives BETWEEN 0 AND 5),
  ADD COLUMN IF NOT EXISTS last_life_lost_at TIMESTAMPTZ;

-- 2. Actualización del CHECK de tipo de pregunta en questions
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_question_type_check;
ALTER TABLE questions ADD CONSTRAINT questions_question_type_check 
  CHECK (question_type IN ('multiple_choice', 'text_input', 'image_match', 'word_bank', 'matching_pairs', 'listening', 'speaking'));

-- 3. Misiones Diarias
CREATE TABLE IF NOT EXISTS daily_quests (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  target_amount INTEGER NOT NULL DEFAULT 1,
  xp_reward    INTEGER NOT NULL DEFAULT 10,
  gem_reward   INTEGER NOT NULL DEFAULT 5,
  quest_type   TEXT NOT NULL CHECK (quest_type IN ('xp_gain', 'lesson_count', 'perfect_lesson', 'streak_maintain'))
);

CREATE TABLE IF NOT EXISTS user_quests (
  firebase_uid     TEXT NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  quest_id         INTEGER NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed        BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_at       TIMESTAMPTZ,
  PRIMARY KEY (firebase_uid, quest_id)
);

-- 4. Insignias / Logros
CREATE TABLE IF NOT EXISTS badges (
  id                SERIAL PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  icon_name         TEXT NOT NULL,
  requirement_type  TEXT NOT NULL CHECK (requirement_type IN ('streak_days', 'total_xp', 'completed_lessons', 'gems_earned')),
  requirement_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  firebase_uid TEXT NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  badge_id     INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (firebase_uid, badge_id)
);

-- 5. Tabla de Clasificación Semanal (Ligas)
CREATE TABLE IF NOT EXISTS leaderboard_weekly (
  firebase_uid TEXT PRIMARY KEY REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  weekly_xp    INTEGER NOT NULL DEFAULT 0 CHECK (weekly_xp >= 0),
  league_tier  TEXT NOT NULL DEFAULT 'bronze' CHECK (league_tier IN ('bronze', 'silver', 'gold', 'emerald', 'diamond')),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tienda de Ítems
CREATE TABLE IF NOT EXISTS shop_items (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  price_gems  INTEGER NOT NULL CHECK (price_gems > 0),
  item_type   TEXT NOT NULL UNIQUE CHECK (item_type IN ('streak_freeze', 'refill_lives', 'xp_boost')),
  icon_name   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_inventory (
  firebase_uid TEXT NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  item_id      INTEGER NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (firebase_uid, item_id)
);

-- ============================================================
-- RLS - Row Level Security
-- ============================================================
ALTER TABLE daily_quests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory   ENABLE ROW LEVEL SECURITY;

-- Lectura pública para autenticados
CREATE POLICY "daily_quests: lectura pública autenticada" ON daily_quests FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "badges: lectura pública autenticada" ON badges FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "shop_items: lectura pública autenticada" ON shop_items FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "leaderboard_weekly: lectura pública autenticada" ON leaderboard_weekly FOR SELECT USING (auth.jwt() IS NOT NULL);

-- Solo propietario
CREATE POLICY "user_quests: solo propietario" ON user_quests FOR ALL USING ((auth.jwt() ->> 'sub') = firebase_uid);
CREATE POLICY "user_badges: solo propietario" ON user_badges FOR ALL USING ((auth.jwt() ->> 'sub') = firebase_uid);
CREATE POLICY "user_inventory: solo propietario" ON user_inventory FOR ALL USING ((auth.jwt() ->> 'sub') = firebase_uid);

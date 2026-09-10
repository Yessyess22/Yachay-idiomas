# Especificación de Base de Datos — Yachay Quechua

**Versión:** 1.0 | **Fecha:** 2026-09-09 | **Sprint:** Sprint 1 | **Estado:** Borrador para revisión del equipo

---

## 1. Decisión de Arquitectura: Firebase Auth + Supabase PostgreSQL

### ¿Es posible combinar Firebase Auth con Supabase como base de datos?

**Sí, es posible.** La integración funciona de la siguiente manera:

```
[Aplicación Expo]
    │
    ├─ Firebase SDK ──► Firebase Auth (registro, login, sesión)
    │                        │
    │                        └─► Emite Firebase JWT (token RS256)
    │
    └─ Supabase Client ──► Supabase PostgreSQL (base de datos)
                                │
                                └─► Valida el JWT de Firebase via Third-party Auth
                                    RLS usa (auth.jwt() ->> 'sub') = firebase_uid
```

### Flujo de autenticación

1. El usuario se registra/inicia sesión con Firebase (`signInWithEmailAndPassword` o `createUserWithEmailAndPassword`).
2. Firebase devuelve un `idToken` (JWT) firmado con claves RSA de Google.
3. La app configura el cliente Supabase con ese token: `supabase.auth.setSession({ access_token: idToken })`.
4. Supabase valida el JWT contra las claves públicas de Firebase.
5. Las políticas RLS extraen el Firebase UID con `(auth.jwt() ->> 'sub')`.
6. Al registrarse, la app crea automáticamente un registro en la tabla `profiles` de Supabase (usando el `firebase_uid` recibido).

### Diferencias clave respecto al esquema original

| Aspecto | Supabase Auth (esquema anterior) | Firebase Auth (este esquema) |
| :--- | :--- | :--- |
| PK de `profiles` | `UUID REFERENCES auth.users(id)` | `TEXT` (Firebase UID, ej. `"xT3k9mP..."`) |
| Identificar usuario en RLS | `auth.uid() = id` | `(auth.jwt() ->> 'sub') = firebase_uid` |
| Dónde viven los usuarios | Tabla `auth.users` de Supabase | Firebase Console |
| Crear perfil al registrarse | Trigger automático posible | Manual desde la app al registrarse |

### Configuración requerida en `supabase/config.toml`

```toml
[auth.third_party.firebase]
enabled = true
project_id = "yachay-idiomas"   # ID del proyecto Firebase
```

Esta sección le indica al emulador local de Supabase que acepte JWTs emitidos por Firebase. Sin esta configuración, Supabase rechazará los tokens de Firebase con error 401.

---

## 2. Modelo Entidad-Relación

```
profiles ──────────────────────────────────────────────────────────┐
  │ (firebase_uid)                                                  │
  ├──< lesson_progress >── lessons ──< questions ──< question_options
  ├──< level_progress  >── levels ──< exams ──< exam_questions >──┘
  └──< translation_history                                         │
                                                                   │
categories ──< lessons                                             │
categories ──< levels                                             │
                                                                   │
questions <───────────────────────────────── exam_questions ───────┘
```

### Relaciones principales

| Tabla A | Cardinalidad | Tabla B | Clave foránea |
| :--- | :---: | :--- | :--- |
| `profiles` | 1 : N | `lesson_progress` | `lesson_progress.firebase_uid` |
| `profiles` | 1 : N | `level_progress` | `level_progress.firebase_uid` |
| `profiles` | 1 : N | `translation_history` | `translation_history.firebase_uid` |
| `categories` | 1 : N | `lessons` | `lessons.category_id` |
| `categories` | 1 : N | `levels` | `levels.category_id` |
| `lessons` | 1 : N | `lesson_progress` | `lesson_progress.lesson_id` |
| `lessons` | 1 : N | `questions` | `questions.lesson_id` |
| `questions` | 1 : N | `question_options` | `question_options.question_id` |
| `levels` | 1 : 1 | `exams` | `exams.level_id` |
| `levels` | 1 : N | `level_progress` | `level_progress.level_id` |
| `exams` | N : M | `questions` | (tabla puente `exam_questions`) |

---

## 3. Análisis de Normalización

### 3.1 Primera Forma Normal (1FN)

**Requisitos:** Valores atómicos en cada celda; sin grupos repetitivos; clave primaria definida.

**Problema detectado en el esquema original (doc 04-SPRINTS.md):**

La columna `questions.options JSONB` almacena un **array de strings** en una sola celda:

```json
// Valor en options: ["unu", "iskay", "kimsa", "tawa"]
```

Esto viola la 1FN porque una celda contiene múltiples valores. Si queremos filtrar o indexar por opción individual, no es posible sin parsear el JSON.

**Solución aplicada:** Se extrae `options` y `correct_answer` a una tabla separada `question_options`.

```
ANTES (viola 1FN):
questions(id, lesson_id, prompt, options[JSONB], correct_answer, question_type)
           ↑                            ↑ array!

DESPUÉS (cumple 1FN):
questions(id, lesson_id, prompt, question_type)
question_options(id, question_id, option_text, is_correct)
```

Todas las demás tablas del esquema tienen valores atómicos. ✅

### 3.2 Segunda Forma Normal (2FN)

**Requisitos:** Estar en 1FN + todos los atributos no clave dependen de la **clave primaria completa** (sin dependencias parciales).

Las dependencias parciales solo pueden ocurrir en tablas con **claves primarias compuestas**. Las tablas de este esquema con PK compuesta son:

| Tabla | PK compuesta | Atributos no clave | Dependencia |
| :--- | :--- | :--- | :--- |
| `lesson_progress` | `(firebase_uid, lesson_id)` | `completed`, `xp_earned`, `completed_at` | Dependen de ambos campos juntos ✅ |
| `level_progress` | `(firebase_uid, level_id)` | `unlocked`, `exam_score`, `passed_at` | Dependen de ambos campos juntos ✅ |
| `exam_questions` | `(exam_id, question_id)` | *(sin atributos adicionales)* | Tabla de unión pura ✅ |

El progreso de una lección (`completed`, `xp_earned`) no puede determinarse solo con el `firebase_uid` (necesita saber QUÉ lección) ni solo con el `lesson_id` (necesita saber QUÉ usuario). La dependencia es sobre la clave completa. **El esquema cumple la 2FN.** ✅

### 3.3 Tercera Forma Normal (3FN)

**Requisitos:** Estar en 2FN + sin dependencias transitivas (ningún atributo no clave depende de otro atributo no clave).

Verificación tabla por tabla:

| Tabla | ¿Hay dependencia transitiva? | Análisis |
| :--- | :---: | :--- |
| `profiles` | No | `username`, `avatar_url`, `total_xp`, `created_at` dependen directamente de `firebase_uid` ✅ |
| `categories` | No | `name`, `slug`, `icon_url`, `sort_order` dependen directamente de `id`. Aunque `slug` se deriva de `name`, en BD no existe dependencia funcional entre ellos (son independientes). ✅ |
| `lessons` | No | `category_id` es FK, no transitiva. `title`, `description`, `sort_order` dependen de `id`. ✅ |
| `questions` | No | `lesson_id` es FK. `prompt`, `question_type` dependen de `id`. ✅ |
| `question_options` | No | `question_id` es FK. `option_text`, `is_correct` dependen de `id`. ✅ |
| `levels` | No | `category_id` es FK. `title`, `level_number` dependen de `id`. ✅ |
| `exams` | No | `level_id` es FK. `title`, `pass_threshold` dependen de `id`. ✅ |
| `lesson_progress` | No | `xp_earned`, `completed`, `completed_at` dependen del par `(firebase_uid, lesson_id)` directamente. ✅ |
| `level_progress` | No | `unlocked`, `exam_score`, `passed_at` dependen del par `(firebase_uid, level_id)` directamente. ✅ |
| `translation_history` | No | Todos los atributos dependen de `id`. ✅ |

**El esquema normalizado cumple la 3FN.** ✅

---

## 4. DDL — Esquema Final Normalizado

> Este DDL se debe guardar como archivo de migración en `supabase/migrations/YYYYMMDDHHMMSS_initial_yachay_schema.sql`
> y nunca modificarse directamente desde Supabase Studio.

```sql
-- ============================================================
-- MÓDULO DE USUARIOS Y PERFILES
-- (firebase_uid: TEXT porque Firebase usa UIDs alfanuméricos,
--  no UUIDs de Supabase)
-- ============================================================
CREATE TABLE profiles (
  firebase_uid  TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  avatar_url    TEXT,
  total_xp      INTEGER NOT NULL DEFAULT 0
                CHECK (total_xp >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MÓDULO DE CONTENIDO: CATEGORÍAS
-- (Abecedario, Números, Palabras, Niveles, Traductor)
-- ============================================================
CREATE TABLE categories (
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
CREATE TABLE lessons (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
               CHECK (sort_order >= 0)
);

-- ============================================================
-- MÓDULO DE CONTENIDO: PREGUNTAS Y OPCIONES
-- (Separados para cumplir 1FN — sin arrays JSONB)
-- ============================================================
CREATE TABLE questions (
  id             SERIAL PRIMARY KEY,
  lesson_id      INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prompt         TEXT NOT NULL,
  question_type  TEXT NOT NULL DEFAULT 'multiple_choice'
                 CHECK (question_type IN ('multiple_choice', 'text_input', 'image_match'))
);

CREATE TABLE question_options (
  id           SERIAL PRIMARY KEY,
  question_id  INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text  TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- MÓDULO DE NIVELES Y EXÁMENES
-- ============================================================
CREATE TABLE levels (
  id            SERIAL PRIMARY KEY,
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  level_number  INTEGER NOT NULL
                CHECK (level_number > 0),
  UNIQUE (category_id, level_number)
);

CREATE TABLE exams (
  id              SERIAL PRIMARY KEY,
  level_id        INTEGER NOT NULL UNIQUE REFERENCES levels(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  pass_threshold  INTEGER NOT NULL DEFAULT 70
                  CHECK (pass_threshold BETWEEN 1 AND 100)
);

-- Tabla de unión M:N entre exams y questions
CREATE TABLE exam_questions (
  exam_id      INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id  INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (exam_id, question_id)
);

-- ============================================================
-- MÓDULO DE PROGRESO DEL USUARIO
-- ============================================================
CREATE TABLE lesson_progress (
  firebase_uid  TEXT    NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  lesson_id     INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  xp_earned     INTEGER NOT NULL DEFAULT 0
                CHECK (xp_earned >= 0),
  completed_at  TIMESTAMPTZ,
  PRIMARY KEY (firebase_uid, lesson_id)
);

CREATE TABLE level_progress (
  firebase_uid  TEXT    NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  level_id      INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  unlocked      BOOLEAN NOT NULL DEFAULT FALSE,
  exam_score    INTEGER CHECK (exam_score BETWEEN 0 AND 100),
  passed_at     TIMESTAMPTZ,
  PRIMARY KEY (firebase_uid, level_id)
);

-- ============================================================
-- MÓDULO DE TRADUCTOR (HISTORIAL)
-- ============================================================
CREATE TABLE translation_history (
  id             SERIAL PRIMARY KEY,
  firebase_uid   TEXT NOT NULL REFERENCES profiles(firebase_uid) ON DELETE CASCADE,
  source_lang    TEXT NOT NULL CHECK (source_lang IN ('es', 'qu')),
  target_lang    TEXT NOT NULL CHECK (target_lang IN ('es', 'qu')),
  source_text    TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_languages CHECK (source_lang <> target_lang)
);

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX idx_lessons_category   ON lessons(category_id);
CREATE INDEX idx_questions_lesson   ON questions(lesson_id);
CREATE INDEX idx_q_options_question ON question_options(question_id);
CREATE INDEX idx_levels_category    ON levels(category_id);
CREATE INDEX idx_exam_questions     ON exam_questions(exam_id);
CREATE INDEX idx_lesson_progress_uid ON lesson_progress(firebase_uid);
CREATE INDEX idx_level_progress_uid  ON level_progress(firebase_uid);
CREATE INDEX idx_translation_uid    ON translation_history(firebase_uid);

-- ============================================================
-- RLS — Row Level Security con Firebase JWT
-- (auth.jwt() ->> 'sub') retorna el Firebase UID del token
-- ============================================================
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede leer y modificar su propio perfil
CREATE POLICY "profiles: solo propietario"
  ON profiles FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

-- Cada usuario solo ve su propio progreso de lecciones
CREATE POLICY "lesson_progress: solo propietario"
  ON lesson_progress FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

-- Cada usuario solo ve su propio progreso de niveles
CREATE POLICY "level_progress: solo propietario"
  ON level_progress FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

-- Cada usuario solo ve su propio historial de traducciones
CREATE POLICY "translation_history: solo propietario"
  ON translation_history FOR ALL
  USING ((auth.jwt() ->> 'sub') = firebase_uid);

-- El contenido (categorías, lecciones, preguntas, niveles, exámenes)
-- es público de solo lectura — cualquier usuario autenticado puede leerlo
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content: lectura pública autenticada" ON categories
  FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "content: lectura pública autenticada" ON lessons
  FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "content: lectura pública autenticada" ON questions
  FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "content: lectura pública autenticada" ON question_options
  FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "content: lectura pública autenticada" ON levels
  FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "content: lectura pública autenticada" ON exams
  FOR SELECT USING (auth.jwt() IS NOT NULL);
CREATE POLICY "content: lectura pública autenticada" ON exam_questions
  FOR SELECT USING (auth.jwt() IS NOT NULL);
```

---

## 5. Configuración Firebase + Supabase en Desarrollo Local

### 5.1 `supabase/config.toml`

Agregar la sección `[auth.third_party.firebase]` para que el emulador local acepte tokens de Firebase:

```toml
[auth.third_party.firebase]
enabled = true
project_id = "yachay-idiomas"
```

### 5.2 Variables de entorno necesarias (`.env.local`)

```env
# Firebase (cliente)
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=yachay-idiomas.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=yachay-idiomas

# Supabase (BD)
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 5.3 Integración en el código (`src/services/authService.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { supabase } from './supabase';

// Al hacer login con Firebase:
async function signIn(email: string, password: string) {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();

  // Pasar el token de Firebase al cliente de Supabase
  await supabase.auth.setSession({ access_token: idToken, refresh_token: '' });

  return userCredential.user;
}

// Al registrarse, crear el perfil en Supabase:
async function signUp(email: string, password: string, username: string) {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = userCredential.user;
  const idToken = await userCredential.user.getIdToken();

  await supabase.auth.setSession({ access_token: idToken, refresh_token: '' });

  // Crear el perfil del usuario en Supabase
  const { error } = await supabase
    .from('profiles')
    .insert({ firebase_uid: uid, username });

  if (error) throw error;
  return userCredential.user;
}
```

---

## 6. Comparativa de Tablas: Esquema Original vs Esquema Normalizado

| Tabla | Cambio | Motivo |
| :--- | :--- | :--- |
| `profiles.id UUID` | → `firebase_uid TEXT` | Firebase usa UIDs alfanuméricos, no UUIDs de Supabase |
| `profiles` — FK `auth.users` | Eliminada | Firebase Auth no escribe en `auth.users` de Supabase |
| `questions.options JSONB` | → tabla `question_options` | Violaba 1FN (array en una celda) |
| `questions.correct_answer` | → `question_options.is_correct BOOLEAN` | Normalizado junto a las opciones |
| `lesson_progress.id SERIAL` | → PK compuesta `(firebase_uid, lesson_id)` | Eliminamos surrogate key innecesaria; la PK natural es suficiente |
| `level_progress.id SERIAL` | → PK compuesta `(firebase_uid, level_id)` | Igual que arriba |
| `exam_questions.id SERIAL` | → PK compuesta `(exam_id, question_id)` | Tabla de unión pura; PK natural adecuada |
| `translation_history.source_language` | Renombrada a `source_lang` | Consistencia con `target_lang` agregado |
| `translation_history.target_lang` | Nueva columna | Para saber el idioma de destino explícitamente |
| RLS: `auth.uid()` | → `(auth.jwt() ->> 'sub')` | Firebase UID en el claim `sub` del JWT |

---

## 7. Distribución del Equipo — Sprint 1 (2026-09-08 al 2026-09-19)

### Perfiles del Equipo

| Desarrollador | Rol | Énfasis técnico |
| :--- | :--- | :--- |
| **Oscar Segovia** | DevOps / Backend | Infraestructura Docker, migraciones Supabase, servicios API, cliente Supabase |
| **Yesica Escobar** | Frontend Developer | UI/UX, pantallas, componentes visuales, navegación Expo Router, contenido quechua |
| **Alejandro Padilla** | Domain Logic / QA | Tipos TypeScript, GameContext, control de estado global, tests, gamificación |

### Tareas Sprint 1 — Asignadas

| ID | Tarea | Responsable | Dependencia |
| :--- | :--- | :--- | :--- |
| **S1-T01** | Revisar y aprobar este DDL; crear archivo de migración con `supabase migration new` | **Oscar Segovia** | — |
| **S1-T02** | Aplicar la migración con `supabase db push`; verificar en Studio que tablas y RLS se crearon | **Oscar Segovia** | S1-T01 |
| **S1-T03** | Configurar Firebase project (crear app, obtener credenciales) y actualizar `supabase/config.toml` con `project_id` | **Oscar Segovia** | — |
| **S1-T04** | Crear `Dockerfile` (`node:20-alpine`) y `docker-compose.yml` (subred `10.10.10.0/24`, IP `10.10.10.10`) | **Oscar Segovia** | — |
| **S1-T05** | Verificar conectividad: `http://10.10.10.10:8081` accesible desde el host | **Oscar Segovia** | S1-T04 |
| **S1-T06** | Crear seed en `supabase/seed.sql` con datos reales de quechua (≥3 cat., ≥2 lecciones, ≥5 preguntas por lección, con opciones en `question_options`) | **Yesica Escobar** | S1-T02 |
| **S1-T07** | Personalizar o eliminar archivos plantilla de Expo (`explore.tsx`, `Collapsible.tsx`, etc.) | **Yesica Escobar** | — |
| **S1-T08** | Crear estructura de directorios Clean Architecture: `src/{context,services,utils,types,features}/` | **Alejandro Padilla** | — |
| **S1-T09** | Definir tipos TypeScript base en `src/types/`: `Profile`, `Category`, `Lesson`, `Question`, `QuestionOption`, `Level`, `Exam` | **Alejandro Padilla** | S1-T01 aprobado |

### Distribución General por Sprint (referencia rápida)

| Sprint | Oscar Segovia | Yesica Escobar | Alejandro Padilla |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Migración BD, Docker, Firebase config | Seed datos quechua, limpieza templates | Tipos TS, estructura Clean Arch |
| **Sprint 2** | `supabase.ts`, `authService.ts`, `categoryService.ts`, `questionService.ts` | Pantallas Auth, Home, Categorías, Lección | Revisión y aprobación de servicios |
| **Sprint 3** | `progressService.ts`, `examService.ts`, `voiceService.ts` | Pantallas Examen, Traductor, Bloqueo | `GameContext.tsx`, tipos `game.ts`, `GameProvider` |
| **Sprint 4** | Auditoría arq., migraciones, `tsc`, `lint` | Perfil, Resultados, retroalimentación visual | Tests unitarios `GameContext`, tests E2E |

---

## 8. Criterios de Aceptación del Esquema (Sprint 1)

- [ ] `supabase db push` aplica la migración sin errores.
- [ ] Supabase Studio muestra las 11 tablas: `profiles`, `categories`, `lessons`, `questions`, `question_options`, `levels`, `exams`, `exam_questions`, `lesson_progress`, `level_progress`, `translation_history`.
- [ ] Las políticas RLS están activas: un usuario autenticado con Firebase no puede leer registros de otro usuario en `lesson_progress`, `level_progress` y `translation_history`.
- [ ] `SELECT COUNT(*) FROM question_options` retorna ≥ 150 (30 preguntas × 5 opciones promedio).
- [ ] `SELECT COUNT(*) FROM questions` retorna ≥ 30.
- [ ] La columna `questions.options` NO existe (tabla eliminada, reemplazada por `question_options`).
- [ ] Firebase Auth acepta registro con email/password y devuelve `idToken`.
- [ ] El cliente Supabase configurado con el `idToken` de Firebase puede insertar en `profiles` y consultar `categories`.

---

*Documento a actualizar con resolución de cada criterio al cierre del Sprint 1.*

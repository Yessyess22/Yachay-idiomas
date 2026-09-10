# Plan de Sprints — Yachay Quechua

**Versión:** 1.1 | **Fecha:** 2026-09-08 | **Última actualización:** 2026-09-08 | **Duración por sprint:** ~2 semanas académicas

---

## Resumen del Roadmap

| Sprint | Nombre | Período estimado | Estado |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Diseño de BD, Infraestructura Docker y Clean Architecture | 2026-09-08 → 2026-09-19 | 🔵 En curso |
| **Sprint 2** | Auth, Capa de Datos y Módulos Abecedario/Números/Palabras | 2026-09-22 → 2026-10-03 | ⬜ Pendiente |
| **Sprint 3** | Gamificación Global, Exámenes de Nivel y Traductor de Voz | 2026-10-06 → 2026-10-17 | ⬜ Pendiente |
| **Sprint 4** | Integración Final, QA y Pulido de Producto | 2026-10-20 → 2026-10-31 | ⬜ Pendiente |

---

## Sprint 1 — Diseño de Base de Datos, Infraestructura Docker y Clean Architecture

**Objetivo general:** Definir y aplicar el esquema relacional completo de la base de datos de Yachay en Supabase mediante migraciones versionadas, establecer el entorno de desarrollo reproducible en Docker con red estática, y crear el esqueleto de Clean Architecture Feature-First sobre el que se construirá toda la lógica de la aplicación.

> **Prioridad del sprint:** El modelado de la base de datos es el primer entregable del sprint. Sin el esquema aprobado, los sprints 2 y 3 no pueden iniciar el desarrollo de servicios ni gamificación.

### Esquema Relacional Objetivo (DDL Supabase)

El esquema debe crearse como archivo de migración en `supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql` y nunca modificarse directamente desde Supabase Studio.

```sql
-- ============================================================
-- MÓDULO DE USUARIOS Y PERFILES
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  avatar_url  TEXT,
  total_xp    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MÓDULO DE CONTENIDO: CATEGORÍAS Y LECCIONES
-- ============================================================
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,              -- 'Abecedario', 'Números', 'Palabras'
  slug        TEXT NOT NULL UNIQUE,
  icon_url    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE lessons (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE questions (
  id               SERIAL PRIMARY KEY,
  lesson_id        INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prompt           TEXT NOT NULL,          -- texto de la pregunta en quechua o español
  options          JSONB NOT NULL,         -- array de strings con las opciones
  correct_answer   TEXT NOT NULL,
  question_type    TEXT NOT NULL DEFAULT 'multiple_choice'
                   CHECK (question_type IN ('multiple_choice', 'text_input', 'image_match'))
);

-- ============================================================
-- MÓDULO DE NIVELES Y EXÁMENES
-- ============================================================
CREATE TABLE levels (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  level_number INTEGER NOT NULL,
  UNIQUE (category_id, level_number)
);

CREATE TABLE exams (
  id        SERIAL PRIMARY KEY,
  level_id  INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  pass_threshold INTEGER NOT NULL DEFAULT 70  -- porcentaje mínimo de aciertos
);

CREATE TABLE exam_questions (
  id          SERIAL PRIMARY KEY,
  exam_id     INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE
);

-- ============================================================
-- MÓDULO DE PROGRESO DEL USUARIO
-- ============================================================
CREATE TABLE lesson_progress (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id   INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  xp_earned   INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE level_progress (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_id    INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  unlocked    BOOLEAN NOT NULL DEFAULT FALSE,
  exam_score  INTEGER,                    -- porcentaje de aciertos del examen
  passed_at   TIMESTAMPTZ,
  UNIQUE (user_id, level_id)
);

-- ============================================================
-- MÓDULO DE TRADUCTOR (HISTORIAL DE TRADUCCIONES)
-- ============================================================
CREATE TABLE translation_history (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_language TEXT NOT NULL CHECK (source_language IN ('es', 'qu')),
  source_text     TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS (Row Level Security) — cada usuario solo ve sus propios datos
-- ============================================================
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: propietario" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "lesson_progress: propietario" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "level_progress: propietario" ON level_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "translation_history: propietario" ON translation_history
  FOR ALL USING (auth.uid() = user_id);
```

### Tareas

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S1-T01 | Diseñar el esquema relacional completo (DDL) con todas las tablas, relaciones, RLS y restricciones. Revisión y aprobación del equipo. | Alejandro Padilla | Pendiente |
| S1-T02 | Crear el archivo de migración inicial en `supabase/migrations/` y aplicarlo con `supabase db push`. Verificar en Supabase Studio que todas las tablas se crearon correctamente. | Oscar Segovia | Pendiente |
| S1-T03 | Crear el seed de datos de prueba en `supabase/seed.sql`: poblar `categories`, `lessons`, `questions`, `levels`, `exams` y `exam_questions` con contenido real de quechua (mínimo: 3 categorías, 2 lecciones por categoría, 5 preguntas por lección). | Alejandro Padilla + Yesica | Pendiente |
| S1-T04 | Escribir `Dockerfile` con imagen `node:20-alpine`, instalación de dependencias y comando `CMD` para arrancar Expo Web. | Oscar Segovia | Pendiente |
| S1-T05 | Escribir `docker-compose.yml` con servicio `expo-web`, red `yachay-net` (`driver: bridge`, subnet `10.10.10.0/24`) e IP estática `10.10.10.10` para el contenedor. | Oscar Segovia | Pendiente |
| S1-T06 | Verificar conectividad: acceder a `http://10.10.10.10:8081` desde el host y confirmar que Expo Web carga la pantalla base. | Oscar Segovia | Pendiente |
| S1-T07 | Crear la estructura de directorios `src/context/`, `src/services/`, `src/utils/`, `src/types/` y `src/features/` en la raíz del proyecto. | Oscar Segovia | Pendiente |
| S1-T08 | Crear los documentos de gobernanza del proyecto en `docs/` y actualizar el alcance con los módulos definitivos (Abecedario, Números, Palabras, Niveles/Exámenes, Traductor de Voz). | Equipo | Completado |

### Criterios de Aceptación

- [ ] `supabase db push` aplica la migración sin errores. Todas las tablas del esquema existen en Supabase Studio.
- [ ] Las políticas RLS están activas: un usuario autenticado solo puede leer y escribir sus propios registros en `lesson_progress`, `level_progress` y `translation_history`.
- [ ] El seed popula las tablas de contenido (`categories`, `lessons`, `questions`) con datos de quechua reales; verificar con `SELECT COUNT(*) FROM questions` — debe retornar ≥ 30.
- [ ] `docker compose up` inicia el contenedor sin errores de red ni de dependencias.
- [ ] `http://10.10.10.10:8081` es accesible desde el navegador del host.
- [ ] `docker network inspect yachay-net` confirma que el contenedor tiene la IP `10.10.10.10`.
- [ ] La estructura `src/{context,services,utils,types,features}/` existe en el repositorio.
- [ ] No existe ningún `node_modules` comprometido en el repositorio.

---

## Sprint 2 — Auth, Capa de Datos y Módulos de Contenido

**Objetivo general:** Migrar la lógica de autenticación hacia servicios desacoplados, conectar los módulos de contenido (Abecedario, Números, Palabras) a las nuevas tablas del esquema relacional diseñado en el Sprint 1, y eliminar todas las llamadas directas a Supabase desde las pantallas.

### Tareas

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S2-T01 | Crear `src/services/supabase.ts`: instancia única del cliente Supabase configurada con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`. | Oscar Segovia | Pendiente |
| S2-T02 | Crear `src/services/authService.ts`: funciones `signIn(email, password)`, `signUp(email, password)`, `signOut()` y `createProfile(userId, username)` que crea el registro en la tabla `profiles` al registrarse. | Oscar Segovia | Pendiente |
| S2-T03 | Refactorizar `src/context/AuthContext.tsx`: eliminar el `import` directo de Supabase; consumir únicamente las funciones de `authService.ts`. | Yesica | Pendiente |
| S2-T04 | Refactorizar pantallas de auth (`app/(auth)/login.tsx`, `app/(auth)/signup.tsx`): eliminar toda lógica de Supabase; consumir únicamente `AuthContext`. | Yesica | Pendiente |
| S2-T05 | Crear `src/services/categoryService.ts`: funciones `fetchCategories()` y `fetchLessonsWithProgress(categoryId, userId)` que consultan `categories`, `lessons` y `lesson_progress` en join. | Oscar Segovia | Pendiente |
| S2-T06 | Crear `src/services/questionService.ts`: función `fetchQuestionsByLesson(lessonId)` que obtiene las preguntas de una lección desde la tabla `questions`. | Oscar Segovia | Pendiente |
| S2-T07 | Refactorizar `app/(tabs)/index.tsx`: reemplazar los `useEffect` con llamadas directas por el hook `useCategories()` que consume `categoryService.ts`. | Yesica | Pendiente |
| S2-T08 | Crear las pantallas de módulo de contenido: `app/category/[slug].tsx` (lista de lecciones con progreso) y `app/lesson/[id].tsx` (carga preguntas desde `questionService`). | Yesica | Pendiente |

### Criterios de Aceptación

- [ ] Ningún archivo bajo `app/` contiene `import { supabase }` directo.
- [ ] El flujo de login y registro funciona end-to-end contra Supabase local; el registro crea automáticamente el perfil en la tabla `profiles`.
- [ ] La pantalla Home muestra las 3 categorías (Abecedario, Números, Palabras) con el porcentaje de progreso del usuario autenticado.
- [ ] `grep -rn "supabase\.from\|supabase\.auth" app/` no devuelve ningún resultado.
- [ ] `tsc --noEmit` dentro del contenedor no arroja errores.

---

## Sprint 3 — Gamificación Global, Exámenes de Nivel y Traductor de Voz

**Objetivo general:** Implementar el motor centralizado de gamificación (`GameContext`) con soporte para exámenes de nivel bloqueantes, conectar el flujo de deducción de vidas y acumulación de XP a la base de datos, e implementar el módulo de Traductor de Voz con IA.

### Tareas

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S3-T01 | Definir tipos TypeScript en `src/types/game.ts`: `Question`, `Lesson`, `Level`, `Exam`, `GameState`, `GameContextType`. Incluir tipos para `ExamResult` y `TranslationRequest`. | Alejandro Padilla | Pendiente |
| S3-T02 | Crear `src/context/GameContext.tsx`: estado `lives` (init: 5), `xp`, `currentQuestionIndex`, `isBlocked`, `isExamBlocked`. Exponer: `checkAnswer()`, `loseLife()`, `gainXP()`, `resetLesson()`, `resetExam()`. | Alejandro Padilla | Pendiente |
| S3-T03 | Integrar `GameProvider` en `app/_layout.tsx`. | Alejandro Padilla | Pendiente |
| S3-T04 | Crear `src/services/progressService.ts`: funciones `saveLessonProgress(userId, lessonId, xp)`, `saveExamResult(userId, levelId, score)` y `unlockLevel(userId, levelId)`. Todas deben usar migraciones; ninguna usa `upsert` directo fuera del servicio. | Oscar Segovia | Pendiente |
| S3-T05 | Crear `src/services/examService.ts`: función `fetchExam(levelId)` que obtiene el examen y sus preguntas mediante join entre `exams` y `exam_questions`. | Oscar Segovia | Pendiente |
| S3-T06 | Crear pantalla de examen `app/level/exam/[levelId].tsx`: carga el examen desde `examService`, conecta al `GameContext`, muestra barra de progreso y bloquea al agotar vidas. | Yesica | Pendiente |
| S3-T07 | Crear pantalla de bloqueo `app/lesson/blocked.tsx` y `app/level/exam/blocked.tsx`: se muestran cuando `isBlocked` o `isExamBlocked` son `true`. Sin `window.alert`. | Yesica | Pendiente |
| S3-T08 | Crear `src/services/voiceService.ts`: función `transcribeAndTranslate(audioBlob, direction)` que encapsula la llamada al servicio de IA externo (API REST). Manejar errores de red y de calidad de audio. | Oscar Segovia | Pendiente |
| S3-T09 | Crear pantalla del traductor `app/translator/index.tsx`: captura de audio con `MediaRecorder`, llamada a `voiceService`, visualización de transcripción y traducción, síntesis de voz con `window.speechSynthesis`. Sin `window.alert`. | Yesica | Pendiente |

### Criterios de Aceptación

- [ ] `GameContext` gestiona correctamente los estados de lección y de examen de forma independiente.
- [ ] Al completar un examen con aprobación, la tabla `level_progress` actualiza `unlocked = true` y el siguiente nivel aparece desbloqueado en la pantalla.
- [ ] Al agotar las vidas durante un examen, la pantalla de bloqueo se muestra y el examen no se marca como aprobado.
- [ ] El módulo de Traductor captura audio, muestra la transcripción y la traducción sin usar `window.alert` ni `Alert.alert`.
- [ ] `tsc --noEmit` dentro del contenedor no arroja errores.

---

## Sprint 4 — Integración Final, QA y Pulido de Producto

**Objetivo general:** Conectar todos los módulos (lecciones, exámenes, traductor, perfil de usuario), implementar pruebas automatizadas de los flujos críticos, validar el cumplimiento de todas las reglas de arquitectura y pulir la experiencia de usuario para la entrega académica final.

### Tareas

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S4-T01 | Crear pantalla de perfil `app/profile/index.tsx`: muestra XP total del usuario (desde `profiles.total_xp`), niveles desbloqueados y progreso por categoría. | Yesica | Pendiente |
| S4-T02 | Implementar retroalimentación visual verde/rojo en lecciones y exámenes (sin `window.alert` ni `Alert.alert`). | Yesica | Pendiente |
| S4-T03 | Crear pantalla de resultados `app/lesson/results.tsx` y `app/level/exam/results.tsx`: muestra XP ganado, porcentaje de aciertos y botones de repetir/continuar. | Yesica | Pendiente |
| S4-T04 | Escribir tests unitarios con Jest para `GameContext`: verificar `loseLife()`, `gainXP()`, `isBlocked`, `isExamBlocked` y `resetExam()`. | Alejandro Padilla | Pendiente |
| S4-T05 | Escribir test de flujo E2E para el CU-03 (lección completa) y CU-05 (examen de nivel aprobado). | Alejandro Padilla | Pendiente |
| S4-T06 | Ejecutar auditoria final de arquitectura: `grep -r "window.alert" .`, `grep -r "style={{" app/`, `grep -r "supabase\.from\|supabase\.auth" app/`. Los tres deben retornar vacío. | Oscar Segovia | Pendiente |
| S4-T07 | Verificar que toda modificación de BD se realizó mediante migraciones: `ls supabase/migrations/` debe listar todos los cambios de esquema; ninguno debe haberse aplicado directamente desde Studio. | Oscar Segovia | Pendiente |
| S4-T08 | Ejecutar `tsc --noEmit` y `npm run lint` dentro del contenedor y corregir todos los errores. | Oscar Segovia | Pendiente |
| S4-T09 | Actualizar `01-BITACORA_DESARROLLO.md` con todas las entradas de la Fase 2. | Equipo | Pendiente |

### Criterios de Aceptación

- [ ] El flujo completo (login → seleccionar categoría → resolver lección → rendir examen → ver perfil actualizado) funciona en `http://10.10.10.10:8081`.
- [ ] El módulo de Traductor de Voz traduce audio capturado por el micrófono sin errores de red ni de UI.
- [ ] Los tests unitarios de `GameContext` pasan al 100%.
- [ ] `tsc --noEmit` retorna sin errores.
- [ ] `npm run lint` retorna sin advertencias de nivel error.
- [ ] La auditoria de arquitectura (grep triple) no encuentra violaciones.
- [ ] `ls supabase/migrations/` muestra al menos 1 migración; no hay cambios de esquema sin versionar.
- [ ] La bitácora de desarrollo está actualizada con todas las entradas de la Fase 2.

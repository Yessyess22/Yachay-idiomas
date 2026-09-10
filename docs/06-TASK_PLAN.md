# Plan de Tareas y Distribución del Equipo — Yachay Quechua

**Versión:** 1.0 | **Fecha:** 2026-09-08

---

## Perfiles del Equipo

| Desarrollador | Rol principal | Énfasis técnico |
| :--- | :--- | :--- |
| **Yesica Escobar** | Frontend Developer | UI/UX, pantallas de lecciones, componentes visuales, flujo de navegación Expo Router |
| **Oscar Segovia** | DevOps / Backend | Infraestructura Docker, configuración de red, servicios API, cliente Supabase |
| **Alejandro Padilla** | Domain Logic / QA | Lógica de dominio, GameContext, control de estado global, calidad de código y tests |

---

## Matriz de Responsabilidades (RACI)

R = Responsable de ejecutar | A = Aprobador | C = Consultado | I = Informado

| Tarea | Yesica | Oscar Segovia | Alejandro Padilla |
| :--- | :---: | :---: | :---: |
| **Diseño del esquema relacional (DDL)** | C | C | **R/A** |
| **Creación del archivo de migración Supabase** | I | **R** | **A** |
| **Seed de datos de quechua (`supabase/seed.sql`)** | **R** | C | **A** |
| **Verificación de RLS y políticas de acceso** | I | **R** | **A** |
| Infraestructura Docker (`Dockerfile`, `docker-compose.yml`) | I | **R/A** | C |
| Configuración de red estática (`10.10.10.0/24`) | I | **R/A** | C |
| Estructura de directorios Clean Architecture | C | **R** | **A** |
| Cliente Supabase (`src/services/supabase.ts`) | I | **R/A** | C |
| Servicio de autenticación (`src/services/authService.ts`) | C | **R** | **A** |
| Servicio de categorías (`src/services/categoryService.ts`) | I | **R** | **A** |
| Servicio de exámenes (`src/services/examService.ts`) | I | **R** | **A** |
| Servicio de progreso (`src/services/progressService.ts`) | I | **R** | **A** |
| Servicio de voz (`src/services/voiceService.ts`) | C | **R** | **A** |
| Refactorización de `AuthContext.tsx` | **R** | I | **A** |
| Pantallas de Auth (`login.tsx`, `signup.tsx`) | **R/A** | I | C |
| Refactorización de pantallas de cursos/categorías | **R** | C | **A** |
| Tipos TypeScript (`src/types/`) | C | C | **R/A** |
| `GameContext.tsx` (motor de gamificación + exámenes) | C | I | **R/A** |
| Pantalla `app/lesson/[id].tsx` (motor interactivo) | **R** | I | **A** |
| Pantalla `app/level/exam/[levelId].tsx` (examen de nivel) | **R** | I | **A** |
| Pantalla del traductor `app/translator/index.tsx` | **R/A** | I | C |
| Pantalla de perfil `app/profile/index.tsx` | **R/A** | I | C |
| Pantallas de resultados y bloqueo | **R** | I | **A** |
| Tests unitarios de `GameContext` | C | I | **R/A** |
| Tests de flujo E2E | C | C | **R/A** |
| Auditoria final de arquitectura y migraciones | I | **R** | **A** |
| Actualización de bitácora (`01-BITACORA_DESARROLLO.md`) | **R** | **R** | **R** |

---

## Tablero de Tareas por Sprint

### Sprint 1 — Diseño de BD, Infraestructura Docker y Clean Architecture

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S1-T01 | Diseñar el esquema relacional completo (DDL): tablas, relaciones, CHECK, RLS. Revisión del equipo. | Alejandro Padilla | ⬜ Pendiente |
| S1-T02 | Crear archivo de migración en `supabase/migrations/` y aplicar con `supabase db push`. | Oscar Segovia | ⬜ Pendiente |
| S1-T03 | Crear seed en `supabase/seed.sql` con datos reales de quechua (≥3 categorías, ≥2 lecciones/cat., ≥5 preguntas/lección). | Alejandro Padilla + Yesica | ⬜ Pendiente |
| S1-T04 | Crear `Dockerfile` con `node:20-alpine` | Oscar Segovia | ⬜ Pendiente |
| S1-T05 | Crear `docker-compose.yml` con subred `10.10.10.0/24` e IP `10.10.10.10` | Oscar Segovia | ⬜ Pendiente |
| S1-T06 | Verificar acceso a `http://10.10.10.10:8081` desde el host | Oscar Segovia | ⬜ Pendiente |
| S1-T07 | Crear estructura `src/{context,services,utils,types,features}/` | Oscar Segovia | ⬜ Pendiente |
| S1-T08 | Actualizar gobernanza en `docs/` con alcance definitivo y esquema de BD | Equipo | ✅ Completado |
| S1-T09 | Personalizar o eliminar archivos plantilla de Expo (`explore.tsx`, `Collapsible.tsx`, etc.) | Yesica | ⬜ Pendiente |

---

### Sprint 2 — Auth, Capa de Datos y Módulos de Contenido

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S2-T01 | Crear `src/services/supabase.ts` (instancia única del cliente) | Oscar Segovia | ⬜ Pendiente |
| S2-T02 | Crear `src/services/authService.ts` (`signIn`, `signUp`, `signOut`, `createProfile`) | Oscar Segovia | ⬜ Pendiente |
| S2-T03 | Refactorizar `src/context/AuthContext.tsx` para consumir `authService` | Yesica | ⬜ Pendiente |
| S2-T04 | Refactorizar pantallas de auth para consumir solo `AuthContext` | Yesica | ⬜ Pendiente |
| S2-T05 | Crear `src/services/categoryService.ts` (`fetchCategories`, `fetchLessonsWithProgress`) | Oscar Segovia | ⬜ Pendiente |
| S2-T06 | Crear `src/services/questionService.ts` (`fetchQuestionsByLesson`) | Oscar Segovia | ⬜ Pendiente |
| S2-T07 | Refactorizar `app/(tabs)/index.tsx` y crear `app/category/[slug].tsx` | Yesica | ⬜ Pendiente |
| S2-T08 | Crear pantalla de lección `app/lesson/[id].tsx` consumiendo `questionService` | Yesica | ⬜ Pendiente |

---

### Sprint 3 — Gamificación Global, Exámenes de Nivel y Traductor de Voz

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S3-T01 | Definir tipos TypeScript en `src/types/game.ts` (`Question`, `Level`, `Exam`, `GameState`, `TranslationRequest`) | Alejandro Padilla | ⬜ Pendiente |
| S3-T02 | Crear `src/context/GameContext.tsx` (vidas, XP, `isBlocked`, `isExamBlocked`) | Alejandro Padilla | ⬜ Pendiente |
| S3-T03 | Integrar `GameProvider` en `app/_layout.tsx` | Alejandro Padilla | ⬜ Pendiente |
| S3-T04 | Crear `src/services/progressService.ts` (`saveLessonProgress`, `saveExamResult`, `unlockLevel`) | Oscar Segovia | ⬜ Pendiente |
| S3-T05 | Crear `src/services/examService.ts` (`fetchExam`) | Oscar Segovia | ⬜ Pendiente |
| S3-T06 | Crear pantalla de examen `app/level/exam/[levelId].tsx` | Yesica | ⬜ Pendiente |
| S3-T07 | Crear pantallas de bloqueo (`app/lesson/blocked.tsx`, `app/level/exam/blocked.tsx`) | Yesica | ⬜ Pendiente |
| S3-T08 | Crear `src/services/voiceService.ts` (`transcribeAndTranslate`) | Oscar Segovia | ⬜ Pendiente |
| S3-T09 | Crear pantalla del traductor `app/translator/index.tsx` | Yesica | ⬜ Pendiente |

---

### Sprint 4 — Integración Final, QA y Pulido de Producto

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :--- |
| S4-T01 | Crear pantalla de perfil `app/profile/index.tsx` (XP, niveles, progreso) | Yesica | ⬜ Pendiente |
| S4-T02 | Implementar retroalimentación visual verde/rojo en lecciones y exámenes | Yesica | ⬜ Pendiente |
| S4-T03 | Crear pantallas de resultados de lección y de examen | Yesica | ⬜ Pendiente |
| S4-T04 | Escribir tests unitarios de `GameContext` con Jest | Alejandro Padilla | ⬜ Pendiente |
| S4-T05 | Escribir tests E2E para CU-03 (lección) y CU-05 (examen de nivel) | Alejandro Padilla | ⬜ Pendiente |
| S4-T06 | Ejecutar auditoria final de arquitectura (`grep` triple) | Oscar Segovia | ⬜ Pendiente |
| S4-T07 | Verificar que todos los cambios de BD se realizaron mediante migraciones | Oscar Segovia | ⬜ Pendiente |
| S4-T08 | Corregir errores de `tsc --noEmit` y `npm run lint` | Oscar Segovia | ⬜ Pendiente |
| S4-T09 | Actualizar `01-BITACORA_DESARROLLO.md` con entradas de la Fase 2 | Equipo | ⬜ Pendiente |

---

## Convenciones de Estado

| Símbolo | Significado |
| :---: | :--- |
| ⬜ | Pendiente — no iniciada |
| 🔵 | En progreso — iniciada pero no completada |
| ✅ | Completada — criterios de aceptación verificados |
| 🔴 | Bloqueada — requiere resolución de dependencia |

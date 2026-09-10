# Plan de Sprints — Yachay Quechua

**Versión:** 1.2 | **Fecha:** 2026-09-10 | **Última actualización:** 2026-09-10 | **Duración por sprint:** ~2 semanas académicas

---

## Resumen del Roadmap

| Sprint | Nombre | Período estimado | Estado |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Diseño de BD, Infraestructura Docker y Clean Architecture | 2026-09-08 → 2026-09-19 | ✅ Completado |
| **Sprint 2** | Auth, Capa de Datos y Módulos Abecedario/Números/Palabras | 2026-09-22 → 2026-10-03 | ✅ Completado |
| **Sprint 3** | Gamificación Global, Exámenes de Nivel y Traductor de Voz | 2026-10-06 → 2026-10-17 | 🔵 Siguiente Sprint |
| **Sprint 4** | Integración Final, QA y Pulido de Producto | 2026-10-20 → 2026-10-31 | ⬜ Pendiente |

---

## Sprint 1 — Diseño de Base de Datos, Infraestructura Docker y Clean Architecture

**Estado:** ✅ **COMPLETADO (100%)**

### Tareas del Sprint 1

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S1-T01 | Diseñar el esquema relacional completo (DDL): 11 tablas en 3FN, relaciones, CHECK, RLS. | Alejandro Padilla | ✅ |
| S1-T02 | Crear archivo de migración en `supabase/migrations/` y aplicar en Supabase. | Oscar Segovia | ✅ |
| S1-T03 | Crear seed en `supabase/seed.sql` con 30 preguntas reales de Quechua y 120 opciones. | Alejandro Padilla + Yesica | ✅ |
| S1-T04 | Escribir `Dockerfile` con imagen `node:20-alpine`. | Oscar Segovia | ✅ |
| S1-T05 | Escribir `docker-compose.yml` con red `10.10.10.0/24` e IP estática `10.10.10.10`. | Oscar Segovia | ✅ |
| S1-T06 | Verificar conectividad y entorno Docker. | Oscar Segovia | ✅ |
| S1-T07 | Crear la estructura de directorios Clean Architecture (`src/{context,services,utils,types,features}/`). | Oscar Segovia | ✅ |
| S1-T08 | Crear y actualizar los documentos de gobernanza del proyecto en `docs/`. | Equipo | ✅ |
| S1-T09 | Limpieza de plantillas e implementación de tipos estáticos (`src/types/index.ts`). | Yesica | ✅ |

---

## Sprint 2 — Auth, Capa de Datos y Módulos de Contenido

**Estado:** ✅ **COMPLETADO (100%)**

### Tareas del Sprint 2

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S2-T01 | Crear `src/services/supabase.ts` (instancia unificada del cliente Supabase). | Oscar Segovia | ✅ |
| S2-T02 | Crear `src/services/authService.ts` (`signIn`, `signUp`, `signOut`, `getProfile`). | Oscar Segovia | ✅ |
| S2-T03 | Refactorizar `src/context/AuthContext.tsx` para consumir `authService`. | Yesica | ✅ |
| S2-T04 | Refactorizar pantallas de auth (`login.tsx`, `signup.tsx`) con nombre de usuario. | Yesica | ✅ |
| S2-T05 | Crear `src/services/categoryService.ts` (`fetchCategories`, `fetchLessonsWithProgress`). | Oscar Segovia | ✅ |
| S2-T06 | Crear `src/services/questionService.ts` (`fetchQuestionsByLesson`, `recordLessonProgress`). | Oscar Segovia | ✅ |
| S2-T07 | Refactorizar `app/(tabs)/index.tsx` y crear `app/category/[slug].tsx`. | Yesica | ✅ |
| S2-T08 | Crear pantalla interactiva de lección `app/lesson/[id].tsx` con feedback visual y XP. | Yesica | ✅ |
| S2-T09 | Crear pantalla de perfil de usuario `app/(tabs)/profile.tsx` con botón de Cerrar Sesión. | Yesica | ✅ |

---

## Sprint 3 — Gamificación Global, Exámenes de Nivel y Traductor de Voz

**Estado:** 🔵 **Siguiente Sprint**

### Tareas del Sprint 3

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S3-T01 | Definir tipos TypeScript en `src/types/game.ts` (`Question`, `Level`, `Exam`, `GameState`). | Alejandro Padilla | ⬜ |
| S3-T02 | Crear `src/context/GameContext.tsx` (vidas, XP, racha de días, bloqueos). | Alejandro Padilla | ⬜ |
| S3-T03 | Integrar `GameProvider` en `app/_layout.tsx`. | Alejandro Padilla | ⬜ |
| S3-T04 | Crear `src/services/progressService.ts` y `src/services/examService.ts`. | Oscar Segovia | ⬜ |
| S3-T05 | Crear pantalla de examen `app/level/exam/[levelId].tsx`. | Yesica | ⬜ |
| S3-T06 | Crear pantallas de bloqueo (`blocked.tsx`). | Yesica | ⬜ |
| S3-T07 | Crear `src/services/voiceService.ts` y pantalla del traductor `app/translator/index.tsx`. | Yesica / Oscar | ⬜ |

# Plan de Sprints — Yachay Quechua

**Versión:** 1.3 | **Fecha:** 2026-09-10 | **Última actualización:** 2026-09-12 | **Duración por sprint:** ~2 semanas académicas

---

## Resumen del Roadmap

| Sprint | Nombre | Período estimado | Estado |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Diseño de BD, Infraestructura Docker y Clean Architecture | 2026-09-08 → 2026-09-19 | ✅ Completado |
| **Sprint 2** | Auth, Capa de Datos y Módulos Abecedario/Números/Palabras | 2026-09-22 → 2026-10-03 | ✅ Completado |
| **Sprint 3** | Gamificación Global, Exámenes de Nivel y Traductor de Voz | 2026-10-06 → 2026-10-17 | ✅ Completado (adelantado, cerrado el 2026-09-12) |
| **Sprint 4** | Integración Final, QA y Pulido de Producto | 2026-10-20 → 2026-10-31 | 🔵 Sprint Activo |

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

**Estado:** ✅ **COMPLETADO (100%)**

### Tareas del Sprint 3

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S3-T01 | Definir tipos TypeScript de gamificación en `src/types/index.ts` (`ShopItem`, `DailyQuest`, `Badge`, `LeaderboardEntry`, `Level`, `Exam`). | Alejandro Padilla | ✅ |
| S3-T02 | Crear `src/context/GameContext.tsx` (vidas, XP, gemas, racha de días, bloqueos). | Alejandro Padilla | ✅ |
| S3-T03 | Integrar `GameProvider` en `app/_layout.tsx`. | Alejandro Padilla | ✅ |
| S3-T04 | Crear `src/services/progressService.ts` y `src/services/examService.ts`. | Oscar Segovia | ✅ |
| S3-T05 | Crear pantalla de examen `app/level/exam/[levelId].tsx`. | Yesica | ✅ |
| S3-T06 | Crear pantallas de bloqueo (`blocked.tsx`). | Yesica | ✅ |
| S3-T07 | Crear `src/services/voiceService.ts` y pantalla del traductor `app/translator/index.tsx`. | Yesica / Oscar | ✅ |
| S3-T08 *(extra)* | Migración `20260912000000_gamification_and_exercises.sql`: columnas de gamificación en `profiles` y tablas `daily_quests`, `user_quests`, `badges`, `user_badges`, `leaderboard_weekly`, `shop_items`, `user_inventory`. | Alejandro Padilla | ✅ |
| S3-T09 *(extra)* | Pantallas de Ligas (`(tabs)/leaderboard.tsx`), Tienda (`(tabs)/shop.tsx`) y Guía Gramatical (`guidebook/[id].tsx`). | Yessyess22 | ✅ |
| S3-T10 *(extra)* | Ejercicios de banco de palabras y pares (`components/yachay/exercises/`). | Yessyess22 | ✅ |

> **Nota:** `GameContext` gestiona vidas/XP/gemas/racha en memoria y todavía no persiste contra las columnas de gamificación de `profiles`; `leaderboardService` calcula el ranking desde `profiles.total_xp` en vez de `leaderboard_weekly`. Ver GAP-06 en `05-FINDINGS_DEUDA.md`.

---

## Sprint 4 — Integración Final, QA y Pulido de Producto

**Estado:** 🔵 **Sprint Activo**

### Tareas del Sprint 4

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S4-T01 | Escribir tests unitarios de `GameContext` con Jest. | Alejandro Padilla | ⬜ |
| S4-T02 | Escribir tests de flujo E2E. | Alejandro Padilla | ⬜ |
| S4-T03 | Ejecutar auditoría final de arquitectura (`grep` triple: sin `supabase.from` en `app/`, sin estilos inline, sin diálogos nativos). | Oscar Segovia | ⬜ |
| S4-T04 | Persistir `GameContext` (vidas, gemas, XP, racha) contra `profiles` en Supabase. | Alejandro Padilla | ⬜ |
| S4-T05 | Conectar `leaderboardService` a `leaderboard_weekly` y `shop.tsx` a `shopService.fetchShopItems()`. | Oscar Segovia | ⬜ |

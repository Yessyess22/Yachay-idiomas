# Memoria de Sesión Activa — Yachay Quechua

Este archivo es la ancla de contexto obligatoria para que el asistente de IA o cualquier desarrollador del equipo sepa el estado actual de las tareas y las restricciones del proyecto antes de escribir código. Se debe mantener actualizado al inicio y cierre de cada sesión.

---

## Estado Actual

| Campo | Valor |
| :--- | :--- |
| **Fase** | Fase 3 — Gamificación Global, Exámenes de Nivel y Traductor de Voz |
| **Sprint activo** | **Sprint 4: Integración Final, QA y Pulido de Producto** |
| **Sprints Completados** | **Sprint 1 (100% ✅)**, **Sprint 2 (100% ✅)** y **Sprint 3 (100% ✅)** |
| **Fecha de actualización** | 2026-09-12 |
| **Responsables** | Oscar Segovia, Yesica Escobar, Alejandro Padilla |
| **Estado del Backend** | ✅ Esquema relacional 3FN en Supabase cloud (11 tablas base: `profiles`, `categories`, `lessons`, `questions`, `question_options`, `levels`, `exams`, `exam_questions`, `lesson_progress`, `level_progress`, `translation_history`) más la migración `20260912000000_gamification_and_exercises.sql` que agrega gamificación a `profiles` (`gems`, `lives`, `streak_count`, `streak_freeze_count`, `last_active_date`, `last_life_lost_at`) y las tablas `daily_quests`, `user_quests`, `badges`, `user_badges`, `leaderboard_weekly`, `shop_items`, `user_inventory`, todas con RLS. |
| **Estado del Frontend** | ✅ Sprint 3 completo: `GameContext` (vidas, XP, gemas, racha), lección en dos fases (Teoría → Quiz), exámenes de nivel bloqueantes (`level/exam/[levelId].tsx`), pantalla de bloqueo (`blocked.tsx`), traductor de voz (`translator/index.tsx`), Ligas (`(tabs)/leaderboard.tsx`), Tienda (`(tabs)/shop.tsx`) y Guía Gramatical (`guidebook/[id].tsx`). |
| **Deuda conocida** | `GameContext` es estado local en memoria — no persiste contra las columnas de gamificación de `profiles` (ver GAP-06 en `05-FINDINGS_DEUDA.md`). `leaderboardService` no usa aún la tabla `leaderboard_weekly`. |

---

## Objetivos del Sprint 1, Sprint 2 y Sprint 3 — Estado Final

- [x] **S1-T01 a S1-T06** Esquema relacional 3FN, migración inicial, seed, Docker (`10.10.10.0/24`), estructura Clean Architecture y documentación de gobernanza.
- [x] **S2-T01 a S2-T08** Capa de servicios (`authService`, `categoryService`, `questionService`, `supabase.ts`), `AuthContext`, refactorización de Home, Detalle de Categoría, Lección interactiva y Perfil de Usuario con Logout.
- [x] **S3-T01 / S3-T02** `GameContext.tsx` (vidas, XP, gemas, racha de días) integrado vía `GameProvider` en `app/_layout.tsx`.
- [x] **S3-T03 / S3-T04** Servicios `examService.ts` y `progressService.ts` (exámenes de fin de nivel y desbloqueo en `level_progress`).
- [x] **S3-T05 / S3-T06** Pantalla de evaluación `app/level/exam/[levelId].tsx` y pantalla de bloqueo `app/blocked.tsx`.
- [x] **S3-T07 / S3-T08** Servicio de voz/traductor `voiceService.ts` y pantalla `app/translator/index.tsx`.
- [x] **Extras de cierre de Sprint 3** Ligas (`leaderboard.tsx`), Tienda (`shop.tsx`), Guía Gramatical (`guidebook/[id].tsx`), ejercicios de banco de palabras y pares, y migración de gamificación en Supabase.

---

## Próximo Objetivo: Sprint 4

- [ ] **S4-T01** Escribir tests unitarios de `GameContext` con Jest.
- [ ] **S4-T02** Escribir tests de flujo E2E.
- [ ] **S4-T03** Ejecutar auditoría final de arquitectura (`grep` triple: sin `supabase.from` en `app/`, sin estilos inline, sin diálogos nativos).
- [ ] **Nuevo** Persistir `GameContext` contra las columnas de gamificación de `profiles` (vidas, gemas, XP, racha) — ver GAP-06.
- [ ] **Nuevo** Conectar `leaderboardService` a la tabla `leaderboard_weekly` y `shop.tsx` a `shopService.fetchShopItems()`.

---

## Contexto Técnico y Decisiones de Arquitectura

### 1. Aislamiento Docker
Contenedor Expo Web configurado en `Dockerfile` (`node:20-alpine`) y `docker-compose.yml`.

### 2. Red Estática
| Recurso | IP / Puerto |
| :--- | :--- |
| Subred Docker | `10.10.10.0/24` |
| Contenedor Expo Web | `10.10.10.10:8081` |

### 3. Clean Architecture — Feature-First (0 llamadas directas en `app/`)
Flujo de datos estrictamente unificado:
`Vista UI (app/) -> Contexto/Hook (src/context/) -> Servicio (src/services/) -> Cliente Supabase (src/services/supabase.ts)`

---

## Registro de Sesiones

| Fecha | Desarrollador | Acción realizada |
| :--- | :--- | :--- |
| 2026-09-08 | Equipo | Apertura del Sprint 1 — Fase 2. Creación de documentos de referencia (`01-BITACORA_DESARROLLO.md`, `02-SESSION_MEM.md`). |
| 2026-09-10 | Equipo | Ejecución y cierre de Sprint 1 y Sprint 2. Migración DDL y Seed aplicados en Supabase, Clean Architecture implementada (`src/services/`), refactor de telas UI (Home, Categorías, Lecciones, Perfil y Logout) y cero errores de TypeScript en compilación. |
| 2026-09-11 | Alejandro (con asistencia de Claude Sonnet 4.6) | Ejecución de Sprint 3: `GameContext`, lección en dos fases, exámenes de nivel bloqueantes, pantalla de bloqueo y traductor de voz con IA. |
| 2026-09-12 | Yessyess22 | Cierre de Sprint 3: Ligas, Tienda, Guía Gramatical, ejercicios de banco de palabras y pares, migración de gamificación (`daily_quests`, `badges`, `leaderboard_weekly`, `shop_items`) y actualización de Perfil/Dashboard. Apertura de Sprint 4 y actualización de toda la documentación (`README.md`, `CONTEXTO_PROYECTO.md`, `docs/`) al estado real del repositorio. |

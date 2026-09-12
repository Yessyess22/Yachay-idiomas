# Plan de Tareas y Distribución del Equipo — Yachay Quechua

**Versión:** 1.3 | **Fecha:** 2026-09-12

---

## Perfiles del Equipo

| Desarrollador | Rol principal | Énfasis técnico |
| :--- | :--- | :--- |
| **Yesica Escobar** | Frontend Developer | UI/UX, pantallas de lecciones, componentes visuales, flujo de navegación Expo Router |
| **Oscar Segovia** | DevOps / Backend | Infraestructura Docker, configuración de red, servicios API, cliente Supabase |
| **Alejandro Padilla** | Domain Logic / QA | Lógica de dominio, GameContext, control de estado global, calidad de código y tests |

---

## Tablero de Tareas por Sprint

### Sprint 1 — Diseño de BD, Infraestructura Docker y Clean Architecture

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S1-T01 | Diseñar el esquema relacional completo (DDL): tablas, relaciones, CHECK, RLS. | Alejandro Padilla | ✅ Completado |
| S1-T02 | Crear archivo de migración en `supabase/migrations/` y aplicar en Supabase. | Oscar Segovia | ✅ Completado |
| S1-T03 | Crear seed en `supabase/seed.sql` con datos reales de quechua (30 preguntas, 120 opciones). | Alejandro + Yesica | ✅ Completado |
| S1-T04 | Crear `Dockerfile` con `node:20-alpine` | Oscar Segovia | ✅ Completado |
| S1-T05 | Crear `docker-compose.yml` con subred `10.10.10.0/24` e IP `10.10.10.10` | Oscar Segovia | ✅ Completado |
| S1-T06 | Verificar conectividad y entorno Docker (`expo-asset` e IP estática) | Oscar Segovia | ✅ Completado |
| S1-T07 | Crear estructura `src/{context,services,utils,types,features}/` | Oscar Segovia | ✅ Completado |
| S1-T08 | Actualizar gobernanza en `docs/` con alcance definitivo y esquema de BD | Equipo | ✅ Completado |
| S1-T09 | Adaptar tipos estáticos (`src/types/index.ts`) y limpiar plantillas | Yesica | ✅ Completado |

---

### Sprint 2 — Auth, Capa de Datos y Módulos de Contenido

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S2-T01 | Crear `src/services/supabase.ts` (instancia única del cliente) | Oscar Segovia | ✅ Completado |
| S2-T02 | Crear `src/services/authService.ts` (`signIn`, `signUp`, `signOut`, `getProfile`) | Oscar Segovia | ✅ Completado |
| S2-T03 | Refactorizar `src/context/AuthContext.tsx` para consumir `authService` | Yesica | ✅ Completado |
| S2-T04 | Refactorizar pantallas de auth (`login.tsx`, `signup.tsx`) | Yesica | ✅ Completado |
| S2-T05 | Crear `src/services/categoryService.ts` (`fetchCategories`, `fetchLessonsWithProgress`) | Oscar Segovia | ✅ Completado |
| S2-T06 | Crear `src/services/questionService.ts` (`fetchQuestionsByLesson`, `recordLessonProgress`) | Oscar Segovia | ✅ Completado |
| S2-T07 | Refactorizar `app/(tabs)/index.tsx` y crear `app/category/[slug].tsx` | Yesica | ✅ Completado |
| S2-T08 | Crear pantalla de lección `app/lesson/[id].tsx` consumiendo `questionService` | Yesica | ✅ Completado |
| S2-T09 | Crear pantalla de Perfil `app/(tabs)/profile.tsx` con botón de Cerrar Sesión | Yesica | ✅ Completado |

---

### Sprint 3 — Gamificación Global, Exámenes de Nivel y Traductor de Voz

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S3-T01 | Definir tipos TypeScript de gamificación en `src/types/index.ts` | Alejandro Padilla | ✅ Completado |
| S3-T02 | Crear `src/context/GameContext.tsx` (vidas, XP, gemas, racha, `isBlocked`) | Alejandro Padilla | ✅ Completado |
| S3-T03 | Integrar `GameProvider` en `app/_layout.tsx` | Alejandro Padilla | ✅ Completado |
| S3-T04 | Crear `src/services/progressService.ts` y `src/services/examService.ts` | Oscar Segovia | ✅ Completado |
| S3-T05 | Crear pantalla de examen `app/level/exam/[levelId].tsx` | Yesica | ✅ Completado |
| S3-T06 | Crear pantallas de bloqueo (`blocked.tsx`) | Yesica | ✅ Completado |
| S3-T07 | Crear `src/services/voiceService.ts` y pantalla del traductor `app/translator/index.tsx` | Yesica / Oscar | ✅ Completado |
| S3-T08 *(extra)* | Migración de gamificación (`daily_quests`, `badges`, `leaderboard_weekly`, `shop_items`, `user_inventory`) | Alejandro Padilla | ✅ Completado |
| S3-T09 *(extra)* | Pantallas de Ligas (`leaderboard.tsx`), Tienda (`shop.tsx`) y Guía Gramatical (`guidebook/[id].tsx`) | Yessyess22 | ✅ Completado |
| S3-T10 *(extra)* | Ejercicios de banco de palabras y pares (`components/yachay/exercises/`) | Yessyess22 | ✅ Completado |

---

### Sprint 4 — Integración Final, QA y Pulido de Producto

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S4-T01 | Escribir tests unitarios de `GameContext` con Jest | Alejandro Padilla | ⬜ Pendiente |
| S4-T02 | Escribir tests de flujo E2E | Alejandro Padilla | ⬜ Pendiente |
| S4-T03 | Ejecutar auditoría final de arquitectura (`grep` triple) | Oscar Segovia | ⬜ Pendiente |
| S4-T04 | Verificar compilación limpia de TypeScript (`tsc --noEmit`) | Oscar Segovia | ✅ Completado |
| S4-T05 | Actualizar `01-BITACORA_DESARROLLO.md` | Equipo | ✅ Completado |
| S4-T06 *(nueva)* | Persistir `GameContext` (vidas, gemas, XP, racha) contra `profiles` en Supabase | Alejandro Padilla | ⬜ Pendiente |
| S4-T07 *(nueva)* | Conectar `leaderboardService` a `leaderboard_weekly` y `shop.tsx` a `shopService.fetchShopItems()` | Oscar Segovia | ⬜ Pendiente |

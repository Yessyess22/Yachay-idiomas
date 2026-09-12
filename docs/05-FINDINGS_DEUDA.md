# Registro de Deuda Técnica y Hallazgos — Yachay Quechua

**Versión:** 1.2 | **Fecha de actualización:** 2026-09-12 | **Estado:** Vivo

Este documento es el registro vivo de todas las deficiencias de arquitectura, deuda técnica y debilidades identificadas en el repositorio. Cada entrada (GAP) tiene un propietario responsable de su resolución y el sprint objetivo en que debe cerrarse. Los GAPs no se eliminan; se marcan como resueltos y se documenta la solución aplicada.

---

## Índice de GAPs

| ID | Título | Severidad | Propietario | Sprint objetivo | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| GAP-01 | Ausencia de infraestructura Docker y red estática | 🔴 Crítico | Oscar Segovia | Sprint 1 | ✅ Resuelto |
| GAP-02 | Acoplamiento de llamadas de BD en las vistas | 🟡 Medio | Yesica + Oscar Segovia | Sprint 2 | ✅ Resuelto |
| GAP-03 | Ausencia de pruebas automatizadas | 🟢 Bajo | Equipo | Sprint 4 | Abierto |
| GAP-04 | Archivos plantilla de Expo sin personalizar | 🟢 Bajo | Yesica | Sprint 1 | ✅ Resuelto |
| GAP-05 | Ausencia de esquema de BD para Niveles y Traductor de Voz | 🔴 Alto | Alejandro Padilla | Sprint 1 | ✅ Resuelto |
| GAP-06 | `GameContext` no persiste vidas/XP/gemas/racha contra `profiles` | 🔴 Alto | Alejandro Padilla | Sprint 4 | Abierto |
| GAP-07 | Servicios de gamificación no conectados a las tablas creadas (`leaderboard_weekly`, `shop_items`) | 🟡 Medio | Oscar Segovia | Sprint 4 | Abierto |

---

## GAP-01 — Ausencia de Infraestructura Docker y Red Estática

**Severidad:** 🔴 Crítico
**Propietario:** Oscar Segovia
**Sprint objetivo:** Sprint 1
**Estado:** ✅ Resuelto

### Solución Aplicada
1. Se creó `Dockerfile` con `node:20-alpine`, `expo-asset` e instalación de dependencias.
2. Se creó `docker-compose.yml` asignando subred `10.10.10.0/24` e IP fija `10.10.10.10`.

---

## GAP-02 — Acoplamiento de Llamadas a BD en Vistas

**Severidad:** 🟡 Medio
**Propietario:** Yesica + Oscar Segovia
**Sprint objetivo:** Sprint 2
**Estado:** ✅ Resuelto

### Solución Aplicada
Se implementó Clean Architecture bajo `src/services/` (`authService.ts`, `categoryService.ts`, `questionService.ts`, `supabase.ts`). Se desacoplaron totalmente las vistas en `app/` (0 llamadas a `supabase.from` directas en vistas UI).

---

## GAP-04 — Archivos Plantilla de Expo sin Personalizar

**Severidad:** 🟢 Bajo
**Propietario:** Yesica
**Sprint objetivo:** Sprint 1
**Estado:** ✅ Resuelto

### Solución Aplicada
Se refactorizaron `src/types/index.ts` y las pantallas base. Se reemplazó el contenido de `explore.tsx` con guía educativa sobre el idioma Quechua y la app Yachay.

---

## GAP-05 — Ausencia de Esquema de BD para Niveles y Traductor

**Severidad:** 🔴 Alto
**Propietario:** Alejandro Padilla
**Sprint objetivo:** Sprint 1
**Estado:** ✅ Resuelto

### Solución Aplicada
Se creó la migración 3FN `20260910000000_initial_yachay_schema.sql` con las 11 tablas del sistema (`profiles`, `categories`, `lessons`, `questions`, `question_options`, `levels`, `exams`, `exam_questions`, `lesson_progress`, `level_progress`, `translation_history`).

---

## GAP-06 — `GameContext` No Persiste Vidas/XP/Gemas/Racha

**Severidad:** 🔴 Alto
**Propietario:** Alejandro Padilla
**Sprint objetivo:** Sprint 4
**Estado:** Abierto

### Descripción
`src/context/GameContext.tsx` gestiona `lives`, `xp`, `gems` y `streakDays` con un `useReducer` cuyo estado inicial es fijo (`lives: 5`, `gems: 100`, `streakDays: 3`) y vive solo en memoria del cliente. La migración `20260912000000_gamification_and_exercises.sql` ya agregó las columnas equivalentes en `profiles` (`lives`, `gems`, `streak_count`, `streak_freeze_count`, `last_active_date`, `last_life_lost_at`), pero ningún servicio lee ese estado al iniciar sesión ni lo escribe de vuelta cuando cambia. Consecuencia: el progreso de vidas/gemas/racha se pierde al recargar la app, cerrar sesión o cambiar de dispositivo, y dos usuarios en el mismo dispositivo verían el mismo estado de juego "de fábrica".

### Solución Propuesta
Inicializar `GameContext` leyendo `profiles` vía `authService.getProfile()` al montar `GameProvider`, y sincronizar cada cambio de vidas/XP/gemas/racha contra Supabase (debounced o al finalizar cada lección/examen).

---

## GAP-07 — Servicios de Gamificación No Conectados a sus Tablas

**Severidad:** 🟡 Medio
**Propietario:** Oscar Segovia
**Sprint objetivo:** Sprint 4
**Estado:** Abierto

### Descripción
La migración de gamificación creó `leaderboard_weekly` y `shop_items`, pero: (1) `leaderboardService.fetchWeeklyLeaderboard()` consulta `profiles.total_xp` directamente en lugar de `leaderboard_weekly`, por lo que las ligas no reflejan `weekly_xp` ni `league_tier`; (2) `app/(tabs)/shop.tsx` renderiza una lista de ítems hardcodeada (`DEFAULT_SHOP_ITEMS`) en vez de invocar `shopService.fetchShopItems()`, que sí existe y consulta `shop_items`.

### Solución Propuesta
Conectar `leaderboardService` a `leaderboard_weekly` (con un job o trigger que acumule `weekly_xp`), y reemplazar `DEFAULT_SHOP_ITEMS` en `shop.tsx` por la llamada real a `shopService.fetchShopItems()`.

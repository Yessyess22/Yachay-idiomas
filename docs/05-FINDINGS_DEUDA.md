# Registro de Deuda Técnica y Hallazgos — Yachay Quechua

**Versión:** 2.1 | **Fecha de actualización:** 2026-09-26 | **Estado:** Vivo (0 GAPs pendientes)

Este documento es el registro vivo de todas las deficiencias de arquitectura, deuda técnica y debilidades identificadas en el repositorio. Cada entrada (GAP) tiene un propietario responsable de su resolución y el sprint objetivo en que fue cerrado. Los GAPs no se eliminan; se marcan como resueltos y se documenta la solución aplicada.

---

## Índice de GAPs

| ID | Título | Severidad | Propietario | Sprint objetivo | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| GAP-01 | Ausencia de infraestructura Docker y red estática | 🔴 Crítico | Oscar Segovia | Sprint 1 | ✅ Resuelto |
| GAP-02 | Acoplamiento de llamadas de BD en las vistas | 🟡 Medio | Yesica + Oscar Segovia | Sprint 2 | ✅ Resuelto |
| GAP-03 | Ausencia de pruebas automatizadas | 🟢 Bajo | Alejandro Padilla | Sprint 4 / 6 | ✅ Resuelto |
| GAP-04 | Archivos plantilla de Expo sin personalizar | 🟢 Bajo | Yesica | Sprint 1 | ✅ Resuelto |
| GAP-05 | Ausencia de esquema de BD para Niveles y Traductor de Voz | 🔴 Alto | Alejandro Padilla | Sprint 1 | ✅ Resuelto |
| GAP-06 | `GameContext` no persiste vidas/XP/gemas/racha contra `profiles` | 🔴 Alto | Alejandro Padilla | Sprint 4 | ✅ Resuelto |
| GAP-07 | Servicios de gamificación no conectados a las tablas creadas (`leaderboard_weekly`, `shop_items`) | 🟡 Medio | Oscar Segovia | Sprint 4 | ✅ Resuelto |

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

## GAP-03 — Ausencia de Pruebas Automatizadas

**Severidad:** 🟢 Bajo
**Propietario:** Alejandro Padilla
**Sprint objetivo:** Sprint 4 / Sprint 6
**Estado:** ✅ Resuelto

### Solución Aplicada
1. Se configuró Jest con preset `jest-expo` y `@react-native/jest-preset` en `package.json`.
2. Se creó `__tests__/GameContext.test.tsx` cubriendo el reductor de estado inicial, el descuento de vidas con redirección a bloqueo y la hidratación desde perfil.
3. Se creó `__tests__/voiceService.test.ts` evaluando la limpieza fonética, parsing y fallbacks de voz.

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
**Estado:** ✅ Resuelto

### Solución Aplicada
Se implementó el componente `ProfileHydrator` en `app/_layout.tsx` que invoca `gameContext.hydrateFromProfile()` al autenticarse. Las mutaciones de vidas, gemas, XP y racha se persisten asíncronamente con un efecto debounced (800 ms) llamando a `authService.updateGameState()` hacia la tabla `profiles` en Supabase.

---

## GAP-07 — Servicios de Gamificación No Conectados a sus Tablas

**Severidad:** 🟡 Medio
**Propietario:** Oscar Segovia
**Sprint objetivo:** Sprint 4
**Estado:** ✅ Resuelto

### Solución Aplicada
1. `leaderboardService.fetchWeeklyLeaderboard()` se actualizó para realizar un JOIN entre `leaderboard_weekly` y `profiles`, devolviendo la clasificación por `weekly_xp` y `league_tier`.
2. `shop.tsx` se conectó a `shopService.fetchShopItems()`, obteniendo la lista dinámica de ítems y cosméticos almacenados en la tabla `shop_items`.


---

## Nota de auditoría Sprint 8 — Invariantes de Arquitectura (2026-09-26)

Sprint 8 ejecutó la triple auditoría grep completa dentro del contenedor Docker. Resultados:

| Invariante | Verificación | Resultado |
| :--- | :--- | :---: |
| **INV-01** — Sin llamadas directas a Supabase en `app/` | `grep -r "from.*services/supabase" app/` | ✅ 0 hallazgos |
| **INV-02** — Sin estilos inline JSX | `grep -rn "style={{" app/` | ✅ 0 hallazgos no autorizados |
| **INV-03** — Sin `Alert.alert`/`window.alert` en lecciones | `grep -r "Alert\.alert\|window\.alert" app/` | ✅ 0 hallazgos |
| **INV-04** — Sin monetización real | Revisión manual (`stripe`/`paypal` ausentes) | ✅ Confirmado |
| **INV-06** — Mascota Yachi exportada solo desde `src/assets/images/index.ts` | `grep -r "require.*assets/images/yachi" app/` | ✅ 0 hallazgos directos |

No se abrieron nuevos GAPs en Sprint 8.

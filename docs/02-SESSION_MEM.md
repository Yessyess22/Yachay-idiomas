# Memoria de Sesión Activa — Yachay Quechua

Este archivo es la ancla de contexto obligatoria para que el asistente de IA o cualquier desarrollador del equipo sepa el estado actual de las tareas y las restricciones del proyecto antes de escribir código. Se debe mantener actualizado al inicio y cierre de cada sesión.

---

## Estado Actual

| Campo | Valor |
| :--- | :--- |
| **Fase** | Fase 4 — Onboarding, Integración Final, QA y Pulido (No Comercial v2.0) |
| **Sprint activo** | **Sprint 4: Onboarding Inmersivo, Persistencia GameContext, Cierre GAP-06/GAP-07** |
| **Sprints Completados** | **Sprint 1 (100% ✅)**, **Sprint 2 (100% ✅)** y **Sprint 3 (100% ✅)** |
| **Fecha de actualización** | 2026-09-14 |
| **Responsables** | Oscar Segovia, Yesica Escobar, Alejandro Padilla |
| **Estado del Backend** | ✅ Esquema relacional 3FN en Supabase cloud con gamificación completa: `profiles` (con columnas `gems`, `lives`, `streak_count`, `streak_freeze_count`, `last_active_date`, `last_life_lost_at`), `daily_quests`, `user_quests`, `badges`, `user_badges`, `leaderboard_weekly`, `shop_items`, `user_inventory`. Todas con RLS. |
| **Estado del Frontend** | 🔵 Sprint 4 en curso: `app/onboarding/index.tsx` (nuevo), `GameContext` con persistencia Supabase (hydrate + sync debounced), `leaderboardService` conectado a `leaderboard_weekly`, dashboard renombrado "Camino del Saber". |
| **Deuda cerrada** | GAP-06: `GameContext` ahora hidrata desde `profiles` y sincroniza mutaciones. GAP-07: `leaderboardService` usa `leaderboard_weekly`; `shop.tsx` ya usaba `shopService.fetchShopItems()`. |
| **Deuda pendiente** | GAP-03: Tests unitarios Jest de `GameContext` y E2E aún pendientes (S4-T05). Compilación Docker (`tsc --noEmit`) pendiente de confirmar (S4-T07). |

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

## Objetivos del Sprint 4 — Estado

- [x] **S4-T01** Crear `app/onboarding/index.tsx`: carrusel de 4 pasos con Yachi + AsyncStorage (`onboardingComplete`).
- [x] **S4-T02** Refactorizar `app/(tabs)/index.tsx` — "Camino del Saber" con ruta visual por unidades temáticas (ya implementado en Sprint 3; etiquetado y documentado en v2.0).
- [x] **S4-T03** Persistir `GameContext` en `profiles`: `hydrateFromProfile()` al login + sync debounced 800 ms (Cierre GAP-06). `authService.updateGameState()` añadido.
- [x] **S4-T04** `leaderboardService` ahora consulta `leaderboard_weekly` JOIN `profiles`. `shop.tsx` ya usaba `shopService.fetchShopItems()` (Cierre GAP-07).
- [ ] **S4-T05** Tests unitarios de `GameContext` con Jest + E2E de flujo (Cierre GAP-03).
- [ ] **S4-T06** Auditoría `grep` triple: 0 `supabase.from` en `app/`, 0 alerts, 0 estilos inline.
- [ ] **S4-T07** Verificar `npx tsc --noEmit` en contenedor Docker sin errores.
- [ ] **S4-T08** Registrar cierre de Sprint 4 en bitácora.

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
`Vista UI (app/) → Contexto/Hook (src/context/) → Servicio (src/services/) → Cliente Supabase (src/services/supabase.ts)`

### 4. Invariantes de Arquitectura (v2.0)
| ID | Invariante | Verificación |
| :--- | :--- | :--- |
| **INV-01** | No hay importación de `supabase.ts` en ningún archivo de `app/` | `grep -r "from.*services/supabase" app/` → 0 resultados |
| **INV-02** | No hay estilos inline JSX no autorizados | `grep -r "style={{" app/` → solo casos aprobados |
| **INV-03** | No hay `window.alert` ni `Alert.alert` para feedback de lecciones | `grep -r "window.alert\|Alert.alert" app/` → 0 en archivos de lecciones |
| **INV-04** | Gamificación es exclusivamente educativa (sin monetización real) | Revisión manual + no existe `stripe`, `paypal` ni similar en dependencias |

### 5. Patrón de Hidratación GameContext (nuevo en Sprint 4)
```
AuthContext.profile actualizado
       ↓
ProfileHydrator (en _layout.tsx)
       ↓
gameContext.hydrateFromProfile(profile)
       ↓ dispatcha HYDRATE
GameState: lives, xp, gems, streakDays actualizados desde Supabase
       ↓ useEffect debounced (800 ms)
authService.updateGameState(userId, { lives, gems, xp, streakDays })
       ↓
supabase.from('profiles').update(...)
```

---

## Registro de Sesiones

| Fecha | Desarrollador | Acción realizada |
| :--- | :--- | :--- |
| 2026-09-08 | Equipo | Apertura del Sprint 1 — Fase 2. Creación de documentos de referencia (`01-BITACORA_DESARROLLO.md`, `02-SESSION_MEM.md`). |
| 2026-09-10 | Equipo | Ejecución y cierre de Sprint 1 y Sprint 2. Migración DDL y Seed aplicados en Supabase, Clean Architecture implementada (`src/services/`), refactor de telas UI (Home, Categorías, Lecciones, Perfil y Logout) y cero errores de TypeScript en compilación. |
| 2026-09-11 | Alejandro (con asistencia de Claude Sonnet 4.6) | Ejecución de Sprint 3: `GameContext`, lección en dos fases, exámenes de nivel bloqueantes, pantalla de bloqueo y traductor de voz con IA. |
| 2026-09-12 | Yessyess22 | Cierre de Sprint 3: Ligas, Tienda, Guía Gramatical, ejercicios de banco de palabras y pares, migración de gamificación (`daily_quests`, `badges`, `leaderboard_weekly`, `shop_items`) y actualización de Perfil/Dashboard. Apertura de Sprint 4 y actualización de toda la documentación (`README.md`, `CONTEXTO_PROYECTO.md`, `docs/`) al estado real del repositorio. |
| 2026-09-14 | Alejandro (con asistencia de Claude Sonnet 4.6) | Apertura formal del Sprint 4 bajo Visión No Comercial v2.0. Implementación de: `app/onboarding/index.tsx` (4 pasos + AsyncStorage), `GameContext` con hidratación desde `profiles` y sync debounced (cierre GAP-06), `leaderboardService` conectado a `leaderboard_weekly` (cierre GAP-07 p1), `authService.updateGameState()`, `_layout.tsx` con guard de onboarding. Actualización de docs/02 a docs/06 y docs/03 a v2.0. |

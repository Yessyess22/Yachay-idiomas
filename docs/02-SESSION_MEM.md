# Memoria de Sesión Activa — Yachay Quechua

Este archivo es la ancla de contexto obligatoria para que el asistente de IA o cualquier desarrollador del equipo sepa el estado actual de las tareas y las restricciones del proyecto antes de escribir código. Se debe mantener actualizado al inicio y cierre de cada sesión.

---

## Estado Actual

| Campo | Valor |
| :--- | :--- |
| **Fase** | Fase 8 — Safe Area, Realtime Leaderboard, Debounce Reactivo y Onboarding Cultural Inmersivo |
| **Sprint activo** | **Sprint 8 completado (100% ✅)** |
| **Sprints Completados** | Sprint 1 ✅ · Sprint 2 ✅ · Sprint 3 ✅ · Sprint 4 ✅ · Sprint 5 ✅ · Sprint 6 ✅ · Sprint 7 ✅ · **Sprint 8 ✅** |
| **Fecha de actualización** | 2026-09-26 |
| **Responsables** | Yessica Escobar, Alejandro Padilla, Oscar Segovia |
| **Institución / Carrera** | Universidad Privada Domingo Savio — Ingeniería de Sistemas |
| **Estado del Backend** | ✅ Firebase Auth (v12 modular) + Supabase PostgreSQL 3FN: `profiles`, `daily_quests`, `badges`, `leaderboard_weekly` (con **Realtime subscription activa**), `shop_items`, `user_inventory`. Colección Insomnia con 35 endpoints REST. |
| **Estado del Frontend** | ✅ Expo 57 Web/Mobile · Firebase Auth · `GameContext` con hidratación, debounce 800 ms y **upsert inmediato en `leaderboard_weekly`** via `addXp` · `SafeAreaProvider` + `SafeAreaView edges=['top']` + `useSafeAreaInsets` · Realtime leaderboard con patrón `useRef` · Onboarding **6 pasos** con etimología morfológica de Yachay y paso lingüístico Runasimi (Chanka/Cusco-Collao, trivocálico A·I·U) · Modal "Créditos e Identidad Cultural" v2.0 con sección lingüística · INV-02/03/04/06 al 100%. |
| **Tests** | **20/20 PASS** (3 suites: `GameContext` T1-T6, `voiceService` 10, `learningPath` 4). `tsc --noEmit` → 0 errores. |
| **Deuda cerrada** | GAP-01 a GAP-07 ✅ · INV-02 ✅ · INV-04 ✅ · INV-06 ✅ · Plan Pedagógico 100% ✅ |
| **Deuda pendiente** | Ninguna. |

---

## Objetivos del Sprint 1 al Sprint 8 — Estado Final

- [x] **S1-T01 a S1-T09** Esquema relacional 3FN, migración inicial, seed, Docker (`10.10.10.0/24`), Clean Architecture y gobernanza en `docs/`.
- [x] **S2-T01 a S2-T09** Capa de servicios (`authService`, `categoryService`, `questionService`, `supabase.ts`), AuthContext, Inicio, Categorías, Lección Quiz y Perfil con Logout.
- [x] **S3-T01 a S3-T10** `GameContext` (vidas, XP, gemas, racha), exámenes de nivel, pantalla de bloqueo, traductor de voz, Ligas, Tienda, Guía Gramatical y ejercicios de banco de palabras y pares.
- [x] **S4-T01 a S4-T08** Onboarding inmersivo de 4 pasos, "Camino del Saber", persistencia de `GameContext` en Supabase (Cierre GAP-06), `leaderboard_weekly` (Cierre GAP-07), pruebas Jest (Cierre GAP-03) y auditoría sin estilos inline.
- [x] **S5-T01 a S5-T05** Migración de autenticación a Firebase Auth (SDK v12 modular), persistencia AsyncStorage, traducción de errores Firebase, rediseño de lecciones con fase teórica de vocabulario, colección Insomnia con 35 endpoints REST.
- [x] **S6-T01 a S6-T07** Sistema de síntesis de voz nativo `expo-speech` con opciones para voces Android, guía fonética del Quechua (`phoneticGuide.ts`), ejercicio interactivo de pronunciación, botón universal `AudioPronounceButton`, microservicio local Python TTS (`tts_service.py`), resiliencia offline (`offlineCache.ts`), notificaciones de racha (`notificationService.ts`), feedback háptico (`expo-haptics`) y kit visual de complementos.
- [x] **S7-T01 a S7-T08** Flujo pedagógico en 3 fases ("Enseñar antes de evaluar"), exámenes sumativos con Ronda de Refuerzo y tipos mixtos, paleta Wiphala Neón, caminito 3D con 9 colores intercalados, mascota Yachi Companion animada con hápticos, Onboarding con Malla Curricular (Yachay Ñan), y modal de Créditos Académicos (Yessica Escobar, Alejandro Padilla, Oscar Segovia — UPDS).
- [x] **S8-T01 a S8-T08** Safe Area notch fix (`useSafeAreaInsets` + `StyleSheet.create` en `useMemo`), upsert inmediato a `leaderboard_weekly` en `addXp`, Realtime leaderboard con patrón `useRef`, mock `leaderboardService` en Jest (20/20 PASS), Onboarding Cultural v2.0 en 6 pasos (etimología morfológica Yachay, paso lingüístico Runasimi, sistema trivocálico A·I·U, normas Chanka/Cusco-Collao), modal v2.0 con sección lingüística 3 columnas y fix INV-06 (`yachiPrincipal`), y `profile.tsx` con "Créditos e Identidad Cultural".

---

## Contexto Técnico y Decisiones de Arquitectura

### 1. Aislamiento Docker
Contenedor Expo Web configurado en `Dockerfile` (`node:20-alpine`) y `docker-compose.yml`.

### 2. Red Estática
| Recurso | IP / Puerto |
| :--- | :--- |
| Subred Docker | `10.10.10.0/24` |
| Contenedor Expo Web | `10.10.10.10:8081` |

### 3. Dual Backend (Firebase Auth + Supabase PostgreSQL)
- **Autenticación:** Firebase Auth (v12 modular), emite UID y gestiona credenciales de usuario.
- **Base de datos:** Supabase PostgreSQL relacional 3FN (`profiles`, `categories`, `lessons`, `questions`, `question_options`, `levels`, `exams`, `lesson_progress`, `level_progress`, `leaderboard_weekly`, `shop_items`).
- **Colección REST:** `docs/yachay-insomnia-collection.json` con 35 endpoints REST para Firebase Auth y Supabase API.

### 4. Clean Architecture — Feature-First (0 llamadas directas en `app/`)
Flujo de datos estrictamente unificado:
`Vista UI (app/) → Contexto/Hook (src/context/) → Servicio (src/services/) → Firebase Auth / Supabase Client`

### 5. Invariantes de Arquitectura (v2.0)
| ID | Invariante | Verificación |
| :--- | :--- | :--- |
| **INV-01** | No hay importación de `supabase.ts` en ningún archivo de `app/` | `grep -r "from.*services/supabase" app/` → 0 resultados |
| **INV-02** | No hay estilos inline JSX no autorizados | `grep -r "style={{" app/` → solo casos aprobados |
| **INV-03** | No hay `window.alert` ni `Alert.alert` para feedback de lecciones | `grep -r "window.alert\|Alert.alert" app/` → 0 en archivos de lecciones |
| **INV-04** | Gamificación es exclusivamente educativa (sin monetización real) | Revisión manual + no existe `stripe`, `paypal` ni similar en dependencias |

### 6. Patrón de Hidratación GameContext
```
AuthContext.profile actualizado (vía Firebase Auth UID)
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
| 2026-09-10 | Equipo | Ejecución y cierre de Sprint 1 y Sprint 2. Migración DDL y Seed aplicados en Supabase, Clean Architecture implementada (`src/services/`), refactor de telas UI y cero errores de TypeScript. |
| 2026-09-11 | Alejandro | Ejecución de Sprint 3: `GameContext`, lección en dos fases, exámenes de nivel bloqueantes, pantalla de bloqueo y traductor de voz con IA. |
| 2026-09-12 | Yessyess22 | Cierre de Sprint 3: Ligas, Tienda, Guía Gramatical, ejercicios de banco de palabras y pares, migración de gamificación y actualización de Perfil/Dashboard. |
| 2026-09-14 | Alejandro | Apertura y cierre del Sprint 4: Onboarding inmersivo (4 pasos), persistencia real de `GameContext` (Cierre GAP-06), `leaderboard_weekly` (Cierre GAP-07), tests Jest 3/3 PASS (Cierre GAP-03) y auditoría de estilos. |
| 2026-09-17 | Alejandro | Cierre de Sprint 5: Migración de Supabase Auth a Firebase Auth (SDK v12), persistencia AsyncStorage, traducción de errores al español, rediseño de lecciones con fase de vocabulario previo y colección Insomnia con 35 endpoints REST. |
| 2026-09-20 | Alejandro | Cierre de Sprint 6: Audio nativo `expo-speech` (`es-PE`), guía fonética Quechua (`phoneticGuide.ts`), ejercicio de pronunciación, resiliencia offline (`offlineCache.ts`), notificaciones locales (`notificationService.ts`), hápticos y suite Jest. |
| 2026-09-25 | Equipo (Yessica Escobar, Alejandro Padilla, Oscar Segovia) | Cierre de Sprint 7: Implementación del plan pedagógico en 3 fases (Enseñar ➡️ Practicar ➡️ Evaluar), exámenes sumativos con Ronda de Refuerzo y tipos dinámicos mixtos, paleta Wiphala Neón, caminito 3D con 9 colores intercalados, mascota interactiva Yachi Companion con hápticos, Onboarding con Malla Curricular, modal de Créditos Académicos UPDS y unificación de cabecera de Traductor. Suite Jest 17/17 PASS y 0 errores TypeScript. |
| 2026-09-26 | Equipo (Yessica Escobar, Alejandro Padilla, Oscar Segovia) | Cierre de Sprint 8: `SafeAreaProvider` + `useSafeAreaInsets` en toast del caminito · `leaderboardService.syncUserTotalXp` inmediato en `addXp` · Realtime leaderboard via Supabase `postgres_changes` · Onboarding Cultural 6 pasos (etimología YACHA-/-Y, Runa Simi, Chanka/Cusco-Collao, sistema trivocálico A·I·U) · Modal v2.0 con sección lingüística y fix INV-06 (`yachiPrincipal`) · `profile.tsx` "Créditos e Identidad Cultural" · suite Jest **20/20 PASS** y 0 errores TypeScript. |

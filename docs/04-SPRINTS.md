# Plan de Sprints — Yachay Quechua

**Versión:** 2.2 | **Fecha:** 2026-09-10 | **Última actualización:** 2026-09-20 | **Duración por sprint:** ~2 semanas académicas

---

## Resumen del Roadmap

| Sprint | Nombre | Período estimado | Estado |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | Diseño de BD, Infraestructura Docker y Clean Architecture | 2026-09-08 → 2026-09-19 | ✅ Completado |
| **Sprint 2** | Auth, Capa de Datos y Módulos Abecedario/Números/Palabras | 2026-09-22 → 2026-10-03 | ✅ Completado |
| **Sprint 3** | Gamificación Global, Exámenes de Nivel y Traductor de Voz | 2026-10-06 → 2026-10-17 | ✅ Completado (cerrado el 2026-09-12) |
| **Sprint 4** | Onboarding Inmersivo, Integración Final, QA y Pulido | 2026-10-20 → 2026-10-31 | ✅ Completado (cerrado el 2026-09-14) |
| **Sprint 5** | Firebase Auth, Rediseño de Lecciones y Colección Insomnia | 2026-11-03 → 2026-11-14 | ✅ Completado (cerrado el 2026-09-17) |
| **Sprint 6** | Audio Nativo (Expo Speech), Fonética Quechua, Resiliencia Offline y Notificaciones | 2026-11-17 → 2026-11-28 | ✅ Completado (cerrado el 2026-09-20) |

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

> **Nota:** En Sprint 4 se completó la persistencia de `GameContext` en la tabla `profiles` y la conexión de `leaderboardService` a `leaderboard_weekly`. (Ver GAPs 03, 06 y 07 cerrados).

---

## Sprint 4 — Onboarding, Integración Final, QA y Pulido (No Comercial v2.0)

**Estado:** ✅ **COMPLETADO (100%)** | **Período:** 2026-10-20 → 2026-10-31 | **Cerrado:** 2026-09-14

### Tareas del Sprint 4

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S4-T01 | Crear flujo de Onboarding Inmersivo de 4 pasos con Yachi (`app/onboarding/index.tsx`) y persistencia en AsyncStorage. | Yesica Escobar | ✅ |
| S4-T02 | Refactorizar Dashboard Principal como "Camino del Saber" (`app/(tabs)/index.tsx`) — ruta de aprendizaje visual por unidades temáticas con XP, vidas y racha. | Yesica Escobar | ✅ |
| S4-T03 | Persistencia real de `GameContext` en la tabla `profiles` de Supabase (Cierre de GAP-06): hidratar vidas/gemas/racha/XP desde `authService.getProfile()` al autenticarse; sincronizar mutaciones asíncronamente. | Alejandro Padilla | ✅ |
| S4-T04 | Conexión de `leaderboardService` a `leaderboard_weekly` y verificación de `shop.tsx` usando `shopService.fetchShopItems()` (Cierre de GAP-07). | Oscar Segovia | ✅ |
| S4-T05 | Pruebas unitarias de `GameContext` con Jest y tests de flujo E2E (Cierre de GAP-03). | Alejandro Padilla | ✅ |
| S4-T06 | Auditoría final de arquitectura (`grep` triple): 0 llamadas directas a Supabase en `app/`, 0 `window.alert`/`Alert.alert` en lecciones, 0 estilos inline no autorizados. | Oscar Segovia | ✅ |
| S4-T07 | Verificar compilación limpia de TypeScript (`tsc --noEmit`) dentro del contenedor Docker. | Oscar Segovia | ✅ |
| S4-T08 | Registrar cierre de Sprint 4 en `01-BITACORA_DESARROLLO.md`. | Equipo | ✅ |

---

## Sprint 5 — Firebase Auth, Rediseño de Lecciones y Colección Insomnia

**Estado:** ✅ **COMPLETADO (100%)** | **Período:** 2026-11-03 → 2026-11-14 | **Cerrado:** 2026-09-17

### Tareas del Sprint 5

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S5-T01 | Configurar SDK v12 modular de Firebase Auth (`src/services/firebase.ts`) y migrar `AuthContext.tsx` y `authService.ts`. | Alejandro Padilla | ✅ |
| S5-T02 | Implementar persistencia de sesión con `AsyncStorage` en plataformas móviles nativas y traducción de errores de Firebase al español (`translateFirebaseError`). | Alejandro Padilla | ✅ |
| S5-T03 | Rediseñar el flujo de lecciones en `app/lesson/[id].tsx` incorporando la fase teórica de presentación de vocabulario antes del quiz. | Yesica Escobar | ✅ |
| S5-T04 | Mapear el identificador del usuario de `user.id` a `user.uid` en pantallas `profile.tsx`, `shop.tsx`, `lesson/[id].tsx` y `level/exam/[levelId].tsx`. | Alejandro Padilla | ✅ |
| S5-T05 | Crear y documentar la colección Insomnia v4 con 35 endpoints REST (`docs/yachay-insomnia-collection.json`) para Firebase Auth y Supabase API. | Oscar Segovia | ✅ |

---

## Sprint 6 — Audio Nativo (Expo Speech), Fonética Quechua, Resiliencia Offline y Notificaciones

**Estado:** ✅ **COMPLETADO (100%)** | **Período:** 2026-11-17 → 2026-11-28 | **Cerrado:** 2026-09-20

### Tareas del Sprint 6

| ID | Descripción | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S6-T01 | Integrar síntesis de voz nativa con `expo-speech` en `src/services/voiceService.ts` con opciones de voces en Android/iOS (`es-PE`, `es-US`). | Alejandro Padilla | ✅ |
| S6-T02 | Crear la Guía de Pronunciación Fonética Andina (`src/utils/phoneticGuide.ts`) para variantes Quechua Chanka y Cusco-Collao. | Alejandro Padilla | ✅ |
| S6-T03 | Desarrollar el ejercicio interactivo de pronunciación (`PronunciationExercise`) con captura de micrófono y porcentaje de coincidencia. | Yesica Escobar | ✅ |
| S6-T04 | Crear el componente `AudioPronounceButton` con animación de ondas de sonido para reproducción de términos. | Yesica Escobar | ✅ |
| S6-T05 | Implementar el servicio de resiliencia offline (`offlineCache.ts`) usando AsyncStorage y el servicio de notificaciones locales de racha (`notificationService.ts`) a las 20:00. | Oscar Segovia | ✅ |
| S6-T06 | Construir el microservicio local de TTS en Python (`tts_service.py`) con gTTS/pyttsx3 como respaldo de voz. | Oscar Segovia | ✅ |
| S6-T07 | Cobertura de pruebas unitarias (`__tests__/voiceService.test.ts`), feedback háptico (`expo-haptics`) e incorporación del kit visual completo en `assets/images/kit-complementos/`. | Alejandro Padilla | ✅ |


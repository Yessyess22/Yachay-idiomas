# Plan de Tareas y Distribución del Equipo — Yachay Quechua

**Versión:** 2.2 | **Fecha:** 2026-09-12 | **Última actualización:** 2026-09-26

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

### Sprint 4 — Onboarding, Integración Final, QA y Pulido (No Comercial v2.0)

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S4-T01 | Crear `app/onboarding/index.tsx`: carrusel de 4 pasos con Yachi + persistencia AsyncStorage | Yesica Escobar | ✅ Completado |
| S4-T02 | Refactorizar `app/(tabs)/index.tsx` como "Camino del Saber" con ruta visual por unidades temáticas | Yesica Escobar | ✅ Completado |
| S4-T03 | Persistir `GameContext` contra `profiles` en Supabase — hidratar al autenticarse + sync debounced (Cierre GAP-06) | Alejandro Padilla | ✅ Completado |
| S4-T04 | Conectar `leaderboardService` a `leaderboard_weekly`; verificar `shop.tsx` usa `shopService.fetchShopItems()` (Cierre GAP-07) | Oscar Segovia | ✅ Completado |
| S4-T05 | Pruebas unitarias de `GameContext` con Jest + tests E2E de flujo (Cierre GAP-03) | Alejandro Padilla | ✅ Completado |
| S4-T06 | Auditoría final: `grep` triple (0 supabase en `app/`, 0 alerts, 0 estilos inline) | Oscar Segovia | ✅ Completado |
| S4-T07 | Verificar compilación limpia de TypeScript (`tsc --noEmit`) dentro del contenedor Docker | Oscar Segovia | ✅ Completado |
| S4-T08 | Registrar cierre de Sprint 4 en `01-BITACORA_DESARROLLO.md` | Equipo | ✅ Completado |

---

### Sprint 5 — Firebase Auth, Rediseño de Lecciones y Colección Insomnia

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S5-T01 | Configurar SDK v12 modular de Firebase Auth (`src/services/firebase.ts`) y migrar `AuthContext.tsx` y `authService.ts` | Alejandro Padilla | ✅ Completado |
| S5-T02 | Implementar persistencia de sesión con `AsyncStorage` en móvil y `translateFirebaseError` en español | Alejandro Padilla | ✅ Completado |
| S5-T03 | Rediseñar el flujo de lecciones en `app/lesson/[id].tsx` con fase teórica previa de vocabulario | Yesica Escobar | ✅ Completado |
| S5-T04 | Refactorizar `user.id` a `user.uid` en pantallas `profile`, `shop`, `lesson` y `exam` | Alejandro Padilla | ✅ Completado |
| S5-T05 | Crear y documentar colección Insomnia v4 con 35 endpoints REST (`docs/yachay-insomnia-collection.json`) | Oscar Segovia | ✅ Completado |

---

### Sprint 6 — Audio Nativo (Expo Speech), Fonética Quechua, Resiliencia Offline y Notificaciones

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S6-T01 | Integrar síntesis de voz nativa `expo-speech` en `voiceService.ts` con opciones de voces Android (`es-PE`) | Alejandro Padilla | ✅ Completado |
| S6-T02 | Crear Guía Fonética Quechua (`phoneticGuide.ts`) para fonemas andinos glotales y aspirados | Alejandro Padilla | ✅ Completado |
| S6-T03 | Crear ejercicio interactivo de pronunciación por voz (`PronunciationExercise`) | Yesica Escobar | ✅ Completado |
| S6-T04 | Crear componente universal `AudioPronounceButton` con animación de onda de sonido | Yesica Escobar | ✅ Completado |
| S6-T05 | Crear servicios de resiliencia offline (`offlineCache.ts`) y notificaciones locales de racha (`notificationService.ts`) | Oscar Segovia | ✅ Completado |
| S6-T06 | Construir servidor local TTS en Python (`tts_service.py`) con gTTS/pyttsx3 | Oscar Segovia | ✅ Completado |
| S6-T07 | Cobertura de pruebas unitarias (`__tests__/voiceService.test.ts`), feedback háptico (`expo-haptics`) y kit de assets de complementos | Alejandro Padilla | ✅ Completado |

---

### Sprint 7 — Pedagogía Estructurada, Paleta Wiphala Neón, Gamificación Visual y Créditos Académicos

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S7-T01 | Implementar flujo pedagógico en 3 fases en `app/lesson/[id].tsx`: Enseñar (vocab) ➡️ Practicar (ejercicios) ➡️ Evaluar (quiz). | Yesica Escobar | ✅ Completado |
| S7-T02 | Crear exámenes sumativos con Ronda de Refuerzo: segundo intento si falla ≥ 2 preguntas, con las incorrectas reformuladas. | Alejandro Padilla | ✅ Completado |
| S7-T03 | Aplicar paleta Wiphala Neón (`#00C853`, `#FFB300`, `#FF3366`, `#00B0FF`, `#7C3AED`, `#FF6D00`) en `constants/Theme.ts`. | Yesica Escobar | ✅ Completado |
| S7-T04 | Rediseñar caminito en `app/(tabs)/index.tsx` con 9 nodos 3D en colores intercalados Wiphala. | Yesica Escobar | ✅ Completado |
| S7-T05 | Desarrollar mascota Yachi Companion con `Animated.spring`, reacciones emocionales y hápticos (`expo-haptics`). | Yesica Escobar | ✅ Completado |
| S7-T06 | Actualizar Onboarding con paso de Malla Curricular (Yachay Ñan) mostrando las 3 unidades temáticas. | Alejandro Padilla | ✅ Completado |
| S7-T07 | Crear modal de Créditos Académicos (`app/modal.tsx`) con ficha del equipo UPDS — Ingeniería de Sistemas. | Oscar Segovia | ✅ Completado |
| S7-T08 | Unificar cabecera del Traductor con `YachayTopBar`. Cierre de sprint: `tsc` → 0 errores, Jest 17/17 PASS, triple grep. | Oscar Segovia | ✅ Completado |

---

### Sprint 8 — Safe Area, Realtime Leaderboard, Debounce Reactivo y Onboarding Cultural Inmersivo

| ID | Tarea | Responsable | Estado |
| :--- | :--- | :--- | :---: |
| S8-T01 | Integrar `SafeAreaProvider` en `app/_layout.tsx` y `SafeAreaView edges=['top']` en `YachayTopBar` (soporte notch iPhone X+). | Oscar Segovia | ✅ Completado |
| S8-T02 | Usar `useSafeAreaInsets` + `StyleSheet.create` en `useMemo` en `app/(tabs)/index.tsx` para ajustar dinámicamente el toast del nodo bloqueado (INV-02 ✅). | Yesica Escobar | ✅ Completado |
| S8-T03 | Añadir llamada inmediata a `leaderboardService.syncUserTotalXp()` en `addXp` del `GameContext` para upsert sin debounce. | Alejandro Padilla | ✅ Completado |
| S8-T04 | Implementar Realtime leaderboard con `postgres_changes` en `leaderboard_weekly` y conectarlo en `leaderboard.tsx` con patrón `useRef`. | Alejandro Padilla | ✅ Completado |
| S8-T05 | Agregar mock de `leaderboardService` en `__tests__/GameContext.test.tsx` para resolver error de WebSocket nativo en Node.js 18. Jest: 20/20 PASS. | Alejandro Padilla | ✅ Completado |
| S8-T06 | Reescribir Onboarding (`app/onboarding/index.tsx`) con 6 pasos: etimología YACHA-/-Y, pilares andinos, Step 1 lingüístico (trivocálico A·I·U, Chanka/Cusco-Collao). Fix INV-06. | Yesica Escobar | ✅ Completado |
| S8-T07 | Actualizar `app/modal.tsx` v2.0: sección "Variante Lingüística Enseñada" 3 columnas, fix INV-06 (`yachiPrincipal`), badge "Versión 2.0 · Edición Tawantinsuyu". | Yesica Escobar | ✅ Completado |
| S8-T08 | Renombrar botón de créditos en `profile.tsx` a "Créditos e Identidad Cultural". Cierre: `tsc` → 0 errores, Jest **20/20 PASS**, triple grep — INV-02/03/04/06 limpios. | Oscar Segovia | ✅ Completado |


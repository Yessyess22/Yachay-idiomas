# Bitácora de Desarrollo — Yachay Quechua

Registro cronológico de hitos académicos y técnicos del equipo. Cada entrada documenta qué se construyó, quién lo hizo y qué pruebas validaron el trabajo. El formato es estrictamente inmutable: no se editan entradas pasadas, solo se agregan nuevas al final en orden cronológico.

---

## Formato de Registro Estándar

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |

---

## Fase 1 — Prototipo Inicial (Supabase & Expo Go)

En esta fase se consolidó la base de datos local en Supabase, el sistema de autenticación y el motor de ejercicios interactivos en Expo Go.

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-01 | Yesica | `supabase/config.toml`, `context/AuthContext.tsx`, `app/(auth)/` | Inicialización del backend local de Supabase y flujo completo de autenticación (Login/Signup). | Registro e inicio de sesión validados exitosamente contra el emulador local de Supabase Auth. |
| 2026-09-03 | Yesica | `app/(tabs)/index.tsx`, `app/course/[id].tsx` | Pantalla Home con listado dinámico de cursos de Quechua y vista detallada de lecciones con recompensas de XP. | Pruebas de navegación fluidas utilizando Expo Router; carga correcta de datos desde la tabla `courses`. |
| 2026-09-05 | Yesica | `app/lesson/[id].tsx`, `components/themed-*` | Motor de ejercicios interactivos de opción múltiple con barra de progreso dinámica y retroalimentación visual inmediata. | Verificación de flujo: comprobación de respuestas correctas/incorrectas y renderizado de la pantalla de resultados con porcentaje de aciertos. |
| 2026-09-08 | Equipo | `docs/CONTEXTO_PROYECTO.md` | Escaneo integral de la arquitectura del repositorio inicial y mapeo de dependencias para la migración a Docker. | Análisis estático de dependencias de Expo 57 y Supabase JS completado. |

---

## Fase 2 — Infraestructura, Dockerización y Clean Architecture

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-08 | Equipo | `docs/01-BITACORA_DESARROLLO.md` al `docs/08-CONTROL_SESION.md` | Definición del alcance definitivo de Yachay Quechua (Abecedario, Números, Palabras, Niveles/Exámenes, Traductor de Voz) y diseño del esquema relacional 3FN. | Revisión cruzada del DDL por el equipo. |
| 2026-09-10 | Equipo | `supabase/migrations/20260910000000_initial_yachay_schema.sql`, `supabase/seed.sql` | Creación y ejecución del esquema relacional en 3FN en Supabase (11 tablas con RLS y 30 preguntas de Quechua con 120 opciones normalizadas). | `SELECT COUNT(*)` en `questions` (30) y `question_options` (120) verificado en Supabase. |
| 2026-09-10 | Oscar | `Dockerfile`, `docker-compose.yml` | Dockerización con `node:20-alpine`, red estática `10.10.10.0/24` e IP `10.10.10.10`. | Verificación del archivo docker-compose e instalación de `expo-asset` y `firebase`. |
| 2026-09-10 | Alejandro / Yesica | `src/services/`, `src/context/`, `src/types/` | Implementación completa de la capa de servicios Clean Architecture (`authService`, `categoryService`, `questionService`, `supabase`) y refactor de `AuthContext`. | Chequeo estático `npx tsc --noEmit` exitoso sin ningún error. Auditoría `grep` confirma 0 llamadas directas a Supabase en `app/`. |
| 2026-09-10 | Yesica | `app/(tabs)/index.tsx`, `app/category/[slug].tsx`, `app/lesson/[id].tsx`, `app/(tabs)/profile.tsx` | Refactorización total de pantallas UI: Inicio con categorías dinámicas y XP, Detalle de Lecciones por categoría, Motor interactivo Quiz con feedback visual y nueva Pantalla de Perfil de usuario con Cerrar Sesión. | Pruebas de navegación en Expo Go / Web; flujo completo de registro, lección, ganancia de XP y cierre de sesión validado. |

---

## Fase 3 — Sprint 3: Gamificación Global, Exámenes de Nivel y Traductor de Voz

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-10 | Yesica | `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`, `app/(tabs)/*`, `constants/illustrations.ts`, `assets/images/` | Implementación del ícono e identidad visual de Yachay: nuevos componentes de marca (`components/yachay/`), tarjetas e ilustraciones de la mascota Yachi. | Verificación visual en Expo Go / Web de todas las pantallas rediseñadas. |
| 2026-09-11 | Alejandro | `assets/images/{cards,yachi}/`, `constants/illustrations.ts` | Reorganización de assets de imágenes en subcarpetas semánticas `cards/` y `yachi/`, eliminando duplicados de `image/llamitas_separadas_PNG/`. | Verificación de que todas las rutas de `illustrations.ts` resuelven correctamente tras el renombrado. |
| 2026-09-11 | Alejandro (con asistencia de Claude Sonnet 4.6) | `global.d.ts`, `src/constants/theme.ts`, `src/assets/images/index.ts` | Design System: tokens oficiales de marca (`brandGreen`, `brandNavy`, `accentOrange`, `streakFire`, `bgLight`) y re-exports semánticos de imágenes. | Compilación TypeScript limpia tras declarar módulos `.png/.jpg/.svg`. |
| 2026-09-11 | Alejandro (con asistencia de Claude Sonnet 4.6) | `src/context/GameContext.tsx`, `app/_layout.tsx` | Gamificación global: reducer con 5 vidas, XP, racha de días, `checkAnswer()` e `isBlocked`; redirección automática a `/blocked` al agotar vidas. | Verificación manual de descuento de vidas y bloqueo tras 5 respuestas incorrectas consecutivas. |
| 2026-09-11 | Alejandro (con asistencia de Claude Sonnet 4.6) | `app/lesson/[id].tsx` | Lección con fase teórica: flujo en dos fases (Teoría → Quiz), tarjetas de vocabulario previas al quiz, integración con `GameContext` y animación *bounce* de Yachi con `react-native-reanimated`. | Pruebas de navegación completa de una lección de inicio a fin en Expo Web. |
| 2026-09-11 | Alejandro (con asistencia de Claude Sonnet 4.6) | `src/services/examService.ts`, `src/services/progressService.ts`, `app/level/exam/[levelId].tsx`, `app/blocked.tsx` | Exámenes bloqueantes de fin de nivel con puntaje y umbral de aprobación; pantalla de "Sin vidas" con animación de sacudida y botón de restauración para desarrollo. | Verificación manual del flujo examen → aprobación/reprobación → desbloqueo de nivel siguiente en `level_progress`. |
| 2026-09-11 | Alejandro (con asistencia de Claude Sonnet 4.6) | `src/services/voiceService.ts`, `app/translator/index.tsx` | Traductor de voz con IA: Web Speech API (reconocimiento + síntesis) y traducción vía Supabase Edge Function `translate`; UI con selector de idioma, modo texto/voz y swap Español↔Quechua. | Pruebas de reconocimiento y síntesis de voz en navegador Web (Chrome). |
| 2026-09-12 | Yessyess22 | `app/(tabs)/leaderboard.tsx`, `app/(tabs)/shop.tsx`, `app/guidebook/[id].tsx`, `components/yachay/exercises/{word-bank,matching-pairs}-exercise.tsx`, `components/yachay/yachay-top-bar.tsx`, `src/services/{leaderboardService,questService,shopService}.ts`, `supabase/migrations/20260912000000_gamification_and_exercises.sql` | Cierre de Sprint 3: pantalla de Ligas, Tienda de ítems, Guía Gramatical, nuevos tipos de ejercicio (banco de palabras y pares), y migración de esquema con misiones diarias, insignias, ligas semanales e inventario. Actualización de Perfil y Dashboard (`(tabs)/index.tsx`, `(tabs)/profile.tsx`). | Verificación manual de las 5 pestañas de navegación (`Aprender`, `Explorar`, `Ligas`, `Tienda`, `Perfil`) y de la aplicación de la nueva migración en Supabase. |

---

## Fase 4 — Sprint 4: Onboarding Inmersivo, Persistencia GameContext y Visión No Comercial v2.0

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-14 | Alejandro (con asistencia de Claude Sonnet 4.6) | `docs/03-REQUERIMIENTOS.md`, `docs/04-SPRINTS.md`, `docs/06-TASK_PLAN.md`, `docs/02-SESSION_MEM.md` | Reorientación formal del proyecto a Visión No Comercial v2.0: nuevos RF-01 a RF-08 declarando Onboarding, Gamificación No Monetizada, Dashboard Cultural y Ligas de Constancia. Sprint 4 formalizado con tareas S4-T01 a S4-T08. | Revisión cruzada de documentos por el equipo. |
| 2026-09-14 | Alejandro (con asistencia de Claude Sonnet 4.6) | `app/onboarding/index.tsx`, `app/_layout.tsx` | Implementación del Onboarding Inmersivo de 4 pasos (Bienvenida cultural, Dinámica de juego, Meta diaria, Acceso) con mascota Yachi, persistencia en `AsyncStorage` con clave `onboardingComplete` y guard de routing en `_layout.tsx`. | Verificación del flujo de primera apertura: onboarding se muestra una sola vez y no vuelve a aparecer en sesiones posteriores. |
| 2026-09-14 | Alejandro (con asistencia de Claude Sonnet 4.6) | `src/services/authService.ts`, `src/context/GameContext.tsx` | Cierre de GAP-06: `GameContext` hidrata estado inicial (vidas, gemas, XP, racha) desde `authService.getProfile()` al autenticarse, vía `hydrateFromProfile()` en `ProfileHydrator`. Mutaciones se sincronizan asíncronamente con `profiles` en Supabase (debounce 800 ms). `authService.updateGameState()` añadido. | Verificación manual del ciclo: login → hidratación → respuesta incorrecta → descuento de vida → columna `lives` actualizada en `profiles`. |
| 2026-09-14 | Oscar (con asistencia de Claude Sonnet 4.6) | `src/services/leaderboardService.ts` | Cierre de GAP-07 (parte 1): `leaderboardService.fetchWeeklyLeaderboard()` ahora consulta la tabla `leaderboard_weekly` JOIN `profiles` para obtener `weekly_xp`, `league_tier`, `username` y `avatar_url`; ya no usa `profiles.total_xp` global. | Verificación de la query con datos de prueba en Supabase; mapeo correcto de `league_tier` desde la tabla. |
| 2026-09-14 | Alejandro (con asistencia de Claude Sonnet 4.6) | `app/(tabs)/index.tsx`, `app/(tabs)/shop.tsx`, `app/(tabs)/leaderboard.tsx`, `app/(tabs)/profile.tsx`, `app/translator/index.tsx`, `app/category/[slug].tsx` | Cierre de INV-02 (cumplimiento 100%): eliminación de todos los estilos inline (`style={{ ... }}`) en los 6 archivos detectados en auditoría; refactorizados a entradas en `StyleSheet.create`. | Auditoría `grep` post-refactor confirma 0 ocurrencias de estilos inline en los archivos afectados. |
| 2026-09-14 | Alejandro (con asistencia de Claude Sonnet 4.6) | `__tests__/GameContext.test.tsx`, `package.json`, `tsconfig.json` | Cierre de GAP-03: configuración de Jest con preset `jest-expo` y `@react-native/jest-preset`; 3 tests unitarios del `GameContext` cubren estado inicial, descuento de vidas con bloqueo, e hidratación vía HYDRATE. **Sprint 4 cerrado formalmente.** GAPs 03, 06 y 07 resueltos. | `npx jest --watchAll=false`: 3/3 PASS. `npx tsc --noEmit`: 0 errores. Ejecutado dentro del contenedor Docker `expo-web`. |

---

## Fase 5 — Sprint 5: Firebase Auth, Rediseño de Lecciones y Colección Insomnia API REST

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-17 | Alejandro Padilla | `src/services/firebase.ts`, `src/services/authService.ts`, `src/context/AuthContext.tsx`, `app/(auth)/*` | Migración de la capa de autenticación de Supabase Auth a Firebase Auth (SDK v12 modular). Persistencia con AsyncStorage en nativo y `getAuth` en web; función `translateFirebaseError` para mensajes en español. | Pruebas de registro, login y logout con Firebase Auth; verificación de guard de autenticación y redirección automática en `_layout.tsx`. |
| 2026-09-17 | Alejandro Padilla | `app/lesson/[id].tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/shop.tsx`, `app/level/exam/[levelId].tsx` | Rediseño del flujo de lecciones: inclusión de fase de vocabulario previo (Quechua ↔ Español). Refactorización de identificador de usuario `user.id` a `user.uid` en todas las pantallas. | Verificación de carga de lecciones y persistencia de progreso vinculada al UID de Firebase. |
| 2026-09-17 | Alejandro Padilla | `docs/yachay-insomnia-collection.json` | Creación de colección Insomnia v4 con 35 endpoints REST documentados y categorizados para pruebas de Firebase Auth y Supabase REST API. | Importación limpia en Insomnia v4 y ejecuciones de prueba exitosas. |

---

## Fase 6 — Sprint 6: Audio Nativo (Expo Speech), Fonética Quechua, Resiliencia Offline, Notificaciones y Cosméticos

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-20 | Alejandro Padilla | `src/services/voiceService.ts`, `components/yachay/audio-pronounce-button.tsx`, `tts_service.py` | Integración de síntesis de audio nativa con `expo-speech` y opciones de voz para Android/iOS (`es-PE`, `es-US`). Creación del componente `AudioPronounceButton` y microservicio local Python TTS como servidor de voz alternativo. | Pruebas de reproducción de audio en dispositivos Android, iOS y Web. |
| 2026-09-20 | Alejandro Padilla | `src/utils/phoneticGuide.ts`, `components/yachay/exercises/pronunciation-exercise.tsx` | Guía de pronunciación fonética andina para normas Quechua Chanka/Cusco-Collao y nuevo tipo de ejercicio de pronunciación interactivo con evaluación de coincidencia por voz. | Pruebas unitarias de conversión fonética y pruebas de micrófono en el ejercicio de pronunciación. |
| 2026-09-20 | Alejandro Padilla | `src/services/offlineCache.ts`, `src/services/notificationService.ts` | Sistema de resiliencia offline (`offlineCache.ts`) usando AsyncStorage y servicio de notificaciones locales de racha (`notificationService.ts`) usando `expo-notifications` para recordatorio diario a las 20:00. | Simulación de desconexión a red (modo avión) verificando carga de lecciones en caché; prueba de programación de notificaciones locales. |
| 2026-09-20 | Alejandro Padilla | `__tests__/voiceService.test.ts`, `expo-haptics` | Cobertura de pruebas unitarias para el servicio de voz (`voiceService.test.ts`) e integración de feedback háptico con `expo-haptics` en interacción de lecciones. | `npx jest`: 100% PASS en suite de voz y GameContext. |
| 2026-09-20 | Equipo | `assets/images/kit-complementos/` | Incorporación del kit gráfico completo de marca: íconos de app, navegación, expresiones emocionales de Yachi, misiones, categorías y tarjetas textiles. | Verificación visual de renderizado en todas las pantallas. |

---

## Fase 7 — Sprint 7: Pedagogía Estructurada, Paleta Wiphala Neón, Gamificación Visual y Créditos Académicos

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-25 | Equipo Yachay (Yessica Escobar, Alejandro Padilla, Oscar Segovia) | `docs/PLAN_MEJORAS_PEDAGOGICAS.md`, `components/yachay/lesson-teaching.tsx`, `app/lesson/[id].tsx` | Implementación del flujo pedagógico estricto en 3 fases: "Enseñar antes de evaluar" (Presentación teórica interactiva → Práctica guiada con feedback didáctico → Resumen y felicitaciones). Aislamiento total de preguntas de lección. | Navegación completa de lección 1 a 6; verificación de que no se evalúa contenido sin haber sido presentado previamente. |
| 2026-09-25 | Alejandro Padilla | `app/level/exam/[levelId].tsx`, `src/services/examService.ts` | Exámenes sumativos integrales de nivel (Vocales + Consonantes) con tipos dinámicos mixtos (emparejar pares, bancos de palabras, listening y pronunciación con micrófono). Incorporación de la **Ronda de Refuerzo final** para repasar preguntas falladas antes de calificar. Vidas deshabilitadas durante el examen para evitar frustración. | Validación de cálculo de puntaje con umbral (70%), ronda de refuerzo automática y desbloqueo del nivel siguiente en `level_progress`. |
| 2026-09-25 | Equipo Yachay | `src/constants/theme.ts`, `constants/yachay-theme.ts`, `app/(tabs)/*`, `app/category/*`, `app/(auth)/*` | Actualización global de la identidad visual a la paleta **Wiphala Neón**: Verde Esmeralda (`#00C853`), Oro Inti (`#FFB300`), Coral Neón (`#FF3366`), Azul Cosmos (`#00B0FF`), Púrpura Ayllu (`#7C3AED`) y Naranja Fuego (`#FF6D00`). | Verificación cromática en todos los componentes, botones 3D, banners y tab bar. |
| 2026-09-25 | Oscar Segovia & Alejandro Padilla | `app/(tabs)/index.tsx`, `components/yachay/learning-path.ts` | Rediseño del caminito serpentine tipo Duolingo: 9 redonditos 3D con colores únicos e intercalados de la Wiphala, reflejos de cristal, aros punteados textiles, estrellas andinas (`✦`/`✨`), y preservación del color en nodos bloqueados con candado `🔒`. | Verificación visual de alternancia de 9 colores únicos sin predominancia de un solo tono. |
| 2026-09-25 | Alejandro Padilla | `app/(tabs)/index.tsx`, `hooks/use-yachi-bounce.ts` | Mascota interactiva **Yachi Companion (🦙)** trotando al lado del nodo activo con física de rebote (*idle bounce + tilt*), burbujita de diálogo contextual (`¡Hakuchu! / ¡Atipanki!`) e interacción táctil con feedback háptico (`expo-haptics`). | Animación en tiempo real en Expo Go verificando orientación y respuesta al toque. |
| 2026-09-25 | Yessica Escobar | `app/onboarding/index.tsx` | Inclusión del paso de **Malla Curricular / Ruta de Aprendizaje (Yachay Ñan)** en el Onboarding de 5 pasos, detallando niveles 1, 2, 3, exámenes sumativos y las 3 habilidades (Escuchar, Pronunciar, Escribir). | Prueba de flujo completo de primera apertura (pasos 0 al 4). |
| 2026-09-25 | Equipo Yachay | `app/modal.tsx`, `app/(tabs)/profile.tsx` | Registro de **Créditos Oficiales de Desarrollo** (Yessica Escobar, Alejandro Padilla, Oscar Segovia), afiliación académica (**Universidad Privada Domingo Savio — Ingeniería de Sistemas**) y declaración de Misión Cultural. Acceso permanente desde botón en Perfil. Botón de Cerrar Sesión unificado y estilizado en rojo 3D. | Verificación de apertura del modal desde Perfil y cierre seguro de sesión. |
| 2026-09-25 | Alejandro Padilla | `__tests__/learningPath.test.ts`, `__tests__/GameContext.test.tsx`, `__tests__/voiceService.test.ts` | Suite completa de 17 pruebas unitarias Jest con 100% de éxito (`17 passed, 17 total`) y chequeo de tipos TypeScript estricto con 0 errores. | `npm test && npx tsc --noEmit`: 100% PASS, 0 errores. |



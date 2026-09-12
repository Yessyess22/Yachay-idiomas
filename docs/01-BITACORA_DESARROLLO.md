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

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

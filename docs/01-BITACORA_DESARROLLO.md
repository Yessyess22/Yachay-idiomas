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

## Fase 2 — Infraestructura, Dockerización y Clean Architecture (En curso)

| Fecha | Autor | Componente / Archivo(s) | Hito alcanzado | Pruebas ejecutadas |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-08 | Equipo | `docs/01-BITACORA_DESARROLLO.md`, `docs/02-SESSION_MEM.md`, `docs/03-REQUERIMIENTOS.md`, `docs/04-SPRINTS.md`, `docs/05-FINDINGS_DEUDA.md`, `docs/06-TASK_PLAN.md`, `docs/07-PROMPT_DESARROLLO.md`, `docs/08-CONTROL_SESION.md` | Definición del alcance definitivo de Yachay Quechua: módulos Abecedario, Números, Palabras, Niveles con Exámenes de bloqueo y Traductor de Voz con IA. Diseño lógico inicial del esquema relacional de la base de datos (tablas `profiles`, `categories`, `lessons`, `questions`, `levels`, `exams`, `exam_questions`, `lesson_progress`, `level_progress`, `translation_history`) con políticas RLS. Actualización integral de los 8 documentos de gobernanza del proyecto. | Revisión cruzada del DDL por el equipo. Validación de cobertura de todos los módulos del producto en los Casos de Uso (CU-01 al CU-06) y Requerimientos Funcionales (RF-01 al RF-14). |

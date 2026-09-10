# Memoria de Sesión Activa — Yachay Quechua

Este archivo es la ancla de contexto obligatoria para que el asistente de IA o cualquier desarrollador del equipo sepa el estado actual de las tareas y las restricciones del proyecto antes de escribir código. Se debe mantener actualizado al inicio y cierre de cada sesión.

---

## Estado Actual

| Campo | Valor |
| :--- | :--- |
| **Fase** | Fase 2 — Infraestructura, Dockerización y Refactorización a Clean Architecture |
| **Sprint activo** | **Sprint 3: Gamificación Global, Exámenes de Nivel y Traductor de Voz** |
| **Sprints Completados** | **Sprint 1 (100% ✅)** y **Sprint 2 (100% ✅)** |
| **Fecha de actualización** | 2026-09-10 |
| **Responsables** | Oscar Segovia, Yesica Escobar, Alejandro Padilla |
| **Estado del Backend** | ✅ Completado — Esquema relacional 3FN en Supabase cloud (11 tablas: `profiles`, `categories`, `lessons`, `questions`, `question_options`, `levels`, `exams`, `exam_questions`, `lesson_progress`, `level_progress`, `translation_history`) con políticas RLS y seed de 30 preguntas de Quechua con 120 opciones. |
| **Estado del Frontend** | ✅ Refactorizado bajo Clean Architecture. Estructura `src/{services,context,types,utils}` activa. Pantallas conectadas a servicios sin llamadas directas a Supabase en `app/`: Home por categorías, Detalle de categoría, Motor de Lección Quiz con XP, y Pantalla de Perfil de Usuario con Cerrar Sesión. |

---

## Objetivos del Sprint 1 & Sprint 2 — Estado Final

- [x] **S1-T01** Diseñar el esquema relacional completo de la base de datos de Yachay (3FN) con RLS.
- [x] **S1-T02** Crear migración inicial `20260910000000_initial_yachay_schema.sql` y aplicar en Supabase.
- [x] **S1-T03** Crear seed de datos en `supabase/seed.sql` (3 categorías, 6 lecciones, 30 preguntas, 120 opciones).
- [x] **S1-T04** Configurar `Dockerfile` (`node:20-alpine`) y `docker-compose.yml` (`10.10.10.0/24` e IP `10.10.10.10`).
- [x] **S1-T05** Crear la estructura de directorios Clean Architecture (`src/{context,services,utils,types,features}/`).
- [x] **S1-T06** Actualizar documentación de gobernanza en `docs/`.
- [x] **S2-T01 a S2-T08** Capa de servicios (`authService`, `categoryService`, `questionService`, `supabase.ts`), `AuthContext`, refactorización de Home, Detalle de Categoría, Lección interactiva y Perfil de Usuario con Logout.

---

## Próximo Objetivo: Sprint 3

- [ ] **S3-T01 / S3-T02** Implementar `GameContext.tsx` (gestión global de vidas, racha de días, bloqueo de lecciones).
- [ ] **S3-T03 / S3-T04** Servicios `examService.ts` y `progressService.ts` (exámenes de fin de nivel y desbloqueo en `level_progress`).
- [ ] **S3-T05 / S3-T06** Pantalla de evaluación `app/level/exam/[levelId].tsx` y pantallas de bloqueo (`blocked.tsx`).
- [ ] **S3-T07 / S3-T08** Servicio de voz/traductor `voiceService.ts` y pantalla `app/translator/index.tsx`.

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
`Vista UI (app/) -> Contexto/Hook (src/context/) -> Servicio (src/services/) -> Cliente Supabase (src/services/supabase.ts)`

---

## Registro de Sesiones

| Fecha | Desarrollador | Acción realizada |
| :--- | :--- | :--- |
| 2026-09-08 | Equipo | Apertura del Sprint 1 — Fase 2. Creación de documentos de referencia (`01-BITACORA_DESARROLLO.md`, `02-SESSION_MEM.md`). |
| 2026-09-10 | Equipo | Ejecución y cierre de Sprint 1 y Sprint 2. Migración DDL y Seed aplicados en Supabase, Clean Architecture implementada (`src/services/`), refactor de telas UI (Home, Categorías, Lecciones, Perfil y Logout) y cero errores de TypeScript en compilación. |

# Registro de Deuda Técnica y Hallazgos — Yachay Quechua

**Versión:** 1.1 | **Fecha de actualización:** 2026-09-10 | **Estado:** Vivo

Este documento es el registro vivo de todas las deficiencias de arquitectura, deuda técnica y debilidades identificadas en el repositorio. Cada entrada (GAP) tiene un propietario responsable de su resolución y el sprint objetivo en que debe cerrarse. Los GAPs no se eliminan; se marcan como resueltos y se documenta la solución aplicada.

---

## Índice de GAPs

| ID | Título | Severidad | Propietario | Sprint objetivo | Estado |
| :--- | :--- | :---: | :--- | :---: | :---: |
| GAP-01 | Ausencia de infraestructura Docker y red estática | 🔴 Crítico | Oscar Segovia | Sprint 1 | ✅ Resuelto |
| GAP-02 | Acoplamiento de llamadas de BD en las vistas | 🟡 Medio | Yesica + Oscar Segovia | Sprint 2 | ✅ Resuelto |
| GAP-03 | Ausencia de pruebas automatizadas | 🟢 Bajo | Equipo | Sprint 4 | Abierto |
| GAP-04 | Archivos plantilla de Expo sin personalizar | 🟢 Bajo | Yesica | Sprint 1 | ✅ Resuelto |
| GAP-05 | Ausencia de esquema de BD para Niveles y Traductor de Voz | 🔴 Alto | Alejandro Padilla | Sprint 1 | ✅ Resuelto |

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

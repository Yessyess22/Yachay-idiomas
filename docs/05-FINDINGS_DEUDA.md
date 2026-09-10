# Registro de Deuda Técnica y Hallazgos — Yachay Quechua

**Versión:** 1.0 | **Fecha de apertura:** 2026-09-08 | **Estado:** Vivo (se actualiza en cada sprint)

Este documento es el registro vivo de todas las deficiencias de arquitectura, deuda técnica y debilidades identificadas en el repositorio. Cada entrada (GAP) tiene un propietario responsable de su resolución y el sprint objetivo en que debe cerrarse. Los GAPs no se eliminan; se marcan como resueltos y se documenta la solución aplicada.

---

## Índice de GAPs

| ID | Título | Severidad | Propietario | Sprint objetivo | Estado |
| :--- | :--- | :---: | :--- | :---: | :--- |
| GAP-01 | Ausencia de infraestructura Docker y red estática | 🔴 Crítico | Oscar Segovia | Sprint 1 | Abierto |
| GAP-02 | Acoplamiento de llamadas de BD en las vistas | 🟡 Medio | Yesica + Oscar Segovia | Sprint 2 | Abierto |
| GAP-03 | Ausencia de pruebas automatizadas | 🟢 Bajo | Equipo | Sprint 4 | Abierto |
| GAP-04 | Archivos plantilla de Expo sin personalizar | 🟢 Bajo | Yesica | Sprint 1 | Abierto |
| GAP-05 | Ausencia de esquema de BD para Niveles y Traductor de Voz | 🔴 Alto | Alejandro Padilla | Sprint 1 | Abierto |

---

## GAP-01 — Ausencia de Infraestructura Docker y Red Estática

**Severidad:** 🔴 Crítico
**Propietario:** Oscar Segovia
**Sprint objetivo:** Sprint 1
**Estado:** Abierto

### Descripción

El repositorio inicial entregado por Yesica no contiene ningún `Dockerfile`, `docker-compose.yml` ni configuración de red Docker. La aplicación Expo y sus dependencias (`node_modules`) se ejecutan directamente sobre el sistema operativo del host, violando la restricción fundamental del proyecto que prohíbe instalar `npm` o `node` de forma global en la máquina local.

### Evidencia

```
# Búsqueda en raíz del repositorio
find . -maxdepth 2 -name "Dockerfile" -o -name "docker-compose.yml"
# → Sin resultados
```

### Riesgos

- **Entorno no reproducible:** La aplicación funciona en la máquina de un desarrollador pero puede fallar en otra por diferencias en versiones de Node o dependencias nativas.
- **Incumplimiento de restricción de proyecto:** Viola directamente la regla de "Desarrollo Aislado" definida en `docs/02-SESSION_MEM.md`.
- **Sin IP estática:** No existe la subred `10.10.10.0/24` ni la IP `10.10.10.10` requerida, imposibilitando pruebas de acceso web estables.

### Solución propuesta

1. Crear `Dockerfile` con base `node:20-alpine`, `WORKDIR /app`, `COPY package*.json .`, `RUN npm ci`, `EXPOSE 8081`, `CMD ["npx", "expo", "start", "--web", "--port", "8081"]`.
2. Crear `docker-compose.yml` con:
   - Servicio `expo-web` que construye desde el `Dockerfile`.
   - Red `yachay-net` con driver `bridge` y subnet `10.10.10.0/24`.
   - `ipv4_address: 10.10.10.10` para el contenedor.
   - Volumen bind-mount del código fuente para hot-reload.
3. Agregar `.dockerignore` excluyendo `node_modules/`, `.expo/`, `dist/`.

### Resolución

- **Fecha de cierre:** —
- **Commit:** —
- **Descripción de la solución:** —

---

## GAP-02 — Acoplamiento de Llamadas de Base de Datos en las Vistas

**Severidad:** 🟡 Medio
**Propietario:** Yesica Escobar + Oscar Segovia
**Sprint objetivo:** Sprint 2
**Estado:** Abierto

### Descripción

Las pantallas del prototipo inicial importan y usan directamente el cliente `supabase` para ejecutar consultas a la base de datos dentro de hooks `useEffect`. Esto viola el principio de separación de responsabilidades de la Clean Architecture: las vistas deben ser responsables únicamente del renderizado, no de la lógica de acceso a datos.

### Evidencia

Archivos afectados identificados en la auditoría inicial:

| Archivo | Violación |
| :--- | :--- |
| `app/(tabs)/index.tsx` | `useEffect` con `supabase.from('courses').select(...)` directo. |
| `app/course/[id].tsx` | `useEffect` con `supabase.from('lessons').select(...)` directo. |
| `context/AuthContext.tsx` | `supabase.auth.signInWithPassword()` llamado directamente en el contexto sin servicio intermediario. |

### Riesgos

- **Imposibilidad de testear:** Las vistas con lógica de datos no pueden probarse con tests unitarios sin mockear el cliente completo de Supabase.
- **Duplicación de lógica:** Si la misma consulta se necesita en dos pantallas, se copia el código en lugar de reutilizar un servicio.
- **Fragilidad ante cambios de API:** Un cambio en el esquema de la tabla requiere buscar y modificar múltiples archivos de UI.

### Solución propuesta

1. Crear `src/services/supabase.ts` como la única instancia del cliente Supabase en todo el proyecto.
2. Crear `src/services/authService.ts` con funciones `signIn`, `signUp`, `signOut`.
3. Crear `src/services/courseService.ts` con funciones `fetchCourses()`, `fetchLessons(courseId)`.
4. Refactorizar todas las pantallas para que solo consuman contextos o funciones de servicios, nunca el cliente Supabase directamente.

### Resolución

- **Fecha de cierre:** —
- **Commit:** —
- **Descripción de la solución:** —

---

## GAP-03 — Ausencia de Pruebas Automatizadas

**Severidad:** 🟢 Bajo
**Propietario:** Equipo
**Sprint objetivo:** Sprint 4
**Estado:** Abierto

### Descripción

El repositorio inicial no contiene ningún archivo de test (`.test.ts`, `.spec.tsx`), ni configuración de framework de pruebas (Jest, Testing Library). Esto implica que todos los flujos críticos (autenticación, motor de ejercicios, deducción de vidas) se validan únicamente de forma manual, lo que es inviable a medida que crece el proyecto.

### Evidencia

```
# Búsqueda de tests en el repositorio
find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules
# → Sin resultados

# Búsqueda de configuración de Jest
grep -r "jest" package.json
# → Sin resultados
```

### Riesgos

- **Riesgo de regresión silenciosa:** Al refactorizar el prototipo de Yesica hacia Clean Architecture, es posible romper flujos sin detectarlo.
- **Sin cobertura del motor de gamificación:** La lógica de vidas y XP (núcleo del producto) no tiene validación automatizada.

### Solución propuesta

1. Instalar `jest`, `@testing-library/react-native` y `jest-expo` como dependencias de desarrollo.
2. Configurar `jest.config.js` para Expo.
3. Escribir tests unitarios para `GameContext` (ver S4-T04 en `04-SPRINTS.md`).
4. Escribir al menos un test de integración para el flujo de autenticación.

### Resolución

- **Fecha de cierre:** —
- **Commit:** —
- **Descripción de la solución:** —

---

## GAP-05 — Ausencia de Esquema de Base de Datos para Niveles y Traductor de Voz

**Severidad:** 🔴 Alto
**Propietario:** Alejandro Padilla (diseño) + Oscar Segovia (aplicación de migración)
**Sprint objetivo:** Sprint 1
**Estado:** Abierto

### Descripción

El prototipo inicial de Yesica fue diseñado únicamente con las tablas `courses` y `lessons` para el flujo básico de lecciones. El alcance definitivo del proyecto Yachay —aprobado el 2026-09-08— añade tres módulos que requieren entidades de base de datos completamente nuevas:

1. **Niveles con Exámenes de Bloqueo:** Requiere las tablas `levels`, `exams` y `exam_questions` para definir la jerarquía de niveles por categoría, las preguntas de cada examen y la lógica de desbloqueo secuencial. Sin estas tablas, los Sprints 3 y 4 no pueden implementar el CU-05.
2. **Progreso de Usuario por Nivel:** Requiere la tabla `level_progress` para registrar si un usuario aprobó el examen de cada nivel y el score obtenido. Sin ella, no existe mecanismo de persistencia del estado de desbloqueo entre sesiones.
3. **Traductor de Voz con Historial:** Requiere la tabla `translation_history` para registrar las traducciones realizadas por cada usuario. Sin ella, el módulo del Traductor (CU-06) no puede persistir ni mostrar el historial.
4. **Perfiles de Usuario:** La tabla `profiles` no existe en el prototipo; `auth.users` de Supabase no admite campos adicionales como `total_xp` o `username` sin una tabla de extensión.

### Evidencia

```sql
-- Verificación del estado actual de las tablas en Supabase local
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Resultado en el prototipo de Yesica:
-- courses
-- lessons
-- (no existe: profiles, categories, levels, exams, exam_questions,
--              lesson_progress, level_progress, translation_history)
```

### Riesgos

- **Bloqueo de Sprints 2, 3 y 4:** Todos los servicios de la capa de datos (`categoryService`, `examService`, `voiceService`, `progressService`) dependen de las tablas definidas en este esquema. Sin el esquema aprobado y aplicado, el Sprint 2 no puede iniciarse.
- **Inconsistencia de datos sin RLS:** Si las tablas se crean sin políticas de Row Level Security, un usuario autenticado podría acceder al progreso de otro usuario mediante consultas directas a la API de Supabase.
- **Acumulación de deuda de migración:** Si el esquema se define de forma parcial o incorrecta en el Sprint 1, cada corrección posterior generará migraciones de alteración que aumentan la complejidad y el riesgo de errores.

### Solución propuesta

1. Diseñar el DDL completo (ver `docs/04-SPRINTS.md`, sección "Esquema Relacional Objetivo") incluyendo todas las tablas, tipos de columna, restricciones `CHECK`, claves foráneas con `ON DELETE CASCADE` y políticas RLS.
2. Crear el archivo de migración: `supabase migration new initial_yachay_schema`.
3. Pegar el DDL en el archivo generado por el CLI en `supabase/migrations/`.
4. Aplicar: `supabase db push` y verificar en Supabase Studio que todas las tablas y políticas aparecen correctamente.
5. Crear el seed en `supabase/seed.sql` con datos de quechua reales para las tablas de contenido.
6. Cerrar este GAP únicamente cuando `SELECT COUNT(*) FROM questions` retorne ≥ 30 y las políticas RLS bloqueen el acceso cruzado entre usuarios en una prueba manual.

### Resolución

- **Fecha de cierre:** —
- **Commit:** —
- **Descripción de la solución:** —

---

## GAP-04 — Archivos Plantilla de Expo Sin Personalizar

**Severidad:** 🟢 Bajo
**Propietario:** Yesica Escobar
**Sprint objetivo:** Sprint 1
**Estado:** Abierto

### Descripción

El proyecto contiene archivos generados automáticamente por el template de Expo que no han sido adaptados al contexto de Yachay ni eliminados si no son necesarios. Su presencia genera ruido en el repositorio y puede confundir a nuevos desarrolladores sobre qué pantallas son parte del producto real.

### Evidencia

Archivos identificados:

| Archivo | Problema |
| :--- | :--- |
| `app/(tabs)/explore.tsx` | Pantalla de exploración genérica del template de Expo, no relacionada con el producto. |
| `app/+not-found.tsx` | Pantalla de 404 con el estilo por defecto de Expo sin personalización. |
| `components/Collapsible.tsx` | Componente de template no utilizado en ninguna pantalla del producto. |
| `components/ExternalLink.tsx` | Componente de template sin uso activo en el flujo de Yachay. |
| `components/HapticTab.tsx` | Componente de template con haptics genérico. |

### Riesgos

- **Confusión de nuevos desarrolladores:** Es difícil distinguir qué es código de producto y qué es código generado por Expo.
- **Ruido en las métricas de cobertura de tests:** Los archivos sin uso inflyen en las estadísticas de cobertura.

### Solución propuesta

Para cada archivo: decidir entre (a) eliminar si no tiene uso en Yachay, o (b) reemplazar su contenido con la versión personalizada del proyecto. Actualizar las rutas de Expo Router para que no expongan pantallas de template al usuario final.

### Resolución

- **Fecha de cierre:** —
- **Commit:** —
- **Descripción de la solución:** —

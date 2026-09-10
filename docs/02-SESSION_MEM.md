# Memoria de Sesión Activa — Yachay Quechua

Este archivo es la ancla de contexto obligatoria para que el asistente de IA o cualquier desarrollador del equipo sepa el estado actual de las tareas y las restricciones del proyecto antes de escribir código. Se debe mantener actualizado al inicio y cierre de cada sesión.

---

## Estado Actual

| Campo | Valor |
| :--- | :--- |
| **Fase** | Fase 2 — Infraestructura, Dockerización y Refactorización a Clean Architecture |
| **Sprint activo** | **Sprint 1 (Fase 2): Diseño de BD, Dockerización, Red Estática y Clean Architecture** |
| **Fecha de inicio** | 2026-09-08 |
| **Responsables** | Oscar Segovia, Yesica Escobar, Alejandro Padilla |
| **Estado del Backend** | 🔵 En modelado — Supabase CLI local corriendo en puertos 54321–54327 con PostgreSQL 17 y Supabase Studio. El esquema relacional definitivo (tablas: `profiles`, `categories`, `lessons`, `questions`, `levels`, `exams`, `lesson_progress`, `level_progress`, `translation_history`) está siendo diseñado para aplicarse como migración versionada en `supabase/migrations/`. |
| **Estado del Frontend** | ⚠️ En proceso de migración. Yesica completó un prototipo funcional en Expo Go (Auth, Cursos y Lecciones), pero requiere ser dockerizado, asignado a la subred estática `10.10.10.10:8081` y refactorizado bajo Clean Architecture. El alcance definitivo incluye los módulos: Abecedario, Números, Palabras, Niveles con Exámenes y Traductor de Voz con IA. |

---

## Objetivos del Sprint 1 (Fase 2)

- [ ] **S1-T01** Diseñar el esquema relacional completo de la base de datos de Yachay: tablas `profiles`, `categories`, `lessons`, `questions`, `levels`, `exams`, `exam_questions`, `lesson_progress`, `level_progress` y `translation_history`, con sus relaciones, restricciones y políticas RLS. Revisión y aprobación del equipo antes de aplicar.
- [ ] **S1-T02** Crear el archivo de migración inicial en `supabase/migrations/` y aplicarlo con `supabase db push`. Verificar en Supabase Studio que todas las tablas y políticas RLS se crearon correctamente.
- [ ] **S1-T03** Crear el seed de datos de prueba en `supabase/seed.sql` con contenido real de quechua: mínimo 3 categorías, 2 lecciones por categoría y 5 preguntas por lección.
- [ ] **S1-T04** Configurar `Dockerfile` y `docker-compose.yml` en la raíz con la subred estática `10.10.10.0/24` y la IP estática `10.10.10.10` mapeada al puerto `8081` para desarrollo en Linux Ubuntu 24.04 LTS.
- [ ] **S1-T05** Crear la estructura física de directorios de Clean Architecture (Feature-First) adaptada a Expo Router (`src/context/`, `src/services/`, `src/utils/`, `src/types/` y `src/features/`).
- [ ] **S1-T06** Actualizar toda la documentación de gobernanza en `docs/` para reflejar el alcance definitivo: módulos Abecedario, Números, Palabras, Niveles/Exámenes y Traductor de Voz con IA.

---

## Deuda Técnica Activa

| Deuda | Descripción | Impacto |
| :--- | :--- | :--- |
| **Sin aislamiento Docker** | El prototipo de Yesica corre puramente sobre el host con Expo Go, sin contenedor. | Alto — bloquea la reproducibilidad del entorno. |
| **Acoplamiento de datos** | Las consultas a Supabase están directamente en las vistas (`app/(tabs)/index.tsx`, `app/course/[id].tsx`, etc.) mediante `useEffect`. Viola Clean Architecture. | Alto — impide testear y escalar la lógica de negocio. |
| **Sin pruebas automatizadas** | No existen suites de tests unitarios ni E2E para los flujos clave de autenticación y lecciones. | Medio — riesgo de regresiones silenciosas al refactorizar. |

---

## Contexto Técnico y Decisiones de Arquitectura

### 1. Desarrollo Aislado (Docker-first)
Está **prohibido** instalar `npm`, `Node.js` o `Expo CLI` de forma global en el host. Todo debe ejecutarse dentro del contenedor Docker con imagen base `node:20-alpine`. Cualquier comando de desarrollo (`npx expo start`, `npm install`) se lanza desde dentro del contenedor.

### 2. Red Estática Obligatoria

| Recurso | IP / Puerto |
| :--- | :--- |
| Subred Docker | `10.10.10.0/24` |
| Contenedor Expo Web | `10.10.10.10:8081` |
| Supabase API (host) | `http://localhost:54321` |
| Supabase Studio (host) | `http://localhost:54323` |

Los contenedores deben declarar `ipv4_address` explícita en `docker-compose.yml`. La URL de Supabase dentro del contenedor debe apuntar a la IP del host (no a `localhost`).

### 3. Clean Architecture — Feature-First

Ningún componente visual (pantalla bajo `app/`) puede invocar directamente consultas a Supabase. El flujo de datos es estrictamente unidireccional:

```
Pantalla (app/)
  └── Context / Hook (src/context/ | src/hooks/)
        └── Servicio (src/services/)
              └── Cliente Supabase (lib/supabase.ts)
```

**Estructura de directorios objetivo:**

```
src/
├── context/
│   ├── AuthContext.tsx       # Estado global de sesión
│   └── GameContext.tsx       # Motor de gamificación (vidas, XP)
├── services/
│   ├── authService.ts        # Lógica de login / signup / logout
│   └── courseService.ts      # Consultas a tablas de cursos y lecciones
└── utils/
    └── lessonsData.ts        # Datos estáticos / helpers de lecciones
```

### 4. Regla Cero `window.alert`
Todos los errores, validaciones y notificaciones se deben gestionar mediante componentes visuales internos de la app (banners, modales, feedback inline). Queda prohibido el uso de `window.alert`, `Alert.alert` de React Native, o cualquier diálogo nativo del sistema.

### 5. Migraciones de Base de Datos Obligatorias
Toda modificación del esquema de la base de datos debe realizarse **exclusivamente** a través de archivos de migración de Supabase CLI (`supabase migration new <nombre>` + `supabase db push`). Queda estrictamente prohibido realizar cambios de estructura (crear tablas, alterar columnas, agregar índices, modificar RLS) directamente desde la interfaz de Supabase Studio. Los cambios directos en Studio no se versionan, son invisibles para el equipo y rompen la reproducibilidad del entorno de desarrollo.

| Acción permitida | Acción prohibida |
| :--- | :--- |
| `supabase migration new add_translation_history` → editar el SQL → `supabase db push` | Abrir Studio → Table Editor → crear tabla manualmente |
| `supabase db reset` para revertir al estado de las migraciones | Borrar tablas directamente desde el SQL Editor de Studio |

---

## Registro de Sesiones

| Fecha | Desarrollador | Acción realizada |
| :--- | :--- | :--- |
| 2026-09-08 | Equipo | Apertura del Sprint 1 — Fase 2. Creación de documentos de referencia (`01-BITACORA_DESARROLLO.md`, `02-SESSION_MEM.md`). |
| 2026-09-08 | Equipo | Definición del alcance definitivo de Yachay: módulos Abecedario, Números, Palabras, Niveles con Exámenes y Traductor de Voz con IA. Actualización integral de la gobernanza (docs 01–08). Inicio del diseño lógico del esquema relacional de la base de datos. |

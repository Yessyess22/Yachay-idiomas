# Yachay Idiomas — Aprendizaje de Quechua 🇵🇪

**Yachay** es una aplicación móvil universal (iOS, Android, Web) desarrollada con Expo y React Native para la enseñanza interactiva del idioma Quechua (Runasimi). Integra Supabase como backend PostgreSQL relacional en 3FN y Clean Architecture en el frontend.

---

## 🚀 Arquitectura del Proyecto (Clean Architecture Feature-First)

```
Yachay/
├── app/                       # Rutas e interfaz UI (Expo Router)
│   ├── (auth)/                # Portada de bienvenida, Login y Registro
│   ├── (tabs)/                # Navegación por pestañas: Aprender, Explorar, Ligas, Tienda, Perfil
│   ├── category/[slug].tsx    # Lecciones de una categoría
│   ├── lesson/[id].tsx        # Motor interactivo de ejercicios (Teoría → Quiz)
│   ├── level/exam/[levelId].tsx  # Examen bloqueante de fin de nivel
│   ├── guidebook/[id].tsx     # Guía gramatical de referencia del Quechua
│   ├── translator/index.tsx   # Traductor de voz e IA (Español ↔ Quechua)
│   └── blocked.tsx            # Pantalla de bloqueo al agotar vidas
├── src/                       # Capa de lógica de negocio y servicios
│   ├── context/               # Contextos globales (AuthContext, GameContext)
│   ├── services/               # Servicios API (auth, category, question, exam, progress,
│   │                            # leaderboard, quest, shop, voice, supabase)
│   ├── types/                 # Interfaces TypeScript de dominio
│   ├── assets/images/         # Re-exports semánticos de imágenes (Yachi, tarjetas)
│   └── utils/                 # Funciones utilitarias
├── components/yachay/         # Componentes de marca (header, top bar, tarjetas, perfil)
│   └── exercises/             # Tipos de ejercicio: opción múltiple, banco de palabras, pares
├── constants/                 # Tokens de marca (theme.ts) e ilustraciones
├── supabase/
│   ├── migrations/            # Migraciones SQL versionadas (DDL en 3FN + extensiones)
│   └── seed.sql               # Datos iniciales (Categorías, Lecciones, Preguntas Quechua)
├── docs/                      # Documentación oficial de gobernanza del proyecto
├── Dockerfile                 # Imagen Docker node:20-alpine
└── docker-compose.yml         # Configuración de red estática 10.10.10.0/24
```

---

## 📊 Estado de los Sprints

- ✅ **Sprint 1 (100%)**: DDL en 3FN, Migraciones SQL, Seed Quechua (30 preguntas), Docker y Clean Architecture.
- ✅ **Sprint 2 (100%)**: Capa de Servicios (`src/services/`), AuthContext, Pantallas de Categorías, Lección Quiz interactiva y Perfil de Usuario con Logout.
- ✅ **Sprint 3 (100%)**: `GameContext` (vidas, XP, gemas, racha), Exámenes de Fin de Nivel, Traductor de Voz con IA, Tienda (`shop.tsx`), Ligas/Leaderboard, Guía Gramatical, Ejercicios de banco de palabras y pares, y Design System de marca.
- ⬜ **Sprint 4 (Pendiente)**: Pruebas unitarias, E2E, persistencia real de `GameContext` contra `profiles` y certificación final.

### ✨ Funcionalidades implementadas

| Módulo | Pantalla(s) | Descripción |
| :--- | :--- | :--- |
| **Autenticación** | `app/(auth)/` | Portada de bienvenida, Login y Registro contra Supabase Auth |
| **Aprendizaje** | `app/(tabs)/index.tsx`, `app/category/[slug].tsx`, `app/lesson/[id].tsx` | Categorías, lecciones y motor de ejercicios en dos fases (Teoría → Quiz) con opción múltiple, banco de palabras y pares |
| **Gamificación** | `src/context/GameContext.tsx` | Vidas (5), XP, gemas y racha de días; bloqueo automático a `/blocked` al agotar vidas |
| **Niveles y Exámenes** | `app/level/exam/[levelId].tsx` | Examen de fin de nivel con umbral de aprobación y desbloqueo del siguiente nivel |
| **Ligas** | `app/(tabs)/leaderboard.tsx` | Tabla de clasificación por XP total |
| **Tienda** | `app/(tabs)/shop.tsx` | Canje de gemas por recarga de vidas y congelador de racha |
| **Traductor de Voz** | `app/translator/index.tsx` | Reconocimiento y síntesis de voz (Web Speech API) + Edge Function `translate` |
| **Guía Gramatical** | `app/guidebook/[id].tsx` | Referencia de fonética y gramática Quechua |
| **Perfil** | `app/(tabs)/profile.tsx` | Estadísticas del usuario, insignias y cierre de sesión |

---

## 🛠️ Instrucciones de Inicio

### 1. Instalación de dependencias

```bash
npm install
```

### 2. Ejecutar servidor de desarrollo local

```bash
npx expo start -c
```

### 3. Ejecutar con Docker

```bash
docker compose up -d
```
Acceso web en `http://10.10.10.10:8081` o `http://localhost:8081`.

---

## 📚 Documentación Adicional

Para más detalles sobre la gobernanza y arquitectura del proyecto, consulta la carpeta [/docs](file:///Users/alex/Documents/Yesikita/Yachay/docs/):
- [01-BITACORA_DESARROLLO.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/01-BITACORA_DESARROLLO.md) — registro cronológico de hitos técnicos
- [02-SESSION_MEM.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/02-SESSION_MEM.md) — estado actual del proyecto y de la sesión activa
- [03-REQUERIMIENTOS.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/03-REQUERIMIENTOS.md) — alcance y casos de uso
- [04-SPRINTS.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/04-SPRINTS.md) — roadmap y tareas por sprint
- [05-FINDINGS_DEUDA.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/05-FINDINGS_DEUDA.md) — deuda técnica y hallazgos (GAPs)
- [06-TASK_PLAN.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/06-TASK_PLAN.md) — distribución de tareas del equipo
- [07-PROMPT_DESARROLLO.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/07-PROMPT_DESARROLLO.md) — protocolo de arranque para asistentes de IA
- [08-CONTROL_SESION.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/08-CONTROL_SESION.md) — checklist de verificación y cierre de sesión
- [09-BD-SPEC.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/09-BD-SPEC.md) — especificación completa del esquema de base de datos

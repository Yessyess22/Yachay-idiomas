# CONTEXTO_PROYECTO — Yachay Idiomas

> Documento generado el **2026-09-08** y actualizado el **2026-09-12** mediante análisis exhaustivo del repositorio.
> Cubre configuración, código fuente, dependencias, arquitectura e infraestructura tal como existen tras el Sprint 3.

---

## 1. Resumen del Proyecto

| Campo | Valor |
|---|---|
| **Nombre** | Yachay |
| **Slug** | `Yachay` |
| **Versión** | `1.0.0` |
| **Scheme (deep-link)** | `yachay://` |
| **Orientación** | Portrait (fija) |
| **Tema UI** | Automático (light / dark según el sistema operativo) |
| **Plataformas** | iOS, Android y Web (`output: "single"`, SPA) |
| **Punto de entrada** | `expo-router/entry` (file-based routing) |

### Objetivo de la aplicación

**Yachay** es una aplicación móvil gamificada (estilo Duolingo) para el aprendizaje del idioma **Quechua (Runasimi)**, con backend en Supabase (PostgreSQL en 3FN) y frontend en Clean Architecture Feature-First.

### Flujos implementados (estado tras Sprint 3)

| Flujo | Estado |
|---|---|
| Portada de bienvenida (`(auth)/index.tsx`), Login y Registro con Supabase Auth | ✅ Implementado |
| Home con categorías dinámicas y XP (`(tabs)/index.tsx`) | ✅ Implementado |
| Detalle de categoría con listado de lecciones (`category/[slug].tsx`) | ✅ Implementado |
| Lección en dos fases (Teoría → Quiz) con tarjetas de vocabulario (`lesson/[id].tsx`) | ✅ Implementado |
| Ejercicios de opción múltiple, banco de palabras y pares (`components/yachay/exercises/`) | ✅ Implementado |
| Gamificación global: vidas, XP, gemas y racha (`src/context/GameContext.tsx`) | ✅ Implementado (estado local, no persistido) |
| Pantalla de bloqueo al agotar vidas (`app/blocked.tsx`) | ✅ Implementado |
| Exámenes bloqueantes de fin de nivel con desbloqueo (`level/exam/[levelId].tsx`) | ✅ Implementado |
| Traductor de voz Español↔Quechua (Web Speech API + Edge Function) (`translator/index.tsx`) | ✅ Implementado |
| Guía gramatical de referencia (`guidebook/[id].tsx`) | ✅ Implementado |
| Tabla de clasificación / Ligas (`(tabs)/leaderboard.tsx`) | ✅ Implementado (usa `total_xp` de `profiles`, no la tabla `leaderboard_weekly`) |
| Tienda de ítems con gemas (`(tabs)/shop.tsx`) | ✅ Implementado |
| Perfil de usuario con estadísticas, insignias y Cerrar Sesión (`(tabs)/profile.tsx`) | ✅ Implementado |
| Pestaña "Explorar" | ✅ Reemplazada por contenido educativo de Yachay/Quechua |
| Modal (`app/modal.tsx`) | ⚠️ Plantilla genérica de Expo — sin personalizar |

---

## 2. Stack Tecnológico y Versiones

| Tecnología | Versión declarada | Archivo de referencia |
|---|---|---|
| **Expo SDK** | `~57.0.21` | `package.json` |
| **React** | `19.2.3` | `package.json` |
| **React DOM** | `19.2.3` | `package.json` |
| **React Native** | `0.86.3` | `package.json` |
| **React Native Web** | `~0.21.0` | `package.json` |
| **TypeScript** | `~6.0.3` | `package.json` |
| **Expo Router** | `~57.0.20` | `package.json` |
| **Supabase JS** | `^2.116.0` | `package.json` |
| **Firebase** | `^12.19.0` | `package.json` (Firebase Auth planificado junto a Supabase como BD, ver `docs/09-BD-SPEC.md`) |
| **react-native-reanimated** | `4.5.1` | `package.json` (animaciones de Yachi en lecciones) |
| **Node.js (Docker)** | `node:20-alpine` | `Dockerfile` |

---

## 3. Inventario Completo de Librerías

### 3.1 Dependencias de Producción (`dependencies`)

| Librería | Versión | Propósito / Función en el proyecto |
|---|---|---|
| `expo` | `~57.0.21` | Framework principal: runtime, CLI y toolchain base |
| `expo-router` | `~57.0.20` | Navegación file-based — rutas = archivos dentro de `app/` |
| `react` | `19.2.3` | Librería UI base |
| `react-dom` | `19.2.3` | Renderer de React para la plataforma Web |
| `react-native` | `0.86.3` | Framework mobile cross-platform (iOS / Android) |
| `react-native-web` | `~0.21.0` | Adapter que permite ejecutar componentes RN en el navegador |
| `@react-navigation/native` | `^7.1.8` | Núcleo de navegación nativa (peer dep de expo-router) |
| `@react-navigation/bottom-tabs` | `^7.4.0` | Navigator de pestañas inferiores (Tab Bar: Aprender, Explorar, Ligas, Tienda, Perfil) |
| `@react-navigation/elements` | `^2.6.3` | Primitivas de UI para react-navigation (headers, etc.) |
| `@supabase/supabase-js` | `^2.116.0` | Cliente oficial de Supabase: Auth, Base de datos, Storage, Realtime |
| `firebase` | `^12.19.0` | SDK de Firebase (Auth planificado como capa de identidad, ver `docs/09-BD-SPEC.md`) |
| `@react-native-async-storage/async-storage` | `2.2.0` | Almacenamiento clave-valor local — persiste la sesión de Supabase |
| `react-native-url-polyfill` | `^4.0.0` | Polyfill de la API `URL` necesaria para el cliente de Supabase en RN |
| `@expo/vector-icons` | `^15.0.3` | Colección de íconos vectoriales (FontAwesome, MaterialIcons, etc.) |
| `expo-asset` | `~57.0.16` | Precarga y gestión de assets estáticos (imágenes de Yachi y tarjetas) |
| `expo-constants` | `~57.0.17` | Acceso a constantes de la app y variables de entorno `EXPO_PUBLIC_*` |
| `expo-font` | `~57.0.3` | Carga de fuentes personalizadas |
| `expo-haptics` | `~57.0.2` | Retroalimentación táctil (vibración) en botones del Tab Bar |
| `expo-image` | `~57.0.4` | Componente `Image` optimizado con caché y placeholders |
| `expo-linking` | `~57.0.9` | Deep-links y URLs universales |
| `expo-splash-screen` | `~57.0.8` | Control de la pantalla de carga inicial |
| `expo-status-bar` | `~57.0.1` | Control del color y estilo de la barra de estado del SO |
| `expo-symbols` | `~57.0.2` | Íconos SF Symbols nativos (principalmente iOS) |
| `expo-system-ui` | `~57.0.3` | Configuración de la barra de navegación del sistema operativo |
| `expo-web-browser` | `~57.0.2` | Apertura de URLs en un browser in-app (OAuth flows) |
| `react-native-gesture-handler` | `~2.32.0` | Gestión de gestos táctiles de bajo nivel (base de la navegación) |
| `react-native-reanimated` | `4.5.1` | Animaciones de alta performance (bounce de Yachi en aciertos/desaciertos) |
| `react-native-worklets` | `0.10.1` | Peer dependency del motor de worklets requerido por Reanimated 4 |
| `react-native-safe-area-context` | `~5.7.0` | Manejo de "safe areas" (notch, barra de estado, gestures) |
| `react-native-screens` | `~4.26.0` | Optimización de pantallas nativas para el stack navigator |

### 3.2 Dependencias de Desarrollo (`devDependencies`)

| Librería | Versión | Propósito / Función en el proyecto |
|---|---|---|
| `typescript` | `~6.0.3` | Lenguaje con tipado estático — toda la base de código es `.tsx`/`.ts` |
| `@types/react` | `~19.2.4` | Tipos de TypeScript para React 19 |
| `eslint` | `^9.25.0` | Linter de código JavaScript/TypeScript |
| `eslint-config-expo` | `~57.0.2` | Reglas de ESLint preconfiguradas y recomendadas para proyectos Expo |
| `supabase` | `^2.117.0` | CLI de Supabase para gestionar migraciones, Studio y seed |

---

## 4. Análisis de Arquitectura y Estructura de Archivos

### 4.1 Árbol Completo de Directorios

```
Yachay/
│
├── app/                                  ← Sistema de rutas (Expo Router, file-based)
│   ├── _layout.tsx                       ← Stack root: AuthProvider + GameProvider + guard de sesión
│   ├── modal.tsx                         ← Pantalla modal (plantilla de Expo sin personalizar)
│   ├── blocked.tsx                       ← Pantalla de bloqueo al agotar las 5 vidas
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                     ← Portada de bienvenida (marca Yachay + Yachi)
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx                   ← Tab navigator: Aprender / Explorar / Ligas / Tienda / Perfil
│   │   ├── index.tsx                     ← Tab "Aprender": categorías dinámicas + XP
│   │   ├── explore.tsx                   ← Tab "Explorar": contenido educativo de Quechua
│   │   ├── leaderboard.tsx               ← Tab "Ligas": tabla de clasificación
│   │   ├── shop.tsx                      ← Tab "Tienda": canje de gemas por ítems
│   │   └── profile.tsx                   ← Tab "Perfil": estadísticas, insignias, logout
│   ├── category/[slug].tsx               ← Lecciones de una categoría
│   ├── lesson/[id].tsx                   ← Motor de ejercicios (Teoría → Quiz) + GameContext
│   ├── level/exam/[levelId].tsx          ← Examen bloqueante de fin de nivel
│   ├── guidebook/[id].tsx                ← Guía gramatical de referencia
│   └── translator/index.tsx              ← Traductor de voz Español↔Quechua
│
├── components/
│   ├── external-link.tsx, haptic-tab.tsx, hello-wave.tsx,
│   │   parallax-scroll-view.tsx, themed-text.tsx, themed-view.tsx  ← Remanentes de plantilla Expo
│   ├── ui/                               ← icon-symbol (multiplataforma), collapsible
│   └── yachay/                           ← Componentes de marca
│       ├── account-info.tsx, categoria-card.tsx, cerrar-sesion-button.tsx,
│       │   exploracion-link.tsx, llama-mark.tsx, main-container.tsx,
│       │   profile-hero.tsx, profile-stat.tsx, yachay-header.tsx, yachay-top-bar.tsx
│       └── exercises/
│           ├── word-bank-exercise.tsx    ← Ejercicio de banco de palabras
│           └── matching-pairs-exercise.tsx  ← Ejercicio de emparejar pares
│
├── constants/
│   ├── theme.ts                          ← Paleta y fuentes base de la plantilla Expo
│   ├── yachay-theme.ts                   ← Paleta de marca legacy
│   └── illustrations.ts                  ← Mapa de ilustraciones (Yachi, tarjetas)
│
├── src/                                  ★ Capa Clean Architecture
│   ├── context/
│   │   ├── AuthContext.tsx               ← Sesión de usuario (Supabase Auth)
│   │   └── GameContext.tsx               ← Vidas, XP, gemas y racha (reducer, estado local en memoria)
│   ├── services/
│   │   ├── supabase.ts                   ← Instancia única del cliente Supabase
│   │   ├── authService.ts                ← signIn, signUp, signOut, getProfile
│   │   ├── categoryService.ts            ← fetchCategories, fetchLessonsWithProgress
│   │   ├── questionService.ts            ← fetchQuestionsByLesson, recordLessonProgress
│   │   ├── examService.ts                ← fetchExamByLevel (preguntas + opciones)
│   │   ├── progressService.ts            ← fetchLevelProgress, recordExamResult, unlockNextLevel
│   │   ├── leaderboardService.ts         ← fetchWeeklyLeaderboard (consulta profiles.total_xp)
│   │   ├── questService.ts               ← fetchDailyQuests, fetchBadges
│   │   ├── shopService.ts                ← fetchShopItems, buyItem
│   │   └── voiceService.ts               ← Web Speech API + Edge Function `translate`
│   ├── types/index.ts                    ← Interfaces TypeScript de todo el dominio
│   ├── assets/images/index.ts            ← Re-exports semánticos de imágenes
│   └── utils/                            ← (vacío, reservado)
│
├── context/AuthContext.tsx               ← Re-export shim: `export { AuthProvider, useAuth } from '@/src/context/AuthContext'`
├── lib/supabase.ts                       ← Re-export shim: `export { supabase } from '@/src/services/supabase'`
│
├── hooks/
│   ├── use-color-scheme.ts / .web.ts, use-theme-color.ts  ← Plantilla Expo
│   └── use-responsive.ts                 ← Hook de breakpoints responsivos
│
├── assets/images/
│   ├── cards/                            ← Tarjetas e ilustraciones de fondo
│   ├── yachi/                            ← Mascota Yachi (avatar, expresiones)
│   └── (íconos base de Expo: icon, splash, favicon, android-icon-*)
│
├── scripts/reset-project.js              ← Script de Expo para limpiar la plantilla base
│
├── supabase/
│   ├── config.toml                       ← Configuración del entorno local de Supabase CLI
│   ├── seed.sql                          ← 3 categorías, 6 lecciones, 30 preguntas, 120 opciones
│   └── migrations/
│       ├── 20260910000000_initial_yachay_schema.sql       ← 11 tablas 3FN + RLS
│       └── 20260912000000_gamification_and_exercises.sql  ← Gamificación: quests, badges, ligas, tienda
│
├── Dockerfile                            ← `node:20-alpine`, expone puerto 8081
├── docker-compose.yml                    ← Red `yachay-net` (10.10.10.0/24), IP fija `10.10.10.10`
├── .dockerignore
│
├── .claude/settings.json
├── .vscode/{extensions,settings}.json
│
├── app.json, package.json, package-lock.json, tsconfig.json, eslint.config.js
├── global.d.ts                           ← Declaraciones de módulos de imagen (.png/.jpg/.svg)
├── AGENTS.md, CLAUDE.md                  ← Instrucciones para agentes de IA
├── docs/                                 ← Documentación de gobernanza (ver README.md)
└── README.md
```

### 4.2 Evaluación vs. Clean Architecture (Feature-First)

| Criterio de Feature-First | Estado actual | Evaluación |
|---|---|---|
| `screens/` | ❌ No existe | Las pantallas viven en `app/` — Expo Router las reemplaza por convención |
| `navigation/` | ❌ No existe | Los `_layout.tsx` de cada grupo cumplen este rol de forma implícita |
| `components/` | ✅ Existe | `components/yachay/` agrupa componentes de marca; `components/ui/` es genérico |
| `context/` | ✅ Existe | `src/context/{AuthContext,GameContext}.tsx` — activos; existen duplicados legacy en `context/` raíz |
| `hooks/` | ✅ Existe | Hooks de tema y responsividad |
| `constants/` | ✅ Existe | Paleta y tokens de marca, aunque duplicados entre `constants/theme.ts`, `constants/yachay-theme.ts` y `src/constants/theme.ts` |
| `utils/` | ⚠️ Vacío | Carpeta `src/utils/` existe pero sin contenido |
| `services/` o `api/` | ✅ Existe | `src/services/` — 9 servicios, cero llamadas directas a Supabase detectadas en `app/` |
| `features/` | ⚠️ Ausente | `src/features/.gitkeep` reservado, sin uso real |
| Separación UI / dominio / datos | ✅ Alta | Las pantallas consumen servicios tipados; `GameContext` centraliza el estado de juego (ver limitación en Sección 6.5) |

**Veredicto:** La capa `src/{context,services,types}/` cumple la Clean Architecture Feature-First para el flujo de datos con Supabase. Persiste una deuda relevante: `GameContext` no sincroniza su estado (vidas, XP, gemas, racha) contra las columnas equivalentes de `profiles` (ver `docs/05-FINDINGS_DEUDA.md`, GAP-06).

### 4.3 Carpetas y Archivos Legacy a Revisar

| Carpeta / Archivo | Observación |
|---|---|
| `context/AuthContext.tsx` (raíz) y `lib/supabase.ts` | Son **re-export shims** de una línea hacia `src/context/AuthContext.tsx` y `src/services/supabase.ts` respectivamente — no hay lógica duplicada ni riesgo de doble contexto, pero conviven dos rutas de import (`@/context/AuthContext` y `@/src/context/AuthContext`) para el mismo módulo; conviene unificar a una sola convención de import. |
| `constants/theme.ts` vs `constants/yachay-theme.ts` vs `src/constants/theme.ts` | Tres archivos de tokens de color con propósito solapado |

---

## 5. Configuración de Infraestructura (Docker y Red)

El proyecto **sí contiene infraestructura Docker** (agregada en Sprint 1, tras el estado descrito en la versión original de este documento):

| Punto de verificación | Resultado |
|---|---|
| Imagen base de Node.js | `node:20-alpine` (`Dockerfile`) |
| Comandos de instalación | `npm install` dentro del contenedor |
| Puerto mapeado | `8081:8081` |
| Volumen de desarrollo montado | `.:/app` (con exclusión de `node_modules` y `.expo`) |
| Subred estática | ✅ `10.10.10.0/24` (red `yachay-net`, driver `bridge`) |
| IP estática asignada al servicio | ✅ `10.10.10.10` |

```bash
docker compose up -d
# Acceso web en http://10.10.10.10:8081 o http://localhost:8081
```

### Supabase (cloud + CLI local)

El proyecto usa Supabase **cloud** como backend de producción (`supabase/.temp/project-ref` referencia un proyecto vinculado) y la **CLI de Supabase** para gestionar migraciones y el entorno local de desarrollo. Puertos locales relevantes (`supabase/config.toml`):

| Servicio Supabase local | Puerto |
|---|---|
| API REST (PostgREST) | `54321` |
| Base de datos PostgreSQL | `54322` |
| Supabase Studio (UI web) | `54323` |
| Servidor SMTP de prueba | `54324` |

---

## 6. Estado de Implementación Actual

### 6.1 Grafo de Navegación (Expo Router)

```
app/_layout.tsx  ← Stack root + AuthProvider + GameProvider + guard de sesión automático
│
├── (auth)/                        ← Zona NO autenticada
│   ├── index.tsx                  ← Portada de bienvenida
│   ├── login.tsx
│   └── signup.tsx
│
├── (tabs)/                        ← Zona autenticada principal
│   ├── index.tsx                  ← "Aprender": categorías de Quechua
│   ├── explore.tsx                ← "Explorar": contenido educativo
│   ├── leaderboard.tsx            ← "Ligas": clasificación por XP
│   ├── shop.tsx                   ← "Tienda": canje de gemas
│   └── profile.tsx                ← "Perfil": estadísticas y logout
│
├── category/[slug].tsx            ← Detalle de categoría (stack sobre tabs)
├── lesson/[id].tsx                ← Motor de ejercicios (Teoría → Quiz)
├── level/exam/[levelId].tsx       ← Examen bloqueante de nivel
├── guidebook/[id].tsx             ← Guía gramatical
├── translator/index.tsx           ← Traductor de voz
├── blocked.tsx                    ← Bloqueo por vidas agotadas
└── modal.tsx                      ← Modal genérico (plantilla Expo)
```

**Guard de autenticación:** `app/_layout.tsx` usando `useAuth()` + `useSegments()`. Redirige a `/(auth)` si no hay sesión, y a `/(tabs)` si hay sesión y el usuario intenta acceder al grupo auth. Adicionalmente envuelve el árbol en `GameProvider` y redirige a `/blocked` cuando `isBlocked` es verdadero.

### 6.2 Modelo de Datos Supabase (esquema real, `supabase/migrations/`)

**Migración inicial** (`20260910000000_initial_yachay_schema.sql`) — 11 tablas en 3FN: `profiles`, `categories`, `lessons`, `questions`, `question_options`, `levels`, `exams`, `exam_questions`, `lesson_progress`, `level_progress`, `translation_history`.

**Migración de gamificación** (`20260912000000_gamification_and_exercises.sql`, 2026-09-12):
- Nuevas columnas en `profiles`: `streak_count`, `last_active_date`, `streak_freeze_count`, `gems` (default 100), `lives` (0–5, default 5), `last_life_lost_at`.
- `question_type` amplía su CHECK a: `multiple_choice`, `text_input`, `image_match`, `word_bank`, `matching_pairs`, `listening`, `speaking`.
- Tablas nuevas: `daily_quests`, `user_quests`, `badges`, `user_badges`, `leaderboard_weekly`, `shop_items`, `user_inventory`, todas con RLS habilitado.

Ver el detalle completo de columnas y políticas en `docs/09-BD-SPEC.md`.

### 6.3 Variables de Entorno Requeridas

| Variable | Uso |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (cloud o local) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase |

### 6.4 Dependencias funcionales entre pantallas y datos reales vs. mock

| Pantalla/Servicio | Fuente de datos |
|---|---|
| `leaderboardService.fetchWeeklyLeaderboard` | Consulta `profiles.total_xp` — **no** usa la tabla `leaderboard_weekly` creada en la migración de gamificación |
| `shop.tsx` | Lista de ítems **hardcodeada** en el componente; `shopService.fetchShopItems()` (que sí lee `shop_items`) existe pero no está siendo invocado desde la pantalla |
| `GameContext` (vidas, XP, gemas, racha) | Estado **local en memoria** (`useReducer`), inicializado con valores fijos (`gems: 100`, `streakDays: 3`); no se sincroniza con las columnas equivalentes de `profiles` |

### 6.5 Limitación conocida: `GameContext` no persistido

`src/context/GameContext.tsx` gestiona vidas, XP, gemas y racha con un `useReducer` cuyo estado inicial es fijo y se pierde al recargar la app o cerrar sesión. La migración `20260912000000` ya agregó las columnas necesarias en `profiles` (`lives`, `gems`, `streak_count`, etc.) pero ningún servicio actual lee o escribe ese estado hacia/desde Supabase. Este hallazgo está registrado como **GAP-06** en `docs/05-FINDINGS_DEUDA.md`.

---

## 7. Resumen de Pendientes y Observaciones

| # | Observación | Criticidad |
|---|---|---|
| 1 | `GameContext` (vidas, XP, gemas, racha) no persiste contra `profiles`; se reinicia en cada sesión. | 🔴 Alta |
| 2 | `leaderboardService` no usa la tabla `leaderboard_weekly` creada para tal fin; y `shop.tsx` no consume `shopService.fetchShopItems()`. | 🟡 Media |
| 3 | Dos rutas de import (`@/context/AuthContext` vs `@/src/context/AuthContext`, `@/lib/supabase` vs `@/src/services/supabase`) resuelven al mismo módulo vía re-export shims; conviene unificar la convención de import. | 🟢 Baja |
| 4 | Triple definición de tokens de color (`constants/theme.ts`, `constants/yachay-theme.ts`, `src/constants/theme.ts`). | 🟢 Baja |
| 5 | El modal (`app/modal.tsx`) sigue siendo la plantilla genérica de Expo sin personalizar. | 🟢 Baja |
| 6 | No existen pruebas automatizadas (ni de unidad ni de integración) — GAP-03, abierto para Sprint 4. | 🟢 Baja |

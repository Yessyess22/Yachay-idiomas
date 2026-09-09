# CONTEXTO_PROYECTO — Yachay Idiomas

> Documento generado el **2026-09-08** mediante análisis exhaustivo del repositorio.
> Cubre configuración, código fuente, dependencias, arquitectura e infraestructura.

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
| **Plataformas** | iOS, Android y Web (`output: "static"`) |
| **Punto de entrada** | `expo-router/entry` (file-based routing) |

### Objetivo de la aplicación

**Yachay** es una aplicación móvil para el aprendizaje del idioma **Quechua**. Esto queda confirmado en múltiples pantallas del código fuente:

- `app/(auth)/signup.tsx` → subtítulo: *"Empieza a aprender quechua"*
- `app/(tabs)/index.tsx` → encabezado: *"Aprende quechua"*

La estructura de datos en Supabase modela la jerarquía `courses → lessons → exercises`, el flujo clásico de una aplicación de aprendizaje de idiomas al estilo Duolingo.

### Flujos ya implementados

| Flujo | Estado |
|---|---|
| Autenticación (Login / Signup con Supabase Auth) | ✅ Implementado |
| Listado de cursos de Quechua (pantalla Home) | ✅ Implementado |
| Detalle de curso con listado de lecciones y XP | ✅ Implementado |
| Motor de ejercicios de opción múltiple con feedback visual | ✅ Implementado |
| Barra de progreso y pantalla de resultados al finalizar lección | ✅ Implementado |
| Guard de sesión (redirige automáticamente según estado de auth) | ✅ Implementado |
| Pestaña "Explore" | ⚠️ Plantilla genérica de Expo — sin personalizar |
| Modal | ⚠️ Plantilla genérica de Expo — sin personalizar |

---

## 2. Stack Tecnológico y Versiones

> **⚠️ IMPORTANTE — Node.js:** El proyecto **NO contiene `Dockerfile` ni `docker-compose.yml`**. Por lo tanto, no existe una versión de Node.js declarada mediante infraestructura. Ver Sección 5 para el análisis completo de Docker.

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
| **Node.js** | ❌ No declarado | Sin `.nvmrc`, sin `engines`, sin Dockerfile |

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
| `@react-navigation/bottom-tabs` | `^7.4.0` | Navigator de pestañas inferiores (Tab Bar) |
| `@react-navigation/elements` | `^2.6.3` | Primitivas de UI para react-navigation (headers, etc.) |
| `@supabase/supabase-js` | `^2.116.0` | Cliente oficial de Supabase: Auth, Base de datos, Storage, Realtime |
| `@react-native-async-storage/async-storage` | `2.2.0` | Almacenamiento clave-valor local — persiste la sesión de Supabase |
| `react-native-url-polyfill` | `^4.0.0` | Polyfill de la API `URL` necesaria para el cliente de Supabase en RN |
| `@expo/vector-icons` | `^15.0.3` | Colección de íconos vectoriales (FontAwesome, MaterialIcons, etc.) |
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
| `react-native-reanimated` | `4.5.1` | Motor de animaciones de alta performance mediante JS worklets |
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
| `supabase` | `^2.117.0` | CLI de Supabase para gestionar el entorno local de desarrollo (migraciones, Studio, seed) |

---

## 4. Análisis de Arquitectura y Estructura de Archivos

### 4.1 Árbol Completo de Directorios

```
Yachay-idiomas/                          ← Raíz del proyecto (sin carpeta src/)
│
├── app/                                 ← Sistema de rutas (Expo Router, file-based)
│   ├── _layout.tsx                      ← Layout raíz: AuthProvider + guard de sesión
│   ├── modal.tsx                        ← Pantalla modal (plantilla de Expo sin personalizar)
│   ├── (auth)/                          ← Grupo de rutas de autenticación
│   │   ├── _layout.tsx                  ← Stack navigator sin header para auth
│   │   ├── login.tsx                    ← Pantalla de inicio de sesión ✅
│   │   └── signup.tsx                   ← Pantalla de registro de cuenta ✅
│   ├── (tabs)/                          ← Grupo de rutas principales con Tab Bar
│   │   ├── _layout.tsx                  ← Tab navigator (Home / Explore)
│   │   ├── index.tsx                    ← Tab "Home": listado de cursos de Quechua ✅
│   │   └── explore.tsx                  ← Tab "Explore": plantilla Expo sin personalizar ⚠️
│   ├── course/
│   │   └── [id].tsx                     ← Detalle de curso: listado de lecciones ✅
│   └── lesson/
│       └── [id].tsx                     ← Motor de ejercicios interactivos ✅
│
├── components/                          ← Componentes reutilizables de UI
│   ├── external-link.tsx                ← Enlace que abre el browser externo del sistema
│   ├── haptic-tab.tsx                   ← Botón del Tab Bar con vibración táctil
│   ├── hello-wave.tsx                   ← Animación de saludo (remanente de plantilla Expo)
│   ├── parallax-scroll-view.tsx         ← ScrollView con efecto parallax en el header
│   ├── themed-text.tsx                  ← Componente Text adaptado al tema light/dark
│   ├── themed-view.tsx                  ← Componente View adaptada al tema light/dark
│   └── ui/
│       ├── collapsible.tsx              ← Sección expansible/colapsable
│       ├── icon-symbol.ios.tsx          ← Íconos SF Symbols específicos de iOS
│       └── icon-symbol.tsx             ← Íconos multiplataforma (fallback a vector-icons)
│
├── constants/
│   └── theme.ts                         ← Paleta de colores (Colors) y fuentes tipográficas (Fonts)
│
├── context/                             ★ AÑADIDO (no es parte de la plantilla base)
│   └── AuthContext.tsx                  ← Contexto global de autenticación con React Context + Supabase
│
├── hooks/
│   ├── use-color-scheme.ts              ← Hook de color scheme para iOS/Android
│   ├── use-color-scheme.web.ts          ← Hook de color scheme para Web
│   └── use-theme-color.ts              ← Hook para leer colores del tema activo
│
├── lib/                                 ★ AÑADIDO (no es parte de la plantilla base)
│   └── supabase.ts                      ← Inicialización singleton del cliente de Supabase
│
├── assets/
│   └── images/                          ← Recursos gráficos: ícono, splash, favicon, logos de React
│
├── scripts/
│   └── reset-project.js                 ← Script de Expo para limpiar la plantilla base
│
├── supabase/                            ★ AÑADIDO (no es parte de la plantilla base)
│   ├── .gitignore
│   └── config.toml                      ← Configuración del entorno local de Supabase CLI
│
├── .claude/
│   └── settings.json                    ← Configuración del agente Claude Code
├── .vscode/
│   ├── extensions.json
│   └── settings.json
│
├── app.json                             ← Configuración de Expo (nombre, plugins, plataformas)
├── package.json                         ← Dependencias y scripts de npm
├── package-lock.json                    ← Lock file de npm (versiones exactas resueltas)
├── tsconfig.json                        ← Configuración de TypeScript
├── eslint.config.js                     ← Configuración de ESLint
├── AGENTS.md                            ← Instrucciones para agentes de IA
├── CLAUDE.md                            ← Instrucciones para Claude Code
└── README.md                            ← Documentación inicial (plantilla de Expo)
```

### 4.2 Evaluación vs. Clean Architecture (Feature-First)

| Criterio de Feature-First | Estado actual | Evaluación |
|---|---|---|
| `screens/` | ❌ No existe | Las pantallas viven en `app/` — Expo Router las reemplaza por convención |
| `navigation/` | ❌ No existe | Los `_layout.tsx` de cada grupo cumplen este rol de forma implícita |
| `components/` | ✅ Existe | Componentes reutilizables presentes, aunque sin dividir por feature |
| `context/` | ✅ Existe | `AuthContext.tsx` — gestión de sesión global correctamente encapsulada |
| `hooks/` | ✅ Existe | Hooks de tema presentes |
| `constants/` | ✅ Existe | Colores y tipografía centralizados en `theme.ts` |
| `utils/` | ❌ Ausente | No existe. Lógica utilitaria está inline en los componentes |
| `services/` o `api/` | ❌ Ausente | Las llamadas a Supabase están directamente dentro de las pantallas |
| `features/` | ❌ Ausente | Cursos, lecciones y ejercicios no tienen módulos de dominio separados |
| Separación UI / dominio / datos | ⚠️ Parcial | Las vistas mezclan tipos, estado, fetch y lógica de negocio en el mismo archivo |

**Veredicto:** La estructura es funcional y apropiada para Expo Router, pero **no cumple estrictamente la Clean Architecture Feature-First**. Las pantallas de cursos, lecciones y ejercicios concentran las responsabilidades de presentación, estado y acceso a datos en un mismo archivo. Para evolucionar hacia Feature-First, se recomienda extraer las llamadas a Supabase hacia una capa `lib/api/` o `services/` y separar los dominios en carpetas `features/`.

### 4.3 Carpetas y Archivos Adicionales (no presentes en la plantilla base de Expo)

| Carpeta / Archivo | Qué contiene |
|---|---|
| `context/AuthContext.tsx` | Contexto React con `signIn`, `signUp`, `signOut` y persistencia de sesión de Supabase |
| `lib/supabase.ts` | Instancia singleton del cliente de Supabase con AsyncStorage como storage de sesión |
| `supabase/config.toml` | Configuración completa del servidor Supabase local para desarrollo (API, DB, Auth, Storage, Studio, Realtime) |
| `app/course/[id].tsx` | Ruta dinámica — pantalla de detalle de curso con listado de lecciones y XP |
| `app/lesson/[id].tsx` | Ruta dinámica — motor completo de ejercicios interactivos |

---

## 5. Configuración de Infraestructura (Docker y Red)

### ⚠️ ALERTA CRÍTICA: NO EXISTE CONFIGURACIÓN DOCKER

Tras analizar exhaustivamente todos los directorios del repositorio, se confirma:

> **El proyecto NO contiene `Dockerfile` ni `docker-compose.yml` (ni `.yaml`) en ningún directorio.**

Consecuencias directas:

| Punto de verificación | Resultado |
|---|---|
| Imagen base de Node.js | ❌ No declarada |
| Versión de Node.js via Dockerfile | ❌ Indeterminable |
| Comandos de instalación en Docker | ❌ No existen |
| Puertos mapeados en Compose | ❌ No existen |
| Volumen de desarrollo montado | ❌ No existe |
| Subred estática `10.10.10.0/24` | ❌ **NO configurada** |
| IP estática asignada a servicio | ❌ **NO configurada** |

Si la materia exige esta infraestructura, debe crearse desde cero un `Dockerfile` (por ejemplo con imagen `node:22-alpine` + Expo CLI) y un `docker-compose.yml` que incluya la subred `10.10.10.0/24` con una IP fija asignada al servicio de la app.

### Lo que sí existe: Supabase Local (`supabase/config.toml`)

El proyecto usa la **CLI de Supabase** para levantar un backend local de desarrollo. Este proceso es gestionado por el binario `supabase` (devDependency), **no por Docker Compose del proyecto**. Los puertos configurados son:

| Servicio Supabase local | Puerto |
|---|---|
| API REST (PostgREST) | `54321` |
| Base de datos PostgreSQL 17 | `54322` |
| Supabase Studio (UI web) | `54323` |
| Servidor SMTP de prueba | `54324` |
| Analytics | `54327` |
| DB Shadow (para diffs de migraciones) | `54320` |
| Inspector de Edge Functions (Chrome DevTools) | `8083` |

La configuración de red de la BD en `config.toml` usa `allowed_cidrs = ["0.0.0.0/0"]` — esto es una restricción interna de Supabase, no una definición de subred Docker.

---

## 6. Estado de Implementación Actual

### 6.1 Grafo de Navegación (Expo Router)

```
app/_layout.tsx  ← Stack root + AuthProvider + guard de sesión automático
│
├── (auth)/                    ← Zona NO autenticada
│   ├── login.tsx              ← Entrada por defecto si no hay sesión
│   └── signup.tsx             ← Registro de nueva cuenta
│
├── (tabs)/                    ← Zona autenticada principal
│   ├── index.tsx              ← Tab "Home" → lista de cursos de Quechua
│   └── explore.tsx            ← Tab "Explore" (plantilla Expo sin personalizar)
│
├── course/[id].tsx            ← Detalle de curso (stack sobre tabs)
├── lesson/[id].tsx            ← Motor de ejercicios (stack sobre tabs)
└── modal.tsx                  ← Modal genérico (plantilla Expo)
```

**Guard de autenticación:** implementado en `app/_layout.tsx` usando `useAuth()` + `useSegments()`. Redirige a `/(auth)/login` si no hay sesión activa, y a `/(tabs)` si hay sesión y el usuario intenta acceder al grupo auth.

### 6.2 Pantallas en Detalle

#### `app/(auth)/login.tsx` — ✅ Implementado y funcional
- Formulario con campos de email y contraseña
- Llama a `AuthContext.signIn()` → Supabase `signInWithPassword()`
- Manejo de estado de loading con `ActivityIndicator`
- Muestra errores de Supabase en pantalla
- Enlace de navegación hacia la pantalla de registro

#### `app/(auth)/signup.tsx` — ✅ Implementado y funcional
- Formulario de registro con validación de contraseña mínima (6 caracteres)
- Llama a `AuthContext.signUp()` → crea usuario en Supabase Auth + inserta perfil en tabla `user_profiles` (username = parte local del email)
- Manejo de loading y errores

#### `app/(tabs)/index.tsx` — ✅ Implementado y funcional
- Consulta la tabla `courses` de Supabase ordenada por `order_index`
- Renderiza tarjetas con `FlatList`
- Al presionar una tarjeta, navega a `/course/{id}`
- Maneja el estado vacío con mensaje "Aún no hay cursos disponibles"

#### `app/(tabs)/explore.tsx` — ⚠️ Plantilla Expo sin personalizar
- Contiene el contenido de ejemplo del starter de Expo
- Muestra documentación sobre routing, imágenes, temas y animaciones
- **No está relacionado con la funcionalidad de aprendizaje de Quechua**

#### `app/course/[id].tsx` — ✅ Implementado y funcional
- Recibe el `id` del curso a través de la URL dinámica (`useLocalSearchParams`)
- Consulta en paralelo: título del curso (`courses`) y lecciones (`lessons`)
- Muestra cada lección con número de orden, título, descripción y recompensa XP (`xp_reward`)
- Al presionar una lección, navega a `/lesson/{id}`

#### `app/lesson/[id].tsx` — ✅ Implementado y funcional (motor de ejercicios)
- Carga todos los `exercises` de la lección desde Supabase ordenados por `order_index`
- Renderiza ejercicios de **opción múltiple** (`options: string[]`)
- El modelo de datos incluye `audio_url` e `image_url` (campos presentes pero aún no renderizados en la UI)
- Barra de progreso visual dinámica (`currentIndex / exercises.length`)
- Feedback inmediato al comprobar: verde para correcto, rojo para incorrecto
- Navegación entre ejercicios con botón "Comprobar" → "Continuar"
- Pantalla de resultados al finalizar: muestra `correctCount / total` y porcentaje

#### `app/modal.tsx` — ⚠️ Plantilla Expo sin personalizar
- Modal genérico con texto "This is a modal!" y enlace de retorno

### 6.3 Modelo de Datos Supabase (inferido del código)

| Tabla | Campos identificados |
|---|---|
| `courses` | `id`, `title`, `description`, `order_index` |
| `lessons` | `id`, `course_id`, `title`, `description`, `order_index`, `xp_reward` |
| `exercises` | `id`, `lesson_id`, `type`, `question`, `correct_answer`, `options` (array JSON), `audio_url`, `image_url`, `order_index` |
| `user_profiles` | `id` (FK → `auth.users`), `username` |

### 6.4 Variables de Entorno Requeridas

| Variable | Uso |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (cloud o local) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase |

---

## 7. Resumen de Pendientes y Observaciones

| # | Observación | Criticidad |
|---|---|---|
| 1 | **No existe Dockerfile ni docker-compose.yml.** Si la materia requiere esta infraestructura, debe crearse con subred `10.10.10.0/24` e IP estática. | 🔴 Alta |
| 2 | La pestaña **"Explore"** contiene la plantilla genérica de Expo y no representa funcionalidad del proyecto. | 🟡 Media |
| 3 | Las llamadas a Supabase están **directamente dentro de las pantallas** (`useEffect` + `supabase.from(...)`). Para clean architecture, deberían extraerse a una capa `lib/api/` o `services/`. | 🟡 Media |
| 4 | La versión de **Node.js no está declarada** en ningún archivo del repositorio (sin `.nvmrc`, sin campo `engines` en `package.json`, sin Dockerfile). | 🟠 Informativo |
| 5 | Los campos `audio_url` e `image_url` del modelo `exercises` están en la base de datos pero no se renderizan en la UI — funcionalidad futura pendiente. | 🟠 Informativo |
| 6 | No existe carpeta `utils/` ni lógica de dominio separada. | 🟢 Baja |
| 7 | No existen pruebas automatizadas (ni de unidad ni de integración). | 🟢 Baja |

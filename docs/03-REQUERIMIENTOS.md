# Especificación de Requerimientos — Yachay Quechua

**Versión:** 2.0 | **Fecha:** 2026-09-08 | **Última actualización:** 2026-09-14 | **Estado:** Activo — Visión No Comercial v2.0, Sprint 4 en curso

---

## 0. Declaración de Visión — No Comercial v2.0

Yachay Quechua es un proyecto académico, social y comunitario de código abierto, orientado exclusivamente a la preservación y revitalización del idioma quechua (Runasimi). **No persigue fines comerciales, no cobra por funcionalidades, no vende datos y no aplica monetización de ningún tipo.**

La versión 2.0 consolida los siguientes principios irrenunciables:

| Principio | Descripción |
| :--- | :--- |
| **Inclusividad** | Acceso libre para cualquier persona sin barreras económicas ni técnicas. |
| **Gamificación Educativa** | Vidas, XP y gemas se obtienen exclusivamente por esfuerzo de estudio, nunca por compra real. |
| **Privacidad** | Sin telemetría comercial, sin rastreo de publicidad, sin venta de información de usuarios. |
| **Patrimonio Cultural** | El contenido refleja el Runasimi andino con respeto por su diversidad dialectal. |
| **Comunidad** | Las Ligas y los desafíos semanales fomentan el aprendizaje colaborativo, no la competencia tóxica. |

---

## 1. Alcance del Sistema

Yachay Quechua es una aplicación móvil-web gamificada, inspirada en el modelo pedagógico de Duolingo, cuyo objetivo es enseñar el idioma quechua mediante ejercicios interactivos de opción múltiple estructurados en módulos temáticos, lecciones y niveles con exámenes de progreso. La aplicación opera sobre React Native Web con Expo 57, utiliza Supabase como backend local (autenticación y base de datos PostgreSQL 17) y se ejecuta dentro de un contenedor Docker aislado en la subred estática `10.10.10.0/24`.

El sistema cubre el ciclo completo de aprendizaje a través de los siguientes **módulos de contenido**:

| Módulo | Descripción | Tipo de ejercicio |
| :--- | :--- | :--- |
| **Abecedario** | Letras y fonemas del quechua con pronunciación asociada. | Opción múltiple + audio de referencia |
| **Números** | Numerales del 0 al 100 en quechua con escritura y pronunciación. | Opción múltiple + escritura |
| **Palabras** | Vocabulario cotidiano agrupado por categorías (saludos, colores, familia, comida). | Opción múltiple + asociación imagen-palabra |
| **Niveles con Exámenes** | Evaluaciones de bloqueo al final de cada nivel; el usuario debe superar el examen sin agotar sus vidas para desbloquear el siguiente nivel. | Motor de preguntas mixtas (todos los tipos) |
| **Traductor de Voz con IA** | El usuario habla al micrófono; la app captura el audio, lo procesa mediante un servicio de IA y devuelve la traducción Quechua↔Español en texto y audio sintetizado. | Interacción de voz en tiempo real |

---

## 2. Requerimientos Funcionales v2.0

### RF-01 — Onboarding Inmersivo de 4 Pasos

El sistema debe presentar al usuario primerizo un carrusel interactivo de 4 pasos guiado por la mascota Yachi:

1. **Bienvenida cultural** — Mensaje de apertura cultural: "Descubre el poder del Runasimi".
2. **Dinámica de juego** — Explicación visual de vidas (❤️), rachas diarias (🔥) y lecciones de 5 min.
3. **Meta de estudio diaria** — El usuario selecciona su compromiso: Casual (5 min), Regular (10 min) o Intenso (15 min).
4. **Acceso** — Botonera para "Explorar como Invitado" o "Iniciar Sesión / Registrarse".

El estado de onboarding completado se persiste en `AsyncStorage` con la clave `onboardingComplete` para no volver a mostrarse en sesiones futuras.

**Archivo:** `app/onboarding/index.tsx`

---

### RF-02 — Autenticación Empática sin Fricciones

El sistema debe permitir el registro e inicio de sesión mediante email y contraseña a través de Supabase Auth. Toda retroalimentación de error debe mostrarse mediante banners visuales inline; se prohíbe `window.alert` y `Alert.alert`. El flujo de alta incluye la creación del perfil en la tabla `profiles`.

**Archivos:** `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`, `src/services/authService.ts`, `src/context/AuthContext.tsx`

---

### RF-03 — Dashboard Cultural "Camino del Saber"

El sistema debe mostrar en `app/(tabs)/index.tsx` una ruta de aprendizaje visual tipo serpentín (zigzag), ordenada por unidades temáticas con nodos de lección, cofre y examen. El header siempre muestra XP, vidas, racha y acceso rápido a la guía gramatical. La sección activa indica el próximo nodo a completar con el botón "¡EMPEZAR!".

**Archivo:** `app/(tabs)/index.tsx`

---

### RF-04 — Motor de Lecciones en Dos Fases (Teoría → Quiz)

El sistema debe presentar cada lección en dos fases consecutivas:
1. **Fase Teórica:** tarjetas de vocabulario con imagen, palabra en quechua y traducción.
2. **Fase Quiz:** preguntas de opción múltiple, banco de palabras o pares, con retroalimentación visual inmediata (verde/rojo).

El XP se acumula solo en la fase quiz. Al completar la lección se registra el progreso en `lesson_progress` y se acreditan gemas al `GameContext`.

**Archivo:** `app/lesson/[id].tsx`

---

### RF-05 — Gamificación No Monetizada

El sistema debe gestionar el estado de gamificación del usuario con las siguientes reglas:

- **Vidas (❤️):** El usuario inicia con 5. Cada respuesta incorrecta descuenta 1. Al llegar a 0 la aplicación bloquea el avance (`isBlocked = true`).
- **XP:** Cada respuesta correcta suma `+10 XP`. El XP se persiste en la columna `total_xp` de `profiles`.
- **Gemas (💎):** Se obtienen exclusivamente al completar lecciones (`+15` por lección). Se persisten en la columna `gems` de `profiles`. **No existe opción de compra con dinero real.**
- **Racha (🔥):** Días consecutivos de estudio. Se persiste en `streak_count` de `profiles`.

El estado se hidrata desde `profiles` al autenticarse y se sincroniza asíncronamente con Supabase tras cada mutación.

**Archivo:** `src/context/GameContext.tsx`

---

### RF-06 — Exámenes de Nivel Bloqueantes

El sistema debe presentar exámenes de fin de nivel. El usuario debe superar el umbral `pass_threshold` sin agotar sus vidas para desbloquear el siguiente nivel. El resultado se registra en `level_progress`.

**Archivo:** `app/level/exam/[levelId].tsx`

---

### RF-07 — Traductor de Voz e IA Inclusivo

El sistema debe proveer un módulo de traducción de voz interactiva que capture audio del micrófono del dispositivo (Web Speech API), lo envíe a la Edge Function `translate` de Supabase y devuelva la traducción Quechua↔Español en texto y audio sintetizado (SpeechSynthesis). Todo sin `window.alert` ni diálogos del sistema.

**Archivo:** `app/translator/index.tsx`

---

### RF-08 — Ligas de Constancia y Aprendizaje Colaborativo

El sistema debe mostrar una tabla de líderes semanal que consulta la tabla `leaderboard_weekly` (no el XP histórico global). Los usuarios se clasifican por `weekly_xp` y se agrupan en ligas: Bronce, Plata, Oro, Esmeralda y Diamante. El objetivo es motivar la constancia, no la competencia económica.

**Archivo:** `src/services/leaderboardService.ts`, `app/(tabs)/leaderboard.tsx`

---

## 3. Casos de Uso Críticos

### CU-01 — Onboarding Inmersivo (nuevo en v2.0)

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario primerizo (sin sesión ni flag de onboarding) |
| **Precondición** | `AsyncStorage` no tiene la clave `onboardingComplete = true`. El layout redirige a `/onboarding`. |
| **Flujo normal** | 1. El usuario ve el paso 1 (Bienvenida cultural). 2. Avanza por los 4 pasos con el botón "Siguiente". 3. En el paso 3 selecciona su meta diaria. 4. En el paso 4 elige "Iniciar Sesión / Registrarse" o "Explorar como Invitado". 5. La pantalla escribe `onboardingComplete = true` en AsyncStorage y navega a `/(auth)`. |
| **Flujo alternativo** | A1 — Usuario regresante: `onboardingComplete = true` en AsyncStorage → el layout salta el onboarding y va directo a `/(auth)` o `/(tabs)` según la sesión. |

---

### CU-02 — Iniciar Sesión / Registro

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario no autenticado |
| **Precondición** | El emulador local de Supabase Auth está corriendo en `localhost:54321`. El usuario accede a la ruta `/(auth)/login` o `/(auth)/signup`. |
| **Flujo normal** | 1. El usuario ingresa email y contraseña. 2. La pantalla invoca `authService.signIn()` (o `signUp()`) en `src/services/authService.ts`. 3. El servicio llama a `supabase.auth.signInWithPassword()`. 4. Supabase Auth local devuelve un `access_token` y un `refresh_token`. 5. `AuthContext` almacena la sesión, carga el perfil y redirige al usuario a `/(tabs)/index`. 6. `GameProvider` hidrata vidas, XP, gemas y racha desde el perfil cargado. |
| **Flujo alternativo** | A1 — Credenciales incorrectas: retroalimentación visual inline sin `window.alert`. A2 — Email ya registrado: banner informativo inline. |

---

### CU-03 — Resolver Ejercicio

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado con lección activa |
| **Precondición** | El usuario tiene vidas disponibles (`GameContext.lives > 0`). La lección tiene al menos una pregunta cargada desde Supabase. |
| **Flujo normal** | 1. La pantalla `app/lesson/[id].tsx` presenta fase teórica (tarjetas de vocabulario) seguida de quiz. 2. El usuario selecciona respuestas. 3. `GameContext.checkAnswer(isCorrect)` actualiza estado en memoria y lo sincroniza con `profiles` en Supabase. 4. Al completar, se llama a `questionService.recordLessonProgress()` y se navega a resultados. |
| **Flujo alternativo** | A1 — Respuesta incorrecta: rojo, descuento de vida, sincronización inmediata con Supabase. A2 — Sin vidas: `isBlocked = true`, redirige a `/blocked`. |

---

### CU-04 — Control de Gamificación (Vidas, XP, Gemas y Racha)

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Sistema (`GameContext`) |
| **Precondición** | El usuario está autenticado. `GameContext` fue hidratado desde `profiles` vía `authService.getProfile()`. |
| **Flujo normal** | Cada mutación (vida perdida, XP ganado, gema acreditada) se actualiza en memoria y se sincroniza asíncronamente (debounced 800 ms) con las columnas `lives`, `total_xp`, `gems` y `streak_count` de la tabla `profiles` en Supabase. |
| **Flujo alternativo** | A1 — `lives` llega a 0: `isBlocked = true`, guard en `_layout.tsx` redirige a `/blocked`. A2 — Compra en Tienda con gemas acumuladas por estudio: `consumeGems()` descuenta localmente y sincroniza con Supabase. |

---

### CU-05 — Rendir Examen de Nivel

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado con nivel activo |
| **Precondición** | El usuario completó las lecciones del nivel actual. El examen está disponible en `exams` con preguntas en `questions`/`question_options`. |
| **Flujo normal** | 1. `examService.fetchExamByLevel(levelId)` carga el examen. 2. El usuario responde. 3. Si `score >= pass_threshold`: `progressService.recordExamResult()` → `passed = true` y desbloqueo del siguiente nivel. 4. Pantalla de resultados con puntaje y mínimo requerido. |
| **Flujo alternativo** | A1 — Reprobado: sin desbloqueo, pantalla de "Inténtalo de nuevo". |

---

### CU-06 — Traducir Voz con IA

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado en el módulo Traductor |
| **Precondición** | Navegador con soporte de `SpeechRecognition`. Edge Function `translate` accesible. |
| **Flujo normal** | 1. El usuario elige dirección (Español ↔ Quechua) y modo (texto/voz). 2. En modo voz, `startVoiceRecognition(lang)` captura el transcript. 3. `translateText()` invoca la Edge Function y devuelve la traducción. 4. `speakText()` sintetiza audio del resultado. |
| **Flujo alternativo** | A1 — Sin soporte de SpeechRecognition: banner explicativo sin `window.alert`. A2 — Edge Function con error: estado de error con botón de reintento. |

---

## 4. Requerimientos No Funcionales

| ID | Descripción | Categoría |
| :--- | :--- | :--- |
| **RNF-01** | Toda la aplicación (frontend Expo) debe ejecutarse dentro de un contenedor Docker con imagen base `node:20-alpine`, sin dependencia de `npm` o `node` instalados en el host. | Infraestructura |
| **RNF-02** | El contenedor de Expo debe tener asignada la IP estática `10.10.10.10` dentro de la subred Docker `10.10.10.0/24`, exponiendo el servidor de desarrollo en el puerto `8081`. | Red |
| **RNF-03** | La arquitectura del código fuente debe seguir el patrón Clean Architecture Feature-First: ninguna pantalla (`app/`) puede importar directamente el cliente de Supabase; toda consulta debe pasar por `src/services/`. | Arquitectura |
| **RNF-04** | Queda prohibido el uso de `window.alert()`, `window.confirm()`, `window.prompt()` o `Alert.alert()` de React Native para comunicar al usuario el resultado de una respuesta; se debe usar retroalimentación visual nativa. | UX / Calidad |
| **RNF-05** | Todo el código fuente nuevo debe estar escrito en TypeScript con la configuración `strict: true` activada en `tsconfig.json`. El comando `tsc --noEmit` no debe arrojar errores antes de cada merge. | Calidad |
| **RNF-06** | Los estilos de los componentes deben definirse mediante `StyleSheet.create()` o Tailwind (NativeWind); se prohíben los estilos inline en JSX (por ejemplo, `style={{ color: 'red' }}`). | Calidad de Código |
| **RNF-07** | El tiempo de carga inicial de la pantalla principal no debe superar los 3 segundos en condiciones de red local (`localhost`). | Rendimiento |
| **RNF-08** | El sistema debe ser accesible vía navegador web en la URL `http://10.10.10.10:8081` desde cualquier máquina dentro de la red local, sin requerir software adicional en el cliente. | Accesibilidad / Despliegue |
| **RNF-09** | **No Comercial:** Ninguna funcionalidad del sistema puede estar condicionada a un pago real. Las gemas son la única moneda interna y se obtienen exclusivamente por actividad de estudio. | Ética / Gobernanza |

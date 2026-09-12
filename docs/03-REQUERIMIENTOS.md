# Especificación de Requerimientos — Yachay Quechua

**Versión:** 1.2 | **Fecha:** 2026-09-08 | **Última actualización:** 2026-09-12 | **Estado:** Activo — casos de uso alineados con la implementación real tras el cierre del Sprint 3

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

La progresión gamificada se realiza mediante vidas (❤️) y puntos de experiencia (XP). El desbloqueo de módulos superiores está condicionado a la aprobación del examen del nivel anterior.

---

## 2. Casos de Uso Críticos

### CU-01 — Iniciar Sesión / Registro

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario no autenticado |
| **Precondición** | El emulador local de Supabase Auth está corriendo en `localhost:54321`. El usuario accede a la ruta `/(auth)/login` o `/(auth)/signup`. |
| **Flujo normal** | 1. El usuario ingresa email y contraseña. 2. La pantalla invoca `authService.signIn()` (o `signUp()`) en `src/services/authService.ts`. 3. El servicio llama a `supabase.auth.signInWithPassword()`. 4. Supabase Auth local devuelve un `access_token` y un `refresh_token`. 5. `AuthContext` almacena la sesión y redirige al usuario a `/(tabs)/index`. |
| **Flujo alternativo** | A1 — Credenciales incorrectas: Supabase retorna `AuthApiError`. El servicio propaga el error al contexto, que actualiza un estado de error. La pantalla muestra un banner de error visual sin usar `window.alert`. A2 — Registro con email ya existente: Supabase retorna `User already registered`. Se muestra retroalimentación inline indicando que el correo ya está registrado. |

---

### CU-02 — Cargar Categorías y Lecciones

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado |
| **Precondición** | El usuario tiene una sesión válida en `AuthContext` (`src/context/AuthContext.tsx`). Las tablas `categories` y `lessons` de Supabase están pobladas con el seed de Quechua. |
| **Flujo normal** | 1. El usuario navega a la pantalla `/(tabs)/index` ("Aprender"). 2. El componente invoca `categoryService.fetchCategories()` en `src/services/categoryService.ts`. 3. El servicio ejecuta `supabase.from('categories').select('*')` ordenado por `sort_order`. 4. Se renderiza la lista de categorías con nombre, ícono y progreso de XP. 5. El usuario selecciona una categoría y navega a `app/category/[slug].tsx`, que carga las lecciones asociadas mediante `categoryService.fetchLessonsWithProgress(categoryId, userId)`. |
| **Flujo alternativo** | A1 — Sin conexión a Supabase: la capa de servicio captura el error de red y la pantalla muestra un estado de error visual con botón de reintento. A2 — Tabla vacía: se renderiza un estado vacío con mensaje informativo. |

---

### CU-03 — Resolver Ejercicio

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado con lección activa |
| **Precondición** | El usuario tiene vidas disponibles (`GameContext.lives > 0`). La lección tiene al menos una pregunta cargada desde Supabase. |
| **Flujo normal** | 1. La pantalla `app/lesson/[id].tsx` carga las preguntas mediante `questionService.fetchQuestionsByLesson(lessonId)`, con una fase teórica previa (tarjetas de vocabulario) antes del quiz. 2. Se muestra la barra de progreso indicando la pregunta actual sobre el total. 3. El usuario selecciona una opción de respuesta (o resuelve un ejercicio de banco de palabras / pares). 4. La pantalla invoca `GameContext.checkAnswer(isCorrect)`. 5. Si es correcta: se resalta la opción en verde, se suma XP (`+10` vía `checkAnswer`) y se avanza a la siguiente pregunta con animación *bounce* de Yachi. 6. Al completar todas las preguntas se llama a `questionService.recordLessonProgress()` y se navega a la pantalla de resultados con el porcentaje de aciertos y el XP acumulado. |
| **Flujo alternativo** | A1 — Respuesta incorrecta: se resalta en rojo, `GameContext.checkAnswer(false)` descuenta una vida y muestra la respuesta correcta brevemente. A2 — Sin vidas: `GameContext.isBlocked` se activa y `app/_layout.tsx` redirige automáticamente a `app/blocked.tsx`. |

---

### CU-04 — Control de Gamificación (Vidas, XP, Gemas y Racha)

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Sistema (`GameContext`) |
| **Precondición** | El usuario está resolviendo una lección o examen activo. `GameContext` fue inicializado con `lives = 5`, `xp = 0`, `gems = 100`, `streakDays = 3` (estado en memoria, ver limitación en `docs/05-FINDINGS_DEUDA.md` GAP-06). |
| **Flujo normal** | 1. Cada respuesta se reporta con `GameContext.checkAnswer(isCorrect)`: si es correcta suma `+10 XP`; si es incorrecta decrementa `lives` en 1. 2. `GameContext.addGems(amount)` acredita gemas al completar una lección. 3. El estado `lives`, `xp`, `gems` y `streakDays` se refleja en la UI mediante el hook `useGame()` compartido (Perfil, Tienda, Barra superior). |
| **Flujo alternativo** | A1 — `lives` llega a 0: `GameContext` marca `isBlocked = true` y el guard en `app/_layout.tsx` redirige a `/blocked`. A2 — El usuario compra "Recarga de Vidas" en la Tienda: `GameContext.restoreLives()` restaura `lives = 5`. A3 — El usuario gasta gemas: `GameContext.consumeGems(amount)` retorna `false` sin descontar si no alcanzan las gemas disponibles. |

---

### CU-05 — Rendir Examen de Nivel

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado con nivel activo |
| **Precondición** | El usuario completó las lecciones del nivel actual. El examen del nivel está disponible en la tabla `exams` de Supabase, asociado a un `level_id`, con preguntas en `questions`/`question_options`. |
| **Flujo normal** | 1. La pantalla `app/level/exam/[levelId].tsx` carga el examen y sus preguntas con opciones mediante `examService.fetchExamByLevel(levelId)`. 2. Se presenta al usuario el conjunto de preguntas con una barra de progreso global. 3. Al finalizar, se calcula el puntaje (`score`) y se compara contra `exam.pass_threshold`. 4. Si `score >= pass_threshold`, se llama a `progressService.recordExamResult(userId, levelId, score, pass_threshold)` (marca `passed = true` en `level_progress`) y luego a `progressService.unlockNextLevel(userId, levelId + 1)`. 5. La pantalla de resultados muestra "¡Nivel Superado!" con el puntaje obtenido y el mínimo requerido. |
| **Flujo alternativo** | A1 — `score < pass_threshold`: se llama a `progressService.recordExamResult()` con `passed = false` (no se desbloquea el siguiente nivel); la pantalla muestra "Inténtalo de nuevo" con opción de volver al inicio. A2 — El usuario abandona el examen antes de finalizarlo: el progreso parcial no se guarda; el examen se reinicia desde el principio en la próxima sesión. |

---

### CU-06 — Traducir Voz con IA

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado en el módulo Traductor |
| **Precondición** | El navegador soporta `SpeechRecognition`/`webkitSpeechRecognition` y `speechSynthesis` (Web Speech API — Chrome/Edge en Expo Web). La Edge Function `translate` de Supabase está desplegada y accesible desde `src/services/voiceService.ts`. |
| **Flujo normal** | 1. El usuario navega a `app/translator/index.tsx` y elige la dirección de traducción (Español ↔ Quechua) y el modo texto o voz. 2. En modo voz, `startVoiceRecognition(lang)` inicia el reconocimiento y resuelve con el `transcript` capturado. 3. El texto (transcrito o escrito) se envía a `translateText({ source_lang, target_lang, source_text })`, que invoca la Edge Function `translate` vía `supabase.functions.invoke('translate', ...)`. 4. La pantalla muestra el texto traducido y permite reproducirlo con `speakText(text, lang)` (Web Speech Synthesis API). |
| **Flujo alternativo** | A1 — Navegador sin soporte de `SpeechRecognition`: `startVoiceRecognition()` rechaza la promesa; la pantalla muestra un banner explicativo, nunca `window.alert`. A2 — La Edge Function retorna error: `translateText()` devuelve `{ translatedText: '', error }`; la pantalla muestra un estado de error con botón de reintento. |

---

## 3. Requerimientos Funcionales

| ID | Descripción | Prioridad |
| :--- | :--- | :--- |
| **RF-01** | El sistema debe permitir el registro de nuevos usuarios mediante email y contraseña a través de Supabase Auth local. | Alta |
| **RF-02** | El sistema debe permitir el inicio de sesión con credenciales existentes y gestionar la sesión activa mediante `AuthContext`. | Alta |
| **RF-03** | El sistema debe cargar la lista de cursos disponibles desde la tabla `courses` de Supabase y mostrarlos en la pantalla principal. | Alta |
| **RF-04** | El sistema debe permitir navegar desde un curso a sus lecciones asociadas, cargando los datos desde la tabla `lessons`. | Alta |
| **RF-05** | El sistema debe presentar ejercicios de opción múltiple con una barra de progreso dinámica que indique el avance en la lección. | Alta |
| **RF-06** | El sistema debe validar la respuesta del usuario, mostrando retroalimentación visual inmediata (verde para correcto, rojo para incorrecto). | Alta |
| **RF-07** | El sistema debe implementar un motor de vidas: el usuario inicia con 5 vidas; cada respuesta incorrecta descuenta 1 vida; al llegar a 0 la lección se bloquea. | Alta |
| **RF-08** | El sistema debe implementar un acumulador de XP: cada respuesta correcta suma puntos de experiencia configurables; el total se muestra en la pantalla de resultados. | Media |
| **RF-09** | El sistema debe mostrar una pantalla de resultados al finalizar la lección con el porcentaje de aciertos y el XP total ganado. | Media |
| **RF-10** | El sistema debe cerrar la sesión del usuario de forma limpia, limpiando el estado del `AuthContext` y redirigiendo a la pantalla de login. | Alta |
| **RF-11** | El sistema debe presentar al usuario una pantalla de selección de categoría de aprendizaje con las opciones: Abecedario, Números, Palabras, Niveles y Traductor de Voz. Cada categoría debe mostrar el porcentaje de progreso del usuario. | Alta |
| **RF-12** | El sistema debe implementar exámenes de bloqueo al final de cada nivel. El usuario debe superar el examen (responder todas las preguntas sin agotar sus vidas) para desbloquear el siguiente nivel. El estado de aprobación debe persistirse en Supabase en la tabla `level_progress`. | Alta |
| **RF-13** | El sistema debe proveer un módulo de traducción de voz interactiva que capture audio del micrófono del dispositivo, lo envíe a un servicio de IA externo y devuelva la traducción Quechua↔Español en texto y audio sintetizado, todo sin usar `window.alert` ni diálogos del sistema. | Media |
| **RF-14** | El sistema debe registrar y mostrar el progreso de niveles de cada usuario en su perfil: qué niveles están bloqueados, en progreso o completados; el XP total acumulado; y el historial de exámenes rendidos con su puntuación. | Media |

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
| **RNF-07** | El tiempo de carga inicial de la pantalla principal (lista de cursos) no debe superar los 3 segundos en condiciones de red local (`localhost`). | Rendimiento |
| **RNF-08** | El sistema debe ser accesible vía navegador web en la URL `http://10.10.10.10:8081` desde cualquier máquina dentro de la red local, sin requerir software adicional en el cliente. | Accesibilidad / Despliegue |

# Especificación de Requerimientos — Yachay Quechua

**Versión:** 1.1 | **Fecha:** 2026-09-08 | **Última actualización:** 2026-09-08 | **Estado:** Activo

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

### CU-02 — Cargar Cursos y Lecciones

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado |
| **Precondición** | El usuario tiene una sesión válida en `AuthContext`. La tabla `courses` y `lessons` de Supabase están pobladas con datos semilla. |
| **Flujo normal** | 1. El usuario navega a la pantalla `/(tabs)/index`. 2. El componente invoca el hook `useCourses()` que delega a `courseService.fetchCourses()` en `src/services/courseService.ts`. 3. El servicio ejecuta `supabase.from('courses').select('*')`. 4. Se renderiza la lista de cursos con nombre, descripción e ícono. 5. El usuario selecciona un curso y navega a `app/course/[id].tsx`, que carga las lecciones asociadas mediante `courseService.fetchLessons(courseId)`. |
| **Flujo alternativo** | A1 — Sin conexión al emulador local: La capa de servicio captura el error de red y la pantalla muestra un estado de error visual con botón de reintento. A2 — Tabla vacía: Se renderiza un estado vacío con mensaje informativo. |

---

### CU-03 — Resolver Ejercicio

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado con lección activa |
| **Precondición** | El usuario tiene vidas disponibles (> 0). La lección contiene al menos una pregunta en `lessonsData.ts`. |
| **Flujo normal** | 1. La pantalla `app/lesson/[id].tsx` carga las preguntas desde `GameContext` (que consulta `lessonsData.ts`). 2. Se muestra la barra de progreso indicando la pregunta actual sobre el total. 3. El usuario selecciona una opción de respuesta. 4. `GameContext.checkAnswer()` valida la respuesta. 5. Si es correcta: se resalta la opción en verde, se suma XP (`+10` por defecto) y se avanza a la siguiente pregunta. 6. Al completar todas las preguntas se navega a la pantalla de resultados con el porcentaje de aciertos y el XP acumulado. |
| **Flujo alternativo** | A1 — Respuesta incorrecta: se resalta en rojo, `GameContext` descuenta una vida y muestra la respuesta correcta brevemente. A2 — Sin vidas: se bloquea la lección y se muestra la pantalla de "Sin vidas" con un contador de recarga. |

---

### CU-04 — Control de Gamificación (Vidas y XP)

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Sistema (GameContext) |
| **Precondición** | El usuario está resolviendo una lección activa. `GameContext` fue inicializado con `lives = 5` y `xp = 0`. |
| **Flujo normal** | 1. Cada respuesta incorrecta ejecuta `GameContext.loseLife()`, decrementando `lives` en 1. 2. Cada respuesta correcta ejecuta `GameContext.gainXP(amount)`, incrementando `xp`. 3. El estado `lives` y `xp` se refleja en la UI mediante el `GameContext` compartido. 4. Al finalizar la lección, el XP ganado se persiste en Supabase mediante `courseService.updateUserXP()`. |
| **Flujo alternativo** | A1 — `lives` llega a 0: `GameContext` emite el estado `isBlocked = true`. La pantalla de lección detecta el estado y muestra la vista de bloqueo sin permitir continuar. A2 — El usuario abandona la lección: `GameContext.resetLesson()` restaura el estado para la próxima sesión. |

---

### CU-05 — Rendir Examen de Nivel

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado con nivel activo |
| **Precondición** | El usuario completó todas las lecciones del nivel actual. `GameContext` tiene `lives > 0`. El examen del nivel está disponible en la tabla `exams` de Supabase con al menos 10 preguntas mezcladas de todos los módulos del nivel. |
| **Flujo normal** | 1. La pantalla `app/level/exam/[levelId].tsx` carga el examen desde `examService.fetchExam(levelId)`. 2. Se presenta al usuario un conjunto de preguntas mixtas (opción múltiple, escritura, asociación) con una barra de progreso global. 3. Por cada respuesta incorrecta, `GameContext.loseLife()` descuenta una vida. 4. Si el usuario responde todas las preguntas con al menos una vida restante, el examen se marca como aprobado mediante `progressService.approveLevel(userId, levelId)`. 5. Se persiste el resultado en Supabase y se desbloquea el siguiente nivel (`level_progress.unlocked = true`). 6. La pantalla de resultados muestra el porcentaje de aciertos, el XP ganado y el badge del nivel superado. |
| **Flujo alternativo** | A1 — `lives` llega a 0 durante el examen: `GameContext` emite `isExamBlocked = true`. La pantalla muestra la vista de bloqueo del examen con el mensaje "Sin vidas — el examen se reiniciará cuando tus vidas se recarguen". El examen no se marca como aprobado. A2 — El usuario abandona el examen antes de finalizarlo: el progreso parcial no se guarda; el examen puede reiniciarse desde el principio en la próxima sesión. |

---

### CU-06 — Traducir Voz con IA

| Campo | Descripción |
| :--- | :--- |
| **Actor principal** | Usuario autenticado en el módulo Traductor |
| **Precondición** | El dispositivo del usuario tiene micrófono disponible y el navegador otorgó permiso de acceso al audio (`MediaDevices.getUserMedia`). El servicio de IA de traducción está configurado y accesible desde `src/services/voiceService.ts`. |
| **Flujo normal** | 1. El usuario navega a la pantalla `app/translator/index.tsx`. 2. El usuario selecciona la dirección de traducción: Español → Quechua o Quechua → Español. 3. El usuario presiona el botón "Hablar" (micrófono). 4. La app inicia la grabación de audio mediante la API del navegador (`MediaRecorder`). 5. Al soltar el botón, `voiceService.transcribeAndTranslate(audioBlob, direction)` envía el audio al servicio de IA. 6. El servicio retorna el texto transcrito en el idioma origen y la traducción en el idioma destino. 7. La pantalla muestra ambos textos y reproduce el audio sintetizado de la traducción mediante la API de síntesis de voz. |
| **Flujo alternativo** | A1 — Permiso de micrófono denegado: La pantalla muestra un banner explicativo con instrucciones para habilitar el micrófono en el navegador; nunca usa `window.alert`. A2 — El servicio de IA no responde en menos de 10 segundos: La pantalla muestra un estado de error con mensaje "No se pudo conectar al servicio de traducción" y un botón de reintento. A3 — Audio demasiado corto o con ruido excesivo: El servicio retorna un error de calidad de audio; la pantalla muestra retroalimentación visual indicando "No se pudo detectar voz clara; intente de nuevo". |

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

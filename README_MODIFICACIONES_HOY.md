# 📌 Bitácora de Modificaciones y Nuevas Características — Yachay

**Fecha**: 23 de Septiembre, 2026  
**Proyecto**: Yachay (App Móvil de Aprendizaje de Quechua)  
**Entorno**: Expo (React Native) + Firebase Auth + Supabase PostgreSQL  

---

## 🎯 Resumen Ejecutivo

Durante la sesión de hoy se resolvieron problemas críticos de experiencia de usuario (UX), inconsistencias conceptuales entre pantallas, bugs de renderizado, y se implementó una evolución arquitectónica mayor para la aplicación:

1. **Reestructuración de la barra de navegación** en 4 pestañas directas: `Inicio / Explorar / Traductor / Perfil`.
2. **Transformación de la pestaña "Explorar"** en la **Biblioteca Andina Abierta** (sin vidas, sin bloqueos ni exámenes).
3. **El Traductor como pestaña nativa** permanente con voz, texto y frases rápidas.
4. **Integración total de Logros, Medallas y Liga Andina** dentro de la pestaña **Perfil**.
5. **Implementación del "Puente Virtuoso" (*Cross-Linking*)** entre lecciones, biblioteca y traductor.
6. **Resolución integral de inconsistencias técnicas y de seguridad**: sincronización RLS, tolerancia a fallos offline, pantalla de guía faltante, tienda funcional y corrección de bucles infinitos en ejercicios.

---

## 1. 🧭 Nueva Arquitectura de Navegación (4 Pestañas)

Se resolvió la confusión que existía entre las pestañas "Inicio" y "Lecciones". En [`app/(tabs)/_layout.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/_layout.tsx) se fijaron las 4 pestañas oficiales:

```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│   🏠 Inicio   │  📚 Explorar  │ 🔄 Traductor  │   👤 Perfil   │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

| Pestaña | Metáfora | Propósito para el Estudiante | Restricciones |
| :--- | :--- | :--- | :--- |
| **🏠 Inicio** (`index.tsx`) | **La Carrera Universitaria** | Malla curricular paso a paso (Nivel 1 ➡️ Examen ➡️ Nivel 2). | **Sí**: Gamificación estricta (vidas, candados y exámenes con nota $\ge 70\%$). |
| **📚 Explorar** (`explore.tsx`) | **La Biblioteca Andina** | Estanterías abiertas de cultura, gastronomía, cuentos, modismos y naturaleza. | **No**: Libertad total, sin vidas ni exámenes. |
| **🔄 Traductor** (`translator.tsx`) | **El Diccionario de Bolsillo** | Consulta rápida con síntesis fonética Meta MMS-TTS y práctica de voz por micrófono. | Herramienta pura de consulta y práctica. |
| **👤 Perfil** (`profile.tsx`) | **El Expediente del Alumno** | Medallas ganadas, racha, misiones cumplidas, Liga Andina y tienda de Yachi. | Panel personal de control y progreso. |

> **Nota técnica**: Las pantallas `leaderboard.tsx` y `shop.tsx` continúan en la carpeta `(tabs)`, pero fueron configuradas con `options={{ href: null }}` para no saturar la barra de navegación inferior.

---

## 2. 📚 La "Biblioteca Andina" en Explorar

Se reconstruyó [`app/(tabs)/explore.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/explore.tsx) y se creó el dataset estructurado en [`src/content/libraryData.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/content/libraryData.ts):

### A. Buscador Universal en Tiempo Real
- Campo de búsqueda interactivo con botón de limpieza rápida (`✕`).
- Filtra instantáneamente por: palabra quechua, traducción al español, descripción, categoría y notas culturales.
- Contador de coincidencias en vivo.

### B. Estanterías Abiertas por Filtros de Pastillas
- ✨ **Todo**: Vista integrada de todo el catálogo andino.
- 📖 **Cuentos del Ayllu**: Carrusel interactivo que conecta al lector narrativo con Yachi en [`app/story/[slug].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/story/%5Bslug%5D.tsx). Se agregaron a [`src/content/stories.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/content/stories.ts) las siguientes historias:
  - *El Zorro y el Cóndor* (`el-zorro-y-el-condor`): El viaje mítico hacia el Hanan Pacha para traer los alimentos sagrados a la tierra.
  - *Manco Cápac y Mama Ocllo* (`manco-capac`): La fundación mítica del Tawantinsuyu desde las aguas sagradas del Titicaca.
  - *El Buen Vivir / Sumaq Kawsay* (`sumaq-kawsay`): Filosofía andina de reciprocidad (Ayni) y armonía con la Pachamama.
  - *Contando con Yachi* (`numeros`), *Una Casa Quechua* (`abecedario`) y *Un Saludo con Yachi* (`palabras`).
- 🏔️ **Cultura & Tradición**:
  - *Gastronomía*: Pachamanca, Kankacho, Kinwa, Sara, Chuño.
  - *Vestimenta*: Chullo, Lliclla, Chumpi con iconografía pallay.
  - *Música e Instrumentos*: Charango, Quena, Siku (Zampoña), Huayno.
  - *Lugares Sagrados & Principios*: Apus protectores, Pachamama, Ayni, Minka.
- 💬 **Quechua Cotidiano**:
  - *Saludos por horario*: *Allin p'unchaw* (Buenos días), *Allin suka* (Buenas tardes), *Allin tuta* (Buenas noches), *Tupananchiskama* (Hasta volver a vernos), *Paqarinkama* (Hasta mañana).
  - *Cortesía y Afecto*: *Allillanchu?*, *Allillanmi*, *Añay*, *Yupaychani*, *Munakuyki*, *Sonqoy*.
  - *Trilogía Ética Inca*: *Ama Suwa* (No robes), *Ama Llulla* (No mientas), *Ama Qilla* (No seas ocioso).
- 🦙 **Mundo Andino**:
  - *Fauna Sagrada*: Cóndor (Hanan Pacha), Puma (Kay Pacha), Serpiente/Amaru (Uku Pacha), Vicuña andina.
  - *Flora Medicinal*: Hoja de Coca (*Kuka*), Muña, Chachacoma, Flor de la Cantuta (*Qantu*).
- 💡 **Secretos Lingüísticos**:
  - Explicación del sistema trivocálico (A, I, U) y la ausencia de E y O originarias.
  - Lengua aglutinante (*wasi* ➡️ *wasiykunapi* = "en mis casas").
  - Dualidad del nosotros (*Ñuqanchis* inclusivo vs. *Ñuqayku* exclusivo).
  - Sufijo de ternura y cariño (*-cha*).
- 📜 **Guías Lingüísticas**:
  - Los 4 módulos pedagógicos de fonética Achahala, gramática, vocabulario y diálogos fueron preservados íntegramente con sus tablas y audios interactivos.

### C. Audio y Traducción Rápida en Cada Elemento
- Cada tarjeta contiene el botón [`AudioPronounceButton`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/components/yachay/audio-pronounce-button.tsx) para escuchar la pronunciación auténtica.
- Cada tarjeta incluye un botón rápido `🔄` que abre el traductor con el texto y lenguaje precargados.

---

## 3. 🔄 El Traductor como Pestaña Nativa

1. **Nueva Pantalla de Pestaña**: Se creó [`app/(tabs)/translator.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/translator.tsx).
2. **Características principales**:
   - Barra superior de estado [`YachayTopBar`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/components/yachay/yachay-top-bar.tsx).
   - Selector bidireccional Español ↔ Quechua con botón de inversión rápida (`⇌`).
   - Dictado y reconocimiento de voz por micrófono.
   - Síntesis de voz fonética nativa Meta MMS-TTS.
   - Frases rápidas de consulta inmediata (*Allillanchu?*, *Allin p'unchaw*, *Añay*, *Tupananchiskama*, *Munakuyki*, *Ama suwa*...).
   - Mascota Yachi reactiva que celebra con salto animado al traducir.
3. **Compatibilidad y Redirección**:
   - En [`app/translator/index.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/translator/index.tsx), se implementó un redirect a `/(tabs)/translator` que preserva cualquier parámetro de texto recibido.
   - Todos los accesos directos desde el Top Bar, la pantalla de Inicio y la Biblioteca abren directamente la pestaña 3.

---

## 4. 👤 Integración de Logros dentro de Perfil

Se reestructuró [`app/(tabs)/profile.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/profile.tsx) incorporando un control segmentado de 3 vistas:

### A. Pestaña 👤 *Expediente*
- **Identidad del estudiante**: Avatar de Yachi con el *Chullo Sagrado* equipado (si fue adquirido en la tienda), nivel, racha, gemas, vidas y rol *Yachachiq*.
- **Tarjeta Resumen de Logros**: Barra de progreso global (*ej. "3 de 6 Logros Desbloqueados"*) con acceso directo a la pestaña de logros.
- **Misiones de Hoy**: Desafíos interactivos con botón para **Reclamar recompensas** de XP y Gemas.
- **Acceso a la Tienda de Yachi** y botón de **Cerrar Sesión**.

### B. Pestaña 🏆 *Logros & Medallas*
Colección completa de 6 insignias y reliquias andinas con seguimiento en tiempo real:
1. **Principiante Quechua** (50 XP en lecciones)
2. **Hablante Activo** (Racha de 7 días activa)
3. **Maestro del Sol** (150 XP de sabiduría acumulada)
4. **Tesorero Inca** (250 gemas y monedas sagradas acumuladas)
5. **Coleccionista Andino** (Reliquia tradicional equipada en la tienda)
6. **Explorador del Tawantinsuyu** (Nivel 2 alcanzado en la carrera)
- Cada logro cuenta con su icono ilustrado, barra de progreso porcentual y etiqueta de estado: `✓ Obtenido` (Verde), `En progreso (X%)` (Dorado) o `🔒 Bloqueado` (Gris).

### C. Pestaña 👑 *Liga Andina*
- **Banner de la Liga Semanal** (Tawantinsuyu / División Oro).
- **Podio de Honor interactivo**: 1º Oro 🥇, 2º Plata 🥈, 3º Bronce 🥉 con peldaños a diferentes alturas y XP semanal.
- **Tabla de posiciones**: Listado de estudiantes con el usuario resaltado en tiempo real según su XP acumulado.

---

## 5. 🌉 El "Puente Virtuoso" (*Cross-Linking*)

1. **Desde la Lección hacia la Biblioteca**:
   - En [`app/lesson/[id].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/lesson/%5Bid%5D.tsx), al completar con éxito una lección, la pantalla de celebración ahora muestra una tarjeta destacada:
     > 💡 **CURIOSIDAD CULTURAL ANDINA** 🏔️  
     > *¿Quieres profundizar en el origen de las palabras y tradiciones?*  
     > En la Biblioteca Andina puedes leer cuentos ancestrales, explorar gastronomía y escuchar modismos sin exámenes ni vidas.  
     > **[Explorar en la Biblioteca Andina →]**
2. **Desde la Biblioteca hacia el Traductor**:
   - En [`app/(tabs)/explore.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/explore.tsx), cualquier término o expresión cuenta con el botón `🔄`, que abre el Traductor precargado con esa palabra en Quechua para practicar dicción o escucharla a diferentes velocidades.

---

## 6. 🛠️ Inconsistencias Técnicas y de Seguridad Resueltas

| Problema Identificado | Causa Raíz | Solución Implementada |
| :--- | :--- | :--- |
| **Claves JWT en texto plano** | Tokens quemados en el código de Supabase | Se eliminaron los tokens y se forzó la lectura segura desde variables de entorno `.env` en [`src/services/supabase.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/supabase.ts). |
| **Rechazo de escrituras por RLS** | Supabase no reconocía la sesión de Firebase | Se implementó `syncSupabaseSession(firebaseUser)` en [`src/services/authService.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/authService.ts) para autenticar ambas plataformas. |
| **Pérdida de progreso sin red** | Llamadas directas fallaban si Supabase no respondía | Se implementó un sistema de cola local (`@yachay_pending_lesson_progress`) en [`src/services/questionService.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/questionService.ts) con sincronización automática al recuperar conexión (`syncPendingProgress()`). |
| **Salto indebido de niveles** | La pantalla Inicio permitía acceder a niveles sin aprobar | Se aplicó validación secuencial estricta en [`app/(tabs)/index.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/index.tsx): lecciones 1 y 2 requeridas para Examen 1, y Examen 1 aprobado ($\ge 70\%$) para desbloquear Nivel 2. |
| **Bucle de renderizado infinito** | `Math.random()` dentro del cuerpo del componente | Se sustituyó por un barajado determinista memoizado con `useMemo` en [`matching-pairs-exercise.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/components/yachay/exercises/matching-pairs-exercise.tsx). |
| **Pantalla en blanco al pulsar "Guía"** | La ruta `app/guidebook/[id].tsx` no existía | Se creó [`app/guidebook/[id].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/guidebook/%5Bid%5D.tsx) con fonética Achahala y vocabulario estructurado. |
| **Gemas y Vidas no sincronizadas en Tienda** | Las compras en la tienda no descontaban gemas ni recargaban vidas | Se enlazaron las compras de [`app/(tabs)/shop.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/shop.tsx) con `GameContext` y `AsyncStorage`. |

---


## 7. 🔄 Sincronización en Tiempo Real de la Liga Andina con Supabase

Se resolvió la desincronización que existía entre la Liga Andina y los usuarios reales de la base de datos de Supabase:

### A. Sincronización Automática entre `profiles` y `leaderboard_weekly`
- Anteriormente, la tabla `leaderboard_weekly` en Supabase no contenía registros de usuarios, por lo que la interfaz mostraba usuarios mock (`Yachay Master`, `Kuntur Inca`, etc.).
- Se actualizó [`src/services/leaderboardService.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/leaderboardService.ts) para realizar una reconciliación inteligente en tiempo real:
  1. Consulta todos los usuarios registrados en la tabla `profiles`.
  2. Consulta la tabla `leaderboard_weekly`.
  3. Mapea todos los perfiles de la base de datos calculando dinámicamente su división según XP ($\ge 1000$: Oro, $\ge 250$: Plata, $< 250$: Bronce).
  4. Sincroniza en segundo plano cualquier perfil faltante o actualizado hacia `leaderboard_weekly` vía `upsert`.
  5. Si el usuario activo tiene XP reciente en sesión (`useGame`), se le otorga prioridad para reflejar su posición instantáneamente.

### B. Propagación Completa de XP en Toda la App
- **Lecciones** ([`app/lesson/[id].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/lesson/%5Bid%5D.tsx)): registra progreso en `lesson_progress`, suma 10 XP semanales con `leaderboardService.recordWeeklyXp` y actualiza misiones diarias.
- **Exámenes de Nivel** ([`app/level/exam/[levelId].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/level/exam/%5BlevelId%5D.tsx)): al aprobar ($\ge 70\%$), se otorgan **+50 XP** y **+30 Gemas** vía `useGame`, sincronizando inmediatamente con `leaderboard_weekly` y misiones.
- **Modo Práctica** ([`app/practice/[slug].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/practice/%5Bslug%5D.tsx)): al finalizar, los XP ganados por respuestas correctas se sincronizan de inmediato con `recordWeeklyXp`.
- **Misiones Diarias Reclamadas** ([`app/(tabs)/profile.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/profile.tsx)): al reclamar misiones con recompensa de XP, se persiste en la liga semanal y se recarga el ranking.
- **Actualización de Estado Global** ([`src/services/authService.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/authService.ts)): `updateGameState` ahora sincroniza de manera automática `profiles` y `leaderboard_weekly` simultáneamente.
- **Registro de Nuevos Usuarios**: al crear una cuenta en `authService.signUp`, se inicializa de inmediato su fila en `leaderboard_weekly` con 0 XP y división Bronce.

### C. Experiencia de Usuario y Podio en `profile.tsx`
- **Podio con Usuarios Reales**: el 1º, 2º y 3º puesto ahora muestran directamente a los usuarios de la base de datos (`Yess` con 1090 XP 🥇, `Alejandro Segovia` con 320 XP 🥈, `ale` con su XP real 🥉).
- **Corrección de Bug de Fallback Falsy**: se sustituyó el operador `||` por `?? 0`, corrigiendo el error que provocaba que usuarios con 0 XP mostraran números ficticios como 380 XP o 450 XP.
- **Pull-to-Refresh**: se implementó `RefreshControl` nativo en el `ScrollView` de Perfil para permitir al usuario deslizar hacia abajo y refrescar en cualquier momento su perfil, misiones y Liga Andina directamente desde Supabase.
- **Insignia de Estado en Vivo**: se incorporó en el banner de la Liga la etiqueta `🟢 Sincronizado en tiempo real`.

---

## 8. 🗄️ Estado de la Base de Datos

- **Integridad del Esquema (DDL)**: **100% INTACTO**. Ninguna tabla, columna o relación de las migraciones SQL de Supabase fue modificada o eliminada.
- **Relaciones y Claves Foráneas**: Todas las relaciones en Tercera Forma Normal (3FN) (`categories` ➡️ `lessons` ➡️ `questions` ➡️ `question_options`, `levels` ➡️ `exams`, `profiles` ➡️ `lesson_progress`, `user_quests`, `user_badges`, `leaderboard_weekly`) continúan respetando las restricciones de integridad y borrado en cascada (`ON DELETE CASCADE`).

---

## 9. 🧪 Métricas de Calidad y Validación

- **TypeScript**: `npx tsc --noEmit` ➡️ **0 errores** ✅
- **ESLint**: `npm run lint` ➡️ **0 errores y 0 advertencias** ✅
- **Pruebas Jest**: `npm test` ➡️ **12/12 pruebas aprobadas (100%)** ✅
- **Servidor Metro**: Operativo y respondiendo (`HTTP 200 OK`) ✅
- **Control de Versiones**: Todos los cambios fueron guardados exclusivamente en commits locales (`git push` no ejecutado) ✅

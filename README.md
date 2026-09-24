# Yachay Idiomas — Aprendizaje de Quechua 🇵🇪

**Yachay Simi** es una aplicación móvil universal (iOS, Android, Web) desarrollada con Expo y React Native para la enseñanza interactiva del idioma Quechua (Runasimi). Integra Firebase Auth (v12) para autenticación de usuarios, Supabase PostgreSQL en 3FN como backend relacional, síntesis fonética nativa y Clean Architecture en el frontend.

---

## 🌟 Bitácora de Modificaciones Realizadas Hoy

A continuación se detalla el registro integral de las modificaciones, mejoras de arquitectura, corrección de inconsistencias e innovaciones implementadas en la sesión de hoy:

### 1. Reestructuración de la Navegación Principal (4 Pestañas)
Se rediseñó la barra de navegación inferior en [`app/(tabs)/_layout.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/_layout.tsx) para resolver de forma definitiva la confusión conceptual entre lecciones y exploración libre, dejando la estructura oficial en 4 pestañas:

```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│   🏠 Inicio   │  📚 Explorar  │ 🔄 Traductor  │   👤 Perfil   │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

- **🏠 Inicio (`index.tsx`)**: La *Carrera Universitaria*. Malla curricular secuencial estructurada por niveles (Nivel 1 ➡️ Examen ➡️ Nivel 2), desafíos diarios, vidas y exámenes formales bloqueantes.
- **📚 Explorar (`explore.tsx`)**: La *Biblioteca Andina*. Estanterías abiertas con buscador universal en vivo, cuentos ancestrales, tradiciones, gastronomía, modismos y fauna/flora sagrada (sin vidas, sin bloqueos ni exámenes).
- **🔄 Traductor (`translator.tsx`)**: El *Diccionario de Bolsillo*. Ahora es una sección/tab independiente en la barra de navegación con reconocimiento por voz, traducción instantánea y reproducción fonética nativa.
- **👤 Perfil (`profile.tsx`)**: El *Expediente del Alumno*. Panel de control integral con avatar, estadísticas de racha/XP/vidas y la integración de **Logros, Medallas y la Liga Andina**.

---

### 2. Creación de la "Biblioteca Andina" en Explorar
Se rediseñó por completo [`app/(tabs)/explore.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/explore.tsx) y se creó [`src/content/libraryData.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/content/libraryData.ts):
- **Buscador Universal en Tiempo Real**: Filtrado interactivo por términos en quechua, traducción al español, descripción y notas culturales, con botón de limpieza rápida (`✕`).
- **Estanterías Abiertas por Pastillas Temáticas**:
  - ✨ **Todo**: Vista integrada de todo el catálogo cultural.
  - 📖 **Cuentos del Ayllu**: Carrusel interactivo enlazado a [`app/story/[slug].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/story/%5Bslug%5D.tsx). Se agregaron a [`src/content/stories.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/content/stories.ts) las historias ancestrales:
    - *El Zorro y el Cóndor* (`el-zorro-y-el-condor`)
    - *La Leyenda de Manco Cápac y Mama Ocllo* (`manco-capac`)
    - *El Buen Vivir / Sumaq Kawsay* (`sumaq-kawsay`)
    - *Contando con Yachi* (`numeros`), *Una Casa Quechua* (`abecedario`) y *Un Saludo con Yachi* (`palabras`).
  - 🏔️ **Cultura & Tradición**: Gastronomía andina (*Pachamanca, Kankacho, Kinwa, Sara, Chuño*), Vestimenta (*Chullo, Lliclla, Chumpi con iconografía pallay*), Música (*Charango, Quena, Siku/Zampoña, Huayno*) y Lugares/Principios Sagrados (*Apus, Pachamama, Ayni, Minka*).
  - 💬 **Quechua Cotidiano**: Saludos por horario (*Allin p'unchaw, Allin suka, Allin tuta*), fórmulas de cortesía (*Allillanchu?, Allillanmi, Añay, Yupaychani, Munakuyki, Sonqoy*) y la Trilogía Moral Incaica (*Ama Suwa, Ama Llulla, Ama Qilla*).
  - 🦙 **Mundo Andino**: Fauna sagrada (*Cóndor, Puma, Serpiente/Amaru, Vicuña*) y Flora medicinal (*Coca, Muña, Chachacoma, Flor de la Cantuta*).
  - 💡 **Secretos Lingüísticos**: Explicación del sistema trivocálico (A, I, U), la aglutinación de sufijos, la dualidad de "nosotros" (*inclusivo vs. exclusivo*) y los sufijos de afecto (*-cha*).
  - 📜 **Guías Lingüísticas**: Preservación al 100% de los 4 módulos pedagógicos de fonética Achahala, gramática, vocabulario y diálogos con tablas y audios interactivos.
- **Audio y Traducción Rápida en cada elemento**: Cada tarjeta incluye [`AudioPronounceButton`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/components/yachay/audio-pronounce-button.tsx) y botón directo `🔄` para abrir el traductor con la frase precargada.

---

### 3. Pestaña de Traductor (`app/(tabs)/translator.tsx`)
- Se implementó la nueva pantalla de pestaña [`app/(tabs)/translator.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/translator.tsx).
- Cuenta con barra superior [`YachayTopBar`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/components/yachay/yachay-top-bar.tsx), selector de idiomas con intercambio rápido (`⇌`), dictado por micrófono, síntesis fonética nativa Meta MMS-TTS y chip de frases frecuentes.
- En [`app/translator/index.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/translator/index.tsx), se implementó una redirección automática y segura hacia `/(tabs)/translator`, garantizando que cualquier enlace existente mantenga compatibilidad y conserve los parámetros recibidos.

---

### 4. Integración de Logros, Medallas y Liga dentro de Perfil
Se reestructuró [`app/(tabs)/profile.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/profile.tsx) con un control segmentado de 3 secciones:
1. 👤 **Expediente**:
   - Tarjeta del alumno con avatar, nivel, racha 🔥, XP ⚡, gemas 💎 y vidas ❤️.
   - Visualización del *Chullo Sagrado* sobre Yachi si está adquirido en la tienda.
   - Tarjeta resumen de logros con barra de progreso global.
   - Misiones de hoy interactivas con botón para **Reclamar recompensas**.
   - Acceso directo a la Tienda de Yachi y botón de Cerrar Sesión.
2. 🏆 **Logros & Medallas**:
   - Catálogo de 6 logros con medallas andinas: *Principiante Quechua, Hablante Activo, Maestro del Sol, Tesorero Inca, Coleccionista Andino, Explorador del Tawantinsuyu*.
   - Barras de progreso porcentual individuales y estados: `✓ Obtenido` (Verde), `En progreso (X%)` (Dorado) y `🔒 Bloqueado` (Gris).
3. 👑 **Liga Andina**:
   - Podio de Honor con 🥇 1º (Oro), 🥈 2º (Plata) y 🥉 3º (Bronce).
   - Tabla de posiciones semanal de estudiantes con el usuario resaltado en tiempo real.
- La pantalla `leaderboard.tsx` quedó oculta de la barra inferior (`href: null`), evitando duplicidad.

---

### 5. Puente Virtuoso (Cross-Linking)
- **Desde la Lección hacia la Biblioteca**: En [`app/lesson/[id].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/lesson/%5Bid%5D.tsx), al finalizar exitosamente una lección, se muestra una tarjeta que invita a profundizar en la Biblioteca Andina sin riesgo de perder vidas.
- **Desde la Biblioteca hacia el Traductor**: Al tocar el botón `🔄` en cualquier tarjeta cultural de Explorar, el usuario pasa al Traductor con el texto y lengua precargados.

---

### 6. Corrección de Inconsistencias y Seguridad Técnica
- **Seguridad en Supabase**: Se eliminaron los tokens JWT hardcodeados en texto plano en [`src/services/supabase.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/supabase.ts), forzando el uso de variables de entorno `.env`.
- **Sincronización RLS**: Se implementó `syncSupabaseSession(firebaseUser)` en [`src/services/authService.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/authService.ts) para autorizar las operaciones en Supabase usando la sesión de Firebase.
- **Tolerancia a Fallos y Modo Offline**: Se implementó un sistema de colas en [`src/services/questionService.ts`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/src/services/questionService.ts) y `progressService.ts` (`@yachay_pending_lesson_progress`) que guarda el progreso offline y lo sube automáticamente cuando regresa la conexión (`syncPendingProgress()`).
- **Malla Curricular en Inicio**: Se corrigió [`app/(tabs)/index.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/index.tsx) para exigir aprobar las lecciones 1 y 2 antes del Examen 1, y aprobar el Examen 1 con $\ge 70\%$ para desbloquear el Nivel 2.
- **Ejercicios de Pares**: En [`matching-pairs-exercise.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/components/yachay/exercises/matching-pairs-exercise.tsx), se sustituyó el `Math.random()` impuro por un barajado determinista con `useMemo`, eliminando loops de renderizado infinito.
- **Pantalla de Guía**: Se creó [`app/guidebook/[id].tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/guidebook/%5Bid%5D.tsx) con fonética Achahala y vocabulario, eliminando pantallas en blanco.
- **Tienda y Vidas**: Se implementó la deducción real de gemas al rellenar vidas en [`app/(tabs)/shop.tsx`](file:///c:/Users/alejandro/Desktop/Yachai-idiomas/app/%28tabs%29/shop.tsx), junto con la persistencia del traje en `GameContext`.

---

## 🚀 Arquitectura del Proyecto (Clean Architecture Feature-First)

```
Yachay/
├── app/                       # Rutas e interfaz UI (Expo Router)
│   ├── (auth)/                # Login y Registro con Firebase Auth
│   ├── (tabs)/                # 4 Pestañas: Inicio, Explorar, Traductor, Perfil
│   │   ├── _layout.tsx        # Configuración del Tab Bar de 4 secciones
│   │   ├── index.tsx          # Tab 1: Inicio (Carrera secuencial formal)
│   │   ├── explore.tsx        # Tab 2: Explorar (Biblioteca Andina Abierta)
│   │   ├── translator.tsx     # Tab 3: Traductor (Voz y texto interactivo)
│   │   ├── profile.tsx        # Tab 4: Perfil (Expediente, Logros, Liga Andina)
│   │   ├── leaderboard.tsx    # Oculto del tab bar (integrado en Perfil)
│   │   └── shop.tsx           # Tienda de Yachi (accesible desde Perfil e Inicio)
│   ├── onboarding/            # Carrusel interactivo con Yachi
│   ├── category/[slug].tsx    # Lecciones por categoría
│   ├── lesson/[id].tsx        # Motor de ejercicios con puente a Biblioteca
│   ├── level/exam/[levelId].tsx  # Examen formal bloqueante
│   ├── guidebook/[id].tsx     # Guía gramatical y fonética
│   ├── translator/index.tsx   # Redirección a /(tabs)/translator
│   └── blocked.tsx            # Pantalla de bloqueo al agotar vidas
├── src/                       # Capa de lógica de negocio y servicios
│   ├── content/               # Contenido estático y biblioteca
│   │   ├── libraryData.ts     # Estanterías de la Biblioteca Andina
│   │   └── stories.ts         # Cuentos ancestrales interactivos con Yachi
│   ├── context/               # Contextos globales (AuthContext, GameContext)
│   ├── services/              # Servicios API (auth, category, question, progress,
│   │                          # leaderboard, quest, shop, voice, firebase, offlineCache)
│   ├── types/                 # Tipos e interfaces TypeScript de dominio
│   └── utils/                 # Utilidades fonéticas y de formateo
├── components/yachay/         # Componentes visuales y de diseño andino
│   ├── exercises/             # Ejercicios interactivos (quiz, pares, voz, banco)
│   ├── yachay-top-bar.tsx     # Barra superior sincronizada (racha, XP, gemas, vidas)
│   └── audio-pronounce-button.tsx # Botón universal de audio nativo Quechua
└── supabase/
    ├── migrations/            # Migraciones SQL normalizadas (3FN intacta)
    └── seed.sql               # Banco inicial de preguntas y categorías
```

---

## 📊 Estado de Calidad y Tests

| Verificación | Herramienta | Resultado |
| :--- | :--- | :--- |
| **Tipado Estático** | `npx tsc --noEmit` | **0 errores** ✅ |
| **Linter Oficial** | `npm run lint` | **0 errores, 0 advertencias** ✅ |
| **Pruebas Unitarias** | `npm test` | **12/12 pruebas aprobadas (100%)** ✅ |
| **Servidor Metro** | Expo CLI | **Activo y operativo (HTTP 200)** ✅ |
| **Control de Versiones** | Git Local | **3 commits locales creados, 0 pushes remotos** ✅ |

---

## 🛠️ Instrucciones de Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npx expo start -c
```

### 3. Ejecutar las pruebas unitarias
```bash
npm test
```

### 4. Verificar calidad de código y tipos
```bash
npx tsc --noEmit
npm run lint
```

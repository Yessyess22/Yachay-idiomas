# Yachay Idiomas — Aprendizaje de Quechua 🇵🇪

**Yachay** es una aplicación móvil universal (iOS, Android, Web) desarrollada con Expo y React Native para la enseñanza interactiva del idioma Quechua (Runasimi). Integra Firebase Auth (v12) para autenticación de usuarios, Supabase PostgreSQL en 3FN como backend relacional y Clean Architecture en el frontend.

---

## 🚀 Arquitectura del Proyecto (Clean Architecture Feature-First)

```
Yachay/
├── app/                       # Rutas e interfaz UI (Expo Router)
│   ├── (auth)/                # Login y Registro con Firebase Auth
│   ├── (tabs)/                # Navegación por pestañas: Aprender, Explorar, Ligas, Tienda, Perfil
│   ├── onboarding/            # Carrusel interactivo de Onboarding de 4 pasos con Yachi
│   ├── category/[slug].tsx    # Lecciones de una categoría
│   ├── lesson/[id].tsx        # Motor interactivo de ejercicios (Teoría → Quiz)
│   ├── level/exam/[levelId].tsx  # Examen bloqueante de fin de nivel
│   ├── guidebook/[id].tsx     # Guía gramatical de referencia del Quechua
│   ├── translator/index.tsx   # Traductor de voz e IA (Español ↔ Quechua)
│   └── blocked.tsx            # Pantalla de bloqueo al agotar vidas
├── src/                       # Capa de lógica de negocio y servicios
│   ├── context/               # Contextos globales (AuthContext, GameContext)
│   ├── services/              # Servicios API (auth, category, question, exam, progress,
│   │                          # leaderboard, quest, shop, voice, firebase, offlineCache, notificationService)
│   ├── types/                 # Interfaces TypeScript de dominio
│   ├── utils/                 # Funciones utilitarias (phoneticGuide.ts)
│   └── assets/images/         # Re-exports semánticos de imágenes (Yachi, tarjetas)
├── components/yachay/         # Componentes de marca (header, top bar, tarjetas, audio pronounce)
│   └── exercises/             # Ejercicios: opción múltiple, banco de palabras, pares, pronunciación
├── constants/                 # Tokens de marca (theme.ts) e ilustraciones
├── assets/images/kit-complementos/ # Kit visual completo de marca y accesorios
├── supabase/
│   ├── migrations/            # Migraciones SQL versionadas (DDL en 3FN + extensiones)
│   └── seed.sql               # Datos iniciales (Categorías, Lecciones, Preguntas Quechua)
├── docs/                      # Documentación de gobernanza y colección Insomnia (35 endpoints)
├── tts_service.py             # Microservicio local de TTS en Python (gTTS/pyttsx3)
├── Dockerfile                 # Imagen Docker node:20-alpine
└── docker-compose.yml         # Configuración de red estática 10.10.10.0/24
```

---

## 📊 Estado de los Sprints

- ✅ **Sprint 1 (100%)**: DDL en 3FN, Migraciones SQL, Seed Quechua (30 preguntas), Docker y Clean Architecture.
- ✅ **Sprint 2 (100%)**: Capa de Servicios (`src/services/`), AuthContext, Pantallas de Categorías, Lección Quiz interactiva y Perfil de Usuario con Logout.
- ✅ **Sprint 3 (100%)**: `GameContext` (vidas, XP, gemas, racha), Exámenes de Fin de Nivel, Traductor de Voz con IA, Tienda (`shop.tsx`), Ligas/Leaderboard, Guía Gramatical, Ejercicios de banco de palabras y pares.
- ✅ **Sprint 4 (100%)**: Onboarding inmersivo de 4 pasos, Dashboard "Camino del Saber", persistencia de `GameContext` en Supabase (Cierre GAP-06), `leaderboard_weekly` (Cierre GAP-07), pruebas Jest (Cierre GAP-03) y auditoría sin estilos inline.
- ✅ **Sprint 5 (100%)**: Migración a Firebase Auth (SDK v12 modular), persistencia de sesión AsyncStorage, mensajes traducidos al español, rediseño de lecciones con vocabulario previo y colección Insomnia con 35 endpoints REST.
- ✅ **Sprint 6 (100%)**: Sistema de Audio Nativo (`expo-speech` + voces Android), Guía Fonética Quechua (`phoneticGuide.ts`), ejercicio de pronunciación por voz, `AudioPronounceButton`, microservicio local Python TTS (`tts_service.py`), resiliencia offline (`offlineCache.ts`), notificaciones de racha (`notificationService.ts`) y feedback háptico (`expo-haptics`).

### ✨ Funcionalidades Implementadas

| Módulo | Pantalla(s) / Componente(s) | Descripción |
| :--- | :--- | :--- |
| **Onboarding** | `app/onboarding/index.tsx` | Carrusel interactivo de 4 pasos guiado por Yachi con persistencia en AsyncStorage |
| **Autenticación** | `app/(auth)/` | Login y Registro con Firebase Auth (SDK v12), traducción de errores y mapeo de UID a `profiles` |
| **Aprendizaje** | `app/(tabs)/index.tsx`, `app/category/[slug].tsx`, `app/lesson/[id].tsx` | Camino del Saber, categorías y lecciones en dos fases (Vocabulario → Quiz) con opción múltiple, banco de palabras, pares y pronunciación |
| **Audio y Voz Nativa** | `src/services/voiceService.ts`, `components/yachay/audio-pronounce-button.tsx`, `tts_service.py` | Reproducción con `expo-speech` (voces Android `es-PE`), botón universal de audio y microservicio TTS local Python |
| **Fonética Quechua** | `src/utils/phoneticGuide.ts`, `components/yachay/exercises/pronunciation-exercise.tsx` | Guía fonética Chanka/Cusco-Collao y ejercicio interactivo de pronunciación con captura de micrófono |
| **Gamificación** | `src/context/GameContext.tsx` | Vidas (5), XP, gemas y racha de días hidratados y sincronizados asíncronamente en Supabase; bloqueo automático a `/blocked` |
| **Niveles y Exámenes** | `app/level/exam/[levelId].tsx` | Examen de fin de nivel con umbral de aprobación y desbloqueo del siguiente nivel |
| **Ligas** | `app/(tabs)/leaderboard.tsx` | Clasificación semanal por `weekly_xp` y ligas (Bronce a Diamante) desde `leaderboard_weekly` JOIN `profiles` |
| **Tienda** | `app/(tabs)/shop.tsx` | Canje de gemas por recarga de vidas, cosméticos y congelador de racha consumiendo `shop_items` |
| **Traductor de Voz** | `app/translator/index.tsx` | Reconocimiento y síntesis de voz (Web Speech API / Expo Speech) + Edge Function `translate` |
| **Resiliencia & UX** | `offlineCache.ts`, `notificationService.ts`, `expo-haptics` | Guardado offline de lecciones, notificaciones push de racha a las 20:00 y vibración táctil háptica |
| **Pruebas API REST** | `docs/yachay-insomnia-collection.json` | Suite de 35 endpoints REST interactivos para pruebas de Firebase Auth y Supabase PostgreSQL |

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

### 3. Ejecutar pruebas unitarias (Jest)

```bash
npm test
```

### 4. Ejecutar servidor TTS local en Python (opcional para desarrollo)

```bash
python tts_service.py
```

### 5. Ejecutar con Docker

```bash
docker compose up -d
```
Acceso web en `http://10.10.10.10:8081` o `http://localhost:8081`.

---

## 📚 Documentación Adicional

Para más detalles sobre la gobernanza y arquitectura del proyecto, consulta la carpeta [/docs](file:///Users/alex/Documents/Yesikita/Yachay/docs/):
- [01-BITACORA_DESARROLLO.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/01-BITACORA_DESARROLLO.md) — registro cronológico de hitos técnicos
- [02-SESSION_MEM.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/02-SESSION_MEM.md) — estado actual del proyecto y de la sesión activa
- [03-REQUERIMIENTOS.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/03-REQUERIMIENTOS.md) — especificación completa de requerimientos y casos de uso
- [04-SPRINTS.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/04-SPRINTS.md) — roadmap y tareas por sprint (Sprints 1 al 6)
- [05-FINDINGS_DEUDA.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/05-FINDINGS_DEUDA.md) — registro de deuda técnica y resolución de GAPs
- [06-TASK_PLAN.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/06-TASK_PLAN.md) — distribución de tareas del equipo
- [07-PROMPT_DESARROLLO.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/07-PROMPT_DESARROLLO.md) — protocolo de arranque para asistentes de IA
- [08-CONTROL_SESION.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/08-CONTROL_SESION.md) — checklist de verificación y cierre de sesión
- [09-BD-SPEC.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/09-BD-SPEC.md) — especificación del esquema relacional 3FN e integración Firebase+Supabase
- [yachay-insomnia-collection.json](file:///Users/alex/Documents/Yesikita/Yachay/docs/yachay-insomnia-collection.json) — colección Insomnia v4 con 35 endpoints REST

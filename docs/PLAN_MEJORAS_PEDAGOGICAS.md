# 📋 Plan de Implementación Pedagógica y UX — Yachay Simi

**Objetivo:** Transformar Yachay en una experiencia de aprendizaje fluida, didáctica y estructurada donde **primero se enseña, luego se practica y finalmente se evalúa**, garantizando coherencia curricular, una interfaz limpia y preguntas pedagógicamente certificadas.

---

## 🧭 Los 7 Ejes de Implementación

### 1. 🎯 Diferenciación Clara: Examen vs. Evaluación vs. Avance
* **El Problema:** La app mezcla conceptos; una práctica parece un examen y completar una lección se confunde con dominar el nivel.
* **Solución Técnica & Visual:**
  * **Nodo Exclusivo de Examen:** El examen de fin de nivel se muestra con un diseño distinto (icono de sol sagrado / reliquia dorada, etiqueta explícita `Examen de Nivel`).
  * **Pantalla de Briefing del Examen:** Antes de iniciar, el estudiante ve una pantalla informativa:
    * *Qué temas cubre:* (ej. "Vocales A, I, U y consonantes Q, K, LL").
    * *Reglas:* Número de preguntas (8-10), nota mínima de aprobación (70%), sin penalización de vidas.
  * **Modo Examen Sumativo:** Durante el examen NO se muestra si la respuesta fue correcta o incorrecta en cada pregunta (sin sonido ni feedback inmediato). El resultado se muestra al final con un desglose por temas logrados.
  * **Separación de Métricas:**
    * `Avance`: Lecciones completadas en la ruta.
    * `Dominio`: Objetivos de aprendizaje demostrados.
    * `Certificación`: Exámenes de nivel aprobados.

---

### 2. 📖 Reestructuración de Nombres: "Modo Historia" ➡️ "Lecciones"
* **El Problema:** El nombre "Modo Historia" confunde al usuario porque no sabe si es un juego secundario o parte de su aprendizaje.
* **Solución:**
  * En la vista de categoría/módulo, renombrar "Modo Historia" a **"Lecciones guiadas con Yachi"** o **"Lecciones Interactivas"**.
  * Los diálogos culturales y conversacionales pasan a ser una lección didáctica con objetivos claros.
  * Los cuentos tradicionales (*El Zorro y el Cóndor*, *Manco Cápac*) quedan claramente ubicados en la **Biblioteca Andina (Explorar)** como lecturas libres sin exámenes.

---

### 3. 🗣️ Enseñanza Didáctica: Vocales, Abecedario, Pronunciación y Escritura
* **El Problema:** Se pedía al alumno identificar o escribir fonemas complejos sin haberle explicado cómo suenan ni cómo se articulan.
* **Solución Pedagógica:**
  * **Vocales Quechuas (Sistema Trivocálico A, I, U):**
    * Tarjeta interactiva de presentación: Letra grande + Audio auténtico + Guía visual de apertura de boca + Ejemplo real (*A -> Allin*, *I -> Inti*, *U -> Urpi*).
  * **Consonantes Especiales (Q, K, CH, LL, SH):**
    * Explicación de pronunciación articulatoria (ej. *La "Q" es posvelar y se pronuncia desde la garganta, como en "Quri"*).
    * Botón de reproducción normal y **reproducción lenta (modo tortuga 🐢)** para escuchar el detalle fonético.
  * **Escritura Asistida:**
    * Banco de sílabas y letras guiadas antes de pedir escritura libre con teclado.

---

### 4. 🔒 Trazabilidad Total: Cero Preguntas No Enseñadas
* **El Problema:** En los ejercicios o exámenes aparecían palabras o preguntas de temas no vistos o de otras lecciones por errores de fallback.
* **Solución:**
  * **Relación Directa Pregunta ↔ Enseñanza:** Cada pregunta pertenece estrictamente a los conceptos enseñados en su lección.
  * **Aislamiento de Exámenes:** El examen de nivel 1 solo contiene preguntas exclusivas de las lecciones del nivel 1.
  * **Eliminación de Fallbacks cruzados:** Si una lección no encuentra preguntas en la base de datos, muestra un estado limpio de *"Lección en preparación"*; **nunca** muestra preguntas de otra lección.

---

### 5. 🧹 Limpieza Total de la Pantalla de Inicio
* **El Problema:** La pantalla inicial estaba sobrecargada con 3 columnas, tarjetas de meta diaria, mascota lateral y accesos directos que dispersaban la atención.
* **Solución:**
  * **Diseño Minimalista de 1 Sola Columna:**
    1. **Saludo breve:** *"Allillanchu, [Usuario]"*.
    2. **Tarjeta de Acción Principal:** *"Continúa donde quedaste"* con un botón grande y claro.
    3. **Ruta Curricular Vertical:** Nodos ordenados paso a paso (Lección 1 ➡️ Lección 2 ➡️ Examen de Nivel 1 ➡️ Nivel 2).
    4. **Estado claro en cada nodo:** `Completada (✓)`, `En curso (●)`, o `Bloqueada (🔒: Completa la lección anterior)`.
  * La meta diaria y logros se consultan en **Perfil**, y la lectura libre en **Explorar**.

---

### 6. 🌟 Experiencia de Usuario Llevadera: "Enseñar Antes de Preguntar"
* **El Problema:** La lección iniciaba preguntando directamente, frustrando al alumno que aún no conocía la respuesta.
* **Solución (Flujo en 3 Fases):**
  1. **Fase 1: Presentación & Enseñanza (Teach):**
     * Yachi presenta las palabras o reglas nuevas una a una con audio, traducción y contexto cultural.
     * El alumno pulsa "Continuar" cuando ya las leyó y escuchó.
  2. **Fase 2: Práctica Guiada (Practice):**
     * Ejercicios interactivos (selección, emparejar pares, escuchar audio).
     * Si se equivoca, recibe una explicación inmediata y amable sin frustración.
  3. **Fase 3: Repaso & Resumen (Summary):**
     * Breve repaso de las palabras falladas para afianzar el conocimiento antes de dar por terminada la lección.

---

### 7. ✍️ Certificación y Calidad de Preguntas y Respuestas
* **El Problema:** Preguntas obvias (la pista estaba en el enunciado), opciones repetitivas o preguntas duplicadas.
* **Solución:**
  * **Cero Preguntas Obvias:** Diseñar distractores plausibles del mismo campo semántico (ej. si se pregunta por "Cinco / Pichqa", las opciones son otros números quechuas como *Tawa, Iskay, Kimsa*, no palabras de saludos ni obviedades).
  * **Cero Duplicados:** Cada pregunta de lección tiene un prompt único y las preguntas de examen son variantes frescas que evalúan el mismo objetivo.
  * **Explicación Pedagógica:** Cada opción incorrecta incluye una nota explicativa (*"Kimsa significa 3; Cinco se dice Pichqa"*).

---

## 🚀 Fases de Ejecución — Estado Final (100% COMPLETADAS ✅)

| Fase | Foco Principal | Entregables Clave | Estado |
| :--- | :--- | :--- | :---: |
| **Fase 1: UI de Inicio & Navegación** | Limpieza visual (Puntos 2 y 5) | Inicio en 1 columna vertical con "Continuar", caminito serpentine Duolingo 3D, Wiphala Neón y eliminación de accesos redundantes. | **COMPLETADO ✅** |
| **Fase 2: Flujo Didáctico de Lecciones** | Enseñar antes de evaluar (Puntos 3 y 6) | Componente `LessonTeaching` con presentación fonética/vocabulario, modo tortuga 🐢, práctica guiada y resumen. | **COMPLETADO ✅** |
| **Fase 3: Exámenes & Trazabilidad** | Seguridad y claridad de examen (Puntos 1 y 4) | Briefing de examen, evaluación sumativa sin descuento de vidas, preguntas dinámicas mixtas y Ronda de Refuerzo final. | **COMPLETADO ✅** |
| **Fase 4: Certificación Editorial** | Calidad de preguntas (Punto 7) | Eliminación de obviedades, distractores plausibles del mismo campo semántico, cero duplicados y explicaciones didácticas. | **COMPLETADO ✅** |

---

## 🏆 Resumen de Innovaciones Agregadas
1. **Mascota Interactiva Yachi Companion (🦙):** Trota al lado del nodo activo con animación continua y respuesta táctil háptica.
2. **Paleta Cromática Wiphala Neón:** 9 redonditos intercalados con colores únicos y vivos (`#FFD600`, `#00B0FF`, `#FF1744`, `#00E676`, `#A855F7`, `#FF6D00`, `#FF2A85`, `#3B82F6`, `#FFB300`).
3. **Onboarding Curricular (Yachay Ñan):** Paso interactivo de 4 niveles y 3 habilidades antes del registro.
4. **Créditos Académicos Oficiales:** Universidad Privada Domingo Savio — Ingeniería de Sistemas (Yessica Escobar, Alejandro Padilla, Oscar Segovia).
5. **Cabecera Unificada de Traductor:** Diseño con tarjeta de montaña andina, cinta textil y mascota Yachi.


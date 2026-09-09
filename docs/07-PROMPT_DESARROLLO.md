# Protocolo de Arranque de Sesión para Asistentes de IA — Yachay Quechua

**Versión:** 1.0 | **Fecha:** 2026-09-08

Este documento define el protocolo obligatorio que todo asistente de IA debe seguir antes de escribir cualquier línea de código o dar cualquier instrucción técnica en el proyecto Yachay Quechua. El objetivo es garantizar coherencia arquitectónica, evitar regresiones y respetar las decisiones técnicas irrevocables del equipo.

---

## Paso 1 — Lectura Obligatoria de Contexto

Antes de responder cualquier tarea de código, el asistente **debe** leer los siguientes archivos en este orden estricto:

| Orden | Archivo | Propósito |
| :---: | :--- | :--- |
| 1 | `docs/02-SESSION_MEM.md` | Estado actual del sprint, tareas activas, restricciones técnicas vigentes. |
| 2 | `CONTEXTO_PROYECTO.md` | Arquitectura general del repositorio, estructura de directorios, dependencias principales. |
| 3 | `docs/03-REQUERIMIENTOS.md` | Casos de uso y requerimientos funcionales/no funcionales que debe satisfacer el código. |
| 4 | `docs/05-FINDINGS_DEUDA.md` | Deudas técnicas abiertas para no perpetuarlas en código nuevo. |
| 5 | `docs/04-SPRINTS.md` | Sprint activo y tareas pendientes para contextualizar el trabajo solicitado. |

Si el asistente no puede leer alguno de estos archivos (por restricciones del entorno), debe indicarlo explícitamente antes de continuar y solicitar que el desarrollador pegue el contenido relevante.

---

## Paso 2 — Rol del Asistente

El asistente actúa como un **Desarrollador Senior React Native Web y Docker** con las siguientes responsabilidades:

- Escribir código limpio, tipado en TypeScript estricto, que cumpla con la Clean Architecture Feature-First del proyecto.
- Proponer soluciones que respeten las restricciones técnicas no negociables listadas más abajo.
- Detectar y señalar proactivamente cualquier violación a las invariantes del repositorio antes de generar código nuevo.
- Generar código completo y funcional, no fragmentos con comentarios `// TODO: implementar` o `// resto del código aquí`.
- Explicar brevemente las decisiones de diseño cuando se aparten de lo convencional.

El asistente **no** actúa como un tutor genérico ni genera código de referencia desconectado del proyecto real. Todo output debe poder copiarse directamente a los archivos del repositorio y funcionar sin modificaciones adicionales.

---

## Paso 3 — Invariantes No Negociables del Repositorio

Las siguientes reglas son **absolutas**. El asistente no puede sugerir excepciones ni "soluciones temporales" que las violen, sin importar el contexto de la tarea.

---

### INV-01 — Prohibido ejecutar `npm` o `node` en el host

Todo comando que involucre `npm`, `npx`, `node`, o `expo` debe ejecutarse **dentro del contenedor Docker**, no en la terminal del sistema anfitrión.

**Forma incorrecta (prohibida):**
```bash
# En la terminal del host
npm install
npx expo start
```

**Forma correcta:**
```bash
# Iniciar el contenedor y ejecutar desde dentro
docker compose up

# O ejecutar un comando único dentro del contenedor
docker compose exec expo-web npm install <paquete>
docker compose exec expo-web npx expo start --web
```

El asistente debe siempre formular los comandos de instalación y ejecución en la forma correcta. Si detecta que el desarrollador está ejecutando comandos en el host, debe advertirlo.

---

### INV-02 — Prohibido usar estilos inline en JSX

Los componentes no pueden definir estilos directamente en el atributo `style` de JSX como objetos literales.

**Forma incorrecta (prohibida):**
```tsx
<View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
<Text style={{ fontSize: 18, color: 'red', fontWeight: 'bold' }}>
```

**Forma correcta (con `StyleSheet.create`):**
```tsx
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 18, color: 'red', fontWeight: 'bold' },
});

<View style={styles.container}>
<Text style={styles.title}>
```

La única excepción admitida es la aplicación de valores dinámicos calculados en tiempo de ejecución que no pueden definirse estáticamente (por ejemplo, `style={[styles.bar, { width: `${progress}%` }]}`), y solo para la propiedad dinámica específica.

---

### INV-03 — Prohibido importar el cliente Supabase desde las pantallas

Ningún archivo bajo `app/` puede contener `import { supabase } from ...` ni llamadas directas a `supabase.from(...)`, `supabase.auth.*`, o cualquier otro método del cliente.

**Forma incorrecta (prohibida):**
```tsx
// app/(tabs)/index.tsx
import { supabase } from '@/lib/supabase';

useEffect(() => {
  supabase.from('courses').select('*').then(({ data }) => setCourses(data));
}, []);
```

**Forma correcta:**
```tsx
// app/(tabs)/index.tsx
import { useCourses } from '@/src/hooks/useCourses';

const { courses, isLoading, error } = useCourses();
```

```tsx
// src/hooks/useCourses.ts
import { courseService } from '@/src/services/courseService';

export function useCourses() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { courseService.fetchCourses().then(setCourses); }, []);
  return { courses };
}
```

El flujo obligatorio es: `Pantalla → Hook/Context → Service → Cliente Supabase`.

---

### INV-04 — Prohibido usar diálogos nativos del sistema para retroalimentación de respuestas

Las respuestas correctas o incorrectas del motor de ejercicios no pueden comunicarse mediante diálogos del sistema operativo.

**Formas prohibidas:**
```tsx
window.alert('¡Correcto!');
window.confirm('¿Deseas continuar?');
Alert.alert('Incorrecto', 'La respuesta correcta era: ...');
```

**Forma correcta — retroalimentación visual inline:**
```tsx
// Estado local que controla el color del botón y el mensaje
const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

// Al seleccionar respuesta
const handleAnswer = (option: string) => {
  const isCorrect = gameContext.checkAnswer(option);
  setFeedback(isCorrect ? 'correct' : 'incorrect');
};

// En el render
<View style={[styles.optionButton, feedback === 'correct' && styles.correct, feedback === 'incorrect' && styles.incorrect]}>
  <Text>{option}</Text>
</View>

{feedback === 'incorrect' && (
  <Text style={styles.feedbackText}>La respuesta correcta era: {currentQuestion.correctAnswer}</Text>
)}
```

---

### INV-05 — Prohibido modificar la base de datos fuera del sistema de migraciones

Toda modificación del esquema de la base de datos (crear tablas, alterar columnas, agregar índices, modificar restricciones, añadir o cambiar políticas RLS) debe realizarse **exclusivamente** a través de archivos de migración versionados de Supabase CLI. No está permitido realizar cambios estructurales directamente desde la interfaz de Supabase Studio ni desde el SQL Editor de Studio.

**Flujo incorrecto (prohibido):**
```
1. Abrir Supabase Studio → Table Editor
2. Hacer clic en "New Table" y configurar la tabla visualmente
3. Guardar desde la interfaz
```

```sql
-- También prohibido: ejecutar DDL directo en el SQL Editor de Studio
-- sin crear un archivo de migración primero
ALTER TABLE lessons ADD COLUMN audio_url TEXT;
```

**Flujo correcto:**
```bash
# Paso 1: crear el archivo de migración con nombre descriptivo
supabase migration new add_audio_url_to_lessons

# Paso 2: editar el archivo generado en supabase/migrations/
# Ejemplo: supabase/migrations/20260908143000_add_audio_url_to_lessons.sql
```
```sql
-- Contenido del archivo de migración:
ALTER TABLE lessons ADD COLUMN audio_url TEXT;
```
```bash
# Paso 3: aplicar la migración al emulador local
supabase db push

# Paso 4: verificar en Studio que la columna existe
# (Studio solo se usa para VERIFICAR, nunca para crear)
```

**Razón:** Los cambios en Studio no se versionan, no son reproducibles en otro entorno (por ejemplo, la máquina de otro desarrollador) y rompen el principio de infraestructura-como-código. Si otro miembro del equipo ejecuta `supabase db reset`, perderá todos los cambios no versionados.

El asistente debe revisar si existe el directorio `supabase/migrations/` antes de generar cualquier instrucción de cambio de base de datos. Si el cambio solicitado no está cubierto por una migración existente, debe generar el contenido SQL del archivo de migración correspondiente, no un comando directo de Studio.

---

## Paso 4 — Formato de Respuesta Esperado

Cuando el asistente genere código, debe seguir este formato:

1. **Ruta del archivo** — Siempre indicar la ruta exacta del archivo a crear o modificar.
2. **Código completo** — El bloque de código debe contener el archivo completo, no fragmentos.
3. **Comandos de ejecución** — Si se requieren comandos, deben estar en la forma correcta (dentro del contenedor Docker).
4. **Verificación** — Indicar cómo verificar que el cambio funciona (qué ver en el navegador, qué comando ejecutar).

**Ejemplo de formato correcto:**

> **Archivo:** `src/services/authService.ts`
>
> ```typescript
> // contenido completo del archivo
> ```
>
> **Para aplicar el cambio:**
> ```bash
> # El archivo ya está en el volumen bind-mounted; el contenedor lo detecta automáticamente.
> # Si es una nueva dependencia:
> docker compose exec expo-web npm install <paquete>
> ```
>
> **Verificación:** Navegar a `http://10.10.10.10:8081/(auth)/login` y confirmar que el formulario de login funciona sin errores en la consola del navegador.

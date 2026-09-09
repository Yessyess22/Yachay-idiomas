# Control de Sesión y Checklist de Cierre — Yachay Quechua

**Versión:** 1.0 | **Fecha:** 2026-09-08

Este documento define las listas de verificación obligatorias que deben ejecutarse antes de cerrar una sesión de desarrollo o antes de abrir un Pull Request hacia la rama `dev` o `main`. Ningún merge debe realizarse sin haber completado al menos las secciones 1, 2 y 3.

---

## Sección 1 — Verificación del Entorno Docker

Ejecutar los siguientes comandos **en orden** para confirmar que el entorno está sano antes de cualquier prueba o cierre de sesión.

### 1.1 — Iniciar los contenedores

```bash
# Desde la raíz del proyecto en el host
docker compose up -d

# Verificar que el servicio está corriendo (estado debe ser "Up")
docker compose ps
```

Resultado esperado:
```
NAME          IMAGE          COMMAND       SERVICE     STATUS    PORTS
yachay-expo   yachay-expo    "..."         expo-web    Up        0.0.0.0:8081->8081/tcp
```

### 1.2 — Verificar la red y la IP estática

```bash
# Inspeccionar la red para confirmar subnet y IP del contenedor
docker network inspect yachay-net --format '{{json .IPAM.Config}}'
# → Resultado esperado: [{"Subnet":"10.10.10.0/24","Gateway":"10.10.10.1"}]

docker inspect yachay-expo --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
# → Resultado esperado: 10.10.10.10
```

- [ ] La subnet es `10.10.10.0/24`
- [ ] La IP del contenedor `expo-web` es `10.10.10.10`

### 1.3 — Verificar conectividad y acceso web

```bash
# Desde el host, probar que el servidor Expo responde
curl -s -o /dev/null -w "%{http_code}" http://10.10.10.10:8081
# → Resultado esperado: 200
```

- [ ] `http://10.10.10.10:8081` devuelve HTTP 200
- [ ] La aplicación carga correctamente en el navegador del host

### 1.4 — Verificar logs del contenedor

```bash
# Revisar los últimos 50 logs del contenedor por errores críticos
docker compose logs --tail=50 expo-web
```

- [ ] No hay líneas con `Error:` o `Cannot find module` en los logs
- [ ] El servidor Expo está escuchando en el puerto `8081`

---

## Sección 2 — Verificación del Frontend (TypeScript y Linter)

Todos los comandos de esta sección deben ejecutarse **dentro del contenedor Docker**, no en el host.

### 2.1 — Verificación de TypeScript

```bash
# Ejecutar dentro del contenedor
docker compose exec expo-web npx tsc --noEmit

# Forma alternativa si existe script en package.json
docker compose exec expo-web npm run typecheck
```

- [ ] `tsc --noEmit` finaliza con código de salida `0` (sin errores)
- [ ] No hay errores de tipo `TS2345`, `TS2322`, `TS2304` ni similares

### 2.2 — Verificación del Linter

```bash
# Ejecutar el linter dentro del contenedor
docker compose exec expo-web npm run lint

# Si se quiere ver todos los archivos con advertencias:
docker compose exec expo-web npx eslint . --ext .ts,.tsx --max-warnings 0
```

- [ ] El linter finaliza sin errores de nivel `error`
- [ ] No hay advertencias del tipo `no-unused-vars`, `no-console` sin justificar

### 2.3 — Verificación de compilación web limpia

```bash
# Compilar la app Expo para web y verificar que no hay errores de bundling
docker compose exec expo-web npx expo export --platform web
```

- [ ] El comando `expo export` finaliza sin errores
- [ ] La carpeta `dist/` se genera correctamente (no se versiona en git)

---

## Sección 3 — Auditoria de Código: Violaciones de Invariantes

Los siguientes comandos de `grep` deben retornar **vacío** (sin resultados) antes de cualquier merge. Si alguno retorna resultados, deben corregirse antes de continuar.

### 3.1 — Verificar ausencia de `window.alert` y diálogos nativos prohibidos

```bash
# Buscar uso de window.alert, window.confirm, window.prompt
grep -rn "window\.alert\|window\.confirm\|window\.prompt" app/ src/
# → Debe retornar vacío

# Buscar uso de Alert.alert de React Native (prohibido para retroalimentación de respuestas)
grep -rn "Alert\.alert" app/ src/
# → Debe retornar vacío (o solo en archivos explícitamente autorizados)
```

- [ ] `window.alert` / `window.confirm` / `window.prompt` — sin resultados
- [ ] `Alert.alert` en flujos de lección — sin resultados

### 3.2 — Verificar ausencia de estilos inline

```bash
# Detectar objetos de estilo inline en JSX (patrón style={{ )
grep -rn "style={{" app/ src/components/
# → Debe retornar vacío (excepciones documentadas abajo)
```

Excepciones aceptadas (si las hay, listar aquí con justificación):

| Archivo | Línea | Propiedad dinámica | Justificación |
| :--- | :--- | :--- | :--- |
| `app/lesson/[id].tsx` | — | `width: \`${progress}%\`` | Valor calculado en tiempo de ejecución para la barra de progreso. |

- [ ] No hay estilos inline no autorizados en pantallas ni componentes

### 3.3 — Verificar ausencia de imports directos de Supabase en pantallas

```bash
# Buscar imports directos del cliente Supabase en archivos de pantalla
grep -rn "from.*supabase\|from.*lib/supabase" app/
# → Debe retornar vacío

# Buscar llamadas directas al cliente fuera de src/services/
grep -rn "supabase\.from\|supabase\.auth" app/ src/context/ src/hooks/
# → Debe retornar vacío
```

- [ ] Ningún archivo bajo `app/` importa el cliente Supabase directamente
- [ ] Ningún contexto ni hook llama a `supabase.*` directamente (solo los servicios lo hacen)

### 3.4 — Verificar ausencia de `node_modules` en el staging de Git

```bash
# Confirmar que node_modules no está siendo trackeado
git status | grep node_modules
# → Debe retornar vacío

git ls-files node_modules | head -5
# → Debe retornar vacío
```

- [ ] `node_modules/` no aparece en `git status`
- [ ] `.dockerignore` y `.gitignore` contienen la entrada `node_modules`

---

## Sección 3B — Verificación de Migraciones de Base de Datos

Esta sección debe ejecutarse **antes de cualquier merge** que incluya cambios en la capa de servicios (`src/services/`) o en la definición de tipos que hagan referencia a columnas de Supabase.

### 3B.1 — Verificar que todos los cambios de esquema están versionados

```bash
# Listar todos los archivos de migración aplicados
ls -lh supabase/migrations/
# → Debe existir al menos un archivo .sql con fecha y nombre descriptivo

# Verificar que el historial de migraciones local coincide con Supabase
supabase migration list
# → Todas las migraciones deben aparecer con estado "Applied"
```

- [ ] La carpeta `supabase/migrations/` contiene al menos 1 archivo `.sql`
- [ ] `supabase migration list` no muestra migraciones en estado "Pending" o "Failed"

### 3B.2 — Verificar que no hubo cambios directos en Studio

```bash
# Comparar el esquema actual de la BD con el estado esperado de las migraciones
# Si hay diferencias, significa que alguien modificó la BD fuera del sistema de migraciones
supabase db diff
# → Debe retornar vacío (sin diferencias entre el esquema live y las migraciones)
```

- [ ] `supabase db diff` no reporta diferencias entre el esquema live y las migraciones aplicadas
- [ ] No hay tablas en Supabase Studio que no estén definidas en algún archivo de `supabase/migrations/`

### 3B.3 — Verificar integridad del seed de datos

```bash
# Verificar que las tablas de contenido tienen datos de quechua
supabase db execute "SELECT COUNT(*) AS total_categorias FROM categories;"
# → Resultado esperado: ≥ 3

supabase db execute "SELECT COUNT(*) AS total_preguntas FROM questions;"
# → Resultado esperado: ≥ 30

supabase db execute "SELECT COUNT(*) AS total_niveles FROM levels;"
# → Resultado esperado: ≥ 1 por categoría
```

- [ ] La tabla `categories` tiene al menos 3 registros (Abecedario, Números, Palabras)
- [ ] La tabla `questions` tiene al menos 30 registros con contenido real en quechua
- [ ] Las políticas RLS están activas: verificar en Studio que cada tabla de progreso tiene al menos 1 política habilitada

### 3B.4 — Verificar que los servicios solo usan tablas existentes en el esquema

```bash
# Buscar referencias a tablas en los servicios y verificar que existen en el esquema
grep -rn "\.from('" src/services/
# → Cada nombre de tabla debe existir en supabase/migrations/
```

- [ ] No hay referencias en `src/services/` a tablas que no existan en el esquema de migraciones

---

## Sección 4 — Checklist de Revisión por Pares (Pull Request)

Antes de aprobar un Pull Request, el revisor debe confirmar cada punto de esta lista:

### Arquitectura y Separación de Responsabilidades

- [ ] Ninguna pantalla bajo `app/` contiene lógica de negocio ni consultas a Supabase.
- [ ] Los nuevos servicios en `src/services/` están correctamente tipados y exportan funciones puras (no clases con estado).
- [ ] Los contextos en `src/context/` no mezclan lógica de UI con lógica de dominio.
- [ ] Los tipos nuevos están definidos en `src/types/` y no están duplicados en otros archivos.

### Calidad de Código

- [ ] No hay variables declaradas pero no usadas (`const x = ...` sin referencias).
- [ ] No hay `console.log` de depuración en el código mergeado (solo se admiten si están dentro de un bloque de condición `if (__DEV__)`).
- [ ] No hay comentarios `// TODO` ni `// FIXME` sin un GAP abierto asociado en `05-FINDINGS_DEUDA.md`.
- [ ] Todas las funciones asíncronas manejan errores con `try/catch` o propagación explícita.

### Experiencia de Usuario

- [ ] La retroalimentación de respuestas correctas e incorrectas es visual y no usa diálogos del sistema.
- [ ] Los estados de carga (`isLoading`) y error están representados visualmente en pantalla.
- [ ] La navegación con el botón "atrás" del sistema no rompe el estado del `GameContext`.

### Base de Datos y Migraciones

- [ ] Si el PR modifica el esquema de la BD, el cambio está en un archivo de `supabase/migrations/` con nombre descriptivo.
- [ ] `supabase db diff` retorna vacío después de aplicar las migraciones del PR.
- [ ] No hay instrucciones en el PR que indiquen hacer cambios directamente en Supabase Studio.
- [ ] Si se añaden nuevas tablas con datos de usuario, tienen habilitada la política RLS correspondiente.

### Documentación

- [ ] Si el PR cierra o avanza un GAP en `05-FINDINGS_DEUDA.md`, el GAP fue actualizado en el PR.
- [ ] Si el PR completa una tarea de sprint, el estado en `06-TASK_PLAN.md` fue actualizado a ✅.
- [ ] Se agregó la entrada correspondiente en `01-BITACORA_DESARROLLO.md`.

---

## Sección 5 — Cierre de Sesión

Al terminar una sesión de desarrollo, ejecutar estos pasos antes de cerrar el editor:

```bash
# 1. Guardar el estado de los contenedores
docker compose stop

# 2. Verificar que no hay cambios sin stagear accidentalmente
git status

# 3. Si hay trabajo en progreso, guardar con un commit WIP
git add -p  # Agregar cambios de forma selectiva
git commit -m "WIP: [descripción breve del estado actual]"

# 4. Actualizar 02-SESSION_MEM.md con el estado actualizado de las tareas
# (editar manualmente la tabla "Registro de Sesiones" al final del archivo)
```

- [ ] Contenedores detenidos con `docker compose stop`
- [ ] No hay cambios sin versionar que puedan perderse
- [ ] `docs/02-SESSION_MEM.md` fue actualizado con la entrada de cierre de sesión

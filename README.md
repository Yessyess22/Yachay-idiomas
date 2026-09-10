# Yachay Idiomas — Aprendizaje de Quechua 🇵🇪

**Yachay** es una aplicación móvil universal (iOS, Android, Web) desarrollada con Expo y React Native para la enseñanza interactiva del idioma Quechua (Runasimi). Integra Supabase como backend PostgreSQL relacional en 3FN y Clean Architecture en el frontend.

---

## 🚀 Arquitectura del Proyecto (Clean Architecture Feature-First)

```
Yachay/
├── app/                      # Rutas e interfaz UI (Expo Router)
│   ├── (auth)/               # Pantallas de Login y Registro
│   ├── (tabs)/               # Navegación por pestañas (Inicio, Explorar, Perfil)
│   ├── category/[slug].tsx   # Lecciones de una categoría
│   └── lesson/[id].tsx       # Motor interactivo de ejercicios Quiz
├── src/                      # Capa de lógica de negocio y servicios
│   ├── context/              # Contextos globales (AuthContext, etc.)
│   ├── services/             # Servicios API (authService, categoryService, questionService, supabase)
│   ├── types/                # Interfaces TypeScript de dominio
│   └── utils/                # Funciones utilitarias
├── supabase/
│   ├── migrations/           # Migraciones SQL versionadas (DDL en 3FN)
│   └── seed.sql              # Datos iniciales (Categorías, Lecciones, Preguntas Quechua)
├── docs/                     # Documentación oficial de gobernanza del proyecto
├── Dockerfile                # Imagen Docker node:20-alpine
└── docker-compose.yml        # Configuración de red estática 10.10.10.0/24
```

---

## 📊 Estado de los Sprints

- ✅ **Sprint 1 (100%)**: DDL en 3FN, Migraciones SQL, Seed Quechua (30 preguntas), Docker y Clean Architecture.
- ✅ **Sprint 2 (100%)**: Capa de Servicios (`src/services/`), AuthContext, Pantallas de Categorías, Lección Quiz interactiva y Perfil de Usuario con Logout.
- 🔵 **Sprint 3 (Próximo)**: Motor de Gamificación (`GameContext`), Exámenes de Fin de Nivel y Traductor de Voz.
- ⬜ **Sprint 4 (Pendiente)**: Pruebas unitarias, E2E y certificación final.

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

### 3. Ejecutar con Docker

```bash
docker compose up -d
```
Acceso web en `http://10.10.10.10:8081` o `http://localhost:8081`.

---

## 📚 Documentación Adicional

Para más detalles sobre la gobernanza y arquitectura del proyecto, consulta la carpeta [/docs](file:///Users/alex/Documents/Yesikita/Yachay/docs/):
- [01-BITACORA_DESARROLLO.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/01-BITACORA_DESARROLLO.md)
- [02-SESSION_MEM.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/02-SESSION_MEM.md)
- [04-SPRINTS.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/04-SPRINTS.md)
- [06-TASK_PLAN.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/06-TASK_PLAN.md)
- [09-BD-SPEC.md](file:///Users/alex/Documents/Yesikita/Yachay/docs/09-BD-SPEC.md)

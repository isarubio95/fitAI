# FitAI (Gym Log)

Aplicación web de entrenamiento orientada a registro de fuerza y cardio, planificación semanal, analítica de progreso y funcionalidades sociales, construida con React + TypeScript + Supabase.

## 1) Visión de Producto

FitAI centraliza el ciclo completo de entrenamiento:
- **Planificación** de rutinas y hoja de ruta semanal.
- **Ejecución** de entrenos de fuerza y cardio (incluye sesión cardio en vivo con GPS).
- **Seguimiento** de métricas históricas y evolución.
- **Comunidad** y notificaciones in-app.
- **Personalización** de tema/acento, perfil y preferencias.

## 2) Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite 7
- **Routing:** React Router 7
- **Estado de servidor:** TanStack Query 5
- **UI System:** Tailwind CSS 4 + componentes Radix/shadcn + utilidades propias
- **Animaciones / UX:** Framer Motion, Vaul (drawers)
- **Backend BaaS:** Supabase (Auth, Postgres, Edge Functions)
- **Mapas / GPS:** Leaflet + React Leaflet
- **Testing:** Vitest + Testing Library (jsdom)
- **PWA:** `vite-plugin-pwa`

## 3) Arquitectura de Alto Nivel

### Frontend (SPA)

La app funciona como SPA con un `AppLayout` común y páginas por dominio:
- `Dashboard`
- `Library` / `Routines` / `Exercises`
- `WorkoutHistory`
- `Evolution`
- `Community`
- `CardioRoutines`

`src/App.tsx` define el grafo de rutas y los providers globales:
- `ThemeProvider`
- `QueryClientProvider`
- `AuthProvider`
- `RestTimerProvider`
- `TooltipProvider`

### Backend (Supabase)

- Cliente tipado en `src/integrations/supabase/client.ts`
- Tipos de DB generados en `src/integrations/supabase/types.ts`
- Edge Function relevante:
  - `supabase/functions/generate-custom-routine/index.ts` (generación de planes con Gemini + validaciones + control de premium)

### Flujo de datos

1. UI dispara acciones desde páginas/componentes.
2. Hooks de dominio (`src/hooks`) ejecutan lecturas/escrituras contra Supabase.
3. TanStack Query cachea y revalida datos.
4. La UI se actualiza de forma reactiva con estados de carga/error.

## 4) Estructura del Proyecto

```text
.
├─ src/
│  ├─ components/
│  │  ├─ cardio/            # logger, recorder en vivo, formularios cardio
│  │  ├─ dashboard/         # widgets, planificador mensual, wizard
│  │  ├─ exercise/          # selector/detalle de ejercicios
│  │  ├─ layout/            # AppLayout, sidebar, drawers de perfil/ajustes
│  │  ├─ notifications/     # campana y render de notificaciones
│  │  ├─ routine/           # CRUD y utilidades de rutinas
│  │  ├─ workout/           # logger de fuerza, componentes de sesión
│  │  └─ ui/                # design system base (botones, select, drawer...)
│  ├─ hooks/                # hooks de dominio y estado global
│  ├─ integrations/
│  │  └─ supabase/          # client + tipos generados
│  ├─ pages/                # vistas de nivel ruta
│  ├─ contexts/             # contextos React de soporte
│  ├─ lib/, constants/, types/
│  └─ test/                 # tests unitarios/integración UI
├─ supabase/
│  ├─ config.toml
│  └─ functions/
│     └─ generate-custom-routine/
├─ .env.example
├─ vite.config.ts
├─ vitest.config.ts
└─ eslint.config.js
```

## 5) Principios de Diseño (Codebase)

- **Arquitectura por dominio:** cardio, workout, routines, dashboard, etc.
- **UI desacoplada de acceso a datos:** componentes consumen hooks.
- **Tipos primero:** modelos y payloads tipados (`src/types`, tipos Supabase).
- **Reutilización de UI:** primitives de `src/components/ui` con variantes consistentes.
- **UX móvil prioritaria:** drawers, pills, navegación inferior, estados transicionales.

## 6) Módulos Funcionales Clave

- **Workout Logger (fuerza):** creación/edición de sesiones, series, descanso, RIR.
- **Cardio Logger / Live Recorder:** bloques cardio, `sport_detail`, track GPS.
- **Rutinas:** creación/edición, ordenación drag & drop, iconografía y plantillas.
- **Planificación:** wizard y calendario mensual para hoja de ruta.
- **Evolución y analítica:** historial, métricas y widgets.
- **Comunidad:** feed/perfil/seguimientos/notificaciones.

## 7) Entorno y Configuración

### Variables de entorno

Definidas en `.env.example`:

```bash
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
```

### Requisitos

- Node.js LTS recomendado
- npm
- Proyecto Supabase configurado

## 8) Inicio Rápido

```bash
npm install
cp .env.example .env
npm run dev
```

Servidor dev por defecto en `http://localhost:8080` (ver `vite.config.ts`).

## 9) Scripts Disponibles

- `npm run dev` - desarrollo local
- `npm run build` - build producción
- `npm run build:dev` - build en modo desarrollo
- `npm run preview` - servir build localmente
- `npm run lint` - lint con ESLint
- `npm run test` - tests una pasada
- `npm run test:watch` - tests en modo watch

## 10) Calidad y Testing

### Estrategia actual

- Tests con Vitest + Testing Library.
- Configuración en `vitest.config.ts` (ambiente `jsdom`).
- Suite en `src/test` y tests por hooks/componentes.

### Convención sugerida para PRs

- Añadir tests cuando se cambie lógica de negocio.
- Mantener cobertura de hooks críticos y cálculos de dominio.
- Validar manualmente flujos móviles (drawers, scroll, teclado).

## 11) Build y Despliegue

- Build con Vite.
- Configurado `vercel.json` para SPA fallback a `index.html`.
- PWA habilitada (`vite-plugin-pwa`) con registro `autoUpdate`.

## 12) Seguridad y Datos

- Autenticación y sesión gestionadas por Supabase.
- Cliente usa `persistSession` y `autoRefreshToken`.
- Edge Function `generate-custom-routine`:
  - valida payload de entrada,
  - valida usuario/premium,
  - consume proveedor IA,
  - persiste resultados en Supabase.

> Recomendación: documentar explícitamente políticas RLS por tabla en un documento dedicado de seguridad.

## 13) Guía de Contribución (Nivel Profesional)

### Flujo de trabajo recomendado

1. Crear rama por feature/fix.
2. Commits atómicos y descriptivos.
3. Ejecutar `lint` + `test` antes de PR.
4. Abrir PR con:
   - objetivo de negocio,
   - cambios técnicos,
   - plan de prueba,
   - riesgos/rollback.

### Estándares técnicos

- TypeScript estricto por módulo nuevo (progresivo).
- Evitar lógica compleja en componentes de presentación.
- Hooks para side-effects/acceso a datos.
- Mantener naming consistente por dominio.

## 14) Roadmap para “Nivel Big Tech”

Para acercar el proyecto a estándares de compañías grandes:

1. **ADR (Architecture Decision Records):** decisiones arquitectónicas versionadas.
2. **Observabilidad:** logging estructurado, tracing y dashboards de errores.
3. **CI/CD robusto:** pipelines con gates (lint, test, build, typecheck, bundle budget).
4. **Seguridad SDLC:** SAST, dependencia vulnerable, secret scanning.
5. **Calidad de API:** contrato tipado compartido y validación runtime sistemática.
6. **Performance budget:** métricas Lighthouse/Web Vitals y alertas por regresión.
7. **Documentación viva:** runbooks, onboarding, incident response, ownership por módulo.
8. **Feature flags:** despliegues graduales y rollback operativo.

## 15) Troubleshooting

- **Pantalla en blanco en rutas directas:** verificar rewrite SPA (`vercel.json`).
- **Error de Supabase env:** revisar `.env` y reiniciar dev server.
- **Tipos de Supabase desactualizados:** regenerar `src/integrations/supabase/types.ts`.
- **Problemas con mapas GPS:** validar permisos de geolocalización y contexto HTTPS en producción.

## 16) Licencia

Proyecto bajo **AGPL-3.0** (ver `package.json`).

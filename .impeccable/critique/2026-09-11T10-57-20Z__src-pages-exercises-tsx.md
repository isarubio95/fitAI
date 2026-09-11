---
target: pagina de ejercicios
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
p2_count: 3
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Exercises.tsx"
target_fingerprint: "sha256:575a6a7d5d0425ad5f9d942a84849a6804a6fac37f2e4f822f85d282a3ae5b0b"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Exercises.tsx"
timestamp: 2026-09-11T10-57-20Z
slug: src-pages-exercises-tsx
closed: true
---
Method: dual-agent (A: e85321fe-d734-45d2-820e-8ccb7c2f77e1 · B: 46e13860-60c5-45eb-bf5b-2ac0186bb900)

# Crítica de diseño — Página de ejercicios

**Superficie:** `src/pages/Exercises.tsx` dentro de Biblioteca (`/routines?tab=ejercicios`)  
**Modo:** Operate (catálogo de tarea, no marketing)  
**Nota de evidencia:** el catálogo no se pintó en vivo. Hay sesión, pero `AppLayout` retiene `UsernameSetup` hasta que existe `perfil.username`. La revisión de diseño del listado, filtros, FAB y sheet es por código. El overlay del detector corrió sobre el onboarding de username, no sobre ejercicios.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeletons sí; no hay recuento de resultados; el filtro de dificultad dispara un skeleton falso de 220 ms; el infinite scroll es un sentinel de 1 px; favorito y detalle fallan en silencio. |
| 2 | Match System / Real World | 3 | Vocabulario de gym en español (Grupo, Equipo, Favoritos). Fugas: Tipo, Registro de series, chips «Eq:» / «Dif:», error que cita F12 y Supabase, icono Heart = Pecho junto al Bookmark de favoritos. |
| 3 | User Control and Freedom | 3 | Escape limpia búsqueda; Limpiar + X por chip; cancelar en diálogo/sheet. En móvil, las pestañas del header hacen `setSearchParams({ tab })` y borran `q/tipo/grupo/eq/dif/fav`. El orden no va en la URL. Sin undo de favorito. |
| 4 | Consistency and Standards | 2 | FAB «Crear» (ejercicio) vs sidebar «Crear Nuevo» (entreno) vs Rutinas «Añadir»; thumbs blancos vs sheet en `bg-muted`; Tipo/Grupo/Equipo sin chevron, Dificultad/Orden sí; cierre de diálogo en inglés («Close»); `text-[11px]` en el sheet, fuera de la rampa. |
| 5 | Error Prevention | 2 | Confirmación al borrar y nombre obligatorio al crear. La X de los chips es un SVG de 12 px con `onClick`, no un botón. Fila entera clicable vs bookmark de 36 px. Sin guarda de nombre duplicado. |
| 6 | Recognition Rather Than Recall | 2 | Búsqueda + GIF + chips activos ayudan. La dificultad en la fila es solo barras (`aria-hidden`). ChartBar y User son icon-only. Sin recientes. Tipo vs Grupo se da por sabido. |
| 7 | Flexibility and Efficiency | 2 | El buscador es fuerte (tildes, typos, `nombre_en`, sinónimos) pero invisible. Favoritos y facetas en URL. Sin atajo `/`, sin índice alfabético, sin bulk, sin «añadir a rutina / sesión». |
| 8 | Aesthetic and Minimalist Design | 2 | Chrome de hierro + piloto correcto; luego seis pills, flashes blancos de GIF, FAB encima de Registrar y un muro de ~750 filas. Emojis de músculo y Command genérico de plantilla. |
| 9 | Error Recovery | 2 | Error de catálogo tiene Reintentar; el vacío es texto muted sin CTA (Rutinas vacío sí tiene «Crear Rutina»). El copy de error pide abrir F12. Hidratación del detalle sin mensaje. |
| 10 | Help and Documentation | 1 | El placeholder «Buscar ejercicio...» es la única pista. No explica Tipo vs Grupo, las barras, el bookmark ni qué hace ChartBar. |
| **Total** | | **21/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** El chrome sí es Track Gym: midnight cálido, piloto como señal, cápsula «Crear», pills, español de tú, toolbar sticky bajo header opaco, Biblioteca = Rutinas | Ejercicios. El cuerpo del catálogo es intercambiable con Hevy / Strong / ExerciseDB: búsqueda + facetas horizontales + rail de GIF sobre blanco + bookmark + sheet con pasos numerados. La prueba: el thumb de cada fila usa `bg-white` (`Exercises.tsx`) mientras la bitácora es hierro casi negro; el sheet enseña el mismo medio sobre `bg-muted`. Los iconos Lucide reciclados (Heart = Pecho, la misma mano para bíceps/tríceps) y los Command/Dialog de shadcn rematan la lectura de plantilla. Nada en la lista dice «log this later»: no hay sesión, no hay rutina, no hay «hoy». Los tokens visten un catálogo genérico; el trabajo del producto (plan → registrar) no autoría la composición.

**Deterministic scan:** `impeccable detect --json` sobre `src/pages/Exercises.tsx` salió **limpio** (exit 0, 0 hallazgos). Igual de limpios: `Library.tsx`, `LibraryExercisesSkeleton.tsx`, `MuscleMultiSelect.tsx`. Un advisory en markup relacionado: `design-system-font-size` — `text-[11px]` en `ExerciseDetailSheet.tsx:45` (`MetaRow`), 1 px por debajo de `label` (0.75rem / 12px) de DESIGN.md. El detector no marcó el muro de filtros, el FAB, ni los thumbs blancos: no son anti-patrones de su set. Donde LLM y detector coinciden: la rampa tipográfica del sheet está rota. Donde el detector no llega: especificidad de producto, carga cognitiva y el callejón sin salida hacia registrar.

**Visual overlays:** la inyección de `detect.js` **sí corrió** en una pestaña nueva etiquetada `[Human]`, pero **no sobre el catálogo**. La URL `/routines?tab=ejercicios` cayó en «Nombre de usuario». Ahí el overlay marcó 1 anti-patrón de página: `layout-transition` (`transition: height` en `body`). Eso es evidencia off-target; no atribuirlo a ejercicios. El live-server (puerto 8400) ya está parado.

## Overall Impression

Es un catálogo competente con piel de bitácora, no un instrumento para elegir un movimiento y usarlo. La búsqueda es el verdadero producto; el resto (seis pills, FAB Crear, GIFs en papel blanco, sheet sin «añadir») compite con ella. La mayor oportunidad: convertir el final del flujo en **usar** el ejercicio (rutina o sesión), no en cerrar un sheet o crear otro más.

## What's Working

1. **El buscador está pensado para el dedo.** Campo `h-12`, `inputMode="search"`, query diferida para que el teclado gane al reduce de ~750 filas, Escape + X para borrar, debounce de URL a 180 ms, y un matcher serio (tildes, typos, inglés, sinónimos). Eso es específico de Track Gym aunque la UI no lo anuncie.
2. **Las facetas entienden PWA.** Un scroller horizontal que recorta el último chip a propósito, badges de recuento, chips removibles y «Limpiar». El skeleton (`LibraryExercisesSkeleton`) copia búsqueda + pills + thumbs para que el primer paint no salte.
3. **Estados de operate en sheet y borrado.** Pasos numerados con discos piloto; AlertDialog «Esta acción no se puede deshacer»; trash con `stopPropagation`. Hay confirm/cancel, no solo la lista feliz.

## Priority Issues

### [P1] El catálogo es un callejón sin salida para el trabajo de Operate
- **What:** Encontrar → entender → favorito/crear está implementado; **usar** no. Ni la fila ni `ExerciseDetailSheet` ofrecen «Añadir a rutina», «Usar en sesión» o «Registrar».
- **Why it matters:** El usuario canónico (gym, manos ocupadas) tiene que memorizar el nombre y salir por Registrar. Viola el principio de producto «ejecución antes que conversación».
- **Fix:** Una acción primaria en el sheet (y un overflow en la fila): *Añadir a rutina* / *Añadir a la sesión abierta*. Favorito secundario. «Crear» no puede ser la historia del thumb-zone.
- **Suggested command:** `$impeccable shape` (flujo pick → use) y luego `$impeccable layout`

### [P1] Seis pills sticky + FAB Crear roban la primaria
- **What:** En teléfono: header Biblioteca + Rutinas/Ejercicios + búsqueda + card de filtros (Favoritos, Tipo, Grupo, Equipo, Dificultad, Orden) + cápsula «Crear» encima de la nav Registrar. Los filtros miden `h-9` (36 px). La lista —el motivo de la pantalla— empieza tarde.
- **Why it matters:** Carga cognitiva alta (5 fallos del checklist). El CTA del pulgar es crear un ejercicio, no encontrarlo. Dos cápsulas piloto (Crear + Registrar) se pisan.
- **Fix:** Viewport por defecto = búsqueda + lista. Meter Tipo/Grupo/Equipo/Dificultad/Orden detrás de un solo chip **Filtros** (badge = recuento). Crear al overflow del header o al empty state. Nunca una segunda cápsula piloto sobre Registrar.
- **Suggested command:** `$impeccable distill` y `$impeccable layout`

### [P2] Los thumbs GIF blancos rompen la bitácora
- **What:** Rail `w-28` con `bg-white` frente a cards de hierro; el sheet usa `object-contain bg-muted`.
- **Why it matters:** En el gym, cada fila es un flash de papel ExerciseDB. La especificidad de Track Gym se queda en el chrome.
- **Fix:** Misma superficie que el sheet (hierro/muted, contain, sin rectángulo de papel). El demo es un diagrama del instrumento, no una foto de stock.
- **Suggested command:** `$impeccable quieter` (apagar el blanco) o `$impeccable polish`

### [P2] Estado y recuperación a medias
- **What:** Sin «n de ~750»; `triggerDifficultyLoading` sustituye la lista por 8 skeletons 220 ms; load-more invisible; vacío sin CTA; error que cita F12 y Supabase. Overlay en vivo no pudo verificar estos estados (gate de username).
- **Why it matters:** El usuario no sabe si el catálogo cargó, cuánto queda, ni qué hacer si no hay resultados. El skeleton falso se siente a bug.
- **Fix:** Recuento persistente; filtrar sin reload teatral; empty con Limpiar + Crear; error «No se pudo cargar el catálogo» + Reintentar, sin consola.
- **Suggested command:** `$impeccable harden` y `$impeccable clarify`

### [P2] Fugas de control y consistencia
- **What:** `HeaderSectionTabs` borra las facetas al cambiar de pestaña (`setSearchParams({ tab })`). Tres verbos de crear. ChartBar y bookmark del sheet a 20 px; X del chip a 12 px. Sort no está en la URL. `MetaRow` a 11 px (detector). Diálogo «Close» en inglés.
- **Why it matters:** Casey pierde la búsqueda al ir a Rutinas y volver. Alex pierde el orden al refrescar. Sam no tiene target ni rampa.
- **Fix:** Preservar params como hace `Library.tsx`. Renombrar o esconder el FAB. Targets 44 px. `sr-only` en español. Persistir `orden`. Subir el label del sheet a `text-xs` / 12 px.
- **Suggested command:** `$impeccable harden` y `$impeccable audit`

## Persona Red Flags

**Casey (móvil, gym, una mano):** búsqueda y pills arriba; el pulgar aterriza en Crear + Registrar. Scroller horizontal + popovers Command. X de 12 px. GIFs del catálogo en wifi de gym. Gate de username antes de todo esto (lo único verificado en vivo).

**Alex (power user de Strong/Hevy):** buscador excelente sin `/` para enfocar, sin salto alfabético, sin recientes, sin bulk. No puede añadir a rutina/sesión desde la fila —el gesto de Strong. Skeleton falso de dificultad. Dos «crear». Sort muere al refrescar.

**Jordan (primera vez):** después del username, un muro sin «qué hago aquí». Tipo vs Grupo vs Equipo sin explicación. Barras sin Baja/Media/Alta en la fila. Bookmark ≠ corazón esperado; Heart es Pecho. «Registro de series» en Crear sin ejemplo. Empty sin siguiente tap.

**Isaías (híbrido, manos ocupadas, español, elegir rápido para registrar después):** tildes y sinónimos están bien. No hay camino a registrar desde esta página —su acción primaria. Grupo (lo de hoy) es el modelo mental correcto, enterrado en un rail de 6 chips. El username de comunidad antes del rack es el primer beat equivocado.

## Cognitive Load

5 fallos del checklist → **alta**. Fallan: single focus, chunking, visual hierarchy, one thing at a time, minimal choices. Pasan: grouping, working memory (en la página; se rompe al cambiar de tab en móvil), progressive disclosure de *valores* (no de dimensiones).

Puntos de decisión con >4 opciones: rail de 6 filtros; Equipo ~24; Grupo/Tipo = todos los valores del catálogo; MuscleMultiSelect ~11 grupos / ~37 músculos.

## Emotional Journey

Valle de entrada (vivo): username de comunidad antes del catálogo del gym. Al abrir: sin recuento, chrome sticky, muro. El buscador es el primer alivio si ya saben el nombre. Las filas pueden picar por el GIF y bajar por el flash blanco. El sheet es el pico de comprensión; el final es cerrar y volver al muro —peak-end flojo. La única apuesta alta tratada como irreversible es borrar; la apuesta real (*¿voy a registrar el movimiento correcto?*) no tiene reassurance ni siguiente acción.

## Minor Observations

- `DifficultyBars` duplicado; en lista sin alternativa de texto.
- Ejercicios propios: icono User sin etiqueta + trash + `border-primary/30`.
- Chips activos: «Eq:» / «Dif:» —telégrafo, no tú.
- Título «Crear Ejercicio» vs botón visible «Crear».
- `scrollTo` en cada cambio de query/sort —brusco a mitad de lista.
- FAB también en desktop (`md:bottom-10`); DESIGN quiere el CTA en la sidebar, no un FAB.
- Badges de músculo con emoji 💪.
- `MUSCLE_GROUP_ICON_SRC` (SVGs Lyfta) existe y no se usa en las filas.
- Overlay `layout-transition` en el onboarding de username: no es de esta superficie.

## Questions to Consider

- Si el trabajo es *elegir un movimiento para registrar*, ¿por qué la única cápsula piloto es **Crear** y no **Usar**?
- ¿Y si la primera pantalla fuera *un grupo muscular* (o «lo de hoy») y el muro de 750 fuera solo búsqueda?
- ¿El catálogo se sentiría Track Gym si cada thumb viviera sobre hierro y el sheet terminara en «Añadir a la sesión»?
- ¿Debe Biblioteca ser dueña de crear-ejercicio, o eso es un overflow cuando la búsqueda no encuentra?
- ¿Por qué un username de comunidad tiene que ocurrir antes de poder mirar levantamientos?

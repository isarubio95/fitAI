---
target: cards de entrenamientos realizados
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\dashboard\\WeekCalendar.tsx"
target_fingerprint: "sha256:70fad7c5f4f87b03e5ad73550e306945a52898981e19fb1b0aea36699ee086a8"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\dashboard\\WeekCalendar.tsx"
timestamp: 2026-09-11T11-33-33Z
slug: src-components-dashboard-weekcalendar-tsx
closed: true
---
# Crítica de diseño — Cards de entrenamientos realizados

**Superficie:** filas «Entrenamientos realizados» del panel expandido del calendario (`src/components/dashboard/WeekCalendar.tsx`; duplicado en `MonthlyPlanner.tsx`) dentro de Inicio (`/`)  
**Modo:** Operate (confirmar el log del día → abrir / editar / borrar)  
**Nota de evidencia:** Assessment A cayó en UsernameSetup y no vio las cards. Assessment B sí las vio en sesión (390×844): «Día B · Tobillo», «8 ejercicios · 27 series», Ver detalles / Editar / Eliminar. El overlay de `detect.js` **no** corrió sobre esas filas: la inyección con éxito fue en `/auth` (login). Live-server parado.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Con datos, título + volumen se leen; el bloque no existe si hay 0; sin skeleton; al borrar se cierra el día. |
| 2 | Match System / Real World | 2 | Copy de gym («ejercicios · series») sí; toolbar Eye/Pencil/Trash es escritorio; oculta gym, hora, RPE, icono. |
| 3 | User Control and Freedom | 3 | AlertDialog con Cancelar; sin undo; el tap de fila no existe; Escape del diálogo sí. |
| 4 | Consistency and Standards | 2 | Feed = fila pulsable; aquí = ticket con 3 ghosts. Cardio tiene pictograma; fuerza, franja. Markup clonado Week/Month. |
| 5 | Error Prevention | 2 | Confirmación nombra título y series. Trash `h-7 w-7` a `gap-2` del Eye invita al tap erróneo. |
| 6 | Recognition Rather Than Recall | 2 | Iconos solo con `title` (hover). En táctil hay que recordar ojo vs lápiz. Sin `aria-label`. |
| 7 | Flexibility and Efficiency | 2 | Ni tap-fila ni swipe (`SwipeToDeleteRow` vive en el logger). Sin atajo, sin bulk. |
| 8 | Aesthetic and Minimalist Design | 2 | `border-l-4` + card anidada + tres ghosts iguales + `text-[11px]`. Detector: side-tab. |
| 9 | Error Recovery | 2 | Toast «Entrenamiento eliminado correctamente» (usted, no tú); sin undo; el panel se cierra. |
| 10 | Help and Documentation | 1 | Solo `title` hover. Cero ayuda en el punto de decisión (ver vs editar vs destruir). |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Es una fila CRUD de calendario, no una entrada de bitácora. `rounded-md` + `bg-card` + `border` + `border-l-4 border-l-primary/85` + título truncado + meta + toolbar ghost: Hevy/Strong/Jira podrían usarla sin cambiar la composición. Lo que Track Gym ya sabe del modelo (`icono`, `gimnasio_nombre`, `rpe`, `fecha_fin`) no está en la card; el feed sí usa `GymStartMetaRow` y trata la sesión como un `<button>` a ancho. Cardio del mismo panel tiene cara (`resolveCardioSessionIcon` + `chart-fitness`); fuerza es una franja piloto al 85%. El markup está clonado en semana y mes. Los tokens visten un ticket de admin.

**Deterministic scan:** `impeccable detect --json` sobre WeekCalendar y MonthlyPlanner: **9 + 9 hallazgos**, exit code **0** (el proceso no usa 2 = findings). Por archivo: 3 `side-tab` (warning) y 6 `design-system-font-size` (advisory, `11px`). **On-target (realizados):** `border-l-4` en WeekCalendar:378 / MonthlyPlanner:388; `text-[11px]` heading 369/379 y meta 382/392. El resto es el mismo patrón en «Programado» y «Cardio realizado» (fuera del phrasing, mismo slop). Donde LLM y detector coinciden: la franja lateral es el tell de UI generada, y 11px está bajo el piso `label` 12px de DESIGN.md. El detector no vio los 28px, los icon-only, ni el tap de fila: no están en su set.

**Visual overlays:** no hay overlay fiable sobre las cards. La inyección con `detect.js` onload + `window.impeccableScan === true` corrió en **`/auth`** (login: «Bienvenido a Track Gym»). Consola: `[impeccable] 2 anti-patterns found` — `radial-spotlight-glow`, `layout-transition` (`transition: height`). Eso es off-target; no atribuirlo a las filas. Un intento MCP sobre el calendario falló (`ERR_CONNECTION_REFUSED` / tab cerrada). Live-server (8400, PID 11688) se paró. Vite 8080 se dejó como estaba.

## Overall Impression

La card confirma que el entreno existe (título + volumen) y luego gasta el pulgar en tres bisturís. El trabajo de Operate —«¿entrené hoy? ábrelo»— está enterrado detrás de un Eye de 28px. La mayor oportunidad: una fila de bitácora táctil (tap = detalle, overflow/swipe = editar/borrar), hierro plano, sin franja de plantilla.

## What's Working

1. **La meta de diario es la correcta.** «8 ejercicios · 27 series» (visto en vivo: Día B · Tobillo) es el dato que Isaías reconoce al instante. No es un sparkline de SaaS.
2. **El borrado habla claro.** «¿Eliminar este entrenamiento?» + se borrará `"{titulo}"` y todas sus series + «no se puede deshacer» + Cancelar / Eliminar danger. Stakes de bitácora, no un toast mudo.
3. **Los hermanos del panel tienen semántica.** Piloto / fatigue / `chart-fitness` separa fuerza, plan y ruta. Es la única señal de producto en un patrón por lo demás genérico.

## Priority Issues

### [P1] Cluster Eye / Pencil / Trash a 28px junto a un borrado irreversible
- **What:** Tres `Button variant="ghost" size="icon" className="h-7 w-7"` (iconos `h-3.5 w-3.5`). El `size="icon"` del sistema es `h-10 w-10`. Trash con `hover:text-destructive` a `gap-2` del Eye. Visto en vivo como «Ver detalles / Editar / Eliminar».
- **Why it matters:** Bajo 44pt / 48dp. Un pulgar en el rack puede abrir el diálogo de borrar el diario. El confirm salva el tap, no el miedo. `title` no existe en táctil.
- **Fix:** Hit area de fila → detalle. Editar/borrar en overflow o swipe (`SwipeToDeleteRow` ya existe en el logger). Trash fuera de la fila o ≥48px. `[data-pressed]`, no hover pegajoso.
- **Suggested command:** `$impeccable adapt`

### [P1] La fila no es la acción; la toolbar sí
- **What:** El `<div>` de la card no es pulsable. Hay que acertar el icono. En `WorkoutFeedCard` la misma sesión es un `<button>` con `aria-label={Ver detalle de ${titulo}}`.
- **Why it matters:** Casey/Isaías quieren confirmar y abrir. Alex espera el tap de Strong. Jordan no distingue ojo de lápiz. Viola «ejecución antes que conversación» en el historial.
- **Fix:** Fila entera → `WorkoutDetailsSheet`. Quitar los tres ghosts permanentes. Un menú o swipe para el resto.
- **Suggested command:** `$impeccable distill`

### [P1] Ticket anidado + franja side-tab + 11px (detector de acuerdo)
- **What:** `rounded-md border border-l-4 border-l-primary/85 bg-card py-2`. Heading y meta `text-[11px]`. `space-y-1.5`. Clon Week 367–424 / Month 376–432. Detector: `side-tab` + `design-system-font-size`.
- **Why it matters:** Nested Flat Rule (card-en-card con borde y fondo). Pilot Rule (franja /85 es lavado, no piloto). Piso tipográfico 12px. Se lee Material de plantilla, no hierro.
- **Fix:** Aplanar (sin `bg-card` ni caja). Señal de fuerza = `GymWorkoutIcon` / `icono` de la sesión, no una barra. Tipo ≥ `text-xs`. Un solo componente compartido.
- **Suggested command:** `$impeccable layout`

### [P2] Sin vacío, sin loading; el borrado cierra el día
- **What:** El bloque solo monta si `expandedWorkouts.length > 0`. Tras `mutateAsync`, `setExpandedDayKey(null)` (y en mes también `setExpandedWeekIndex(null)`). Toast en formal de usted.
- **Why it matters:** Día sin gym = la sección no existe. Tras borrar un fuerza, Isaías pierde el cardio del mismo día. Peak-end flojo.
- **Fix:** Dejar el día abierto. «Eliminando…» en el Action. Copy tú: «Se borró el entreno». Vacío de una línea si el día no tiene fuerza.
- **Suggested command:** `$impeccable harden`

### [P2] Icon-only sin nombre; handlers de drag incoherentes
- **What:** Solo `title`. Cero `aria-label`. `openEdit` / `openWorkoutDetails` no-op si `isDragMode`; Trash no está gated a ese nivel (el widget sí pone `pointer-events-none` en el cuerpo, así que en Inicio las tres mueren juntas —el código sigue mintiendo).
- **Why it matters:** Sam oye «button» tres veces. El foco es 28px.
- **Fix:** `aria-label` con el título. Si hay toolbar, deshabilitar las tres en drag de forma explícita.
- **Suggested command:** `$impeccable audit`

## Persona Red Flags

**Casey (móvil, gym, un pulgar):** tres targets 28px a la derecha; Trash al lado del Eye; `title` inútil; la fila no es tap; hover destructive se puede quedar en WebView.

**Alex (Strong/Hevy):** espera tap-fila → sesión. El Eye es un atajo escondido. Sin swipe, sin tecla, sin bulk. Tres iconos iguales no son aceleradores.

**Jordan:** heading uppercase 11px «ENTRENAMIENTOS REALIZADOS»; tres iconos mudos; si el día no tiene fuerza, la sección desaparece y el siguiente beat es Fuerza | Cardio (`StartSessionActions`) —no dice que el log está vacío.

**Sam:** icon-only, sin nombre accesible, franja de color como única distinción fuerza/plan/ruta. El diálogo de delete sí es razonable.

**Isaías (híbrido):** quiere *hoy* gym + ruta. Fuerza no muestra gym/hora/RPE/`icono`. Cardio tiene pictograma. Borrar un gym cierra el panel y se lleva la ruta del mismo día.

## Cognitive Load

5 fallos del checklist → **alta**. Fallan: single focus, visual hierarchy, one thing at a time, working memory, progressive disclosure. Pasan: chunking (título + volumen), grouping (bloque con heading), minimal choices *dentro de una sola card* (3 iconos).

Punto de decisión >4: un día híbrido (1 fuerza + 1 programado pendiente + 1 cardio + `StartSessionActions`) expone 3+3+3 iconos + Iniciar + Fuerza + Cardio ≈ **11 acciones**. La pregunta «¿entrené hoy?» no es un menú.

## Emotional Journey

Pico esperado: abro hoy → «sí, quedó apuntado». Valle: tres bisturís del mismo tamaño, Trash en peligro a 28px del Eye. El diálogo de borrado es el único momento de bitácora. El final lo rompe: éxito cierra el panel; el toast formal llega cuando ya no hay día. Peak-end flojo.

## Minor Observations

- Duplicado casi literal Week/Month; el copy de cardio *sí* diverge (Month menciona bloques/track).
- `[&_svg]:size-4` del Button pelea con `h-3.5 w-3.5`.
- Toast: «Entrenamiento eliminado correctamente» — usted, no tú.
- `0 ejercicios · 0 series` es un estado posible y no está diseñado.
- Título `truncate` sin segunda línea ni tooltip táctil.
- Programado tiene primaria «Iniciar»; realizados no tienen primaria (el detalle es un ghost).
- `px-5 py-3` del panel está más cerca del ritmo 8/16/20/24; las cards internas no (`py-2`, `mb-1.5`).
- Overlay `radial-spotlight-glow` / `layout-transition` en `/auth`: no es de esta superficie.
- `side-tab` en Programado (Week:447 / Month:454) y Cardio (512 / 524): mismo slop, fuera del phrasing.

## Questions to Consider

- Si el éxito es «¿entrené hoy?», ¿por qué la fila gasta más ancho en iconos que en el entrenamiento?
- ¿Por qué el feed trata la sesión como un solo tap y el calendario la trata como un ticket de Jira?
- Si fuerza y cardio son un solo diario, ¿por qué solo la ruta tiene cara y el gym es una franja verde?
- ¿El borrado debe sentirse como «quitar un log del día» o como «cerrar el día»?
- ¿Hace falta ver, editar y destruir a la vez, o eso es miedo de esconder acciones?

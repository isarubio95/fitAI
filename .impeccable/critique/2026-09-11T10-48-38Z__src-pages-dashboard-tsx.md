---
target: inicio
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Dashboard.tsx"
target_fingerprint: "sha256:b490fc2759e50c8e35c203c00fa2feb5e279e9b69df1e67ac875e0735f3e5f2a"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Dashboard.tsx"
timestamp: 2026-09-11T10-48-38Z
slug: src-pages-dashboard-tsx
---
# Critique: Inicio

Target: `src/pages/Dashboard.tsx` (ruta `/`). Operate. Phone-first.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons y `aria-pressed` de reordenar están bien; widgets vacíos hacen `return null` y el estado desaparece. Los días solo anuncian `Día N`. |
| 2 | Match System / Real World | 3 | Copia en tú y calendario en lunes. El CTA del día es «Nuevo entrenamiento» + icono de gym; el producto es híbrido. «Fuerza Máxima» vs «1RM Estimado». |
| 3 | User Control and Freedom | 3 | Cancel en borrados, Check sale del drag. Borrar el plan entero no tiene deshacer. Reordenar no tiene reset. |
| 4 | Consistency and Standards | 2 | Dos gramáticas de empezar: Registrar (Fuerza/Cardio) vs «Nuevo entrenamiento» (solo gym). «Editar plan» es el botón del header y el diálogo del día. Seis `border-l-4` tipo side-tab en filas de sesión. |
| 5 | Error Prevention | 3 | Confirmaciones de plan/sesión; el drag congela widgets. Eye/Pencil/Trash a 28px invitan al tap erróneo. |
| 6 | Recognition Rather Than Recall | 2 | El día entrenado sustituye el número por un icono, sin leyenda. Reordenar es solo `ArrowUpDown`. La racha usa el mismo naranja que los días programados. |
| 7 | Flexibility and Efficiency | 2 | Reordenar widgets y Mes/Semana persistido. No hay atajo «entrenar lo de hoy». Default mes. |
| 8 | Aesthetic and Minimalist Design | 2 | Cuatro cards al mismo peso. 39 `text-[Npx]` fuera de la rampa de DESIGN.md. El mes entero compite con «hoy». |
| 9 | Error Recovery | 3 | Toasts + Cancel. Fallos pueden mostrar `e.message` crudo. El delete-all es irreversible a propósito. |
| 10 | Help and Documentation | 2 | Un popover de 1RM. Sin leyenda de calendario, sin empty-state que enseñe, reordenar sin copy hasta que lo pulsas. |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Los instrumentos (forma/recuperación, código gym-verde / cardio-azul / plan-ámbar, Registrar Fuerza/Cardio) están escritos para Track Gym. La *composición* de Inicio es un stack de widgets de fitness intercambiable: grid mensual, barra de XP, racha, chart de 1RM, icono de reordenar. El título es «Inicio», no «hoy». La bitácora de ruta pediría la sesión de hoy primero; esto es un dashboard de módulos.

**Deterministic scan:** `impeccable detect` sobre `Dashboard.tsx` + `src/components/dashboard`: **45 hallazgos**, 2 reglas, 15 archivos. `Dashboard.tsx` en sí: 0. 39× `design-system-font-size` (advisory: `text-[10px|11px|13px|15px|52px]`) y 6× `side-tab` (warning: `border-l-4` en `MonthlyPlanner.tsx` L373/439/509 y `WeekCalendar.tsx` L361/430/495). Ningún match es falso positivo mecánico. El 52px del `ZoneGauge` y los 10–11px de microcopy son hits reales del matcher; varios 10px coinciden con el label de nav descrito en prosa, pero el frontmatter de DESIGN.md fija label en 0.75rem. El detector no vio el vacío de «hoy» ni el CTA solo-gym: eso es juicio de A.

**Visual overlays:** Inyección mutable y `detect.js` **sí** corrieron, pero sobre el muro «Nombre de usuario», no sobre Inicio. Overlay visible en esa pantalla: 1× `layout-transition` en `body` (`transition: height`) — **no atribuible a Inicio**. No hay overlay fiable sobre el dashboard. Fallback: scan CLI del markup + revisión de código.

## Overall Impression

Inicio ya tiene la voz de bitácora *dentro* del día expandido y en «Tu forma hoy». El primer viewport, en cambio, es un mes de fichas y tres widgets que no empiezan el entreno. El mayor hueco: **hacer de «hoy» el producto**, no el calendario de septiembre.

## What's Working

1. **El día expandido es la bitácora de verdad** — fecha, hechos / programado / cardio, Iniciar, confirms. Gym vs cardio vs plan se lee en fill + icono, no en una segunda piel.
2. **Tu forma hoy / Tu recuperación** — consejo en tú, hit target de card entera, drawers diferidos. Es el North Star cuando llegas a ellos.
3. **Chrome finger-first** — Registrar en el pulgar; handle de drag aislado; label de plan reservado para no hacer CLS; skeleton del calendario mientras carga.

## Priority Issues

### [P1] No hay «Hoy»; el default es el mes
`loadCalendarView` arranca en `"month"`. Hoy no se expande. Iniciar lo planificado exige tap en un disco.
- **Why it matters:** En el gym, con el teléfono, hace falta hoy, no 35 días.
- **Fix:** Default Semana; auto-expandir hoy; un CTA piloto «Entrenar hoy · {rutina}» en el primer viewport. El mes vive en el period picker.
- **Suggested command:** `$impeccable layout`

### [P1] El panel del día no puede empezar cardio
«Nuevo entrenamiento» siempre abre gym (`openNew`). Cardio solo existe en Registrar → Cardio. El wizard es solo rutinas.
- **Why it matters:** Rompe el diario único para quien hoy toca ruta.
- **Fix:** Acciones del día = Fuerza | Cardio (misma gramática que la nav), o un sheet Registrar compartido. O decir en copy que el plan no cubre cardio.
- **Suggested command:** `$impeccable clarify`

### [P1] Cuatro widgets al mismo peso entierran el trabajo
XP y el chart de 1RM son cards de primera. Las dos gauges ya piden una decisión. El mes ocupa el fold.
- **Why it matters:** Casey no llega a la forma; Alex ignora el XP. Nadie tiene un héroe.
- **Fix:** Primera pantalla = semana/hoy + forma. Racha como chip de header. Fuerza Máxima en Tú / Evolución, o colapsada.
- **Suggested command:** `$impeccable distill`

### [P2] El calendario es un código sin leyenda
El día entrenado pierde el número. No hay key verde / azul / ámbar. `aria-label` omite estado. La racha comparte naranja con lo programado.
- **Why it matters:** De un vistazo entre series no se lee.
- **Fix:** Conservar el número; badge el icono. Leyenda de tres palabras. Token distinto para racha.
- **Suggested command:** `$impeccable harden`

### [P2] Acciones solo-icono y por debajo de 44px
Reordenar es `ArrowUpDown` sin label. Eye/Pencil/Trash e Iniciar van a 28px. Seis filas usan `border-l-4` de acento (detector).
- **Why it matters:** Manos ocupadas, pulgar, reordenar accidental parece un home roto.
- **Fix:** Targets 44px; Iniciar filled; overflow para editar/borrar; label cuando `aria-pressed`; retirar side-tabs a favor de icono + fill ya existentes.
- **Suggested command:** `$impeccable polish`

## Persona Red Flags

**Alex (Power User):** No hay atajo a lo de hoy; el poder es reordenar. Extra tap Mes→Semana. El camino rápido real es Registrar → Fuerza; el calendario es turístico. Wizard: 7 selects. El popover de Epley en Home es ruido.

**Casey (Distracted Mobile):** Iniciar está a media card, 28px, tras un tap preciso. Solo Registrar es thumb-primary. Eye/Pencil/Trash a 28px. El mes es un muro de discos de 32px. El expand se pierde al salir. Header: 4 iconos; reordenar al lado de la campana.

**Héctor (híbrido gym + ruta, teléfono en el gym):** El split de color es la idea correcta. No puede empezar una ruta desde el día. El plan es solo gym. En un día hecho desaparece el número. El consejo de forma no distingue gym vs ruta.

**Sam (a11y, solo código):** En coarse se anulan los anillos de foco. Nav `focus:outline-none`. Días: `Día 11` sin mes, hoy ni actividad. Eye/Pencil/Trash con `title`, no `aria-label`. El significado va en color+icono (no solo color).

## Minor Observations

- Muro post-auth «Nombre de usuario» tapa Inicio en esta sesión de browser; no es un P0 de layout del dashboard.
- `PAGE_CARD` es `rounded-2xl` en móvil vs card 24px del sistema.
- `WeekDayDetail.tsx` no se usa; month/week duplican ~500 líneas.
- Filas `bg-card` anidadas dentro de la card del calendario (Nested Flat).
- Toasts con error crudo.
- `Plus` importado y no usado en `Dashboard.tsx`.
- `CalendarPeriodPicker` es un segundo calendario encima del calendario.
- Sidebar desktop con blur: desviación conocida del chrome opaco.
- Inicio vacío puede ser solo la card del calendario, sin coaching al primer log.
- 39 tallas arbitrarias (`text-[11px]` etc.) frente a la rampa de DESIGN.md.

## Questions to Consider

- Si Inicio fuera solo **esta semana + forma**, ¿qué perdería Héctor entre series?
- ¿Por qué empezar es un verbo de la nav y entender hoy es un scroll de cuatro widgets?
- ¿Nivel/XP es diario o una capa de juego que compite con «¿entreno ahora?»
- ¿El único botón piloto filled de esta pantalla debería ser **Iniciar {rutina de hoy}**?
- Si el cardio no cabe en el plan, ¿el panel del día debería dejar de fingir que es toda la bitácora?

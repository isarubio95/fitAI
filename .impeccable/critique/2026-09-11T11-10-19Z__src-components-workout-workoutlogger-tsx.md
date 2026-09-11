---
target: entrenamiento activo
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\workout\\WorkoutLogger.tsx"
target_fingerprint: "sha256:81ddb1231e820f070a8ea6860043a8ced32acb44e306b9fe3589baefdca6d3c2"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\workout\\WorkoutLogger.tsx"
timestamp: 2026-09-11T11-10-19Z
slug: src-components-workout-workoutlogger-tsx
---
# Crítica de diseño — Entrenamiento activo

**Superficie:** `src/components/workout/WorkoutLogger.tsx` (drawer global; no es una ruta)  
**Modo:** Operate (el formulario de la sesión es el producto)  
**Nota de evidencia:** ni A ni B vieron el logger en vivo. `http://localhost:8080/` cae en `UsernameSetup` («Nombre de usuario»). No se escribió un username (persistiría en Supabase). Overlay del detector: UsernameSetup, no el drawer. Revisión del logger, la ficha, la barra flotante, el descanso y el resumen: por código.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Reloj, pausa y toasts existen; autosave silencioso; `Finalizar` disabled sin motivo; descanso sin live region |
| 2 | Match System / Real World | 3 | Peso×reps, Anterior, español de tú; RIR sin glosa; «Hecho» ≠ serie con datos; ritmo en s/km |
| 3 | User Control and Freedom | 2 | No hay Minimizar; la X borra; el descanso no se cierra; uncheck no para el timer; swipe-delete de serie sin undo |
| 4 | Consistency and Standards | 2 | `Finalizar` cápsula vs CTA 12px; vidrio en la pill de sesión; 7 tallas 9–11px fuera de rampa; `RestTimerPill` muerta vs barra de header |
| 5 | Error Prevention | 2 | Confirm al borrar entreno/ejercicio; vacío se borra sin diálogo; Hecho a 0/0 arranca 120s; autosave swallow |
| 6 | Recognition Rather Than Recall | 2 | Anterior ayuda; seed parece serie hecha; swipe solo en `sr-only`; Info/Chart/Trash/Opciones/X solo icono |
| 7 | Flexibility and Efficiency | 2 | Reorder por teclado; ni atajo de Hecho/Finalizar/añadir serie; ni complete-all |
| 8 | Aesthetic and Minimalist Design | 2 | Cards flush bien; header de ficha abarrotado; glow 212→28 del rest; checkbox orbe; bounce en swipe |
| 9 | Error Recovery | 2 | Toasts con `error.message`; persist swallow; undo solo en sobrecarga; swipe-delete irreversible |
| 10 | Help and Documentation | 2 | Empty de una línea; RIR/Hecho/Finalizar sin ayuda; Info es ficha de ejercicio, no del logger |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** El chrome del drawer sí es Track Gym: a sangre (`rounded-none`), cards planas (Nested Flat), gym/RPE/comunidad aplazados al resumen, español de tú, `Anterior` + seed, haptic en el check, `handleOnly` en Vaul. El cuerpo de la serie es intercambiable con Strong/Hevy: n.º · Anterior · Reps · Peso · check, «Agregar Serie», grip, trash, badges de descanso/RIR. La north star pide **la pill de descanso como único cristal flotante**. `RestTimerPill` existe y **no está montada** en `AppLayout` ni en `WorkoutLogger`. El descanso vivo es `RestProgressBar`: barra de 10px, interpolación de tono 212→28, glow `box-shadow: 0 0 8px`. Eso es LED de fitness-app, no instrumento de bitácora. Más fugas: `Finalizar` `h-12 rounded-full` (rompe Capsule Signal); `ActiveWorkoutPill` copia cristal + hover scale/glow (segunda pieza de vidrio; DESIGN solo permite la de descanso); el checkbox es orbe con gradiente 43° (Dribbble, no hierro). La cápsula flotante del logger (`ACTIVE_WORKOUT_FLOATING_SHELL`) sí es opaca (`surface-float bg-card`); el vidrio no está ahí.

**Deterministic scan:** `impeccable detect --json src/components/workout` → **13 hallazgos**, exit 0 (warnings/advisories, sin `error`). 1 `layout-transition` (`ActiveWorkoutCheckbox.css:47`, `transition: width, height`); 1 `bounce-easing` (`SwipeToDeleteRow.tsx:75`); 7 `design-system-font-size` (9–11px: checkbox-adjacent `ExerciseCard` 9px y 10px, `ActiveWorkoutPill` 10px, `RestTimerPill` 10px, `ElapsedTime` 10px, `RestProgressBar` 10px, `PostWorkoutModal` 11px); 3 `design-system-color` (rgba negro del tick; `hsl(152 70% 42%)` en RestProgressBar); 1 `design-system-radius` (`border-radius: 2px` del tick). El detector no ve el componente de descanso desmontado ni la X que borra: no son anti-patrones de su set. Donde LLM y detector coinciden: el checkbox es un gadget (layout-transition + radio 2px + rgba); la rampa tipográfica del logger está rota; el rest usa un verde hardcodeado. FP plausible: el `hsl(152…)` del «¡Listo!» vs la excepción de cristal del rest — igual es color fuera de token, no la pill de DESIGN. Overlay en vivo: **no atribuir** el `layout-transition` de `body` al logger.

**Visual overlays:** inyección de `detect.js` **sí corrió** en pestaña **[Human]** (`http://localhost:8080/`, live-server :8400, luego parado). Banner `LAYOUT PROPERTY ANIMATION / transition: height`. Pantalla real: «Nombre de usuario» / Continuar. **Off-target.** No hay overlay fiable sobre entrenamiento activo.

## Overall Impression

Es el formulario correcto aplazando la bitácora social, vestido con un grid de logger genérico y un instrumento de marca que no está en escena. La mayor oportunidad: una serie = reps + peso + Hecho ≥44px, descanso como pill que se puede apagar, y una X que minimiza en vez de destruir.

## What's Working

1. **Ejecución antes que conversación, de verdad.** En sesión activa, `WorkoutMetaForm` oculta título/fecha/gym/RPE/comunidad. El lienzo es la lista. Eso es el principio de producto, no un skin.
2. **«Anterior» + seed.** `formatPreviousSet` y `seedSetFromPrevious` (última sesión o `objetivo_peso_kg` de rutina) son el acelerador canónico de gym: un pulgar, menos teclado.
3. **Gesto vs drawer resuelto en código.** `handleOnly` + `data-vaul-no-drag` + umbral 144px. La ficha flush / radio 0 dentro del drawer cumple Nested Flat. Las cápsulas de la barra flotante son opacas, no cristal.

## Priority Issues

### [P1] No hay Minimizar; la X destruye la sesión
- **What:** `WorkoutFloatingActionBar` pone un ghost 48px `text-destructive` con icono `X` y `aria-label="Cancelar entrenamiento"`. Vacío (`exercises.length === 0`): `requestDeleteWorkout` → `handleDelete` sin diálogo. Con series: «¿Borrar este entrenamiento?». El minimize real es swipe del `DrawerDragHandle`.
- **Why it matters:** Casey/Isaías leen la X como cerrar. En el gym, un tap en zona de pulgar borra el entreno o pide confirmar un destructivo cuando querían bajar la hoja.
- **Fix:** Botón Minimizar (chevron/down) → `setOpen(false)` / `commitDrawerClose`. Dejar trash/descartar como acción secundaria, no como único escape.
- **Suggested command:** `$impeccable shape` (chrome del logger: minimizar vs descartar) y `$impeccable clarify`

### [P1] El instrumento de descanso no está en escena y no se puede apagar
- **What:** `RestTimerPill` no tiene ningún import fuera de su archivo. El descanso vivo es `RestProgressBar` (header, glow, `text-[10px]`, color `hsl(152 70% 42%)` — detector). `handleSetCompleted(false)` no llama a `restTimer.stop()`. La barra no tiene tap/X. Detector: `layout-transition` en el orbe del check, no en esta barra (Framer anima `height` en JS).
- **Why it matters:** DESIGN.md nombra la pill de descanso como firma. Hoy el descanso es un LED que hay que esperar. Uncheck no cancela. Isaías no puede saltar al siguiente movimiento.
- **Fix:** Montar `RestTimerPill` (`mode="sheet"` en el drawer, `global` al minimizar). X = `timer.stop()`. Uncheck para el timer de esa key. Quitar el glow 212→28 del header o dejarlo como eco mudo.
- **Suggested command:** `$impeccable layout` y `$impeccable animate`

### [P1] Registrar una serie exige demasiados alvos y cinco celdas a la vez
- **What:** Check 32px (`ActiveWorkoutCheckbox` default). Info/Chart `h-7 w-7`. Trash `h-8`. Fila `peso_reps`: 5 huecos. Header de ficha: grip + 🎯 RIR + badge descanso + Info + Chart + Trash. Detector: tick con `border-radius: 2px`, `transition: width, height`, sombra `rgba(0,0,0,0.23)`; `text-[9px]` en la ficha; `bounce-easing` en `SwipeToDeleteRow`.
- **Why it matters:** El gesto más repetido del producto (Hecho) es un orbe de 32px a la derecha de una fila de 5, en la misma pista que un swipe de 144px. Carga cognitiva alta. Android pide 48dp.
- **Fix:** Una fila = reps + peso + Hecho ≥44px. Grip/RIR/rest/Info/Chart/Trash detrás de un chevron. Check = disco `piloto-solid`, input nativo visible para SR (hoy `display: none`).
- **Suggested command:** `$impeccable distill` y `$impeccable adapt`

### [P1] `Finalizar` mudo; Hecho vacío arranca descanso
- **What:** `canSubmitPrimaryAction` usa `countRecordedSets` (`setHasWork`, no seed). `showFinishButton` aparece con `exercises.length > 0`. Check a 0/0 no habilita Finalizar (`h-12 rounded-full` disabled) y sí llama `restTimer.start` (default 120s). El toast «Sin series registradas» solo corre si `enterSummary` se dispara.
- **Why it matters:** El CTA primario de Operate miente: se ve, no se puede usar, no dice por qué. Un tap de Hecho en vacío enciende dos minutos de LED.
- **Fix:** Hecho sin dato no arranca descanso (o pide reps/peso). Si Finalizar está off, una línea: «Marca una serie con peso o reps». Alinear `countRecordedSets` con `serieCountsAsRecorded`. `Finalizar` a `rounded-xl` 12px.
- **Suggested command:** `$impeccable harden` y `$impeccable clarify`

### [P2] La identidad se escapa en vidrio, gadget y rampa
- **What:** `ActiveWorkoutPill`: `bg-neutral-900/80 backdrop-blur-md`, `hover:scale-[1.02]`, glow, label «Entrenamiento» fijo, `text-[10px]` «En curso». Checkbox gradiente 43°. `RestProgressBar` neón. Emoji 🎯 / 🔗. Siete `design-system-font-size` 9–11px. `bounce-easing` en el swipe.
- **Why it matters:** La única pieza de cristal permitida es el rest; está muerta. La pill de sesión (sí montada) es la que viola la regla. Track Gym se queda en el drawer; el loop Hecho → minimizar se ve plantilla.
- **Fix:** Pill de sesión opaca (`surface-float`). Check disco piloto. Type a label 12px / body 14px (ElapsedTime y Descanso pueden ser `label` 12px, no 10). Swipe con ease de sistema, no bounce.
- **Suggested command:** `$impeccable quieter` y `$impeccable typeset`

## Persona Red Flags

**Casey (móvil, gym, una mano):** X ≠ minimizar. Check 32px. Swipe 144px en la misma fila que los inputs. `Finalizar` en zona de pulgar pero disabled sin texto. Pausa 48px junto a la X roja. Gate de username antes de todo esto (lo único verificado en vivo).

**Alex (Hevy/Strong):** Espera tap-Hecho con último peso, complete-all, atajos. Hay seed y overload (`Aplicar` / `Deshacer`); no hay atajo de Hecho/Finalizar. `WorkoutSessionOptions` es un switch de sugerencias, no power menu. Swipe-delete de serie sin undo. Rest que no se salta.

**Sam (SR/teclado):** Al abrir, `WorkoutLogger` hace `activeEl.blur()`. Checkbox `display: none` — el input sale del árbol. `SetValueInput` sin nombre accesible (solo placeholder). Trash de ficha sin `aria-label`. Info/Chart solo `title`. Swipe: `sr-only`, cero teclado. `ElapsedTime` / `RestProgressBar` no son live regions. El color del rest (azul→ámbar→verde) es el estado.

**Isaías (híbrido, manos ocupadas, español, registrar rápido):** Quiere Registrar → Fuerza → 80×8 → Hecho → descanso → Finalizar. Choca con: picker de ~750 antes de la primera serie; ficha con RIR/info/chart; descanso que no se cierra; summary que pide comunidad y RPE 1–10; `HeartRatePanel` solo si hay BLE. El username de comunidad sigue siendo el primer beat, antes del rack.

## Cognitive Load

6/8 fallos → **alta**. Fallan: single focus, chunking, visual hierarchy, one thing at a time, minimal choices, working memory. Pasan: grouping, progressive disclosure (gym/RPE/comunidad van al summary).

Puntos de decisión con >4 opciones: header de `ExerciseCard` (≥6); `REST_PRESETS_SEC` (6); `RIR_OPTIONS` (5); fila de serie (5 celdas); RPE 1–10 en el summary; acciones del summary (Guardar como rutina / Guardar / Descartar / Volver).

## Emotional Journey

Valle de entrada (vivo): username de comunidad antes del rack. En código, el arranque del logger es el valle correcto: «Comenzar entrenamiento», overlay «Añade un ejercicio…» + FAB 48px. El primer ejercicio arma el reloj y el heading pasa a «Entrenamiento activo». El pico del loop debería ser Hecho → descanso; el haptic MEDIUM está bien, la pill prometida no existe. Minimizar (si se descubre el swipe) a `ActiveWorkoutPill` es la mejor reaseguración — y es cristal + «Entrenamiento» genérico. Peak-end flojo: `enterSummary` suelta título, comentarios, RPE, gym, comunidad y cuatro botones. El pico real está *después*, en `PostWorkoutModal` (XP, logros). High-stakes: borrar entreno/ejercicio está bien; borrar serie por swipe no; persist fallido es silencio.

## Minor Observations

- Heading dual: desde rutina el título es input y «Entrenamiento activo» baja a `DrawerDescription`.
- Copy: «Agregar Serie» vs «Añade un ejercicio» vs «Agregar ejercicio».
- `WorkoutEmptyExerciseState` overlay `z-30`; la barra sigue con X y Pausa disabled.
- `PostWorkoutModal`: un solo CTA «Ir al inicio»; `text-[11px]` (detector).
- `ActiveWorkoutPill` no muestra `titulo` ni el ejercicio actual.
- Autosave 600ms + flush al cerrar: bien; fallo silencioso.
- `SupersetHeader`: «🔗 Superserie».
- `RestTimerPill` `mode="sheet"` a `bottom-0` chocaría con la floating bar si se monta sin hueco.
- Overlay `layout-transition` en UsernameSetup: no es de esta superficie.
- `floatingGlassSurface` del logger ya es opaco; no reintroducir blur ahí.

## Questions to Consider

- Si el producto *es* el formulario de la serie, ¿por qué la ficha abre con seis cromos antes de reps y peso?
- ¿El descanso es el instrumento de la bitácora (pill de cristal, DESIGN.md) o un LED de chrome? Hoy no es ninguno: el componente de marca no está montado.
- ¿La X significa «sigo entrenando, esto baja» o «esto no existió»? Mientras sea las dos, Casey va a borrar sesiones.
- ¿El peak-end es la última serie + descanso o el modal de XP? Si es lo primero, el summary de comunidad/RPE tiene que caber en un gesto.
- ¿Por qué un username de comunidad tiene que ocurrir antes de poder marcar una serie?

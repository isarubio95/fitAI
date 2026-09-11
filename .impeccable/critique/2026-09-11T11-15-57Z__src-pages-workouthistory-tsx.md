---
target: progreso
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\WorkoutHistory.tsx"
target_fingerprint: "sha256:2718c1a8cc5a50cf8df5798b58198cb7d437cc0402f2b085050fbedfdb53731a"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\WorkoutHistory.tsx"
timestamp: 2026-09-11T11-15-57Z
slug: src-pages-workouthistory-tsx
closed: true
---
Method: dual-agent (A: c5aa2765-445b-4954-af44-1a50a56d5f5d · B: 713f7151-9495-4698-9987-ffc6d6e5e53d)

# Crítica de diseño — Progreso

**Superficie:** pestaña Progreso de Tú (`src/pages/WorkoutHistory.tsx` dentro de `/evolution?tab=progress`; shell `src/pages/Evolution.tsx`)  
**Modo:** Operate (analítica de tarea, no marketing)  
**Nota de evidencia:** el cuerpo de Progreso no se pintó en vivo. Hay sesión, pero `AppLayout` sustituye toda la app por `UsernameSetup` si `perfil.username` falta o la query no trae fila. El overlay del detector corrió sobre «Nombre de usuario», no sobre KPIs ni charts.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeleton + `aria-busy` sí; el periodo no está en la URL; widgets caros pueden ser `null` sin mensaje; un fallo de `profileSetup` te tira a onboarding |
| 2 | Match System / Real World | 2 | Tú y «N gym · N cardio» en KPIs; abajo 1RM Epley, Fitness/Fatiga, hint CTL/ATL, volúmenes en `t` |
| 3 | User Control and Freedom | 2 | Drawers con Volver; el periodo es `useState` local y se pierde al ir a Salud; UsernameSetup no se puede saltar |
| 4 | Consistency and Standards | 2 | Tres gramáticas de filtro en Tú; «Fuerza Máxima» vs «Volumen de fuerza»; forma clonada en Inicio; azul de cardio pintando Fuerza |
| 5 | Error Prevention | 2 | `pctChange` → `+100%` si el periodo previo es 0; Cargas máximas mezcla kg de movimientos distintos; músculos a `0×` siguen en ranking |
| 6 | Recognition Rather Than Recall | 2 | Labels visibles, pero cuatro relojes (pills / Banister / 12 meses de 1RM / historial muscular) y Constancia no dibuja gym vs cardio |
| 7 | Flexibility and Efficiency | 2 | Swipe y select de ejercicio; ni rango en URL, ni rango custom, ni comparar dos lifts |
| 8 | Aesthetic and Minimalist Design | 2 | Hierro y pills correctos; cuatro pozos piloto + dos gráficas + dos gauges + cuatro listas al mismo peso |
| 9 | Error Recovery | 2 | Username tiene copy claro; query de perfil fallida = misma pantalla que «sin nick»; widgets `return null` |
| 10 | Help and Documentation | 2 | Popover del 1RM y zonas en el drawer; Constancia, pills y `+12%` no explican el baseline |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Los tokens y la voz sí son Track Gym: midnight cálido, piloto como señal, español de tú, `Sesiones` con `N gym · N cardio`, `ChangeBadge` «sin datos prev.», `YouProgressSkeleton` que clona pills y labels, anillos `ZoneGauge` de instrumento. La composición no. `WorkoutHistory.tsx` monta el esqueleto Hevy / Strong / SaaS de analítica: pills de rango → grid 2×2 → area charts → gauges Banister → leaderboards. El norte «La Bitácora de Ruta» pediría un veredicto de diario (¿el press subió? ¿el long run cuenta?) y un trazo de ruta. El cardio es un KPI que cambia de etiqueta y tres cifras en el scrub de Constancia; el área es una sola serie `--primary`. En `FormDetailDrawer`, el azul `chart-fitness` (reservado a cardio en DESIGN.md) pinta **Fuerza** y el cardio va a `fresh`. Podrías cambiar los números y venderlo como otro tracker.

**Deterministic scan:** `impeccable detect --json` salió **exit 0** en todos los archivos. Hallazgos advisory (5), todos `design-system-font-size`: `ExerciseProgressWidget.tsx:372` y `:379` (`text-[10px]` de la fórmula 1RM); `YouProgressSkeleton.tsx:91` (`11px`); `chartScrub.tsx:46` (`11px`) y `:48` (`15px`). Limpios: `WorkoutHistory.tsx`, `Evolution.tsx`, `TrainingLoadWidget.tsx`, `MuscleRankingWidget.tsx`. El detector no marcó el muro de cards, las pills que no mandan, ni el híbrido aplanado: no son anti-patrones de su set. Donde LLM y detector coinciden: la rampa tipográfica de scrub/fórmula está rota. Donde el detector no llega: especificidad de producto, carga cognitiva y la pregunta «¿estoy progresando?».

**Visual overlays:** la inyección de `detect.js` **sí corrió** en una pestaña nueva etiquetada `[Human]` (`document.title` + script + banner), pero **no sobre Progreso**. La URL `/evolution?tab=progress` cayó en «Nombre de usuario». Ahí el overlay marcó 1 anti-patrón de página: `layout-transition` (`transition: height` en `body`). Eso es evidencia off-target; no atribuirlo a Progreso. El live-server (puerto 8400) ya está parado. Vite en 8080 sigue.

## Overall Impression

Es un almacén de KPIs con piel de bitácora, no una respuesta a «¿estoy mejor que hace cuatro semanas?». El chrome (pills, hierro, `N gym · N cardio`) ya sabe el idioma del producto; el scroll lo diluye en charts, gauges clonados de Inicio y tres rankings. La mayor oportunidad: un veredicto de periodo que una fuerza y ruta, y que las pills manden de verdad — o que cada card declare su reloj.

## What's Working

1. **`YouProgressSkeleton`** clona `7 días`…`6 meses`, labels Sesiones / Volumen de fuerza / Tiempo cardio / Series e iconos. La espera se siente la misma pantalla. `sr-only` «Cargando…» + `aria-busy`.
2. **`FormHero` + `RecoveryHero` + `GaugeCard`**: anillo `role="meter"`, consejo en tú, drawer con Volver. Eso es instrumento, no tile de SaaS. El clon vivo en Inicio (`+5` Óptimo, `0d` Listo) confirma que el copy de bitácora ya existe.
3. El diario híbrido **existe en copy**: `3 gym · 2 cardio`, scrub Sesiones / Gym / Cardio, `ChartScrubSummary` con `aria-live="polite"`. El producto ya sabe decirlo; el gráfico no lo dibuja.

## Priority Issues

**[P1] No hay respuesta a «¿estoy progresando?»**  
- **Why it matters:** Operate + teléfono en el gym. Si cuatro tiles, dos charts, dos gauges y cuatro listas pesan igual, no hay bitácora: hay panel de analítica.  
- **Fix:** Un titular de periodo («Estas 4 sem.: más volumen, forma +5») que enlace gym y cardio. Un chart híbrido de verdad. Forma/recuperación arriba o solo en Inicio, no las dos.  
- **Suggested command:** `$impeccable distill`

**[P1] Las pills mienten sobre el alcance**  
- **Why it matters:** `period` es `useState("4w")` en `WorkoutHistory.tsx` y no va a `searchParams`. `HeaderSectionTabs` hace `setSearchParams({ tab })` y borra el resto; al volver de Salud, otra vez **4 sem.** Debajo, 1RM = 12 meses (`EXERCISE_HISTORY_MONTHS`), músculos = todo el historial finalizado, forma = modelo propio. Casey trabaja la memoria.  
- **Fix:** `?period=4w`. Filtrar 1RM/músculos al rango o etiquetar cada card («últimos 12 meses», «hoy»). No desmontar Progreso al cambiar de tab, o persistir el periodo.  
- **Suggested command:** `$impeccable harden`

**[P1] El híbrido se ve como Hevy + un KPI**  
- **Why it matters:** El posicionamiento es un diario, no un segundo Strava ni un clon de Hevy. Constancia es un área verde de sesiones sumadas; gym/cardio solo en el scrub. No hay pace, km de ruta ni FC. En `FormDetailDrawer`, **Fuerza** = `chartColors.fitness` (azul) y **Cardio** = `fresh`. DESIGN.md reserva el azul a cardio frente al piloto.  
- **Fix:** Serie apilada o dos trazos (piloto = gym, `chart-fitness` = cardio). Un chart de ruta en el mismo periodo. Corregir la leyenda semanal.  
- **Suggested command:** `$impeccable colorize`

**[P1] `UsernameSetup` sustituye todo Tú**  
- **Why it matters:** En `AppLayout.tsx`, si `!profileSetup?.username` (también si la query falla y `data` es `undefined`) se hace `return <UsernameSetup />`. Un nick de comunidad tapa el diario. La visita de éxito — ver si progresas — no ocurre. Input sin `<label>`, sin Saltar.  
- **Fix:** No bloquear Inicio/Progreso/Salud/Actividades. Pedir el nick al entrar en Comunidad, o un banner no modal. Si `perfil` falla, reintentar; no fingir «falta username».  
- **Suggested command:** `$impeccable onboard`

**[P2] Rankings que no significan progreso**  
- **Why it matters:** Top ejercicios (apariciones en el periodo) vs Más Entrenados (series all-time). Cargas máximas ordena `peso_kg` entre presses y isolaciones. `pctChange(prev=0)` → badge `+100%`. Músculos a `0×` siguen en la lista. Empty de 1RM con emoji.  
- **Fix:** Un ranking, no tres. Máximo por movimiento. `null` + «sin datos prev.» si no hay baseline. No listar músculos a cero. Quitar el emoji.  
- **Suggested command:** `$impeccable clarify`

## Persona Red Flags

**Alex (Power User):** No puede deep-linkear **3 meses**. El select de Fuerza Máxima es una lista plana de todo el historial; no hay comparar dos lifts ni teclado de periodo. `ChartScrubLayer` existe en `chartScrub.tsx` y no se usa en `ProgressAreaChart` (solo Tooltip de Recharts). Dos leaderboards le sobran. El popover con la fórmula Epley sí es para él — escondido en un Info de 24×24.

**Sam (teclado / lector / contraste):** `UsernameSetup`: input sin `<label>` (solo placeholder). `RankRow` es `<button>` sin `aria-label`. Chevrons de ejercicio `p-1` + `h-5 w-5`. Al hacer scroll, `HeaderSectionTabs` pasa a `pointer-events-none` y `max-h-0`: las tabs Progreso / Salud / Actividades desaparecen. `hover:bg-accent/50` en `RankRow` se pega en puntero grueso. Ticks de chart a 11px muted. `ZoneGauge` con `role="meter"` está bien.

**Casey (móvil, pulgar, corte):** Pills y KPIs arriba; el veredicto y 1RM fuera del pulgar. Bottom nav come la zona baja. Interrupción → periodo a **4 sem.** Header que esconde las tabs de sección. Swipe horizontal en Fuerza Máxima (`swipeThreshold: 50`) pelea con scroll y con el scrub (`touch-pan-y`). Targets de fila de músculo sin min 44px. En vivo, ni llegó: cayó en Nombre de usuario a pantalla completa.

## Cognitive load

Checklist: Single focus fail · Chunking fail · Grouping fail · Visual hierarchy fail · One thing at a time fail · Minimal choices fail · Working memory fail · Progressive disclosure fail parcial (drawers bien; above-the-fold ya es un dashboard).

**Fallos: 8/8 — carga cognitiva alta.**

Decision points con >4 opciones: select de Fuerza Máxima (todos los ejercicios con historial); Más Entrenados (5) + Menos Entrenados (5); Top ejercicios + Cargas máximas; drawer de recuperación (11 grupos); bottom nav (5). Las pills de periodo (4) y las tabs de sección (3) sí caben.

## Emotional journey

El pico que debería abrir la pantalla — «Tu forma hoy» / recuperación — vive debajo de Constancia y Volumen, y ya está en Inicio. El first paint son deltas `%`. El valle es el scroll de cards gemelas, `+100%` / «sin datos prev.», y el onboarding de comunidad tapando el diario. El cierre son Star / Trophy: energía de ranking, no de bitácora. No hay frase final del tipo «esta ventana: X sesiones, el cuello es Y».

## Minor Observations

- Casing: Fuerza Máxima / Más Entrenados vs Volumen de fuerza / Top ejercicios.
- `CardTitle` de charts a `text-base`; headline del sistema es 1.5rem. Gauges a `52px` / `font-light` fuera de rampa (instrumento; consciente).
- `PAGE_CARD` es `rounded-2xl` en móvil, no 24px de card.
- Sidebar desktop: `backdrop-blur-2xl` — chrome no opaco.
- Skeleton KPI fija Tiempo cardio; en datos puede ser Distancia cardio.
- `formatVolume` → `2.4t`: jerga de tracker.
- **4 sem.** truncado; el resto de pills no.
- Tú usa tres gramáticas: periodo (Progreso), métrica + FAB (Salud), tipo (Actividades).
- Detector: `text-[10px]` / `11px` / `15px` fuera de rampa en fórmula, skeleton y scrub.

## Questions to Consider

- Si la pregunta es «¿estoy mejor que hace 4 semanas?», por qué el primer pixel son cuatro tiles y no una frase + un número?
- Si **Tu forma hoy** ya vive en Inicio, qué gana Progreso al repetirlo debajo de dos charts?
- Si las pills no mandan en 1RM, músculos ni Banister, para quién están?
- Dónde está la bitácora de ruta — último long run, pace, km — en una pestaña que se llama Progreso?
- De verdad quieres que un nick de comunidad pueda tapar el diario el día que alguien abre Tú?

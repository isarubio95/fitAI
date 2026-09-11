---
target: cardio gps
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
p2_count: 2
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\cardio\\CardioLiveRecorder.tsx"
target_fingerprint: "sha256:3142c8088cec7976b570ae0ff0df55c3c521f3f5b6117187f10c76463376b0d5"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\cardio\\CardioLiveRecorder.tsx"
timestamp: 2026-09-11T11-36-03Z
slug: src-components-cardio-cardioliverecorder-tsx
closed: true
---
Method: dual-agent (A: 72304ddf-f626-4fa1-89ea-f71bde29133b · B: 23f501a9-4e49-414d-bd94-7fe20b421289)

# Crítica de diseño — Cardio GPS (grabación en vivo)

Superficie: `src/components/cardio/CardioLiveRecorder.tsx` y HUD live (mapa, métricas, drawer, island, picker de rutas, pill activa). Modo: Operate. Plataforma canónica: teléfono.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Banner GPS de 11px; FC y autopausa invisibles hasta expandir el sheet; en setup las métricas marcan 0:00 / 0 m como si ya hubiera sesión. |
| 2 | Match System / Real World | 3 | Copy en tú es natural; el trazo `#FC4C02` y «FC» vs «Pulsaciones» no hablan el idioma de la bitácora. |
| 3 | User Control and Freedom | 2 | Overlay a pantalla completa sin X. El drawer es `dismissible={false}`. En web, Atrás corta `watchPosition`. |
| 4 | Consistency and Standards | 2 | Piloto en Play/Finalizar vs track Strava; cristal en chrome live; indoor es otra UI; grabber que no descarta. |
| 5 | Error Prevention | 2 | Descarte confirmado. Play no exige fix GPS. Bookmark de rutas predefinidas solo hace `stopPropagation`. Autopausa a 12 s. |
| 6 | Recognition Rather Than Recall | 2 | Play, ruta, capas y cámara icon-only. Expandir FC es arrastre de 28px o doble tap, sin chevron. |
| 7 | Flexibility and Efficiency | 2 | Hay escape a formulario manual; no hay atajo de teclado. El doble tap no es acelerador: es el único camino a FC/autopausa. |
| 8 | Aesthetic and Minimalist Design | 2 | Grabación compacta está contenida. Setup satura mapa + island + ceros + banner + play + spacer + ruta + controles de mapa. |
| 9 | Error Recovery | 2 | Denegado durante grabación ofrece «Formulario manual». En setup solo el banner. Toasts genéricos; `err.message` del GPS puede ir en inglés. |
| 10 | Help and Documentation | 1 | Cero ayuda para el gesto del sheet, la cámara de tres modos o por qué se puede iniciar sin señal. |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** El estado compacto de grabación (mapa a sangre, tres métricas, Pausa / Finalizar en pulgar) sí se siente instrumento de ruta: denso, teléfono en la mano, sin hero. El resto no está autorado para «La Bitácora de Ruta». El track live se pinta con `#FC4C02` (naranja Strava) y el punto de posición con `#2D8CFF` en `stravaDarkMapStyle.ts`; el piloto verde casi no toca el mapa. Island y `LiveMetricsBar` van en cristal (`backdrop-blur-xl`), el vidrio que DESIGN.md prohíbe en chrome móvil (la excepción consciente es la pill de descanso, no este HUD). El play de setup es un disco icon-only con un hueco vacío de 48px a la izquierda. Un recorder GPS oscuro de categoría podría clonar esta piel mañana. Fuerza y cardio no comparten superficie aquí: el mapa es otra marca.

**Deterministic scan:** 6 hallazgos advisory (exit 0, no bloqueantes). 5× `design-system-font-size` (10px/11px en `LiveMetricsBar`, `LiveStatsFullscreen`, `ActiveCardioPill`; 8px en atribución MapLibre) y 1× `design-system-color` (`rgba(0,0,0,0.55)` en la sombra del marker). El detector **coincide** con la revisión humana en las labels de 10/11px del HUD. El detector **no vio** el naranja Strava, el cristal, los icon-only, la falta de salida ni el Play sin GPS: esos hex van en un módulo TS de estilo de mapa, fuera de las clases Tailwind que el scan prioriza. Falsos positivos probables: 8px de atribución legal MapLibre y la sombra del punto GPS.

**Visual overlays:** no hay overlay fiable en la pestaña **[Human]**. Señal de fallback: `mutation-unavailable`. Playwright se saturó; el preflight mutable no se ejecutó; `detect.js` no se inyectó. La URL alcanzada fue el onboarding «Nombre de usuario», no Registrar → Cardio. Esta crítica se apoya en código fuente + detector CLI, no en inspección visual del HUD live.

## Overall Impression

La grabación compacta es el mejor momento de la superficie: Operate de verdad, pulgar abajo, tres cifras. El setup y el mapa traicionan el brief. La oportunidad más grande no es «más métricas»: es que el mapa y el chrome hablen Track Gym, y que Play no deje salir a ciegas.

## What's Working

1. **Pausa / Finalizar en zona de pulgar**, cápsulas distintas (secondary vs `piloto-solid`), y «Pausa automática» vs «Reanudar» según `pauseSource`.
2. **Finalizar no es un precipicio:** congela tiempo/distancia, `Volver` no reanuda el crono; el descarte pide confirmación en tú («no se puede deshacer»).
3. **Tres métricas con labels** (Tiempo / Distancia / Elevación o Restante) y `aria-label` en Iniciar / ruta / estadísticas: la estructura de datos está pensada para una mano.

## Priority Issues

### [P1] No hay salida visible; se puede iniciar sin GPS
- **Why it matters:** Overlay `fixed inset-0 z-toast` sin X. `LiveControlsDrawer` es `dismissible={false}`. Play (`onStartFromIsland`) no mira `gpsHasFix`. En setup, permiso denegado = solo banner; el empty de `MapPin` + «Formulario manual» es solo con sesión abierta. Jordan no sabe cómo salir. Casey pulsa Play y «graba» ceros. En web, Atrás desmonta el recorder y corta `watchPosition`.
- **Fix:** X o «Cerrar» en la island. Bloquear Play sin fix **o** CTA explícito «Empezar sin GPS». En denegado de setup: el mismo empty que en grabación + «Abrir ajustes de ubicación».
- **Suggested command:** `$impeccable harden`

### [P1] El mapa es piel Strava, no bitácora
- **Why it matters:** `MAP_COLORS.route = "#FC4C02"`, position `#2D8CFF`, island/métricas con `backdrop-blur-xl`. DESIGN.md: «sin cristal», chrome opaco, acento piloto. El diario unificado se rompe en cuanto sale el mapa.
- **Fix:** Track y halo en `chart-fitness` / piloto; chrome opaco `surface-elevated`; quitar blur en island y `LiveMetricsBar`.
- **Suggested command:** `$impeccable colorize`

### [P1] Acciones primarias icon-only y sheet secreto
- **Why it matters:** Play 56px sin «Iniciar». Ruta 48px sin el nombre aunque `selectedRouteName` exista. FC y Autopausa detrás de drag 28px / `onDoubleClick`. El grabber parece dismiss de Vaul y no lo es. En carrera no se improvisa un doble tap.
- **Fix:** Label «Iniciar» en el play. Chevron o peek de pulsaciones siempre visible. Mostrar el nombre de la ruta. Snap explícito, no gesto folklórico.
- **Suggested command:** `$impeccable clarify`

### [P2] Fin e indoor no cierran el arco
- **Why it matters:** El resumen es un formulario, no un cierre (peak-end). Indoor (`swimming` / `other`) es un párrafo gris. En setup `showGpsSurface` es true siempre, así que natación enseña mapa hasta pulsar Play.
- **Fix:** Resumen con mapa del track y las 3 cifras como héroe. Indoor con crono grande desde el setup, sin mapa.
- **Suggested command:** `$impeccable layout`

### [P2] El picker de rutas es otra app antes de salir
- **Why it matters:** Drawer a pantalla completa: tabs, búsqueda, pills, Crear dibujar/importar. El Bookmark de predefinidas no guarda (`onClick` solo `stopPropagation`). Casey vino a pulsar Play.
- **Fix:** En setup, «Última ruta» o «Sin ruta» + «Elegir…». Quitar o implementar el bookmark. Filtros dentro, no en la puerta.
- **Suggested command:** `$impeccable distill`

## Persona Red Flags

**Casey (móvil, pulgar, interrupción)**
- Cámara y capas del mapa: 40×40, arriba-derecha, fuera del pulgar.
- Toda `LiveMetricsBar` es un `<button>` («Ver estadísticas»); un toque en el crono abre fullscreen. Cerrar stats: X 40×40 arriba-izquierda.
- Conectar FC: botón `sm` (36px). Bookmark de ruta: 20×20.
- Banner GPS `text-[11px]`. Autopausa a 12 s sin cromo en el mapa. Atrás en web corta el GPS sin decirlo.

**Jordan (primera vez)**
- Disco Play sin «Iniciar»; spacer izquierdo parece un botón que faltó.
- Island «Tipo de cardio» no explica GPS vs indoor; el mapa sigue saliendo en natación.
- No hay copy de «arrastra para pulsaciones». Cámara: un botón, tres verbos.
- Puede iniciar con «Sin señal GPS» y llegar al resumen «Sin puntos GPS».

**Sam (teclado / lector / contraste)**
- Play/ruta/capas/cámara sin texto visible; labels solo en `aria-*`.
- `DrawerTitle` es `sr-only`; el grabber no anuncia expandir.
- FC en `grid-rows-[0fr] overflow-hidden` puede quedar fuera de tab order útil.
- Stats: `role="dialog"` sin Escape / focus trap en web.
- Track naranja vs punto azul es color-only. Ruta seleccionada = borde piloto, sin nombre.
- Labels `text-[10px]` y banner `11px` sobre `muted-foreground` (el detector lo confirma).

## Minor Observations

- Hueco `h-12 w-12` a la izquierda del Play: se lee como control roto.
- `HeartRatePanel` en web: toast «Solo en la app Android» — bien; el botón «Conectar» sigue pareciendo que va a emparejar.
- Atribución MapLibre a 8px / opacity 0.4: el detector la marca; es legal, no rampa de producto.
- Fallback Suspense del mapa `#23292b` vs hierro cálido: parpadeo de otra paleta.
- Overlay `loadingSession` `bg-card/30`: ni opaco ni honesto.
- `ActiveCardioPill` copia el cristal de la pill de descanso (excepción de DESIGN.md) pero añade `hover:scale-[1.02]`, prohibido en táctil.
- Indoor copy es correcta y tímida: no hay crono display, solo el de la barra.

## Questions to Consider

- Si el track dejara de ser `#FC4C02`, ¿seguiría pareciendo «GPS de verdad», o era miedo a no parecer Strava?
- ¿El Play debe armarse solo con fix, o Track Gym quiere que la gente salga y ya veremos el track?
- ¿Las pulsaciones merecen una fila siempre visible, o de verdad queréis que un corredor descubra el doble tap?

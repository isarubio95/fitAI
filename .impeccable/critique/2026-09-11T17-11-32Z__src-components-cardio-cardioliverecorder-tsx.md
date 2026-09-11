---
target: cardio gps
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
p2_count: 3
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\cardio\\CardioLiveRecorder.tsx"
target_fingerprint: "sha256:3b71695e801a77575e7a4090fd89b9a5d891a9d1c50c4415dbda6c855ba55af2"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\cardio\\CardioLiveRecorder.tsx"
timestamp: 2026-09-11T17-11-32Z
slug: src-components-cardio-cardioliverecorder-tsx
closed: true
---
Method: dual-agent (A: 73ba514e-1393-4305-b786-36a6fe660f52 · B: 817b9a8c-da8c-4801-98f5-141ca4fe3613)

# Crítica de diseño — Cardio GPS (post-pases)

Superficie: `src/components/cardio/CardioLiveRecorder.tsx` y HUD live. Modo: Operate. El naranja de track `#FC4C02` y el punto `#2D8CFF` son compromiso de producto, no defecto.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Banner, autopausa, toasts y HR cubren casi todo; la pastilla sigue contando en pausa. |
| 2 | Match System / Real World | 3 | Copy de atleta; «Formulario manual», «Zona N» y RPE piden contexto. |
| 3 | User Control and Freedom | 3 | X minimiza, Descartar confirma, Empezar sin GPS. El drawer no se pliega. |
| 4 | Consistency and Standards | 3 | Tokens alineados. Cards predefinidas son `div`; «Pulsaciones» vs «FC». |
| 5 | Error Prevention | 3 | Gate GPS y mutex guardar. Banner rojo al buscar fix puede empujar a salir sin GPS. Borrar ruta sin confirmación. |
| 6 | Recognition Rather Than Recall | 3 | Última ruta/disciplina visibles. Ritmo/vel solo en stats; la barra no parece tappable. |
| 7 | Flexibility and Efficiency | 3 | Última ruta, sin GPS, manual, pastilla. Sin acelerador de pausa. |
| 8 | Aesthetic and Minimalist Design | 3 | Live compacto es el patrón correcto. Setup y drawer (FC + autopausa siempre) recortan el mapa. |
| 9 | Error Recovery | 3 | Denegado + manual + sin GPS. Toasts de guardado y catálogo sin reintento. |
| 10 | Help and Documentation | 2 | Hints puntuales. No explica Iniciar bloqueado, Zona, ni que la barra abre stats. |
| **Total** | | **29/40** | **Good** |

## Design Specificity Verdict

**LLM assessment:** El overlay live está escrito para el diario híbrido: mapa de hierro, isla de disciplina, pastilla «Cardio en curso», revelación circular, voz en tú, escape al logger. No es una piel genérica de recorder. El picker de rutas (catálogo + filtros + crear) sigue siendo la zona más intercambiable. El naranja de track es literacidad Strava pedida, no deriva de marca.

**Deterministic scan:** 2 avisos advisory, ambos en `LiveCardioMap.tsx`: sombra `rgba(0,0,0,0.55)` del punto GPS y atribución MapLibre a 8px. El resto de targets (recorder, live/, island, picker, pill) salió limpio. Los 10/11px del HUD que el run anterior marcaba ya no están. Los dos findings del mapa son falsos positivos / drift intencional (sombra de marker + atribución legal).

**Visual overlays:** no hay overlay en **[Human]**. Señal: `mutation-unavailable`. Playwright no inyectó `detect.js` (conexión rechazada o sesión en `/evolution`). Esta crítica se apoya en código + CLI.

## Overall Impression

El 20/40 era un setup ciego y un chrome a medias. Ahora el modelo minimizar/pastilla, el gate de GPS y las tres métricas son Operate de verdad. La banda es **Good**. El mayor hueco que queda no es identidad: es no tratar «buscando GPS» como un error, y no dejar el ritmo/vel en un overlay sin affordance.

## What's Working

1. **Minimizar ≠ descartar.** X, toast «Cardio sigue grabando», pastilla y `liveSessionId` que sobrevive. El GPS no se corta al irse.
2. **GPS honesto.** Iniciar bloqueado sin fix, «Empezar sin GPS», indoor con crono, denegado + formulario, remaining de ruta.
3. **HUD de bitácora.** Labels en rampa, chrome opaco, Iniciar con palabra, pulsaciones y autopausa a la vista (sin gesto secreto).

## Priority Issues

### [P2] El banner trata «buscando GPS» como fallo
- **Why it matters:** `showNoGpsBanner` se enciende con `!gpsHasFix` y el texto es «Sin señal GPS» en rojo. Coincide con Iniciar apagado. Empuja a «Empezar sin GPS» o a creer que el permiso falló.
- **Fix:** Tres tonos — «Buscando GPS…» (neutro), «Sin señal · permiso denegado», error con acción. El Iniciar disabled debe decir por qué.
- **Suggested command:** `$impeccable clarify`

### [P2] Ritmo/velocidad solo viven en un overlay sin affordance
- **Why it matters:** `LiveMetricsBar` es un botón con `aria-label="Ver estadísticas"` y sin chevron. Ritmo o vel. no están en la barra. Un tap accidental tapa el mapa.
- **Fix:** Una cifra live (ritmo o vel. según disciplina) en la barra + affordance visible. El overlay para el resto.
- **Suggested command:** `$impeccable layout`

### [P2] Setup y drawer live no se pueden plegar
- **Why it matters:** Antes de Iniciar coinciden isla, chips de ruta, FC y autopausa. En grabación el drawer va `open` fijo. Casey pierde mapa.
- **Fix:** Pre-start = isla + Iniciar (+ última ruta). FC/autopausa en «Más» o tras el start. Peek del drawer (solo Pausa/Finalizar).
- **Suggested command:** `$impeccable distill`

### [P3] La pastilla ignora la pausa
- **Why it matters:** `formatElapsed(fecha_inicio)` no resta pausas. El overlay sí. Al minimizar, el cromo miente.
- **Fix:** El mismo elapsed que el recorder.
- **Suggested command:** `$impeccable harden`

### [P3] Borrar ruta sin diálogo; cards predefinidas no son botones
- **Why it matters:** `onDelete` borra al toque. `PredefinedRouteCard` es `div`+`onClick`. El descarte de sesión ya confirma.
- **Fix:** Mismo `AlertDialog` que el descarte; card como `button` con `aria-pressed`.
- **Suggested command:** `$impeccable harden`

## Persona Red Flags

**Casey:** Pausa/Finalizar abajo (bien). Drawer fijo le come el mapa. La pastilla es su salvavidas; el reloj en pausa le miente. Borrar ruta `h-9 w-9`. Tap en la barra abre stats a full.

**Jordan:** Isla autoelige deporte. Iniciar apagado + banner rojo sin «buscando». X = cerrar en setup y minimizar en grabación (el toast solo cubre la segunda). El sheet Rutas sigue siendo un segundo producto.

**Sam:** Labels en X, stats, isla, Elegir, switches. Predefinidas no focusables. Mapa MapLibre opaco para SR. Drawer `modal={false}`: el foco puede irse al canvas.

## Minor Observations

- Stats en setup pueden abrir un grid de ceros.
- Indoor duplica el cronómetro (superficie + barra).
- Tras start no hay nombre de ruta, solo Restante.
- Resumen: Guardar / Descartar / Volver al mismo peso en columna.
- Guardar: toast genérico; catálogo en error sin Reintentar.

## Questions to Consider

- ¿El ritmo (o la vel.) debe estar siempre en la barra live?
- ¿El start debe ser Iniciar-primero, o el stack actual es el brief?
- ¿El drawer debe poder quedar en peek para ver mapa?

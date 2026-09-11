---
target: cards de entrenamientos realizados
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\dashboard\\WeekCalendar.tsx"
target_fingerprint: "sha256:b55333fade15e2c2dbb34db5e4fe766ee6210e86154ccf9f5e64e7fd74f55a8e"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\components\\dashboard\\WeekCalendar.tsx"
timestamp: 2026-09-11T17-13-22Z
slug: src-components-dashboard-weekcalendar-tsx
closed: true
---
# Crítica de diseño — Cards de entrenamientos realizados

**Superficie:** filas «Entrenamientos realizados» (`CalendarDayLog` + `WeekCalendar` / `MonthlyPlanner`) en Inicio (`/`)  
**Modo:** Operate  
**Nota de evidencia:** Assessment A: `ERR_CONNECTION_REFUSED` en :8080 (un intento). Assessment B: CLI limpio; overlay de `detect.js` en `/auth`, no en las cards. Live-server 8400 parado. Vite 8080 se dejó.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeleton y «Eliminando…» sí; toolbar en modo ordenar se apaga sin decir por qué. |
| 2 | Match System / Real World | 3 | Ver/Editar/Eliminar y `ejercicios · series` suenan a gym; cardio solo enseña disciplina. |
| 3 | User Control and Freedom | 2 | Cancelar en el diálogo; sin undo; el modo ordenar secuestra las acciones. |
| 4 | Consistency and Standards | 2 | Semana vs mes no cablean Editar igual; toasts entreno/cardio; Iniciar filled, Ver outline. |
| 5 | Error Prevention | 3 | Confirmación sí; Eliminar a 48px pegado a Editar; el diálogo usa `titulo` crudo. |
| 6 | Recognition Rather Than Recall | 3 | Labels siempre visibles; Ver vs Editar no declaran destino. |
| 7 | Flexibility and Efficiency | 2 | Un camino por fila; sin atajos ni lote (coherente con no-swipe). |
| 8 | Aesthetic and Minimalist Design | 1 | Tres outlines 48px pesan más que el título. La toolbar es el objeto. |
| 9 | Error Recovery | 2 | «No se pudo borrar»; sin undo; el éxito cierra en seco. |
| 10 | Help and Documentation | 2 | El vacío de fuerza es la única ayuda; nadie explica Ver frente a Editar. |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** El contenido es Track Gym (tú, volumen, «entreno», icono piloto, Nested Flat). El cromo no: tres outlines iguales en grid 3×48px es una toolbar CRUD. Podría listar facturas. No hay hora ni tinta de bitácora. El piloto se queda en el icono de 20px; la fila la mandan los botones.

**Deterministic scan:** `impeccable detect --json` sobre `CalendarDayLog.tsx`, `WeekCalendar.tsx` y `MonthlyPlanner.tsx`: **[] / exit 0 / 0 hallazgos**. El side-tab y el `11px` de la corrida anterior ya no están. Donde LLM y detector divergen: el detector no ve densidad, jerarquía ni el vacío de fuerza. Un scan limpio no prueba bitácora.

**Visual overlays:** no hay overlay sobre las cards. La inyección corrió en **`/auth`** («Bienvenido a Track Gym»). Consola: `[impeccable] 2 anti-patterns found` — `radial-spotlight-glow`, `layout-transition`. Off-target. MCP a :8080 falló (`ERR_CONNECTION_REFUSED`); fallback local a `/auth`. Live-server parado.

## Overall Impression

La constraint se cumplió: Ver / Editar / Eliminar se leen sin swipe. El coste es que el diario pasó a ser un pie de foto bajo un muro de botones. La mayor oportunidad: **el dato es el objeto**; las tres acciones siguen visibles, pero Ver lidera y Editar/Eliminar callan.

## What's Working

1. **Labels a la vista, 48px, `aria-label` «Ver {título}`.** Un pulgar no adivina iconos. La decisión de producto se ejecutó.
2. **Una fila compartida** semana/mes: Nested Flat, volumen en español (singular/plural + «Sin series registradas»), skeleton, «Eliminando…», toast «Se borró el entreno».
3. **El detector está limpio** en el markup de las cards: se fue la franja side-tab y el `text-[11px]`.

## Priority Issues

### [P1] La toolbar 3×48px se come la entrada
- **What:** Grid de tres outlines `h-12` bajo un título `text-sm`. Dos entrenos ≈ 240px de botones. Eliminar = Ver en tamaño.
- **Why it matters:** En el gym el dato debería mandar. Tres CTA iguales son admin, no bitácora. El mis-tap a Eliminar sigue cerca (el confirm salva el tap, no el miedo).
- **Fix:** Labels visibles, jerarquía distinta. Ver = la fila o un piloto. Editar/Eliminar visibles y más quietos (misma fila, menor peso, o 36–40px). Sin swipe-only.
- **Suggested command:** `$impeccable layout`

### [P1] El vacío de fuerza siempre abre el panel
- **What:** La sección de fuerza se pinta siempre; cardio y programado solo si hay filas. Copy: «Aún no hay un entreno de fuerza este día.»
- **Why it matters:** Un día de ruta empieza con un fallo de gym. El diario híbrido se lee gym-first.
- **Fix:** Vacío de fuerza solo si el día no tiene nada, o un solo vacío de día. Si hay cardio, no sermonees el gym.
- **Suggested command:** `$impeccable distill`

### [P1] `actionsDisabled` apaga la toolbar sin copy
- **What:** `actionsDisabled={isDragMode}` + `pointer-events-none` en el widget. Si el panel ya estaba abierto, tres botones fantasma.
- **Why it matters:** Casey no sabe si hay un bug o si debe «salir de ordenar».
- **Fix:** En ordenar, oculta la toolbar o una línea: «Sal del ordenar para abrir un entreno.»
- **Suggested command:** `$impeccable clarify`

### [P2] Meta de cardio vs fuerza
- **What:** Fuerza: `N ejercicios · N series`. Cardio: solo disciplina.
- **Why it matters:** La ruta parece una nota; el gym parece un registro.
- **Fix:** Misma densidad: tiempo, km o FC. El azul del icono no basta.
- **Suggested command:** `$impeccable clarify`

### [P2] Borrado frágil en el borde
- **What:** El diálogo interpola `titulo` crudo (puede ser `""`). Sin undo. Error: `err.message`. Semana: Editar de fuerza es opcional; mes: siempre.
- **Why it matters:** Dos vistas del mismo diario; el toast cierra en seco.
- **Fix:** Fallback «Entreno»; alinear handlers; no filtrar Supabase al usuario.
- **Suggested command:** `$impeccable harden`

## Persona Red Flags

**Casey:** 48px bien; el bloque (3 botones + Fuerza/Cardio `h-11`) no está en el pulgar. Eliminar = Editar. Ordenar: toolbar gris.

**Alex:** Tres botones permanentes por fila. Sin lote ni tecla. El expand ya es un peaje; la losa es el segundo.

**Jordan:** Ver vs Editar no dicen ficha vs logger. El vacío de fuerza suena a error.

**Sam:** Group + aria-label bien. Disabled sin motivo. Eliminar se distingue sobre todo por color.

**Isaías:** Cardio sin cifra. El vacío de fuerza encabeza un día de ruta. Iniciar del plan va filled; Ver del log, no.

## Cognitive Load

5 fallos → **alta**. Fallan: single focus, visual hierarchy, one thing at a time, minimal choices, progressive disclosure. Pasan: chunking, grouping, working memory.

Un día entrenado: 3 acciones de fila + Fuerza + Cardio = 5 visibles. El vacío de fuerza suma ruido cuando ya hay ruta.

## Emotional Journey

Pico: título + volumen. Valle: muro de tres outlines. Si el día es cardio, el primer beat es un fallo de gym. El diálogo de borrado tranquiliza; el toast cierra sin undo. Peak-end flojo.

## Minor Observations

- `StartSessionActions` `h-11` vs toolbar `h-12`: dos escalas en el mismo panel.
- Toasts: mutación «Se borró el entreno» vs inline cardio/plan.
- Skeleton no ensaya el grid de tres.
- `space-y-4` entre título y botones: aire de settings.
- Overlay `/auth`: no es de esta superficie.

## Questions to Consider

- Si la constraint es «labels visibles», ¿por qué Ver no *es* la fila y Editar/Eliminar son satélites?
- ¿Un día híbrido debería abrir por lo que *sí* hubo?
- ¿48px × 3 es toque honesto o no elegir jerarquía?
- ¿El modo ordenar tiene derecho a una toolbar zombi?

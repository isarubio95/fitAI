---
target: Tú > Salud
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\isaru\\Desktop\\fitAI\\src\\pages\\YouHealth.tsx"
target_fingerprint: "sha256:0c8b8e01b4c95f31c9cb47b3f744c6885de276b26f772fa5eae9725d41217aaa"
target_path: "C:\\Users\\isaru\\Desktop\\fitAI\\src\\pages\\YouHealth.tsx"
timestamp: 2026-09-12T12-07-22Z
slug: src-pages-youhealth-tsx
closed: true
---
Method: dual-agent (A: 5970fe48-a553-478b-bf39-815f2d65df45 · B: 2c157a24-14f9-4a4c-89d2-16f8ea5326a5)

# Crítica de diseño — Tú > Salud

**Superficie:** pestaña Salud de Tú (`src/pages/YouHealth.tsx` dentro de `/evolution?tab=health`; drawer `src/components/health/HealthLogDrawer.tsx`; shell `src/pages/Evolution.tsx`)  
**Modo:** Operate (diario de tarea, no marketing)  
**Evidencia:** sesión autenticada; Salud pintó vacía (cuatro «—», sin gráfico). Drawer «Registrar salud» abierto en 390 y 1280. Overlay del detector inyectado en pestaña `[Human]`.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | «—» = vacío, error o un solo punto; el gráfico desaparece sin estado |
| 2 | Match System / Real World | 2 | **FC** vs **FC reposo**; fecha nativa `09/12/2026`; «Día a día» no dice nada |
| 3 | User Control and Freedom | 2 | Escape cierra; no hay Cancelar, undo ni editar/borrar (`deleteDailyHealth` sin UI) |
| 4 | Consistency and Standards | 2 | Dos **Registrar**; Progreso tiene titular, Actividades empty copy, Salud silencio |
| 5 | Error Prevention | 2 | Rangos sí; upsert del mismo día sin aviso; placeholders `7.5` / `60` parecen valores |
| 6 | Recognition Rather Than Recall | 2 | Formulario en blanco cada vez; no hay historial ni «último / hoy» |
| 7 | Flexibility and Efficiency | 1 | Un solo path: sheet 92lvh, 12 campos, sin last-value ni atajos |
| 8 | Aesthetic and Minimalist Design | 2 | Controles duplicados + vacío negro; `bg-primary/5` es un lavado de acento |
| 9 | Error Recovery | 2 | Toasts («Añade al menos un dato», «Error al guardar»); nada inline |
| 10 | Help and Documentation | 1 | Una línea en el drawer; Progreso explica 1RM, Salud no explica deltas ni calidad |
| **Total** | | **18/40** | **Poor** |

## Design Specificity Verdict

**Start here.** El chrome es Track Gym. El cuerpo es un dashboard wellness intercambiable.

**LLM assessment:** Hierro midnight, piloto, tabs Tú y FAB `variant="new"` sí son bitácora. Lo que hay dentro no. Cuadrícula 2×2 tipo Apple Health, pills tipo Hevy measurements, Recharts que ni aparece cuando no hay serie. Progreso se atreve a un veredicto («entrenaste menos que en las 4 anteriores»); Salud no dice «hoy no hay peso». El drawer mezcla ficha de composición (cintura, pecho, brazo, pierna, % grasa) con el diario de gym/ruta (peso, kcal, sueño, FC). `calidad_sueno` se guarda y no se pinta. Un clon de wellness se llevaría `YouHealth` + `HealthLogDrawer` sin cambiar una línea de producto.

**Deterministic scan:** `impeccable detect --json` salió **exit 0** con **6 advisory** (0 error, 0 warning), todos `design-system-font-size` / «Font size outside DESIGN.md»: `YouHealth.tsx` líneas 307, 309, 319, 413, 416 (`text-[11px]` / `text-[10px]` en labels, hints, badges y leyendas); `HealthLogDrawer.tsx:324` (`11px` de calidad 1–5). `Evolution.tsx` limpio. El detector no marcó el vacío, el solape del FAB, el upsert silencioso ni la carga cognitiva: no están en su set. Donde LLM y detector coinciden: la rampa tipográfica de meta/hint está rota (10px bajo el suelo de 11px). Donde el detector no llega: especificidad, empty state y la acción primaria tapada.

**Visual overlays:** la inyección de `detect.js` **sí corrió** en una pestaña nueva etiquetada `[Human]` (`document.title` = `[Human] Track Gym — Salud`). Overlays visibles: `LAYOUT PROPERTY ANIMATION`, `UNDERSIZED FUNCTIONAL TEXT`, `NESTED CARDS`, y `tiny body text` con el drawer abierto. Consola en vivo: `layout-transition` ×3, `undersized-ui-text` ×6 («En curso», «Inicio», «Biblioteca», «Registrar», «Comunidad», «Tú»), `nested-cards` ×1 (×4 con drawer), `tiny-text` ×1 en el drawer. Los 10px del bottom nav y de **En curso** son chrome global, no markup de Salud. El live-server (puerto 8400) ya está parado.

## Overall Impression

Es un hueco con piel de instrumento. Tú tiene entreno y Actividades; Salud enseña cuatro em-dashes y un FAB que, en el contexto canónico (sesión viva, teléfono en el gym), no se puede pulsar. La mayor oportunidad: un diario de **hoy** — un número, un tap, un empty que hable — no un archivo de composición corporal disfrazado de dashboard.

## What's Working

1. **Copy del drawer.** «Los campos vacíos se ignoran.» + campos opcionales + **Guardar** sticky. Es operate, no un wizard moralizante.
2. **Shell compartido.** Tabs **Progreso / Salud / Actividades**, `PAGE_CARD`, FAB cápsula, dark cálido. La pestaña se siente de Tú, no de otra app.
3. **Carga prevista.** Skeletons en valores y gráfico (`aria-busy`, «Cargando gráfico»). El patrón cards → métrica es el correcto *cuando hay serie*.

## Priority Issues

**[P0] El FAB «Registrar» es intocable con un entreno vivo**
- **Why it matters:** `YouHealth` fija el FAB a `z-40` sobre `--app-bottom-nav-inset`. `ActiveWorkoutPill` va a `z-50`, centrada, misma banda (`bottom-24` / `max-md:bottom-[calc(var(--app-bottom-nav-inset)+0.75rem)]`). En 390 el click a «Registrar salud» lo intercepta la pill. En el gym, la acción primaria de Salud no existe.
- **Fix:** reservar rail para la pill o subir el FAB por encima; meter «Registrar salud» en el menú **Registrar** del nav; hit-target ≥44px libre.
- **Suggested command:** `$impeccable adapt`

**[P1] Vacío, error y «un solo dato» son el mismo silencio**
- **Why it matters:** `chartHasData = chartData.length > 1`; 0 o 1 punto → el `<Card>` del gráfico es `null`. Queries en error → los mismos «—». Actividades dice «Aún no has registrado actividades.»; Progreso habla. Aquí no hay «hoy», ni CTA en el lienzo, ni distinción fallo/vacío.
- **Fix:** empty de operate («Aún no hay peso ni sueño. Registra el de hoy.»); gráfico desde 1 punto; `isError` con reintentar; fecha del último valor en cada card.
- **Suggested command:** `$impeccable onboard`

**[P1] El drawer es un volcado, no un log de gym**
- **Why it matters:** 12 controles. **Medidas** (6) va antes que **Día a día**. Placeholders `7.5` y `60` parecen rellenos. Form `emptyForm()` al abrir. Calidad 1–5 se guarda y no vuelve a verse. Upsert del mismo día sin aviso (`onConflict: usuario_id,fecha`).
- **Fix:** abrir en la métrica activa; perímetros detrás de «Más medidas»; placeholders de unidad; prefill de hoy; pintar calidad en la card **Sueño**; confirmar si se pisa el registro del día.
- **Suggested command:** `$impeccable distill`

**[P2] Doble selector + dos «Registrar»**
- **Why it matters:** Cards y pills hacen lo mismo; labels **FC reposo** vs **FC** vs «Frecuencia cardíaca». El nav **Registrar** abre fuerza/cardio; el FAB **Registrar** abre salud.
- **Fix:** un selector (cards o pills). Copy del FAB: **Registrar salud**. El menú del nav debe listar salud o el FAB debe usar otro verbo.
- **Suggested command:** `$impeccable clarify`

**[P2] Semántica de delta rota y calorías a medias**
- **Why it matters:** `delta <= 0` → verde en las 4 cards: más sueño se pinta como fallo. «Quemadas» solo suma cardio, no el gym. El atleta híbrido lee un balance falso.
- **Fix:** color por métrica (sueño↑ bueno, FC reposo↓ bueno, kcal contextual). Leyenda explícita; no fingir TDEE.
- **Suggested command:** `$impeccable colorize`

## Persona Red Flags

**Alex (power / dashboard):** no hay teclado ni last-value. Cada log = sheet 92lvh. No hay lista, edit ni delete. Las pills vacías no aceleran nada. Progreso le da un veredicto en 2 s; Salud le da cuatro em-dashes.

**Casey (móvil, una mano):** el FAB está en zona de pulgar **y** tapado por **En curso**. Drawer 92lvh con handle, sin X. Fecha `type="date"` en locale US. `onOpenAutoFocus` prevenido — el foco no aterriza. El form se tira al cerrar.

**Atleta híbrido (gym / post-carrera):** quiere el peso de hoy y apuntar uno nuevo. No ve «hoy». No puede pulsar **Registrar** con la sesión viva. El menú **Registrar** no ofrece salud. **Calorías** no cuenta el gym. **FC** no muestra la sesión en curso (`sessionHrByDate` solo entra en el gráfico, que no existe). **Calidad del sueño** desaparece tras **Guardar**.

## Cognitive Load

7/8 fallos (carga alta). Fallan: single focus, chunking, visual hierarchy, one thing at a time, minimal choices, working memory, progressive disclosure. Solo grouping pasa.

Decision points >4: **Medidas** (6 campos), calidad 1–5, métrica ×2 (4 cards + 4 pills), bottom nav con dos destinos llamados **Registrar**.

## Emotional Journey

El peak posible es **Guardar**. El end real del empty path es un toast o un tap que no entra. Valles: Tú lleno y Salud hueca; pills que no cambian nada; **En curso** comiéndose **Registrar**; scroll de perímetros antes del peso. El riesgo en el gym no es médico: es perder el log o abrir el workout drawer por error.

## Minor Observations

- `bg-primary/5` en la celda activa viola «el acento es piloto, no lavado».
- Tokens: `--z-index-drawer: 115`, el sheet usa `z-50`.
- Título de gráfico **Calorías** / **Sueño** vs **Evolución del peso** — naming desigual.
- `navigate(..., { state: { tab } })` al abrir por `action: "new"` no escribe `?tab=`.
- Notas van a `medidas` y/o `salud_diaria` según qué bloques tengan dato.
- Detector CLI y overlay coinciden en 10px/11px; el overlay además marca `nested-cards` en el drawer (secciones `rounded-xl border` dentro del sheet).

## Questions to Consider

- Si Progreso se atreve a decir «entrenaste menos…», ¿por qué Salud no dice «hoy no hay peso»?
- ¿Salud es un diario de hoy o un archivo de composición corporal? El drawer responde «las dos» y por eso no es ninguna.
- ¿El menú **Registrar** del nav es el único «nuevo» que el producto cree, y el FAB de Salud es un parche?
- Con un entreno en curso, ¿esta pantalla debería mostrar la FC de *esta* sesión o seguir fingiendo un dashboard de reposo vacío?

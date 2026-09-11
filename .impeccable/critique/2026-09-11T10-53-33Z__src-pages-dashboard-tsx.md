---
target: dashboard
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Dashboard.tsx"
target_fingerprint: "sha256:b490fc2759e50c8e35c203c00fa2feb5e279e9b69df1e67ac875e0735f3e5f2a"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Dashboard.tsx"
timestamp: 2026-09-11T10-53-33Z
slug: src-pages-dashboard-tsx
---
# Critique: dashboard (`src/pages/Dashboard.tsx`)

Method: dual-agent (A: 4db3d717-65e5-4bf5-b0cc-91e7327f0c05 · B: 7ecae9c0-ddb3-48b2-a3b0-b6458394902c)
Mode: Operate · Target: Inicio (`/`) · Live widgets: no vistos (auth / onboarding de username)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeletons y caché cuidadosos; queries sin superficie de error; no hay «estado de hoy» |
| 2 | Match System / Real World | 2 | El calendario habla gym; CTL/ATL, 1RM, XP y un plan solo de rutinas no son el diario híbrido |
| 3 | User Control and Freedom | 3 | Cancelar/drawers/día funcionan; cerrar el wizard borra el borrador; sin undo tras «Eliminar todo» |
| 4 | Consistency and Standards | 2 | «Editar plan» son dos diálogos; «Nuevo entrenamiento» ≠ Registrar; hover de día en puntero grueso; 39 tallas fuera de rampa |
| 5 | Error Prevention | 3 | Borrar plan va con doble confirmación; el CTA espera `plannedKnown`; confirm/replace aún puede racear |
| 6 | Recognition Rather Than Recall | 2 | Código de color/icono del día, chrome solo-icono, número de forma sin modelo en la card |
| 7 | Flexibility and Efficiency | 2 | Reordenar, Mes/Semana y swipe de progreso existen; el camino diario sigue siendo expandir una celda; cardio no está en el día |
| 8 | Aesthetic and Minimalist Design | 2 | Hierro/piloto en cards; cuatro widgets al mismo peso + rejilla de 35 días; 6 `border-l-4` de acento lateral |
| 9 | Error Recovery | 2 | Toasts de mutación (a veces `Error.message` crudo); cargas fallidas = `null` o skeleton infinito |
| 10 | Help and Documentation | 2 | Popover 1RM y consejos de zona existen; sin leyenda del calendario; el drawer de forma vuelca CTL/ATL |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

**LLM (Assessment A):** Materiales propios, arquitectura intercambiable. Tokens, español de tú, cards ~24px, piloto como señal y los discos compartidos fuerza/cardio del calendario son Track Gym. La página es un home de categoría: mes + Banister + Nivel/XP + 1RM, titulado «Inicio», con cuatro iconos sin etiqueta. Una bitácora abriría en la sesión de hoy. Esto abre en un muro de tiles SaaS. El plan y «Nuevo entrenamiento» están cortados a fuerza; el cardio se esconde en BottomNav «Registrar».

**Detector (Assessment B):** 45 hallazgos en `src/components/dashboard` (0 en `Dashboard.tsx`). 39 advisory `design-system-font-size` (10–15px y un 52px de gauge fuera de la rampa de DESIGN.md) y 6 warning `side-tab` (`border-l-4` en filas de `MonthlyPlanner.tsx` y `WeekCalendar.tsx`). El overlay en vivo encontró 1 `layout-transition` (`transition: height` a nivel `body`), pero corrió sobre el onboarding de nombre de usuario, no sobre los widgets de Inicio.

**Overlays:** Inyección OK en la pestaña **[Human]** (`http://localhost:8080/`, live-server :8400). Banner «LAYOUT PROPERTY ANIMATION / transition: height». No es evidencia del muro de widgets: la sesión cayó en «Nombre de usuario» / «Continuar». `localhost:8081` estaba caído.

## Overall Impression

Inicio es un stack oscuro competente, no la bitácora. El objeto más honesto es el disco del calendario (fuerza + cardio + programado en una superficie). El resto compite: forma, recuperación, XP y 1RM piden atención antes de «qué toca hoy». La mayor oportunidad: que Inicio sea una frase y un piloto —hoy, esta sesión— y que el mes, Banister y el 1RM dejen de ser la página.

## What's Working

- Los discos del calendario son el objeto bitácora: rutina, cardio, programado y pasado comparten superficie; el loading usa un disco skeleton, no un flash de color.
- «Crear plan» / «Editar plan» reserva el ancho del label largo (sin CLS); la caché de carga de entrenamiento evita el parpadeo de los gauges.
- «¿Eliminar toda la planificación?» nombra el recuento y la irreversibilidad en tú.

## Priority Issues

- **[P1] No hay superficie operativa de «hoy»**
  - **Why it matters:** Con el teléfono en la mano no se ve qué toca ni se registra el día sin decodificar un mes de discos.
  - **Fix:** Default Semana; bloque Hoy: nombre de lo planificado + piloto Iniciar + hermano cardio. El mes es picker, no la página.
  - **Suggested command:** `$impeccable shape` (superficie Hoy) → `$impeccable layout`

- **[P1] El diario actúa como app de fuerza**
  - **Why it matters:** El panel del día solo ofrece «Nuevo entrenamiento» (icono gym). `ProgramWizard` asigna rutinas, nunca cardio. El disco ya sabe de cardio; la acción no.
  - **Fix:** Mismas acciones de día que Registrar: Fuerza y Cardio. El plan debe poder sostener ambos.
  - **Suggested command:** `$impeccable clarify` (acciones y copy del día) + `$impeccable shape` (plan híbrido)

- **[P1] Muro de widgets**
  - **Why it matters:** «Tu forma hoy», «Tu recuperación», Nivel/XP y «Fuerza Máxima» compiten con la sesión. Carga cognitiva alta (7/8 fallos).
  - **Fix:** Bajar o mover analítica a Tú. Inicio = plan → empezar.
  - **Suggested command:** `$impeccable distill`

- **[P2] Acciones de 28px sin etiqueta**
  - **Why it matters:** Eye/Pencil/Trash a `h-7 w-7`; header `ArrowUpDown` solo con `title`; celdas de 32px. Casey pifia o no encuentra Ordenar.
  - **Fix:** Targets 44px; texto «Ver / Editar / Borrar»; «Ordenar widgets» visible en modo reorder.
  - **Suggested command:** `$impeccable adapt`

- **[P2] El calendario es una cifra + acento lateral de plantilla**
  - **Why it matters:** Gradientes, icono-por-número, `group-hover` en coarse, sin leyenda. Seis `border-l-4` en filas de día son el tell de card con raya. 39 tallas 10–13px fuera de rampa en discos y meta.
  - **Fix:** Marcar hoy; leyenda o chips con nombre; quitar hover en coarse; título de sesión en `aria-label`; acento más sutil que `border-l-4`; devolver type a la rampa (label 12px / body 14px) salvo el número del gauge.
  - **Suggested command:** `$impeccable layout` + `$impeccable typeset`

## Persona Red Flags

**Alex (Power User):** No hay atajo para empezar lo planificado de hoy (Mes → celda → Iniciar). Reordenar existe pero es un `ArrowUpDown` ghost. «Editar plan» abre un chooser (Modificar / Borrar) antes del wizard. El swipe de progreso es el único acelerador que se siente experto. El drawer CTL/ATL es chrome extra, no un atajo.

**Casey (móvil, una mano):** Default mes; discos 32px; Eye/Pencil/Trash 28px en fila (riesgo de borrar). El start primario es un «Iniciar» bajo o un «Crear plan» arriba, no zona de pulgar. Las acciones del header quedan bajo la status bar. «Nuevo entrenamiento» es outline, no piloto. Salir a mitad del wizard pierde el borrador.

**Mar (híbrido gym + ruta):** Misma lengua visual, producto partido: plan y alta del día son gym; cardio solo en Registrar. Forma / 1RM / Nivel son teatro de analítica. Inicio vacío oculta gauges y progreso (`return null`): un híbrido nuevo ve un mes en blanco y «Crear plan», no un diario. Manos ocupadas: no hay un tap «hoy son sentadillas» o «hoy es ruta».

## Cognitive Load

7/8 fallos (alto): foco único, chunking, jerarquía, una cosa a la vez, pocas opciones, memoria de trabajo, progressive disclosure. Agrupación visual de cards sí aguanta.

Puntos de decisión con >4 opciones: cluster del header (ordenar + campana + ajustes + perfil); card del calendario (periodo + chevrons + Mes/Semana + plan + ~35 celdas); picker de mes (12 + Hoy); día expandido (Iniciar + Ver + Editar + Borrar + Nuevo entrenamiento); BottomNav (5); wizard paso 1 (7 selects).

## Emotional Journey

Pico: «Iniciar» en una fila pendiente, o Registrar en zona de pulgar. Valle: primer paint = mes mudo de discos 32px + dos gauges que aconsejan sin que se lo pidan. Cierre: la página muere en XP y el chart de 1RM; tras borrar el plan, un toast y una rejilla vacía. Alta gravedad: solo «¿Eliminar toda la planificación?» se siente serio. Empezar sesión no pide confirm extra (correcto). «Confirmar» del wizard tras `replaceExisting` borra en silencio de más. Cerrar el Plan resetea sin preguntar.

## Minor Observations

- `WeekDayDetail.tsx` está muerto; semana y mes inlinan el mismo panel dos veces.
- Footer de `ProgramWizard` usa `backdrop-blur` (rechazado en chrome).
- `PAGE_CARD` es `rounded-2xl` en móvil, no el token card 24px.
- Chevrons del calendario sin `aria-label`; `AlertDialogAction` de borrar-todo no se deshabilita en pending.
- El popover de 1RM imprime Epley; keys de localStorage siguen en `gym-log.*`.
- Overlay `layout-transition` visto en el gate de username, no en los widgets.
- `ZoneGauge` `text-[52px]` está fuera de rampa; es el número del anillo, no body copy — tratarlo como display intencional al typeset.

## Questions to Consider

- Si Inicio respondiera «qué toca hoy» en una frase y un botón piloto, ¿qué widgets seguirían ganándose el píxel?
- ¿Por qué un día puede llevar cardio en el disco y no en «Nuevo entrenamiento»?
- ¿«Forma» es una decisión, o un trofeo de un dashboard de coaching que el producto dijo no ser?
- ¿Qué sería una bitácora semana-primero si Banister, XP y 1RM vivieran solo en Tú?

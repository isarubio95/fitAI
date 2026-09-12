---
target: profile drawer
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
p2_count: 2
target_identity: "file:C:\\Users\\isaru\\Desktop\\fitAI\\src\\components\\layout\\ProfileDrawer.tsx"
target_fingerprint: "sha256:d3735e69d26da9c788ba9e4bc1719cdfc646a9f8f5c225fb5e30f5f895327f3d"
target_path: "C:\\Users\\isaru\\Desktop\\fitAI\\src\\components\\layout\\ProfileDrawer.tsx"
timestamp: 2026-09-12T11-00-09Z
slug: src-components-layout-profiledrawer-tsx
---
Method: dual-agent (A: 96454f81-19a0-42a6-a80b-ecf80d54bea8 · B: 527c0e17-fc24-414c-b951-7a627cbf8e53)

**Target:** `src/components/layout/ProfileDrawer.tsx` (profile drawer)
**Mode:** Operate · Track Gym · bitácora oscura
**Evidencia:** review de fuente + detector CLI. Inspección en vivo del drawer bloqueada (sin sesión → `/auth`). Overlay inyectado solo en la landing de auth, no en esta superficie.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons y spinner del lápiz bien; `return null` si cae la sesión; «yo / otro» solo se intuye por la ausencia del lápiz |
| 2 | Match System / Real World | 3 | Español tú y «Entrenos» sí; email-como-nombre y metáfora Instagram no son el gym |
| 3 | User Control and Freedom | 2 | Back y bloqueo de capas anidadas bien; sin X/grabber; trigger a la derecha y sheet a la izquierda; no dejar de seguir aquí |
| 4 | Consistency and Standards | 2 | Ajustes sale por la derecha con título; Perfil por la izquierda con título ciego. `Seguir` solo en Comunidad. Gym vs cardio en visibilidad |
| 5 | Error Prevention | 2 | `accept` + tope 8 MB; borra el avatar viejo *antes* de subir el nuevo; lápiz 28px en un cluster de iconos |
| 6 | Recognition Rather Than Recall | 2 | Trigger icon-only; sin estado de follow; dismiss no anunciado; Entrenos no es pulsable |
| 7 | Flexibility and Efficiency | 2 | Tope 5 sesiones, sin atajo a Tú/Actividades, sin filtro gym/cardio, tap de autor propio = noop |
| 8 | Aesthetic and Minimalist Design | 2 | Tokens de hierro sí; dump social + XP + 5 medallas a 10px fuera de rampa; overlay con cristal |
| 9 | Error Recovery | 2 | Toast de upload a veces accionable; empty de entrenos sin salida; avatar perdido si el upload falla a medias |
| 10 | Help and Documentation | 1 | Casi nada contextual. El vacío de logros sí invita a tocar; XP, racha y «Tú» vs avatar no se explican |
| **Total** | | **21/40** | **Acceptable** |

## Design Specificity Verdict

**Start here.** El drawer no se siente autorado para Track Gym. Es un perfil social de plantilla (cabecera Instagram + barra XP + wall de Comunidad) que otra app podría reutilizar cambiando tres labels.

**LLM assessment:** El mundo «Bitácora de Ruta» aparece a trozos —hierro, gym y cardio en el mismo feed, medallas táctiles— pero el chrome lo desmiente. El trabajo canónico (escanear la semana y tocar una sesión, teléfono en el rack) no tiene objeto visual propio. El perfil ajeno ni siquiera tiene `Seguir`: esa CTA vive solo en la búsqueda de Comunidad. Tres gramáticas de superficie en un scroll (header / widget flush / cards de feed) y un trigger icon-only de 26px en un cluster de iconos.

**Deterministic scan:** 3 findings advisory, regla `design-system-font-size` / `10px` — `ProfileDrawer.tsx` L449 (nombre de logro), `LogrosDrawer.tsx` L63 y L189. `GamificationWidget.tsx` limpio. El detector no pilló la sameness estructural (eso no es un token): solo la rampa tipográfica. Esos 10px **confirman** la crítica de lectura con tiza en las manos; no son falso positivo.

**Visual overlays:** la inyección mutó la página y el detector corrió, pero **en `/auth`**, no en el Profile Drawer. No hay overlay fiable sobre el target. Los 3 findings in-page (`radial-spotlight-glow`, `layout-transition`, `dark-glow`) son de la landing de login y **no se atribuyen** a esta superficie.

## Overall Impression

La base de producto está: un diario unificado, medallas con material, skeletons por bloque, capas anidadas que no cierran el padre por error. Lo que falla es el *oficio* del overlay: abre al revés de su trigger, se lee como feed social, y el verbo que importa en un perfil ajeno no está. La mayor oportunidad no es «más polish»: es decidir si esto es una **página de atleta** o un **atajo a Comunidad**, y diseñar solo esa cosa.

## What's Working

1. **Un solo diario en el feed.** `useProfileActivityHistory` mezcla gym + cardio y reutiliza las cards de Comunidad. Eso *es* Track Gym, no dos pieles.
2. **Logros como objeto.** Fila featured (`pickFeaturedLogros`, 5, sin retos) + `LogrosDrawer` por categoría. Lo más táctil de la superficie.
3. **Carga y guardrail de capas.** Skeletons por bloque; lápiz solo en self; `nestedProfileLayerOpen` evita cerrar el padre al tocar fuera de Seguidores/Logros.

## Priority Issues

### [P1] Perfil ajeno sin Seguir / Siguiendo
**What:** `Community.tsx` tiene `toggleFollow` + iconos; el drawer no. Llegas desde notificación o feed y el gesto social no existe aquí.
**Why it matters:** El trabajo «abrir a otra persona y actuar» se parte. Jordan no sabe si ya le sigue. Isa no puede completar el follow sin volver atrás.
**Fix:** CTA piloto `Seguir` / secundaria `Siguiendo` bajo las stats, solo si `!isViewingSelf`.
**Suggested command:** `/impeccable harden`

### [P1] Overlay a sangre, desde el lado contrario, sin salida visible
**What:** Trigger top-right (`aria-label="Perfil"`, avatar `h-6.5` en cluster campana/ajustes). Sheet `direction="left"` + `w-full` (en ~390px tapa el overlay; el primitivo ofrecía `w-[92vw]`). Sin X, sin grabber, título `sr-only`. Ajustes —el hermano— sale por la **derecha** con título «Ajustes».
**Why it matters:** Casey, una mano, tiza: abre por error el icono de 26px y no ve cómo salir. El peek de 8vw que el sistema ya tiene se lo come `w-full`.
**Fix:** Mismo lado que el trigger (o chevron «Cerrar» 48dp), restaurar peek/`max-w-md` sin `w-full`, título visible.
**Suggested command:** `/impeccable adapt`

### [P1] Las «últimas sesiones» son posts de Comunidad, no una bitácora
**What:** Sin heading, sin «esta semana», sin link a Tú/Actividades, tope 5, autor repetido, social + mapa cardio. `Entrenos` es un número muerto. El detector marca los labels de logros a 10px —la misma densidad ilegible se come el scan.
**Why it matters:** Isa no puede escanear la semana ni fiarse de que la sesión 6 exista. Cada card pide 5–6 decisiones (autor, cuerpo, like, comentarios, share).
**Fix:** Filas compactas (título, fecha, 2 métricas), heading «Últimos entrenos», CTA a historial; social y mapa en el sheet. Subir labels de medalla a la rampa (12px / `typography.label`).
**Suggested command:** `/impeccable distill`

### [P2] Identidad rota y vacíos que no enseñan
**What:** `displayName` → email en propio, `"Usuario"` en ajeno. Empty entrenos: una línea muted, sin CTA a registrar. Empty follow: «No hay usuarios para mostrar.» Upload: `storage.remove` del avatar viejo *antes* del upload nuevo (confirmado en `useProfileAvatarUpload`).
**Why it matters:** El primer vistazo al «yo» puede ser un correo. Si el upload falla a medias, la cara anterior ya no está.
**Fix:** Exigir username; empty con «Registrar fuerza / cardio»; no borrar el avatar hasta que el nuevo esté arriba.
**Suggested command:** `/impeccable clarify`

### [P2] Reglas sociales incoherentes
**What:** Cardio ajeno filtra `onlyPublic`; gym (`useWorkoutHistory`) no. Conteos de follow = `.length` de todas las filas en cliente. Lista follow = filas `rounded-md border` tipo tabla, no bitácora.
**Why it matters:** El número «Entrenos» y las cards visibles pueden no cuadrar. Riley no se fía; Alex ve un count caro y frágil.
**Fix:** Misma regla de visibilidad; `count` en servidor; filas táctiles con follow inline.
**Suggested command:** `/impeccable harden`

## Cognitive load

7/8 ítems fallan → **carga alta.** Grouping es el único pass. Punto de decisión >4: cada `WorkoutFeedCard` / `CardioFeedCard` (autor, nombre, detalle, like, comentarios, share).

## Emotional journey

El pico debería ser «esta soy yo esta semana» / «toco su última sesión». El pico real es header de red + XP. Valles: empty de historial sin CTA; perfil ajeno sin relación; foto que puede perderse; salida a ciegas (swipe / Back). El empty de logros es el único gesto amable.

## Persona Red Flags

**Casey (una mano, gym):** cluster top-right, avatar 26px, sheet que cubre todo desde la izquierda, lápiz 28px, stats `p-0`, like/share al pulgar, mapa cardio a media pantalla, cerrar fuera de zona de pulgar.

**Jordan (primera vez):** el avatar no dice «Perfil»; `Tú` en la nav parece el perfil y no lo es; email como nombre; sin Seguir; `3/18` sin leyenda; lista anidada sin «Atrás»; copy de admin.

**Alex (ya entrena):** tope 5 vs `YouActivities` infinito con filtros; tap en su avatar de card reabre lo mismo; no unfollow; follow counts tiran de todas las filas.

**Isa (híbrida, tiza):** no hay «esta semana»; ve lifetime + nivel + 5 medallas *antes* de las sesiones; el detalle existe (`WorkoutDetailsSheet` / `CardioDetailsSheet` 92vh encima), el camino es un scroll social.

## Minor Observations

- `hover:opacity-80` en fila Logros y stats: basura táctil.
- Un `<button>` envuelve 5 medallas; labels truncate a 10px (detector).
- Overlay del primitivo: `backdrop-blur-[3px]` — el brief rechaza cristal en chrome móvil.
- `Profile.tsx` / meta `/profile` residual.
- Comentarios inline pueden abrir un composer *dentro* del drawer.
- Desktop: trigger abajo del sidebar (mejor), sheet sigue siendo left `max-w-md`.

## Questions to Consider

- Si Isa solo puede ver **una** cosa al abrir el avatar, ¿es la última sesión o el recuento de seguidores?
- ¿Por qué el perfil sale por la **izquierda** cuando el affordance está a la **derecha** —y Ajustes ya resolvió el lado correcto?
- ¿El perfil es una **página de atleta** o un **atajo al feed de Comunidad**?
- ¿Un perfil ajeno sin `Seguir` es un perfil o una ficha que olvidó su verbo?
- ¿«Tú» y el avatar pueden seguir siendo dos puertas?

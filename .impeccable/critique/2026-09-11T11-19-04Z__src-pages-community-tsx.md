---
target: comunidad
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
p2_count: 1
target_identity: "file:C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Community.tsx"
target_fingerprint: "sha256:d37613c01e1fed1daa830153710afe488184dc97070aa27eac6ae9d34161ec95"
target_path: "C:\\Users\\PANOi\\Desktop\\fitAI\\src\\pages\\Community.tsx"
timestamp: 2026-09-11T11-19-04Z
slug: src-pages-community-tsx
---
Method: dual-agent (A: e2c23517-5d67-481b-9a34-584b6fa23951 · B: 18315998-36be-4949-a4c0-7b220c40ec73)

# Crítica de diseño — Comunidad

**Superficie:** `src/pages/Community.tsx` (ruta `/community`)  
**Modo:** Operate (feed autenticado, teléfono primero)  
**Nota de evidencia:** Assessment A vio el feed en escritorio (~1280) con sesión y posts reales. Assessment B aterrizó en el gate de username (`/`) y no pudo afirmar overlay: `detect.js` se sirvió pero no se ejecutó de forma verificable. El detector CLI corrió sobre el markup. No hay overlay visible para el usuario.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeletons de feed y búsqueda sí; paginación = solo `Loader2`; follow se `disabled` sin spinner; fallo de red de búsqueda/feed sin estado |
| 2 | Match System / Real World | 3 | Tú, gyms, ritmo, series: idioma de atleta; subtítulo «Usuario» es ruido; share «Mira esta actividad en fitAI» rompe la marca |
| 3 | User Control and Freedom | 2 | `showSearchPanel` sustituye el feed sin limpiar/atrás; unfollow y borrar comentario son un tap, sin undo |
| 4 | Consistency and Standards | 2 | `Seguir` solo en resultados de búsqueda; `ProfileDrawer` no tiene follow; gym gated con `es_publica`, cardio pinta social con `!!social` |
| 5 | Error Prevention | 2 | Unfollow y `Trash2` sin confirmar; comentario vacío sí valida; cuenta propia muestra «Tú» y oculta el botón |
| 6 | Recognition Rather Than Recall | 2 | Hay que saber un handle; placeholder de ejemplo, no de acción; like/comentario/share solo icono+número; el feed follows-only no se declara hasta el vacío |
| 7 | Flexibility and Efficiency | 2 | Infinite scroll sí; cero filtros gym/cardio, cero recientes, cero sugeridos |
| 8 | Aesthetic and Minimalist Design | 3 | Hierro + velo + piloto en nav; la card de búsqueda y la fila social pesan igual que la bitácora |
| 9 | Error Recovery | 1 | Error de `useUserSearch` cae en «No encontramos usuarios con ese nombre.»; `Community.tsx` no lee `isError` del feed |
| 10 | Help and Documentation | 1 | Solo las dos frases de `communityFeedEmptyMessage`; el vacío no apunta al campo ni explica que nunca verás tus posts |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Las cards de sesión están escritas para Track Gym: métricas de bitácora (`Tiempo` / `Ejercicios` / `Series` o `Tiempo` / `Distancia` / `Ritmo`), mini mapa muscular, GPS a sangre, `GymStartMetaRow` con gimnasio real, y el mismo `surface-card` de hierro. Eso no es un clon de Strava. El marco de la página sí es intercambiable: `Card` + «Buscar por nombre de usuario» + `Input` «Ej: juan_gym», resultados que sustituyen el feed, y una fila Instagram de `Heart` / `MessageCircle` / `Share2`. Comunidad es secundaria a ejecutar la sesión; la UI la trata como un mini-Strava con un buscador encima del diario.

**Deterministic scan:** 3 avisos `design-system-font-size` (advisory, exit 0): `ActivitySocialActions.tsx:258` y `:297` (`text-[10px]` en `<time>` y contador `n/max`); `CardioFeedCard.tsx:54` (label de `MetricCell`). `Community.tsx` y `WorkoutFeedCard.tsx` salieron limpios. El detector no ve IA, copy ni estados: no pescó el feed que desaparece, el follow ausente del drawer ni «fitAI».

**Falsos positivos:** `CardioFeedCard.tsx:54` es FP probable: `DESIGN.md` documenta 0.625rem / 10px con tracking wide para microcopy. Los 10px de comentarios son el mismo caso borderline (correctos vs prosa, fuera de la rampa YAML).

**Visual overlays:** no hay overlay fiable. Preflight de mutación OK; live-server en :8400 sirvió `detect.js` (200); el runtime del detector no se observó (sin DOM de overlay, sin logs `impeccable`). El servidor live se paró. Señal de fallback: CLI + captura de escritorio del feed (A) y gate de username (B).

## Overall Impression

El diario compartido funciona: gym y cardio en las mismas cards de hierro. El job social —encontrar gente, seguir, no perder el feed— está a medio diseñar. La mayor oportunidad es dejar de tratar la búsqueda como una pantalla que borra el diario, y poner `Seguir` donde el atleta ya toca (el perfil).

## What's Working

1. **`WorkoutFeedCard` + resumen compacto:** `Tiempo` / `Ejercicios` / `Series` + mini mapa. Es el diario, no un post de red social.
2. **Feed unificado gym/cardio** con el mismo `COMMUNITY_CARD_CLASS` / `PAGE_CARD`: un producto, no dos pieles.
3. **Copy de vacío diferenciada** y primer paint honesto: «Sigue a alguien para ver sus entrenos aquí.» vs «Las personas que sigues aún no han publicado entrenos.»; 4 skeletons, no un spinner huérfano.

## Priority Issues

**[P1] `showSearchPanel` sustituye el feed**  
- **What:** Teclear en el `Input` (`placeholder="Ej: juan_gym"`) oculta `displayFeed`. No hay clear, no hay «Ver entrenos», `Escape` no está cableado. Tras `Seguir` sigues dentro del panel: el motivo de seguir (ver sus entrenos) no aparece.  
- **Why it matters:** El único contenido de valor de la pantalla desaparece en el momento de la acción primaria (encontrar a alguien).  
- **Fix:** Mantener el feed debajo, o un chip de query con × y CTA «Ver feed». Tras follow, cerrar búsqueda o anclar «Ahora verás sus entrenos».  
- **Suggested command:** `$impeccable layout`

**[P1] `ProfileDrawer` no tiene `Seguir` / `Siguiendo`**  
- **What:** El tap natural (avatar / username) abre el drawer con Entrenos / Seguidores / Seguidos. `useFollows` no se usa ahí. Follow solo vive en la fila de resultados.  
- **Why it matters:** Quien abre un perfil no puede completar el job de la página.  
- **Fix:** CTA `Seguir`/`Siguiendo` en el header del drawer (mismo patrón que en búsqueda) si `!isViewingSelf`.  
- **Suggested command:** `$impeccable harden`

**[P1] Descubrimiento = conocer el handle**  
- **What:** No hay sugeridos, recientes ni lista de seguidos. El vacío no nombra el campo. El subtítulo de resultado es siempre «Usuario» (o «Tú»).  
- **Why it matters:** Sin un handle memorizado, Comunidad es una caja vacía.  
- **Fix:** Vacío que apunte al campo + 3–4 cuentas sugeridas o «Seguidos» colapsable. Quitar «Usuario». Placeholder «Nombre de usuario»; el ejemplo como ayuda, no como único label.  
- **Suggested command:** `$impeccable onboard`

**[P1] Errores disfrazados de vacío + share `fitAI`**  
- **What:** `searchResults = []` en error de red muestra «No encontramos usuarios con ese nombre.» El feed no tiene UI de error. Share: `text = "Mira esta actividad en fitAI"`.  
- **Why it matters:** Un fallo se lee como «nadie existe»; el share contradice el nombre de producto.  
- **Fix:** Estados de error con reintentar. Share: «Mira este entreno en Track Gym». Toast destructivo con «Copiar enlace».  
- **Suggested command:** `$impeccable clarify`

**[P2] La fila social y el mapa cardio traicionan Operate**  
- **What:** Tres `Button` ghost `flex-1` h-11, corazón rojo Instagram, share sin cifra. `CardioRouteMap` `h-56` se come el viewport. Deep link `?gym=` / `?cardio=` / `?comments=1` clava el item sin chip. Follow default `h-10` (40px).  
- **Why it matters:** Gym se escanea; cardio no. Las tres acciones sociales no tienen primario.  
- **Fix:** Un primario (like) + comentario + share más quieto; mapa ~h-36 o thumb; chip «Desde notificación» con dismiss; follow `h-11`.  
- **Suggested command:** `$impeccable quieter`

## Persona Red Flags

**Jordan (primera vez):** Ve «Buscar por nombre de usuario» y no sabe de quién. Vacío «Sigue a alguien…» sin puente al input. Si adivina un handle, el feed desaparece. Toca el avatar → drawer sin `Seguir`. Nunca ve sus propios posts y nadie se lo dice.

**Casey (móvil, pulgar, distracción):** Campo de búsqueda arriba, fuera del thumb zone; follow a 40px; `Trash2` `h-3.5` + `p-1`. Query en `useState`, se pierde al cambiar de tab. Comentarios: `Textarea` `min-h-[4.5rem]` + teclado + `BottomNav`. Like/comentario/share icon-only.

**Riley (bordes):** Deep link sin affordance de pin. `?comments=1` abre comentarios pero share no pone `comments=1`. Error de búsqueda = copy de cero resultados. Unfollow y borrar comentario irreversibles. `CardioFeedCard` no mira `es_publica` (el feed filtra públicos; el drawer de perfil no).

**Atleta híbrido (gym / ruta, teléfono):** Las cards de gym se escanean entre series. Una card cardio con mapa `h-56` es una pantalla. Comunidad está a un tab del logger, pero el primer módulo es un buscador, no el diario de los amigos.

## Minor Observations

- `CardTitle` es un `h3` «Buscar por nombre de usuario»; el `Input` no tiene `htmlFor` / `aria-label` / `type="search"`.
- `#header-actions-slot` en esta ruta está vacío.
- Desktop: el `h1` «Comunidad» es `md:hidden`; el content pane no repite el título.
- `max-md:-mb-24 max-md:pb-24` correcto para la nav.
- Comentarios: spinner, no skeleton; «Sé el primero en comentar.» está bien.
- `Siguiendo` con `bg-border` se lee apagado (bien); el `gap-3` icono–label es holgado.
- Sidebar desktop sigue con `backdrop-blur-2xl` (desviación del chrome opaco).
- Feed never-own es regla de producto; hay que decirla en idle, no solo en vacío.

## Cognitive Load

Fallos: **Single focus**, **Visual hierarchy**, **One thing at a time**, **Working memory** (4/8 → alta).  
Puntos >4 opciones: bottom nav (5), sidebar desktop (6), resultados de búsqueda hasta 10.

## Emotional Journey

El pico es la primera card de un amigo: título, sitio real, números, mapa. El valle es teclear un nombre y que el diario se esfuma. Seguir no celebra nada. El final del scroll es un `Loader2` o el silencio. Cero reaseguro si la red falla o si abres el perfil y no hay forma de seguir.

## Questions to Consider

- Si Comunidad es secundaria a registrar, ¿por qué el primer módulo es un buscador que puede borrar el diario?
- ¿Seguir no debería vivir en el perfil, que es donde un atleta toca el avatar?
- ¿El feed follows-only es una tribu o un muro? Sin sugeridos, es un muro con un campo `ilike`.
- ¿La fila like/comentario/share tiene que parecer Instagram, o un margen «me gusta» de bitácora?
- ¿Un mapa GPS de 224px es el entreno, o es el scroll?

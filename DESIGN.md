---
name: Track Gym
description: Bitácora oscura de fuerza y ruta — táctil, operativa, sin cristal.
colors:
  hierro-midnight: "hsl(60 3% 4.5%)"
  hierro-ink: "hsl(60 100% 99%)"
  hierro-card: "hsl(60 3% 11%)"
  hierro-elevated: "hsl(60 3% 8%)"
  hierro-popover: "hsl(60 3% 14%)"
  hierro-secondary: "hsl(60 2% 22%)"
  hierro-muted: "hsl(60 2% 26%)"
  hierro-muted-ink: "hsl(70 4% 72%)"
  hierro-border: "hsl(60 2% 24%)"
  piloto-rack: "hsl(142 71% 45%)"
  piloto-solid: "hsl(142 71% 31%)"
  piloto-on: "hsl(0 0% 100%)"
  peligro: "hsl(0 73% 48%)"
  optimo: "hsl(88 64% 37%)"
  optimo-ink: "hsl(88 45% 88%)"
  optimo-muted: "hsl(88 30% 14%)"
  chart-fitness: "hsl(209 70% 53%)"
  chart-fatigue: "hsl(36 86% 55%)"
  chart-positive: "hsl(88 78% 58%)"
  paper: "hsl(60 8% 92%)"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.025em"
rounded:
  md: "10px"
  lg: "12px"
  card: "24px"
  sheet: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  field: "20px"
  card: "24px"
components:
  button-primary:
    backgroundColor: "{colors.piloto-solid}"
    textColor: "{colors.piloto-on}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "hsl(142 71% 31% / 0.9)"
    textColor: "{colors.piloto-on}"
    rounded: "{rounded.lg}"
    height: "40px"
  button-new:
    backgroundColor: "{colors.piloto-solid}"
    textColor: "{colors.piloto-on}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.hierro-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.hierro-midnight}"
    textColor: "{colors.hierro-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.hierro-midnight}"
    textColor: "{colors.hierro-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.hierro-card}"
    textColor: "{colors.hierro-ink}"
    rounded: "{rounded.card}"
    padding: "24px 20px"
  chip-filter:
    backgroundColor: "hsl(60 2% 26% / 0.4)"
    textColor: "{colors.hierro-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  chip-filter-active:
    backgroundColor: "color-mix(in srgb, hsl(142 71% 45%) 22%, black)"
    textColor: "color-mix(in srgb, hsl(142 71% 45%) 55%, white)"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  nav-item-active:
    backgroundColor: "transparent"
    textColor: "{colors.piloto-rack}"
    typography: "{typography.label}"
---

# Design System: Track Gym

## Overview

**Creative North Star: "La Bitácora de Ruta"**

Track Gym se ve como el instrumento que llevas al gym y a la carretera: una bitácora oscura, densa y táctil. El fondo es casi negro cálido; las superficies flotan un escalón por encima; el acento es un piloto, no un lavado de color. No es una landing de fitness ni un dashboard SaaS. Es una app de operación que se usa con el dedo, a menudo con las manos ocupadas.

La personalidad es segura y quieta. El tema por defecto es oscuro (clase `.dark`, no `prefers-color-scheme`). El claro existe como el mismo sistema en papel cálido, no como otra marca. El acento de fábrica es verde; el usuario puede cambiarlo (naranja, amarillo, rosa, azul) y eso remapea `--primary`, no inventa un segundo mundo. Fuerza y cardio comparten las mismas superficies: no hay piel «gym» y piel «Strava».

Rechazos confirmados: vidrio esmerilado en el chrome móvil, neón de gym, gradientes hero, Material genérico de plantilla, hover que se queda pegado en táctil.

**Key Characteristics:**
- Oscuro cálido primero; claro como par de papel, no como identidad.
- Acento como piloto: activo, CTA y señal. Casi nunca un fondo entero.
- Volumen por velo + filo; sombra solo apoya. Chrome de app opaco.
- Táctil: scale al pulsar, sin anillo de foco en puntero grueso.
- Una sola familia de sistema; sin webfont de marca.

## Colors

Paleta de hierro cálido (matiz ~60°) con un único piloto saturado. Los tokens canónicos son HSL en `src/index.css`; el hex `#0c0c0b` es el equivalente de chrome (PWA / splash) del fondo oscuro.

### Primary
- **Piloto de rack** (`piloto-rack`): marca activo, anillo, icono de tab y señal de «esto está vivo». En oscuro es más luminoso que el relleno sólido.
- **Piloto sólido** (`piloto-solid`): relleno de CTA. Más oscuro a propósito para texto blanco ≥4.5:1. Los botones filled usan este token, no el piloto brillante.
- **Piloto on** (`piloto-on`): texto e icono sobre sólido.

### Secondary
No hay segunda marca. `hierro-secondary` y `hierro-muted` son grises cálidos de apoyo (chips inactivos, filas, hover de ratón). El usuario elige otro matiz de acento; eso no crea un secundario de sistema.

### Neutral
- **Hierro de midnight** (`hierro-midnight`): lienzo de la app en oscuro. Equivalente chrome `#0c0c0b`.
- **Hierro ink** (`hierro-ink`): texto principal.
- **Hierro card / elevated / popover**: escalones tonales. Card flota sobre midnight; elevated es el chrome (un peldaño bajo la card); popover un peldaño sobre la card.
- **Hierro muted ink**: metadatos, tabs inactivos, ayuda.
- **Hierro border**: divisores y anillos inset de outline.
- **Papel** (`paper`): lienzo del tema claro (`#ecece9`). Los mismos roles se remapearon a neutros cálidos más altos; no es otra paleta.

### Semantic
- **Peligro** (`peligro`): destructive, error de campo.
- **Óptimo** (`optimo` + muted/ink): éxito, zona de forma, toasts sociales.
- **Chart fitness / fatigue / positive**: series de carga y cardio. Fitness (azul) identifica cardio frente al piloto verde de la app.

**The Pilot Rule.** El acento marca activo, CTA y señal. No rellena fondos de pantalla ni skins enteras. Si duda, muted.

**The One Accent Ramp Rule.** Naranja, amarillo, rosa y azul son el mismo rol `--primary` con otro matiz. No documentar cada uno como marca. El default es el piloto verde.

## Typography

**Display Font:** ui-sans-serif / system-ui (sin webfont)
**Body Font:** la misma pila
**Label/Mono Font:** la misma; números de timer usan `tabular-nums` / `font-mono` solo en cronos

**Character:** Tipografía de sistema a propósito. En el gym no carga una display. La jerarquía vive en peso y tamaño, no en el corte de una marca.

### Hierarchy
- **Display** (700, 1.875rem / `text-3xl`, tracking tight): títulos de auth y momentos de entrada. Poco uso dentro de la bitácora.
- **Headline** (600, 1.5rem / `text-2xl`, leading none): títulos de card.
- **Title** (600, 1.125rem / `text-lg`; 1.25rem en `md`): título de página en el header.
- **Body** (400, 0.875rem / `text-sm`): UI densa. En campos móviles, 1rem (`text-base`) para que iOS no haga zoom.
- **Label** (500, 0.75rem; nav a 0.625rem / 10px con tracking wide): tabs, microcopy, bottom nav.

**The System Face Rule.** No introducir una webfont de «marca fitness». El sistema del aparato es la voz. Display decorativa = otra app.

## Layout

Teléfono primero. El corte `md` (768px) cambia el shell: abajo, header + bottom nav a sangre; desde `md`, sidebar 16rem y sin bottom nav. El contenido lleva `pb-24` en móvil para no morir bajo la barra.

Ritmo: 8 / 16 / 20 / 24. Cards internas `px-5` (20px) y `py-6` (24px). Gaps de 8px entre icono y label de nav. Safe-area: `env(safe-area-inset-*)` en header y bottom nav; `--app-bottom-nav-inset` se mide de verdad (fuente del sistema incluida).

Scrollbars ocultos bajo 768px. `touch-action: manipulation` en controles; `pan-y` dentro de drawers laterales para no matar el swipe de cierre. Long-press no selecciona texto (el gesto es drag).

Navegación de secciones: view transition solo en `<main>` (eje compartido, 24px). Header y nav no viajan. Paneles a pantalla completa (Tú, Biblioteca) aparecen sin fade: un fade sobre midnight se lee como parpadeo negro.

**The Finger-First Rule.** Hover existe solo con puntero fino. En táctil, el estado es `[data-pressed]` (scale 0.965, opacity 0.8, 80ms in / 180ms out). Sin anillo de foco en coarse. Sin `maximum-scale` bloqueado.

## Elevation & Depth

Híbrido tonal + sombra estructural. El volumen lo da un velo en degradado (`--sheen-card`) y un filo cenital (`--hairline`) sobre el color de la propia superficie. La sombra (`--elevation-card` / `--elevation-float`) solo apoya. El fondo de página es casi plano: cuatro orbes de acento al 3–10% de opacidad, en una capa fija que no se repinta al hacer scroll.

Header móvil y bottom nav son opacos (`--background-fill`, sin backdrop-filter). La sidebar de escritorio aún usa blur: es una desviación; el chrome nuevo sigue la regla opaca.

Cards anidadas y cards dentro de un drawer se aplanan (sin velo, sin borde, sin sombra) para no reiniciar el volumen a media tarjeta. Excepción: `.surface-region-page` dentro de drawer recupera superficie en la card exterior.

La pill de descanso es la única pieza flotante con cristal (`bg-neutral-900/80` + blur): un instrumento sobre la bitácora, no el chrome.

### Shadow Vocabulary
- **Card** (`--elevation-card` → utilidad `shadow-elevated`): inset hairline + contacto 1px + mancha suave. Contenido.
- **Float** (`--elevation-float` → `shadow-float`): misma receta, más profunda. Chrome que flota, no header/nav de app.
- No usar la clase `shadow-card`: Tailwind la lee como color de sombra, no como elevación.

**The Opaque Chrome Rule.** Header y bottom nav son pintura sólida. El cristal no es el lenguaje del shell.

**The Nested Flat Rule.** Una card dentro de otra (o de un drawer) pierde velo, borde y sombra. El volumen se declara una vez.

## Shapes

Radio base `--radius` = 0.75rem (12px). Escala: md 10px (campos, ghost), lg 12px (CTA default), card 24px (`rounded-3xl`), pills `rounded-full`. Sheets inferiores: 24px arriba + squircle si el motor lo soporta. Sheets superiores: 16px. Drawers laterales: esquina cuadrada a sangre.

Filo 1px con `--surface-border` (oscuro: blanco al 7%). Hairline inset simula luz cenital, no un borde extra de acento.

En logger, las cards van a sangre dentro del drawer (radio 0). Una lista tipo página recupera `rounded-2xl` / `rounded-3xl` en `md`.

**The Capsule Signal Rule.** Filtros, tabs de sección y CTAs «nuevos» son cápsulas. Los botones de acción primaria de formulario son 12px, no pills. No mezclar.

## Components

Táctil y seguro: el dedo nota el apoyo. CTAs pesados, pills inequívocas, campos quietos.

### Buttons
- **Shape:** CTA default 12px (`rounded-xl`), alto 40px, `font-semibold`. Variante `new`: cápsula 36px.
- **Primary:** `piloto-solid` + texto blanco + ring inset `piloto` al 70%. Hover de ratón: lift −2px y sólido al 90%. Active: +1px. Táctil: el lift no aplica; manda `[data-pressed]`.
- **New:** mismo sólido, cápsula, ring de acento más suave. Alta para «crear».
- **Outline / filter / secondary / ghost:** superficie de hierro, ring de `input`/`border`. Hover de ratón: velo de acento al 55% (30% en oscuro). Sin lift.
- **Destructive:** `peligro`; hover baja brillo.
- **Link:** texto piloto, underline al hover.
- Tras un tap táctil, el botón hace `blur()` para no dejar foco fantasma.

### Chips
- **Filter pill:** cápsula, borde 20% , fondo muted/40. Activa: `color-mix` 22% piloto sobre negro, texto 55% piloto + blanco. Eso es el piloto, no un sólido de CTA.
- **Filter chip (toggle de catálogo):** inactiva transparente + muted ink; activa secondary con borde piloto al 35%.

### Cards / Containers
- **Corner Style:** 24px en página; 0 a sangre en logger; 16–24px si la card es una región de página dentro de drawer.
- **Background:** `hierro-card` + clase `surface-card` (velo + borde + `shadow-elevated`).
- **Shadow Strategy:** ver Elevation. Anidadas, planas.
- **Internal Padding:** 20px horizontal, 24px vertical en header; content `px-5 pb-6`.
- **Tiles:** `surface-tile` — hundidas, velo corto, sin sombra propia.

### Inputs / Fields
- **Style:** 40px, radio 10px, borde `input`, fondo midnight/paper. Placeholder muted.
- **Focus:** borde `ring` + anillo 3px al 50% (solo puntero fino / teclado).
- **Error:** borde y anillo `peligro`.
- **Móvil:** `text-base` (16px) para bloquear el zoom de iOS. Destello `set-value-flash` al aplicar una sugerencia de peso.

### Navigation
- **Móvil:** 5 destinos, el centro es Registrar (fuerza / cardio). Icono 24px, label 10px. Activo = color piloto + `nav-icon-pop` (scale 0.94→1). Barra opaca, borde superior, padding de safe-area.
- **Tabs de sección:** underline 2px piloto que crece desde el centro (0.28s). Sin underline fantasma al desactivar.
- **Escritorio:** sidebar 16rem, filas 12px radio; activa = texto piloto + fill 10%. «Crear Nuevo» es el CTA primary, no un FAB.

### Rest Timer Pill (signature)
Instrumento flotante, arrastrable. Cápsula oscura con blur (excepción consciente), icono en disco fitness/éxito, barra de progreso, `tabular-nums`. No es chrome de app; no copiar su cristal al header.

### Sheets
Vaul, fondo `background`, handle 44×5px. Cierre por gesto. El logger puede abrir en círculo desde la pill (transition-style), no con el slide por defecto.

## Do's and Don'ts

### Do:
- **Do** pintar CTAs filled con `piloto-solid`, no con `piloto-rack`.
- **Do** usar `surface-card` / `surface-tile` / `surface-float` en vez de inventar sombras.
- **Do** aplanar cards anidadas y cards dentro de drawer.
- **Do** reservar hover a puntero fino; en táctil, `[data-pressed]`.
- **Do** dejar inputs móviles a 16px y el pinch-zoom desbloqueado.
- **Do** tratar fuerza y cardio con las mismas superficies; el azul `chart-fitness` señala dato de ruta, no otra marca.

### Don't:
- **Don't** poner `backdrop-filter` en header o bottom nav.
- **Don't** usar la clase `shadow-card` para elevación.
- **Don't** rellenar una pantalla con acento ni crear una piel distinta para cardio.
- **Don't** introducir webfont de display, neón, o vidrio de marketing.
- **Don't** dejar estilos `hover:` visibles en WebView táctil.
- **Don't** animar el chrome en el view-transition de pestaña.
- **Don't** tratar `fitAI` como nombre visual; el wordmark es Track Gym + `/logo.svg`.

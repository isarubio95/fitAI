# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Persona que entrena **fuerza y cardio** (híbrido). Situación: en el gimnasio o en ruta, casi siempre con el teléfono. El trabajo: planificar la semana, registrar la sesión (series o track GPS/FC) y ver si progresa, sin cambiar de app.

No hay audiencia de coaches ni de solo-fuerza / solo-endurance como usuario primario.

## Product Purpose

Track Gym es el diario de entrenamiento: planificar rutinas y la hoja de ruta semanal, ejecutar fuerza y cardio (incluido cardio en vivo), y ver evolución. Existe para que fuerza y ruta vivan en el mismo sitio.

Éxito: el usuario cierra el ciclo plan → sesión → historial en un solo producto, en el gym y en la carretera.

## Positioning

Un solo diario para planificar, ejecutar fuerza y cardio, y ver evolución. Strong/Hevy no cubren el cardio en vivo con verdad; Strava no cubre el logger de fuerza. Track Gym reclama ese diario unificado, no un segundo Strava ni un clon de Hevy.

## Operating Context

- **En el gym:** manos ocupadas, series (peso × reps, duración, RIR), temporizador de descanso, catálogo de ejercicios, rutinas.
- **En ruta:** grabación en vivo con GPS, frecuencia cardiaca por Bluetooth LE o Health Connect (solo lectura de FC).
- **Teléfono primero:** PWA y APK Android (`com.trackgym.app`). Hay layout de escritorio (sidebar), pero el uso canónico es móvil.
- **Idioma de producto:** español (tú). Auth con Supabase; sin sesión no hay app.
- **Lugar:** directorio de gimnasios España; rutas cardio predefinidas de La Rioja.
- **Importación:** historial y/o rutinas desde Lyfta (la API key no se guarda).
- **Hoy el código es un único shell web** (React + Vite) envuelto en Capacitor en Android. `adaptive` es la meta de lenguaje por OS, no el estado actual. **iOS no está publicado.**

## Capabilities and Constraints

**Ya existe**

- Logger de fuerza: sesiones, series, descanso, RIR, planes de series.
- Logger y grabador cardio en vivo (GPS, `sport_detail`, FC BLE / Health Connect).
- Rutinas (CRUD, plantillas, orden drag-and-drop) y catálogo de ejercicios (~750).
- Planificación semanal / calendario mensual.
- Evolución, historial, carga de entrenamiento («tu forma hoy»).
- Comunidad (feed, perfil, seguimientos, notificaciones in-app).
- Directorio de gimnasios, tema/acento, perfil, gamificación (nivel, XP, racha).
- Borrado de cuenta, política de privacidad, PWA.

**No está publicado — no tratarlo como producto actual**

- Dictado de series on-device (propuesta).
- Compañero / mascota «Forma» (propuesta).
- App iOS.

**Restricciones**

- El nombre de producto es **Track Gym**. El directorio del repo (`fitAI`) y restos de copy «fitAI» no son marca.
- Propietario; autor Isaías Rubio. No dirigida a menores de 14 años.
- En Android, los GIF del catálogo no van en el AAB (límite Play); se sirven desde Storage.
- Health Connect: únicamente `READ_HEART_RATE`.
- Si se construye voz: push-to-talk, mismo formulario que el teclado, offline, el audio no sale del teléfono.
- **Abierto:** calendario de iOS; cuándo el shell web debe bifurcarse en lenguajes nativos (Material / HIG) de verdad.

## Brand Commitments

- Nombre: Track Gym. Manifest / PWA: «Tu compañero de entrenamiento».
- Logo: `/logo.svg`.
- Voz: español informal de tú («Bienvenido de nuevo a Track Gym», «Empieza a registrar tus entrenos»).
- No hay paleta, tipografía o mundo visual fijados aquí.

## Evidence on Hand

- Catálogo real de ejercicios y taxonomía en repo / Supabase.
- Scripts de importación de gimnasios España y rutas predefinidas La Rioja.
- Política de privacidad (`public/privacypolicy.html`, ruta `/privacidad`).
- Historial de entrenamiento real del autor en docs internos de planificación: no es testimonio público.

No hay clientes nombrados, benchmarks, prensa, precios ni testimonios. El trabajo futuro no los inventa.

## Product Principles

1. **Un diario.** Fuerza y cardio son el mismo producto, no dos pieles.
2. **Registrar donde se entrena.** Gym y ruta, teléfono en la mano.
3. **Ejecución antes que conversación.** El formulario de la sesión es el producto.
4. **No vender lo que no existe.** Ni IA, ni mascota, ni iOS, ni prueba social inventada.
5. **Nativo al aparato.** Web/PWA, Android y un futuro iOS deben respetar el OS; la marca sigue siendo Track Gym.

## Accessibility & Inclusion

- Interfaz en español.
- El pinch-zoom no se bloquea (`maximum-scale` no se fija).
- No dirigida a menores de 14 años.
- Datos de salud: solo lectura de frecuencia cardiaca.
- No hay estándar WCAG u otra necesidad de usuario confirmada más allá de esto.

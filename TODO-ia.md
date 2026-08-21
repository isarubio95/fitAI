# IA on-device para Track Gym

Notas sobre el estado actual: la app **no** usa modelos de IA. El matching de ejercicios es por normalización + sinónimos (`matchExerciseByName.ts`). Los títulos son plantillas por hora. El logger de fuerza ya persiste series al vuelo (`addSet`, `onUpdateSet`, `handleSetCompleted` → descanso).

**Apuesta de producto:** voz → registro directo en el entrenamiento activo. El resto de IA (OCR, embeddings, pose, LLM de títulos) es soporte o viene después.

---

## 1) Por qué esta feature y no un chat

En el gym las manos están en la barra, el teclado es hostil y el sótano no tiene cobertura. Lo que duele hoy es **escribir 100 × 8 × RIR 2** entre series.

La voz no es un asistente. Es el mismo gesto que el teclado, por otro canal:

> dices *«cien kilos, ocho, RIR dos»* → aparece la serie, se marca hecha, arranca el descanso.

Si eso falla (ruido, número mal oído, ejercicio equivocado), el usuario deja de usarlo a la segunda sesión. Por eso el diseño es **estrecho, predecible y deshacible**, no conversacional.

Reglas:

1. Push-to-talk. Nunca escuchar en continuo.
2. Escribe en el **mismo formulario** que el teclado (`SetFormData`). Cero paths paralelos de guardado.
3. Offline obligatorio.
4. Audio **no sale** del teléfono.
5. Si el modelo no está, el logger sigue igual; el mic simplemente no se muestra (o explica por qué).

---

## 2) Cómo se siente (UX)

Sitio: entrenamiento **activo**, barra flotante (`WorkoutFloatingActionBar`). No un mic por cada `ExerciseCard`: con las manos ocupadas no vas a hacer scroll hasta la tarjeta correcta.

```text
[ cancelar ]  [ pausa ]  [ + ejercicio ]  [ 🎤 ]     [ Terminar ]
```

El mic es el cuarto botón redondo, mismo tamaño (48 px) que el resto. Solo visible si hay sesión activa y STT disponible.

### Gesto

1. **Mantener** el mic (no un tap suelto): empieza a grabar.
2. Háptico corto al empezar. El botón pulsa / onda mínima. Texto discreto: *Escuchando…*
3. Soltar: deja de grabar, háptico, estado *Registrando…* (< 1–2 s).
4. Éxito: la fila de la serie se rellena, se marca el checkbox de hecha (mismo path que `handleSetCompleted`), arranca el descanso.
5. Toast corto con **Deshacer** (~4 s): *Press banca · 100 kg × 8 · RIR 2*.

Tap corto sin mantener: no graba; opcionalmente un hint *Mantén pulsado para dictar*.

### Qué ve el usuario

- La serie **ya está en la tabla**. No hay modal de confirmación en el caso feliz (eso mata “directamente”).
- Confirmación = highlight de la fila + toast con deshacer.
- Si hay duda (dos presses, no se oyeron los kilos): **sheet de 1 decisión**, no un chat. Ejemplo: *¿100 kg × 8 en Press banca?* [Sí] [Editar] [Descartar].

### Contexto que usa la frase

El parser no adivina en el vacío. Recibe:

| Contexto | Para qué |
|---|---|
| Ejercicio **focal** (último tocado, o el de la serie incompleta) | *«cien por ocho»* sin decir el nombre |
| Ejercicios ya en la sesión | *«ahora aperturas»* cambia de tarjeta, no duplica |
| Modo de registro (`peso_reps` / `duracion` / `duracion_ritmo`) | no interpretar “45” como kilos en planchas |
| Última serie hecha de ese ejercicio | *«el mismo peso, seis»*, *«drop 80»* |
| Valores precargados (`seededFromPrevious`) | la voz **confirma** y marca hecha, o **pisa** el seed |
| `targetRir` del ejercicio | si no dices RIR, se puede copiar el objetivo (igual que hoy no es obligatorio por serie) |

Focal por defecto: el ejercicio que tiene una serie vacía o solo seed; si todos están hechos, el último ejercicio de la lista.

---

## 3) Qué se puede decir (intents)

MVP = pocas frases, muy fiables. El resto espera.

### MVP (peso × reps)

El 90 % del logger es `registro_series === "peso_reps"`.

| Dices | Significa |
|---|---|
| *«cien kilos, ocho»* / *«100 por 8»* / *«100x8»* | kg + reps en el ejercicio focal |
| *«ocho reps a 80»* | igual, orden inverso |
| *«RIR dos»* / *«al fallo»* / *«a una»* | RIR 2 / 0 / 1, junto con la serie o corrigiendo la última |
| *«press banca, 100 kilos, 8»* | cambia o crea ese ejercicio y registra |
| *«el mismo, seis»* / *«igual, 6»* | peso de la última serie hecha, reps nuevas |
| *«hecho»* / *«marca»* | marca hecha la serie focal (si ya tiene números) y arranca descanso |

Números en cifras o en palabras: *cien*, *ochenta y dos*, *setenta coma cinco*, *ciento dos y medio*.

### Después del MVP

| Dices | Significa |
|---|---|
| *«añade sentadilla»* | `onAddExercise` como el selector, sin serie |
| *«siguiente»* | pasa el focal al siguiente ejercicio de la rutina |
| *«drop set 80»* / *«segunda, 90 por 6»* | nueva serie o índice explícito |
| *«cuarenta y cinco segundos»* | modo `duracion` |
| *«cinco minutos a ritmo tres treinta»* | modo `duracion_ritmo` (más frágil; no es P0) |
| *«borra la última»* | `onRemoveSet` de la última hecha + toast deshacer |

Fuera de intents: charla, técnica, “¿cuánto llevo de volumen?”. Si no parsea, toast *No te he pillado* y nada se escribe. Nunca inventar kilos.

---

## 4) Pipeline (voz → `SetFormData`)

Tres etapas. La 2 es la que da el “directamente”; la 1 y la 3 son fontanería.

```text
Audio (push-to-talk)
    → 1. STT on-device → texto
    → 2. Extractor TS (reglas) → VoiceLogIntent
    → 3. Aplicar al logger (addSet / onUpdateSet / handleSetCompleted)
```

El LLM **no** está en el camino feliz. Entra solo si las reglas no sacan kg+reps y el dispositivo tiene Nano, y aún así el resultado pasa por el mismo schema. Si el LLM alucina un 180 kg, el umbral de “cambio vs. última serie” puede pedir confirmación (> p. ej. +30 % de peso).

### 4.1 Contrato del intent

```ts
type VoiceLogIntent =
  | {
      type: "log_set";
      ejercicioHint?: string;      // texto oído, opcional
      ejercicioIndex?: number;     // resuelto contra la sesión
      peso_kg?: number | null;
      repeticiones?: number | null;
      rir?: number | null;         // 0 = al fallo
      duracion_seg?: number | null;
      ritmo_seg_km?: number | null;
      complete: boolean;           // default true en MVP
      relative?: "same_weight" | "same_reps";
      confidence: number;          // 0–1
    }
  | { type: "complete_current"; confidence: number }
  | { type: "add_exercise"; nombre: string; confidence: number }
  | { type: "undo" }
  | { type: "unknown"; raw: string };
```

Aplicación de `log_set` (MVP):

1. Resolver ejercicio: hint → match en `exercises[]` de la sesión → si no, match de catálogo y **añadir** como `onAddExercise` → si sigue duda, sheet.
2. Elegir fila: primera serie no `completed` de ese ejercicio; si todas hechas, `addSet`.
3. Patch de campos presentes (no poner 0 en lo que no se dijo: si solo dices reps, el peso puede ser el seed o la última hecha).
4. Si `complete`, llamar `handleSetCompleted(..., true)` para persistir la fila completa y arrancar el timer (el logger ya guarda reps/peso al marcar hecha porque el `onBlur` del input a veces no dispara en móvil).
5. Scroll hasta esa `ExerciseCard`.

Gancho de código:

- UI mic: `WorkoutFloatingActionBar.tsx`
- Aplicar: `WorkoutLogger.tsx` (`addSet`, `handleSetCompleted`, añadir ejercicio)
- Campos: `SetFormData` / `ExerciseFormData` en `src/types/workout.ts`
- Matcher: `matchExerciseByName.ts` (y embeddings más adelante, si hace falta)

### 4.2 Extractor (reglas, testeable sin Android)

Módulo puro: `src/lib/voiceLog/parseVoiceLog.ts`.

Entrada: `{ text, context }` → `VoiceLogIntent`.

El context trae nombres de ejercicios de la sesión (para preferir “banca” = el press banca que ya está, no uno nuevo).

Patrones a cubrir en tests (`src/test/lib/parse-voice-log.test.ts`):

| Texto | Esperado |
|---|---|
| `100 kilos 8 reps` | 100 kg, 8 reps |
| `cien por ocho` | 100, 8 |
| `80x6 RIR 2` | 80, 6, rir 2 |
| `al fallo 12` | reps 12, rir 0 |
| `el mismo seis` | relative same_weight, reps 6 |
| `press banca 100 8` | hint “press banca”, 100, 8 |
| `hecho` | `complete_current` |
| `vamos tío` | `unknown` |
| `setenta coma cinco por cinco` | 70.5, 5 |
| `45 segundos` | duracion 45 (solo si el modo del focal es duración; si no, unknown o confirmación) |

Números en palabras: tabla ES hasta 200 + *y medio* + *coma*. No hace falta un LLM para esto.

Matching del hint: primero `normalizeExerciseName` + sinónimos contra la **sesión**; luego contra el catálogo. Un “press” ambiguo con dos presses en la sesión → sheet, no el primero de la lista.

### 4.3 STT (qué modelo)

La transcripción es el eslabón débil: música, hierros, distancia al móvil.

Orden de prueba, no de fe:

1. **Android SpeechRecognizer** (0 MB, ya en el sistema). Si en un gym real saca bien números y nombres en castellano, nos quedamos aquí para el MVP.
2. Si falla por ruido: **Whisper Tiny / Tiny.es** int8 (~40–80 MB), descarga opcional, no en el APK base (`android:strip-heavy`).
3. **Moonshine Tiny** solo si Whisper se queda corto de latencia en gama media.
4. **Gemini Nano audio** donde exista AICore: transcribe + extrae en un paso, pero el resultado **se valida** contra el mismo schema. Fallback a (1)/(2) si no hay Nano.

Criterio del spike (20–30 frases grabadas en gym): no mirar WER de la frase entera; mirar si **salen los números y el nombre del ejercicio**. *«eh bueno pues 100 por 8»* está bien si el extractor recibe 100 y 8.

Latencia objetivo: soltar el botón → serie en pantalla **< 1,5 s** con SpeechRecognizer, **< 2,5 s** con Whisper Tiny.

Runtime: **plugin nativo Capacitor**, no transformers.js en el WebView.

---

## 3) Restricciones (Android + Capacitor)

La UI vive en un WebView. El STT serio es nativo.

| Capa | Qué hace |
|---|---|
| JS / React | Gesto del mic, pasar contexto del logger, aplicar el intent, toast deshacer |
| Extractor TS | Texto → `VoiceLogIntent` (tests Vitest, sin dispositivo) |
| Plugin Capacitor | Micrófono, STT, `isAvailable()` |

- Mic: permiso al **primer** maintain del botón, no al abrir el logger.
- No `RECORD_AUDIO` en background. Al soltar, se corta el stream.
- Audio en memoria / archivo temporal y se borra al parsear. No se sube a Supabase.
- Sin STT: el botón no está. Cero degradación del logger.
- iOS fuera de esta fase (el nativo hoy es Android).

---

## 5) Backlog de voz → registro

Esto es el camino crítico. Lo demás del documento espera.

### Spike 0 — extractor sin micrófono

- [ ] **`parseVoiceLog` + corpus**
  - **Qué:** función pura texto+contexto → intent, con ~40 casos ES (cifras, palabras, RIR, “el mismo”, unknown).
  - **Por qué:** es el 80 % de “directamente” y se puede mergear sin tocar Android ni permisos.
  - **Cómo:** `src/lib/voiceLog/parseVoiceLog.ts` + `src/test/lib/parse-voice-log.test.ts`. Reutilizar `normalizeExerciseName` / `matchExerciseByName` para el hint.
  - **Criterio:** los casos de la tabla del §4.2 en verde. Ningún `unknown` que sea una serie obvia; ningún `log_set` inventado a partir de *«vamos»*.

- [ ] **Aplicar intent al estado del logger (sin STT)**
  - **Qué:** `applyVoiceLogIntent(exercises, intent)` → nuevo estado + acción (`complete`, `addSet`, índice focal).
  - **Por qué:** desacopla “qué dijo” de “cómo se oye”. Permite un campo de debug *pegar frase* en desarrollo.
  - **Cómo:** usar `defaultSetForMode`, no picar 0 en campos no dichos, respetar `seededFromPrevious`. Tests con un `ExerciseFormData` de banca de 3 series.
  - **Criterio:** *«100x8»* sobre una serie seed la pisa, marca complete y no duplica fila si había hueco.

### Spike 1 — mic en el logger

- [ ] **Botón push-to-talk en `WorkoutFloatingActionBar`**
  - **Qué:** mantener para grabar, soltar para parsear. Háptico + estado escuchando.
  - **Por qué:** es el gesto que se puede usar con tiza / magnesio / una mano.
  - **Cómo:** pointer events (`onPointerDown` / `onPointerUp` / cancel en `pointerleave` del botón). Deshabilitado si el entreno está en pausa? **No**: pausa es el reloj, no el registro. Sí deshabilitado si `creatingActive` / `saving`.
  - **Cuidado:** no pelear con `data-vaul-no-drag` del drawer. Hit area ≥ 48 px.

- [ ] **Plugin Capacitor STT mínimo**
  - **Qué:** `start()` / `stop()` → `{ text, confidence }` usando SpeechRecognizer. `isAvailable()`.
  - **Por qué:** sin nativo no hay feature real; Whisper puede esperar al resultado del spike de ruido.
  - **Criterio:** en emulador o un Pixel, una frase clara en silencio produce texto. En Web/PWA el plugin no existe y el mic no se pinta.

- [ ] **Permiso de mic + privacidad**
  - **Qué:** pedir al primer uso; texto en política y Play Store.
  - **Cómo:** actualizar `privacypolicy.html` **antes** de publicar. Copy: el audio se procesa en el dispositivo y no se sube.
  - **Criterio:** denegar el permiso = toast *Sin micrófono no puedo dictar* y el logger intacto.

### Spike 2 — el “directamente”

- [ ] **Cablear STT → parse → `handleSetCompleted`**
  - **Qué:** el camino feliz de una frase a serie hecha + descanso + scroll a la tarjeta.
  - **Gancho:** `WorkoutLogger.tsx` (~`addSet` L662, `handleSetCompleted` L858).
  - **Cuidado:** persistir la **fila completa** al marcar hecha (el logger ya lo hace porque el blur del input falla en móvil). No hacer un segundo insert.
  - **Undo:** snapshot de `exercises` pre-intent y restaurar si pulsa Deshacer (y revertir `completed` + timer si hace falta).

- [ ] **Sheet de desambiguación (solo si hace falta)**
  - **Qué:** 1 pregunta, 2–3 opciones, no un diálogo de IA.
  - **Cuándo:** hint de ejercicio ambiguo; kg disparado vs. última serie (> umbral); modo duración vs. peso poco claro.
  - **Cuándo no:** 100×8 en banca focal con confianza alta.

- [ ] **Feedback de error ciego**
  - **Qué:** *No te he pillado* + la transcripción en texto pequeño, para que el usuario vea si falló el oído o el parser.
  - **Por qué:** si no, parece que “la app es tonta” y abandonan. Ver *«sien por ocho»* enseña a hablar más cerca.

### Spike 3 — robustez en el gym

- [ ] **Medir SpeechRecognizer vs Whisper Tiny en gym real**
  - **Qué:** 20–30 frases con música / hierros / 1 m de distancia.
  - **Criterio:** % de intents MVP correctos, no WER. Si el sistema baja del ~70 %, Whisper Tiny como descarga opcional.
  - **APK:** Whisper **no** entra en el bundle base.

- [ ] **Números hablados y muletillas**
  - **Qué:** recortar *eh*, *bueno*, *vamos*, *a ver*; *kilos* / *kg* / *kilos y medio*.
  - **Cómo:** preproceso del texto antes del parser. Más corpus, no más modelo.

- [ ] **Añadir / cambiar ejercicio por voz**
  - **Qué:** *«press banca 100 8»* cuando banca no está en la sesión → mismo flujo que `ExerciseSelector.onSelect`.
  - **Cuidado:** no crear un `usuario_ejercicio` duplicado si el catálogo ya lo tiene. Reusar `matchExerciseByName`.

---

## 6) Otras IAs (después de voz)

No desaparecen; dejan de ser P0.

| Feature | Rol respecto a la voz | Cuándo |
|---|---|---|
| Embeddings (MiniLM / E5-small) | Mejoran el hint *«press incli»* vs. catálogo | Si el matcher por sinónimos falla en el spike 3 |
| OCR ML Kit | Mismo extractor, otra entrada (captura Strong / placa) | Cuando voz esté estable |
| Gemini Nano / Gemma 3 270M–1B | Solo fallback del extractor, títulos de sesión | Si las reglas se quedan cortas |
| MediaPipe Pose | Otra liga (cámara, batería) | No mezclar con dictado |
| Gemma 3n E2B | Un modelo multimodal que sustituye STT+parser | Experimento gama alta, no default |

### Fuera de alcance (sigue igual)

- Chat tipo ChatGPT en el teléfono.
- Escucha continua tipo wake-word (*«Oye Track Gym»*).
- Empaquetar 7B (ni 4B) en el APK.
- Coach de técnica en tiempo real.
- Inferencia de producción en el WebView (transformers.js).
- Subir audio a la nube sin opt-in (hoy: no hay opt-in; no se sube).
- Dictado de cardio live (GPS + botones; las manos van al móvil de otra forma). El mic es para **fuerza**.
- iOS.

---

## 7) Privacidad

1. El audio se procesa **en el dispositivo**.
2. No hay upload de audio ni de transcripciones a Supabase.
3. Permiso de micrófono solo al primer maintain del botón.
4. Archivo temporal de grabación se borra al terminar el parseo (éxito o error).
5. Política y ficha de Play Store actualizadas **antes** de publicar.

---

## 8) Cómo sabemos que vale la pena

No “hemos puesto un mic”. Sí:

| Señal | Umbral grosero |
|---|---|
| Corpus del parser (CI) | 100 % de los casos MVP; 0 falsos `log_set` en muletillas |
| En gym (manual) | ≥ 8/10 frases MVP → serie correcta a la primera |
| Tras soltar el mic | serie visible < 2,5 s |
| Uso real | % de series del entreno activo que nacen por voz vs. teclado (telemetría local / evento anónimo, si algún día hay analytics) |
| Abandono | si Deshacer > ~20 % de los dictados, el parser o el STT no está listo para venderlo |
| Coste | 0 MB extra en APK con SpeechRecognizer; Whisper solo opcional |

Si el extractor en CI está verde y el STT de sistema en gym no llega, **no se apaga la feature**: se ofrece Whisper como descarga. Si el extractor inventa series, **no se mergea** aunque el mic suene bien.

---

## 9) Orden de ejecución

1. Parser + aplicar al estado (todo en TS, tests) — se puede hacer ya, sin plugin.
2. Botón push-to-talk + SpeechRecognizer nativo + permiso.
3. Cablear al `WorkoutLogger` (serie hecha + descanso + deshacer).
4. Sheet de duda + mostrar transcripción cuando falle.
5. Grabar en gym: sistema vs Whisper.
6. Cambiar/añadir ejercicio por voz.
7. Embeddings / OCR / títulos: solo si 1–4 están en producción.

Siguiente recomendada: **`parseVoiceLog` + corpus**, porque es el cerebro de “directamente” y no depende de Android.

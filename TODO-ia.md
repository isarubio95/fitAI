# IA on-device para Track Gym

Notas sobre el estado actual: la app **no** usa modelos de IA. El matching de ejercicios es por normalización + sinónimos (`matchExerciseByName.ts`, `EXERCISE_SYNONYMS`). Los títulos de sesión son plantillas por hora (`defaultWorkoutTitle.ts`). El import Lyfta es determinista. Cardio live ya usa GPS + FC por Bluetooth LE / Health Connect.

Este documento es un backlog de **IA que corre en el móvil**, no de un chat en la nube. El valor está en registrar, emparejar y entender la sesión **sin red**, con privacidad y sin inflar el APK.

---

## 1) Principio de producto

Track Gym es una app de **registro y ejecución** (fuerza, cardio, rutinas, gyms, comunidad). Un LLM conversacional en el teléfono no mejora el flujo del gym: calienta el dispositivo, infla el binario y falla en sótanos.

Sí aporta valor un modelo **estrecho, rápido y privado** si:

1. Reduce fricción al **loguear** (manos ocupadas, ruido, sin teclado).
2. Mejora el **matching** de ejercicios / imports sin mantener diccionarios eternos.
3. Funciona **offline** (sótano, montaña, datos malos).
4. Los kilos, fotos y voz **no salen** a un servidor.
5. El peso del APK sigue razonable (ya existe `android:strip-heavy`).

Regla: **tarea especializada primero, LLM pequeño después, 7B nunca como default.**

---

## 2) Restricciones reales (Android + Capacitor)

La UI vive en un **WebView**. Correr transformers.js / WASM ahí es posible en teoría y frágil en la práctica (WebGPU irregular, RAM del WebView, calentamiento).

Vía seria:

| Capa | Qué hace |
|---|---|
| JS / React | Orquesta: “transcribe esto”, “embebe este nombre”, “parsea a series”. |
| Plugin Capacitor nativo | Carga el modelo, infiere, devuelve JSON. |
| Runtime | LiteRT (TFLite), MediaPipe, ONNX Runtime Mobile, Google AI Edge, o AICore (Gemini Nano). |

Otras restricciones:

- **Tamaño APK.** Un Whisper Tiny (~40–80 MB) se nota. Un Gemma 3 1B Q4 (~700 MB–1 GB) ya es otra app. Preferir modelos del **sistema** (AICore, ML Kit) cuando existan.
- **RAM.** Gama media ~4–6 GB compartidos. Gemma 3n E2B pide ~2 GB **libres** para el modelo. E4B (~3 GB) solo flagship.
- **Batería / calor.** Inferencia continua (pose a 30 fps, STT siempre escuchando) durante un entreno de 90 min es un producto distinto. Preferir **on-demand** (pulsar mic, foto puntual, matching al escribir).
- **Cobertura de dispositivos.** Gemini Nano / AICore no está en todos los Android. Siempre hace falta **fallback** a reglas o a un modelo empaquetado pequeño.
- **iOS.** Hoy el target nativo es Android. HealthKit / Apple Intelligence quedan fuera de este backlog salvo nota.

Criterio de éxito de cualquier spike: **funciona en un Pixel / Samsung de gama media, offline, en < 2 s para texto y < 1 s para matching**, y si el modelo no carga la app sigue usable.

---

## 3) Mapa de valor → modelo

Ordenado por retorno real para Track Gym, no por hype.

| Prioridad | Caso de uso | Familia de modelo | Tamaño típico | Entra en APK |
|---|---|---|---|---|
| P0 | Matching semántico de ejercicios | Embeddings (MiniLM, E5-small, GTE-tiny) | 20–130 MB | Opcional (se puede descargar) |
| P0 | OCR de capturas / placas de máquina | ML Kit Text Recognition | ~0 (Play Services) | No |
| P1 | Voz → serie estructurada | Whisper Tiny / Moonshine + extractor | 40–80 MB STT | Sí o descarga |
| P1 | Títulos, resúmenes, parseo de texto libre | Gemini Nano o Gemma 3 270M/1B | 0 (Nano) o 200 MB–1 GB | Preferir Nano |
| P2 | Conteo de reps / esqueleto | MediaPipe Pose / MoveNet Lightning | 5–20 MB | Sí |
| P2 | Foto de aparato → ejercicio | MobileCLIP / CLIP tiny | 20–50 MB | Descarga |
| P3 | Coach multimodal (voz + foto + texto) | Gemma 3n E2B | ~2 GB RAM | Descarga, no default |
| — | Chat tipo ChatGPT en el teléfono | 7B+ | varios GB | **No** |

---

## 4) Catálogo de modelos (qué es cada uno)

### 4.1 Speech-to-text (voz → texto)

| Modelo | Tamaño aprox. | Notas | Encaje |
|---|---|---|---|
| **Whisper Tiny** (int8) / **Tiny.es** | 40–80 MB | Robusto con ruido de gym. Latencia aceptable on-demand. | Primer STT a probar |
| **Moonshine Tiny** | más pequeño / más rápido | Menos maduro en ecosistema Android que Whisper.cpp | Alternativa si Whisper se queda corto de velocidad |
| **Audio encoder de Gemma 3n** | va con el LLM | Transcribe + entiende en un paso | Solo si ya cargamos Gemma 3n |
| **Gemini Nano (audio)** | 0 en APK | Depende de AICore y del dispositivo | Ideal donde exista |

No hace falta un LLM para transcribir. El LLM (o un parser) entra **después**, para convertir *«press banca cien kilos ocho reps RIR dos»* en JSON.

Salida objetivo del pipeline de voz:

```json
{
  "ejercicio": "Press banca",
  "ejercicio_id": "…o null si hay que desambiguar",
  "kg": 100,
  "reps": 8,
  "rir": 2,
  "rpe": null,
  "confianza": 0.86
}
```

### 4.2 Embeddings (texto → vector)

Sirven para **buscar por significado**, no para generar texto.

| Modelo | Tamaño aprox. | Notas |
|---|---|---|
| **all-MiniLM-L6-v2** | ~22 MB | Clásico, suficiente para nombres de ejercicio |
| **gte-tiny / bge-small** | 30–80 MB | Mejor calidad |
| **E5-small multilingual** | ~100 MB | Mejor con ES + EN mezclados (Lyfta, catálogo mixto) |
| **MobileCLIP** | 20–50 MB | Texto **y** foto del aparato |

Uso en Track Gym: precomputar vectores del catálogo (una vez, en build o al primer arranque) y al escribir / importar hacer k-NN contra esos vectores. El matcher actual por sinónimos se queda como **fallback determinista**.

### 4.3 LLM pequeños (texto → texto / JSON)

| Modelo | RAM / peso | Para qué sí | Para qué no |
|---|---|---|---|
| **Gemini Nano (AICore)** | 0 MB en la app | Títulos, resúmenes, extraer JSON, copy de comunidad | Dispositivos sin AICore |
| **Gemma 3 270M** Q4/Q8 | ~200–400 MB | Clasificar intents, extraer campos, títulos cortos | Coaching largo, razonamiento |
| **Gemma 3 1B** / **Llama 3.2 1B** Q4 | ~700 MB–1 GB | Parseo de voz, resúmenes de sesión, español decente | Default en gama baja |
| **Qwen2.5 0.5B / 1.5B** | 400 MB–1 GB | Structured output (JSON de series) muy fiable | Conversación abierta |
| **SmolLM2 360M / 1.7B** | ligero | Intents (“añade serie”, “salta descanso”) | Texto natural largo |
| **Gemma 3n E2B** | ~2 GB RAM | Multimodal: voz + foto + texto en un modelo | Gama baja; no empaquetar en el APK base |
| **Phi-4-mini / Gemma 3n E4B** | 3 GB+ | Solo flagship, experimento | Producto default |
| **Cualquier 7B+** | varios GB | — | Fuera de alcance on-device |

Prompts siempre **cerrados**: “devuelve solo JSON con estas claves”. Nada de system prompts de coach de 40 líneas.

### 4.4 Visión (cámara → estructura)

| Modelo | Tamaño aprox. | Uso realista | Uso que NO vender |
|---|---|---|---|
| **ML Kit Text Recognition** | 0 (Play Services) | OCR de capturas Strong/Hevy/Lyfta y placas de máquina | — |
| **MediaPipe Pose Landmarker** | ~5–15 MB | Esqueleto 33 puntos, conteo de reps, lado | “Corrige tu técnica como un entrenador” |
| **MoveNet Lightning** | ~5 MB | Pose más ligera, menos precisa | Técnica fina |
| **YOLOv8n-pose** | ~10–20 MB | Persona + keypoints si Pose no basta | Default |
| **MobileCLIP / CLIP-ViT-tiny** | 20–50 MB | Foto del aparato → candidatos del catálogo | Reconocer el gym por la fachada |

Iluminación de gym, ángulo del móvil en el suelo y oclusión con barra **rompen** el “form coach”. Un *form score* opcional o un contador de reps en bodyweight/accesorios sí; sustituir al entrenador, no.

### 4.5 Lo que ya trae el sistema (preferir siempre)

| API | Dónde | Qué nos ahorra |
|---|---|---|
| **ML Kit Text Recognition** | Android / Play Services | OCR sin modelo en el APK |
| **Gemini Nano / AICore** | Pixel y algunos Samsung recientes | LLM sin bloat |
| **Android SpeechRecognizer** | Casi todos los Android | STT de sistema; calidad peor en gym, pero 0 MB |
| **TextToSpeech** | Sistema | Cues de descanso / “siguiente ejercicio” sin Piper |

El backlog debe **probar estas APIs antes** de empaquetar Whisper o Gemma.

---

## 5) Arquitectura propuesta

```text
Usuario
  │
  ├─ escribe “press incli manc”
  │     → embeddings locales → top-3 del catálogo
  │     → si hay duda, UI de desambiguar
  │     → fallback: matchExerciseByName (sinónimos)
  │
  ├─ pulsa mic en el logger
  │     → STT on-device → texto
  │     → extractor (regex + LLM pequeño o parser)
  │     → JSON serie → mismo path que el teclado
  │
  ├─ foto de captura / placa
  │     → ML Kit OCR → texto
  │     → mismo extractor / matcher
  │
  └─ fin de sesión
        → Nano/Gemma (si existe) → título + resumen
        → si no hay modelo: plantillas actuales
```

Contrato del plugin nativo (borrador):

- `isAvailable(): { stt, llm, ocr, embeddings, pose }`
- `embed(text: string): Float32Array`
- `transcribe(audioUri: string): { text, confidence }`
- `complete(prompt: string, schema: string): { json }`
- `recognizeText(imageUri: string): { blocks: string[] }`

La app **nunca** asume que un backend de IA está vivo. Si `isAvailable().stt === false`, el botón de mic no se muestra (o explica “no disponible en este dispositivo”).

Modelos pesados: **descarga opcional** la primera vez que el usuario activa la feature (“Asistente local, ~80 MB”), no van en el APK base. Alineado con `android:strip-heavy`.

---

## 6) Backlog

### Alta prioridad

- [ ] **Capa nativa de inferencia (plugin Capacitor)**
  - **Qué:** un plugin `AiOnDevice` (nombre tentativo) que exponga `isAvailable` + STT/OCR/embed/LLM con timeouts y cancelación.
  - **Por qué:** el WebView no es un runtime de ML fiable; sin este puente cada feature se implementa dos veces o no se implementa.
  - **Cómo:** Android primero (LiteRT o Google AI Edge). Detectar AICore / ML Kit y usarlos si existen. JS solo serializa audio/imagen y pinta UI. Tests del contrato con mocks en Vitest.
  - **Criterio:** en un dispositivo sin modelos, la app arranca igual y `isAvailable` es todo `false`.

- [ ] **Matching semántico de ejercicios (embeddings)**
  - **Qué:** complementar `matchExerciseByName` con k-NN sobre vectores del catálogo + ejercicios de usuario.
  - **Por qué:** el diccionario de sinónimos no escala a “press inclinado mancuernas” vs “incline dumbbell press” ni a imports Lyfta ruidosos.
  - **Cómo:** modelo tipo MiniLM o E5-small multilingual; precomputar embeddings del catálogo en build o primer uso; umbral de similitud + UI de 2–3 candidatos si no hay match claro; **el matcher actual queda como fallback**.
  - **Gancho de código:** `src/lib/matchExerciseByName.ts`, `src/constants/exerciseSynonyms.ts`, import Lyfta, selector de ejercicios.
  - **Criterio:** un set de nombres reales (ES/EN, typos, abreviaciones) mejora recall vs. solo sinónimos, sin subir falsos positivos en nombres cortos (“curl”, “press”).

- [ ] **OCR on-device (ML Kit)**
  - **Qué:** leer texto de una foto/captura y ofrecerlo al import o al logger.
  - **Por qué:** ya importamos Lyfta de forma determinista; Strong/Hevy/Excel/placa de máquina son el mismo problema con otra fuente. ML Kit no infla el APK.
  - **Cómo:** permiso de cámara / picker de galería; `recognizeText`; pasar líneas al extractor/matcher. Empezar por **import de captura**, no por cámara en vivo.
  - **Cuidado:** no subir la imagen a Supabase; el OCR es local. Pedir confirmación antes de crear series.

- [ ] **Spike STT de sistema vs Whisper Tiny**
  - **Qué:** medir en un gym real (ruido, música, distancia al teléfono) Android SpeechRecognizer vs Whisper Tiny int8.
  - **Por qué:** si el STT del sistema llega al 80 % en castellano, nos ahorramos 50–80 MB. Si no, Whisper se justifica.
  - **Cómo:** grabar 20–30 frases típicas (*«sentadilla 80 kilos 5 reps RIR 1»*); tabla de WER y latencia en un Pixel de gama media y un Samsung de 4–6 GB. Decidir un único STT para P1.
  - **Criterio:** elegir el que extraiga bien **números + nombre de ejercicio**; el resto del lenguaje da igual.

---

### Media prioridad

- [ ] **Voz → serie en el logger de fuerza**
  - **Qué:** botón de mic en `ExerciseCard` / logger: una frase → una serie (o corrección de la última).
  - **Por qué:** es el único caso de IA que el usuario nota **durante** el entreno, con manos ocupadas.
  - **Cómo:** STT elegido en el spike → extractor (primero reglas: kg, reps, RIR/RPE; si falla, LLM 0.5B–1B o Nano) → mismo path que el teclado. Confirmación visual 1 s (toast o highlight de la fila) para poder deshacer.
  - **Gancho:** `WorkoutLogger`, `ExerciseCard`, `SetValueInput`, RIR/RPE existentes.
  - **Cuidado:** no escuchar en continuo (batería, privacidad, falsos positivos con “¡vamos!” del compañero). Solo push-to-talk.
  - **Offline:** obligatorio. El sótano del gym es el escenario.

- [ ] **Extractor estructurado (texto libre → JSON)**
  - **Qué:** módulo puro TS + opcional LLM que convierte texto de STT/OCR/teclado en `{ ejercicio, kg, reps, rir, rpe }`.
  - **Por qué:** Whisper solo da texto; el valor está en no hacer teclear. El extractor se reutiliza en voz, OCR y “pega tu sesión”.
  - **Cómo:** 1) regex/números + `matchExerciseByName`/embeddings; 2) si confianza baja, Nano/Gemma con schema JSON; 3) si el LLM no está, pedir desambiguación en UI.
  - **Tests:** corpus de frases en `src/test/` (castellano, números hablados “cien”, “ochenta y dos coma cinco”, “al fallo”).

- [ ] **Títulos y resumen de sesión on-device**
  - **Qué:** al guardar, sugerir título (*«Empuje: banca 100×5 PR»*) y 1–2 líneas de resumen para comunidad / historial.
  - **Por qué:** hoy es *«Entrenamiento de tarde»* (`defaultWorkoutTitle.ts`). Es barato de mejorar y no bloquea el entreno.
  - **Cómo:** plantillas deterministas primero (músculos del heatmap, PR, disciplina cardio). LLM solo para variar copy si `isAvailable().llm`. El usuario confirma o edita; nunca publicar solo.
  - **Fallback:** las funciones actuales no se tocan como default.

- [ ] **Descarga opcional de modelos**
  - **Qué:** Ajustes → “Funciones locales” con tamaño, qué se gana, y borrado.
  - **Por qué:** no podemos meter 80–700 MB en el APK base (Play Store + `strip-heavy`).
  - **Cómo:** descargar a almacenamiento interno, verificar hash, no reintentar en roaming. Features desactivadas = 0 bytes extra.

---

### Visión / experimentos (no vender todavía)

- [ ] **Pose: conteo de reps (bodyweight / accesorios)**
  - **Qué:** cámara apuntando al usuario, MediaPipe Pose, contar repeticiones de ejercicios simples (sentadilla, flexiones, fondos).
  - **Por qué:** wow factor; en fuerza con barra libre la oclusión lo rompe.
  - **Cómo:** sesión opcional “contador visual”, no mezclar con el logger principal hasta que el error de conteo sea bajo. Solo on-demand, no 90 min a 30 fps por defecto.
  - **No hacer:** overlay de “rodilla cede X grados” como feature de producto.

- [ ] **Foto del aparato → candidatos del catálogo**
  - **Qué:** una foto de la máquina o de las mancuernas sugiere 3 ejercicios.
  - **Por qué:** útil para novatos en gyms (directorio `Gyms` + catálogo). MobileCLIP cabe en móvil.
  - **Cómo:** embedding de imagen vs. embeddings de fotos de referencia del catálogo (si las hay) o vs. nombres. Confirmación humana obligatoria.
  - **Dependencia:** media de ejercicios (`exerciseMediaUrl`) y que las fotos sean comparables. Si el catálogo es sobre todo ilustración, el CLIP contra foto real fallará: validar antes de construir UI.

- [ ] **Gemini Nano / Gemma 3n como “un modelo para todo”**
  - **Qué:** en dispositivos que lo soporten, un único modelo multimodal (audio + imagen + texto) sustituye STT + extractor + título.
  - **Por qué:** menos pipelines, mejor contexto (*foto de la pizarra del gym + voz*).
  - **Cómo:** feature-detect AICore; si no, cascada P0/P1. Gemma 3n E2B solo como descarga opcional en gama alta.
  - **Cuidado:** no diseñar la UX asumiendo que todo el mundo tiene Nano.

- [ ] **Cues de voz en descanso / live cardio**
  - **Qué:** TTS del sistema: “descanso terminado”, “último km”, “fuera de ruta”.
  - **Por qué:** 0 MB extra; el rest timer y el live cardio ya existen.
  - **Cómo:** Android `TextToSpeech` vía Capacitor; respeto a no molestar / auriculares. No es un “modelo de IA” pero es el mismo eje de manos-libres.

---

### Fuera de alcance (no hacer)

- Chat tipo ChatGPT embebido como feature principal.
- Empaquetar un 7B (ni 4B) en el APK.
- Estimar grasa corporal / composición por selfie (impreciso y sensible).
- Reconocer el gimnasio por foto de fachada (GPS + directorio ya cubren el caso).
- Coach de técnica que “corrige el press banca” en tiempo real.
- Inferencia en el WebView con transformers.js como runtime de producción.
- Enviar voz, fotos de cuerpo o kilos a un LLM en la nube **sin** opt-in explícito y modo offline equivalente.
- iOS / Apple Intelligence en esta fase (el nativo hoy es Android).

---

## 7) Privacidad y permisos

On-device es la palanca de producto: **el entreno no depende de un API key ni de cobertura**.

Reglas:

1. Voz, OCR y pose se procesan **en el dispositivo** por defecto.
2. No hay upload de audio/imagen a Supabase ni a un LLM remoto salvo que el usuario active un “mejorar en la nube” (hoy: no existe, no lo anticipamos en UI).
3. Permisos: micrófono solo al pulsar mic; cámara solo al abrir OCR/pose; no `RECORD_AUDIO` permanente.
4. Actualizar `privacypolicy.html` y la ficha de Play Store **antes** de publicar cualquier feature de cámara/mic + IA.
5. Modelos descargados: decir de dónde salen (Google, Hugging Face, etc.) y que no entrenan con los datos del usuario.

---

## 8) Cómo medimos si vale la pena

No “hemos puesto un LLM”. Sí:

| Feature | Métrica |
|---|---|
| Embeddings | Recall@1 / @3 en un gold set de nombres ES/EN vs. matcher actual |
| OCR | % de capturas que el usuario confirma sin editar más de 1 campo |
| STT + extractor | % de frases del corpus que generan la serie correcta |
| Títulos | % de sugerencias aceptadas vs. editadas vs. descartadas |
| Pose (si se hace) | error de conteo vs. conteo humano en 10 series filmadas |
| Coste | MB añadidos al APK / a descarga; ANR; °C / batería en 45 min de logger |

Si embeddings no ganan al diccionario de sinónimos en el gold set, **no se mergea**.

---

## 9) Orden de ejecución recomendado

1. **Plugin + `isAvailable`** — sin esto el resto es prototipo de laboratorio.
2. **Embeddings en el matcher** — poco UI, gana imports y selector, modelo pequeño.
3. **OCR ML Kit** — 0 MB, desbloquea import por captura.
4. **Spike STT sistema vs Whisper** — decide el P1 caro.
5. **Voz → serie** en el logger, push-to-talk, con extractor testeado.
6. **Títulos/resumen** con plantillas + Nano si existe.
7. **Pose / CLIP / Gemma 3n** solo si 2–5 están en producción y hay margen de APK/batería.

Siguiente recomendada ahora mismo: **matching semántico + OCR**, porque no dependen de un LLM, caben en el stack actual y mejoran flujos que ya existen (selector, Lyfta, catálogo).

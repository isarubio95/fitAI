# Mejoras del MCP

Qué construir a continuación alrededor del servidor MCP, y por qué esas cosas y no otras.

El servidor ya está en producción: 25 herramientas, OAuth 2.1, RLS como única autorización
(ver [MCP.md](MCP.md)). Este documento es lo que viene después.

---

## 1) El criterio

El MCP funciona por su **forma**, no porque «tenga IA»:

| Propiedad | Consecuencia |
|---|---|
| El usuario trae su propia IA | Coste por usuario: 0. Ningún contrato con un proveedor de LLM. |
| Track Gym no genera texto | Ninguna alucinación de la que responda el producto. |
| El dato no cambia de dueño | RLS ya audita; no hay copia del historial en ningún sitio nuevo. |
| Es una puerta, no un cerebro | Se mantiene solo: cada tabla nueva es una tool, no un modelo que reentrenar. |

**Regla de esta lista:** una propuesta entra si cumple las cuatro. Si necesita que Track Gym
pague inferencia, genere prosa o guarde datos nuevos de terceros, no es «como el MCP» aunque
use IA. Es otra cosa, y hay que justificarla aparte.

Esto es coherente con el principio 4 de `PRODUCT.md` («no vender lo que no existe: ni IA, ni
mascota, ni iOS»): el MCP no vende IA, vende una puerta.

---

## 2) Estado actual

```text
tools      25  ✅  (13 lectura, 12 escritura)
prompts     0  ❌  el protocolo lo soporta; no está implementado
resources   0  ❌  ídem
```

Las 25 herramientas están en `supabase/functions/mcp/tools/`, registradas en `registry.ts`:

`search_exercises` · `get_profile_stats` · `list_workouts` · `get_workout` ·
`get_exercise_progress` · `get_training_summary` · `get_personal_records` · `log_workout` ·
`update_workout` · `replace_workout_exercises` · `delete_session` · `list_routines` ·
`get_routine` · `get_schedule` · `create_routine` · `update_routine` · `delete_routine` ·
`schedule_routine` · `unschedule_routine` · `list_cardio_sessions` · `get_cardio_session` ·
`log_cardio_session` · `get_health_log` · `log_measurement` · `log_daily_health`

Lo que **no** ve el asistente hoy: gimnasios, rutas predefinidas, forma/carga de entrenamiento,
logros y nutrición (que no existe en ninguna parte del producto).

---

## 3) Prompts y resources — la mitad del protocolo que falta

**Prioridad: P0.** Es lo más barato de la lista y lo que más rinde.

### Qué

- **Prompts:** plantillas que el cliente MCP enseña como comandos (en Claude aparecen en el menú
  de la conexión). El usuario elige *«Analiza mi mes»* en vez de tener que inventarse la pregunta.
- **Resources:** contexto estático que el modelo puede leer una vez en lugar de deducirlo a base
  de llamadas.

### Por qué

Hoy el valor del servidor depende de que el usuario **sepa qué preguntar**. La mayoría abre su
asistente, escribe «¿cómo voy?» y se queda en la superficie de un servidor que sabe responder
mucho más: progresión por ejercicio, PRs por 1RM estimado, volumen por músculo, adherencia al
calendario. Veinticinco herramientas sin un solo punto de entrada sugerido es una API, no un
producto.

Además **no cuesta contexto**. La cabecera de `registry.ts` avisa de que cada tool gasta
~120-200 tokens de esquema en *cada* turno; por eso el catálogo se mantiene corto. Los prompts
no: se listan bajo demanda. Es valor que no compite por el presupuesto que limita las tools.

### Cómo

Módulo nuevo `supabase/functions/mcp/prompts/` con el mismo patrón que las tools: un fichero por
dominio y un `registry.ts` que los agrupa, invocado desde `registerAllTools` (o un
`registerAll` hermano) en `index.ts`. La API es `server.registerPrompt` /
`server.registerResource` — **verificar la firma exacta contra
`npm:@modelcontextprotocol/server@2.0.0`** antes de escribir; es el mismo patrón que
`registerTool` pero no está probado en este repo.

Catálogo inicial propuesto (pocos y buenos, igual que las tools):

| Prompt | Qué hace | Tools que encadena |
|---|---|---|
| `analiza-mi-mes` | Volumen, adherencia, PRs y qué ha cambiado respecto al mes anterior | `get_training_summary`, `get_personal_records`, `get_schedule` |
| `donde-me-he-estancado` | Ejercicios sin progreso en N semanas, con el dato que lo demuestra | `get_personal_records`, `get_exercise_progress` |
| `planifica-la-semana` | Propone y **programa** la semana leyendo lo que ya se entrenó | `get_training_summary`, `list_routines`, `schedule_routine` |
| `revisa-mi-rutina` | Equilibrio de grupos musculares y volumen por sesión de una rutina | `get_routine`, `get_training_summary` |
| `resumen-fuerza-y-cardio` | El cruce que ninguna app de la competencia hace | `get_training_summary`, `list_cardio_sessions` |

Resources iniciales:

| Resource | Contenido | Ahorra |
|---|---|---|
| `taxonomia-muscular` | Grupos musculares y su mapeo | Llamadas de tanteo a `search_exercises` |
| `tipos-de-serie` | `isWorkingSet` y qué cuenta para volumen (`_shared/domain/setTypes.ts`) | Que el modelo se invente el criterio |
| `modos-de-registro` | `peso_reps` / `duracion` / `duracion_ritmo` | Payloads inválidos en `log_workout` |

### Criterio

- Cada prompt produce una respuesta útil **sin que el usuario añada nada**.
- Ningún prompt pide a la IA que invente datos que el servidor no ha devuelto.
- `src/test/mcp-server-guards.test.ts` sigue verde (nada de service role).
- La tarjeta de Inicio (`McpSpotlightCard.tsx`) menciona que existen comandos.

---

## 4) Nutrición por MCP — la apuesta de producto

**Prioridad: P1.** Es la pieza grande que falta y la que más cambia el diario.

### Qué

Una herramienta `log_nutrition` (y su lectura). El usuario le dice a **su** asistente
*«desayuno: dos huevos, 60 g de avena y un plátano»*; el modelo estima los macros y llama a la
herramienta con números.

### Por qué

Es el hueco obvio del diario: `salud_diaria` ya tiene columna `calorias` y a mano no la rellena
nadie nunca.

Y encaja exactamente en la forma del §1. Lo caro de MyFitnessPal no es la UI: es **mantener una
base de datos de alimentos**, con su licencia, su mantenimiento y sus datos basura. Aquí no se
construye ninguna: la estimación la pone el modelo del usuario. Track Gym pone la tabla y la
puerta, igual que con los entrenos.

Cuando existe, se contestan solas preguntas que hoy no tienen respuesta en ningún sitio:
*«¿comí suficiente proteína las semanas en que más progresé en banca?»* — cruzando dos tablas
que ya están.

### Cómo

Empezar por el **agregado diario**, no por la comida individual:

1. Migración que añade a `salud_diaria`: `proteina_g`, `carbos_g`, `grasa_g` y `fuente`
   (`'manual' | 'estimado_ia'`). Una fila por día, que es la forma que la tabla ya tiene.
2. Ampliar `log_daily_health` en `tools/body.ts` en vez de crear una tool nueva — la cabecera de
   `registry.ts` dice explícitamente que antes de añadir una herramienta hay que mirar si encaja
   como parámetro de una existente. `get_health_log` ya devuelve el rango, así que la lectura
   sale gratis.
3. Una tabla `comida` (varias filas por día, con descripción libre) **solo si** el total diario
   demuestra que se usa. Añadirla antes es construir un logger de comidas sin saber si alguien
   dicta sus comidas a una IA.

### Cuidado

- **Marcar el origen.** Son estimaciones de un modelo, no números medidos. `fuente` no es
  decorativa: la UI no debe pintar 2.150 kcal estimadas con la misma autoridad que un peso
  levantado.
- El texto libre de descripción de comida pasa por `userText()` y la respuesta va con
  `untrusted: true`, como todo lo que escribe una persona (`lib/untrusted.ts`).
- Track Gym **no da consejo dietético**. Guarda lo que el usuario registra. Si el asistente
  recomienda una dieta, eso pasa en el asistente, no en el producto.
- Revisar `public/privacypolicy.html` antes de publicar: es una categoría de dato nueva.

### Criterio

Una frase en lenguaje natural produce una fila correcta en `salud_diaria`, marcada como
estimada, y la pantalla de salud la muestra distinguiéndola de lo introducido a mano.

---

## 5) Gimnasios y rutas — datos que ya están y el MCP no expone

**Prioridad: P2.** Trabajo pequeño sobre cosas ya construidas.

### Qué

Dos herramientas nuevas:

- `search_gyms` → envuelve la RPC `search_gimnasios` (ya existe, con `p_query`, `p_lat/p_lng`,
  bounding box y `distance_km` calculada). *«Estoy tres días en Logroño, ¿qué gym me pilla cerca?»*
- `list_cardio_routes` → las 250 rutas de La Rioja (`public/predefined-routes/la-rioja/index.json`,
  con deporte, distancia y desnivel por ruta). *«Planifícame una salida de 10 km para el sábado»*
  — y que la programe con `schedule_routine`, que ya funciona.

### Por qué

Es el **único sitio del producto donde el asistente necesita saber dónde estás**, y el dato ya
está importado y mantenido por los scripts del repo (`gyms:import`, `komoot:la-rioja`). Cerrar
el círculo «buscar ruta → programarla» convierte dos features aisladas en un flujo.

### Cuidado

- **Esto revisa una decisión ya tomada.** La sección «Lo que queda fuera, y por qué» de
  [MCP.md](MCP.md) excluye «GPS y rutas». Esa exclusión sigue siendo correcta para lo que
  significaba: los **tracks** (miles de coordenadas que no caben en el contexto y que no
  responden a ninguna pregunta en lenguaje natural — ver la cabecera de `tools/cardio.ts`). El
  `index.json` de rutas predefinidas es otra cosa: un catálogo de 250 filas con nombre, deporte,
  distancia y desnivel, más cerca de `search_exercises` que de un track. Si se implementa, hay
  que **actualizar esa sección de `MCP.md`** para que diga «tracks GPS» y no «rutas», o el
  documento quedará mintiendo.
- El directorio de gimnasios es **dato compartido, no del usuario**: la RPC ya es la que usa la
  app y tiene su propia política. No inventar un camino nuevo.
- La tool de rutas lee el `index.json`, no los 250 GPX. Y son ficheros estáticos servidos por la
  SPA, no filas de Postgres: la Edge Function tendría que ir a buscarlos por HTTP al origen de
  Vercel, que es una dependencia nueva y hay que decidir si compensa frente a importarlos a una
  tabla.

---

## 6) Deep links de vuelta a la app

**Prioridad: P2.** Media hora de trabajo.

Hoy el bucle se rompe al final: el asistente crea la rutina y el usuario tiene que ir a
buscarla a mano. Que cada respuesta de **escritura** devuelva un enlace a la pantalla concreta
lo cierra.

Las rutas existen (`src/App.tsx`): `/routines`, `/evolution`, `/cardio-routines`, `/gimnasios`,
y el APK ya registra el esquema `com.trackgym.app` en `AndroidManifest.xml`. Falta decidir la
URL canónica (web de Vercel, que funciona en los dos sitios) y añadirla al payload de `ok()`.

Cambia la sensación de «consulté mi diario desde fuera» a «mi asistente y mi diario son lo mismo».

---

## 7) Forma y carga de entrenamiento

**Prioridad: P3.** Valor alto, coste real.

La app calcula «tu forma hoy» (fitness / fatiga / forma, modelo Banister) en
`src/hooks/useTrainingLoad.ts` sobre `src/lib/trainingLoad.ts`, y el MCP **no lo expone**. El
asistente puede ver cuánto has entrenado pero no si estás fresco, que es justo lo que
condiciona la respuesta a *«¿qué hago mañana?»*.

El coste no es la tool, es la ubicación: `trainingLoad.ts` vive en `src/` y el bundle de
`supabase functions deploy` se construye con raíz en `supabase/functions`. Habría que moverlo a
`_shared/domain/` dejando una reexportación de una línea, exactamente como se hizo con
`exerciseSearch.ts`, `exerciseSynonyms.ts` y `setTypes.ts`. Y el cálculo necesita 400 días de
sesiones, así que probablemente pida una RPC agregada en vez de calcularlo en la Edge Function.

Merece la pena cuando los P0-P2 estén fuera. Hacerlo mal —duplicar la fórmula en el servidor—
significaría que la forma que dice el asistente no es la que enseña la app, que es exactamente
el fallo que la sección «código compartido» de `MCP.md` existe para prevenir.

---

## 8) Ya funciona y no lo estamos contando

Con `log_workout` + `replace_workout_exercises` un usuario **ya puede** pasarle a su IA una
captura de Strong, un Excel exportado de Hevy o una foto de su libreta, y que se lo escriba en
Track Gym.

No hay que programar nada. Hay que **documentarlo**: un apartado de casos de uso en
[MCP.md](MCP.md) y una línea en `McpSpotlightCard.tsx`. Es un migrador desde cualquier app de la
competencia, construido sin querer, que hoy no sabe nadie que existe.

Coste: un párrafo. Es lo mejor pagado de este documento.

---

## 9) Lo que NO debe llevar IA

Dos features de valor diario y altísimo donde meter un LLM sería un error:

**Autorregulación de la siguiente serie.** Ya está hecha y **sin IA**:
`src/lib/progressiveOverload.ts` con `useProgressiveOverload`, que cruza la última sesión
(`useLastPerformance`), la fatiga por grupo muscular y la forma. Es estadística sobre el
historial del propio usuario: determinista, instantánea, offline y explicable. Un LLM ahí sería
más lento, más caro y menos fiable. Sirve de prueba de que «aporta valor» y «lleva IA» son ejes
distintos.

**Detección de estancamiento y aviso de deload.** Mismo caso, aún sin construir. Es un umbral
sobre `get_personal_records` y la curva de forma, no un modelo. Si además se quiere que el
asistente lo explique, eso ya lo cubre el prompt `donde-me-he-estancado` del §3, gratis.

---

## 10) Fuera de alcance

- **Chat propio dentro de la app.** Coste por usuario, responsabilidad sobre lo que diga,
  y choca con el principio 3 de `PRODUCT.md` («ejecución antes que conversación»). El MCP existe
  precisamente para no tener que construirlo.
- **Generar texto en el servidor** (títulos de sesión, resúmenes semanales redactados). En cuanto
  Track Gym llama a un LLM, se rompen las cuatro propiedades del §1 a la vez.
- **Contenido de otros usuarios en el MCP.** La cabecera de `lib/untrusted.ts` lo deja claro:
  ninguna herramienta lee contenido de terceros. La comunidad no entra aquí.
- **Voz y OCR.** No porque estén mal, sino porque son la otra rama: IA on-device, con el mismo
  coste cero y el mismo dato que no sale del teléfono, pero en el gym y no en el asistente.
  Van en [TODO/TODO-ia.md](TODO/TODO-ia.md) y avanzan en paralelo.

---

## 11) Orden de ejecución

1. **Prompts + resources** (§3) — poco trabajo, multiplica lo ya construido.
2. **Documentar la importación** (§8) — un párrafo.
3. **Nutrición, agregado diario** (§4) — la apuesta.
4. **Gimnasios y rutas** (§5) y **deep links** (§6).
5. **Forma y carga** (§7) — solo tras mover `trainingLoad.ts` a `_shared/domain/`.

Siguiente recomendada: **los prompts**, porque hoy el servidor sabe responder más de lo que a
nadie se le ocurre preguntarle.

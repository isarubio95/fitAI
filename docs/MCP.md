# Servidor MCP

Track Gym expone su diario de entrenamiento como **servidor MCP remoto**: el usuario conecta
Claude, ChatGPT, Cursor o cualquier cliente compatible y consulta su historial desde ahí, sin
que Track Gym tenga que construir un chat propio ni contratar ningún proveedor de LLM.

Estado: **25 herramientas**, 13 de lectura y 12 de escritura. El usuario puede consultar su
historial y también registrar entrenos, crear rutinas y programar la semana desde el asistente.

## Arquitectura

```
Cliente MCP  ──HTTP──►  Edge Function `mcp` (Deno)
    │                        │ withOAuthProtectedResource() → metadata + WWW-Authenticate
    │                        │ withSupabase({auth:'user'})  → JWT verificado, cliente con RLS
    │                        └─► PostgREST · RPC SECURITY INVOKER
    └──OAuth 2.1──►  Supabase Auth (authorize / token / JWKS / registro dinámico)
                          └─► redirige a la SPA: /oauth/consent?authorization_id=…
```

**La autorización no se programa.** `withSupabase({ auth: 'user' })` entrega un cliente Supabase
con el token del usuario, así que las políticas RLS ya auditadas son las que deciden qué se ve y
qué se toca. De ahí la regla dura del directorio: **la service role key no se usa nunca** dentro
de `supabase/functions/mcp/`. Lo comprueba `src/test/mcp-server-guards.test.ts` en cada CI,
porque saltarse RLS ahí sería invisible hasta que un usuario leyera datos de otro.

### Ficheros

| Qué | Dónde |
|---|---|
| Función | `supabase/functions/mcp/index.ts` |
| Herramientas | `supabase/functions/mcp/tools/` (una por dominio, registradas en `registry.ts`) |
| Formato de salida y límites | `supabase/functions/mcp/lib/` |
| Código compartido con la app | `supabase/functions/_shared/domain/` |
| Pantalla de consentimiento | `src/pages/OAuthConsent.tsx` |
| Retorno tras login | `src/components/auth/OAuthConsentReturn.tsx`, `src/lib/oauthConsent.ts` |
| Accesos conectados (Ajustes) | `src/components/layout/ConnectedAppsSettings.tsx`, `src/hooks/useOAuthGrants.ts` |
| Destacado e instrucciones (Inicio) | `src/components/dashboard/McpSpotlightCard.tsx`, `src/lib/mcp.ts` |
| Invariantes de datos | `supabase/migrations/20260918100000_data_integrity_constraints.sql` |
| Agregados de lectura | `supabase/migrations/20260918101000_analytics_read_rpcs.sql` |
| Escritura de rutinas | `supabase/migrations/20260918102000_routine_write_rpcs.sql` |
| XP y racha | `supabase/migrations/20260918103000_xp_ledger.sql` |
| Escritura de sesiones | `supabase/migrations/20260918104000_session_write_rpcs.sql` |

### Código compartido

`exerciseSearch.ts`, `exerciseSynonyms.ts` y `setTypes.ts` viven en
`supabase/functions/_shared/domain/`, no en `src/`: el bundle de `supabase functions deploy` se
construye con raíz en `supabase/functions` y salir de ahí es lo que rompe. En sus rutas
originales de `src/` quedan reexportaciones de una línea, así que ningún import de la app cambia.

Es fuente única a propósito. Si el MCP tuviera su propia copia del buscador, «press banca»
devolvería un ejercicio distinto según se preguntase por la app o por el asistente; y si tuviera
su propio `isWorkingSet`, el volumen del mes no cuadraría entre las dos.

## Despliegue

### 1. Dashboard de Supabase (manual, una vez)

1. **Authentication → OAuth Server**: activar el servidor OAuth 2.1 y activar **Allow dynamic
   client registration**. Sin esto la discovery responde `feature_disabled` y ningún cliente
   puede conectarse.
2. **Authentication → URL Configuration → Site URL**: debe apuntar al origen de Vercel que sirve
   la SPA. Es el prefijo al que GoTrue redirige para pedir el consentimiento.
3. **JWT Signing Keys**: no tocar. El proyecto ya firma en ES256, que es lo que exige
   `@supabase/server`.

> **No ejecutar `supabase config push`.** La guía oficial de Supabase lo recomienda para este
> paso; en este repo está prohibido por lo que explica la cabecera de `supabase/config.toml`:
> empujaría toda la sección `[auth]` y borraría `additional_redirect_urls` y el proveedor de
> Google, rompiendo el login y el deep link del APK.

### 2. Aplicar migraciones y desplegar

> ⚠️ **No uses `supabase db push` en este proyecto.** El historial de migraciones
> está desincronizado: 36 ficheros locales figuran como no aplicados y hay 29
> versiones aplicadas en remoto sin fichero local (se aplicaron con otros
> timestamps). El esquema real sí tiene los cambios, así que `db push`
> reaplicaría migraciones antiguas — y entre ellas hay una que borra
> entrenamientos de fuerza sin series y varias con `DROP TABLE`.
>
> Hasta que el historial se reconcilie, cada migración nueva se aplica de una en
> una y se registra a mano:
>
> ```sql
> INSERT INTO supabase_migrations.schema_migrations (version, name)
> VALUES ('<timestamp>', '<fichero.sql>') ON CONFLICT (version) DO NOTHING;
> ```
>
> Sirve el endpoint `POST /v1/projects/{ref}/database/query` de la Management API
> con un Personal Access Token, o el SQL Editor del Dashboard.

```bash
supabase functions deploy mcp --project-ref <ref> --no-verify-jwt
npm run supabase:types    # regenera las dos copias del esquema
```

El `--no-verify-jwt` es explícito además de estar en `config.toml`: si el gateway verificara el
JWT, rechazaría la petición de descubrimiento (que llega sin token, por definición) antes de que
la función pudiera responder con el reto `WWW-Authenticate`, y el fallo se vería desde el cliente
como un 401 mudo imposible de diagnosticar.

La migración de constraints avisa con `RAISE WARNING` si encuentra filas históricas que
incumplen las invariantes, en vez de fallar: en ese caso el `CHECK` queda `NOT VALID` (protege
las filas nuevas, no las viejas) y el mensaje trae la consulta de auditoría.

### 3. Desarrollo local

```bash
supabase start
supabase functions serve mcp
npm run dev                 # http://localhost:8080, que es el site_url de config.toml
```

## Verificación

**El 401 debe traer el reto.** Es lo que demuestra que `verify_jwt` está bien puesto:

```bash
curl -si -X POST 'http://127.0.0.1:54321/functions/v1/mcp' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}' \
  | grep -i '^HTTP\|www-authenticate'
# HTTP/1.1 401 Unauthorized
# www-authenticate: Bearer resource_metadata=".../functions/v1/mcp/oauth-protected-resource"
```

**Dos documentos de descubrimiento**, no uno:

```bash
curl -s '.../functions/v1/mcp/oauth-protected-resource'
curl -s '.../.well-known/oauth-authorization-server/auth/v1'
```

Si en el segundo falta `registration_endpoint`, el registro dinámico no está activo.

**El flujo humano completo**, con `npx -y @modelcontextprotocol/inspector` (transporte Streamable
HTTP): debe abrir el login, volver a `/oauth/consent`, mostrar el nombre del cliente y, al
aprobar, poblar la pestaña Tools. Si tras iniciar sesión te quedas en el dashboard, el retorno
está roto.

**RLS con dos usuarios.** Es el único fallo de este diseño que sería catastrófico y silencioso:
autoriza el Inspector como A, pide `list_workouts` y comprueba que solo salen sesiones de A.

**Conectar un cliente real:**

```bash
claude mcp add --transport http track-gym https://<ref>.supabase.co/functions/v1/mcp
```

En Claude web, ChatGPT, Gemini o Cursor se pega la misma URL en su pantalla de conectores. La app
la muestra con un botón de copiar en dos sitios: Ajustes → Aplicaciones conectadas y la tarjeta
destacada de Inicio (`src/components/dashboard/McpSpotlightCard.tsx`), que además lleva las
instrucciones concretas de cada asistente. Los dos leen `MCP_URL` de `src/lib/mcp.ts`.

Si alguno de esos cuatro clientes cambia sus menús, esas instrucciones son lo primero que se
queda obsoleto: son rótulos literales de una interfaz ajena, no algo que este repo controle.

## Herramientas

Cada herramienta cuesta ~120-200 tokens de esquema en **cada** turno del modelo, así que el
catálogo se mantiene corto a propósito. Antes de añadir una, mirar si encaja como parámetro de
una existente.

| Herramienta | Qué devuelve |
|---|---|
| `search_exercises` | Busca en el catálogo por nombre (ES/EN, erratas, sinónimos). Es la puerta de entrada: devuelve los IDs que el resto necesita. |
| `get_profile_stats` | Nivel, XP, racha, fisiología, logros desbloqueados. |
| `list_workouts` | Sesiones de fuerza con resumen (series efectivas, tonelaje, duración). `status:'active'` detecta una sesión abierta en la app. |
| `get_workout` | Una sesión al completo: ejercicios en orden y todas sus series. |
| `get_exercise_progress` | Progresión de un ejercicio: mejor serie por día con 1RM estimado, o historial crudo. |
| `get_training_summary` | Agregado de un rango: sesiones, series, tonelaje, tiempo, RPE medio y cardio. Por total, semana o músculo. |
| `get_personal_records` | Mejor serie por ejercicio según 1RM estimado. |
| `list_routines` | Rutinas propias, plantillas de la app o ambas. |
| `get_routine` | Una rutina con sus objetivos y, si lo tiene, el plan por serie. |
| `get_schedule` | Calendario de entrenamiento: qué está programado y qué se cumplió. |
| `list_cardio_sessions` | Sesiones de cardio con distancia, duración, ritmo y pulso. |
| `get_cardio_session` | Una sesión de cardio con sus bloques y métricas de carrera o ciclismo. |
| `get_health_log` | Medidas corporales y parte diario (sueño, pulso en reposo, calorías). |

### Escritura (12)

| Herramienta | Qué hace |
|---|---|
| `log_workout` | Registra un entrenamiento de fuerza ya terminado, con sus ejercicios y series. Idempotente por `client_request_id`; admite `dry_run`. |
| `update_workout` | Cambia solo los metadatos de una sesión (título, fecha, comentarios, RPE, gimnasio). |
| `replace_workout_exercises` | Sustituye ejercicios y series enteros de una sesión, para corregirla. Recalcula la XP. |
| `delete_session` | Borra una sesión de fuerza o cardio. Exige repetir el título exacto. |
| `create_routine` | Crea una rutina con objetivos y, opcionalmente, plan por serie. |
| `update_routine` | Actualiza una rutina; la lista de ejercicios reemplaza a la anterior. |
| `delete_routine` | Borra una rutina. Exige repetir el nombre exacto. |
| `schedule_routine` | Programa una rutina en hasta 60 fechas. Idempotente. |
| `unschedule_routine` | Quita huecos del calendario; respeta los ya cumplidos salvo `force`. |
| `log_cardio_session` | Registra una sesión de cardio con sus bloques. Idempotente. |
| `log_measurement` | Medidas corporales de un día (upsert por fecha). |
| `log_daily_health` | Parte diario de salud (upsert por fecha). |

### Cómo se protege la escritura

- **Ninguna herramienta borra por filtro.** Todas toman un id, y las destructivas exigen repetir
  el título o el nombre exacto, lo que obliga a leer antes de borrar.
- **`es_publica` no aparece en ningún esquema de entrada**: un asistente no puede publicar en la
  comunidad. Se comparte desde la app, a mano.
- **`usuario_id` nunca viaja en el payload**: sale de `auth.uid()` dentro de cada RPC.
- **Idempotencia real**: `client_request_id` más un índice único hacen que un reintento devuelva
  la sesión existente, y el libro mayor `xp_evento` impide que esa repetición regale XP.
- **Topes duros** en zod y repetidos como `RAISE` en SQL: 500 kg, 30 series por ejercicio, 40
  ejercicios por sesión, 300 series por llamada, fechas dentro de los dos últimos años. Zod
  protege del modelo; el SQL protege de un fallo del propio servidor MCP.
- **Los logros no se conceden aquí**: `checkAndAwardLogros` ya es autocurativa al abrir la app, y
  las descripciones de las herramientas lo dicen para que el modelo no prometa lo que no pasa.

### Convenciones de salida

- **JSON compacto, no prosa.** Los números de este dominio (peso, RIR, segundos por kilómetro)
  se transcriben mal desde texto formateado, y el modelo ya sabe verbalizarlos.
- **Unidades en el nombre de la clave**: `weight_kg`, `rest_seconds`, `pace_seconds_per_km`,
  `distance_m`. Nunca `"5:30 /km"`.
- **Fechas**: timestamps en ISO-8601 UTC; fechas de calendario en `YYYY-MM-DD`. El agrupado por
  día y semana es **UTC**, igual que el SQL existente.
- **Truncado explícito**: por encima de ~50 KB la respuesta se recorta y lo dice, con
  `next_offset` para paginar. Es preferible a que el modelo crea que ha visto todo el historial.

### Qué no se expone, y por qué

- **Contenido de terceros** (feed, comentarios, seguimientos). Es la mitigación de verdad contra
  prompt injection: los comentarios son texto libre escrito por otras personas, y aquí acabarían
  dentro del contexto de un agente que tendrá herramientas de escritura.
- **Puntos GPS** (`cardio_track_point`, `cardio_ruta_punto`). Miles de coordenadas que no caben
  en el contexto y que no responden a ninguna pregunta en lenguaje natural.
- **Fotos de progreso.** Rutas a un bucket privado, sin uso en una conversación de texto.

El texto libre que sí viaja (títulos, comentarios, notas, nombres de ejercicios propios) pasa por
`lib/untrusted.ts`: se recorta, se le quitan caracteres de control y la respuesta lleva una nota
que le dice al modelo que son datos, no instrucciones.

## Por qué las escrituras van por RPC

No es purismo. `WorkoutLogger.createActiveWorkout` y `handleCreate` crean una sesión en tres
viajes sin transacción: si falla el tercero, queda una sesión con ejercicios y sin series —algo
que ya hubo que limpiar a mano en `20260627140000`—. Y ambas emparejan las filas insertadas con
el payload por posición, confiando en un orden de retorno que `RoutineForm` documenta que no está
garantizado. Reimplementar eso en Deno habría sido una tercera copia del mismo fallo. En SQL, con
una transacción y `WITH ORDINALITY`, los dos problemas desaparecen por construcción.

El cliente React todavía usa sus propios caminos. Migrarlo es el siguiente paso natural y el que
paga la decisión: el día que `RoutineForm.handleSave` llame a `upsert_routine` y
`WorkoutLogger.handleCreate` a `log_strength_session`, la divergencia entre app y asistente deja
de ser posible.

## Estado: aplicado y verificado en producción

Las cinco migraciones están aplicadas y registradas, el servidor OAuth activo con registro
dinámico, y la función desplegada. Lo comprobado al aplicarlo:

- Las invariantes no borraron nada: cero filas incumplían el XOR y cero duplicados en `medidas` y
  `rutina_programada`. Los dos `CHECK` quedaron validados, no en `NOT VALID`.
- Las cascadas `serie → ejercicio → actividad` y `rutina_ejercicio → rutina` **ya existían** en el
  esquema real, aunque `delete_user_data` siga borrando las tres tablas a mano. La migración las
  detecta y no las toca.
- `summarize_series_plan` (SQL) coincide con `summarizeSeriesPlan` (TS) en los seis casos de
  `src/test/series-plan-sql-parity.test.ts`, cuyos valores esperados son la salida real de la
  función en Postgres. Escribir ese test cazó una divergencia: el SQL miraba si `repes_min` tenía
  valor *después* de caer al fallback, cuando el original mira si el plan traía mínimos.
- `recompute_profile_streak` coincide con lo que el cliente había calculado para todos los
  usuarios salvo uno, cuyo `racha_maxima` guardado (3) era un resto obsoleto de un entreno
  borrado; el valor correcto es 2 y el propio cliente lo corrige al abrir la app.
- Un cliente anónimo recibe 401 al intentar escribir y `[]` al leer los agregados. Ve las 130
  actividades marcadas como públicas, que es la RLS del feed comunitario haciendo su trabajo.

Dos fallos que solo aparecieron al ejecutar contra Postgres, y que conviene recordar al escribir
más SQL aquí: `date - bigint` no existe (hay que castear `row_number()` a `integer`), y el
generador de tipos declara los parámetros con `DEFAULT` como opcionales pero **no nulables**, así
que hay que omitir la clave en lugar de mandar `null`.

## Lo que queda fuera, y por qué

Crear ejercicios personalizados (un modelo que no encuentra algo duplicaría el catálogo en vez de
buscar mejor) · controlar la sesión activa en vivo (compite con el cronómetro, el temporizador de
descanso y el pulsómetro de la app) · GPS y rutas · rutinas de cardio · likes, comentarios y
seguimientos · favoritos y preferencias · conceder logros.

## Qué viene después

Las mejoras propuestas sobre este servidor —prompts y resources, nutrición, gimnasios y rutas,
deep links— están en [MEJORAS-MCP.md](MEJORAS-MCP.md), con el criterio que decide qué entra.

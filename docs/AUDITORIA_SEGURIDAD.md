# AUDITORÍA DE SEGURIDAD — Track Gym

> Auditoría del codebase completo y plan de remediación. Este documento es la fuente
> de verdad del estado de cada fix: marca las casillas a medida que se implementen.

- **Fecha de auditoría:** 2026-09-16
- **Commit base:** `03dd33f`
- **Alcance:** `src/`, `scripts/`, `supabase/` (migraciones y Edge Functions), `vite/`, `.github/`, configuración de despliegue e historial de git.

## Contexto de arquitectura (condiciona todo el plan)

Track Gym **no tiene backend propio en Node**. Es una SPA de Vite servida como estático
en Vercel (`vercel.json` era solo un rewrite a `index.html`) y empaquetada con Capacitor
para Android. Lo que en otras aplicaciones sería "el servidor" son aquí tres superficies
externas al proceso:

1. **PostgREST de Supabase** — lo llama el navegador directamente con la anon key.
2. **GoTrue** (auth) — `signInWithPassword`, `signUp`, OAuth.
3. **Dos Edge Functions en Deno** — `delete-account` y `lyfta-proxy`.

Tres consecuencias que atraviesan todo el documento:

- **`express-rate-limit` y equivalentes no aplican**: no hay proceso donde montar un
  middleware. El rate limiting va por configuración de GoTrue, código Deno y triggers
  de Postgres. Ver [Bloque 1](#bloque-1--rate-limiting).
- **La validación de servidor real son los `CHECK` de Postgres y las políticas RLS.**
  Cualquier validación en `src/` corre en el navegador: es UX y defensa en profundidad,
  no un control de seguridad. Ver [Bloque 3.2](#32--validación-con-zod).
- **Capacitor sirve desde el filesystem y no lee los headers de Vercel.** Toda cabecera
  de seguridad cubre la web pero no el APK, que necesita su propia vía.

## Estado de la superficie auditada (no requiere acción)

Conviene dejarlo escrito porque acota el trabajo real y evita reauditar lo mismo:

- **Cero secretos hardcodeados** en `src/`, `scripts/`, `supabase/functions/` y `vite/`.
  Todo pasa por `process.env` / `Deno.env.get()` / `import.meta.env`.
- **`.env` está en `.gitignore`** (junto a `.env.*`, con excepción para `.env.example`),
  no está trackeado, y en sus 64 commits históricos **solo contuvo las tres `VITE_*`**,
  que son públicas por diseño (acaban en el bundle del cliente de todos modos).
  `SUPABASE_SERVICE_ROLE_KEY` **nunca** se commiteó: no hace falta reescribir el
  historial ni rotar el service role.
- **Cero concatenación SQL.** Las 50 migraciones no contienen ni un `EXECUTE` dinámico
  ni `format()` / `quote_ident` sobre input; todos los `EXECUTE` son `GRANT EXECUTE` o
  `EXECUTE FUNCTION` de triggers. No existe `.raw()` en el cliente.
- **RLS activo** con políticas de propiedad bien escritas y optimizadas
  (`(select auth.uid())`), y **109 constraints `CHECK`** en BD.
- **CI limpia**: `.github/workflows/ci.yml` solo usa placeholders.
- **Sin fugas por `console.*`** — 0 coincidencias de token/sesión/password/clave.
- La API key de Lyfta que introduce el usuario **no se persiste** (solo estado React) y
  `lyfta-proxy` tiene allowlist de rutas, así que no es un SSRF abierto.

Dos patrones que coinciden con lo que se buscaba pero **no son hallazgos**:

- `innerHTML` en `src/components/cardio/LiveCardioMap.tsx:433` asigna un literal
  estático de tres `<span>`, sin input de usuario. No es XSS.
- No hay ningún punto que renderice HTML no confiable, así que **DOMPurify no hace
  falta**. Añadirlo sería peso muerto.

## Hallazgos

| # | Severidad | Hallazgo | Ubicación | Estado |
|---|---|---|---|---|
| 1 | **Alta** | Sin rate limiting en ninguna superficie: auth, Edge Functions ni escrituras PostgREST | global | **Parcial: 1.1 hecho** |
| 2 | **Alta** | Sin `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` ni `Referrer-Policy` | `vercel.json` | **Resuelto (web)** |
| 3 | **Media** | Inyección de filtro PostgREST: `nivel` interpolado sin sanear en `.or()` | `src/hooks/usePredefinedRoutines.ts:58` | Pendiente |
| 4 | **Media** | `zod` está en `dependencies` pero se usa en **0 archivos**. No hay capa de validación de esquema | global | Pendiente |
| 5 | **Media** | CORS `Access-Control-Allow-Origin: "*"` en ambas Edge Functions | `supabase/functions/*/index.ts:4` | Pendiente |
| 6 | **Baja** | `.impeccable/live/server.json` trackeado en git con un token de sesión local | `.impeccable/live/server.json` | Pendiente |
| 7 | **Baja** | `sanitizeOrTerm` filtra `,()` pero no los comodines LIKE `%` y `_` → escaneos completos de tabla inducidos | `src/hooks/useExerciseCatalog.ts:201` | Pendiente |
| 8 | **Baja** | `dangerouslySetInnerHTML` inyecta colores de `config` en un `<style>` sin validar formato | `src/components/ui/chart.tsx:73` | Pendiente |
| 9 | **Info** | RLS no verificable desde el repo para ~17 tablas base: las migraciones empiezan en 2026-05-14, sin baseline | `supabase/migrations/` | Pendiente |

---

## Bloque 1 — Rate limiting

Tres superficies, tres mecanismos distintos. No hay uno solo que las cubra.

### 1.1 · Auth (GoTrue) — ✅ IMPLEMENTADO (código y config local)

Implementado el 2026-09-16. `supabase/config.toml` no tenía sección `[auth]` ni
`[auth.rate_limit]`.

- [x] `[auth.rate_limit]` en `supabase/config.toml` con `email_sent`,
      `sign_in_sign_ups`, `token_verifications`, `token_refresh` y `anonymous_users`.
      Nombres de clave verificados contra el spec del CLI (la clave real es
      `token_verifications`, no `otp`).
- [x] `[auth] minimum_password_length = 8` (Supabase acepta desde 6) y
      `password_requirements = ""`.
- [x] Cliente alineado en `src/pages/Auth.tsx`: constante `MIN_PASSWORD_LENGTH = 8`
      validada **solo en registro** —los usuarios con contraseña de 6 siguen entrando—,
      y `translateAuthError` ampliado con los errores de contraseña filtrada (HIBP) y
      de requisitos de composición.
- [x] El mensaje de contraseña corta ya no fija "6 caracteres": lee el número del
      mensaje del servidor, así que subir el mínimo en el Dashboard no lo desfasa.
- [x] Verificado: config aceptada por el CLI (una clave inventada da
      `CliConfigParseError`, la nuestra pasa), 885 tests en verde, build correcto.

**Decisiones:**

- **`sign_in_sign_ups` y `token_refresh` se quedan en el valor por defecto a
  propósito.** Track Gym es una app móvil: la mayoría de usuarios sale por CGNAT del
  operador, donde miles de personas comparten IP. Apretar el límite por IP no frena el
  credential stuffing (el atacante rota IPs) y sí bloquea a usuarios legítimos.
- **La defensa real contra fuerza bruta es CAPTCHA + contraseñas filtradas**, porque no
  dependen de la IP. El bloque `[auth.captcha]` queda comentado en `config.toml` con
  las instrucciones: requiere cuenta de hCaptcha/Turnstile y añadir el widget en
  `Auth.tsx`, así que es decisión de producto.
- **Sin requisitos de composición** (`password_requirements = ""`): obligar a símbolos y
  mayúsculas empeora las contraseñas reales (`Password1!`) sin subir la entropía.

**Pasos manuales restantes** (⚠️ sin esto, producción sigue sin proteger — `config.toml`
solo rige el Supabase local):

- [ ] Dashboard → Authentication → Rate Limits: aplicar los mismos valores que
      `supabase/config.toml`.
- [ ] Dashboard → Authentication → Providers → Email: subir *Minimum password length*
      a 8 para que coincida con el cliente.
- [ ] Dashboard → mismo panel: activar **Prevent use of leaked passwords** (HIBP).
      **Requiere plan Pro o superior**; si el proyecto está en Free, queda pendiente de
      esa decisión y el `translateAuthError` correspondiente simplemente no se disparará.
- [ ] Evaluar CAPTCHA (hCaptcha o Turnstile) como control anti-fuerza-bruta real.

> ⚠️ **No ejecutar `supabase config push`** con el `config.toml` actual: empujaría toda
> la sección `[auth]` y los campos no declarados (`site_url`,
> `additional_redirect_urls`, proveedores OAuth) se sobrescribirían con los valores por
> defecto del CLI, rompiendo el redirect de login en web y el deep link
> `com.trackgym.app://auth-callback` del APK. El aviso está también en el propio fichero.

### 1.2 · Edge Functions

`delete-account` y `lyfta-proxy`. Aquí sí controlamos el código.

- [ ] Tabla `public.rate_limit_hit (clave text, ventana timestamptz, contador int)` +
      RPC `SECURITY DEFINER` `consume_rate_limit(p_clave text, p_limite int, p_ventana interval)`
      que incremente y compruebe **atómicamente**
      (`INSERT … ON CONFLICT DO UPDATE … RETURNING`), sin carrera entre leer y escribir.
- [ ] Módulo compartido `supabase/functions/_shared/rateLimit.ts` que llame a esa RPC
      con el service role y devuelva `429` + cabecera `Retry-After`.
- [ ] Clave doble: `user:<uid>` (ambas funciones ya exigen `Authorization`, así que el
      ID siempre existe) e `ip:<addr>` como base. La IP sale del **primer salto** de
      `x-forwarded-for`, no del último, y se descarta si el header viene vacío: si no,
      es trivial de falsear.
- [ ] Límites: `delete-account` 3/hora por usuario (es destructiva e irreversible);
      `lyfta-proxy` 30/min por usuario y 60/min por IP.

> **Por qué Postgres y no Upstash Redis:** evita meter un proveedor y credenciales
> nuevos para dos funciones de tráfico bajo. Si el volumen crece, `@upstash/ratelimit`
> es el reemplazo natural y el módulo compartido aísla el cambio.

### 1.3 · Escrituras directas a PostgREST

El hueco grande. `useActivityComments`, `useActivityLikes`, `useFollows` y
`useCardioSessionComments` insertan desde el navegador. **Nada en el cliente puede
limitar esto**: quien tenga la anon key llama a PostgREST directamente saltándose el
código React.

- [ ] Trigger `BEFORE INSERT` en las tablas de contenido generado
      (`actividad_comentario`, `cardio_sesion_comentario`, `actividad_like`,
      `seguimiento`) que cuente filas recientes del mismo `usuario_id` y lance
      `RAISE EXCEPTION` al pasarse. Ej.: 20 comentarios / 10 min.
- [ ] **Decisión pendiente del equipo:** el límite por IP en esta capa **no es
      alcanzable** sin un WAF/CDN delante (Cloudflare). PostgREST no expone la IP del
      cliente de forma utilizable desde SQL. Queda explícito para que sea una decisión
      consciente, no una omisión.

---

## Bloque 2 — Secretos

El grueso ya está bien (ver estado de la superficie auditada); queda saneamiento.

- [ ] Untrackear `.impeccable/live/server.json` (`git rm --cached`) y añadir
      `.impeccable/live/` al `.gitignore`. El token es de un servidor local efímero —de
      ahí la severidad baja—, pero no pinta nada versionado.
- [ ] Borrar `scripts/_tmp-browser-verify-user.mjs`: es un script temporal que genera
      una contraseña y **la escribe en claro a un fichero**. Si se conserva, que vuelque
      solo a stdout.
- [ ] Completar `.env.example`: descomentar `SUPABASE_SERVICE_ROLE_KEY` y
      `SUPABASE_DB_URL` como claves vacías con descripción (hoy están solo como
      comentarios, así que un `cp .env.example .env` no las deja visibles) y documentar
      que las Edge Functions reciben `SUPABASE_URL` / `SUPABASE_ANON_KEY` /
      `SUPABASE_SERVICE_ROLE_KEY` inyectadas por Supabase, no del `.env` local.
- [ ] Añadir `gitleaks` como step en `ci.yml` para que esto no reaparezca.
- [ ] Revisar que las Edge Functions no devuelvan `error.message` crudo de Postgres al
      cliente (`delete-account/index.ts:69` y `:93`): pueden filtrar nombres de
      constraints y estructura interna. Loggear el detalle, devolver mensaje genérico.

---

## Bloque 3 — Inyección, validación y headers

### 3.1 · Filtros PostgREST

- [ ] Arreglar `src/hooks/usePredefinedRoutines.ts:58`: el fallback interpola `nivel`
      sin sanear en un `.or()`, donde una coma permite añadir condiciones al filtro.
      Lo correcto es no tener fallback: `nivel` viene de un selector cerrado, así que
      devolver `null` y omitir el `.or()` si el valor no es uno de los tres conocidos.
- [ ] Endurecer `sanitizeOrTerm` (`src/hooks/useExerciseCatalog.ts:201`) escapando
      también `%`, `_` y `\` antes de meterlos en el patrón `ilike`. Hoy la contención
      frente a inyección real es correcta (sin `,` ni `()` no se escala a otra columna);
      lo que falta es evitar el escaneo de tabla que provoca un `%` suelto.
- [ ] Extraer ambos a `src/lib/postgrestFilter.ts` con tests unitarios, para que el
      próximo `.or()` que se escriba use el helper.

### 3.2 · Validación con zod

`zod@4` ya está instalado y sin usar; también `@hookform/resolvers` y `react-hook-form`.
La infraestructura está, falta cablearla.

- [ ] Crear `src/lib/schemas/` con los esquemas de las entradas reales: credenciales de
      auth, perfil, rutina, comentario, medidas, salud diaria, y el CSV de
      `src/components/routine/ImportRoutineFromCsvDialog.tsx:40` (hoy hace `parseInt`
      con defaults silenciosos sobre un fichero que aporta el usuario).
- [ ] Conectarlos con `zodResolver` en los formularios y, sobre todo, **validar con el
      esquema justo antes de cada `.insert()` / `.update()`** en los hooks, que es por
      donde entran los datos aunque el formulario se salte.
- [ ] Por cada esquema zod, comprobar que existe el `CHECK` equivalente en BD y añadirlo
      donde falte. **Esta es la parte que realmente protege**: zod corre en el navegador.

### 3.3 · Headers de seguridad — ✅ IMPLEMENTADO (web)

Implementado el 2026-09-16. Cambios:

- [x] Bloque `headers` en `vercel.json` con `X-Content-Type-Options: nosniff`,
      `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
      `Permissions-Policy`, `Strict-Transport-Security` y
      `Cross-Origin-Opener-Policy: same-origin`. **Todas en modo enforcing.**
- [x] `Content-Security-Policy` calibrada con los orígenes que la app usa de verdad,
      desplegada como **`Content-Security-Policy-Report-Only`**.
- [x] `script-src` sin `'unsafe-inline'`: el bootstrap de tema de `index.html` se
      autoriza por hash SHA-256 (`sha256-ifRZyea87G+sfvt8BeU1pYa4dIAUx4ZXssiiQIu2ZP0=`).
- [x] `scripts/csp-hash.mjs` + `npm run csp:hash` para regenerar el hash, y step en
      `ci.yml` (`npm run csp:hash -- --check`) que falla el build si `index.html` cambia
      y el hash queda obsoleto.
- [x] `.gitattributes` fija `index.html` a `eol=lf`.
- [x] Verificado: `npm run build` correcto, 885 tests en verde, 0 errores de lint,
      y `dist/index.html` sin handlers inline ni scripts de terceros.

**Orígenes permitidos** (derivados del código, no genéricos):

| Directiva | Orígenes | Motivo |
|---|---|---|
| `connect-src` | Supabase, `tiles.openfreemap.org`, `*.basemaps.cartocdn.com`, `server.arcgisonline.com`, `photon.komoot.io`, `brouter.de` | REST/auth/storage, estilos y glyphs de mapa, geocoding inverso, snapping de rutas |
| `img-src` | Supabase, `lh3.googleusercontent.com`, `i.ytimg.com`, tiles, `data:`, `blob:` | Medios del catálogo, avatares Google, miniaturas YouTube, canvas de mapa |
| `frame-src` | `www.youtube-nocookie.com` | `src/lib/youtubeId.ts:88` normaliza todo embed a nocookie |
| `worker-src` | `'self' blob:` | Worker de MapLibre y service worker de la PWA |
| `style-src` | `'self' 'unsafe-inline'` | Inevitable: atributos `style` de React/framer-motion y el `<style>` dinámico de `chart.tsx` |

**Decisiones y trampas documentadas:**

- **`'unsafe-inline'` en `style-src` es inevitable**, no un descuido. React inyecta
  estilos como atributos y `chart.tsx` genera un `<style>` dinámico que no se puede
  hashear. El riesgo es muy inferior al de `script-src`, que sí queda estricto.
- **Report-Only a propósito.** Una CSP mal calibrada rompe el mapa, los vídeos o la
  analítica de forma silenciosa. El resto de cabeceras sí van en enforcing desde ya
  porque no pueden romper nada.
- **El hash se calcula sobre bytes con LF.** Se detectó durante la implementación que
  `dist/index.html` construido en Windows hereda CRLF y produce un hash distinto
  (954 bytes vs 931 = los 23 `\r`). Vercel hace checkout en Linux y despliega LF, así
  que `csp-hash.mjs` normaliza a LF y `.gitattributes` fija `index.html` a LF para que
  la garantía no dependa de `core.autocrlf`.
- **Sin `wss:` en `connect-src`**: la app no usa Supabase Realtime (0 llamadas a
  `.channel()`). Si se añade en el futuro, hay que abrir `wss://<proyecto>.supabase.co`.
- **`Cross-Origin-Opener-Policy: same-origin` es seguro aquí**: el OAuth de Google en
  web es un redirect de página completa, no un popup que dependa de `window.opener`.
- **`Strict-Transport-Security` incluye `includeSubDomains`** pero **no `preload`**:
  preload es un compromiso difícil de revertir. Si algún subdominio se sirviera por
  HTTP, habría que quitar `includeSubDomains`.

**Pasos restantes de este bloque:**

- [ ] Navegar la app en producción con la consola abierta (dashboard, mapa de cardio en
      vivo, directorio de gimnasios, vídeo de ejercicio, importación Lyfta, login
      Google) y anotar las violaciones que reporte el modo Report-Only.
- [ ] Promover a enforcing: renombrar la clave `Content-Security-Policy-Report-Only` a
      `Content-Security-Policy` en `vercel.json`.
- [ ] Solo **después** de lo anterior, cubrir Android con un
      `<meta http-equiv="Content-Security-Policy">` en `index.html`. Se deja para el
      final a propósito: un `<meta>` **no admite modo Report-Only ni `frame-ancestors`**,
      y al aplicarse también en web entraría en enforcing de golpe. Cambiar ese `<meta>`
      obliga además a regenerar el hash (`npm run csp:hash`).

### 3.4 · Endurecer Edge Functions

- [ ] Sustituir CORS `*` por una allowlist: dominio de producción,
      `http://localhost:8080` y los orígenes de Capacitor (`capacitor://localhost`,
      `https://localhost`). Con `*`, cualquier web puede invocar `delete-account` desde
      el navegador de un usuario logueado — el `Authorization` explícito lo mitiga, pero
      la allowlist es gratis.
- [ ] Validar el `payload` de `lyfta-proxy` con zod en lugar de los casts manuales de
      las líneas 86–108 (ahí `payload.resource` se castea a `LyftaResource` **antes** de
      comprobarlo).

### 3.5 · Verificación de RLS

Las migraciones no incluyen el baseline (empiezan en 2026-05-14), así que desde el repo
no se puede confirmar que `actividad`, `rutina`, `serie`, `cardio_sesion` o `seguimiento`
tengan RLS. Es verificación, no vulnerabilidad: es muy posible que esté todo bien
configurado desde el Dashboard.

- [ ] Ejecutar `supabase db lint` y revisar el Security Advisor del Dashboard.
- [ ] Volcar una migración baseline al repo para que esto sea auditable en el futuro.

---

## Orden de ejecución sugerido

1. ~~**3.3** (headers)~~ ✅ y ~~**1.1** (rate limit de auth)~~ ✅ — máximo impacto, riesgo
   bajo. Quedan los pasos manuales de Dashboard en 1.1.
2. **Bloque 2** (saneamiento de secretos) y **3.1** (filtros PostgREST) — cambios
   pequeños y acotados.
3. **1.2** (Edge Functions) y **3.4** — una migración más código Deno.
4. **3.2** (zod) — el más extenso, tocará bastantes archivos.
5. **1.3** (triggers de throttle) — requiere decidir umbrales con datos de uso reales.
6. **3.5** — verificación, en paralelo con todo lo demás.

-- Invariantes que el esquema daba por supuestas y nadie hacía cumplir.
--
-- Hasta ahora el único escritor era el cliente React, y las invariantes vivían
-- en su código (o en ningún sitio: ver el comentario de
-- 20260909120000_exercise_set_history_rpc.sql, que dice literalmente que los dos
-- FK de `ejercicio` son excluyentes «pero no hay CHECK que lo garantice»).
-- Al abrir la escritura al servidor MCP hay un segundo escritor, así que las
-- invariantes bajan a la base de datos, que es el único sitio donde valen para
-- todos. Todo lo de aquí beneficia también al cliente actual.
--
-- Cuatro bloques:
--   1. XOR de catálogo/propio en `ejercicio` y `rutina_ejercicio`.
--   2. ON DELETE CASCADE en las jerarquías que hoy se borran a mano.
--   3. Unicidad que convierte en idempotentes la programación y las medidas.
--   4. `idempotency_key` para que un reintento no duplique sesiones.
--
-- Los CHECK se crean NOT VALID y solo se validan si no hay filas que los
-- incumplan: una migración no debe fallar por datos históricos. Si quedan filas
-- rotas, la migración avisa con un WARNING y el VALIDATE queda pendiente.

-- ---------------------------------------------------------------------------
-- 1. Exactamente una fuente de ejercicio: catálogo global o ejercicio propio.
-- ---------------------------------------------------------------------------
-- Mismo invariante que `ejercicio_favorito_exactly_one_source`
-- (20260815154500_ejercicio_favorito.sql). Sin esto, una fila con ambos nulos
-- rompe `get_exercise_set_history`, `favoriteKey` y los joins de la UI, y una
-- con ambos no nulos hace ambiguo el historial del ejercicio.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ejercicio_exactly_one_source'
      AND conrelid = 'public.ejercicio'::regclass
  ) THEN
    ALTER TABLE public.ejercicio
      ADD CONSTRAINT ejercicio_exactly_one_source
      CHECK (num_nonnulls(tipo_ejercicio_id, usuario_ejercicio_id) = 1)
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rutina_ejercicio_exactly_one_source'
      AND conrelid = 'public.rutina_ejercicio'::regclass
  ) THEN
    ALTER TABLE public.rutina_ejercicio
      ADD CONSTRAINT rutina_ejercicio_exactly_one_source
      CHECK (num_nonnulls(tipo_ejercicio_id, usuario_ejercicio_id) = 1)
      NOT VALID;
  END IF;
END $$;

-- Validación condicional: solo si el histórico ya cumple.
DO $$
DECLARE
  v_rotas bigint;
BEGIN
  SELECT count(*) INTO v_rotas
  FROM public.ejercicio
  WHERE num_nonnulls(tipo_ejercicio_id, usuario_ejercicio_id) <> 1;

  IF v_rotas = 0 THEN
    ALTER TABLE public.ejercicio VALIDATE CONSTRAINT ejercicio_exactly_one_source;
  ELSE
    RAISE WARNING
      'ejercicio: % filas incumplen el XOR catálogo/propio. El CHECK queda NOT VALID (protege las filas nuevas, no las viejas). Audita con: SELECT id, actividad_id, tipo_ejercicio_id, usuario_ejercicio_id FROM public.ejercicio WHERE num_nonnulls(tipo_ejercicio_id, usuario_ejercicio_id) <> 1;',
      v_rotas;
  END IF;

  SELECT count(*) INTO v_rotas
  FROM public.rutina_ejercicio
  WHERE num_nonnulls(tipo_ejercicio_id, usuario_ejercicio_id) <> 1;

  IF v_rotas = 0 THEN
    ALTER TABLE public.rutina_ejercicio VALIDATE CONSTRAINT rutina_ejercicio_exactly_one_source;
  ELSE
    RAISE WARNING
      'rutina_ejercicio: % filas incumplen el XOR catálogo/propio. El CHECK queda NOT VALID. Audita con: SELECT id, rutina_id, tipo_ejercicio_id, usuario_ejercicio_id FROM public.rutina_ejercicio WHERE num_nonnulls(tipo_ejercicio_id, usuario_ejercicio_id) <> 1;',
      v_rotas;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. ON DELETE CASCADE en las jerarquías de sesión y rutina.
-- ---------------------------------------------------------------------------
-- Hoy no hay ninguna cascada: `delete_user_data`
-- (20260620120000_delete_user_account.sql) y `handleDelete` en WorkoutLogger
-- borran serie → ejercicio → actividad a mano, en tres viajes sin transacción.
-- Un fallo intermedio deja series huérfanas que nadie vuelve a mirar.
--
-- Se busca la constraint por catálogo en lugar de asumir el nombre generado:
-- los nombres `*_fkey` son convención de Postgres, no garantía.

DO $$
DECLARE
  v_par record;
  v_conname text;
BEGIN
  FOR v_par IN
    SELECT *
    FROM (VALUES
      ('serie',            'ejercicio_id', 'ejercicio'),
      ('ejercicio',        'actividad_id', 'actividad'),
      ('rutina_ejercicio', 'rutina_id',    'rutina')
    ) AS t(hija, columna, padre)
  LOOP
    SELECT con.conname INTO v_conname
    FROM pg_constraint con
    JOIN pg_attribute att
      ON att.attrelid = con.conrelid
     AND att.attnum = con.conkey[1]
    WHERE con.contype = 'f'
      AND con.conrelid = format('public.%I', v_par.hija)::regclass
      AND con.confrelid = format('public.%I', v_par.padre)::regclass
      AND att.attname = v_par.columna
      AND array_length(con.conkey, 1) = 1;

    IF v_conname IS NULL THEN
      RAISE WARNING 'No encuentro la FK %.% -> %; la dejo como esté.',
        v_par.hija, v_par.columna, v_par.padre;
      CONTINUE;
    END IF;

    -- confdeltype: 'a' = NO ACTION, 'c' = CASCADE.
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = v_conname
        AND conrelid = format('public.%I', v_par.hija)::regclass
        AND confdeltype = 'c'
    ) THEN
      CONTINUE;  -- ya cascadea
    END IF;

    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', v_par.hija, v_conname);
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.%I (id) ON DELETE CASCADE',
      v_par.hija, v_conname, v_par.columna, v_par.padre
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Unicidad que hace idempotentes la programación y las medidas.
-- ---------------------------------------------------------------------------
-- `salud_diaria` ya tiene UNIQUE (usuario_id, fecha) desde
-- 20260821140000_salud_diaria.sql; `medidas` no, así que dos registros del mismo
-- día conviven y la gráfica de peso pinta dos puntos. Y sin unicidad en
-- `rutina_programada`, programar dos veces la misma rutina el mismo día crea dos
-- huecos en el calendario.
--
-- Deduplicar antes de crear el índice. Criterios:
--   medidas           → se conserva la fila más reciente (created_at, luego id).
--   rutina_programada → se conserva la que ya está cumplida (actividad_id no
--                       nulo); si ninguna lo está, la más antigua.

DELETE FROM public.medidas m
WHERE EXISTS (
  SELECT 1 FROM public.medidas otra
  WHERE otra.usuario_id = m.usuario_id
    AND otra.fecha = m.fecha
    AND (otra.created_at, otra.id) > (m.created_at, m.id)
);

DELETE FROM public.rutina_programada rp
WHERE EXISTS (
  SELECT 1 FROM public.rutina_programada otra
  WHERE otra.usuario_id = rp.usuario_id
    AND otra.rutina_id = rp.rutina_id
    AND otra.fecha_programada = rp.fecha_programada
    AND (
      (otra.actividad_id IS NOT NULL AND rp.actividad_id IS NULL)
      OR (
        (otra.actividad_id IS NULL) = (rp.actividad_id IS NULL)
        AND (otra.created_at, otra.id) < (rp.created_at, rp.id)
      )
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS medidas_usuario_fecha_uidx
  ON public.medidas (usuario_id, fecha);

CREATE UNIQUE INDEX IF NOT EXISTS rutina_programada_usuario_rutina_fecha_uidx
  ON public.rutina_programada (usuario_id, rutina_id, fecha_programada);

-- ---------------------------------------------------------------------------
-- 4. Idempotencia de registro de sesiones.
-- ---------------------------------------------------------------------------
-- Un cliente MCP reintenta cuando la red falla, y un LLM puede llamar dos veces
-- a la misma herramienta tras un timeout. Sin esto, cada reintento es un
-- entrenamiento duplicado en el historial (y XP duplicada).
--
-- Índice parcial: las sesiones creadas desde la app siguen con la clave a NULL y
-- no compiten entre sí.

ALTER TABLE public.actividad
  ADD COLUMN IF NOT EXISTS idempotency_key uuid;

ALTER TABLE public.cardio_sesion
  ADD COLUMN IF NOT EXISTS idempotency_key uuid;

CREATE UNIQUE INDEX IF NOT EXISTS actividad_usuario_idempotency_uidx
  ON public.actividad (usuario_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cardio_sesion_usuario_idempotency_uidx
  ON public.cardio_sesion (usuario_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN public.actividad.idempotency_key IS
  'Clave de deduplicación enviada por el cliente MCP (client_request_id). NULL en las sesiones creadas desde la app.';

COMMENT ON COLUMN public.cardio_sesion.idempotency_key IS
  'Clave de deduplicación enviada por el cliente MCP (client_request_id). NULL en las sesiones creadas desde la app.';

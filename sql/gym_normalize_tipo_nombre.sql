-- Normalización de nombre para comparar con el mismo criterio que
-- scripts/comparar-ejercicios.mjs (normalizeName): minúsculas, quitar acentos
-- (aprox.), quitar paréntesis, solo letras/números/espacios, colapsar espacios.
--
-- Ejecutar UNA vez por base de datos antes de insertar_ejercicios_fitcron.sql.

create or replace function public.gym_normalize_tipo_nombre(p_nombre text)
returns text
language sql
immutable
parallel safe
as $$
  select trim(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          translate(
            lower(coalesce(p_nombre, '')),
            'áàäâãåāăąçćčđéèëêēėęěíìïîįīıñńóòöôõøōőúùüûūůýÿ',
            'aaaaaaacccdeeeeeeiiiiinnooooooouuuuuuy'
          ),
          '\([^)]*\)',
          ' ',
          'g'
        ),
        '[^a-z0-9\s]',
        ' ',
        'g'
      ),
      '\s+',
      ' ',
      'g'
    )
  );
$$;

comment on function public.gym_normalize_tipo_nombre(text) is
  'Igualdad de nombres de tipo_ejercicio al estilo comparar-ejercicios.mjs (aprox. en SQL).';

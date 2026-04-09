# Analisis exhaustivo de grupos musculares (catalogo)

Fuente analizada: `sql/grupos_musculares.json`

## Resumen ejecutivo

- Ejercicios totales: **749**
- Grupos musculares actuales (distintos): **12**
- Musculos involucrados distintos: **37**
- Ejercicios sin `musculos_involucrados`: **55**
- Esos 55 casos vacios son **100% `Todos` + tipo `Cardio/Estiramiento`**

Conclusiones de calidad:

- El campo `musculos_involucrados` esta bastante bien normalizado (solo 37 valores, casi todos canonicos).
- La mayor inconsistencia esta en `grupo_muscular` por etiquetas semanticas mezcladas:
  - `Abdomen` vs `Core`
  - `Pierna` vs `Piernas`
  - `Todos` para cardio/estiramientos
- No conviene mantener `Todos` como categoria de negocio; es ambiguo para filtros, analitica y recomendaciones.

## Distribucion actual de `grupo_muscular`

- Hombro: 117
- Pierna: 110
- Abdomen: 103
- Espalda: 102
- Biceps: 88
- Triceps: 74
- Pecho: 69
- Todos: 59
- Antebrazo: 17
- Cuello: 7
- Piernas: 2
- Core: 1

## Distribucion propuesta tras normalizacion

Reglas aplicadas:

1. `Abdomen` y `Core` -> `Core`
2. `Piernas` -> `Pierna`
3. `Todos` + `Cardio` -> `Cardio`
4. `Todos` + `Estiramiento` -> `Movilidad`
5. Cualquier `Todos` residual -> `Full Body`

Resultado esperado:

- Hombro: 117
- Pierna: 112
- Core: 104
- Espalda: 102
- Biceps: 88
- Triceps: 74
- Pecho: 69
- Cardio: 57
- Antebrazo: 17
- Cuello: 7
- Movilidad: 2

## Hallazgos relevantes en `musculos_involucrados`

- Musculo mas frecuente: `Trapecio` (205)
- Musculo menos frecuente: `Gluteo Menor` (1)
- No se detectan etiquetas "ruido" tipo `Todos` dentro de `musculos_involucrados`.
- `Cuello` aparece 7 veces y se recomienda mantenerlo (si se va a soportar en heatmap).

## Recomendacion de criterio de catalogo (estable)

Para `grupo_muscular` (campo principal de clasificacion):

- Usar un unico vocabulario cerrado:
  - `Pecho`, `Espalda`, `Hombro`, `Biceps`, `Triceps`, `Antebrazo`,
  - `Core`, `Pierna`, `Cuello`, `Cardio`, `Movilidad`, `Full Body`

Para `musculos_involucrados` (detalle anatomico):

- Mantener nombres especificos (ej. `Recto Abdominal`, `Oblicuo Externo`, `Vasto Lateral`, etc.).
- Evitar terminos genericos ambiguos.
- Permitir musculos raros si son anatomicamente validos (no forzar su eliminacion por frecuencia).

## Script de migracion asociado

Aplicar:

- `sql/unificar_grupo_muscular_catalogo.sql`

## Validaciones post-migracion

```sql
select grupo_muscular, count(*) as total
from public.tipo_ejercicio
group by grupo_muscular
order by total desc, grupo_muscular asc;
```

```sql
select count(*) as total_todos
from public.tipo_ejercicio
where lower(trim(coalesce(grupo_muscular, ''))) = 'todos';
```

```sql
select
  count(*) filter (where musculos_involucrados is null or cardinality(musculos_involucrados) = 0) as sin_musculos
from public.tipo_ejercicio;
```


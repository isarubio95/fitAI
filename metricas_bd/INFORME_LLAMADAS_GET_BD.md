# Informe de revisión: Llamadas GET a la base de datos (Supabase)

**Fecha del análisis:** 14 de marzo de 2025  
**Proyecto:** gym-log  
**Base de datos:** Supabase (PostgreSQL vía REST/PostgREST)

---

## 1. Resumen ejecutivo

Este documento recoge el inventario de **todas las operaciones de lectura (GET/SELECT)** hacia Supabase en el frontend. Se consideran únicamente las cadenas `supabase.from("tabla").select(...)` que realizan **lectura** de datos (no los `.select()` que siguen a `.insert()` para devolver el registro creado).

### Totales

| Métrica | Valor |
|--------|--------|
| **Hooks que realizan lecturas** | 18 (queries + funciones con GET) |
| **Operaciones SELECT distintas** (por invocación de query/mutation) | **~65** (contando cada `.from().select()` en el código) |
| **Tablas leídas** | actividad, ejercicio, serie, rutina, rutina_ejercicio, tipo_ejercicio, medidas, perfil, logro, usuario_logro |
| **Llamadas GET por carga típica del Dashboard** | **~15–20** (según mes y caché de React Query) |

---

## 2. Inventario por archivo y hook

### 2.1 `src/hooks/useWorkouts.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useLastWorkout` | actividad | SELECT * | Última actividad del usuario (limit 1). |
| `useLastWorkout` | ejercicio | SELECT *, tipo_ejercicio(*) | Ejercicios de esa actividad. |
| `useLastWorkout` | serie | SELECT * | Series de esos ejercicios (in ejercicio_id). |
| `useWeeklyWorkouts` | actividad | SELECT fecha | Fechas de actividades desde inicio de semana. |
| `useMonthWorkoutDates` | actividad | SELECT fecha | Fechas de actividades del mes. |
| `useMonthWorkouts` | actividad | SELECT * | Actividades del mes. |
| `useMonthWorkouts` | ejercicio | SELECT *, tipo_ejercicio(*) | Ejercicios de esas actividades. |
| `useMonthWorkouts` | serie | SELECT * | Series de esos ejercicios. |
| `useWorkoutsForDate` | actividad | SELECT * | Actividades de un día. |
| `useWorkoutsForDate` | ejercicio | SELECT *, tipo_ejercicio(*) | Ejercicios de esas actividades. |
| `useWorkoutsForDate` | serie | SELECT * | Series de esos ejercicios. |
| `useWorkoutById` | actividad | SELECT * (single) | Una actividad por id. |
| `useWorkoutById` | ejercicio | SELECT *, tipo_ejercicio(*) | Ejercicios de esa actividad. |
| `useWorkoutById` | serie | SELECT * | Series de esos ejercicios. |
| `useWorkoutHistory` | actividad | SELECT * | Todas las actividades del usuario. |
| `useWorkoutHistory` | ejercicio | SELECT *, tipo_ejercicio(*) | Ejercicios de esas actividades. |
| `useWorkoutHistory` | serie | SELECT * | Series de esos ejercicios. |

**Total useWorkouts.ts:** 17 operaciones SELECT (por ejecución de cada query; varias comparten patrón actividad → ejercicio → serie).

---

### 2.2 `src/hooks/useRoutines.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useRoutines` | rutina | SELECT * | Rutinas del usuario (no plantillas). |
| `useRoutines` | rutina_ejercicio | SELECT *, tipo_ejercicio(*) | Ejercicios de esas rutinas. |
| `useRoutineById` | rutina | SELECT * (maybeSingle) | Una rutina por id. |
| `useRoutineById` | rutina_ejercicio | SELECT *, tipo_ejercicio(*) | Ejercicios de esa rutina. |

**Total useRoutines.ts:** 4 operaciones SELECT.

---

### 2.3 `src/hooks/useExerciseCatalog.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useExerciseCatalog` | tipo_ejercicio | SELECT * | Catálogo de tipos de ejercicio (opcional ilike por nombre). |

**Total useExerciseCatalog.ts:** 1 operación SELECT.

---

### 2.4 `src/hooks/useMeasurements.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useMeasurements` (query) | medidas | SELECT * | Medidas del usuario ordenadas por fecha. |

**Total useMeasurements.ts:** 1 operación SELECT.

---

### 2.5 `src/hooks/useActiveWorkout.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useActiveWorkout` | actividad | SELECT id, titulo, fecha | Entrenamiento activo (fecha_fin null, limit 1). Refetch cada 30 s. |

**Total useActiveWorkout.ts:** 1 operación SELECT.

---

### 2.6 `src/hooks/useLastPerformance.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useLastPerformance` | ejercicio | SELECT id, actividad!inner(fecha, fecha_fin) | Último ejercicio completado de un tipo. |
| `useLastPerformance` | serie | SELECT numero_serie, peso_kg, repeticiones | Series de ese ejercicio. |

**Total useLastPerformance.ts:** 2 operaciones SELECT (por cada tipo de ejercicio usado en una tarjeta).

---

### 2.7 `src/hooks/useExerciseProgress.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useExerciseWithHistory` | serie | SELECT con join ejercicio, tipo_ejercicio | Series con datos de ejercicio y tipo para historial. |
| `useExerciseHistory` | serie | SELECT con join ejercicio, actividad | Series por tipo con fecha de actividad para 1RM. |

**Total useExerciseProgress.ts:** 2 operaciones SELECT.

---

### 2.8 `src/hooks/useGamification.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useProfileStats` | perfil | SELECT nivel, xp_total, racha_actual, racha_maxima, ultima_actividad_fecha | Stats del perfil. |
| `useCalculateAndAwardXP` | perfil | SELECT * | Perfil actual antes de actualizar XP (mutación). |
| `useRemoveWorkoutXP` | actividad | SELECT fecha, fecha_fin | Actividad que se borra. |
| `useRemoveWorkoutXP` | actividad | SELECT id, fecha, fecha_fin | Todas las actividades completadas del usuario. |
| `useRemoveWorkoutXP` | perfil | SELECT * | Perfil actual antes de restar XP. |
| `useRemoveWorkoutXP` | actividad | SELECT fecha (limit 1) | Última actividad restante. |

**Total useGamification.ts:** 6 operaciones SELECT (4 en removeXP, 1 en profileStats, 1 en calculateAndAwardXP).

---

### 2.9 `src/hooks/useLogros.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `fetchLogroStats` | actividad | SELECT id, fecha | Actividades completadas del usuario. |
| `fetchLogroStats` | perfil | SELECT racha_maxima | Racha máxima. |
| `fetchLogroStats` | ejercicio | SELECT id, actividad_id | Ejercicios de esas actividades. |
| `fetchLogroStats` | serie | SELECT ejercicio_id | Series para contar por día. |
| `checkAndAwardLogros` | logro | SELECT * | Definiciones de logros. |
| `checkAndAwardLogros` | (usa fetchLogroStats) | — | Incluye las 4 anteriores. |
| `useLogros` | logro | SELECT * | Listado de logros. |
| `useLogros` | usuario_logro | SELECT logro_id | Logros desbloqueados del usuario. |

**Total useLogros.ts:** 6 SELECT en fetchLogroStats + checkAndAwardLogros (logro 1 vez), 2 en useLogros. En una ejecución típica de useLogros: 2 GETs; en checkAndAwardLogros: 5 GETs (logro + fetchLogroStats).

---

### 2.10 `src/hooks/useMuscleStatistics.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useMuscleStatistics` | ejercicio | SELECT id, tipo_ejercicio(body_part) | Ejercicios del usuario con body_part. |
| `useMuscleStatistics` | serie | SELECT ejercicio_id | Por chunks de 200 (completed = true). |

**Total useMuscleStatistics.ts:** 1 + ceil(N_ejercicios/200) operaciones SELECT (N variable).

---

### 2.11 `src/hooks/useMuscleVolume.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `useMuscleVolume` | actividad | SELECT id | Actividades del periodo (semana/mes). |
| `useMuscleVolume` | ejercicio | SELECT id, tipo_ejercicio(body_part) | Ejercicios de esas actividades. |
| `useMuscleVolume` | serie | SELECT ejercicio_id (completed = true) | Series completadas. |

**Total useMuscleVolume.ts:** 3 operaciones SELECT.

---

### 2.12 `src/hooks/usePredefinedRoutines.ts`

| Hook / función | Tabla | Operación | Descripción |
|---------------|--------|-----------|-------------|
| `usePredefinedRoutines` | rutina | SELECT * (es_plantilla = true) | Plantillas de rutina. |
| `usePredefinedRoutines` | rutina_ejercicio | SELECT *, tipo_ejercicio(...) | Ejercicios de plantillas. |
| `useCloneRoutine` (mutación) | rutina | SELECT * (template) | Una plantilla por id. |
| `useCloneRoutine` | rutina_ejercicio | SELECT * | Ejercicios de la plantilla. |

**Total usePredefinedRoutines.ts:** 2 GETs en query; 2 GETs al clonar una rutina.

---

### 2.13 `src/components/workout/WorkoutLogger.tsx`

| Acción | Tabla | Operación | Descripción |
|--------|--------|-----------|-------------|
| Usa `useWorkoutById` | — | (véase useWorkouts) | Al abrir con workoutId: 3 GETs (actividad + ejercicio + serie). |
| `handleDelete` | ejercicio | SELECT id | IDs de ejercicios de la actividad a borrar. |
| `handleDelete` | serie | SELECT id, repeticiones, peso_kg | Para calcular XP a restar. |

**Total WorkoutLogger (además de useWorkoutById):** 2 GETs al eliminar un entrenamiento.

---

### 2.14 `src/components/routine/RoutineForm.tsx`

- Usa `useRoutineById(routineId)`: al editar una rutina se ejecutan **2 GETs** (rutina + rutina_ejercicio).
- El guardado solo hace insert/update/delete; no hay GETs adicionales de lectura pura.

---

### 2.15 `src/components/routine/ImportRoutineFromCsvDialog.tsx`

- Usa `useExerciseCatalog()`: **1 GET** a tipo_ejercicio.
- La importación solo inserta (rutina, rutina_ejercicio); el `.select("id")` tras insert es para devolver el id creado, no lectura de listado.

---

### 2.16 `src/pages/AdminImport.tsx`

- **GET externo:** `fetch("https://exercisedb.p.rapidapi.com/...")` (no es Supabase).
- Luego insert en `tipo_ejercicio`; no hay SELECT de lectura a BD en este flujo.

---

### 2.17 Autenticación: `src/hooks/useAuth.tsx`

- `supabase.auth.getSession()`: **1 llamada** al API de Auth (no es tabla pública de BD, pero es una GET al backend).

---

## 3. Uso por pantalla / flujo

Cada vez que se monta un componente se ejecutan sus hooks; React Query cachea por `queryKey`, por lo que las cifras son “máximas” por primera carga o tras invalidación.

### 3.1 Dashboard (`/` o ruta principal con Dashboard)

| Origen | GETs (por ejecución de query) |
|--------|--------------------------------|
| useLastWorkout | 3 (actividad + ejercicio + serie) |
| useWeeklyWorkouts | 1 (actividad) |
| useMonthWorkouts(calendarMonth) | 3 (actividad + ejercicio + serie) |
| useMonthWorkoutDates(calendarMonth) | 1 (actividad) |
| GamificationWidget → useProfileStats | 1 (perfil) |
| BodyHeatmap → useMuscleVolume | 3 (actividad + ejercicio + serie) |
| ExerciseProgressWidget → useExerciseWithHistory | 1 (serie) |
| ExerciseProgressWidget → useExerciseHistory(selectedId) | 1 (serie) si hay ejercicio seleccionado |
| **Total aproximado primera carga** | **~14–15 GETs** |

Si además está visible el calendario semanal (WeekCalendar) con `useMonthWorkouts(monthForWeek)`, puede coincidir con el mes ya cargado (caché) o sumar 3 más si el mes es distinto.

### 3.2 Rutinas (`/routines`)

| Origen | GETs |
|--------|------|
| useRoutines | 2 (rutina + rutina_ejercicio) |
| useActiveWorkout | 1 (actividad) |
| **Total** | **3 GETs** |

Si se abre el formulario de edición: +2 (useRoutineById). Si se abre el explorador de plantillas: +2 (usePredefinedRoutines).

### 3.3 Historial de entrenamientos (`/workouts` o similar)

| Origen | GETs |
|--------|------|
| useWorkoutHistory | 3 (actividad + ejercicio + serie) |
| **Total** | **3 GETs** |

### 3.4 Ejercicios (`/exercises`)

| Origen | GETs |
|--------|------|
| useExerciseCatalog(search) | 1 (tipo_ejercicio) |
| **Total** | **1 GET** |

### 3.5 Medidas (`/measurements`)

| Origen | GETs |
|--------|------|
| useMeasurements | 1 (medidas) |
| **Total** | **1 GET** |

### 3.6 Drawer de entrenamiento (WorkoutLogger)

| Origen | GETs |
|--------|------|
| useWorkoutById(id) al abrir con id | 3 (actividad + ejercicio + serie) |
| Por cada ExerciseCard (último rendimiento) | useLastPerformance → 2 GETs por tipo de ejercicio |
| **Total** | 3 + 2×N ejercicios en la ficha (N GETs repetidos por tipo si hay varias series del mismo tipo) |

React Query deduplica por `queryKey` (p. ej. mismo tipo de ejercicio), así que en la práctica son 2 GETs por **tipo** de ejercicio distinto mostrado en la ficha.

### 3.7 Perfil / drawer de perfil (ProfileDrawer)

| Origen | GETs |
|--------|------|
| useProfileStats | 1 (perfil) |
| useLogros | 2 (logro + usuario_logro) |
| **Total** | **3 GETs** |

### 3.8 Explorador de plantillas (PredefinedRoutinesExplorer)

| Origen | GETs |
|--------|------|
| usePredefinedRoutines | 2 (rutina + rutina_ejercicio) |
| **Total** | **2 GETs** |

---

## 4. Resumen por tabla

| Tabla | N.º de puntos de lectura (hooks/componentes) | Observaciones |
|-------|---------------------------------------------|---------------|
| actividad | useLastWorkout, useWeeklyWorkouts, useMonthWorkoutDates, useMonthWorkouts, useWorkoutsForDate, useWorkoutById, useWorkoutHistory, useActiveWorkout, useGamification (removeXP x2, lastAct), useLogros (fetchLogroStats), useMuscleVolume, WorkoutLogger (handleDelete) | Muy consultada; varios rangos de fechas. |
| ejercicio | useLastWorkout, useMonthWorkouts, useWorkoutsForDate, useWorkoutById, useWorkoutHistory, useLastPerformance, useLogros (fetchLogroStats), useMuscleStatistics, useMuscleVolume, WorkoutLogger (handleDelete) | Siempre asociada a actividad o rutina. |
| serie | useLastWorkout, useMonthWorkouts, useWorkoutsForDate, useWorkoutById, useWorkoutHistory, useLastPerformance, useExerciseWithHistory, useExerciseHistory, useLogros (fetchLogroStats), useMuscleStatistics, useMuscleVolume, WorkoutLogger (handleDelete) | Muchas lecturas; a veces en chunks (useMuscleStatistics). |
| rutina | useRoutines, useRoutineById, usePredefinedRoutines, useCloneRoutine | Lecturas moderadas. |
| rutina_ejercicio | useRoutines, useRoutineById, usePredefinedRoutines, useCloneRoutine | Junto a rutina. |
| tipo_ejercicio | useRoutines, useRoutineById, useWorkoutById, useLastWorkout, useMonthWorkouts, useWorkoutsForDate, useWorkoutHistory, useExerciseCatalog, usePredefinedRoutines, useLastPerformance (vía ejercicio), useExerciseWithHistory, useMuscleStatistics, useMuscleVolume | Muy usada (joins y catálogo). |
| medidas | useMeasurements | Una query. |
| perfil | useProfileStats, useCalculateAndAwardXP, useRemoveWorkoutXP, useLogros (fetchLogroStats) | Varias lecturas en gamificación y logros. |
| logro | checkAndAwardLogros, useLogros | Listado y comprobación. |
| usuario_logro | useLogros | Estado de logros desbloqueados. |

---

## 5. Observaciones y riesgos

1. **Patrón actividad → ejercicio → serie**  
   Varios hooks (useLastWorkout, useMonthWorkouts, useWorkoutById, useWorkoutHistory, etc.) hacen 3 GETs secuenciales. No es N+1 clásico pero multiplica el número de round-trips. Una vista materializada o un RPC que devuelva actividad + ejercicios + series en una sola llamada reduciría GETs.

2. **useLastPerformance por ejercicio**  
   En WorkoutLogger, cada ExerciseCard puede disparar useLastPerformance(tipoEjercicioId). React Query cachea por tipo, pero si hay muchos tipos distintos se acumulan 2 GETs por tipo. Valorar un endpoint que devuelva “último rendimiento” de varios tipos a la vez.

3. **useMuscleStatistics**  
   Hace 1 GET a ejercicio y luego chunks de 200 a serie. Con muchos ejercicios puede haber varias decenas de GETs. Un RPC o vista que agregue por body_part y usuario reduciría llamadas.

4. **useActiveWorkout con refetchInterval: 30000**  
   Cada 30 s se hace 1 GET a actividad. Aceptable para “entrenamiento activo”, pero es la única query con polling explícito.

5. **Invalidaciones amplias**  
   `invalidateAll()` en WorkoutLogger invalida lastWorkout, weeklyWorkouts, workoutHistory, monthWorkoutDates, workoutsForDate, workout, activeWorkout, monthWorkouts. Tras guardar/borrar se re-ejecutan todas esas queries si están montadas, lo que puede generar un pico de GETs.

6. **checkAndAwardLogros**  
   Se llama al finalizar entrenamiento y hace 5 GETs (logro + fetchLogroStats). Podría moverse a un Edge Function o RPC para hacer todo en el servidor y devolver solo el resultado.

---

## 6. Recomendaciones

1. **Agrupar lecturas en RPCs o vistas**  
   Para flujos “actividad + ejercicios + series” y “estadísticas de músculo”, valorar RPCs o vistas en Supabase que devuelvan el JSON ya armado en una sola llamada.

2. **Batch de último rendimiento**  
   Si el drawer de entrenamiento muestra muchos ejercicios, un único endpoint “lastPerformanceByExerciseIds” reduciría GETs desde 2×N a 1.

3. **Cache y staleTime**  
   Revisar `staleTime` en React Query para queries que cambian poco (logros, catálogo de ejercicios, plantillas) y evitar refetches innecesarios.

4. **Evitar invalidaciones masivas**  
   En lugar de invalidar todas las queries de entrenamientos, invalidar solo las que dependen del rango de fechas o del id afectado (por ejemplo workout, workoutsForDate, lastWorkout).

5. **Mover lógica pesada al backend**  
   Cálculo de XP, rachas y comprobación de logros en un Edge Function o RPC reduciría GETs desde el cliente y centralizaría la lógica.

---

## 7. Método de elaboración del informe

- Búsqueda en el código de `supabase.from(` y `.select(` para identificar todas las cadenas de lectura.
- Exclusión de `.insert().select()`, `.update()` y `.delete()` (solo se cuentan lecturas).
- Revisión de cada hook y componente que usa Supabase para clasificar GETs por tabla y flujo.
- Cálculo de totales por pantalla asumiendo primera carga o post-invalidación (sin deduplicar por caché entre rutas).

---

*Informe generado el 14 de marzo de 2025 para el proyecto gym-log.*

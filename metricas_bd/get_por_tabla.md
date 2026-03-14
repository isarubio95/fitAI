# Llamadas GET por tabla Supabase

**Fecha:** 14 de marzo de 2025

Conteo de puntos del código que realizan `SELECT` (lectura) sobre cada tabla.

| Tabla | N.º de SELECT en código | Hooks/acciones que leen |
|-------|-------------------------|---------------------------|
| **actividad** | 14+ | useLastWorkout, useWeeklyWorkouts, useMonthWorkoutDates, useMonthWorkouts, useWorkoutsForDate, useWorkoutById, useWorkoutHistory, useActiveWorkout, useRemoveWorkoutXP (2), useLogros (fetchLogroStats), useMuscleVolume |
| **ejercicio** | 10+ | useLastWorkout, useMonthWorkouts, useWorkoutsForDate, useWorkoutById, useWorkoutHistory, useLastPerformance, useLogros (fetchLogroStats), useMuscleStatistics, useMuscleVolume, WorkoutLogger handleDelete |
| **serie** | 12+ | useLastWorkout, useMonthWorkouts, useWorkoutsForDate, useWorkoutById, useWorkoutHistory, useLastPerformance, useExerciseWithHistory, useExerciseHistory, useLogros (fetchLogroStats), useMuscleStatistics (chunks), useMuscleVolume, WorkoutLogger handleDelete |
| **rutina** | 4 | useRoutines, useRoutineById, usePredefinedRoutines, useCloneRoutine |
| **rutina_ejercicio** | 4 | useRoutines, useRoutineById, usePredefinedRoutines, useCloneRoutine |
| **tipo_ejercicio** | 1 (directo) + muchos (joins) | useExerciseCatalog; el resto vía joins en ejercicio/rutina_ejercicio |
| **medidas** | 1 | useMeasurements |
| **perfil** | 4 | useProfileStats, useCalculateAndAwardXP, useRemoveWorkoutXP, useLogros (fetchLogroStats) |
| **logro** | 2 | checkAndAwardLogros, useLogros |
| **usuario_logro** | 1 | useLogros |

Las tablas más leídas en términos de número de flujos que las consultan son **actividad**, **serie** y **ejercicio**, seguidas de **perfil** y **rutina**/ **rutina_ejercicio**.

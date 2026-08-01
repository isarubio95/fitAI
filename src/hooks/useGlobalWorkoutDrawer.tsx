import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExerciseFormData } from "@/types/workout";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useToast } from "@/hooks/use-toast";
import { toastActiveWorkoutBlocked } from "@/lib/activeWorkoutGuard";
import type { PillCircleOrigin } from "@/lib/pillCircleTransition";

interface DrawerState {
  open: boolean;
  workoutId: string | null;
  defaultDate?: string;
  templateExercises?: ExerciseFormData[];
  templateTitle?: string;
  templateRoutineIcon?: string | null;
  plannedId?: string;
  /** Origen de la revelación circular (pill «en curso», botón iniciar rutina, etc.). */
  pillOrigin?: PillCircleOrigin;
}

interface GlobalWorkoutDrawerContextType {
  state: DrawerState;
  openNew: (date?: string) => void;
  openEdit: (workoutId: string) => void;
  openFromTemplate: (
    title: string,
    exercises: ExerciseFormData[],
    routineIcon?: string | null,
    pillOrigin?: PillCircleOrigin,
  ) => void;
  openFromPlannedRoutine: (
    plannedId: string,
    title: string,
    exercises: ExerciseFormData[],
    routineIcon?: string | null,
    plannedDate?: string,
  ) => void;
  openActiveWorkout: (workoutId: string, pillOrigin?: PillCircleOrigin) => void;
  setOpen: (open: boolean) => void;
  close: () => void;
}

const GlobalWorkoutDrawerContext = createContext<GlobalWorkoutDrawerContextType | null>(null);

const INITIAL: DrawerState = { open: false, workoutId: null };

export function GlobalWorkoutDrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DrawerState>(INITIAL);
  const { data: activeWorkout } = useActiveWorkout();
  const { toast } = useToast();

  const openActiveWorkout = useCallback((workoutId: string, pillOrigin?: PillCircleOrigin) => {
    setState({
      open: true,
      workoutId,
      defaultDate: undefined,
      templateExercises: undefined,
      templateTitle: undefined,
      templateRoutineIcon: undefined,
      plannedId: undefined,
      pillOrigin,
    });
  }, []);

  const blockIfActiveWorkout = useCallback((): boolean => {
    if (!activeWorkout) return false;
    toastActiveWorkoutBlocked(toast, openActiveWorkout, activeWorkout);
    return true;
  }, [activeWorkout, toast, openActiveWorkout]);

  const openNew = useCallback(
    (date?: string) => {
      if (blockIfActiveWorkout()) return;
      setState({
        open: true,
        workoutId: null,
        defaultDate: date,
        templateExercises: undefined,
        templateTitle: undefined,
        templateRoutineIcon: undefined,
        plannedId: undefined,
      });
    },
    [blockIfActiveWorkout],
  );

  const openEdit = useCallback((workoutId: string) => {
    setState({
      open: true,
      workoutId,
      defaultDate: undefined,
      templateExercises: undefined,
      templateTitle: undefined,
      templateRoutineIcon: undefined,
      plannedId: undefined,
    });
  }, []);

  const openFromTemplate = useCallback(
    (
      title: string,
      exercises: ExerciseFormData[],
      routineIcon?: string | null,
      pillOrigin?: PillCircleOrigin,
    ) => {
      if (blockIfActiveWorkout()) return;
      setState({
        open: true,
        workoutId: null,
        defaultDate: undefined,
        templateExercises: exercises,
        templateTitle: title,
        templateRoutineIcon: routineIcon ?? null,
        plannedId: undefined,
        pillOrigin,
      });
    },
    [blockIfActiveWorkout],
  );

  const openFromPlannedRoutine = useCallback(
    (
      plannedId: string,
      title: string,
      exercises: ExerciseFormData[],
      routineIcon?: string | null,
      plannedDate?: string,
    ) => {
      if (blockIfActiveWorkout()) return;
      setState({
        open: true,
        workoutId: null,
        defaultDate: plannedDate?.slice(0, 10),
        templateExercises: exercises,
        templateTitle: title,
        templateRoutineIcon: routineIcon ?? null,
        plannedId,
      });
    },
    [blockIfActiveWorkout],
  );

  const setOpen = useCallback((open: boolean) => {
    setState((prev) => {
      if (!open) {
        return INITIAL;
      }
      return { ...prev, open };
    });
  }, []);

  const close = useCallback(() => {
    setState(INITIAL);
  }, []);

  return (
    <GlobalWorkoutDrawerContext.Provider
      value={{
        state,
        openNew,
        openEdit,
        openFromTemplate,
        openFromPlannedRoutine,
        openActiveWorkout,
        setOpen,
        close,
      }}
    >
      {children}
    </GlobalWorkoutDrawerContext.Provider>
  );
}

export function useGlobalWorkoutDrawer() {
  const ctx = useContext(GlobalWorkoutDrawerContext);
  if (!ctx) throw new Error("useGlobalWorkoutDrawer must be used within GlobalWorkoutDrawerProvider");
  return ctx;
}

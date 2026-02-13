import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExerciseFormData } from "@/types/workout";

interface DrawerState {
  open: boolean;
  workoutId: string | null;
  defaultDate?: string;
  templateExercises?: ExerciseFormData[];
  templateTitle?: string;
}

interface GlobalWorkoutDrawerContextType {
  state: DrawerState;
  openNew: (date?: string) => void;
  openEdit: (workoutId: string) => void;
  openFromTemplate: (title: string, exercises: ExerciseFormData[]) => void;
  openActiveWorkout: (workoutId: string) => void;
  setOpen: (open: boolean) => void;
  close: () => void;
}

const GlobalWorkoutDrawerContext = createContext<GlobalWorkoutDrawerContextType | null>(null);

const INITIAL: DrawerState = { open: false, workoutId: null };

export function GlobalWorkoutDrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DrawerState>(INITIAL);

  const openNew = useCallback((date?: string) => {
    setState({ open: true, workoutId: null, defaultDate: date, templateExercises: undefined, templateTitle: undefined });
  }, []);

  const openEdit = useCallback((workoutId: string) => {
    setState({ open: true, workoutId, defaultDate: undefined, templateExercises: undefined, templateTitle: undefined });
  }, []);

  const openFromTemplate = useCallback((title: string, exercises: ExerciseFormData[]) => {
    setState({ open: true, workoutId: null, defaultDate: undefined, templateExercises: exercises, templateTitle: title });
  }, []);

  const openActiveWorkout = useCallback((workoutId: string) => {
    setState({ open: true, workoutId, defaultDate: undefined, templateExercises: undefined, templateTitle: undefined });
  }, []);

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
    <GlobalWorkoutDrawerContext.Provider value={{ state, openNew, openEdit, openFromTemplate, openActiveWorkout, setOpen, close }}>
      {children}
    </GlobalWorkoutDrawerContext.Provider>
  );
}

export function useGlobalWorkoutDrawer() {
  const ctx = useContext(GlobalWorkoutDrawerContext);
  if (!ctx) throw new Error("useGlobalWorkoutDrawer must be used within GlobalWorkoutDrawerProvider");
  return ctx;
}

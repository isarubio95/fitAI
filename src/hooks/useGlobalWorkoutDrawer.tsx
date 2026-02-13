import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { ExerciseFormData } from "@/types/workout";

interface WorkoutDrawerState {
  open: boolean;
  workoutId: string | null;
  defaultDate?: string;
  templateExercises?: ExerciseFormData[];
  templateTitle?: string;
}

interface GlobalWorkoutDrawerContextType {
  state: WorkoutDrawerState;
  openNew: (date?: string) => void;
  openEdit: (id: string) => void;
  openFromTemplate: (title: string, exercises: ExerciseFormData[]) => void;
  openActiveWorkout: (id: string) => void;
  setOpen: (open: boolean) => void;
  close: () => void;
}

const GlobalWorkoutDrawerContext = createContext<GlobalWorkoutDrawerContextType | null>(null);

const initialState: WorkoutDrawerState = {
  open: false,
  workoutId: null,
};

export function GlobalWorkoutDrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkoutDrawerState>(initialState);

  const openNew = useCallback((date?: string) => {
    setState({ open: true, workoutId: null, defaultDate: date, templateExercises: undefined, templateTitle: undefined });
  }, []);

  const openEdit = useCallback((id: string) => {
    setState({ open: true, workoutId: id, defaultDate: undefined, templateExercises: undefined, templateTitle: undefined });
  }, []);

  const openFromTemplate = useCallback((title: string, exercises: ExerciseFormData[]) => {
    setState({ open: true, workoutId: null, defaultDate: undefined, templateExercises: exercises, templateTitle: title });
  }, []);

  const openActiveWorkout = useCallback((id: string) => {
    setState({ open: true, workoutId: id, defaultDate: undefined, templateExercises: undefined, templateTitle: undefined });
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setState((prev) => {
      if (!open) return initialState;
      return { ...prev, open };
    });
  }, []);

  const close = useCallback(() => {
    setState(initialState);
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

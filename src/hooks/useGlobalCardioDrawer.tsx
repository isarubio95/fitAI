import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { CardioRoutineBlockInput } from "@/types/cardio";
import type { PillCircleOrigin } from "@/lib/pillCircleTransition";

type CardioDrawerState = {
  open: boolean;
  sessionId: string | null;
  liveOpen: boolean;
  liveSessionId: string | null;
  initialDisciplineId?: string | null;
  templateTitle?: string;
  templateDisciplineId?: string | null;
  templateBlocks?: CardioRoutineBlockInput[];
  /** Origen de la revelación circular al abrir desde la pill «en curso». */
  pillOrigin?: PillCircleOrigin;
};

type GlobalCardioDrawerContextType = {
  state: CardioDrawerState;
  openNew: () => void;
  openNewWithDiscipline: (disciplineId: string) => void;
  openEdit: (sessionId: string) => void;
  openFromTemplate: (title: string, disciplineId: string | null, blocks: CardioRoutineBlockInput[]) => void;
  /** Abre el mapa en modo setup (sin sesión) para elegir disciplina. */
  openLiveSetup: () => void;
  openLiveRecording: (sessionId: string, pillOrigin?: PillCircleOrigin) => void;
  closeLiveRecording: () => void;
  setOpen: (open: boolean) => void;
  close: () => void;
};

const INITIAL: CardioDrawerState = {
  open: false,
  sessionId: null,
  liveOpen: false,
  liveSessionId: null,
};
const GlobalCardioDrawerContext = createContext<GlobalCardioDrawerContextType | null>(null);

export function GlobalCardioDrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CardioDrawerState>(INITIAL);

  const openNew = useCallback(() => {
    setState({
      open: true,
      sessionId: null,
      liveOpen: false,
      liveSessionId: null,
      initialDisciplineId: null,
      templateBlocks: undefined,
      templateTitle: undefined,
      templateDisciplineId: undefined,
    });
  }, []);

  const openNewWithDiscipline = useCallback((disciplineId: string) => {
    setState({
      open: true,
      sessionId: null,
      liveOpen: false,
      liveSessionId: null,
      initialDisciplineId: disciplineId,
      templateBlocks: undefined,
      templateTitle: undefined,
      templateDisciplineId: undefined,
    });
  }, []);

  const openEdit = useCallback((sessionId: string) => {
    setState({
      open: true,
      sessionId,
      liveOpen: false,
      liveSessionId: null,
      initialDisciplineId: undefined,
      templateBlocks: undefined,
      templateTitle: undefined,
      templateDisciplineId: undefined,
    });
  }, []);

  const openFromTemplate = useCallback((title: string, disciplineId: string | null, blocks: CardioRoutineBlockInput[]) => {
    setState({
      open: true,
      sessionId: null,
      liveOpen: false,
      liveSessionId: null,
      initialDisciplineId: disciplineId,
      templateTitle: title,
      templateDisciplineId: disciplineId,
      templateBlocks: blocks,
    });
  }, []);

  const openLiveSetup = useCallback(() => {
    setState({
      open: false,
      sessionId: null,
      liveOpen: true,
      liveSessionId: null,
      initialDisciplineId: undefined,
      templateBlocks: undefined,
      templateTitle: undefined,
      templateDisciplineId: undefined,
      pillOrigin: undefined,
    });
  }, []);

  const openLiveRecording = useCallback((sessionId: string, pillOrigin?: PillCircleOrigin) => {
    setState({
      open: false,
      sessionId: null,
      liveOpen: true,
      liveSessionId: sessionId,
      initialDisciplineId: undefined,
      templateBlocks: undefined,
      templateTitle: undefined,
      templateDisciplineId: undefined,
      pillOrigin,
    });
  }, []);

  const closeLiveRecording = useCallback(() => {
    setState((prev) => ({ ...prev, liveOpen: false, liveSessionId: null, pillOrigin: undefined }));
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setState((prev) => (open ? { ...prev, open } : INITIAL));
  }, []);

  const close = useCallback(() => setState(INITIAL), []);

  return (
    <GlobalCardioDrawerContext.Provider
      value={{
        state,
        openNew,
        openNewWithDiscipline,
        openEdit,
        openFromTemplate,
        openLiveSetup,
        openLiveRecording,
        closeLiveRecording,
        setOpen,
        close,
      }}
    >
      {children}
    </GlobalCardioDrawerContext.Provider>
  );
}

export function useGlobalCardioDrawer() {
  const ctx = useContext(GlobalCardioDrawerContext);
  if (!ctx) throw new Error("useGlobalCardioDrawer must be used within GlobalCardioDrawerProvider");
  return ctx;
}

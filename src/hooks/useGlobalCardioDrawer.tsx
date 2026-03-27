import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { CardioRoutineBlockInput } from "@/types/cardio";

type CardioDrawerState = {
  open: boolean;
  sessionId: string | null;
  templateTitle?: string;
  templateBlocks?: CardioRoutineBlockInput[];
};

type GlobalCardioDrawerContextType = {
  state: CardioDrawerState;
  openNew: () => void;
  openEdit: (sessionId: string) => void;
  openFromTemplate: (title: string, blocks: CardioRoutineBlockInput[]) => void;
  setOpen: (open: boolean) => void;
  close: () => void;
};

const INITIAL: CardioDrawerState = { open: false, sessionId: null };
const GlobalCardioDrawerContext = createContext<GlobalCardioDrawerContextType | null>(null);

export function GlobalCardioDrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CardioDrawerState>(INITIAL);

  const openNew = useCallback(() => {
    setState({ open: true, sessionId: null, templateBlocks: undefined, templateTitle: undefined });
  }, []);

  const openEdit = useCallback((sessionId: string) => {
    setState({ open: true, sessionId, templateBlocks: undefined, templateTitle: undefined });
  }, []);

  const openFromTemplate = useCallback((title: string, blocks: CardioRoutineBlockInput[]) => {
    setState({ open: true, sessionId: null, templateTitle: title, templateBlocks: blocks });
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setState((prev) => (open ? { ...prev, open } : INITIAL));
  }, []);

  const close = useCallback(() => setState(INITIAL), []);

  return (
    <GlobalCardioDrawerContext.Provider value={{ state, openNew, openEdit, openFromTemplate, setOpen, close }}>
      {children}
    </GlobalCardioDrawerContext.Provider>
  );
}

export function useGlobalCardioDrawer() {
  const ctx = useContext(GlobalCardioDrawerContext);
  if (!ctx) throw new Error("useGlobalCardioDrawer must be used within GlobalCardioDrawerProvider");
  return ctx;
}


import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";

/**
 * WorkoutLogger (≈2000 líneas), CardioLogger y CardioLiveRecorder estaban
 * montados en todas las pantallas aunque el usuario no los abriera nunca: peso
 * en el chunk inicial y trabajo de render en cada arranque.
 *
 * Aquí se montan la primera vez que se abren y ya no se desmontan (para no
 * perder estado ni romper la animación de cierre). Para que esa primera
 * apertura no espere al chunk, se precargan en cuanto el hilo principal queda
 * libre: cuando el usuario toca "Registrar", el módulo ya está en memoria.
 *
 * Todos los efectos de estos componentes están condicionados a `open`, así que
 * no montarlos antes de la primera apertura no cambia el comportamiento.
 */

const loadWorkoutLogger = () =>
  import("@/components/workout/WorkoutLogger").then((m) => ({ default: m.WorkoutLogger }));
const loadCardioLogger = () =>
  import("@/components/cardio/CardioLogger").then((m) => ({ default: m.CardioLogger }));
const loadCardioLiveRecorder = () =>
  import("@/components/cardio/CardioLiveRecorder").then((m) => ({ default: m.CardioLiveRecorder }));

const WorkoutLogger = lazy(loadWorkoutLogger);
const CardioLogger = lazy(loadCardioLogger);
const CardioLiveRecorder = lazy(loadCardioLiveRecorder);

function whenIdle(run: () => void) {
  const idle = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (idle) return idle(run, { timeout: 4000 });
  return window.setTimeout(run, 1200);
}

/** Monta a los hijos la primera vez que `open` es cierto, y los deja montados. */
function MountOnFirstOpen({ open, children }: { open: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!mounted) return null;
  return <Suspense fallback={null}>{children}</Suspense>;
}

export function DeferredGlobalDrawers() {
  const { state: workoutState } = useGlobalWorkoutDrawer();
  const { state: cardioState } = useGlobalCardioDrawer();

  useEffect(() => {
    whenIdle(() => {
      void loadWorkoutLogger().catch(() => {});
      void loadCardioLogger().catch(() => {});
      void loadCardioLiveRecorder().catch(() => {});
    });
  }, []);

  return (
    <>
      <MountOnFirstOpen open={workoutState.open}>
        <WorkoutLogger />
      </MountOnFirstOpen>
      <MountOnFirstOpen open={cardioState.open}>
        <CardioLogger />
      </MountOnFirstOpen>
      <MountOnFirstOpen open={cardioState.liveOpen}>
        <CardioLiveRecorder />
      </MountOnFirstOpen>
    </>
  );
}

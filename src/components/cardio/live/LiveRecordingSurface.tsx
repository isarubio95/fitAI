import { Suspense, lazy, type ReactNode } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardioDisciplineIsland } from "@/components/cardio/CardioDisciplineIsland";
import type { CardioGpsPoint } from "@/hooks/useCardioGpsRecorder";

const LiveCardioMap = lazy(() =>
  import("@/components/cardio/LiveCardioMap").then((m) => ({ default: m.LiveCardioMap })),
);

type Props = {
  showGpsSurface: boolean;
  showGpsErrorUi: boolean;
  gpsDenied: boolean;
  gpsError: string | null;
  mapPoints: CardioGpsPoint[];
  referencePoints?: Array<{ lat: number; lng: number }>;
  /** Sesión en curso: el mapa se acerca respecto a la vista de setup. */
  recording: boolean;
  /** Posición actual mientras no hay track (setup), para centrar el mapa y activar sus controles. */
  previewPoint?: { lat: number; lng: number } | null;
  /** Alto libre bajo los controles del mapa: quedan justo encima de la barra de métricas. */
  mapControlsBottomPx: number;
  loadingSession: boolean;
  isSetup: boolean;
  setupDisciplineId: string | null;
  lastDisciplineId: string | null;
  onSelectDiscipline: (id: string) => void;
  onOpenManual: () => void;
  indoorFallback?: ReactNode;
};

export function LiveRecordingSurface({
  showGpsSurface,
  showGpsErrorUi,
  gpsDenied,
  gpsError,
  mapPoints,
  referencePoints,
  recording,
  previewPoint,
  mapControlsBottomPx,
  loadingSession,
  isSetup,
  setupDisciplineId,
  lastDisciplineId,
  onSelectDiscipline,
  onOpenManual,
}: Props) {
  if (!showGpsSurface) {
    return (
      <div className="flex min-h-[28vh] flex-1 flex-col items-center justify-center gap-2 border-b border-border bg-muted/20 p-6">
        {loadingSession ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Modo interior: cronómetro y finalizar. Puedes editar detalles al terminar.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 w-full bg-muted/30">
      {showGpsErrorUi ? (
        <div className="flex h-full min-h-50 flex-col items-center justify-center gap-3 p-6 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {gpsDenied
              ? "Permiso de ubicación denegado. Puedes seguir con el cronómetro o abrir el formulario manual."
              : gpsError || "No se pudo obtener el GPS."}
          </p>
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onOpenManual}>
            Formulario manual
          </Button>
        </div>
      ) : (
        <Suspense fallback={<div className="h-full min-h-dvh w-full bg-[#23292b]" />}>
          <LiveCardioMap
            points={mapPoints}
            referencePoints={referencePoints}
            followUser
            recording={recording}
            previewPoint={previewPoint}
            controlsBottomPx={mapControlsBottomPx}
            className="h-full min-h-dvh w-full"
          />
        </Suspense>
      )}
      {isSetup ? (
        <CardioDisciplineIsland
          selectedId={setupDisciplineId}
          preferredId={lastDisciplineId}
          onSelect={onSelectDiscipline}
        />
      ) : null}
      {loadingSession ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-card/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}
    </div>
  );
}

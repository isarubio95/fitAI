import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_CARD } from "@/lib/pageStyles";
import { useMuscleFatigue } from "@/hooks/useMuscleFatigue";
import { useTrainingLoad, type TrainingLoadData } from "@/hooks/useTrainingLoad";
import { pickMuscleRecoveryBottleneck } from "@/lib/trainingLoad";
import { FormHero } from "@/components/dashboard/training-load/FormHero";
import { RecoveryHero } from "@/components/dashboard/training-load/RecoveryHero";
import { GaugeCard } from "@/components/dashboard/training-load/GaugeCard";
import { FormDetailDrawer } from "@/components/dashboard/training-load/FormDetailDrawer";
import { FatigueDetailDrawer } from "@/components/dashboard/training-load/FatigueDetailDrawer";

const TRAINING_LOAD_DATA_STORAGE_KEY = "gym-log.training-load.data.v4";
const EMPTY_MUSCLE_MAP: Record<string, number> = {};

function isTrainingLoadData(value: unknown): value is TrainingLoadData {
  if (!value || typeof value !== "object") return false;
  const v = value as TrainingLoadData;
  return Array.isArray(v.points) && !!v.totals && typeof v.totals.fitness === "number";
}

function loadCachedTrainingLoadData(): TrainingLoadData | null {
  try {
    const raw = localStorage.getItem(TRAINING_LOAD_DATA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isTrainingLoadData(parsed) || !parsed.points.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedTrainingLoadData(payload: TrainingLoadData): void {
  try {
    localStorage.setItem(TRAINING_LOAD_DATA_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function GaugeSkeleton() {
  return (
    <Card className={PAGE_CARD}>
      <div className="space-y-2 px-3 pb-4 pt-5">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto aspect-square w-full max-w-[200px] rounded-full" />
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </Card>
  );
}

type DetailKey = "form" | "recovery";

/**
 * Dos cards independientes en la misma fila: forma general y fatiga muscular.
 * Cada una muestra solo su anillo y su leyenda; el histórico y el desglose
 * viven en los detalles a pantalla completa que se abren al tocarlas.
 *
 * `interactive={false}` (modo ordenar del dashboard) deja las cards inertes
 * también por teclado: `pointer-events-none` solo tapa el puntero.
 */
export function TrainingLoadWidget({ interactive = true }: { interactive?: boolean }) {
  const { data, isLoading, isFetching } = useTrainingLoad();
  const { data: fatigueData, isLoading: fatigueLoading } = useMuscleFatigue("week");
  const [cachedData, setCachedData] = useState<TrainingLoadData | null>(loadCachedTrainingLoadData);
  const [detail, setDetail] = useState<DetailKey | null>(null);
  /*
   * Los detalles no se montan hasta que se abren por primera vez: el de fatiga
   * dispara `useMuscleVolume` (una query que el dashboard no necesita) y el de
   * forma arrastra recharts. Una vez montados se quedan, para que la animación
   * de cierre siga jugando.
   */
  const [mounted, setMounted] = useState<Record<DetailKey, boolean>>({
    form: false,
    recovery: false,
  });

  const openDetail = useCallback((key: DetailKey) => {
    setMounted((current) => (current[key] ? current : { ...current, [key]: true }));
    setDetail(key);
  }, []);

  useEffect(() => {
    if (data?.points?.length) {
      setCachedData(data);
      saveCachedTrainingLoadData(data);
    }
  }, [data]);

  const resolvedData = data?.points?.length ? data : cachedData;
  /*
   * El skeleton "dinámico" solo tiene sentido cuando lo que se muestra viene
   * del cache de localStorage y aún no hay respuesta del servidor: ahí puede
   * estar desactualizado. Si ya hay datos de la query (`data`), se mantienen en
   * pantalla durante los refetch de fondo. Antes bastaba `isFetching` para
   * taparlo todo con skeletons, y como las queries no definen `staleTime`,
   * cada vez que el panel se remontaba (cambio de pestaña en Tú) la tarjeta
   * parpadeaba a skeleton y volvía.
   */
  const showDynamicSkeleton = isFetching && !data && !!resolvedData;
  const totals = resolvedData?.totals ?? { fitness: 0, fatigue: 0, form: 0 };
  const recovery = pickMuscleRecoveryBottleneck(
    fatigueData?.daysToBaseline ?? EMPTY_MUSCLE_MAP,
    fatigueData?.groupFatigue ?? EMPTY_MUSCLE_MAP,
  );
  const showRecoverySkeleton = (fatigueLoading && !fatigueData) || showDynamicSkeleton;

  if (isLoading && !resolvedData) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <GaugeSkeleton />
        <GaugeSkeleton />
      </div>
    );
  }

  if (!resolvedData?.points?.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {showDynamicSkeleton ? (
          <GaugeSkeleton />
        ) : (
          <GaugeCard
            onOpen={() => openDetail("form")}
            ariaLabel="Ver el detalle de tu forma"
            interactive={interactive}
          >
            <FormHero form={totals.form} />
          </GaugeCard>
        )}
        {showRecoverySkeleton ? (
          <GaugeSkeleton />
        ) : (
          <GaugeCard
            onOpen={() => openDetail("recovery")}
            ariaLabel="Ver el detalle de tu fatiga muscular"
            interactive={interactive}
          >
            <RecoveryHero snapshot={recovery} />
          </GaugeCard>
        )}
      </div>

      {mounted.form && (
        <FormDetailDrawer
          open={detail === "form"}
          onOpenChange={(open) => !open && setDetail(null)}
          data={resolvedData}
        />
      )}
      {mounted.recovery && (
        <FatigueDetailDrawer
          open={detail === "recovery"}
          onOpenChange={(open) => !open && setDetail(null)}
          snapshot={recovery}
        />
      )}
    </>
  );
}

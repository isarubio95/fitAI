import type { MuscleRecoverySnapshot } from "@/lib/trainingLoad";
import { RecoveryGauge } from "./RecoveryGauge";
import { getRecoveryAdvice } from "./recoveryZones";

/**
 * Titular de recuperación: días a baseline del grupo más cargado, zona y consejo.
 */
export function RecoveryHero({ snapshot }: { snapshot: MuscleRecoverySnapshot }) {
  const advice = getRecoveryAdvice(snapshot.days, snapshot.group);

  return (
    <div className="text-center">
      <p className="text-[15px] text-muted-foreground">Tu recuperación</p>
      <RecoveryGauge days={snapshot.days} group={snapshot.group} className="mt-1" />
      <p className="mt-1 min-h-11 text-[15px] text-muted-foreground">{advice}</p>
    </div>
  );
}

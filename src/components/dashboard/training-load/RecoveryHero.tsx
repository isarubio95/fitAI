import type { MuscleRecoverySnapshot } from "@/lib/trainingLoad";
import { RecoveryGauge } from "./RecoveryGauge";
import { getRecoveryAdvice } from "./recoveryZones";

/**
 * Titular de recuperación: días a baseline del grupo más cargado, zona y consejo.
 */
export function RecoveryHero({
  snapshot,
  showTitle = true,
}: {
  snapshot: MuscleRecoverySnapshot;
  showTitle?: boolean;
}) {
  const advice = getRecoveryAdvice(snapshot.days, snapshot.group);

  return (
    <div className="text-center">
      {showTitle ? <p className="text-[15px] text-muted-foreground">Tu recuperación</p> : null}
      <RecoveryGauge days={snapshot.days} group={snapshot.group} className="mt-1" />
      <p className="mt-2 text-[15px] text-muted-foreground">{advice}</p>
    </div>
  );
}

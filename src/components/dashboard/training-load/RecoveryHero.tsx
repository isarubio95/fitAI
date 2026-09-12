import type { MuscleRecoverySnapshot } from "@/lib/trainingLoad";
import { RecoveryGauge } from "./RecoveryGauge";
import { getRecoveryAdvice } from "./recoveryZones";

/**
 * Titular de recuperación: días a baseline del grupo más cargado, zona y consejo.
 */
export function RecoveryHero({
  snapshot,
  showTitle = true,
  showAdvice = true,
}: {
  snapshot: MuscleRecoverySnapshot;
  showTitle?: boolean;
  showAdvice?: boolean;
}) {
  const advice = getRecoveryAdvice(snapshot.days, snapshot.group);

  return (
    <div className="text-center">
      {showTitle ? <p className="text-[15px] text-muted-foreground">Tu recuperación</p> : null}
      <RecoveryGauge days={snapshot.days} group={snapshot.group} className={showTitle ? "mt-1" : undefined} />
      {showAdvice ? <p className="mt-2 text-[15px] text-muted-foreground">{advice}</p> : null}
    </div>
  );
}

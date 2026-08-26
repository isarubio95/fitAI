import { formatRecoveryDays, getRecoveryAdvice, getRecoveryZone, RECOVERY_ZONES } from "./recoveryZones";
import { ZoneGauge } from "./ZoneGauge";

export function RecoveryGauge({
  days,
  group,
  className,
}: {
  days: number;
  group: string | null;
  className?: string;
}) {
  const zone = getRecoveryZone(days);
  const valueLabel = formatRecoveryDays(days);
  const groupHint = group ? `, ${group}` : "";

  return (
    <ZoneGauge
      className={className}
      value={days}
      zones={RECOVERY_ZONES}
      valueLabel={valueLabel}
      zoneLabel={zone.label}
      zoneColor={zone.color}
      ariaLabel={`Recuperación: ${valueLabel}, ${zone.label}${groupHint}`}
    />
  );
}

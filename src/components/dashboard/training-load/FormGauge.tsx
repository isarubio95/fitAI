import { formatSigned } from "./format";
import { FORM_ZONES, getFormZone } from "./formZones";
import { ZoneGauge } from "./ZoneGauge";

export function FormGauge({ form, className }: { form: number; className?: string }) {
  const zone = getFormZone(form);

  return (
    <ZoneGauge
      className={className}
      value={form}
      zones={FORM_ZONES}
      valueLabel={formatSigned(form)}
      zoneLabel={zone.label}
      zoneColor={zone.color}
      ariaLabel={`Forma: ${formatSigned(form)}, ${zone.label}`}
    />
  );
}

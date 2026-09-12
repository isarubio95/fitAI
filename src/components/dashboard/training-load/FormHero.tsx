import { FormGauge } from "./FormGauge";
import { getFormZone } from "./formZones";

/**
 * Titular de forma: anillo, zona y, en el detalle, el consejo del día.
 */
export function FormHero({
  form,
  showTitle = true,
  showAdvice = true,
}: {
  form: number;
  showTitle?: boolean;
  showAdvice?: boolean;
}) {
  const zone = getFormZone(form);

  return (
    <div className="text-center">
      {showTitle ? <p className="text-[15px] text-muted-foreground">Tu forma hoy</p> : null}
      <FormGauge form={form} className={showTitle ? "mt-1" : undefined} />
      {showAdvice ? <p className="mt-2 text-[15px] text-muted-foreground">{zone.advice}</p> : null}
    </div>
  );
}

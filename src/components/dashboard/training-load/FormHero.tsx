import { FormGauge } from "./FormGauge";
import { getFormZone } from "./formZones";

/**
 * Titular de la tarjeta: la forma de hoy dentro del anillo de zonas, con la
 * zona a la que pertenece y qué hacer con ella.
 */
export function FormHero({ form }: { form: number }) {
  const zone = getFormZone(form);

  return (
    <div className="text-center">
      <p className="text-[15px] text-muted-foreground">Tu forma hoy</p>
      <FormGauge form={form} className="mt-1" />
      <p className="mt-2 text-[15px] text-muted-foreground">{zone.advice}</p>
    </div>
  );
}

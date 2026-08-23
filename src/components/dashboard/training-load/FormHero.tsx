import { formatSigned } from "./format";
import { getFormZone } from "./formZones";

/**
 * Píldora de zona: el color mezclado con el fondo (no con la tarjeta) para que
 * quede un chip verde bosque, no un tinte lavado.
 */
const BADGE_BG_MIX = 28;

/**
 * Titular de la tarjeta: la forma de hoy como un solo número grande, con la
 * zona a la que pertenece y qué hacer con ella.
 */
export function FormHero({ form }: { form: number }) {
  const zone = getFormZone(form);

  return (
    <div>
      <p className="text-[15px] text-muted-foreground">Tu forma hoy</p>
      <div className="mt-1 flex items-center gap-4">
        <span className="text-[56px] font-light leading-none tracking-tight tabular-nums text-foreground">
          {formatSigned(form)}
        </span>
        <span
          className="inline-flex items-center rounded-full px-3.5 py-1 text-[13px] font-medium"
          style={{
            color: zone.color,
            backgroundColor: `color-mix(in srgb, ${zone.color} ${BADGE_BG_MIX}%, hsl(var(--background)))`,
          }}
        >
          {zone.label}
        </span>
      </div>
      <p className="mt-2 text-[15px] text-muted-foreground">{zone.advice}</p>
    </div>
  );
}

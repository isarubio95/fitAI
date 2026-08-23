import { cn } from "@/lib/utils";
import { formatSigned } from "./format";
import { FORM_ZONES, getFormZone } from "./formZones";

/**
 * Escala de zonas: cinco tramos apagados y solo el actual encendido, para
 * situar de un vistazo la forma de hoy sin marcadores ni cifras repetidas.
 */
export function FormScale({ form }: { form: number }) {
  const zone = getFormZone(form);

  return (
    <div>
      <div
        className="flex gap-1.5"
        role="meter"
        aria-valuenow={Math.round(form)}
        aria-valuemin={FORM_ZONES[0].min}
        aria-valuemax={FORM_ZONES[FORM_ZONES.length - 1].max}
        aria-label={`Forma: ${formatSigned(form)}, ${zone.label}`}
      >
        {FORM_ZONES.map((z) => {
          const isActive = z.key === zone.key;
          return (
            <span
              key={z.key}
              className={cn("h-1.5 min-w-0 flex-1 rounded-full", !isActive && "bg-muted")}
              style={isActive ? { backgroundColor: z.color } : undefined}
            />
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5 text-[13px] leading-tight" aria-hidden>
        {FORM_ZONES.map((z) => {
          const isActive = z.key === zone.key;
          return (
            <span
              key={z.key}
              className={cn(
                "min-w-0 flex-1 text-center",
                isActive ? "font-medium" : "text-muted-foreground",
              )}
              style={isActive ? { color: z.color } : undefined}
            >
              {z.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

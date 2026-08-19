import { BatteryLow, Flame, Moon, Sparkles, Target, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSigned } from "./format";
import {
  FORM_ZONES,
  formToScalePct,
  getFormZone,
  type FormZoneKey,
} from "./formZones";

const ZONE_ICONS: Record<FormZoneKey, LucideIcon> = {
  "muy-fatigado": BatteryLow,
  fatigado: Flame,
  optimo: Target,
  fresco: Sparkles,
  bajo: Moon,
};

/** Escala de zonas con el marcador de la forma actual. */
export function FormScale({ form }: { form: number }) {
  const zone = getFormZone(form);
  const ZoneIcon = ZONE_ICONS[zone.key];
  const markerPct = formToScalePct(form);

  return (
    <div className="rounded-2xl bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-foreground">Tu forma hoy</p>
        <p
          className="flex items-center gap-1.5 text-[14px] font-semibold"
          style={{ color: zone.color }}
        >
          <ZoneIcon className="h-4 w-4" aria-hidden />
          {zone.label}
        </p>
      </div>

      <div
        className="mt-3 flex h-2.5 gap-1 overflow-hidden rounded-full"
        role="meter"
        aria-valuenow={Math.round(form)}
        aria-valuemin={FORM_ZONES[0].min}
        aria-valuemax={FORM_ZONES[FORM_ZONES.length - 1].max}
        aria-label={`Forma: ${formatSigned(form)}, ${zone.label}`}
      >
        {FORM_ZONES.map((z) => (
          <span
            key={z.key}
            className="h-full min-w-0 flex-1"
            style={{ backgroundColor: z.color }}
          />
        ))}
      </div>

      <div className="relative h-7" aria-hidden>
        <span
          className="absolute top-1 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${markerPct}%` }}
        >
          <span className="h-0 w-0 border-x-[5px] border-b-[6px] border-x-transparent border-b-foreground" />
          <span className="text-[12px] font-semibold tabular-nums text-foreground">
            {formatSigned(form)}
          </span>
        </span>
      </div>

      <div className="mt-2 flex gap-1 text-[12px] leading-tight" aria-hidden>
        {FORM_ZONES.map((z) => {
          const isActive = z.key === zone.key;
          return (
            <span
              key={z.key}
              className={cn(
                "min-w-0 flex-1 text-center",
                isActive ? "font-semibold" : "text-muted-foreground/70",
              )}
              style={{ color: isActive ? z.color : undefined }}
            >
              {z.label}
            </span>
          );
        })}
      </div>

    </div>
  );
}

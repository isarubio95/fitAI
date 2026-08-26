import { cn } from "@/lib/utils";

const SIZE = 195;
const CENTER = SIZE / 2;
const RADIUS = 76;
const STROKE = 9;
/** Apertura inferior del anillo, en grados: el corte donde acaba la escala. */
const GAP_DEG = 84;
const SWEEP_DEG = 360 - GAP_DEG;
const START_DEG = -SWEEP_DEG / 2;
/** Hueco visible entre tramos, en px de arco. */
const SEGMENT_GAP = 4;

function degOf(px: number) {
  return (px / RADIUS) * (180 / Math.PI);
}

/**
 * Recorte a cada lado del tramo. Las tapas redondeadas sobresalen media línea,
 * así que se descuentan: los tramos quedan del mismo largo visible y todos los
 * huecos —también los de los extremos— miden lo mismo.
 */
const SEGMENT_PAD_DEG = degOf(STROKE / 2 + SEGMENT_GAP / 2);

function pointAt(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.sin(rad),
    y: CENTER - RADIUS * Math.cos(rad),
  };
}

function arcPath(fromDeg: number, toDeg: number) {
  const from = pointAt(fromDeg);
  const to = pointAt(toDeg);
  const largeArc = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${to.x} ${to.y}`;
}

/**
 * El anillo no cierra por abajo: recortamos el cuadrado hasta la punta del
 * arco para que el texto de debajo no quede separado por un hueco vacío.
 */
const VIEW_HEIGHT = Math.ceil(pointAt(START_DEG).y + STROKE / 2 + 2);
export const ZONE_GAUGE_ASPECT_RATIO = `${SIZE} / ${VIEW_HEIGHT}`;

export type ZoneGaugeZone = {
  key: string;
  label: string;
  color: string;
  min: number;
  max: number;
};

export function ZoneGauge({
  value,
  zones,
  valueLabel,
  zoneLabel,
  zoneColor,
  ariaLabel,
  className,
}: {
  value: number;
  zones: readonly ZoneGaugeZone[];
  valueLabel: string;
  zoneLabel: string;
  zoneColor: string;
  ariaLabel: string;
  className?: string;
}) {
  const first = zones[0];
  const last = zones[zones.length - 1];
  if (!first || !last) return null;

  const segmentDeg = SWEEP_DEG / zones.length;
  const activeKey =
    zones.find((zone) => value < zone.max)?.key ?? last.key;

  return (
    <div
      className={cn("relative mx-auto w-full max-w-[200px]", className)}
      style={{ aspectRatio: ZONE_GAUGE_ASPECT_RATIO }}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${VIEW_HEIGHT}`}
        className="absolute inset-0 h-full w-full"
        role="meter"
        aria-valuenow={Math.round(value)}
        aria-valuemin={first.min}
        aria-valuemax={last.max}
        aria-label={ariaLabel}
      >
        {zones.map((zone, index) => {
          const from = START_DEG + index * segmentDeg + SEGMENT_PAD_DEG;
          const to = START_DEG + (index + 1) * segmentDeg - SEGMENT_PAD_DEG;
          return (
            <path
              key={zone.key}
              d={arcPath(from, to)}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              stroke={zone.key === activeKey ? zone.color : "hsl(var(--muted))"}
            />
          );
        })}
      </svg>

      <div
        className="absolute left-0 flex w-full flex-col items-center"
        style={{ top: `${(CENTER / VIEW_HEIGHT) * 100}%`, transform: "translateY(-50%)" }}
      >
        <span className="text-[52px] font-light leading-none tracking-tight tabular-nums text-foreground">
          {valueLabel}
        </span>
        <span className="mt-2 text-[13px] font-medium" style={{ color: zoneColor }}>
          {zoneLabel}
        </span>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

const SIZE = 195;
const CENTER = SIZE / 2;
const RADIUS = 76;
const STROKE = 9;
const ACTIVE_STROKE = 12;
const HALO_STROKE = 18;
const DOT_R = 5.5;
const DOT_HALO_R = 9;
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
const VIEW_PAD = Math.max(ACTIVE_STROKE / 2, DOT_HALO_R) + 12;
const VIEW_HEIGHT = Math.ceil(pointAt(START_DEG).y + VIEW_PAD);
export const ZONE_GAUGE_ASPECT_RATIO = `${SIZE} / ${VIEW_HEIGHT}`;

export type ZoneGaugeZone = {
  key: string;
  label: string;
  color: string;
  min: number;
  max: number;
};

/** Posición en el herradura: cada zona ocupa el mismo arco; el valor interpola dentro. */
function valueToDeg(value: number, zones: readonly ZoneGaugeZone[]) {
  const first = zones[0];
  const last = zones[zones.length - 1];
  if (!first || !last) return START_DEG;
  const clamped = Math.min(last.max, Math.max(first.min, value));
  const indexRaw = zones.findIndex((zone) => clamped < zone.max);
  const index = indexRaw < 0 ? zones.length - 1 : indexRaw;
  const zone = zones[index] ?? last;
  const span = zone.max - zone.min;
  const t = span <= 0 ? 1 : Math.min(1, Math.max(0, (clamped - zone.min) / span));
  return START_DEG + (index + t) * (SWEEP_DEG / zones.length);
}

function ZoneChip({ label, color }: { label: string; color?: string }) {
  if (!color) {
    return (
      <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[11px] font-medium leading-none text-foreground">
        {label}
      </span>
    );
  }

  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-medium leading-none"
      style={{
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
        color: `color-mix(in srgb, ${color} 72%, hsl(var(--card-foreground)))`,
      }}
    >
      {label}
    </span>
  );
}

export function ZoneGauge({
  value,
  zones,
  valueLabel,
  zoneLabel,
  zoneColor,
  metaLabel,
  ariaLabel,
  className,
}: {
  value: number;
  zones: readonly ZoneGaugeZone[];
  valueLabel: string;
  zoneLabel: string;
  zoneColor: string;
  /** Segunda etiqueta (p. ej. el grupo muscular más cargado). */
  metaLabel?: string | null;
  ariaLabel: string;
  className?: string;
}) {
  const first = zones[0];
  const last = zones[zones.length - 1];
  if (!first || !last) return null;

  const segmentDeg = SWEEP_DEG / zones.length;
  const activeIndexRaw = zones.findIndex((zone) => value < zone.max);
  const activeIndex = activeIndexRaw < 0 ? zones.length - 1 : activeIndexRaw;
  const activeZone = zones[activeIndex] ?? last;
  const needle = pointAt(valueToDeg(value, zones));
  const activeFrom = START_DEG + activeIndex * segmentDeg + SEGMENT_PAD_DEG;
  const activeTo = START_DEG + (activeIndex + 1) * segmentDeg - SEGMENT_PAD_DEG;

  return (
    <div className={cn("mx-auto w-full max-w-[200px]", className)}>
      <div className="relative" style={{ aspectRatio: ZONE_GAUGE_ASPECT_RATIO }}>
        <svg
          viewBox={`0 0 ${SIZE} ${VIEW_HEIGHT}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          role="meter"
          aria-valuenow={Math.round(value)}
          aria-valuemin={first.min}
          aria-valuemax={last.max}
          aria-label={ariaLabel}
        >
          {zones.map((zone, index) => {
            const from = START_DEG + index * segmentDeg + SEGMENT_PAD_DEG;
            const to = START_DEG + (index + 1) * segmentDeg - SEGMENT_PAD_DEG;
            const active = index === activeIndex;
            return (
              <path
                key={zone.key}
                d={arcPath(from, to)}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap="round"
                stroke={zone.color}
                opacity={active ? 0 : 0.38}
              />
            );
          })}
          <path
            d={arcPath(activeFrom, activeTo)}
            fill="none"
            stroke={activeZone.color}
            strokeWidth={HALO_STROKE}
            strokeLinecap="round"
            opacity={0.16}
          />
          <path
            d={arcPath(activeFrom, activeTo)}
            fill="none"
            stroke={activeZone.color}
            strokeWidth={ACTIVE_STROKE}
            strokeLinecap="round"
          />
          <circle cx={needle.x} cy={needle.y} r={DOT_HALO_R} fill={activeZone.color} opacity={0.2} />
          <circle
            cx={needle.x}
            cy={needle.y}
            r={DOT_R}
            fill={activeZone.color}
            stroke="hsl(var(--card))"
            strokeWidth={2.5}
          />
        </svg>

        <div
          className="absolute left-0 flex w-full items-center justify-center"
          style={{ top: `${(CENTER / VIEW_HEIGHT) * 100}%`, transform: "translateY(-50%)" }}
        >
          <span
            className="text-[42px] font-semibold leading-none tracking-tight tabular-nums"
            style={{
              color: `color-mix(in srgb, ${zoneColor} 62%, hsl(var(--card-foreground)))`,
            }}
          >
            {valueLabel}
          </span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
        <ZoneChip label={zoneLabel} color={zoneColor} />
        {metaLabel ? <ZoneChip label={metaLabel} /> : null}
      </div>
    </div>
  );
}

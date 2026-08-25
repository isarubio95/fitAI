import { cn } from "@/lib/utils";
import { formatSigned } from "./format";
import { FORM_ZONES, getFormZone } from "./formZones";

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 76;
const STROKE = 8;
/** Apertura inferior del anillo, en grados: el corte donde acaba la escala. */
const GAP_DEG = 84;
const SWEEP_DEG = 360 - GAP_DEG;
const START_DEG = -SWEEP_DEG / 2;
const SEGMENT_DEG = SWEEP_DEG / FORM_ZONES.length;
/** Hueco entre tramos, en px de arco: el mismo aire que daba el gap de las barras. */
const SEGMENT_GAP = 4;

/** Grados que ocupa una longitud de arco a este radio. */
function degOf(px: number) {
  return (px / RADIUS) * (180 / Math.PI);
}

/**
 * Los cortes entre tramos son radiales y rectos, así el hueco mide lo mismo
 * en cualquier punto del anillo: media separación por lado.
 */
const GAP_PAD_DEG = degOf(SEGMENT_GAP / 2);
/**
 * Las dos puntas exteriores sí van redondeadas (un círculo sobre el final del
 * trazo), por eso se recortan media línea más: los cinco tramos acaban
 * midiendo lo mismo.
 */
const END_PAD_DEG = degOf(SEGMENT_GAP / 2 + STROKE / 2);
/** Cuánto bajan las etiquetas de los extremos respecto a la punta del arco. */
const END_LABEL_OFFSET = 15;

/** Punto del anillo para un ángulo: 0 arriba, positivo en sentido horario. */
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

function pct(value: number) {
  return `${(value / SIZE) * 100}%`;
}

/** Etiqueta de un extremo del arco, justo por fuera del corte inferior. */
function EndLabel({ deg, children }: { deg: number; children: string }) {
  const point = pointAt(deg);
  return (
    <span
      className="absolute -translate-x-1/2 whitespace-nowrap text-[12px] text-muted-foreground"
      style={{ left: pct(point.x), top: pct(point.y + END_LABEL_OFFSET) }}
    >
      {children}
    </span>
  );
}

/**
 * Escala de zonas en anillo: los cinco tramos apagados y solo el actual
 * encendido —la misma lectura que las barras—, con Óptimo arriba al centro,
 * los estados frescos a la derecha y los fatigados a la izquierda. El corte
 * de abajo cierra la escala y ahí se leen sus dos extremos; la forma de hoy
 * va en el centro.
 */
export function FormGauge({ form, className }: { form: number; className?: string }) {
  const zone = getFormZone(form);
  const lastIndex = FORM_ZONES.length - 1;

  const segments = FORM_ZONES.map((z, index) => {
    const isFirst = index === 0;
    const isLast = index === lastIndex;
    const from = START_DEG + index * SEGMENT_DEG + (isFirst ? END_PAD_DEG : GAP_PAD_DEG);
    const to = START_DEG + (index + 1) * SEGMENT_DEG - (isLast ? END_PAD_DEG : GAP_PAD_DEG);
    return {
      zone: z,
      from,
      to,
      color: z.key === zone.key ? z.color : "hsl(var(--muted))",
      /** Extremo del anillo, el único que lleva punta redonda. */
      roundedAt: isFirst ? from : isLast ? to : null,
    };
  });

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[200px]", className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 h-full w-full"
        role="meter"
        aria-valuenow={Math.round(form)}
        aria-valuemin={FORM_ZONES[0].min}
        aria-valuemax={FORM_ZONES[lastIndex].max}
        aria-label={`Forma: ${formatSigned(form)}, ${zone.label}`}
      >
        {segments.map((segment) => {
          const tip = segment.roundedAt === null ? null : pointAt(segment.roundedAt);
          return (
            <g key={segment.zone.key}>
              <path
                d={arcPath(segment.from, segment.to)}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap="butt"
                stroke={segment.color}
              />
              {tip && <circle cx={tip.x} cy={tip.y} r={STROKE / 2} fill={segment.color} />}
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[52px] font-light leading-none tracking-tight tabular-nums text-foreground">
          {formatSigned(form)}
        </span>
        <span className="mt-2 text-[13px] font-medium" style={{ color: zone.color }}>
          {zone.label}
        </span>
      </div>

      <EndLabel deg={START_DEG + END_PAD_DEG}>{FORM_ZONES[0].label}</EndLabel>
      <EndLabel deg={START_DEG + SWEEP_DEG - END_PAD_DEG}>{FORM_ZONES[lastIndex].label}</EndLabel>
    </div>
  );
}

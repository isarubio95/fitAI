import { cn } from "@/lib/utils";
import { formatSigned } from "./format";
import { FORM_ZONES, getFormZone } from "./formZones";

const SIZE = 195;
const CENTER = SIZE / 2;
const RADIUS = 76;
const STROKE = 9;
/** Apertura inferior del anillo, en grados: el corte donde acaba la escala. */
const GAP_DEG = 84;
const SWEEP_DEG = 360 - GAP_DEG;
const START_DEG = -SWEEP_DEG / 2;
const SEGMENT_DEG = SWEEP_DEG / FORM_ZONES.length;
/** Hueco visible entre tramos, en px de arco: el mismo aire que daba el gap de las barras. */
const SEGMENT_GAP = 4;

/** Grados que ocupa una longitud de arco a este radio. */
function degOf(px: number) {
  return (px / RADIUS) * (180 / Math.PI);
}

/**
 * Recorte a cada lado del tramo. Las tapas redondeadas sobresalen media línea,
 * así que se descuentan: los cinco tramos quedan del mismo largo visible y
 * todos los huecos —también los de los extremos— miden lo mismo.
 */
const SEGMENT_PAD_DEG = degOf(STROKE / 2 + SEGMENT_GAP / 2);
/** Punta visible del anillo, ya sin la tapa redondeada. */
const TIP_DEG = degOf(SEGMENT_GAP / 2);
/** Cuánto bajan las etiquetas de los extremos respecto a la punta del arco. */
const END_LABEL_OFFSET = 14;

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
  const first = FORM_ZONES[0];
  const last = FORM_ZONES[FORM_ZONES.length - 1];

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[200px]", className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 h-full w-full"
        role="meter"
        aria-valuenow={Math.round(form)}
        aria-valuemin={first.min}
        aria-valuemax={last.max}
        aria-label={`Forma: ${formatSigned(form)}, ${zone.label}`}
      >
        {FORM_ZONES.map((z, index) => {
          const isActive = z.key === zone.key;
          const from = START_DEG + index * SEGMENT_DEG + SEGMENT_PAD_DEG;
          const to = START_DEG + (index + 1) * SEGMENT_DEG - SEGMENT_PAD_DEG;
          return (
            <path
              key={z.key}
              d={arcPath(from, to)}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              stroke={isActive ? z.color : "hsl(var(--muted))"}
            />
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

      <EndLabel deg={START_DEG + TIP_DEG}>{first.label}</EndLabel>
      <EndLabel deg={START_DEG + SWEEP_DEG - TIP_DEG}>{last.label}</EndLabel>
    </div>
  );
}

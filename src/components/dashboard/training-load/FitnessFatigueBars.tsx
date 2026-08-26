import type { ReactNode } from "react";
import { chartColors } from "@/lib/chart-colors";
import { getFormZone } from "./formZones";
import { formatNumber, formatSigned } from "./format";

const LABEL_WIDTH = 74;
const VALUE_WIDTH = 40;
const COLUMN_GAP = 12;
/**
 * El tramo de forma usa el mismo color de la barra, atenuado sobre la pista
 * (como el área sombreada del gráfico), no mezclado con blanco.
 */
const SURPLUS_MIX_PCT = 36;

function clampPct(value: number) {
  return Math.max(0, Math.min(100, value));
}

function BarRow({
  label,
  color,
  value,
  children,
}: {
  label: string;
  color: string;
  value: number;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center" style={{ gap: COLUMN_GAP }}>
      <span
        className="flex shrink-0 items-center gap-1.5 text-[14px] text-muted-foreground"
        style={{ width: LABEL_WIDTH }}
      >
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">{children}</div>
      <span
        className="shrink-0 text-right text-[15px] font-semibold tabular-nums text-foreground"
        style={{ width: VALUE_WIDTH }}
      >
        {formatNumber(value)}
      </span>
    </div>
  );
}

function BarFill({
  widthPct,
  color,
  testId,
  onTop,
}: {
  widthPct: number;
  color: string;
  testId?: string;
  onTop?: boolean;
}) {
  return (
    <div
      className="absolute inset-y-0 left-0 rounded-full"
      data-testid={testId}
      style={{ width: `${widthPct}%`, backgroundColor: color, zIndex: onTop ? 1 : undefined }}
    />
  );
}

/**
 * Fitness y Fatiga en la misma escala: el sobrante de la barra más larga es,
 * literalmente, la forma. El tramo tenue va detrás, a toda la longitud; el
 * sólido se superpone con el mismo redondeo, así ambos extremos coinciden
 * y no hay hueco. El pie de la sección nombra ese sobrante para que se lea
 * sin tener que deducirlo.
 */
export function FitnessFatigueBars({
  fitness,
  fatigue,
  form,
}: {
  fitness: number;
  fatigue: number;
  /** Valor oficial de forma; por defecto, la diferencia entre ambas barras. */
  form?: number;
}) {
  const isFatigued = fitness < fatigue;
  // Un poco de aire al final de la pista para que la barra más larga no llegue al borde.
  const scale = Math.max(fitness, fatigue, 1) / 0.94;
  const fitnessPct = clampPct((fitness / scale) * 100);
  const fatiguePct = clampPct((fatigue / scale) * 100);
  const sharedPct = Math.min(fitnessPct, fatiguePct);
  const surplusPct = Math.abs(fitnessPct - fatiguePct);
  const surplusColor = isFatigued ? chartColors.fatigue : chartColors.fitness;
  const dimColor = `color-mix(in srgb, ${surplusColor} ${SURPLUS_MIX_PCT}%, hsl(var(--muted)))`;
  const fitnessHasSurplus = surplusPct > 0 && !isFatigued;
  const fatigueHasSurplus = surplusPct > 0 && isFatigued;
  const formValue = form ?? fitness - fatigue;
  const zone = getFormZone(formValue);

  return (
    <div>
      <div className="space-y-3">
        <BarRow label="Fitness" color={chartColors.fitness} value={fitness}>
          {fitnessHasSurplus && (
            <BarFill widthPct={fitnessPct} color={dimColor} testId="form-surplus" />
          )}
          <BarFill
            widthPct={fitnessHasSurplus ? sharedPct : fitnessPct}
            color={chartColors.fitness}
            onTop
          />
        </BarRow>

        <BarRow label="Fatiga" color={chartColors.fatigue} value={fatigue}>
          {fatigueHasSurplus && (
            <BarFill widthPct={fatiguePct} color={dimColor} testId="form-surplus" />
          )}
          <BarFill
            widthPct={fatigueHasSurplus ? sharedPct : fatiguePct}
            color={chartColors.fatigue}
            onTop
          />
        </BarRow>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
        <span className="flex min-w-0 items-center gap-1.5 text-[14px] text-muted-foreground">
          <span
            aria-hidden
            className="h-2.5 w-4 shrink-0 rounded-full"
            style={{ background: dimColor }}
          />
          <span className="truncate">Ese tramo es tu forma</span>
        </span>
        <span
          className="shrink-0 text-[15px] font-semibold tabular-nums"
          style={{ color: zone.color }}
        >
          {formatSigned(formValue)} · {zone.label}
        </span>
      </div>
    </div>
  );
}

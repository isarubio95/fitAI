import type { ReactNode } from "react";
import { chartColors } from "@/lib/chart-colors";
import { formatNumber } from "./format";

/**
 * Anchos fijos de las columnas laterales: el pie explicativo se alinea con la
 * pista de las barras usando estos valores.
 */
const LABEL_WIDTH = 66;
const VALUE_WIDTH = 40;
const COLUMN_GAP = 14;
const TRACK_LEFT = LABEL_WIDTH + COLUMN_GAP;
const TRACK_RIGHT = VALUE_WIDTH + COLUMN_GAP;
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
  value,
  children,
}: {
  label: string;
  value: number;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center" style={{ gap: COLUMN_GAP }}>
      <span className="shrink-0 text-[14px] text-muted-foreground" style={{ width: LABEL_WIDTH }}>
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
 * y no hay hueco.
 */
export function FitnessFatigueBars({
  fitness,
  fatigue,
}: {
  fitness: number;
  fatigue: number;
}) {
  const form = fitness - fatigue;
  const isFatigued = form < 0;
  // Un poco de aire al final de la pista para que la barra más larga no llegue al borde.
  const scale = Math.max(fitness, fatigue, 1) / 0.94;
  const fitnessPct = clampPct((fitness / scale) * 100);
  const fatiguePct = clampPct((fatigue / scale) * 100);
  const sharedPct = Math.min(fitnessPct, fatiguePct);
  const surplusPct = Math.abs(fitnessPct - fatiguePct);
  const surplusColor = isFatigued ? chartColors.fatigue : chartColors.fitness;
  const gapPoints = formatNumber(Math.abs(form));
  const gapCaption = isFatigued
    ? `${gapPoints} puntos de fatiga por encima del fitness`
    : `${gapPoints} puntos de fitness por encima de la fatiga`;

  const dimColor = `color-mix(in srgb, ${surplusColor} ${SURPLUS_MIX_PCT}%, hsl(var(--muted)))`;
  const fitnessHasSurplus = surplusPct > 0 && !isFatigued;
  const fatigueHasSurplus = surplusPct > 0 && isFatigued;

  return (
    <div className="rounded-xl bg-background p-4">
      <BarRow label="Fitness" value={fitness}>
        {fitnessHasSurplus && (
          <BarFill widthPct={fitnessPct} color={dimColor} testId="form-surplus" />
        )}
        <BarFill
          widthPct={fitnessHasSurplus ? sharedPct : fitnessPct}
          color={chartColors.fitness}
          onTop
        />
      </BarRow>

      <div className="mt-3">
        <BarRow label="Fatiga" value={fatigue}>
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

      {surplusPct > 0 && (
        <p
          className="mt-3 text-[13px] leading-snug text-muted-foreground"
          style={{ marginLeft: TRACK_LEFT, marginRight: TRACK_RIGHT }}
        >
          El tramo claro es tu forma: {gapCaption}
        </p>
      )}
    </div>
  );
}

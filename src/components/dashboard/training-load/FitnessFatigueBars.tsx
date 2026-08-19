import type { ReactNode } from "react";
import { chartColors } from "@/lib/chart-colors";
import { formatNumber, formatSigned } from "./format";

/**
 * Anchos fijos de las columnas laterales: los overlays (línea discontinua y
 * llave del sobrante) se alinean con la pista de las barras usando estos valores.
 */
const LABEL_WIDTH = 66;
const VALUE_WIDTH = 48;
const COLUMN_GAP = 14;
const TRACK_LEFT = LABEL_WIDTH + COLUMN_GAP;
const TRACK_RIGHT = VALUE_WIDTH + COLUMN_GAP;

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
      <span className="shrink-0 text-[13px] text-muted-foreground" style={{ width: LABEL_WIDTH }}>
        {label}
      </span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-muted">{children}</div>
      <span
        className="shrink-0 text-right text-[15px] font-semibold tabular-nums text-foreground"
        style={{ width: VALUE_WIDTH }}
      >
        {formatNumber(value)}
      </span>
    </div>
  );
}

/**
 * Fitness y Fatiga en la misma escala: el sobrante de la barra más larga es,
 * literalmente, la forma. En rojo si sobra fatiga, en verde si sobra fitness.
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
  const surplusColor = isFatigued ? chartColors.danger : chartColors.positive;
  const gapPoints = formatNumber(Math.abs(form));

  return (
    <div className="rounded-2xl bg-background p-4">
      <div className="relative">
        <BarRow label="Fitness" value={fitness}>
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${fitnessPct}%`, backgroundColor: chartColors.fitness }}
          />
          {!isFatigued && surplusPct > 0 && (
            <div
              className="absolute inset-y-0"
              style={{
                left: `${sharedPct}%`,
                width: `${surplusPct}%`,
                backgroundColor: surplusColor,
              }}
            />
          )}
        </BarRow>

        <div className="mt-3">
          <BarRow label="Fatiga" value={fatigue}>
            <div
              className="absolute inset-y-0 left-0"
              style={{ width: `${fatiguePct}%`, backgroundColor: chartColors.fatigue }}
            />
            {isFatigued && surplusPct > 0 && (
              <div
                className="absolute inset-y-0"
                style={{
                  left: `${sharedPct}%`,
                  width: `${surplusPct}%`,
                  backgroundColor: surplusColor,
                }}
              />
            )}
          </BarRow>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: TRACK_LEFT, right: TRACK_RIGHT }}
          aria-hidden
        >
          <span
            className="absolute inset-y-0 border-l border-dashed border-foreground/45"
            style={{ left: `${sharedPct}%` }}
          />
        </div>
      </div>

      {surplusPct > 0 && (
        <div
          className="relative mt-2 h-8"
          style={{ marginLeft: TRACK_LEFT, marginRight: TRACK_RIGHT }}
          aria-hidden
        >
          <span
            className="absolute top-0 block h-2 rounded-b-md border-x border-b"
            style={{
              left: `${sharedPct}%`,
              width: `${surplusPct}%`,
              borderColor: surplusColor,
            }}
          />
          <span
            className="absolute top-3 -translate-x-1/2 whitespace-nowrap text-[13px] font-semibold"
            style={{ left: `${sharedPct + surplusPct / 2}%`, color: surplusColor }}
          >
            {formatSigned(form)} de forma
          </span>
        </div>
      )}

    </div>
  );
}

/** Fitness − Fatiga = Forma, con los mismos colores que las barras y el gráfico. */
export function FormEquation({
  fitness,
  fatigue,
  form,
  formColor,
}: {
  fitness: number;
  fatigue: number;
  form: number;
  formColor: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 px-1 text-[14px] text-muted-foreground">
      <span className="whitespace-nowrap">
        <span
          className="text-[19px] font-bold tabular-nums"
          style={{ color: chartColors.fitness }}
        >
          {formatNumber(fitness)}
        </span>{" "}
        fitness
      </span>
      <span aria-hidden>−</span>
      <span className="whitespace-nowrap">
        <span
          className="text-[19px] font-bold tabular-nums"
          style={{ color: chartColors.fatigue }}
        >
          {formatNumber(fatigue)}
        </span>{" "}
        fatiga
      </span>
      <span aria-hidden>=</span>
      <span className="whitespace-nowrap">
        <span className="text-[19px] font-bold tabular-nums" style={{ color: formColor }}>
          {formatSigned(form)}
        </span>{" "}
        forma
      </span>
    </div>
  );
}

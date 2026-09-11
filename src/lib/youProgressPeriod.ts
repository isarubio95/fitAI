export const YOU_PROGRESS_PERIODS = [
  {
    key: "7d",
    label: "7 días",
    enPhrase: "estos 7 días",
    prevPhrase: "los 7 días anteriores",
    clockLabel: "estos 7 días",
  },
  {
    key: "4w",
    label: "4 sem.",
    enPhrase: "estas 4 semanas",
    prevPhrase: "las 4 anteriores",
    clockLabel: "estas 4 semanas",
  },
  {
    key: "3m",
    label: "3 meses",
    enPhrase: "estos 3 meses",
    prevPhrase: "los 3 meses anteriores",
    clockLabel: "estos 3 meses",
  },
  {
    key: "6m",
    label: "6 meses",
    enPhrase: "estos 6 meses",
    prevPhrase: "los 6 meses anteriores",
    clockLabel: "estos 6 meses",
  },
] as const;

export type YouProgressPeriod = (typeof YOU_PROGRESS_PERIODS)[number]["key"];

export const DEFAULT_YOU_PROGRESS_PERIOD: YouProgressPeriod = "4w";

const PERIOD_BY_KEY = Object.fromEntries(
  YOU_PROGRESS_PERIODS.map((period) => [period.key, period]),
) as Record<YouProgressPeriod, (typeof YOU_PROGRESS_PERIODS)[number]>;

export function isYouProgressPeriod(value: string): value is YouProgressPeriod {
  return value in PERIOD_BY_KEY;
}

export function parseYouProgressPeriod(raw: string | null | undefined): YouProgressPeriod {
  if (raw && isYouProgressPeriod(raw)) return raw;
  return DEFAULT_YOU_PROGRESS_PERIOD;
}

export function youProgressPeriodMeta(key: YouProgressPeriod) {
  return PERIOD_BY_KEY[key];
}

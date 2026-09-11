import { youProgressPeriodMeta, type YouProgressPeriod } from "@/lib/youProgressPeriod";

export type ProgressVerdictInput = {
  period: YouProgressPeriod;
  sessionsCurr: number;
  sessionsPrev: number;
  gymCurr: number;
  cardioCurr: number;
  volumeCurr: number;
  volumePrev: number;
};

export type ProgressVerdict = {
  headline: string;
  detail: string | null;
};

function sessionLabel(count: number) {
  return count === 1 ? "1 sesión" : `${count} sesiones`;
}

function gymLabel(count: number) {
  return `${count} gym`;
}

function cardioLabel(count: number) {
  return `${count} cardio`;
}

export function progressDetailLine(gym: number, cardio: number, sessions: number) {
  if (sessions <= 0) return null;
  return `${sessionLabel(sessions)} · ${gymLabel(gym)} · ${cardioLabel(cardio)}`;
}

export function volumeDeltaCopy(volumeCurr: number, volumePrev: number): string | null {
  if (volumePrev <= 0) return null;
  if (volumeCurr > volumePrev) return "más que el periodo anterior";
  if (volumeCurr < volumePrev) return "menos que el periodo anterior";
  return "igual que el periodo anterior";
}

export function buildProgressVerdict(input: ProgressVerdictInput): ProgressVerdict {
  const { enPhrase, prevPhrase } = youProgressPeriodMeta(input.period);
  const detail = progressDetailLine(input.gymCurr, input.cardioCurr, input.sessionsCurr);

  if (input.sessionsCurr <= 0) {
    return {
      headline: `Aún no hay sesiones en ${enPhrase}.`,
      detail: "Cuando entrenes, aquí verás si gym y ruta suben.",
    };
  }

  if (input.sessionsPrev <= 0) {
    return {
      headline: `En ${enPhrase}: ${sessionLabel(input.sessionsCurr)}.`,
      detail,
    };
  }

  if (input.sessionsCurr > input.sessionsPrev) {
    return {
      headline: `En ${enPhrase} entrenaste más que en ${prevPhrase}.`,
      detail,
    };
  }

  if (input.sessionsCurr < input.sessionsPrev) {
    return {
      headline: `En ${enPhrase} entrenaste menos que en ${prevPhrase}.`,
      detail,
    };
  }

  if (input.volumePrev > 0 && input.volumeCurr > input.volumePrev) {
    return {
      headline: `En ${enPhrase} el volumen de fuerza subió.`,
      detail,
    };
  }

  if (input.volumePrev > 0 && input.volumeCurr < input.volumePrev) {
    return {
      headline: `En ${enPhrase} el volumen de fuerza bajó.`,
      detail,
    };
  }

  return {
    headline: `En ${enPhrase} entrenaste igual que en ${prevPhrase}.`,
    detail,
  };
}

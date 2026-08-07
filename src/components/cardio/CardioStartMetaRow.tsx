import { useMemo } from "react";
import {
  extractCardioTrackPoints,
  type CardioSesionWithDetails,
} from "@/lib/cardioSessionDisplay";
import { resolveCardioSessionIcon } from "@/lib/cardioIcons";
import { formatActivityAbsoluteDate } from "@/lib/formatActivityRelativeDate";
import { useStartLocationLabel } from "@/hooks/useStartLocationLabel";
import { cn } from "@/lib/utils";

type Props = {
  session: CardioSesionWithDetails;
  className?: string;
  /**
   * Fecha absoluta de la sesión. Sin ciudad de salida, el icono va en la misma
   * fila que la fecha; con ciudad, la fecha queda arriba e icono + ciudad debajo.
   */
  dateTime?: string | null;
};

/**
 * Icono de disciplina sutil + ubicación del punto de partida («Ciudad, Región»).
 */
export function CardioStartMetaRow({ session, className, dateTime }: Props) {
  const Icon = resolveCardioSessionIcon(session);
  const start = useMemo(() => {
    const points = extractCardioTrackPoints(session);
    return points[0] ?? null;
  }, [session]);

  const { data: locationLabel } = useStartLocationLabel(
    start?.lat ?? null,
    start?.lng ?? null,
  );

  const disciplina = (() => {
    const d = session.cardio_disciplina;
    const row = Array.isArray(d) ? d[0] : d;
    return row?.nombre ?? "Cardio";
  })();

  const hasDate = !!dateTime;
  const hasLocation = !!locationLabel;

  const icon = (
    <Icon
      className="h-3 w-3 shrink-0 text-muted-foreground"
      aria-hidden
      strokeWidth={1.75}
    />
  );

  // Sin ciudad: icono alineado con la fecha en una sola fila.
  if (hasDate && !hasLocation) {
    return (
      <p
        className={cn(
          "flex min-w-0 items-center gap-1.5 text-xs leading-none text-muted-foreground",
          className,
        )}
      >
        {icon}
        <span className="sr-only">{disciplina}</span>
        <time dateTime={dateTime} className="min-w-0 truncate leading-none">
          {formatActivityAbsoluteDate(dateTime)}
        </time>
      </p>
    );
  }

  // Con ciudad (y opcionalmente fecha arriba): icono + ubicación.
  return (
    <div className={cn(hasDate ? "space-y-1.5" : undefined, className)}>
      {hasDate ? (
        <time
          dateTime={dateTime}
          className="block text-xs leading-none text-muted-foreground"
        >
          {formatActivityAbsoluteDate(dateTime)}
        </time>
      ) : null}
      <p className="flex min-w-0 items-center gap-1.5 text-xs leading-none text-muted-foreground">
        {icon}
        <span className="sr-only">{disciplina}</span>
        {hasLocation ? (
          <span className="truncate leading-none">{locationLabel}</span>
        ) : null}
      </p>
    </div>
  );
}

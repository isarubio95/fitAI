import { useMemo } from "react";
import {
  extractCardioTrackPoints,
  type CardioSesionWithDetails,
} from "@/lib/cardioSessionDisplay";
import { resolveCardioSessionIcon } from "@/lib/cardioIcons";
import { useStartLocationLabel } from "@/hooks/useStartLocationLabel";
import { cn } from "@/lib/utils";

type Props = {
  session: CardioSesionWithDetails;
  className?: string;
};

/**
 * Icono de disciplina sutil + ubicación del punto de partida («Ciudad, Región»).
 */
export function CardioStartMetaRow({ session, className }: Props) {
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

  return (
    <p
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-xs leading-none text-muted-foreground",
        className,
      )}
    >
      <Icon
        className="h-3 w-3 shrink-0 text-muted-foreground"
        aria-hidden
        strokeWidth={1.75}
      />
      <span className="sr-only">{disciplina}</span>
      {locationLabel ? (
        <span className="truncate leading-none">{locationLabel}</span>
      ) : null}
    </p>
  );
}

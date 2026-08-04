import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Bike, CircleEllipsis, Footprints, Ship, Waves } from "lucide-react";
import { CardioWorkoutIcon } from "@/components/icons/CardioWorkoutIcon";
import { RunningIcon } from "@/components/icons/RunningIcon";

export type CardioIconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export type CardioSessionIconSource = {
  deporte?: string | null;
  cardio_disciplina?:
    | { codigo?: string | null; nombre?: string | null }
    | { codigo?: string | null; nombre?: string | null }[]
    | null;
};

/** Icono Lucide / custom según el código de disciplina de cardio. */
export function iconForCardioDisciplineCodigo(codigo: string | null | undefined): CardioIconComponent {
  switch (codigo) {
    case "running":
      return RunningIcon;
    case "cycling":
      return Bike;
    case "walking":
      return Footprints;
    case "rowing":
      return Ship;
    case "swimming":
      return Waves;
    case "other":
      return CircleEllipsis;
    default:
      return CardioWorkoutIcon;
  }
}

function resolveCardioDisciplineCodigo(session: CardioSessionIconSource): string | null {
  const disciplina = session.cardio_disciplina;
  const fromRelation = Array.isArray(disciplina) ? disciplina[0]?.codigo : disciplina?.codigo;
  if (fromRelation) return fromRelation;
  if (session.deporte) return session.deporte;
  return null;
}

/** Icono del calendario / listas a partir de la sesión (disciplina unida o `deporte` legacy). */
export function resolveCardioSessionIcon(session: CardioSessionIconSource): CardioIconComponent {
  return iconForCardioDisciplineCodigo(resolveCardioDisciplineCodigo(session));
}

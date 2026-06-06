import { format } from "date-fns";
import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import { CardioWorkoutIcon } from "@/components/icons/CardioWorkoutIcon";
import {
  DEFAULT_ROUTINE_ICON_KEY,
  resolveRoutineIcon,
} from "@/lib/routineIcons";
import type { ActividadWithDetails } from "@/types/workout";
import type { CardioSesion } from "@/types/cardio";
import type { PlannedRoutine } from "@/hooks/useWorkoutPlan";
import type { RutinaWithDetails } from "@/types/routine";
import { cn } from "@/lib/utils";

type IconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export type CalendarDayDisplay =
  | { type: "number" }
  | { type: "routine"; Icon: IconComponent }
  | { type: "cardio"; Icon: typeof CardioWorkoutIcon };

export function resolveCalendarDayDisplay(
  dayWorkouts: ActividadWithDetails[],
  dayPlanned: PlannedRoutine[],
  dayCardio: CardioSesion[],
  routines?: RutinaWithDetails[],
): CalendarDayDisplay {
  if (dayWorkouts.length > 0) {
    const workout = dayWorkouts[0];
    const fromPlanned = dayPlanned.find((p) => p.actividad_id === workout.id);
    if (fromPlanned?.rutina) {
      return { type: "routine", Icon: resolveRoutineIcon(fromPlanned.rutina.icono) };
    }
    const byName = routines?.find((r) => r.nombre === workout.titulo);
    if (byName) {
      return { type: "routine", Icon: resolveRoutineIcon(byName.icono) };
    }
    return { type: "routine", Icon: resolveRoutineIcon(DEFAULT_ROUTINE_ICON_KEY) };
  }

  if (dayCardio.length > 0) {
    return { type: "cardio", Icon: CardioWorkoutIcon };
  }

  if (dayPlanned.length > 0) {
    return { type: "routine", Icon: resolveRoutineIcon(dayPlanned[0].rutina?.icono) };
  }

  return { type: "number" };
}

export function CalendarDayCircleContent({
  day,
  display,
  today,
}: {
  day: Date;
  display: CalendarDayDisplay;
  today: boolean;
}) {
  if (display.type !== "number") {
    const Icon = display.Icon;
    return <Icon className="relative z-10 h-5 w-5" strokeWidth={1.75} />;
  }

  return (
    <span className={cn("relative z-10", today && "text-primary font-bold")}>
      {format(day, "d")}
    </span>
  );
}

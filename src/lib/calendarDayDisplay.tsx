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

export type CalendarDayActivityFlags = {
  isTrained: boolean;
  isCardioTrained: boolean;
  isScheduled: boolean;
  isPast: boolean;
  today: boolean;
  /** false mientras cargan entrenamientos, cardio o planificación (evita parpadeo de colores). */
  dataReady: boolean;
};

export function getCalendarDayCircleClasses({
  isTrained,
  isCardioTrained,
  isScheduled,
  isPast,
  today,
  dataReady,
}: CalendarDayActivityFlags) {
  const showTrained = dataReady && isTrained;
  const showCardio = dataReady && isCardioTrained;
  const showScheduled = dataReady && isScheduled;

  const circleFill = showTrained
    ? "bg-gradient-to-br from-primary/88 via-primary/72 to-accent/82 dark:from-primary/65 dark:via-primary/45 dark:to-accent/70"
    : showCardio
      ? "bg-gradient-to-br from-blue-500/70 via-blue-500/45 to-cyan-500/60"
      : showScheduled
        ? "bg-gradient-to-br from-orange-500/55 via-orange-500/35 to-orange-400/50"
        : isPast
          ? "bg-secondary/60"
          : "bg-secondary/70";

  const circleText = showTrained || showCardio
    ? "text-primary-foreground"
    : showScheduled
      ? "text-foreground"
      : isPast
        ? "text-muted-foreground"
        : "text-foreground";

  const circleBorder = showTrained
    ? isPast
      ? "border-primary/22"
      : "border-primary/40"
    : showCardio
      ? "border-blue-400/50"
      : isPast
        ? "border-border/70"
        : "border-border/12";

  return {
    circleFill,
    circleText,
    circleBorder: today ? "border-primary" : circleBorder,
    transitionClass: dataReady ? "transition-all duration-200" : "transition-none",
    loadingClass: dataReady ? "" : "animate-pulse opacity-85",
  };
}

export function resolveCalendarDayDisplay(
  dayWorkouts: ActividadWithDetails[],
  dayPlanned: PlannedRoutine[],
  dayCardio: CardioSesion[],
  routines?: RutinaWithDetails[],
  dataReady = true,
): CalendarDayDisplay {
  if (!dataReady) {
    return { type: "number" };
  }

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

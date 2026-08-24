import { format } from "date-fns";
import type { ComponentType, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  resolveCardioSessionIcon,
  type CardioSessionIconSource,
} from "@/lib/cardioIcons";
import {
  resolveRoutineIcon,
  resolveWorkoutIconKey,
} from "@/lib/routineIcons";
import type { ActividadWithDetails } from "@/types/workout";
import type { PlannedRoutine } from "@/hooks/useWorkoutPlan";
import type { RutinaWithDetails } from "@/types/routine";
import { cn } from "@/lib/utils";

type IconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export type CalendarDayDisplay =
  | { type: "number" }
  | { type: "loading" }
  | { type: "routine"; Icon: IconComponent }
  | { type: "cardio"; Icon: IconComponent };

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
  // Mientras cargan los datos mostramos un skeleton neutro (disco atenuado con
  // reflejo animado), sin número ni colores de actividad, para que se vea
  // claramente que el día todavía está cargando.
  if (!dataReady) {
    return {
      circleFill: "bg-muted/60 dark:bg-muted/45",
      circleText: "text-transparent",
      circleBorder: "border-transparent",
      transitionClass: "transition-none",
      loadingClass: "calendar-day-skeleton overflow-hidden",
    };
  }

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
          // Degradado cenital muy leve: el disco deja de leerse como un plano.
          ? "bg-linear-to-b from-secondary/60 to-secondary/35"
          : "bg-linear-to-b from-secondary/80 to-secondary/50";

  const circleText = showTrained || showCardio
    ? "text-primary-foreground"
    : showScheduled
      ? "text-foreground"
      : isPast
        ? "text-muted-foreground"
        : "text-foreground";

  const circleBorder = showTrained
    ? isPast
      ? "border-primary/10"
      : "border-primary/16"
    : showCardio
      ? "border-blue-400/18"
      : isPast
        ? "border-border/70"
        : "border-border/12";

  return {
    circleFill,
    circleText,
    circleBorder: today
      ? showTrained
        ? "border-primary/28"
        : showCardio
          ? "border-blue-400/28"
          : "border-primary"
      : circleBorder,
    transitionClass: dataReady ? "transition-all duration-200" : "transition-none",
    loadingClass: dataReady ? "" : "animate-pulse opacity-85",
  };
}

export function resolveCalendarDayDisplay(
  dayWorkouts: ActividadWithDetails[],
  dayPlanned: PlannedRoutine[],
  dayCardio: CardioSessionIconSource[],
  routines?: RutinaWithDetails[],
  dataReady = true,
): CalendarDayDisplay {
  if (!dataReady) {
    return { type: "loading" };
  }

  if (dayWorkouts.length > 0) {
    const workout = dayWorkouts[0];
    const fromPlanned = dayPlanned.find((p) => p.actividad_id === workout.id);
    if (fromPlanned?.rutina) {
      return { type: "routine", Icon: resolveRoutineIcon(fromPlanned.rutina.icono) };
    }
    const byName = routines?.find((r) => r.nombre === workout.titulo);
    const iconKey = resolveWorkoutIconKey(workout, byName?.icono);
    return { type: "routine", Icon: resolveRoutineIcon(iconKey) };
  }

  if (dayCardio.length > 0) {
    return { type: "cardio", Icon: resolveCardioSessionIcon(dayCardio[0]) };
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
  // Cargando: no mostramos el número del día todavía, solo el disco con reflejo.
  if (display.type === "loading") {
    return null;
  }

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

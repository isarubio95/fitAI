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

/** Radio de celda: 10px (`--radius-md`), no cápsula. Mes, semana y preview lo comparten. */
export const CALENDAR_DAY_CELL_SHAPE = "rounded-md";

export function getCalendarDayCircleClasses({
  isTrained,
  isCardioTrained,
  isScheduled,
  isPast,
  today,
  dataReady,
}: CalendarDayActivityFlags) {
  // Mientras cargan los datos mostramos un skeleton neutro (celda atenuada con
  // reflejo animado), sin número ni colores de actividad, para que se vea
  // claramente que el día todavía está cargando.
  if (!dataReady) {
    return {
      circleFill: "bg-muted/60 dark:bg-muted/45",
      circleText: "text-transparent",
      circleBorder: "border-transparent",
      transitionClass: "transition-none",
      loadingClass: "calendar-day-skeleton overflow-hidden",
      hasMark: false,
    };
  }

  const showTrained = dataReady && isTrained;
  const showCardio = dataReady && isCardioTrained;
  const showScheduled = dataReady && isScheduled;
  const hasMark = showTrained || showCardio || showScheduled;

  const circleFill = showTrained
    ? "bg-linear-to-br from-primary/88 via-primary/72 to-accent/82 dark:from-primary/65 dark:via-primary/45 dark:to-accent/70"
    : showCardio
      ? "bg-linear-to-br from-chart-fitness/70 via-chart-fitness/45 to-chart-fresh/60"
      : showScheduled
        ? "bg-linear-to-br from-chart-fatigue/55 via-chart-fatigue/35 to-chart-fatigue/50"
        : "bg-transparent";

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
      ? "border-chart-fitness/18"
      : showScheduled
        ? "border-chart-fatigue/20"
        : "border-transparent";

  return {
    circleFill,
    circleText,
    circleBorder: today
      ? showTrained
        ? "border-primary/28"
        : showCardio
          ? "border-chart-fitness/28"
          : "border-primary"
      : circleBorder,
    transitionClass: dataReady ? "transition-colors duration-200" : "transition-none",
    loadingClass: dataReady ? "" : "animate-pulse opacity-85",
    hasMark,
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
  // Cargando: no mostramos el número del día todavía, solo la celda con reflejo.
  if (display.type === "loading") {
    return null;
  }

  if (display.type !== "number") {
    const Icon = display.Icon;
    return <Icon className="relative z-10 h-5 w-5" strokeWidth={1.75} />;
  }

  return (
    <span className={cn("relative z-10 tabular-nums", today && "text-primary font-bold")}>
      {format(day, "d")}
    </span>
  );
}

export function CalendarDayCell({
  day,
  display,
  today,
  isSelected = false,
  interactive = true,
  flags,
}: {
  day: Date;
  display: CalendarDayDisplay;
  today: boolean;
  isSelected?: boolean;
  interactive?: boolean;
  flags: CalendarDayActivityFlags;
}) {
  const styles = getCalendarDayCircleClasses(flags);

  return (
    <span
      className={cn(
        "relative flex size-full items-center justify-center select-none border text-xs font-semibold",
        CALENDAR_DAY_CELL_SHAPE,
        styles.circleFill,
        styles.circleText,
        styles.circleBorder,
        styles.transitionClass,
        styles.loadingClass,
        isSelected && !today && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        interactive &&
          (styles.hasMark
            ? "group-hover:scale-[1.03]"
            : "group-hover:bg-secondary/40"),
      )}
    >
      <CalendarDayCircleContent day={day} display={display} today={today} />
    </span>
  );
}

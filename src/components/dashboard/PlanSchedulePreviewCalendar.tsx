import { useMemo } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDayCircleContent,
  getCalendarDayCircleClasses,
  type CalendarDayDisplay,
} from "@/lib/calendarDayDisplay";
import { resolveRoutineIcon } from "@/lib/routineIcons";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export type PlanSchedulePreviewEntry = {
  rutinaId: string;
  fechasArray: string[];
};

export type PlanScheduleRoutineMeta = {
  nombre: string;
  icono?: string | null;
};

interface PlanSchedulePreviewCalendarProps {
  schedules: PlanSchedulePreviewEntry[];
  routineMeta: Record<string, PlanScheduleRoutineMeta>;
}

function buildMonthDays(month: Date): Date[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const allDays = eachDayOfInterval({ start, end });

  const startDow = (getDay(start) + 6) % 7;
  const prefix: Date[] = Array.from({ length: startDow }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() - (startDow - i));
    return d;
  });

  const endDow = (getDay(end) + 6) % 7;
  const suffix: Date[] = Array.from({ length: 6 - endDow }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  return [...prefix, ...allDays, ...suffix];
}

export function PlanSchedulePreviewCalendar({
  schedules,
  routineMeta,
}: PlanSchedulePreviewCalendarProps) {
  const scheduledByDate = useMemo(() => {
    const map = new Map<string, PlanScheduleRoutineMeta>();
    for (const schedule of schedules) {
      const meta = routineMeta[schedule.rutinaId];
      if (!meta) continue;
      for (const date of schedule.fechasArray) {
        map.set(date, meta);
      }
    }
    return map;
  }, [schedules, routineMeta]);

  const months = useMemo(() => {
    const dates = schedules.flatMap((s) => s.fechasArray).sort();
    if (dates.length === 0) return [];

    const first = startOfMonth(new Date(`${dates[0]}T12:00:00`));
    const last = startOfMonth(new Date(`${dates[dates.length - 1]}T12:00:00`));
    const result: Date[] = [];
    let current = first;
    while (current <= last) {
      result.push(current);
      current = addMonths(current, 1);
    }
    return result;
  }, [schedules]);

  if (months.length === 0) return null;

  return (
    <div className="space-y-5">
      {months.map((month) => {
        const days = buildMonthDays(month);
        const weeks: Date[][] = [];
        for (let i = 0; i < days.length; i += 7) {
          weeks.push(days.slice(i, i + 7));
        }

        return (
          <div key={format(month, "yyyy-MM")} className="w-full">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {format(month, "MMMM yyyy", { locale: es })}
            </p>

            <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1 px-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="bg-transparent rounded-b-xl overflow-hidden">
              {weeks.map((weekDays, weekIndex) => {
                const isLastWeekRow = weekIndex === weeks.length - 1;
                return (
                  <div key={weekIndex} className="grid grid-cols-7 px-2">
                    {weekDays.map((day, colIndex) => {
                      const inMonth = isSameMonth(day, month);
                      const today = isToday(day);
                      const key = format(day, "yyyy-MM-dd");
                      const scheduled = scheduledByDate.get(key);
                      const isScheduled = !!scheduled;

                      const now = startOfDay(new Date());
                      const dayStart = startOfDay(day);
                      const isPast = isBefore(dayStart, now) && !today;

                      const isBottomLeft = isLastWeekRow && colIndex === 0;
                      const isBottomRight = isLastWeekRow && colIndex === 6;

                      const circleStyles = getCalendarDayCircleClasses({
                        isTrained: false,
                        isCardioTrained: false,
                        isScheduled,
                        isPast,
                        today,
                        dataReady: true,
                      });

                      let display: CalendarDayDisplay = { type: "number" };
                      if (isScheduled) {
                        display = {
                          type: "routine",
                          Icon: resolveRoutineIcon(scheduled.icono),
                        };
                      }

                      return (
                        <div
                          key={key}
                          className={cn(
                            "relative aspect-square w-full p-1",
                            isBottomLeft && "rounded-bl-xl",
                            isBottomRight && "rounded-br-xl",
                            !inMonth && "opacity-40",
                            "flex items-center justify-center",
                          )}
                          aria-label={
                            scheduled
                              ? `${format(day, "d MMM", { locale: es })} — ${scheduled.nombre}`
                              : `Día ${format(day, "d")}`
                          }
                        >
                          <span className="relative flex items-center justify-center select-none w-8 h-8 rounded-full p-0 bg-transparent">
                            <span
                              className={cn(
                                "relative flex items-center justify-center select-none w-full h-full rounded-full border text-xs font-semibold",
                                circleStyles.circleFill,
                                circleStyles.circleText,
                                circleStyles.circleBorder,
                                circleStyles.transitionClass,
                              )}
                            >
                              <CalendarDayCircleContent day={day} display={display} today={today} />
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

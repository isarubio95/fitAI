import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActividadWithDetails } from "@/types/workout";

interface MonthlyPlannerProps {
  month: Date;
  onMonthChange: (d: Date) => void;
  workouts: ActividadWithDetails[];
  onDayClick: (date: Date) => void;
  onWorkoutClick: (workoutId: string) => void;
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthlyPlanner({
  month,
  onMonthChange,
  workouts,
  onDayClick,
  onWorkoutClick,
}: MonthlyPlannerProps) {
  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const allDays = eachDayOfInterval({ start, end });

    // Pad start: getDay returns 0=Sun, we want Mon=0
    const startDow = (getDay(start) + 6) % 7;
    const prefix: (Date | null)[] = Array.from({ length: startDow }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - (startDow - i));
      return d;
    });

    // Pad end
    const endDow = (getDay(end) + 6) % 7;
    const suffix: (Date | null)[] = Array.from({ length: 6 - endDow }, (_, i) => {
      const d = new Date(end);
      d.setDate(d.getDate() + i + 1);
      return d;
    });

    return [...prefix, ...allDays, ...suffix];
  }, [month]);

  const workoutsByDay = useMemo(() => {
    const map = new Map<string, ActividadWithDetails[]>();
    workouts.forEach((w) => {
      const key = format(new Date(w.fecha), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });
    return map;
  }, [workouts]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold capitalize">
          {format(month, "MMMM yyyy", { locale: es })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-t border-l border-border">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const key = format(day, "yyyy-MM-dd");
          const dayWorkouts = workoutsByDay.get(key) || [];

          return (
            <div
              key={i}
              className={`
                relative border-r border-b border-border min-h-[80px] md:min-h-[100px] p-1 cursor-pointer
                transition-colors hover:bg-accent/30
                ${today ? "bg-accent/15" : ""}
                ${!inMonth ? "opacity-40" : ""}
              `}
              onClick={() => onDayClick(day)}
            >
              {/* Day number */}
              <span
                className={`
                  absolute top-1 right-1.5 text-xs font-medium
                  ${today ? "text-primary font-bold" : "text-foreground"}
                `}
              >
                {format(day, "d")}
              </span>

              {/* Workout pills */}
              <div className="mt-5 space-y-0.5 overflow-hidden">
                {dayWorkouts.slice(0, 3).map((w) => (
                  <button
                    key={w.id}
                    className="flex items-center gap-1 w-full text-left rounded px-1 py-0.5 hover:bg-secondary/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWorkoutClick(w.id);
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-[10px] md:text-xs truncate text-foreground">
                      {w.titulo}
                    </span>
                  </button>
                ))}
                {dayWorkouts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayWorkouts.length - 3} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

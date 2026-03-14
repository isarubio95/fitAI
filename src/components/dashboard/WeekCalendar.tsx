import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  format,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ActividadWithDetails } from "@/types/workout";
import { useMonthWorkouts } from "@/hooks/useWorkouts";

interface WeekCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  workoutDates: Date[];
  onWorkoutClick?: (id: string) => void;
}

export function WeekCalendar({
  selectedDate,
  onDateSelect,
  workoutDates,
  onWorkoutClick,
}: WeekCalendarProps) {
  const weekStart = useMemo(
    () => startOfWeek(selectedDate ?? new Date(), { weekStartsOn: 1 }),
    [selectedDate]
  );

  const monthForWeek = useMemo(
    () => startOfMonth(weekStart),
    [weekStart]
  );

  const { data: monthWorkouts } = useMonthWorkouts(monthForWeek);

  const weekWorkoutsByDate = useMemo(() => {
    if (!monthWorkouts) return {} as Record<string, ActividadWithDetails[]>;

    const start = weekStart;
    const end = addDays(start, 6);

    const map: Record<string, ActividadWithDetails[]> = {};

    monthWorkouts.forEach((w) => {
      const d = new Date(w.fecha);
      if (d >= start && d <= end) {
        const key = format(d, "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(w);
      }
    });

    return map;
  }, [monthWorkouts, weekStart]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const hasWorkout = (day: Date) =>
    workoutDates.some((d) => isSameDay(d, day));

  const goBack = () => onDateSelect(subWeeks(selectedDate ?? new Date(), 1));
  const goForward = () => onDateSelect(addWeeks(selectedDate ?? new Date(), 1));

  return (
    <div className="w-full space-y-3">
      {/* Header: rango de la semana (fuera de la card) */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold capitalize">
          {format(weekStart, "d", { locale: es })} -{" "}
          {format(addDays(weekStart, 6), "d 'de' MMMM", { locale: es })}
        </h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goForward}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de días lunes - domingo, dentro de la card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/40">
        {days.map((day) => {
          const selected = selectedDate !== null && isSameDay(day, selectedDate);
          const today = isToday(day);
          const dateKey = format(day, "yyyy-MM-dd");
          const dayWorkouts = weekWorkoutsByDate?.[dateKey] ?? [];

          let summary: string;
          if (dayWorkouts.length === 0) {
            summary = "";
          } else if (dayWorkouts.length === 1) {
            summary = dayWorkouts[0].titulo;
          } else if (dayWorkouts.length === 2) {
            summary = `${dayWorkouts[0].titulo}, ${dayWorkouts[1].titulo}`;
          } else {
            summary = `${dayWorkouts[0].titulo}, ${dayWorkouts[1].titulo} +${dayWorkouts.length - 2} más`;
          }

          const hasWorkouts = dayWorkouts.length > 0;
          const isOpen = selected && hasWorkouts;

          return (
            <motion.div
              key={day.toISOString()}
              className="bg-card/0"
              layout
              transition={{ layout: { duration: 0.22, ease: "easeInOut" } }}
            >
              <div className="w-full rounded-none">
              <button
                onClick={() => onDateSelect(day)}
                className="w-full px-3 py-3 text-left"
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="flex items-baseline gap-3 shrink-0">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {format(day, "EEE", { locale: es })}
                    </span>
                    <span
                      className={`
                        text-lg font-semibold text-foreground
                        ${today && !selected ? "underline underline-offset-4 decoration-primary decoration-2" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  {!isOpen && summary && (
                    <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate text-right">
                      {summary}
                    </span>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    {today && !selected && (
                      <span className="text-[11px] font-medium text-primary">
                        Hoy
                      </span>
                    )}
                    {hasWorkouts && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    {hasWorkouts && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    )}
                  </div>
                </div>
              </button>

              {/* Mismo contenedor: contenido expandido hacia abajo sin otro bloque */}
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-0 text-xs">
                    {dayWorkouts.map((w) => (
                      <div
                        key={w.id}
                        className="py-2 first:pt-1 last:pb-0 border-b border-border/20 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium text-[13px] text-foreground">{w.titulo}</span>
                          {onWorkoutClick && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => onWorkoutClick(w.id)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {w.ejercicios.map((ej) => (
                            <span
                              key={ej.id}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {ej.tipo_ejercicio.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


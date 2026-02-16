import { useMemo } from "react";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  workoutDates: Date[];
}

export function WeekCalendar({
  selectedDate,
  onDateSelect,
  workoutDates,
}: WeekCalendarProps) {
  const weekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 1 }),
    [selectedDate]
  );

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const hasWorkout = (day: Date) =>
    workoutDates.some((d) => isSameDay(d, day));

  const goBack = () => onDateSelect(subWeeks(selectedDate, 1));
  const goForward = () => onDateSelect(addWeeks(selectedDate, 1));

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      {/* Toolbar */}
      <div className="bg-muted/40 border-b border-border p-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold capitalize">
          {format(weekStart, "d MMM", { locale: es })} –{" "}
          {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
        </h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goForward}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days strip */}
      <div className="p-3 bg-background">
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const selected = isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={`
                  flex flex-col items-center py-2 rounded-xl transition-colors
                  ${selected ? "bg-primary text-primary-foreground" : today ? "bg-accent/50 hover:bg-accent/70" : "hover:bg-accent/30"}
                `}
              >
                <span
                  className={`text-[11px] uppercase tracking-wide ${
                    selected ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {format(day, "EEE", { locale: es })}
                </span>
                <span
                  className={`
                    text-lg font-bold mt-0.5
                    ${today && !selected ? "underline underline-offset-4 decoration-primary decoration-2" : ""}
                  `}
                >
                  {format(day, "d")}
                </span>
                {/* Workout dot */}
                <div className="h-1.5 mt-1">
                  {hasWorkout(day) && (
                    <span
                      className={`block h-1.5 w-1.5 rounded-full ${
                        selected ? "bg-primary-foreground" : "bg-primary"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

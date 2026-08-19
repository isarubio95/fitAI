import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getYear,
  isSameMonth,
  isSameWeek,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const WEEK_STARTS_ON = 1 as const;
const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = Array.from({ length: 12 }, (_, monthIndex) => monthIndex);

function monthWeeks(month: Date): Date[][] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

type CalendarPeriodPickerProps = {
  view: "month" | "week";
  label: string;
  month: Date;
  weekStart: Date;
  onSelectMonth: (month: Date) => void;
  onSelectWeek: (date: Date) => void;
};

export function CalendarPeriodPicker({
  view,
  label,
  month,
  weekStart,
  onSelectMonth,
  onSelectWeek,
}: CalendarPeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(month);

  useEffect(() => {
    if (!open) return;
    setPickerMonth(view === "month" ? startOfMonth(month) : startOfMonth(weekStart));
  }, [open, view, month, weekStart]);

  const pickerYear = getYear(pickerMonth);
  const weeks = useMemo(() => monthWeeks(pickerMonth), [pickerMonth]);

  const close = () => setOpen(false);

  const goToday = () => {
    const now = new Date();
    if (view === "month") {
      onSelectMonth(startOfMonth(now));
    } else {
      onSelectWeek(now);
    }
    close();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md text-left text-base font-semibold capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={view === "month" ? "Elegir mes y año" : "Elegir semana"}
        >
          {label}
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[272px] p-3" sideOffset={8}>
        {view === "month" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPickerMonth(subYears(pickerMonth, 1))}
                aria-label="Año anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-semibold tabular-nums">{pickerYear}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPickerMonth(addYears(pickerMonth, 1))}
                aria-label="Año siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((monthIndex) => {
                const candidate = new Date(pickerYear, monthIndex, 1);
                const selected = isSameMonth(candidate, month);
                const isCurrent = isSameMonth(candidate, new Date());
                return (
                  <button
                    key={monthIndex}
                    type="button"
                    className={cn(
                      "h-9 rounded-md text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "bg-primary-solid font-semibold text-primary-foreground"
                        : isCurrent
                          ? "font-semibold text-primary"
                          : "text-foreground hover:bg-accent/55 dark:hover:bg-accent/30",
                    )}
                    onClick={() => {
                      onSelectMonth(candidate);
                      close();
                    }}
                  >
                    {format(candidate, "LLL", { locale: es })}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPickerMonth(subMonths(pickerMonth, 1))}
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-semibold capitalize">
                {format(pickerMonth, "MMMM yyyy", { locale: es })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPickerMonth(addMonths(pickerMonth, 1))}
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
              {DAY_LABELS.map((dayLabel) => (
                <div key={dayLabel} className="py-1">
                  {dayLabel}
                </div>
              ))}
            </div>
            <div className="space-y-0.5">
              {weeks.map((week) => {
                const weekKey = format(week[0], "yyyy-MM-dd");
                const inSelectedWeek = isSameWeek(week[0], weekStart, { weekStartsOn: WEEK_STARTS_ON });
                return (
                  <div
                    key={weekKey}
                    className={cn("grid grid-cols-7 rounded-md", inSelectedWeek && "bg-primary-solid")}
                  >
                    {week.map((day) => {
                      const inMonth = isSameMonth(day, pickerMonth);
                      const todayDay = isToday(day);
                      return (
                        <button
                          key={format(day, "yyyy-MM-dd")}
                          type="button"
                          className={cn(
                            "h-8 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            inSelectedWeek
                              ? "font-semibold text-primary-foreground"
                              : todayDay
                                ? "font-semibold text-primary"
                                : inMonth
                                  ? "text-foreground hover:bg-accent/55 dark:hover:bg-accent/30"
                                  : "text-muted-foreground/50",
                            !inSelectedWeek && "rounded-md",
                          )}
                          onClick={() => {
                            onSelectWeek(day);
                            close();
                          }}
                        >
                          {format(day, "d")}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <button
          type="button"
          className="mt-2 w-full rounded-md py-1.5 text-sm font-medium text-primary outline-none hover:bg-accent/55 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-accent/30"
          onClick={goToday}
        >
          Hoy
        </button>
      </PopoverContent>
    </Popover>
  );
}

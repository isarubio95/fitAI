import { useState } from "react";
import { useLastWorkout, useWeeklyWorkouts, useMonthWorkoutDates, useWorkoutsForDate } from "@/hooks/useWorkouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Dumbbell, Calendar as CalendarIcon, Hash, Pencil } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

const Dashboard = () => {
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [editWorkoutId, setEditWorkoutId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);

  const { data: lastWorkout, isLoading: loadingLast } = useLastWorkout();
  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyWorkouts();
  const { data: workoutDates } = useMonthWorkoutDates(calendarMonth);
  const { data: dateWorkouts, isLoading: loadingDateWorkouts } = useWorkoutsForDate(selectedDate);

  const totalSets = lastWorkout?.ejercicios.reduce(
    (acc, ej) => acc + ej.series.length,
    0
  ) ?? 0;

  // Modifiers for calendar dots
  const workoutDays = workoutDates?.map((d) => new Date(d)) ?? [];

  const openNew = (date?: string) => {
    setEditWorkoutId(null);
    setPrefillDate(date);
    setLoggerOpen(true);
  };

  const openEdit = (id: string) => {
    setEditWorkoutId(id);
    setPrefillDate(undefined);
    setLoggerOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TrackGym</h1>
          <p className="text-sm text-muted-foreground">Tu progreso esta semana</p>
        </div>
      </header>

      {/* Weekly Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Consistencia Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWeekly ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={weeklyData} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis hide allowDecimals={false} />
                <Bar dataKey="workouts" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {weeklyData?.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.workouts > 0
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Calendario</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            locale={es}
            className="pointer-events-auto"
            modifiers={{ hasWorkout: workoutDays }}
            modifiersClassNames={{ hasWorkout: "workout-dot" }}
          />
        </CardContent>
      </Card>

      {/* Workouts for selected date */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDateWorkouts ? (
              <Skeleton className="h-16 w-full" />
            ) : dateWorkouts && dateWorkouts.length > 0 ? (
              <div className="space-y-3">
                {dateWorkouts.map((w) => {
                  const sets = w.ejercicios.reduce((a, ej) => a + ej.series.length, 0);
                  return (
                    <div key={w.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="font-semibold">{w.titulo}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {w.ejercicios.length} ejercicios
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {sets} series
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(w.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-muted-foreground">No hay entrenamientos registrados.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNew(format(selectedDate, "yyyy-MM-dd"))}
                >
                  <Plus className="h-4 w-4 mr-1" /> Registrar entrenamiento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Last Workout */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Último Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLast ? (
            <Skeleton className="h-20 w-full" />
          ) : lastWorkout ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">{lastWorkout.titulo}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(lastWorkout.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(lastWorkout.fecha), "d MMM yyyy", { locale: es })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4" />
                  {lastWorkout.ejercicios.length} ejercicios
                </span>
                <span className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4" />
                  {totalSets} series
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no has registrado ningún entrenamiento.
            </p>
          )}
        </CardContent>
      </Card>

      {/* FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-lg shadow-primary/30 z-40"
        onClick={() => openNew()}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <WorkoutLogger
        open={loggerOpen}
        onOpenChange={setLoggerOpen}
        workoutId={editWorkoutId}
        defaultDate={prefillDate}
      />
    </div>
  );
};

export default Dashboard;

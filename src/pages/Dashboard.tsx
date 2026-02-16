import { useState, useMemo, useEffect } from "react";
import { useLastWorkout, useWeeklyWorkouts, useMonthWorkouts, useMonthWorkoutDates, useWorkoutsForDate } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Dumbbell, Calendar as CalendarIcon, Hash, Pencil } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { MonthlyPlanner } from "@/components/dashboard/MonthlyPlanner";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { WeekDayDetail } from "@/components/dashboard/WeekDayDetail";
import { ExerciseProgressWidget } from "@/components/dashboard/ExerciseProgressWidget";
import { format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const Dashboard = () => {
  const { openNew, openEdit } = useGlobalWorkoutDrawer();

  const [calendarView, setCalendarView] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { data: lastWorkout, isLoading: loadingLast } = useLastWorkout();
  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyWorkouts();
  const { data: monthWorkouts } = useMonthWorkouts(calendarMonth);
  const { data: workoutDates } = useMonthWorkoutDates(calendarMonth);
  const { data: dayWorkouts } = useWorkoutsForDate(calendarView === "week" ? selectedDate : undefined);

  const totalSets = lastWorkout?.ejercicios.reduce(
    (acc, ej) => acc + ej.series.length,
    0
  ) ?? 0;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCalendarMonth(startOfMonth(date));
  };

  const handleMonthChange = (month: Date) => {
    setCalendarMonth(month);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TrackGym</h1>
          <p className="text-sm text-muted-foreground">Tu progreso esta semana</p>
        </div>
      </header>

      {/* Exercise Progress */}
      <ExerciseProgressWidget />

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

      {/* Calendar View Switcher */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as "month" | "week")}>
            <TabsList className="h-9 rounded-full bg-muted p-1">
              <TabsTrigger value="month" className="rounded-full px-5 text-sm data-[state=active]:shadow-sm">
                Mes
              </TabsTrigger>
              <TabsTrigger value="week" className="rounded-full px-5 text-sm data-[state=active]:shadow-sm">
                Semana
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {calendarView === "month" ? (
          <MonthlyPlanner
            month={calendarMonth}
            onMonthChange={handleMonthChange}
            workouts={monthWorkouts ?? []}
            onDayClick={(date) => {
              handleDateSelect(date);
              openNew(format(date, "yyyy-MM-dd"));
            }}
            onWorkoutClick={(id) => openEdit(id)}
          />
        ) : (
          <div>
            <WeekCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              workoutDates={workoutDates ?? []}
            />
            <WeekDayDetail
              workouts={dayWorkouts ?? []}
              dateKey={format(selectedDate, "yyyy-MM-dd")}
              onWorkoutClick={(id) => openEdit(id)}
            />
          </div>
        )}
      </div>

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
        size="icon" // Usamos 'icon' para asegurar que sea cuadrado perfecto
        onClick={() => openNew()}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full 
                  bg-gradient-to-br from-primary via-primary to-primary/80
                  border border-white/10
                  shadow-[0_4px_20px_rgba(var(--primary),0.4)]
                  hover:shadow-[0_6px_25px_rgba(var(--primary),0.6)]
                  hover:scale-105 active:scale-90
                  transition-all duration-300 ease-out
                  group md:bottom-8 md:right-8"
      >
        <Plus 
          className="h-7 w-7 text-primary-foreground 
                    transition-transform duration-500 ease-out 
                    group-hover:rotate-90 group-active:rotate-180" 
          strokeWidth={2.5} 
        />
        
        {/* Brillo especular (Overlay) para efecto 3D sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </div>
  );
};

export default Dashboard;

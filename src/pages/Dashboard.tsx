import { useState, useEffect } from "react";
import { useLastWorkout, useWeeklyWorkouts, useMonthWorkouts, useMonthWorkoutDates, useWorkoutsForDate } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Dumbbell, Calendar as CalendarIcon, Hash, Pencil, ArrowUpDown, GripHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { MonthlyPlanner } from "@/components/dashboard/MonthlyPlanner";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { WeekDayDetail } from "@/components/dashboard/WeekDayDetail";
import { ExerciseProgressWidget } from "@/components/dashboard/ExerciseProgressWidget";
import { BodyHeatmap } from "@/components/dashboard/BodyHeatmap";
import { GamificationWidget } from "@/components/dashboard/GamificationWidget";
import { format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// Importaciones de DND-Kit iguales a las de Rutinas
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DEFAULT_WIDGET_ORDER = ['gamification', 'heatmap', 'progress', 'weekly-chart', 'calendar', 'last-workout'];

const CALENDAR_VIEW_STORAGE_KEY = "gym-log.dashboard.calendar-view";

function loadCalendarView(): "month" | "week" {
  try {
    const raw = localStorage.getItem(CALENDAR_VIEW_STORAGE_KEY);
    if (raw === "month" || raw === "week") return raw;
    return "month";
  } catch {
    return "month";
  }
}

function saveCalendarView(view: "month" | "week") {
  try {
    localStorage.setItem(CALENDAR_VIEW_STORAGE_KEY, view);
  } catch {
    // ignore
  }
}

// Wrapper que imita el comportamiento de SortableRoutineCard
function SortableWidget({ id, isDragMode, children }: { id: string, isDragMode: boolean, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDragMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative flex flex-col transition-colors duration-200 ${
        isDragMode ? "p-3 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 gap-2" : ""
      }`}
    >
      {isDragMode && (
        <div className="flex justify-center w-full">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground p-1"
          >
            <GripHorizontal className="h-6 w-6" />
          </button>
        </div>
      )}
      <div className={isDragging ? "pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { openNew, openEdit } = useGlobalWorkoutDrawer();

  const [calendarView, setCalendarView] = useState<"month" | "week">(loadCalendarView);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    saveCalendarView(calendarView);
  }, [calendarView]);

  const [isDragMode, setIsDragMode] = useState(false); // Estado para controlar el modo edición

  const { data: lastWorkout, isLoading: loadingLast } = useLastWorkout();
  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyWorkouts();
  const { data: monthWorkouts } = useMonthWorkouts(calendarMonth);
  const { data: workoutDates } = useMonthWorkoutDates(calendarMonth);
  const { data: dayWorkouts } = useWorkoutsForDate(calendarView === "week" ? selectedDate : undefined);

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard-widget-order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validItems = parsed.filter((w: string) => DEFAULT_WIDGET_ORDER.includes(w));
        const missing = DEFAULT_WIDGET_ORDER.filter(w => !validItems.includes(w));
        return [...validItems, ...missing];
      } catch(e) {}
    }
    return DEFAULT_WIDGET_ORDER;
  });

  useEffect(() => {
    localStorage.setItem('dashboard-widget-order', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

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

  // Mismos sensores exactos que en src/pages/Routines.tsx
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'gamification':
        return <GamificationWidget />;
      case 'heatmap':
        return <BodyHeatmap />;
      case 'progress':
        return <ExerciseProgressWidget />;
      case 'weekly-chart':
        return (
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
        );
      case 'calendar':
        return (
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
                  if (!isDragMode) openNew(format(date, "yyyy-MM-dd"));
                }}
                onWorkoutClick={(id) => { if (!isDragMode) openEdit(id); }}
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
                  onWorkoutClick={(id) => { if (!isDragMode) openEdit(id); }}
                />
              </div>
            )}
          </div>
        );
      case 'last-workout':
        return (
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 pt-6 space-y-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TrackGym</h1>
          <p className="text-sm text-muted-foreground">Tu progreso esta semana</p>
        </div>
        
        {/* Botón explícito para habilitar el Drag & Drop */}
        <Button 
          variant={isDragMode ? "default" : "outline"} 
          size="sm" 
          onClick={() => setIsDragMode(!isDragMode)}
          className="gap-2 transition-all"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isDragMode ? "Hecho" : "Reordenar"}
          </span>
        </Button>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={widgetOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {widgetOrder.map((id) => (
              <SortableWidget key={id} id={id} isDragMode={isDragMode}>
                {renderWidget(id)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Dashboard;
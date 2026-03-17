import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLastWorkout, useWeeklyWorkouts, useMonthWorkouts, useMonthWorkoutDates } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Dumbbell, Calendar as CalendarIcon, Hash, Pencil, ArrowUpDown, GripHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { MonthlyPlanner } from "@/components/dashboard/MonthlyPlanner";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { ExerciseProgressWidget } from "@/components/dashboard/ExerciseProgressWidget";
import { BodyHeatmap } from "@/components/dashboard/BodyHeatmap";
import { GamificationWidget } from "@/components/dashboard/GamificationWidget";
import { ProgramWizard, deriveRoutineByDayFromPlanned } from "@/components/dashboard/ProgramWizard";
import { format, startOfMonth, startOfWeek, isSameDay, subYears, addYears } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { usePlannedRoutines, useDeleteAllPlannedRoutines, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ExerciseFormData } from "@/types/workout";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { openNew, openEdit, openActiveWorkout, openFromPlannedRoutine } = useGlobalWorkoutDrawer();
  const { data: activeWorkout } = useActiveWorkout();
  const { toast } = useToast();

  const [calendarView, setCalendarView] = useState<"month" | "week">(loadCalendarView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  /** Semana mostrada en vista semanal; al cerrar el dropdown se mantiene en lugar de volver a hoy */
  const [weekViewStart, setWeekViewStart] = useState<Date | null>(null);
  const [planWizardOpen, setPlanWizardOpen] = useState(false);
  const [editPlanSheetOpen, setEditPlanSheetOpen] = useState(false);
  const [planWizardReplaceExisting, setPlanWizardReplaceExisting] = useState(false);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(false);
  const [pendingOpenPlanWizard, setPendingOpenPlanWizard] = useState(false);

  const today = useMemo(() => new Date(), []);
  const { data: allPlannedRoutines, isLoading: plannedLoading } = usePlannedRoutines(subYears(today, 1), addYears(today, 2));
  const hasPlanned = (allPlannedRoutines?.length ?? 0) > 0;
  const plannedCount = allPlannedRoutines?.length ?? 0;
  const initialRoutineByDay = useMemo(
    () => (allPlannedRoutines?.length ? deriveRoutineByDayFromPlanned(allPlannedRoutines) : {}),
    [allPlannedRoutines]
  );
  const deleteAllPlan = useDeleteAllPlannedRoutines();

  useEffect(() => {
    saveCalendarView(calendarView);
  }, [calendarView]);

  // Abrir hoja de ruta cuando se llega desde el BottomNav (Añadir → Hoja de ruta)
  useEffect(() => {
    if ((location.state as { openPlanWizard?: boolean })?.openPlanWizard) {
      setPendingOpenPlanWizard(true);
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!pendingOpenPlanWizard || plannedLoading) return;
    if (hasPlanned) {
      setEditPlanSheetOpen(true);
    } else {
      setPlanWizardOpen(true);
    }
    setPendingOpenPlanWizard(false);
  }, [pendingOpenPlanWizard, plannedLoading, hasPlanned]);

  const [isDragMode, setIsDragMode] = useState(false); // Estado para controlar el modo edición

  const { data: lastWorkout, isLoading: loadingLast } = useLastWorkout();
  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyWorkouts();
  const { data: monthWorkouts } = useMonthWorkouts(calendarMonth);
  const { data: workoutDates } = useMonthWorkoutDates(calendarMonth);

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard-widget-order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validItems = parsed.filter((w: string) => DEFAULT_WIDGET_ORDER.includes(w));
        const missing = DEFAULT_WIDGET_ORDER.filter(w => !validItems.includes(w));
        return [...validItems, ...missing];
      } catch {
        // Ignorar JSON inválido en localStorage
      }
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

  const handleWeekDaySelect = (date: Date) => {
    if (selectedDate && isSameDay(selectedDate, date)) {
      setSelectedDate(null);
      // No cambiar weekViewStart: mantener la semana visible al cerrar el dropdown
    } else {
      setSelectedDate(date);
      setWeekViewStart(startOfWeek(date, { weekStartsOn: 1 }));
      setCalendarMonth(startOfMonth(date));
    }
  };

  const handleMonthChange = (month: Date) => {
    setCalendarMonth(month);
  };

  const startPlanned = (planned: PlannedRoutine) => {
    if (activeWorkout) {
      toast({
        title: "Ya tienes un entrenamiento en curso",
        description: "Termínalo o cancélalo antes de empezar otro.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => openActiveWorkout(activeWorkout.id)}>
            Ir al entreno
          </Button>
        ),
      });
      return;
    }

    const routine = planned.rutina as any;
    const ejercicios = (routine.ejercicios ?? [])
      .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((ej: any) => ({
        tipo_ejercicio_id: ej.tipo_ejercicio_id,
        nombre: ej.tipo_ejercicio?.nombre ?? "",
        repRange: `${ej.repes_min}-${ej.repes_max}`,
        targetRir: (ej as any).rir ?? 1,
        descanso: (ej as any).descanso ?? 120,
        superset_id: (ej as any).superset_id ?? null,
        sets: Array.from({ length: ej.series_objetivo }, () => ({
          repeticiones: 0,
          peso_kg: 0,
        })),
      })) as ExerciseFormData[];

    openFromPlannedRoutine(planned.id, routine.nombre ?? "Rutina", ejercicios);
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
                  <TabsTrigger value="month" className="rounded-full px-5 text-sm data-[state=active]:shadow-xs">
                    Mes
                  </TabsTrigger>
                  <TabsTrigger value="week" className="rounded-full px-5 text-sm data-[state=active]:shadow-xs">
                    Semana
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (hasPlanned) {
                    setEditPlanSheetOpen(true);
                  } else {
                    setPlanWizardReplaceExisting(false);
                    setPlanWizardOpen(true);
                  }
                }}
              >
                {hasPlanned ? (
                  <>
                    <Pencil className="h-4 w-4" />
                    Editar hoja de ruta
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4" />
                    Crear Hoja de Ruta
                  </>
                )}
              </Button>
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
                onPlannedStart={!isDragMode ? startPlanned : undefined}
              />
            ) : (
              <div>
                <WeekCalendar
                  selectedDate={selectedDate}
                  displayWeekStart={weekViewStart}
                  onDateSelect={handleWeekDaySelect}
                  workoutDates={workoutDates ?? []}
                  onWorkoutClick={(id) => { if (!isDragMode) openEdit(id); }}
                  onPlannedClick={(p) => { if (!isDragMode) startPlanned(p); }}
                />
              </div>
            )}

            <ProgramWizard
              open={planWizardOpen}
              onOpenChange={(open) => {
                setPlanWizardOpen(open);
                if (!open) setPlanWizardReplaceExisting(false);
              }}
              startDate={selectedDate ?? new Date()}
              replaceExisting={planWizardReplaceExisting}
              initialRoutineByDay={planWizardReplaceExisting ? initialRoutineByDay : undefined}
            />

            <Sheet open={editPlanSheetOpen} onOpenChange={setEditPlanSheetOpen}>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>Editar hoja de ruta</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tienes <strong>{plannedCount}</strong> {plannedCount === 1 ? "día programado" : "días programados"}.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        setEditPlanSheetOpen(false);
                        setPlanWizardReplaceExisting(true);
                        setPlanWizardOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Modificar plan
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => setConfirmDeletePlan(true)}
                    >
                      Borrar hoja de ruta
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <AlertDialog open={confirmDeletePlan} onOpenChange={setConfirmDeletePlan}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar toda la planificación?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vas a eliminar toda tu hoja de ruta. Se borrarán los{" "}
                    <strong>{plannedCount} {plannedCount === 1 ? "día programado" : "días programados"}</strong> y no
                    podrás recuperarlos. Perderás toda la planificación de rutinas. Esta acción no se puede deshacer.
                    ¿Continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteAllPlan.isPending}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      try {
                        await deleteAllPlan.mutateAsync();
                        toast({
                          title: "Hoja de ruta eliminada",
                          description: "Se ha borrado toda tu planificación.",
                        });
                        setConfirmDeletePlan(false);
                        setEditPlanSheetOpen(false);
                      } catch (e: any) {
                        toast({
                          title: "Error al eliminar",
                          description: e.message,
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Eliminar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
    <div className="w-full min-w-0 p-4 md:p-8 pt-6 space-y-6 max-w-4xl mx-auto">
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
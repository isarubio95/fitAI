import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useLastWorkout, useWeeklyWorkouts, useMonthWorkouts, useMonthWorkoutDates } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useMonthCardioSessionDates, useMonthCardioSessions } from "@/hooks/useCardioSessions";
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
import { DashboardNotificationPills } from "@/components/notifications/DashboardNotificationPills";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { ProgramWizard, deriveRoutineByDayFromPlanned } from "@/components/dashboard/ProgramWizard";
import { format, startOfMonth, startOfWeek, isSameDay, subYears, addYears } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { usePlannedRoutines, useDeleteAllPlannedRoutines, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
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
import {
  type ExerciseFormData,
  normalizeRegistroSeries,
  defaultSetForMode,
  formatRitmoSegKmLabel,
} from "@/types/workout";

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
  const { openEdit: openCardioEdit } = useGlobalCardioDrawer();
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
  // Evita parpadeo: al principio `data` puede ser `undefined` (query aún no resuelta o auth aún no lista).
  const plannedKnown = allPlannedRoutines !== undefined;
  const hasPlanned = plannedKnown ? allPlannedRoutines.length > 0 : false;
  const plannedCount = plannedKnown ? allPlannedRoutines.length : 0;
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
    // Esperar a tener certeza de si existe hoja de ruta o no para evitar "Crear" -> "Editar".
    if (!pendingOpenPlanWizard || plannedLoading || !plannedKnown) return;
    if (hasPlanned) {
      setEditPlanSheetOpen(true);
    } else {
      setPlanWizardOpen(true);
    }
    setPendingOpenPlanWizard(false);
  }, [pendingOpenPlanWizard, plannedLoading, plannedKnown, hasPlanned]);

  const [isDragMode, setIsDragMode] = useState(false); // Estado para controlar el modo edición
  const [headerActionsSlot, setHeaderActionsSlot] = useState<HTMLElement | null>(null);

  const [workoutDetailsOpen, setWorkoutDetailsOpen] = useState(false);
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);

  const { data: lastWorkout, isLoading: loadingLast } = useLastWorkout();
  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyWorkouts();
  const { data: monthWorkouts } = useMonthWorkouts(calendarMonth);
  const { data: workoutDates } = useMonthWorkoutDates(calendarMonth);
  const { data: monthCardioSessions } = useMonthCardioSessions(calendarMonth);
  const { data: cardioSessionDates } = useMonthCardioSessionDates(calendarMonth);

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    setHeaderActionsSlot(document.getElementById("header-actions-slot"));
  }, []);

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

  const openWorkoutDetails = (id: string) => {
    if (isDragMode) return;
    setWorkoutDetailsId(id);
    setWorkoutDetailsOpen(true);
  };

  const startPlanned = (planned: PlannedRoutine) => {
    if (activeWorkout) {
      // Evita que quede un foco/outline visible tras pulsar “Iniciar” (móvil/teclado)
      const activeEl = document.activeElement as HTMLElement | null;
      activeEl?.blur?.();
      toast({
        title: "Ya tienes un entrenamiento en curso",
        description: "Termínalo o cancélalo antes de empezar otro.",
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              const activeEl = document.activeElement as HTMLElement | null;
              activeEl?.blur?.();
              openActiveWorkout(activeWorkout.id);
            }}
          >
            Ir al entreno
          </Button>
        ),
      });
      return;
    }

    type RoutineExercise = {
      tipo_ejercicio_id?: string | null;
      usuario_ejercicio_id?: string | null;
      tipo_ejercicio?: { nombre?: string | null } | null;
      usuario_ejercicio?: { nombre?: string | null } | null;
      repes_min: number;
      repes_max: number;
      rir?: number | null;
      descanso?: number | null;
      superset_id?: string | null;
      series_objetivo: number;
      orden?: number | null;
      registro_series?: string | null;
      duracion_objetivo_seg?: number | null;
      ritmo_objetivo_seg_km?: number | null;
    };

    type PlannedRoutineWithExercises = {
      ejercicios?: RoutineExercise[] | null;
      nombre?: string | null;
    };

    const routine = planned.rutina as unknown as PlannedRoutineWithExercises;

    const ejercicios: ExerciseFormData[] = (routine.ejercicios ?? [])
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((ej) => {
        const registro_series = normalizeRegistroSeries(ej.registro_series);
        const durObj = ej.duracion_objetivo_seg;
        const ritmoObj = ej.ritmo_objetivo_seg_km;
        const nombre =
          ej.tipo_ejercicio?.nombre ?? ej.usuario_ejercicio?.nombre ?? "";
        return {
          tipo_ejercicio_id: ej.tipo_ejercicio_id ?? undefined,
          usuario_ejercicio_id: ej.usuario_ejercicio_id ?? undefined,
          nombre,
          registro_series,
          repRange:
            registro_series === "duracion_ritmo"
              ? `${durObj != null ? `${durObj}s` : "Tiempo"} · ${formatRitmoSegKmLabel(ritmoObj ?? null)}`
              : registro_series === "duracion"
                ? durObj != null
                  ? `${durObj} s`
                  : "Tiempo"
                : `${ej.repes_min}-${ej.repes_max}`,
          targetRir: ej.rir ?? 1,
          descanso: ej.descanso ?? 120,
          superset_id: ej.superset_id ?? null,
          sets: Array.from({ length: ej.series_objetivo }, () =>
            defaultSetForMode(registro_series, durObj ?? null, ritmoObj ?? null)
          ),
        };
      });

    const activeEl = document.activeElement as HTMLElement | null;
    activeEl?.blur?.();

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
          <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
            <CardHeader className="px-6 pt-8 pb-2">
              <CardTitle asChild className="text-base">
                <h2>Consistencia Semanal</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-0">
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
          <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
            <CardHeader className="space-y-3 px-6 pt-8 pb-6">
              <div className="flex w-full flex-row items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-2 bg-card border-border hover:bg-card/80"
                  disabled={!plannedKnown}
                  onClick={() => {
                    if (!plannedKnown) return;
                    if (hasPlanned) {
                      setEditPlanSheetOpen(true);
                    } else {
                      setPlanWizardReplaceExisting(false);
                      setPlanWizardOpen(true);
                    }
                  }}
                >
                  {!plannedKnown ? (
                    <>
                      <Skeleton className="h-4 w-4 rounded-sm" />
                      <Skeleton className="h-4 w-36" />
                    </>
                  ) : hasPlanned ? (
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
                <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as "month" | "week")}>
                  <TabsList className="h-9 shrink-0 rounded-full p-1">
                    <TabsTrigger value="month" className="rounded-full px-5 text-sm data-[state=active]:shadow-xs">
                      Mes
                    </TabsTrigger>
                    <TabsTrigger value="week" className="rounded-full px-5 text-sm data-[state=active]:shadow-xs">
                      Semana
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0 pb-5 pt-0">
              {calendarView === "month" ? (
                <MonthlyPlanner
                  month={calendarMonth}
                  onMonthChange={handleMonthChange}
                  workouts={monthWorkouts ?? []}
                  cardioSessions={monthCardioSessions ?? []}
                  onDayClick={(date) => {
                    handleDateSelect(date);
                    if (!isDragMode) openNew(format(date, "yyyy-MM-dd"));
                  }}
                  onWorkoutClick={(id) => { if (!isDragMode) openEdit(id); }}
                  onCardioClick={(id) => { if (!isDragMode) openCardioEdit(id); }}
                  onWorkoutDetailsClick={(id) => openWorkoutDetails(id)}
                  onPlannedStart={!isDragMode ? startPlanned : undefined}
                />
              ) : (
                <WeekCalendar
                  selectedDate={selectedDate}
                  displayWeekStart={weekViewStart}
                  onDateSelect={handleWeekDaySelect}
                  workoutDates={workoutDates ?? []}
                  cardioSessionDates={cardioSessionDates ?? []}
                  onWorkoutClick={(id) => { if (!isDragMode) openEdit(id); }}
                  onWorkoutDetailsClick={(id) => openWorkoutDetails(id)}
                  onPlannedClick={(p) => { if (!isDragMode) startPlanned(p); }}
                />
              )}
            </CardContent>

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

            <Drawer open={editPlanSheetOpen} onOpenChange={setEditPlanSheetOpen}>
              <DrawerContent side="bottom" className="rounded-t-2xl">
                <DrawerHeader>
                  <DrawerTitle>Editar hoja de ruta</DrawerTitle>
                </DrawerHeader>
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
              </DrawerContent>
            </Drawer>

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
                  } catch (e: unknown) {
                    const message = e instanceof Error ? e.message : "Error desconocido";
                        toast({
                          title: "Error al eliminar",
                      description: message,
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
          </Card>
        );
      case 'last-workout':
        return (
          <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
            <CardHeader className="px-6 pt-8 pb-2">
              <CardTitle asChild className="text-base">
                <h2>Último Entrenamiento</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-0">
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
    <div className="w-full min-w-0 pb-8 space-y-6 md:max-w-2xl md:mx-auto md:px-8">
      {headerActionsSlot &&
        createPortal(
          <Button
            variant={isDragMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsDragMode(!isDragMode)}
            title={isDragMode ? "Salir del modo ordenar" : "Ordenar widgets del inicio"}
            className={cn("transition-all", isDragMode && "gap-2")}
          >
            <ArrowUpDown className="h-4 w-4" />
            {isDragMode ? <span>Hecho</span> : null}
          </Button>,
          headerActionsSlot
        )}

      <DashboardNotificationPills />

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={widgetOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {widgetOrder.map((id) => (
              <SortableWidget key={id} id={id} isDragMode={isDragMode}>
                {renderWidget(id)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <WorkoutDetailsSheet
        open={workoutDetailsOpen}
        onOpenChange={(next) => {
          setWorkoutDetailsOpen(next);
          if (!next) setWorkoutDetailsId(null);
        }}
        workoutId={workoutDetailsId}
      />
    </div>
  );
};

export default Dashboard;
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLayoutActionSlot } from "@/hooks/useLayoutActionSlot";
import { useNavigate, useLocation } from "react-router-dom";
import { useMonthWorkouts, useMonthWorkoutDates } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useMonthCardioSessionDates, useMonthCardioSessions } from "@/hooks/useCardioSessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar as CalendarIcon, Pencil, ArrowUpDown, GripHorizontal, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { MonthlyPlanner } from "@/components/dashboard/MonthlyPlanner";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { CalendarPeriodPicker } from "@/components/dashboard/CalendarPeriodPicker";
import { ExerciseProgressWidget } from "@/components/dashboard/ExerciseProgressWidget";
import { BodyHeatmap } from "@/components/dashboard/BodyHeatmap";
import { TrainingLoadWidget } from "@/components/dashboard/TrainingLoadWidget";
import { GamificationWidget } from "@/components/dashboard/GamificationWidget";
import { AnimatedTabsList, pillTabsListClass, pillTabsTriggerClass, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { CardioDetailsSheet } from "@/components/cardio/CardioDetailsSheet";
import { ProgramWizard, deriveRoutineByDayFromPlanned } from "@/components/dashboard/ProgramWizard";
import { format, startOfMonth, startOfWeek, isSameDay, subYears, addYears, addMonths, subMonths, addWeeks, subWeeks, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PAGE_CARD, PAGE_CARD_STACK_GAP, PAGE_STACK_INSET } from "@/lib/pageStyles";
import { usePlannedRoutines, useDeleteAllPlannedRoutines, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  MouseSensor,
  TouchSensor,
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
import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_WIDGET_ORDER = ['calendar', 'gamification', 'heatmap', 'progress', 'training-load'];

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

// Wrapper sortable: en modo ordenar todo el bloque es zona de arrastre.
function SortableWidget({ id, isDragMode, children }: { id: string, isDragMode: boolean, children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDragMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-col transition-colors duration-200",
        isDragMode &&
          "gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-3",
        isDragging && "z-50",
      )}
    >
      {isDragMode && (
        // Única zona de arrastre: el resto del widget queda libre para hacer scroll.
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label="Arrastrar para reordenar"
          className="flex w-full cursor-grab touch-none select-none justify-center rounded-md py-2 text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="h-6 w-6" />
        </button>
      )}
      <div className={cn((isDragMode || isDragging) && "pointer-events-none select-none")}>
        {children}
      </div>
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openNew, openEdit, openFromPlannedRoutine } = useGlobalWorkoutDrawer();
  const { openEdit: openCardioEdit } = useGlobalCardioDrawer();
  const { toast } = useToast();

  const [calendarView, setCalendarView] = useState<"month" | "week">(loadCalendarView);
  const [calendarTransitionDirection, setCalendarTransitionDirection] = useState<1 | -1>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  /** Semana mostrada en vista semanal; al cerrar el dropdown se mantiene en lugar de volver a hoy */
  const [weekViewStart, setWeekViewStart] = useState<Date | null>(null);
  const [planWizardOpen, setPlanWizardOpen] = useState(false);
  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false);
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

  const handleCalendarViewChange = (nextView: "month" | "week") => {
    if (nextView === calendarView) return;
    setCalendarTransitionDirection(nextView === "week" ? 1 : -1);
    setCalendarView(nextView);
  };

  // Abrir plan cuando se llega desde notificaciones u otras acciones
  useEffect(() => {
    if ((location.state as { openPlanWizard?: boolean })?.openPlanWizard) {
      setPendingOpenPlanWizard(true);
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Esperar a tener certeza de si existe plan o no para evitar "Crear" -> "Editar".
    if (!pendingOpenPlanWizard || plannedLoading || !plannedKnown) return;
    if (hasPlanned) {
      setEditPlanDialogOpen(true);
    } else {
      setPlanWizardOpen(true);
    }
    setPendingOpenPlanWizard(false);
  }, [pendingOpenPlanWizard, plannedLoading, plannedKnown, hasPlanned]);

  const [isDragMode, setIsDragMode] = useState(false); // Estado para controlar el modo edición
  const headerActionsSlot = useLayoutActionSlot("header-actions-slot", "sidebar-header-actions-slot");

  const [workoutDetailsOpen, setWorkoutDetailsOpen] = useState(false);
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);
  const [cardioDetailsOpen, setCardioDetailsOpen] = useState(false);
  const [cardioDetailsId, setCardioDetailsId] = useState<string | null>(null);

  const { data: monthWorkouts, isPending: monthWorkoutsPending } = useMonthWorkouts(calendarMonth);
  const { data: workoutDates } = useMonthWorkoutDates(calendarMonth);
  const { data: monthCardioSessions, isPending: monthCardioPending } = useMonthCardioSessions(calendarMonth);
  const { data: cardioSessionDates } = useMonthCardioSessionDates(calendarMonth);
  const monthCalendarActivityReady = !monthWorkoutsPending && !monthCardioPending;

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

  const displayedWeekStart = useMemo(
    () => startOfWeek(selectedDate ?? weekViewStart ?? new Date(), { weekStartsOn: 1 }),
    [selectedDate, weekViewStart],
  );

  const calendarPeriodLabel =
    calendarView === "month"
      ? format(calendarMonth, "MMMM yyyy", { locale: es })
      : `${format(displayedWeekStart, "d", { locale: es })} - ${format(addDays(displayedWeekStart, 6), "d 'de' MMMM", { locale: es })}`;

  const goCalendarBack = () => {
    if (calendarView === "month") {
      handleMonthChange(subMonths(calendarMonth, 1));
    } else {
      handleWeekDaySelect(subWeeks(selectedDate ?? displayedWeekStart, 1));
    }
  };

  const goCalendarForward = () => {
    if (calendarView === "month") {
      handleMonthChange(addMonths(calendarMonth, 1));
    } else {
      handleWeekDaySelect(addWeeks(selectedDate ?? displayedWeekStart, 1));
    }
  };

  const selectCalendarWeek = (date: Date) => {
    setSelectedDate(date);
    setWeekViewStart(startOfWeek(date, { weekStartsOn: 1 }));
    setCalendarMonth(startOfMonth(date));
  };

  const openWorkoutDetails = (id: string) => {
    if (isDragMode) return;
    setWorkoutDetailsId(id);
    setWorkoutDetailsOpen(true);
  };

  const openCardioDetails = (id: string) => {
    if (isDragMode) return;
    setCardioDetailsId(id);
    setCardioDetailsOpen(true);
  };

  const startPlanned = (planned: PlannedRoutine) => {
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
          grupo_muscular: ej.tipo_ejercicio?.grupo_muscular ?? ej.usuario_ejercicio?.grupo_muscular ?? null,
          descanso: ej.descanso ?? 120,
          superset_id: ej.superset_id ?? null,
          sets: Array.from({ length: ej.series_objetivo }, () =>
            defaultSetForMode(registro_series, durObj ?? null, ritmoObj ?? null)
          ),
        };
      });

    const activeEl = document.activeElement as HTMLElement | null;
    activeEl?.blur?.();

    openFromPlannedRoutine(
      planned.id,
      routine.nombre ?? "Rutina",
      ejercicios,
      planned.rutina?.icono ?? null,
      planned.fecha_programada,
    );
  };

  // MouseSensor (escritorio) + TouchSensor (móvil) en lugar de PointerSensor:
  // ratón y tacto son sensores distintos y no compiten por el mismo gesto.
  // Como el arrastre solo se activa desde el asa, el resto del widget permite scroll.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
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
      case 'training-load':
        return <TrainingLoadWidget />;
      case 'calendar':
        return (
          <Card className={PAGE_CARD}>
            <CardHeader className="space-y-3 px-6 pt-8 pb-4">
              <div className="flex w-full flex-row items-center justify-between gap-2">
                <CalendarPeriodPicker
                  view={calendarView}
                  label={calendarPeriodLabel}
                  month={calendarMonth}
                  weekStart={displayedWeekStart}
                  onSelectMonth={handleMonthChange}
                  onSelectWeek={selectCalendarWeek}
                />
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goCalendarBack}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={goCalendarForward}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex w-full flex-row items-center justify-between gap-2">
                <Tabs value={calendarView} onValueChange={(v) => handleCalendarViewChange(v as "month" | "week")}>
                  <AnimatedTabsList value={calendarView} className={pillTabsListClass}>
                    <TabsTrigger value="month" className={pillTabsTriggerClass}>
                      Mes
                    </TabsTrigger>
                    <TabsTrigger value="week" className={pillTabsTriggerClass}>
                      Semana
                    </TabsTrigger>
                  </AnimatedTabsList>
                </Tabs>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background hover:bg-background"
                  disabled={!plannedKnown}
                  onClick={() => {
                    if (!plannedKnown) return;
                    if (hasPlanned) {
                      setEditPlanDialogOpen(true);
                    } else {
                      setPlanWizardReplaceExisting(false);
                      setPlanWizardOpen(true);
                    }
                  }}
                >
                  {/* Reserva el ancho de "Editar plan" (el label más largo) para evitar
                      CLS: el skeleton anterior usaba w-36 y al cargar el botón se encogía. */}
                  <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
                    <span
                      className="invisible inline-flex items-center gap-2 pointer-events-none"
                      aria-hidden
                    >
                      <Pencil className="h-4 w-4" />
                      Editar plan
                    </span>
                    <span className="inline-flex items-center justify-center gap-2">
                      {!plannedKnown ? (
                        <>
                          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                          <Skeleton className="h-4 w-16" />
                        </>
                      ) : hasPlanned ? (
                        <>
                          <Pencil className="h-4 w-4" />
                          Editar plan
                        </>
                      ) : (
                        <>
                          <CalendarIcon className="h-4 w-4" />
                          Crear plan
                        </>
                      )}
                    </span>
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 pb-5 pt-0">
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false} custom={calendarTransitionDirection}>
                  <motion.div
                    key={calendarView}
                    initial={{ opacity: 0, x: calendarTransitionDirection * 22 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: calendarTransitionDirection * -22 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {calendarView === "month" ? (
                      <MonthlyPlanner
                        month={calendarMonth}
                        workouts={monthWorkouts ?? []}
                        cardioSessions={monthCardioSessions ?? []}
                        activityDataReady={monthCalendarActivityReady}
                        onDayClick={(date) => {
                          handleDateSelect(date);
                          if (!isDragMode) openNew(format(date, "yyyy-MM-dd"));
                        }}
                        onWorkoutClick={(id) => { if (!isDragMode) openEdit(id); }}
                        onCardioClick={(id) => { if (!isDragMode) openCardioEdit(id); }}
                        onCardioDetailsClick={(id) => openCardioDetails(id)}
                        onWorkoutDetailsClick={(id) => openWorkoutDetails(id)}
                        onPlannedStart={!isDragMode ? startPlanned : undefined}
                      />
                    ) : (
                      <WeekCalendar
                        selectedDate={selectedDate}
                        displayWeekStart={weekViewStart}
                        onDateSelect={handleWeekDaySelect}
                        onDayClick={(date) => {
                          handleDateSelect(date);
                          if (!isDragMode) openNew(format(date, "yyyy-MM-dd"));
                        }}
                        workoutDates={workoutDates ?? []}
                        cardioSessionDates={cardioSessionDates ?? []}
                        onWorkoutClick={(id) => { if (!isDragMode) openEdit(id); }}
                        onCardioClick={(id) => { if (!isDragMode) openCardioEdit(id); }}
                        onCardioDetailsClick={(id) => openCardioDetails(id)}
                        onWorkoutDetailsClick={(id) => openWorkoutDetails(id)}
                        onPlannedClick={(p) => { if (!isDragMode) startPlanned(p); }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
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

            <Dialog open={editPlanDialogOpen} onOpenChange={setEditPlanDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar plan</DialogTitle>
                  <DialogDescription>
                    Tienes <strong>{plannedCount}</strong>{" "}
                    {plannedCount === 1 ? "día programado" : "días programados"}.
                  </DialogDescription>
                </DialogHeader>
                <DialogActions>
                  <Button
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => {
                      setEditPlanDialogOpen(false);
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
                    Borrar plan
                  </Button>
                </DialogActions>
              </DialogContent>
            </Dialog>

            <AlertDialog open={confirmDeletePlan} onOpenChange={setConfirmDeletePlan}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar toda la planificación?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vas a eliminar todo tu plan. Se borrarán los{" "}
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
                          title: "Plan eliminado",
                          description: "Se ha borrado toda tu planificación.",
                        });
                        setConfirmDeletePlan(false);
                        setEditPlanDialogOpen(false);
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
      default:
        return null;
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-background max-md:-mb-24 max-md:pb-24 md:max-w-2xl md:mx-auto md:bg-transparent md:px-8">
      {headerActionsSlot &&
        createPortal(
          <Button
            type="button"
            variant={isDragMode ? "default" : "ghost"}
            size="icon"
            onClick={() => setIsDragMode(!isDragMode)}
            title={isDragMode ? "Salir del modo ordenar" : "Ordenar widgets del inicio"}
            aria-pressed={isDragMode}
            className={cn(
              "h-11 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5",
              !isDragMode &&
                "text-muted-foreground hover:text-foreground/58 dark:text-foreground dark:hover:text-accent-foreground",
            )}
          >
            {isDragMode ? <Check /> : <ArrowUpDown />}
          </Button>,
          headerActionsSlot
        )}

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={widgetOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP, PAGE_STACK_INSET)}>
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

      <CardioDetailsSheet
        open={cardioDetailsOpen}
        onOpenChange={(next) => {
          setCardioDetailsOpen(next);
          if (!next) setCardioDetailsId(null);
        }}
        sessionId={cardioDetailsId}
      />
    </div>
  );
};

export default Dashboard;
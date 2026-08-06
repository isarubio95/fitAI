import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Bluetooth, Heart, Loader2, MapPin, Pause, Play, Square } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardioDisciplineIsland } from "@/components/cardio/CardioDisciplineIsland";
import { useToast } from "@/hooks/use-toast";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useCardioGpsRecorder } from "@/hooks/useCardioGpsRecorder";
import {
  useCardioDisciplinas,
  useCardioSessionById,
  useDeleteCardioSession,
  useLastCardioDisciplineId,
  useStartCardioLiveSession,
  useUpsertCardioSession,
} from "@/hooks/useCardioSessions";
import { useHeartRateMonitor } from "@/hooks/useHeartRateMonitor";
import { cardioDisciplineUsesGpsMap } from "@/lib/cardioLiveMap";
import { getDefaultCardioTitle } from "@/lib/defaultWorkoutTitle";
import { nearestHeartRate } from "@/lib/heartRateMetrics";
import { cn } from "@/lib/utils";
import {
  PILL_CIRCLE_DURATION_MS,
  pillCircleTransitionAttr,
  pillCircleTransitionStyle,
  pillCircleTransitionStyleForBottomSheet,
  type PillCirclePhase,
} from "@/lib/pillCircleTransition";
import { Switch } from "@/components/ui/switch";
import {
  formatDistanceLabel,
  startLiveCardio,
  stopLiveCardio,
  updateLiveCardio,
} from "@/lib/liveSessionNotifications";
import type { CardioDisciplineCode, CardioSportDetailInput, CardioTrackPointInput } from "@/types/cardio";

/** MapLibre solo se descarga cuando la disciplina usa mapa GPS. */
const LiveCardioMap = lazy(() =>
  import("@/components/cardio/LiveCardioMap").then((m) => ({ default: m.LiveCardioMap })),
);

function formatDuration(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatDistanceM(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}

function formatElevationM(m: number) {
  return `${Math.round(m)} m`;
}

/** Ganancia positiva acumulada; ignora saltos pequeños (ruido GPS de altitud). */
function elevationGainM(points: { elevacion_m?: number | null }[], minStepM = 1.5): number {
  let gain = 0;
  let prev: number | null = null;
  for (const p of points) {
    const e = p.elevacion_m;
    if (e == null || !Number.isFinite(e)) continue;
    if (prev != null) {
      const d = e - prev;
      if (d >= minStepM) gain += d;
    }
    prev = e;
  }
  return gain;
}

function firstNested<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function CardioLiveRecorder() {
  const { state, closeLiveRecording, openEdit, openLiveRecording } = useGlobalCardioDrawer();
  const sessionId = state.liveSessionId;
  const liveOpen = state.liveOpen;
  const isSetup = liveOpen && !sessionId;
  const open = liveOpen && !!sessionId;
  const pillOrigin = state.pillOrigin;

  const { toast } = useToast();
  const upsert = useUpsertCardioSession();
  const deleteSession = useDeleteCardioSession();
  const startCardioLive = useStartCardioLiveSession();
  const { data: cardioDisciplinas } = useCardioDisciplinas();
  const { data: lastDisciplineId } = useLastCardioDisciplineId();
  const { data: sessionData, isLoading: sessionLoading } = useCardioSessionById(open ? sessionId : null);

  const [step, setStep] = useState<"recording" | "summary">("recording");
  const [paused, setPaused] = useState(false);
  const [pausedMsAccum, setPausedMsAccum] = useState(0);
  const pauseStartedAt = useRef<number | null>(null);
  const [tick, setTick] = useState(0);
  const [elapsedSecFrozen, setElapsedSecFrozen] = useState<number | null>(null);
  const [distanceFrozenM, setDistanceFrozenM] = useState<number | null>(null);
  const [elevationFrozenM, setElevationFrozenM] = useState<number | null>(null);

  const [summaryTitulo, setSummaryTitulo] = useState("");
  const [summaryComentarios, setSummaryComentarios] = useState("");
  const [esPublica, setEsPublica] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [pillCirclePhase, setPillCirclePhase] = useState<PillCirclePhase | null>(null);
  const pillCloseTimerRef = useRef<number | null>(null);
  const controlsDrawerRef = useRef<HTMLDivElement | null>(null);
  const [controlsDrawerHeightPx, setControlsDrawerHeightPx] = useState(0);
  /** Compacto = métricas + botones; expandido = + pulsaciones + formulario. Altura = contenido. */
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const sheetDragStartY = useRef<number | null>(null);
  const [setupDisciplineId, setSetupDisciplineId] = useState<string | null>(null);

  const discipline = firstNested(sessionData?.cardio_disciplina);
  const code = discipline?.codigo ?? null;
  const setupDisciplineCodigo =
    cardioDisciplinas?.find((d) => d.id === setupDisciplineId)?.codigo ?? null;
  const showMap = isSetup || cardioDisciplineUsesGpsMap(code);

  const gpsRecording = open && step === "recording" && cardioDisciplineUsesGpsMap(code) && !paused;
  const gpsPreview =
    isSetup || (open && step === "recording" && cardioDisciplineUsesGpsMap(code));
  const { points, distanceM, error: gpsError, denied: gpsDenied, hasFix: gpsHasFix, clearDraft } =
    useCardioGpsRecorder({
      sessionId: open ? sessionId : null,
      recording: gpsRecording,
      preview: gpsPreview,
      // Muestreo más denso para que el trazado crezca de forma fluida al caminar/correr
      minIntervalMs: 2000,
      minDeltaM: 4,
    });

  const hrRecording = open && step === "recording" && !paused;
  const {
    available: hrAvailable,
    bpm,
    connected: hrConnected,
    connection: hrConnection,
    deviceName: hrDeviceName,
    error: hrError,
    samples: hrSamples,
    fcMedia,
    fcMax,
    zone: hrZone,
    connecting: hrConnecting,
    connect: connectHr,
    reconnect: reconnectHr,
    disconnect: disconnectHr,
    clearSamples: clearHrSamples,
  } = useHeartRateMonitor({
    recording: hrRecording,
    enabled: liveOpen,
  });
  useEffect(() => {
    if (!liveOpen) {
      setStep("recording");
      setPaused(false);
      setPausedMsAccum(0);
      pauseStartedAt.current = null;
      setElapsedSecFrozen(null);
      setDistanceFrozenM(null);
      setElevationFrozenM(null);
      setSummaryTitulo("");
      setSummaryComentarios("");
      setEsPublica(false);
      setConfirmDiscard(false);
      setPillCirclePhase(null);
      setControlsDrawerHeightPx(0);
      setControlsExpanded(false);
      sheetDragStartY.current = null;
      setSetupDisciplineId(null);
      if (pillCloseTimerRef.current != null) {
        window.clearTimeout(pillCloseTimerRef.current);
        pillCloseTimerRef.current = null;
      }
    }
  }, [liveOpen]);

  useEffect(() => {
    if (open && pillOrigin) setPillCirclePhase("in");
  }, [open, pillOrigin]);

  useEffect(() => {
    if (pillCirclePhase !== "in") return;
    const t = window.setTimeout(() => {
      setPillCirclePhase((prev) => (prev === "in" ? "settled" : prev));
    }, PILL_CIRCLE_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [pillCirclePhase]);

  // El drawer de controles vive en un portal (fuera del full-screen), así que
  // medimos su caja para el mismo círculo hacia la pill que el mapa/header.
  useLayoutEffect(() => {
    if (!liveOpen || step !== "recording") return;
    if (!isSetup && (sessionLoading || !sessionData)) return;
    const el = controlsDrawerRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setControlsDrawerHeightPx(h);
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [liveOpen, isSetup, open, step, sessionLoading, sessionData, showMap, controlsExpanded]);

  const onControlsSheetPointerDown = useCallback((e: ReactPointerEvent) => {
    const target = e.target;
    if (target instanceof Element) {
      // No iniciar gesto de sheet sobre controles interactivos (Pausa, Conectar, etc.).
      if (target.closest("button, a, input, textarea, select, label, [role='button'], [data-vaul-no-drag]")) {
        sheetDragStartY.current = null;
        return;
      }
    }
    sheetDragStartY.current = e.clientY;
  }, []);

  const onControlsSheetPointerMove = useCallback((e: ReactPointerEvent) => {
    if (sheetDragStartY.current == null) return;
    const dy = sheetDragStartY.current - e.clientY; // >0 = hacia arriba
    if (dy > 28) {
      setControlsExpanded(true);
      sheetDragStartY.current = null;
    } else if (dy < -28) {
      setControlsExpanded(false);
      sheetDragStartY.current = null;
    }
  }, []);

  const onControlsSheetPointerEnd = useCallback(() => {
    sheetDragStartY.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (pillCloseTimerRef.current != null) window.clearTimeout(pillCloseTimerRef.current);
    };
  }, []);

  const requestClose = useCallback(() => {
    if (isSetup) {
      closeLiveRecording();
      return;
    }
    if (pillOrigin && pillCirclePhase && pillCirclePhase !== "out") {
      setPillCirclePhase("out");
      if (pillCloseTimerRef.current != null) window.clearTimeout(pillCloseTimerRef.current);
      pillCloseTimerRef.current = window.setTimeout(() => {
        closeLiveRecording();
      }, PILL_CIRCLE_DURATION_MS);
      return;
    }
    closeLiveRecording();
  }, [isSetup, pillOrigin, pillCirclePhase, closeLiveRecording]);

  const onSelectSetupDiscipline = useCallback((id: string) => {
    setSetupDisciplineId(id);
  }, []);

  const onStartFromIsland = useCallback(async () => {
    if (!setupDisciplineId) return;
    const d = cardioDisciplinas?.find((x) => x.id === setupDisciplineId);
    const titulo = getDefaultCardioTitle(d?.nombre);
    try {
      const id = await startCardioLive.mutateAsync({
        cardio_disciplina_id: setupDisciplineId,
        titulo,
      });
      void startLiveCardio({
        sessionId: id,
        title: titulo,
        startedAtMs: Date.now(),
        wantsLocation: cardioDisciplineUsesGpsMap(d?.codigo ?? null),
      });
      openLiveRecording(id);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e && typeof (e as { message: string }).message === "string"
          ? (e as { message: string }).message
          : e instanceof Error
            ? e.message
            : "Inténtalo de nuevo.";
      toast({ title: "No se pudo iniciar la sesión", description: msg, variant: "destructive" });
    }
  }, [setupDisciplineId, cardioDisciplinas, startCardioLive, openLiveRecording, toast]);

  useEffect(() => {
    if (!sessionData) return;
    const startedAt = sessionData.fecha_inicio ? new Date(sessionData.fecha_inicio) : new Date();
    const fallback = getDefaultCardioTitle(discipline?.nombre, startedAt);
    setSummaryTitulo((t) => t || sessionData.titulo?.trim() || fallback);
  }, [sessionData, discipline?.nombre]);

  useEffect(() => {
    if (!open || step !== "recording") return;
    const id = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [open, step]);

  const computeElapsedSec = useCallback(() => {
    if (!sessionData?.fecha_inicio) return 0;
    const startMs = new Date(sessionData.fecha_inicio).getTime();
    let pauseExtra = pausedMsAccum;
    if (paused && pauseStartedAt.current != null) pauseExtra += Date.now() - pauseStartedAt.current;
    return Math.max(0, Math.floor((Date.now() - startMs - pauseExtra) / 1000));
  }, [sessionData?.fecha_inicio, paused, pausedMsAccum, tick]);

  const elapsedSec = step === "summary" && elapsedSecFrozen != null ? elapsedSecFrozen : computeElapsedSec();
  const displayDistanceM = step === "summary" && distanceFrozenM != null ? distanceFrozenM : distanceM;
  const elevationGainLive = useMemo(() => elevationGainM(points), [points]);
  const displayElevationM =
    step === "summary" && elevationFrozenM != null ? elevationFrozenM : elevationGainLive;

  const cardioTitle = useMemo(() => {
    return (discipline?.nombre?.trim() || sessionData?.titulo?.trim() || "Cardio") as string;
  }, [discipline?.nombre, sessionData?.titulo]);

  // Sync Android Live Update while recording
  useEffect(() => {
    if (!open || !sessionId || !sessionData?.fecha_inicio || step !== "recording") return;
    let pauseExtra = pausedMsAccum;
    if (paused && pauseStartedAt.current != null) {
      pauseExtra += Date.now() - pauseStartedAt.current;
    }
    void updateLiveCardio({
      sessionId,
      title: cardioTitle,
      paused,
      distanceLabel: formatDistanceLabel(distanceM),
      startedAtMs: new Date(sessionData.fecha_inicio).getTime(),
      pausedAccumMs: pauseExtra,
      wantsLocation: cardioDisciplineUsesGpsMap(code),
    });
  }, [
    open,
    sessionId,
    sessionData?.fecha_inicio,
    step,
    paused,
    pausedMsAccum,
    distanceM,
    cardioTitle,
    code,
  ]);

  const onPauseToggle = () => {
    if (paused) {
      if (pauseStartedAt.current != null) {
        const pauseSegmentMs = Date.now() - pauseStartedAt.current;
        pauseStartedAt.current = null;
        setPausedMsAccum((a) => a + pauseSegmentMs);
      }
      setPaused(false);
    } else {
      pauseStartedAt.current = Date.now();
      setPaused(true);
    }
  };

  const onFinishRecording = () => {
    // Leer el tramo de pausa en local antes de tocar el ref (si el updater
    // ve pauseStartedAt=null, Date.now()-null ≈ Date.now() y el tiempo cae a 0).
    let pauseExtra = pausedMsAccum;
    if (paused && pauseStartedAt.current != null) {
      pauseExtra += Date.now() - pauseStartedAt.current;
    }
    setPausedMsAccum(pauseExtra);
    // Seguir en pausa para que "Volver" no reanude el cronómetro.
    pauseStartedAt.current = Date.now();
    setPaused(true);

    const startMs = sessionData?.fecha_inicio
      ? new Date(sessionData.fecha_inicio).getTime()
      : Date.now();
    setElapsedSecFrozen(Math.max(0, Math.floor((Date.now() - startMs - pauseExtra) / 1000)));
    setDistanceFrozenM(distanceM);
    setElevationFrozenM(elevationGainM(points));
    setStep("summary");
    void updateLiveCardio({
      sessionId: sessionId!,
      title: cardioTitle,
      paused: true,
      distanceLabel: formatDistanceLabel(distanceM),
      wantsLocation: cardioDisciplineUsesGpsMap(code),
      startedAtMs: startMs,
      pausedAccumMs: pauseExtra,
    });
  };

  const openManualEditor = () => {
    if (!sessionId) return;
    closeLiveRecording();
    openEdit(sessionId);
  };

  const buildSportDetail = (): CardioSportDetailInput => {
    if (code === "running") return { disciplina_codigo: "running", running: {} };
    if (code === "cycling") return { disciplina_codigo: "cycling", cycling: {} };
    if (code && code !== "running" && code !== "cycling") {
      return { disciplina_codigo: code as Exclude<CardioDisciplineCode, "running" | "cycling"> };
    }
    return { disciplina_codigo: "other" };
  };

  const onHrConnectClick = () => {
    if (!hrAvailable) {
      toast({
        title: "Solo en la app Android",
        description: "La FC en vivo vía Bluetooth requiere la app nativa.",
      });
      return;
    }
    if (hrConnected) {
      void disconnectHr();
      return;
    }
    if (hrConnection === "disconnected" || hrDeviceName) {
      void reconnectHr();
      return;
    }
    void connectHr();
  };

  const onSaveSummary = async () => {
    if (!sessionId || !sessionData?.fecha_inicio) return;
    const startedAt = new Date(sessionData.fecha_inicio);
    const titulo =
      summaryTitulo.trim() ||
      getDefaultCardioTitle(discipline?.nombre, Number.isNaN(startedAt.getTime()) ? undefined : startedAt);

    const trackPoints: CardioTrackPointInput[] = points.map((p, idx) => {
      const ts = p.timestamp_utc ? Date.parse(p.timestamp_utc) : NaN;
      const fc = Number.isFinite(ts) ? nearestHeartRate(hrSamples, ts) : null;
      return {
        orden: idx,
        lat: p.lat,
        lng: p.lng,
        elevacion_m: p.elevacion_m ?? null,
        timestamp_utc: p.timestamp_utc,
        velocidad_m_s: null,
        fc,
        cadencia: null,
        potencia_w: null,
      };
    });

    const dur = elapsedSecFrozen ?? elapsedSec;
    const dist = distanceFrozenM ?? distanceM;
    const elevGain = elevationFrozenM ?? elevationGainM(points);

    const track =
      cardioDisciplineUsesGpsMap(code) && trackPoints.length > 0
        ? {
            fuente: "gps-web",
            distancia_total_m: Math.round(dist * 10) / 10,
            duracion_total_seg: dur,
            elevacion_positiva_m: Math.round(elevGain * 10) / 10,
            puntos: trackPoints,
          }
        : null;

    try {
      await upsert.mutateAsync({
        id: sessionId,
        input: {
          titulo,
          fecha_inicio: sessionData.fecha_inicio,
          fecha_fin: new Date().toISOString(),
          comentarios: summaryComentarios.trim() || null,
          cardio_disciplina_id: sessionData.cardio_disciplina_id ?? null,
          sport_detail: buildSportDetail(),
          track,
          bloques: [
            {
              tipo_bloque: "work",
              distancia_m: Math.round(dist * 10) / 10,
              duracion_seg: dur,
              elevacion_m: Math.round(elevGain * 10) / 10,
              fc_media: fcMedia,
              fc_max: fcMax,
              calorias: null,
            },
          ],
          es_publica: esPublica,
        },
      });
      clearDraft();
      clearHrSamples();
      void disconnectHr();
      void stopLiveCardio();
      closeLiveRecording();
      toast({ title: "Entrenamiento guardado" });
    } catch {
      toast({ title: "No se pudo guardar", variant: "destructive" });
    }
  };

  const onDiscardSession = async () => {
    if (!sessionId) return;
    try {
      await deleteSession.mutateAsync(sessionId);
      clearDraft();
      clearHrSamples();
      void disconnectHr();
      void stopLiveCardio();
      setConfirmDiscard(false);
      closeLiveRecording();
      toast({ title: "Entrenamiento descartado" });
    } catch {
      toast({ title: "No se pudo descartar", variant: "destructive" });
    }
  };

  // Variables del círculo en el DOM (drawer portaleado; no hereda el clip del full-screen).
  useLayoutEffect(() => {
    if (!open || step !== "recording") return;
    const el = controlsDrawerRef.current;
    if (!el || !pillOrigin || !pillCirclePhase) return;

    if (pillCirclePhase === "settled") {
      el.style.clipPath = "none";
      return;
    }

    const styles = pillCircleTransitionStyleForBottomSheet(
      pillOrigin,
      0.48,
      pillCirclePhase,
      controlsDrawerHeightPx > 0 ? controlsDrawerHeightPx : undefined,
    );
    for (const [key, value] of Object.entries(styles)) {
      if (value == null) continue;
      el.style.setProperty(key, String(value));
    }
  }, [open, step, pillOrigin, pillCirclePhase, controlsDrawerHeightPx]);

  if (!liveOpen) return null;

  const loadingSession = open && (sessionLoading || !sessionData);
  const recordingMap = open && cardioDisciplineUsesGpsMap(code);
  /** Mapa visible en setup y mientras hay sesión GPS (evita remount al iniciar). */
  const showGpsSurface = isSetup || recordingMap || (open && loadingSession && step === "recording");

  const pillCircleProps =
    open && pillOrigin && pillCirclePhase
      ? {
          "data-pill-circle": pillCirclePhase,
          ...(pillCirclePhase !== "settled"
            ? {
                "transition-style": pillCircleTransitionAttr(pillCirclePhase),
                style: pillCircleTransitionStyle(pillOrigin, pillCirclePhase),
              }
            : { style: { clipPath: "none" } }),
        }
      : {};

  // Misma animación en el drawer portaleado bajo el mapa.
  const controlsDrawerPillProps =
    open && pillOrigin && pillCirclePhase
      ? {
          "data-open-from-pill": true as const,
          "data-pill-circle": pillCirclePhase,
          ...(pillCirclePhase !== "settled"
            ? { "transition-style": pillCircleTransitionAttr(pillCirclePhase) }
            : {}),
        }
      : {};

  const headerTitle =
    open && sessionData
      ? discipline?.nombre?.trim() || sessionData.titulo || "Cardio"
      : "Cardio";
  const mapPoints = isSetup || loadingSession ? [] : points;
  const showGpsErrorUi =
    open && recordingMap && !loadingSession && (gpsDenied || (gpsError && !points.length));
  const wantsGpsBanner =
    (isSetup &&
      (setupDisciplineId == null || cardioDisciplineUsesGpsMap(setupDisciplineCodigo))) ||
    (open && recordingMap && !loadingSession);
  const showNoGpsBanner =
    wantsGpsBanner && (gpsDenied || Boolean(gpsError) || !gpsHasFix);
  const noGpsBannerText = gpsDenied
    ? "Sin señal GPS · permiso denegado"
    : "Sin señal GPS";

  return (
    <>
    <div className="fixed inset-0 z-100 flex flex-col bg-card text-card-foreground" {...pillCircleProps}>
      {step === "summary" && open && !loadingSession ? (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Resumen</p>
            <p className="mt-2 font-mono text-lg tabular-nums">
              {formatDuration(elapsedSec)} · {formatDistanceM(displayDistanceM)} · ↑{formatElevationM(displayElevationM)}
            </p>
            {fcMedia != null || fcMax != null ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums">
                <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <Heart className="h-3.5 w-3.5" />
                  {fcMedia != null ? (
                    <span>
                      Media <span className="font-semibold">{fcMedia}</span> bpm
                    </span>
                  ) : null}
                </span>
                {fcMax != null ? (
                  <span className="text-muted-foreground">
                    Máx <span className="font-semibold text-foreground">{fcMax}</span> bpm
                  </span>
                ) : null}
              </p>
            ) : null}
            {recordingMap && points.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Sin puntos GPS; se guardará solo tiempo y título.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardio-live-titulo">Título</Label>
            <Input id="cardio-live-titulo" value={summaryTitulo} onChange={(e) => setSummaryTitulo(e.target.value)} className="h-12 rounded-xl" placeholder="Ej. Ciclismo de tarde" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardio-live-comentarios">Comentarios (opcional)</Label>
            <Textarea
              id="cardio-live-comentarios"
              value={summaryComentarios}
              onChange={(e) => setSummaryComentarios(e.target.value)}
              className="min-h-22 rounded-xl resize-none"
              placeholder="Sensaciones, clima…"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium">Publicar en comunidad</p>
              <p className="text-[12px] text-muted-foreground">
                {esPublica
                  ? "Este entreno se verá en el feed público."
                  : "Este entreno se mantendrá privado."}
              </p>
            </div>
            <Switch
              checked={esPublica}
              onCheckedChange={setEsPublica}
              aria-label="Publicar en comunidad"
            />
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              className="rounded-xl font-semibold shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0"
              disabled={upsert.isPending || deleteSession.isPending}
              onClick={() => void onSaveSummary()}
            >
              {upsert.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar entrenamiento
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              disabled={deleteSession.isPending || upsert.isPending}
              onClick={() => setConfirmDiscard(true)}
            >
              Descartar
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep("recording")}>
              Volver
            </Button>
          </div>
        </div>
      ) : (
        <>
          {showGpsSurface ? (
            <div className="relative min-h-0 flex-1 w-full bg-muted/30">
              {showGpsErrorUi ? (
                <div className="flex h-full min-h-50 flex-col items-center justify-center gap-3 p-6 text-center">
                  <MapPin className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {gpsDenied
                      ? "Permiso de ubicación denegado. Puedes seguir con el cronómetro o abrir el formulario manual."
                      : gpsError || "No se pudo obtener el GPS."}
                  </p>
                  <Button type="button" variant="secondary" className="rounded-xl" onClick={openManualEditor}>
                    Formulario manual
                  </Button>
                </div>
              ) : (
                <Suspense fallback={<div className="h-full min-h-dvh w-full bg-[#23292b]" />}>
                  <LiveCardioMap points={mapPoints} followUser className="h-full min-h-dvh w-full" />
                </Suspense>
              )}
              {isSetup ? (
                <CardioDisciplineIsland
                  selectedId={setupDisciplineId}
                  preferredId={lastDisciplineId ?? null}
                  onSelect={onSelectSetupDiscipline}
                />
              ) : null}
              {loadingSession ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-card/30">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[28vh] flex-1 flex-col items-center justify-center gap-2 border-b border-border bg-muted/20 p-6">
              {loadingSession ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Modo interior: cronómetro y finalizar. Puedes editar detalles al terminar.
                </p>
              )}
            </div>
          )}

          {(isSetup || (open && !loadingSession)) ? (
          <>
          <div
            className="pointer-events-none fixed inset-x-0 z-115 px-3"
            style={{
              bottom: `${Math.max(controlsDrawerHeightPx, 96) + 12}px`,
            }}
          >
            <div
              className={cn(
                "mx-auto flex max-w-lg flex-col overflow-hidden rounded-[1.75rem]",
                "border border-border/80 bg-card/95 shadow-lg backdrop-blur-xl",
              )}
            >
              {showNoGpsBanner ? (
                <p className="border-b border-red-500/25 bg-red-500/15 px-3 py-1.5 text-center text-[11px] font-semibold tracking-wide text-red-600 dark:text-red-400">
                  {noGpsBannerText}
                </p>
              ) : null}
              <div className="flex items-stretch gap-1 p-1.5">
                {(
                  [
                    {
                      key: "time",
                      label: "Tiempo",
                      value: formatDuration(isSetup ? 0 : elapsedSec),
                    },
                    {
                      key: "distance",
                      label: "Distancia",
                      value: formatDistanceM(isSetup ? 0 : displayDistanceM),
                    },
                    {
                      key: "elevation",
                      label: "Elevación",
                      value: formatElevationM(isSetup ? 0 : displayElevationM),
                    },
                  ] as const
                ).map((metric, index) => (
                  <div
                    key={metric.key}
                    className={cn(
                      "min-w-0 flex-1 px-2 py-2 text-center",
                      index > 0 && "border-l border-border/60",
                    )}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-lg font-semibold tabular-nums sm:text-xl">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Drawer
            open
            modal={false}
            dismissible={false}
            handleOnly
            onOpenChange={(next) => {
              if (!next) requestClose();
            }}
          >
            <DrawerContent
              ref={controlsDrawerRef}
              side="bottom"
              className="z-110 mt-0 max-h-[85lvh] overflow-hidden bg-card p-0 transition-[height] duration-300 ease-out"
              overlayClassName="z-110 pointer-events-none bg-transparent backdrop-blur-none dark:bg-transparent dark:backdrop-blur-none"
              {...controlsDrawerPillProps}
            >
              <div
                className="touch-pan-x"
                onPointerDownCapture={onControlsSheetPointerDown}
                onPointerMoveCapture={onControlsSheetPointerMove}
                onPointerUpCapture={onControlsSheetPointerEnd}
                onPointerCancelCapture={onControlsSheetPointerEnd}
                onDoubleClick={() => setControlsExpanded((v) => !v)}
              >
              <div className="shrink-0">
                <DrawerHeader className="gap-0 px-0 pb-0 pt-2.5">
                  <DrawerTitle className="sr-only">{headerTitle} — controles de grabación</DrawerTitle>
                </DrawerHeader>
                <div
                  className={cn(
                    "space-y-4 bg-card px-4",
                    controlsExpanded ? "pb-4" : "pb-[max(1rem,env(safe-area-inset-bottom))]",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {isSetup ? (
                      <Button
                        type="button"
                        size="lg"
                        className="h-14 w-14 rounded-full p-0 shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0"
                        disabled={!setupDisciplineId || startCardioLive.isPending}
                        onClick={() => void onStartFromIsland()}
                        aria-label="Iniciar entrenamiento"
                      >
                        {startCardioLive.isPending ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Play className="h-6 w-6 fill-current" />
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="lg"
                          variant="secondary"
                          className={cn("h-11 min-w-30 rounded-full gap-2 px-8 shadow-none", paused && "border-sky-500/50")}
                          onClick={onPauseToggle}
                        >
                          {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                          {paused ? "Reanudar" : "Pausa"}
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          className="h-11 min-w-30 rounded-full gap-2 px-8 shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0"
                          onClick={onFinishRecording}
                        >
                          <Square className="h-4 w-4 fill-current" />
                          Finalizar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  controlsExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="space-y-4 bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <div className="rounded-2xl border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                            hrConnected ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Heart className={cn("h-5 w-5", hrConnected && bpm != null && "animate-pulse")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pulsaciones</p>
                          <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums">
                            {hrConnected && bpm != null ? (
                              <>
                                {bpm}
                                <span className="ml-1 text-sm font-medium text-muted-foreground">bpm</span>
                              </>
                            ) : hrConnecting ? (
                              <span className="text-base font-medium text-muted-foreground">Conectando…</span>
                            ) : hrConnection === "disconnected" ? (
                              <span className="text-base font-medium text-amber-600 dark:text-amber-400">Sin señal</span>
                            ) : (
                              <span className="text-base font-medium text-muted-foreground">—</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {hrConnected && hrDeviceName
                              ? `${hrDeviceName}${hrZone != null ? ` · Zona ${hrZone}` : ""}`
                              : hrDeviceName
                                ? hrDeviceName
                                : "Sensor Bluetooth"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="shrink-0 rounded-full gap-1.5"
                          disabled={hrConnecting}
                          onClick={onHrConnectClick}
                        >
                          {hrConnecting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Bluetooth className="h-3.5 w-3.5" />
                          )}
                          {hrConnected ? "Desconectar" : hrConnection === "disconnected" || hrDeviceName ? "Reconectar" : "Conectar"}
                        </Button>
                      </div>
                      {hrError ? <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{hrError}</p> : null}
                    </div>

                    {!isSetup ? (
                      <button
                        type="button"
                        className="block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                        onClick={openManualEditor}
                      >
                        Registrar o editar en formulario manual
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              </div>
            </DrawerContent>
          </Drawer>
          </>
          ) : null}
        </>
      )}
    </div>

    <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
      {/* Por encima del full-screen del grabador (z-100); el portal default es z-50. */}
      <AlertDialogContent className="z-110" overlayClassName="z-110">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Descartar este entrenamiento?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará la sesión y no se podrá recuperar. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSession.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteSession.isPending}
            onClick={(e) => {
              e.preventDefault();
              void onDiscardSession();
            }}
          >
            {deleteSession.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

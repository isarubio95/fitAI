import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bluetooth, Heart, Loader2, MapPin, Pause, Play, Square } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useCardioGpsRecorder } from "@/hooks/useCardioGpsRecorder";
import { useCardioSessionById, useDeleteCardioSession, useUpsertCardioSession } from "@/hooks/useCardioSessions";
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

/** Fallback de snaps (fracción de viewport) hasta medir alturas reales en px. */
const CONTROLS_SNAP_FALLBACK: (number | string)[] = [0.38, 0.58];

function firstNested<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function CardioLiveRecorder() {
  const { state, closeLiveRecording, openEdit } = useGlobalCardioDrawer();
  const sessionId = state.liveSessionId;
  const open = state.liveOpen && !!sessionId;
  const pillOrigin = state.pillOrigin;

  const { toast } = useToast();
  const upsert = useUpsertCardioSession();
  const deleteSession = useDeleteCardioSession();
  const { data: sessionData, isLoading: sessionLoading } = useCardioSessionById(open ? sessionId : null);

  const [step, setStep] = useState<"recording" | "summary">("recording");
  const [paused, setPaused] = useState(false);
  const [pausedMsAccum, setPausedMsAccum] = useState(0);
  const pauseStartedAt = useRef<number | null>(null);
  const [tick, setTick] = useState(0);
  const [elapsedSecFrozen, setElapsedSecFrozen] = useState<number | null>(null);
  const [distanceFrozenM, setDistanceFrozenM] = useState<number | null>(null);

  const [summaryTitulo, setSummaryTitulo] = useState("");
  const [summaryComentarios, setSummaryComentarios] = useState("");
  const [esPublica, setEsPublica] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [pillCirclePhase, setPillCirclePhase] = useState<PillCirclePhase | null>(null);
  const pillCloseTimerRef = useRef<number | null>(null);
  const controlsDrawerRef = useRef<HTMLDivElement | null>(null);
  const [controlsDrawerHeightPx, setControlsDrawerHeightPx] = useState(0);
  /** Snap compacto (métricas + controles) vs expandido (+ pulsaciones + formulario). */
  const compactSectionRef = useRef<HTMLDivElement | null>(null);
  const expandedSectionRef = useRef<HTMLDivElement | null>(null);
  /** Vaul exige snaps desde el primer paint + DrawerContent con h-full (transform). */
  const [controlsSnapPoints, setControlsSnapPoints] = useState<(number | string)[]>(CONTROLS_SNAP_FALLBACK);
  const [activeControlsSnap, setActiveControlsSnap] = useState<number | string | null>(CONTROLS_SNAP_FALLBACK[0]!);
  const controlsSnapPointsRef = useRef<(number | string)[]>(CONTROLS_SNAP_FALLBACK);
  const controlsExpandedIndexRef = useRef(0);

  const discipline = firstNested(sessionData?.cardio_disciplina);
  const code = discipline?.codigo ?? null;
  const showMap = cardioDisciplineUsesGpsMap(code);

  const gpsRecording = open && step === "recording" && showMap && !paused;
  const { points, distanceM, error: gpsError, denied: gpsDenied, clearDraft } = useCardioGpsRecorder({
    sessionId: open ? sessionId : null,
    recording: gpsRecording,
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
    enabled: open,
  });
  useEffect(() => {
    if (!open) {
      setStep("recording");
      setPaused(false);
      setPausedMsAccum(0);
      pauseStartedAt.current = null;
      setElapsedSecFrozen(null);
      setDistanceFrozenM(null);
      setSummaryTitulo("");
      setSummaryComentarios("");
      setEsPublica(false);
      setConfirmDiscard(false);
      setPillCirclePhase(null);
      setControlsDrawerHeightPx(0);
      setControlsSnapPoints(CONTROLS_SNAP_FALLBACK);
      setActiveControlsSnap(CONTROLS_SNAP_FALLBACK[0]!);
      controlsSnapPointsRef.current = CONTROLS_SNAP_FALLBACK;
      controlsExpandedIndexRef.current = 0;
      if (pillCloseTimerRef.current != null) {
        window.clearTimeout(pillCloseTimerRef.current);
        pillCloseTimerRef.current = null;
      }
    }
  }, [open]);

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
    if (!open || step !== "recording") return;
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
  }, [open, step, sessionLoading, showMap, activeControlsSnap, controlsSnapPoints]);

  // Alturas naturales del bloque compacto y del expandido → snap points en px.
  // Vaul posiciona con translateY asumiendo sheet a altura de viewport (hace falta h-full).
  useLayoutEffect(() => {
    if (!open || step !== "recording" || sessionLoading) return;
    const compactEl = compactSectionRef.current;
    const expandedEl = expandedSectionRef.current;
    if (!compactEl || !expandedEl) return;

    const measureSnaps = () => {
      const compactH = Math.ceil(compactEl.getBoundingClientRect().height);
      const expandedExtraH = Math.ceil(expandedEl.getBoundingClientRect().height);
      if (compactH <= 0 || expandedExtraH <= 0) return;

      // Expanded usa margin-top negativo para solapar el safe-area del compacto.
      const expandedMarginTop = Number.parseFloat(getComputedStyle(expandedEl).marginTop) || 0;
      const expandedSnapH = Math.ceil(compactH + expandedExtraH + expandedMarginTop);
      const next: (number | string)[] = [`${compactH}px`, `${Math.max(compactH + 1, expandedSnapH)}px`];

      setControlsSnapPoints((prev) => {
        if (prev.length === 2 && prev[0] === next[0] && prev[1] === next[1]) return prev;
        return next;
      });
      controlsSnapPointsRef.current = next;

      const preferExpanded = controlsExpandedIndexRef.current === 1;
      const nextActive = preferExpanded ? next[1]! : next[0]!;
      setActiveControlsSnap(nextActive);
    };

    measureSnaps();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureSnaps) : null;
    ro?.observe(compactEl);
    ro?.observe(expandedEl);
    return () => ro?.disconnect();
  }, [open, step, sessionLoading, showMap, gpsError, hrError, hrConnected, hrConnecting, hrConnection]);

  const onControlsSnapPointChange = useCallback((snap: number | string | null) => {
    setActiveControlsSnap(snap);
    const idx = snap == null ? 0 : controlsSnapPointsRef.current.indexOf(snap);
    controlsExpandedIndexRef.current = idx === 1 ? 1 : 0;
  }, []);

  useEffect(() => {
    return () => {
      if (pillCloseTimerRef.current != null) window.clearTimeout(pillCloseTimerRef.current);
    };
  }, []);

  const requestClose = useCallback(() => {
    if (pillOrigin && pillCirclePhase && pillCirclePhase !== "out") {
      setPillCirclePhase("out");
      if (pillCloseTimerRef.current != null) window.clearTimeout(pillCloseTimerRef.current);
      pillCloseTimerRef.current = window.setTimeout(() => {
        closeLiveRecording();
      }, PILL_CIRCLE_DURATION_MS);
      return;
    }
    closeLiveRecording();
  }, [pillOrigin, pillCirclePhase, closeLiveRecording]);

  useEffect(() => {
    if (!sessionData) return;
    const startedAt = sessionData.fecha_inicio ? new Date(sessionData.fecha_inicio) : new Date();
    const fallback = getDefaultCardioTitle(discipline?.nombre, startedAt);
    setSummaryTitulo((t) => t || sessionData.titulo?.trim() || fallback);
  }, [sessionData, discipline?.nombre]);

  useEffect(() => {
    if (step !== "recording") return;
    const id = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  const computeElapsedSec = useCallback(() => {
    if (!sessionData?.fecha_inicio) return 0;
    const startMs = new Date(sessionData.fecha_inicio).getTime();
    let pauseExtra = pausedMsAccum;
    if (paused && pauseStartedAt.current != null) pauseExtra += Date.now() - pauseStartedAt.current;
    return Math.max(0, Math.floor((Date.now() - startMs - pauseExtra) / 1000));
  }, [sessionData?.fecha_inicio, paused, pausedMsAccum, tick]);

  const elapsedSec = step === "summary" && elapsedSecFrozen != null ? elapsedSecFrozen : computeElapsedSec();
  const displayDistanceM = step === "summary" && distanceFrozenM != null ? distanceFrozenM : distanceM;

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
      wantsLocation: showMap,
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
    showMap,
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
    setStep("summary");
    void updateLiveCardio({
      sessionId: sessionId!,
      title: cardioTitle,
      paused: true,
      distanceLabel: formatDistanceLabel(distanceM),
      wantsLocation: showMap,
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

    const track =
      showMap && trackPoints.length > 0
        ? {
            fuente: "gps-web",
            distancia_total_m: Math.round(dist * 10) / 10,
            duracion_total_seg: dur,
            elevacion_positiva_m: null as number | null,
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
              elevacion_m: null,
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

  // Variables del círculo en el DOM sin tocar style.transform (snaps de Vaul).
  useLayoutEffect(() => {
    if (!open || step !== "recording") return;
    const el = controlsDrawerRef.current;
    if (!el || !pillOrigin || !pillCirclePhase) return;

    if (pillCirclePhase === "settled") {
      el.style.clipPath = "none";
      // Reafirmar el snap activo por si un re-render borró el translate de Vaul.
      const snap = controlsSnapPointsRef.current[controlsExpandedIndexRef.current] ?? controlsSnapPointsRef.current[0];
      if (snap != null) {
        setActiveControlsSnap(snap);
      }
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

  if (!open || !sessionId) return null;

  const pillCircleProps =
    pillOrigin && pillCirclePhase
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

  // Misma animación en el drawer portaleado bajo el mapa (Vaul no hereda el clip del full-screen).
  // No pasamos `style` por React: sobrescribe el transform de los snap points de Vaul.
  const controlsDrawerPillProps =
    pillOrigin && pillCirclePhase
      ? {
          "data-open-from-pill": true as const,
          "data-pill-circle": pillCirclePhase,
          ...(pillCirclePhase !== "settled"
            ? { "transition-style": pillCircleTransitionAttr(pillCirclePhase) }
            : {}),
        }
      : {};

  const loading = sessionLoading || !sessionData;
  const headerTitle = !loading
    ? discipline?.nombre?.trim() || sessionData.titulo || "Cardio"
    : "Cardio";

  return (
    <>
    <div className="fixed inset-0 z-100 flex flex-col bg-card text-card-foreground" {...pillCircleProps}>
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando sesión…</p>
        </div>
      ) : (
        <>
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Button type="button" size="icon" variant="ghost" className="shrink-0 rounded-full" onClick={requestClose} aria-label="Minimizar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{headerTitle}</p>
          <p className="text-xs text-muted-foreground">{step === "recording" ? "Grabación" : "Resumen"}</p>
        </div>
      </header>

      {step === "recording" ? (
        <>
          {showMap ? (
            <div className="relative min-h-[38vh] flex-1 w-full bg-muted/30">
              {gpsDenied || (gpsError && !points.length) ? (
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
                <Suspense fallback={<div className="h-full min-h-55 w-full bg-[#23292b]" />}>
                  <LiveCardioMap points={points} followUser className="h-full min-h-55 w-full" />
                </Suspense>
              )}
            </div>
          ) : (
            <div className="flex min-h-[28vh] flex-1 flex-col items-center justify-center gap-2 border-b border-border bg-muted/20 p-6">
              <p className="text-center text-sm text-muted-foreground">Modo interior: cronómetro y finalizar. Puedes editar detalles al terminar.</p>
            </div>
          )}

          <Drawer
            open
            modal={false}
            dismissible={false}
            handleOnly
            snapPoints={controlsSnapPoints}
            activeSnapPoint={activeControlsSnap}
            setActiveSnapPoint={onControlsSnapPointChange}
            fadeFromIndex={1}
            onOpenChange={(next) => {
              if (!next) requestClose();
            }}
          >
            <DrawerContent
              ref={controlsDrawerRef}
              side="bottom"
              className="z-110 mt-0 h-full max-h-dvh overflow-hidden bg-card p-0"
              overlayClassName="z-110 pointer-events-none bg-transparent backdrop-blur-none dark:bg-transparent dark:backdrop-blur-none"
              {...controlsDrawerPillProps}
            >
              <div ref={compactSectionRef} className="shrink-0">
                <DrawerHeader className="gap-0 px-0 pb-0 pt-2.5">
                  <DrawerTitle className="sr-only">{headerTitle} — controles de grabación</DrawerTitle>
                </DrawerHeader>
                <div className="space-y-4 bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  {showMap && gpsError && points.length > 0 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400">{gpsError}</p>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tiempo</p>
                      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{formatDuration(elapsedSec)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Distancia</p>
                      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{formatDistanceM(displayDistanceM)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
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
                  </div>
                </div>
              </div>

              <div
                ref={expandedSectionRef}
                className="shrink-0 space-y-4 bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 -mt-[max(1rem,env(safe-area-inset-bottom))]"
              >
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

                <button type="button" className="block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={openManualEditor}>
                  Registrar o editar en formulario manual
                </button>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Resumen</p>
            <p className="mt-2 font-mono text-lg tabular-nums">
              {formatDuration(elapsedSec)} · {formatDistanceM(displayDistanceM)}
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
            {showMap && points.length === 0 ? (
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
      )}
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

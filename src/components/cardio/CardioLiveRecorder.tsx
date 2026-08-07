import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { LiveMetricsBar } from "@/components/cardio/live/LiveMetricsBar";
import { LiveRecordingSurface } from "@/components/cardio/live/LiveRecordingSurface";
import { LiveControlsDrawer } from "@/components/cardio/live/LiveControlsDrawer";
import { LiveStatsFullscreen } from "@/components/cardio/live/LiveStatsFullscreen";
import { CardioLiveSummaryView } from "@/components/cardio/live/CardioLiveSummaryView";
import { DiscardSessionDialog } from "@/components/cardio/live/DiscardSessionDialog";
import { SavedRoutesPickerSheet } from "@/components/cardio/SavedRoutesPickerSheet";
import { App } from "@capacitor/app";
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
import { elevationGainM } from "@/lib/cardioFormat";
import { shouldAutoPause, shouldAutoResume, readCardioAutoPauseEnabled, writeCardioAutoPauseEnabled } from "@/lib/cardioGpsMotion";
import { MAX_TRACK_POINTS_DB, prepareTrackPointsForStorage } from "@/lib/cardioTrackPoints";
import { computeRouteProgress } from "@/lib/cardioRouteProgress";
import { cardioDisciplineUsesGpsMap } from "@/lib/cardioLiveMap";
import { getDefaultCardioTitle } from "@/lib/defaultWorkoutTitle";
import { firstNested } from "@/lib/firstNested";
import { nearestHeartRate, summarizeHeartRate, type HeartRateSample } from "@/lib/heartRateMetrics";
import {
  appendHealthConnectFuente,
  hasHrPermission,
  readHeartRateSamples,
} from "@/lib/healthConnectHr";
import {
  PILL_CIRCLE_DURATION_MS,
  pillCircleTransitionAttr,
  pillCircleTransitionStyle,
  pillCircleTransitionStyleForBottomSheet,
  type PillCirclePhase,
} from "@/lib/pillCircleTransition";
import {
  formatDistanceLabel,
  startLiveCardio,
  stopLiveCardio,
  updateLiveCardio,
} from "@/lib/liveSessionNotifications";
import type { CardioDisciplineCode, CardioSportDetailInput, CardioTrackPointInput, SelectedCardioRoute } from "@/types/cardio";

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
  /** Origen de la pausa actual; null si no está en pausa. */
  const [pauseSource, setPauseSource] = useState<"manual" | "auto" | null>(null);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
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
  const [statsOpen, setStatsOpen] = useState(false);
  const sheetDragStartY = useRef<number | null>(null);
  const [setupDisciplineId, setSetupDisciplineId] = useState<string | null>(null);
  /** Samples HC prefetchados al entrar en resumen (si no hubo BLE). */
  const [hcSamples, setHcSamples] = useState<HeartRateSample[]>([]);
  const hcPrefetchGen = useRef(0);
  const [selectedRoute, setSelectedRoute] = useState<SelectedCardioRoute | null>(null);
  const [routesPickerOpen, setRoutesPickerOpen] = useState(false);

  useEffect(() => {
    setAutoPauseEnabled(readCardioAutoPauseEnabled());
  }, []);

  const onAutoPauseEnabledChange = useCallback((enabled: boolean) => {
    setAutoPauseEnabled(enabled);
    writeCardioAutoPauseEnabled(enabled);
    // Si se desactiva con una autopausa en curso, exige reanudación manual.
    if (!enabled) {
      setPauseSource((src) => (src === "auto" ? "manual" : src));
    }
  }, []);

  const discipline = firstNested(sessionData?.cardio_disciplina);
  const code = discipline?.codigo ?? null;
  const setupDisciplineCodigo =
    cardioDisciplinas?.find((d) => d.id === setupDisciplineId)?.codigo ?? null;
  const showMap = isSetup || cardioDisciplineUsesGpsMap(code);

  const gpsRecording = open && step === "recording" && cardioDisciplineUsesGpsMap(code) && !paused;
  const gpsPreview =
    isSetup || (open && step === "recording" && cardioDisciplineUsesGpsMap(code));
  const {
    points,
    distanceM,
    error: gpsError,
    denied: gpsDenied,
    hasFix: gpsHasFix,
    motion: gpsMotion,
    clearDraft,
  } = useCardioGpsRecorder({
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
      setPauseSource(null);
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
      setStatsOpen(false);
      sheetDragStartY.current = null;
      setSetupDisciplineId(null);
      setSelectedRoute(null);
      setRoutesPickerOpen(false);
      setHcSamples([]);
      hcPrefetchGen.current += 1;
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

  // Prefetch FC desde Health Connect al entrar en resumen si no hubo BLE.
  useEffect(() => {
    if (step !== "summary" || !sessionData?.fecha_inicio) return;
    if (hrSamples.length > 0) {
      setHcSamples([]);
      return;
    }

    const startMs = Date.parse(sessionData.fecha_inicio);
    if (!Number.isFinite(startMs)) return;
    const endMs = Date.now();
    const gen = ++hcPrefetchGen.current;

    void (async () => {
      const permitted = await hasHrPermission();
      if (!permitted || gen !== hcPrefetchGen.current) return;
      const samples = await readHeartRateSamples(startMs, endMs);
      if (gen !== hcPrefetchGen.current) return;
      setHcSamples(samples);
    })();
  }, [step, sessionData?.fecha_inicio, hrSamples.length]);

  const { fcMedia: displayFcMedia, fcMax: displayFcMax } = useMemo(
    () => (hrSamples.length > 0 ? { fcMedia, fcMax } : summarizeHeartRate(hcSamples)),
    [hrSamples.length, fcMedia, fcMax, hcSamples],
  );

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

  const routeProgress = useMemo(() => {
    if (!selectedRoute?.points?.length) return null;
    const last = points.length > 0 ? points[points.length - 1] : null;
    return computeRouteProgress(selectedRoute.points, last);
  }, [selectedRoute, points]);

  const showRoutePickerBtn =
    isSetup &&
    (setupDisciplineId == null || cardioDisciplineUsesGpsMap(setupDisciplineCodigo));

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

  const resumeRecording = useCallback(() => {
    if (pauseStartedAt.current != null) {
      const pauseSegmentMs = Date.now() - pauseStartedAt.current;
      pauseStartedAt.current = null;
      setPausedMsAccum((a) => a + pauseSegmentMs);
    }
    setPauseSource(null);
    setPaused(false);
  }, []);

  const pauseRecording = useCallback((source: "manual" | "auto") => {
    pauseStartedAt.current = Date.now();
    setPauseSource(source);
    setPaused(true);
  }, []);

  const onPauseToggle = () => {
    if (paused) {
      resumeRecording();
    } else {
      pauseRecording("manual");
    }
  };

  // Autopausa / reanudación por GPS (solo disciplinas con mapa).
  useEffect(() => {
    if (!autoPauseEnabled) return;
    if (!open || step !== "recording" || !cardioDisciplineUsesGpsMap(code)) return;
    if (!sessionData?.fecha_inicio) return;
    const startedAtMs = new Date(sessionData.fecha_inicio).getTime();
    if (!Number.isFinite(startedAtMs)) return;
    const now = Date.now();

    if (
      !paused &&
      shouldAutoPause({
        hasFix: gpsHasFix,
        isStationary: gpsMotion.isStationary,
        stationaryMs: gpsMotion.stationaryMs,
        recordingStartedAtMs: startedAtMs,
        now,
      })
    ) {
      pauseRecording("auto");
      return;
    }

    if (
      paused &&
      shouldAutoResume({
        hasFix: gpsHasFix,
        isMoving: gpsMotion.isMoving,
        movingMs: gpsMotion.movingMs,
        pauseSource,
      })
    ) {
      resumeRecording();
    }
  }, [
    autoPauseEnabled,
    open,
    step,
    code,
    sessionData?.fecha_inicio,
    paused,
    pauseSource,
    gpsHasFix,
    gpsMotion.isStationary,
    gpsMotion.stationaryMs,
    gpsMotion.isMoving,
    gpsMotion.movingMs,
    pauseRecording,
    resumeRecording,
  ]);

  useEffect(() => {
    if (!statsOpen) return;
    let handle: { remove: () => Promise<void> } | undefined;
    void App.addListener("backButton", () => {
      setStatsOpen(false);
    }).then((h) => {
      handle = h;
    });
    return () => {
      void handle?.remove();
    };
  }, [statsOpen]);

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
    setPauseSource(null);
    setPaused(true);

    const startMs = sessionData?.fecha_inicio
      ? new Date(sessionData.fecha_inicio).getTime()
      : Date.now();
    setElapsedSecFrozen(Math.max(0, Math.floor((Date.now() - startMs - pauseExtra) / 1000)));
    setDistanceFrozenM(distanceM);
    setElevationFrozenM(elevationGainM(points));
    setStatsOpen(false);
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

    const startMs = Date.parse(sessionData.fecha_inicio);
    const endMs = Date.now();
    let saveHrSamples = hrSamples;
    let importedFromHc = false;

    if (saveHrSamples.length === 0 && Number.isFinite(startMs)) {
      try {
        const permitted = await hasHrPermission();
        if (permitted) {
          const fresh = await readHeartRateSamples(startMs, endMs);
          const resolved = fresh.length > 0 ? fresh : hcSamples;
          if (resolved.length > 0) {
            saveHrSamples = resolved;
            importedFromHc = true;
            setHcSamples(resolved);
          }
        }
      } catch {
        // No bloquear el guardado si Health Connect falla.
      }
    }

    const { fcMedia: saveFcMedia, fcMax: saveFcMax } = summarizeHeartRate(saveHrSamples);

    const trackPoints: CardioTrackPointInput[] = prepareTrackPointsForStorage(
      points.map((p, idx) => {
        const ts = p.timestamp_utc ? Date.parse(p.timestamp_utc) : NaN;
        const fc = Number.isFinite(ts) ? nearestHeartRate(saveHrSamples, ts) : null;
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
      }),
      MAX_TRACK_POINTS_DB,
    );

    const dur = elapsedSecFrozen ?? elapsedSec;
    const dist = distanceFrozenM ?? distanceM;
    const elevGain = elevationFrozenM ?? elevationGainM(points);

    const track =
      cardioDisciplineUsesGpsMap(code) && trackPoints.length > 0
        ? {
            fuente: importedFromHc ? appendHealthConnectFuente("gps-web") : "gps-web",
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
              fc_media: saveFcMedia,
              fc_max: saveFcMax,
              calorias: null,
            },
          ],
          es_publica: esPublica,
        },
      });
      clearDraft();
      clearHrSamples();
      setHcSamples([]);
      void disconnectHr();
      void stopLiveCardio();
      closeLiveRecording();
      if (importedFromHc) {
        toast({
          title: "Entrenamiento guardado",
          description: "FC importada desde Health Connect.",
        });
      } else if (hrSamples.length === 0 && saveFcMedia == null) {
        toast({
          title: "Entrenamiento guardado",
          description:
            "Sin FC: el reloj puede tardar en sincronizar con Health Connect, o no hay permiso.",
        });
      } else {
        toast({ title: "Entrenamiento guardado" });
      }
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
  const summary = step === "summary" && open && !loadingSession;

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
        {summary ? (
          <CardioLiveSummaryView
            elapsedSec={elapsedSec}
            distanceM={displayDistanceM}
            elevationM={displayElevationM}
            fcMedia={displayFcMedia}
            fcMax={displayFcMax}
            recordingMap={recordingMap}
            pointsCount={points.length}
            titulo={summaryTitulo}
            comentarios={summaryComentarios}
            esPublica={esPublica}
            saving={upsert.isPending}
            discarding={deleteSession.isPending}
            onTituloChange={setSummaryTitulo}
            onComentariosChange={setSummaryComentarios}
            onEsPublicaChange={setEsPublica}
            onSave={() => void onSaveSummary()}
            onDiscard={() => setConfirmDiscard(true)}
            onBack={() => setStep("recording")}
          />
        ) : (
          <>
            <LiveRecordingSurface
              showGpsSurface={showGpsSurface}
              showGpsErrorUi={showGpsErrorUi}
              gpsDenied={gpsDenied}
              gpsError={gpsError}
              mapPoints={mapPoints}
              referencePoints={selectedRoute?.points}
              loadingSession={loadingSession}
              isSetup={isSetup}
              setupDisciplineId={setupDisciplineId}
              lastDisciplineId={lastDisciplineId ?? null}
              onSelectDiscipline={onSelectSetupDiscipline}
              onOpenManual={openManualEditor}
            />

            {(isSetup || (open && !loadingSession)) ? (
              <>
                {!statsOpen ? (
                  <LiveMetricsBar
                    bottomOffsetPx={Math.max(controlsDrawerHeightPx, 96) + 12}
                    isSetup={isSetup}
                    elapsedSec={elapsedSec}
                    distanceM={displayDistanceM}
                    elevationM={displayElevationM}
                    showNoGpsBanner={showNoGpsBanner}
                    noGpsBannerText={noGpsBannerText}
                    onOpenStats={() => setStatsOpen(true)}
                    routePercent={
                      selectedRoute && routeProgress && !isSetup ? routeProgress.percent : null
                    }
                    routeRemainingM={
                      selectedRoute && routeProgress && !isSetup
                        ? routeProgress.remainingM
                        : null
                    }
                  />
                ) : null}
                <LiveControlsDrawer
                  ref={controlsDrawerRef}
                  headerTitle={headerTitle}
                  isSetup={isSetup}
                  paused={paused}
                  pauseSource={pauseSource}
                  showAutoPauseToggle={
                    isSetup
                      ? cardioDisciplineUsesGpsMap(setupDisciplineCodigo)
                      : cardioDisciplineUsesGpsMap(code)
                  }
                  autoPauseEnabled={autoPauseEnabled}
                  onAutoPauseEnabledChange={onAutoPauseEnabledChange}
                  controlsExpanded={controlsExpanded}
                  setupDisciplineId={setupDisciplineId}
                  startPending={startCardioLive.isPending}
                  drawerPillProps={controlsDrawerPillProps}
                  hr={{
                    bpm,
                    connected: hrConnected,
                    connection: hrConnection,
                    deviceName: hrDeviceName,
                    zone: hrZone,
                    connecting: hrConnecting,
                    error: hrError,
                    onConnectClick: onHrConnectClick,
                  }}
                  showRoutePicker={showRoutePickerBtn}
                  selectedRouteName={selectedRoute?.nombre ?? null}
                  onOpenRoutePicker={() => setRoutesPickerOpen(true)}
                  onClearSelectedRoute={() => setSelectedRoute(null)}
                  onOpenChange={(next) => {
                    if (!next) requestClose();
                  }}
                  onPointerDown={onControlsSheetPointerDown}
                  onPointerMove={onControlsSheetPointerMove}
                  onPointerUp={onControlsSheetPointerEnd}
                  onToggleExpanded={() => setControlsExpanded((v) => !v)}
                  onStart={() => void onStartFromIsland()}
                  onPauseToggle={onPauseToggle}
                  onFinish={onFinishRecording}
                  onOpenManual={openManualEditor}
                />
              </>
            ) : null}
          </>
        )}
      </div>

      <SavedRoutesPickerSheet
        open={routesPickerOpen}
        onOpenChange={setRoutesPickerOpen}
        selectedRouteId={selectedRoute?.id ?? null}
        onSelect={setSelectedRoute}
        onClear={() => setSelectedRoute(null)}
      />

      {statsOpen && (isSetup || (open && !loadingSession)) ? (
        <LiveStatsFullscreen
          title={
            isSetup
              ? cardioDisciplinas?.find((d) => d.id === setupDisciplineId)?.nombre?.trim() ||
                "Estadísticas"
              : headerTitle
          }
          disciplineCode={isSetup ? setupDisciplineCodigo : code}
          metrics={{
            elapsedSec: isSetup ? 0 : elapsedSec,
            distanceM: isSetup ? 0 : displayDistanceM,
            elevationM: isSetup ? 0 : displayElevationM,
            speedMps: gpsMotion.speedMps,
            bpm,
            fcMedia,
            fcMax,
          }}
          onClose={() => setStatsOpen(false)}
        />
      ) : null}

      <DiscardSessionDialog
        open={confirmDiscard}
        pending={deleteSession.isPending}
        onOpenChange={setConfirmDiscard}
        onConfirm={() => void onDiscardSession()}
      />
    </>
  );
}

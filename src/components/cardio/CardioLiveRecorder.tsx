import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Loader2, MapPin, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useCardioGpsRecorder } from "@/hooks/useCardioGpsRecorder";
import { useCardioSessionById, useUpsertCardioSession } from "@/hooks/useCardioSessions";
import { cardioDisciplineUsesGpsMap } from "@/lib/cardioLiveMap";
import { cn } from "@/lib/utils";
import {
  PILL_CIRCLE_DURATION_MS,
  pillCircleTransitionAttr,
  pillCircleTransitionStyle,
  type PillCirclePhase,
} from "@/lib/pillCircleTransition";
import { Switch } from "@/components/ui/switch";
import {
  formatDistanceLabel,
  stopLiveCardio,
  updateLiveCardio,
} from "@/lib/liveSessionNotifications";
import type { CardioDisciplineCode, CardioSportDetailInput, CardioTrackPointInput } from "@/types/cardio";

const OSM_TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_CENTER: [number, number] = [40.4168, -3.7038];

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

function firstNested<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function MapFitBounds({ positions }: { positions: L.LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      const p = positions[0] as L.LatLngTuple;
      map.setView(p, 15);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 17 });
  }, [map, positions]);
  return null;
}

export function CardioLiveRecorder() {
  const { state, closeLiveRecording, openEdit } = useGlobalCardioDrawer();
  const sessionId = state.liveSessionId;
  const open = state.liveOpen && !!sessionId;
  const pillOrigin = state.pillOrigin;

  const { toast } = useToast();
  const upsert = useUpsertCardioSession();
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
  const [pillCirclePhase, setPillCirclePhase] = useState<PillCirclePhase | null>(null);
  const pillCloseTimerRef = useRef<number | null>(null);

  const discipline = firstNested(sessionData?.cardio_disciplina);
  const code = discipline?.codigo ?? null;
  const showMap = cardioDisciplineUsesGpsMap(code);

  const gpsRecording = open && step === "recording" && showMap && !paused;
  const { points, distanceM, error: gpsError, denied: gpsDenied, clearDraft } = useCardioGpsRecorder({
    sessionId: open ? sessionId : null,
    recording: gpsRecording,
  });

  const linePositions = useMemo((): L.LatLngExpression[] => points.map((p) => [p.lat, p.lng]), [points]);
  const mapCenter = linePositions.length > 0 ? (linePositions[linePositions.length - 1] as [number, number]) : DEFAULT_CENTER;

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
      setPillCirclePhase(null);
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
    if (sessionData?.titulo) setSummaryTitulo((t) => t || sessionData.titulo || "");
  }, [sessionData?.titulo]);

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
        setPausedMsAccum((a) => a + (Date.now() - pauseStartedAt.current!));
        pauseStartedAt.current = null;
      }
      setPaused(false);
    } else {
      pauseStartedAt.current = Date.now();
      setPaused(true);
    }
  };

  const onFinishRecording = () => {
    if (paused && pauseStartedAt.current != null) {
      setPausedMsAccum((a) => a + (Date.now() - pauseStartedAt.current));
      pauseStartedAt.current = null;
    }
    setPaused(false);
    setElapsedSecFrozen(computeElapsedSec());
    setDistanceFrozenM(distanceM);
    setStep("summary");
    void updateLiveCardio({
      sessionId: sessionId!,
      title: cardioTitle,
      paused: true,
      distanceLabel: formatDistanceLabel(distanceM),
      wantsLocation: showMap,
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

  const onSaveSummary = async () => {
    if (!sessionId || !sessionData?.fecha_inicio) return;
    const titulo = summaryTitulo.trim();
    if (!titulo) {
      toast({ title: "Añade un título", variant: "destructive" });
      return;
    }

    const trackPoints: CardioTrackPointInput[] = points.map((p, idx) => ({
      orden: idx,
      lat: p.lat,
      lng: p.lng,
      elevacion_m: p.elevacion_m ?? null,
      timestamp_utc: p.timestamp_utc,
      velocidad_m_s: null,
      fc: null,
      cadencia: null,
      potencia_w: null,
    }));

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
          bloques: [],
          es_publica: esPublica,
        },
      });
      clearDraft();
      void stopLiveCardio();
      closeLiveRecording();
      toast({ title: "Entrenamiento guardado" });
    } catch {
      toast({ title: "No se pudo guardar", variant: "destructive" });
    }
  };

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

  const loading = sessionLoading || !sessionData;
  const headerTitle = !loading
    ? discipline?.nombre?.trim() || sessionData.titulo || "Cardio"
    : "Cardio";

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-background" {...pillCircleProps}>
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando sesión…</p>
        </div>
      ) : (
        <>
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
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
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
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
                <MapContainer
                  center={mapCenter}
                  zoom={linePositions.length ? 15 : 12}
                  className="h-full min-h-[220px] w-full z-0"
                  scrollWheelZoom
                >
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url={OSM_TILE} />
                  {linePositions.length > 0 ? (
                    <>
                      <Polyline positions={linePositions} pathOptions={{ color: "#0ea5e9", weight: 4, opacity: 0.92 }} />
                      <MapFitBounds positions={linePositions} />
                    </>
                  ) : null}
                </MapContainer>
              )}
            </div>
          ) : (
            <div className="flex min-h-[28vh] flex-1 flex-col items-center justify-center gap-2 border-b border-border bg-muted/20 p-6">
              <p className="text-center text-sm text-muted-foreground">Modo interior: cronómetro y finalizar. Puedes editar detalles al terminar.</p>
            </div>
          )}

          <div className="shrink-0 space-y-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {showMap && gpsError && points.length > 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">{gpsError}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tiempo</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{formatDuration(elapsedSec)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Distancia</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{formatDistanceM(displayDistanceM)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className={cn("min-w-[120px] rounded-full gap-2", paused && "border-sky-500/50")}
                onClick={onPauseToggle}
              >
                {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                {paused ? "Reanudar" : "Pausa"}
              </Button>
              <Button type="button" size="lg" className="min-w-[120px] rounded-full gap-2 bg-sky-600 hover:bg-sky-700 text-white" onClick={onFinishRecording}>
                <Square className="h-4 w-4 fill-current" />
                Finalizar
              </Button>
            </div>

            <button type="button" className="block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={openManualEditor}>
              Registrar o editar en formulario manual
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Resumen</p>
            <p className="mt-2 font-mono text-lg tabular-nums">
              {formatDuration(elapsedSec)} · {formatDistanceM(displayDistanceM)}
            </p>
            {showMap && points.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">Sin puntos GPS; se guardará solo tiempo y título.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardio-live-titulo">Título</Label>
            <Input id="cardio-live-titulo" value={summaryTitulo} onChange={(e) => setSummaryTitulo(e.target.value)} className="h-12 rounded-xl" placeholder="Ej. Rodaje suave" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardio-live-comentarios">Comentarios (opcional)</Label>
            <Textarea
              id="cardio-live-comentarios"
              value={summaryComentarios}
              onChange={(e) => setSummaryComentarios(e.target.value)}
              className="min-h-[88px] rounded-xl resize-none"
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

          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep("recording")}>
              Volver
            </Button>
            <Button type="button" className="rounded-xl font-semibold" disabled={upsert.isPending} onClick={() => void onSaveSummary()}>
              {upsert.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar entrenamiento
            </Button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLogros, useLogroStats, getLogroProgress, type LogroConEstado } from "@/hooks/useLogros";
import { supabase } from "@/integrations/supabase/client";
import { LogroMedal, NIVEL_LABELS } from "@/components/logros/LogroMedal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";

const CATEGORIAS: { id: string; label: string }[] = [
  { id: "fuerza", label: "Entrenamientos de fuerza" },
  { id: "racha", label: "Racha semanal" },
  { id: "volumen", label: "Volumen levantado" },
  { id: "series_dia", label: "Series en un día" },
  { id: "cardio", label: "Sesiones de cardio" },
  { id: "distancia", label: "Distancia recorrida" },
  { id: "nivel", label: "Nivel" },
];

function formatNumber(n: number) {
  return n.toLocaleString("es-ES");
}

function CategoriaSection({
  label,
  logros,
  showProgress,
  progress,
}: {
  label: string;
  logros: LogroConEstado[];
  showProgress: boolean;
  progress: { current: number; target: number } | null;
}) {
  const unlockedCount = logros.filter((l) => l.unlocked).length;

  return (
    <Card className="min-w-0 overflow-hidden rounded-none border-0 shadow-none md:rounded-xl md:border md:border-border/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{label}</CardTitle>
          <span className="text-xs tabular-nums text-muted-foreground">
            {unlockedCount}/{logros.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <div className="flex min-w-0 w-full items-start gap-1 overflow-x-auto overscroll-x-contain touch-pan-x pb-1">
          {logros.map((l) => (
            <div
              key={l.id}
              className={cn(
                "flex w-[19%] min-w-14 shrink-0 flex-col items-center gap-1 text-center",
                !l.unlocked && "text-muted-foreground/60",
              )}
            >
              <LogroMedal nivel={l.nivel} icono={l.icono} unlocked={l.unlocked} size={60} />
              <p className="text-[10px] font-medium leading-tight">{NIVEL_LABELS[l.nivel] ?? l.nivel}</p>
              <p className="text-[10px] tabular-nums leading-tight opacity-80">
                {formatNumber(Number(l.meta))}
              </p>
            </div>
          ))}
        </div>

        {showProgress && progress && (
          <div className="space-y-1.5">
            <Progress value={Math.min(100, (progress.current / progress.target) * 100)} className="h-2" />
            <p className="text-xs tabular-nums text-muted-foreground">
              {formatNumber(progress.current)} / {formatNumber(progress.target)} para el siguiente nivel
            </p>
          </div>
        )}
        {showProgress && !progress && logros.length > 0 && (
          <p className="text-xs font-medium text-primary">Categoría completada. ¡Nivel diamante!</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Logros() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paramUserId = searchParams.get("user");
  const targetUserId = paramUserId ?? user?.id;
  const isSelf = !paramUserId || paramUserId === user?.id;

  const { data: logros = [], isLoading } = useLogros(targetUserId ?? undefined);
  const { data: stats } = useLogroStats();

  const { data: targetProfile } = useQuery({
    queryKey: ["logros-profile", targetUserId],
    enabled: !isSelf && !!targetUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("username")
        .eq("id", targetUserId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const porCategoria = useMemo(() => {
    const map = new Map<string, LogroConEstado[]>();
    for (const l of logros) {
      if (!map.has(l.categoria)) map.set(l.categoria, []);
      map.get(l.categoria)!.push(l);
    }
    for (const list of map.values()) list.sort((a, b) => a.orden - b.orden);
    return map;
  }, [logros]);

  const retos = porCategoria.get("retos") ?? [];
  const unlockedTotal = logros.filter((l) => l.unlocked).length;
  const xpLogros = logros.filter((l) => l.unlocked).reduce((acc, l) => acc + l.xp_recompensa, 0);

  /** Progreso hacia el primer nivel bloqueado de la categoría (solo perfil propio). */
  const progressForCategory = (list: LogroConEstado[]) => {
    if (!stats) return null;
    const nextLocked = list.find((l) => !l.unlocked);
    if (!nextLocked) return null;
    return getLogroProgress(nextLocked, stats);
  };

  if (isLoading) {
    return (
      <div className={cn("mx-auto flex w-full min-w-0 max-w-2xl flex-col overflow-x-hidden md:px-8 md:py-6", PAGE_CARD_STACK_GAP)}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-none md:rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("mx-auto flex w-full min-w-0 max-w-2xl flex-col overflow-x-hidden pb-6 md:px-8 md:py-6", PAGE_CARD_STACK_GAP)}>
      {/* Cabecera resumen */}
      <Card className="min-w-0 overflow-hidden rounded-none border-0 shadow-none md:rounded-xl md:border md:border-border/20">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {isSelf ? "Tus logros" : `Logros de ${targetProfile?.username ?? "usuario"}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {unlockedTotal} de {logros.length} desbloqueados
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-primary">
            <Zap className="h-4 w-4" /> {formatNumber(xpLogros)} XP
          </div>
        </CardContent>
      </Card>

      {CATEGORIAS.map(({ id, label }) => {
        const list = porCategoria.get(id) ?? [];
        if (list.length === 0) return null;
        return (
          <CategoriaSection
            key={id}
            label={label}
            logros={list}
            showProgress={isSelf}
            progress={isSelf ? progressForCategory(list) : null}
          />
        );
      })}

      {retos.length > 0 && (
        <Card className="min-w-0 overflow-hidden rounded-none border-0 shadow-none md:rounded-xl md:border md:border-border/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Retos</CardTitle>
              <span className="text-xs tabular-nums text-muted-foreground">
                {retos.filter((l) => l.unlocked).length}/{retos.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
              {retos.map((l) => (
                <div
                  key={l.id}
                  className={cn(
                    "flex flex-col items-center gap-1.5 text-center",
                    !l.unlocked && "text-muted-foreground/60",
                  )}
                >
                  <LogroMedal nivel={l.nivel} icono={l.icono} unlocked={l.unlocked} size={72} />
                  <p className="text-xs font-semibold leading-tight">{l.nombre}</p>
                  <p className="text-[10px] leading-tight opacity-80">{l.descripcion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

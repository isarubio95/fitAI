import { useMemo } from "react";
import { Zap } from "lucide-react";
import { useLogros, useLogroStats, getLogroProgress, type LogroConEstado } from "@/hooks/useLogros";
import { LogroMedal, NIVEL_LABELS } from "@/components/logros/LogroMedal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
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
        <div
          data-vaul-allow-horizontal-pan
          className="flex min-w-0 w-full items-start gap-1 overflow-x-auto overscroll-x-contain touch-[pan-x_pan-y] pb-1"
        >
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
            <Progress value={Math.min(100, (progress.current / progress.target) * 100)} className="h-1.5" />
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

type LogrosDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  isSelf: boolean;
  username?: string | null;
};

export function LogrosDrawer({ open, onOpenChange, userId, isSelf, username }: LogrosDrawerProps) {
  const { data: logros = [], isLoading } = useLogros(userId || undefined);
  const { data: stats } = useLogroStats();

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

  const progressForCategory = (list: LogroConEstado[]) => {
    if (!stats) return null;
    const nextLocked = list.find((l) => !l.unlocked);
    if (!nextLocked) return null;
    return getLogroProgress(nextLocked, stats);
  };

  const title = isSelf ? "Tus logros" : `Logros de ${username ?? "usuario"}`;

  return (
    <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="left"
        className="flex h-full max-h-dvh w-full max-w-none flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none dark:bg-card"
      >
        <div className={cn("min-h-0 flex-1 overflow-y-auto bg-card dark:bg-transparent", drawerSafeAreaBottom)}>
          <DrawerHeader className="bg-card px-6 pb-1 pt-[calc(1.75rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left dark:bg-transparent">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "…" : `${unlockedTotal} de ${logros.length} desbloqueados`}
                </p>
              </div>
              {!isLoading && (
                <div className="flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-primary">
                  <Zap className="h-4 w-4" /> {formatNumber(xpLogros)} XP
                </div>
              )}
            </div>
          </DrawerHeader>

          <div className={cn("flex w-full min-w-0 flex-col overflow-x-hidden pb-6", PAGE_CARD_STACK_GAP)}>
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-none md:rounded-xl" />
              ))
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

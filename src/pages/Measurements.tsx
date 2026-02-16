import { useState, useMemo } from "react";
import { useMeasurements, type Medida } from "@/hooks/useMeasurements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Plus, Scale, TrendingUp, TrendingDown, CalendarIcon,
  ChevronDown, ChevronUp, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { MuscleRankingWidget } from "@/components/dashboard/MuscleRankingWidget";

const chartConfig = {
  peso: { label: "Peso (kg)", color: "hsl(var(--primary))" },
};

// ── Form fields config ──
const numericFields = [
  { key: "peso", label: "Peso (kg)", step: "0.1" },
  { key: "grasa", label: "% Grasa", step: "0.1" },
  { key: "cintura", label: "Cintura (cm)", step: "0.1" },
  { key: "pecho", label: "Pecho (cm)", step: "0.1" },
  { key: "brazo", label: "Brazo (cm)", step: "0.1" },
  { key: "pierna", label: "Pierna (cm)", step: "0.1" },
] as const;

const Measurements = () => {
  const { data: medidas, isLoading, addMeasurement, deleteMeasurement, isAdding } = useMeasurements();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Form state ──
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // ── Current vs previous weight ──
  const currentWeight = medidas?.[0]?.peso ?? null;
  const prevWeight = medidas && medidas.length > 1 ? medidas[1].peso : null;
  const weightDiff = currentWeight !== null && prevWeight !== null ? currentWeight - prevWeight : null;

  // ── Chart data ──
  const chartData = useMemo(() => {
    if (!medidas?.length) return [];
    return [...medidas]
      .filter((m) => m.peso !== null)
      .reverse()
      .map((m) => ({
        date: format(new Date(m.fecha), "d MMM", { locale: es }),
        peso: m.peso,
      }));
  }, [medidas]);

  const handleSubmit = async () => {
    try {
      const payload: any = {
        fecha: format(formDate, "yyyy-MM-dd"),
        notas: formValues.notas || null,
      };
      for (const f of numericFields) {
        payload[f.key] = formValues[f.key] ? parseFloat(formValues[f.key]) : null;
      }
      await addMeasurement(payload);
      setSheetOpen(false);
      setFormValues({});
      setFormDate(new Date());
      toast({ title: "Medida registrada" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMeasurement(id);
      toast({ title: "Registro eliminado" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto pb-28">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medidas Corporales</h1>
          <p className="text-sm text-muted-foreground">Seguimiento de tu composición</p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Registrar</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Registrar Medidas</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              {/* Date picker */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(formDate, "PPP", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={(d) => d && setFormDate(d)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Numeric fields */}
              <div className="grid grid-cols-2 gap-3">
                {numericFields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                    <Input
                      type="number"
                      step={f.step}
                      inputMode="decimal"
                      placeholder="–"
                      value={formValues[f.key] ?? ""}
                      onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Notas</label>
                <Textarea
                  placeholder="Observaciones opcionales…"
                  value={formValues.notas ?? ""}
                  onChange={(e) => setFormValues((v) => ({ ...v, notas: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={isAdding}>
                {isAdding ? "Guardando…" : "Guardar Medida"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* ── Current Weight Card ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peso actual</p>
              {isLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : currentWeight !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{currentWeight} kg</span>
                  {weightDiff !== null && (
                    <Badge variant="secondary" className={cn("text-xs gap-0.5", weightDiff <= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {weightDiff <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Sin registros</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Weight Chart ── */}
      {chartData.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3">Evolución del peso</h2>
            <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="peso"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#pesoGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* ── Muscle Ranking ── */}
      <MuscleRankingWidget />

      {/* ── History ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Historial</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : !medidas?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin registros aún.</p>
        ) : (
          <div className="space-y-2">
            {medidas.map((m) => {
              const isOpen = expandedId === m.id;
              return (
                <Card key={m.id}>
                  <button
                    className="w-full text-left px-4 py-3 flex items-center justify-between"
                    onClick={() => setExpandedId(isOpen ? null : m.id)}
                  >
                    <div className="flex items-center gap-3">
                      <time className="text-xs text-muted-foreground w-20 shrink-0">
                        {format(new Date(m.fecha), "d MMM yyyy", { locale: es })}
                      </time>
                      {m.peso !== null && <span className="font-semibold">{m.peso} kg</span>}
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-2">
                      <Separator />
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {m.grasa !== null && <Detail label="% Grasa" value={`${m.grasa}%`} />}
                        {m.cintura !== null && <Detail label="Cintura" value={`${m.cintura} cm`} />}
                        {m.pecho !== null && <Detail label="Pecho" value={`${m.pecho} cm`} />}
                        {m.brazo !== null && <Detail label="Brazo" value={`${m.brazo} cm`} />}
                        {m.pierna !== null && <Detail label="Pierna" value={`${m.pierna} cm`} />}
                      </div>
                      {m.notas && <p className="text-xs text-muted-foreground italic">{m.notas}</p>}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(m.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export default Measurements;

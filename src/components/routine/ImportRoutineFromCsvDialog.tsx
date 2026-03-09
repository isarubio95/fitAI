import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estructura del CSV:
 * - Línea 1: nombre_rutina, descripcion
 * - Líneas 2+: nombre_ejercicio, series, repes_min, repes_max, descanso_segundos [, rir]
 * Los nombres de ejercicios deben coincidir con el catálogo (busca por nombre).
 */
function parseCsvRoutine(text: string): { nombre: string; descripcion: string; rows: { nombre_ejercicio: string; series: number; repes_min: number; repes_max: number; descanso: number; rir: number }[] } | null {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === "," && !inQuotes) || (c === ";" && !inQuotes)) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const first = parseRow(lines[0]);
  const nombre = (first[0] ?? "").trim();
  const descripcion = (first[1] ?? "").trim();
  if (!nombre) return null;

  const rows: { nombre_ejercicio: string; series: number; repes_min: number; repes_max: number; descanso: number; rir: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseRow(lines[i]);
    const nombre_ejercicio = (cells[0] ?? "").trim();
    if (!nombre_ejercicio) continue;
    const series = Math.max(1, parseInt(cells[1], 10) || 3);
    const repes_min = Math.max(0, parseInt(cells[2], 10) ?? 8);
    const repes_max = Math.max(0, parseInt(cells[3], 10) ?? 12);
    const descanso = Math.max(0, parseInt(cells[4], 10) ?? 90);
    const rir = Math.max(0, Math.min(10, parseInt(cells[5], 10) ?? 0));
    rows.push({ nombre_ejercicio, series, repes_min, repes_max, descanso, rir });
  }
  if (rows.length === 0) return null;
  return { nombre, descripcion, rows };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportRoutineFromCsvDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { data: catalog } = useExerciseCatalog();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);

  const findTipoEjercicioId = useCallback(
    (nombre: string): string | null => {
      if (!catalog?.length) return null;
      const n = nombre.trim().toLowerCase();
      const exact = catalog.find((e) => e.nombre.trim().toLowerCase() === n);
      if (exact) return exact.id;
      const partial = catalog.find((e) => e.nombre.trim().toLowerCase().includes(n) || n.includes(e.nombre.trim().toLowerCase()));
      return partial?.id ?? null;
    },
    [catalog]
  );

  const processFile = useCallback(
    async (file: File) => {
      if (!user || !catalog?.length) {
        toast({ title: "Cargando catálogo…", description: "Espera un momento e intenta de nuevo.", variant: "destructive" });
        return;
      }
      const text = await file.text();
      const parsed = parseCsvRoutine(text);
      if (!parsed) {
        toast({ title: "CSV no válido", description: "Revisa la estructura: primera línea nombre y descripción, luego una línea por ejercicio.", variant: "destructive" });
        return;
      }

      setImporting(true);
      try {
        const { data: newRutina, error: errRutina } = await supabase
          .from("rutina")
          .insert({ nombre: parsed.nombre, descripcion: parsed.descripcion || null, usuario_id: user.id })
          .select("id")
          .single();
        if (errRutina) throw errRutina;

        const notFound: string[] = [];
        const inserts: { rutina_id: string; tipo_ejercicio_id: string; series_objetivo: number; repes_min: number; repes_max: number; rir: number; orden: number; descanso: number | null }[] = [];
        for (let i = 0; i < parsed.rows.length; i++) {
          const row = parsed.rows[i];
          const tipoId = findTipoEjercicioId(row.nombre_ejercicio);
          if (!tipoId) {
            notFound.push(row.nombre_ejercicio);
            continue;
          }
          inserts.push({
            rutina_id: newRutina.id,
            tipo_ejercicio_id: tipoId,
            series_objetivo: row.series,
            repes_min: row.repes_min,
            repes_max: row.repes_max,
            rir: row.rir,
            orden: i,
            descanso: row.descanso,
          });
        }

        if (inserts.length === 0) {
          await supabase.from("rutina").delete().eq("id", newRutina.id);
          toast({
            title: "Ningún ejercicio encontrado",
            description: notFound.length ? `No se encontraron en el catálogo: ${notFound.slice(0, 5).join(", ")}${notFound.length > 5 ? "…" : ""}` : "Revisa los nombres en el CSV.",
            variant: "destructive",
          });
          return;
        }

        const { error: errEj } = await supabase.from("rutina_ejercicio").insert(inserts);
        if (errEj) throw errEj;

        queryClient.invalidateQueries({ queryKey: ["routines"] });
        toast({
          title: "Rutina importada",
          description: notFound.length ? `Rutina creada con ${inserts.length} ejercicios. No encontrados: ${notFound.slice(0, 3).join(", ")}${notFound.length > 3 ? "…" : ""}` : `"${parsed.nombre}" creada con ${inserts.length} ejercicios.`,
        });
        onOpenChange(false);
      } catch (e: any) {
        toast({ title: "Error al importar", description: e.message ?? "Revisa el CSV e intenta de nuevo.", variant: "destructive" });
      } finally {
        setImporting(false);
      }
    },
    [user, catalog, findTipoEjercicioId, queryClient, toast, onOpenChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.toLowerCase().endsWith(".csv")) processFile(file);
      else toast({ title: "Archivo no válido", description: "Sube un archivo .csv", variant: "destructive" });
    },
    [processFile, toast]
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogTitle className="text-lg font-bold">Importar rutina desde CSV</DialogTitle>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="font-medium">Estructura del archivo CSV</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Primera línea:</strong> nombre de la rutina, descripción (opcional). Si la descripción lleva comas, escríbela entre comillas.</li>
              <li><strong>Resto de líneas:</strong> una por ejercicio: nombre_ejercicio, series, repes_min, repes_max, descanso_segundos. Opcional: rir (0-10).</li>
              <li>El nombre del ejercicio debe coincidir con uno del catálogo de ejercicios de la app.</li>
            </ul>
            <pre className="mt-2 text-xs bg-background/80 rounded p-2 overflow-x-auto border border-border">
{`Mi rutina A,"Descripción entre comillas"
Press banca,3,8,12,90
Sentadilla,4,6,10,120,2
Peso muerto,3,5,8,180`}
            </pre>
          </div>

          <div
            className={cn(
              "rounded-xl border-2 border-dashed p-6 transition-colors flex flex-col items-center justify-center gap-2 min-h-[140px]",
              isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/40"
            )}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="csv-routine-upload"
              onChange={onFileInput}
              disabled={importing}
            />
            {importing ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <FileUp className="h-10 w-10 text-muted-foreground" />
            )}
            <p className="text-muted-foreground text-center">
              {importing ? "Importando…" : "Arrastra aquí un archivo .csv o haz clic para seleccionar"}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={importing}
              onClick={() => document.getElementById("csv-routine-upload")?.click()}
            >
              Seleccionar archivo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

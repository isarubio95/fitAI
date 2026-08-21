import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { resolveMaxHeartRate, type PhysioProfile } from "@/lib/trainingLoad";
import { cn } from "@/lib/utils";

const settingsSectionCardClass = cn(
  "space-y-4 rounded-xl border border-border/60 bg-card p-4",
);

type PhysioForm = {
  fecha_nacimiento: string;
  fc_max: string;
  fc_reposo: string;
  ftp_w: string;
};

function toForm(profile: PhysioProfile | null | undefined): PhysioForm {
  return {
    fecha_nacimiento: profile?.fecha_nacimiento?.slice(0, 10) ?? "",
    fc_max: profile?.fc_max != null ? String(profile.fc_max) : "",
    fc_reposo: profile?.fc_reposo != null ? String(profile.fc_reposo) : "",
    ftp_w: profile?.ftp_w != null ? String(profile.ftp_w) : "",
  };
}

function parseOptionalInt(raw: string, min: number, max: number): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

function isPhysioFormDirty(form: PhysioForm, profile: PhysioProfile | null | undefined): boolean {
  const baseline = toForm(profile);
  return (
    form.fecha_nacimiento !== baseline.fecha_nacimiento ||
    form.fc_max !== baseline.fc_max ||
    form.fc_reposo !== baseline.fc_reposo ||
    form.ftp_w !== baseline.ftp_w
  );
}

export function PhysiologySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PhysioForm>(toForm(null));

  const { data: profile, isLoading } = useQuery({
    queryKey: ["perfilPhysio", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("fecha_nacimiento, fc_max, fc_reposo, ftp_w")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as PhysioProfile | null;
    },
  });

  useEffect(() => {
    if (profile !== undefined) setForm(toForm(profile));
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (values: PhysioForm) => {
      const fcMax = parseOptionalInt(values.fc_max, 100, 230);
      const fcReposo = parseOptionalInt(values.fc_reposo, 30, 120);
      const ftp = parseOptionalInt(values.ftp_w, 50, 600);
      if (values.fc_max.trim() && fcMax == null) {
        throw new Error("FCmáx debe estar entre 100 y 230");
      }
      if (values.fc_reposo.trim() && fcReposo == null) {
        throw new Error("FCreposo debe estar entre 30 y 120");
      }
      if (values.ftp_w.trim() && ftp == null) {
        throw new Error("FTP debe estar entre 50 y 600 W");
      }

      const payload = {
        fecha_nacimiento: values.fecha_nacimiento.trim() || null,
        fc_max: fcMax,
        fc_reposo: fcReposo,
        ftp_w: ftp,
      };

      const { error } = await supabase.from("perfil").update(payload).eq("id", user!.id);
      if (error) throw error;
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfilPhysio", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["trainingLoad"] });
      toast({ title: "Datos fisiológicos guardados" });
    },
    onError: (error: unknown) => {
      toast({
        title: "No se pudo guardar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    },
  });

  const estimatedMax = resolveMaxHeartRate({
    fecha_nacimiento: form.fecha_nacimiento || null,
    fc_max: parseOptionalInt(form.fc_max, 100, 230),
  });
  const isDirty = isPhysioFormDirty(form, profile);

  return (
    <div className={settingsSectionCardClass}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Heart className="h-4 w-4 text-muted-foreground" />
        Fisiología (carga y fatiga)
      </p>
      <p className="text-xs leading-snug text-muted-foreground">
        Se usan para estimar el esfuerzo si no lo indicas al terminar, y para el gráfico
        Fitness / Fatiga / Forma. Si dejas FCmáx vacío, se estima por edad (Tanaka) o 190.
      </p>

      <div className="grid gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="physio-dob" className="text-xs">
            Fecha de nacimiento
          </Label>
          <Input
            id="physio-dob"
            type="date"
            value={form.fecha_nacimiento}
            disabled={isLoading || saveMutation.isPending}
            onChange={(e) => setForm((f) => ({ ...f, fecha_nacimiento: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="physio-fcmax" className="text-xs">
              FCmáx (bpm)
            </Label>
            <Input
              id="physio-fcmax"
              inputMode="numeric"
              placeholder={String(estimatedMax)}
              value={form.fc_max}
              disabled={isLoading || saveMutation.isPending}
              onChange={(e) => setForm((f) => ({ ...f, fc_max: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="physio-fcreposo" className="text-xs">
              FCreposo (bpm)
            </Label>
            <Input
              id="physio-fcreposo"
              inputMode="numeric"
              placeholder="60"
              value={form.fc_reposo}
              disabled={isLoading || saveMutation.isPending}
              onChange={(e) => setForm((f) => ({ ...f, fc_reposo: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="physio-ftp" className="text-xs flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            FTP ciclismo (W)
          </Label>
          <Input
            id="physio-ftp"
            inputMode="numeric"
            placeholder="Opcional"
            value={form.ftp_w}
            disabled={isLoading || saveMutation.isPending}
            onChange={(e) => setForm((f) => ({ ...f, ftp_w: e.target.value }))}
          />
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={!isDirty || isLoading || saveMutation.isPending || !user}
        onClick={() => saveMutation.mutate(form)}
      >
        {saveMutation.isPending ? "Guardando…" : "Guardar fisiología"}
      </Button>
    </div>
  );
}

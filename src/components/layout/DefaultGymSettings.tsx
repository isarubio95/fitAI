import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GymPickerSheet } from "@/components/gym/GymPickerSheet";
import {
  GIMNASIOS_QUERY_KEY,
  persistDefaultGimnasio,
  useDefaultGimnasio,
} from "@/hooks/useGimnasios";
import type { SelectedGimnasio } from "@/types/gimnasio";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const settingsSectionCardClass = cn(
  "space-y-4 rounded-xl border border-border/60 bg-card p-4",
);

/** Encima de Ajustes (overlay 110 / panel 115). Mapa y «Añadir» un peldaño más. */
const PICKER_OVERLAY_CLASS = "z-[120]";
const PICKER_CONTENT_CLASS = "z-[125]";
const NESTED_OVERLAY_CLASS = "z-[130]";
const NESTED_CONTENT_CLASS = "z-[135]";

export function DefaultGymSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: gym = null, isLoading } = useDefaultGimnasio();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleChange = async (next: SelectedGimnasio | null) => {
    if (!user) return;
    try {
      await persistDefaultGimnasio(user.id, next);
      void queryClient.invalidateQueries({ queryKey: GIMNASIOS_QUERY_KEY });
    } catch (error: unknown) {
      toast({
        title: "No se pudo guardar el gimnasio",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={settingsSectionCardClass}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        Gimnasio
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="default-gimnasio">Gimnasio por defecto</Label>
        <button
          type="button"
          id="default-gimnasio"
          disabled={isLoading}
          onClick={() => setPickerOpen(true)}
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-base md:text-sm",
            "focus-visible:border-emerald-500/30 focus-visible:outline-none",
            isLoading && "cursor-not-allowed opacity-50",
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className={cn("min-w-0 flex-1 truncate", !gym && "text-muted-foreground")}>
            {gym?.nombre ?? "Elige tu gimnasio habitual"}
          </span>
        </button>
      </div>
      <GymPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selected={gym}
        onSelect={handleChange}
        overlayClassName={PICKER_OVERLAY_CLASS}
        contentClassName={PICKER_CONTENT_CLASS}
        nestedOverlayClassName={NESTED_OVERLAY_CLASS}
        nestedContentClassName={NESTED_CONTENT_CLASS}
      />
    </div>
  );
}

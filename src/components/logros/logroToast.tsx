import { toast } from "sonner";
import type { LogroRow } from "@/hooks/useLogros";
import { LogroMedal } from "./LogroMedal";

/** Toast de celebración para logros desbloqueados fuera del modal post-entreno. */
export function notifyLogrosDesbloqueados(nuevos: LogroRow[]) {
  for (const logro of nuevos) {
    toast(
      <div className="flex items-center gap-3">
        <LogroMedal nivel={logro.nivel} icono={logro.icono} size={52} />
        <div className="min-w-0">
          <p className="text-sm font-semibold">¡Logro desbloqueado!</p>
          <p className="truncate text-sm">{logro.nombre}</p>
          <p className="truncate text-xs text-muted-foreground">
            {logro.descripcion} · +{logro.xp_recompensa} XP
          </p>
        </div>
      </div>,
      { duration: 6000 }
    );
  }
}

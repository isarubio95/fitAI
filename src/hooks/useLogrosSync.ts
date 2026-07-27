import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { checkAndAwardLogros } from "@/hooks/useLogros";
import { notifyLogrosDesbloqueados } from "@/components/logros/logroToast";

const syncedUsers = new Set<string>();

/**
 * Comprueba logros pendientes una vez por sesión al cargar la app.
 * Otorga retroactivos (p. ej. tras cambios de catálogo) y avisa con un toast.
 */
export function useLogrosSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userId = user?.id;
    if (!userId || syncedUsers.has(userId)) return;
    syncedUsers.add(userId);

    checkAndAwardLogros(userId)
      .then(({ nuevos }) => {
        if (nuevos.length === 0) return;
        notifyLogrosDesbloqueados(nuevos);
        queryClient.invalidateQueries({ queryKey: ["logros"] });
        queryClient.invalidateQueries({ queryKey: ["profileStats"] });
      })
      .catch(() => {
        // Reintentar en la próxima carga si falla (p. ej. sin conexión)
        syncedUsers.delete(userId);
      });
  }, [user?.id, queryClient]);
}

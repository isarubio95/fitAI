import { useState } from "react";
import { Check, Copy, Loader2, Unplug } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useOAuthGrants, type OAuthGrant } from "@/hooks/useOAuthGrants";
import { useToast } from "@/hooks/use-toast";
import { MCP_URL } from "@/lib/mcp";
import { hostOf, scopeLabel } from "@/lib/oauthConsent";
import { cn } from "@/lib/utils";

const settingsSectionCardClass = cn(
  "space-y-4 rounded-xl border border-border/60 bg-card p-4",
);

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Aplicaciones de IA conectadas a la cuenta.
 *
 * Esta pantalla es la contrapartida de que cualquier cliente pueda registrarse
 * solo: aquí se ve quién tiene acceso y se le quita. Revocar no es cosmético —
 * borra el consentimiento, cierra las sesiones de ese cliente e invalida sus
 * tokens de refresco.
 *
 * Cuando no hay ninguna conectada, hace de punto de partida: enseña la URL del
 * servidor MCP, que si no el usuario no sabría dónde encontrar.
 */
export function ConnectedAppsSettings() {
  const { grants, isLoading, error, unsupported, revoke } = useOAuthGrants();
  const { toast } = useToast();
  const [aRevocar, setARevocar] = useState<OAuthGrant | null>(null);
  const [copiado, setCopiado] = useState(false);

  const copiarUrl = async () => {
    try {
      await navigator.clipboard.writeText(MCP_URL);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast({ title: "No se ha podido copiar", description: MCP_URL });
    }
  };

  const confirmarRevocar = async () => {
    const clientId = aRevocar?.client?.id;
    setARevocar(null);
    if (!clientId) return;

    try {
      await revoke.mutateAsync(clientId);
      toast({ title: "Acceso revocado" });
    } catch (e) {
      toast({
        title: "No se ha podido revocar",
        description: e instanceof Error ? e.message : "Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={settingsSectionCardClass}>
      <div>
        <h3 className="font-medium text-foreground">Aplicaciones conectadas</h3>
        <p className="text-sm text-muted-foreground">
          Asistentes de IA que pueden leer y registrar tus entrenamientos.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* El proyecto puede tener un GoTrue anterior a esta API: se dice, en vez
          de enseñar una lista vacía que parecería significar «nadie tiene acceso». */}
      {unsupported && (
        <p className="text-sm text-muted-foreground">
          Este proyecto todavía no puede listar los accesos concedidos. Puedes retirarlos desde el
          propio asistente, o cerrando la sesión en todos tus dispositivos.
        </p>
      )}

      {!isLoading && !unsupported && error && (
        <p className="text-sm text-destructive">
          No hemos podido cargar la lista. Cierra y vuelve a abrir los ajustes.
        </p>
      )}

      {!isLoading && !error && grants.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Todavía no has conectado ninguna aplicación. Añade esta dirección como servidor MCP en
            Claude, ChatGPT, Cursor o cualquier asistente compatible:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {MCP_URL}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void copiarUrl()}
              aria-label="Copiar dirección del servidor MCP"
            >
              {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {grants.length > 0 && (
        <ul className="space-y-3">
          {grants.map((grant) => {
            const nombre = grant.client?.name?.trim() || "Aplicación sin nombre";
            const host = hostOf(grant.client?.uri);
            return (
              <li
                key={grant.client?.id ?? nombre}
                className="flex items-start gap-3 rounded-lg border border-border/40 p-3"
              >
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary"
                >
                  {nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{nombre}</p>
                  {host && <p className="truncate text-xs text-muted-foreground">{host}</p>}
                  <p className="text-xs text-muted-foreground">
                    Conectada el {formatearFecha(grant.granted_at)}
                  </p>
                  {grant.scopes?.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      {grant.scopes.map(scopeLabel).join(" · ")}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setARevocar(grant)}
                  disabled={revoke.isPending}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Unplug className="mr-1.5 h-4 w-4" />
                  Revocar
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={aRevocar !== null} onOpenChange={(open) => !open && setARevocar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Retirar el acceso a {aRevocar?.client?.name?.trim() || "esta aplicación"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Dejará de poder leer y modificar tus entrenamientos al instante. Tus datos no se
              borran. Puedes volver a conectarla cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarRevocar()}>Revocar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

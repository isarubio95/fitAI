import { useCallback, useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_CTA_CLASS, AUTH_LINK_CLASS, AUTH_SOFT_BUTTON_CLASS } from "@/lib/authStyles";
import {
  consentPathFor,
  hostOf,
  savePendingConsent,
  scopeLabel,
} from "@/lib/oauthConsent";
import { cn } from "@/lib/utils";

/**
 * Pantalla de consentimiento OAuth 2.1.
 *
 * Aquí es donde un asistente de IA (Claude, ChatGPT, Cursor…) pasa de estar
 * registrado a tener acceso de verdad a los datos del usuario. Que cualquiera
 * pueda registrar un cliente es parte del protocolo; lo que convierte eso en
 * inofensivo es esta pantalla, así que su trabajo es que quien la lee entienda
 * qué está aprobando: qué aplicación, con qué permisos y a dónde vuelve.
 *
 * Cuelga fuera de `AppLayout` a propósito: su guard redirige a /auth con
 * `replace`, lo que borraría el `authorization_id` de la URL sin vuelta atrás.
 * El caso «sin sesión» se resuelve aquí, guardando el id antes de salir.
 */

type Estado =
  | { fase: "cargando" }
  | { fase: "consentir"; detalles: AuthorizationDetails }
  | { fase: "enviando"; detalles: AuthorizationDetails }
  | { fase: "error"; mensaje: string };

type AuthorizationDetails = {
  authorization_id: string;
  client: { name?: string | null; uri?: string | null; logo_uri?: string | null };
  redirect_uri?: string | null;
  scope?: string | null;
};

const ERRORES: Record<string, string> = {
  expired: "Esta solicitud ha caducado. Vuelve a conectar Track Gym desde tu asistente.",
  not_found: "Esta solicitud ya no es válida. Vuelve a conectar Track Gym desde tu asistente.",
};

function mensajeDeError(raw: string): string {
  const normalizado = raw.toLowerCase();
  if (normalizado.includes("expired")) return ERRORES.expired;
  if (normalizado.includes("not found") || normalizado.includes("404")) return ERRORES.not_found;
  return "No hemos podido comprobar la solicitud. Inténtalo de nuevo en unos segundos.";
}

export default function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const authorizationId = searchParams.get("authorization_id");
  const { user, loading: cargandoSesion } = useAuth();
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });

  useEffect(() => {
    if (cargandoSesion || !user || !authorizationId) return;

    let cancelado = false;

    void (async () => {
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (cancelado) return;

      if (error || !data) {
        setEstado({ fase: "error", mensaje: mensajeDeError(error?.message ?? "") });
        return;
      }

      // Dos respuestas posibles: o hay que pedir consentimiento, o el usuario ya
      // lo dio antes y solo falta devolverlo al cliente.
      if (!("authorization_id" in data)) {
        window.location.replace((data as { redirect_url: string }).redirect_url);
        return;
      }

      setEstado({ fase: "consentir", detalles: data as AuthorizationDetails });
    })();

    return () => {
      cancelado = true;
    };
  }, [authorizationId, cargandoSesion, user]);

  const decidir = useCallback(
    async (decision: "aprobar" | "denegar") => {
      if (estado.fase !== "consentir") return;
      const detalles = estado.detalles;
      setEstado({ fase: "enviando", detalles });

      const { error } =
        decision === "aprobar"
          ? await supabase.auth.oauth.approveAuthorization(detalles.authorization_id)
          : await supabase.auth.oauth.denyAuthorization(detalles.authorization_id);

      // En navegador ambas redirigen solas al cliente; solo llegamos aquí si
      // algo falló, así que se devuelve el control al usuario.
      if (error) setEstado({ fase: "error", mensaje: mensajeDeError(error.message) });
    },
    [estado],
  );

  if (!authorizationId) {
    return (
      <Mensaje
        titulo="Falta el identificador de autorización"
        texto="Abre esta página desde el asistente que quieres conectar, no directamente."
      />
    );
  }

  // Sin sesión: se guarda el id y se manda al login. `OAuthConsentReturn` trae
  // al usuario de vuelta aquí en cuanto entre, venga por email o por Google.
  if (!cargandoSesion && !user) {
    savePendingConsent(authorizationId);
    return <Navigate to={`/auth?next=${encodeURIComponent(consentPathFor(authorizationId))}`} replace />;
  }

  if (cargandoSesion || estado.fase === "cargando") {
    return (
      <AuthShell className="items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </AuthShell>
    );
  }

  if (estado.fase === "error") {
    return <Mensaje titulo="No se ha podido continuar" texto={estado.mensaje} />;
  }

  const { detalles } = estado;
  const enviando = estado.fase === "enviando";
  const nombreCliente = detalles.client?.name?.trim() || "Una aplicación";
  const destino = hostOf(detalles.redirect_uri) ?? hostOf(detalles.client?.uri);
  const scopes = (detalles.scope ?? "").split(" ").map((s) => s.trim()).filter(Boolean);

  return (
    <AuthShell className="justify-center gap-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* Inicial en vez del logo del cliente: `logo_uri` es una URL arbitraria
            de un cliente registrado dinámicamente. Pintarla violaría el img-src
            de la CSP y avisaría a un tercero de que este usuario está aprobando
            justo ahora. */}
        <div
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-semibold text-primary"
        >
          {nombreCliente.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          ¿Das acceso a {nombreCliente} a tu cuenta?
        </h1>
        <p className="text-sm text-muted-foreground">
          Podrá leer y registrar tus entrenamientos, rutinas y planificación en Track Gym.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4 text-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-muted-foreground">
            Sesión iniciada como{" "}
            <span className="font-medium text-foreground">{user?.email ?? "tu cuenta"}</span>
          </p>
        </div>

        {scopes.length > 0 && (
          <div>
            <p className="mb-1.5 font-medium text-foreground">Permisos solicitados</p>
            <ul className="space-y-1 text-muted-foreground">
              {scopes.map((scope) => (
                <li key={scope}>· {scopeLabel(scope)}</li>
              ))}
            </ul>
          </div>
        )}

        {destino && (
          <p className="text-muted-foreground">
            Al aceptar volverás a <span className="font-medium text-foreground">{destino}</span>.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          onClick={() => void decidir("aprobar")}
          disabled={enviando}
          className={cn(AUTH_CTA_CLASS, "w-full")}
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Permitir acceso"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void decidir("denegar")}
          disabled={enviando}
          className={cn(AUTH_SOFT_BUTTON_CLASS, "w-full")}
        >
          Cancelar
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground/80">
        Puedes retirar el acceso cuando quieras desde Ajustes ·{" "}
        <a href="/privacidad" className={AUTH_LINK_CLASS}>
          Privacidad
        </a>
      </p>
    </AuthShell>
  );
}

function Mensaje({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <AuthShell className="items-center justify-center gap-3 text-center">
      <h1 className="text-lg font-semibold text-foreground">{titulo}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{texto}</p>
    </AuthShell>
  );
}

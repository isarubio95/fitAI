import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Loader2 } from "lucide-react";
import { handleAuthCallbackFromUrl, NATIVE_AUTH_REDIRECT } from "@/lib/authRedirect";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { hash, search, href } = window.location;
      const hasAuthPayload = hash.includes("access_token") || search.includes("code=");

      if (!hasAuthPayload) {
        setError("No se recibieron credenciales de autenticación.");
        return;
      }

      const inMobileBrowser = !Capacitor.isNativePlatform() && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (inMobileBrowser) {
        window.location.replace(`${NATIVE_AUTH_REDIRECT}${search}${hash}`);
        return;
      }

      try {
        await handleAuthCallbackFromUrl(href);
        navigate("/", { replace: true });
      } catch (callbackError) {
        const message = callbackError instanceof Error ? callbackError.message : "Error al iniciar sesión";
        setError(message);
      }
    })();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completando inicio de sesión…</p>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { CONSENT_PATH, consentPathFor, takePendingConsent } from "@/lib/oauthConsent";

/**
 * Devuelve al usuario a la pantalla de consentimiento después de iniciar sesión.
 *
 * Existe porque el login no conserva el destino: con email se queda en `/auth`,
 * que redirige a `/`, y con Google se vuelve a `window.location.origin`. En los
 * dos casos el `authorization_id` se habría perdido y el asistente que esperaba
 * autorización se quedaría colgado sin explicación.
 *
 * Va montado dentro de `<BrowserRouter>` y no junto a `<SplashGate />`, que está
 * fuera del router y por tanto no puede navegar.
 */
export function OAuthConsentReturn() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const yaGestionado = useRef(false);

  useEffect(() => {
    if (loading || !user || yaGestionado.current) return;
    // Si ya estamos en la pantalla de consentimiento no hay nada que hacer, y
    // consumir el pendiente aquí lo borraría antes de tiempo.
    if (location.pathname.startsWith(CONSENT_PATH)) return;

    const pendiente = takePendingConsent();
    if (!pendiente) return;

    yaGestionado.current = true;
    navigate(consentPathFor(pendiente), { replace: true });
  }, [loading, location.pathname, navigate, user]);

  return null;
}

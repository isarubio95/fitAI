import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, KeyRound, Loader2, Mail } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl, signInWithOAuthNative } from "@/lib/nativeAuth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { WelcomeStep } from "@/components/auth/WelcomeStep";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AUTH_CTA_CLASS,
  AUTH_LINK_CLASS,
  AUTH_SOFT_BUTTON_CLASS,
} from "@/lib/authStyles";

function translateAuthError(msg: string, isLogin: boolean): { title: string; description: string } {
  const lower = msg.toLowerCase();
  if (lower.includes("user already registered"))
    return { title: "Cuenta ya registrada", description: "Este correo ya tiene cuenta. Por favor, inicia sesión." };
  if (lower.includes("invalid login credentials"))
    return { title: "Error de inicio de sesión", description: "Email o contraseña incorrectos." };
  if (lower.includes("password should be at least"))
    return { title: "Contraseña muy corta", description: "La contraseña debe tener al menos 6 caracteres." };
  if (lower.includes("email not confirmed"))
    return { title: "Email no confirmado", description: "Revisa tu bandeja de entrada y confirma tu email antes de iniciar sesión." };
  if (lower.includes("email rate limit exceeded") || lower.includes("rate limit"))
    return { title: "Demasiados intentos", description: "Has realizado demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  if (lower.includes("signup is disabled"))
    return { title: "Registro deshabilitado", description: "El registro de nuevos usuarios está deshabilitado temporalmente." };
  return { title: "Error", description: msg };
}

type AuthStep = "welcome" | "login" | "signup";

/** Una vez vista la bienvenida, las siguientes visitas entran directas al login. */
const WELCOME_SEEN_KEY = "trackgym-auth-welcome-seen";

const Auth = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<AuthStep>(() =>
    localStorage.getItem(WELCOME_SEEN_KEY) ? "login" : "welcome",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = step === "login";

  const goToStep = (next: AuthStep) => {
    if (next !== "welcome") localStorage.setItem(WELCOME_SEEN_KEY, "1");
    setConfirmPassword("");
    setAcceptedPrivacy(false);
    setStep(next);
  };

  if (loading) {
    return (
      <AuthShell className="items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </AuthShell>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!acceptedPrivacy) {
          toast({
            title: "Debes aceptar la política de privacidad",
            description: "Lee y acepta la política de privacidad para crear tu cuenta.",
            variant: "destructive",
          });
          return;
        }
        if (password !== confirmPassword) {
          toast({
            title: "Las contraseñas no coinciden",
            description: "Verifica que ambas contraseñas sean iguales.",
            variant: "destructive",
          });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: getAuthRedirectUrl() },
        });
        if (error) throw error;
        toast({
          title: "¡Comprueba tu correo!",
          description: "Si este email no está registrado, te hemos enviado un enlace. Si ya tienes cuenta, por favor inicia sesión.",
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      const translated = translateAuthError(message, isLogin);
      toast({ title: translated.title, description: translated.description, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "welcome") {
    return (
      <AuthShell>
        <WelcomeStep onStart={() => goToStep("signup")} onLogin={() => goToStep("login")} />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="flex flex-1 flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setStep("welcome")}
          className="-ml-2 shrink-0 rounded-full text-muted-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-1 flex-col justify-center py-6">
          <header className="mb-8 text-center">
            <img src="/logo.svg" alt="" aria-hidden="true" className="mx-auto mb-4 h-14 w-14" />
            <h1 className="text-3xl font-bold tracking-tight">
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin ? "Bienvenido de nuevo a Track Gym" : "Empieza a registrar tus entrenos"}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AuthField
              id="email"
              label="Email"
              icon={Mail}
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              required
            />
            <AuthField
              id="password"
              label="Contraseña"
              icon={KeyRound}
              type="password"
              placeholder="Contraseña"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              withToggle
            />
            {!isLogin && (
              <AuthField
                id="confirmPassword"
                label="Repetir contraseña"
                icon={KeyRound}
                type="password"
                placeholder="Repetir contraseña"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={6}
                withToggle
              />
            )}
            {!isLogin && (
              <div className="flex items-start gap-3 px-1 pt-1">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="privacy" className="text-sm leading-snug text-muted-foreground">
                  He leído y acepto la{" "}
                  <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className={AUTH_LINK_CLASS}>
                    Política de Privacidad
                  </Link>
                </label>
              </div>
            )}
            <Button
              type="submit"
              className={`${AUTH_CTA_CLASS} mt-2`}
              disabled={submitting || (!isLogin && !acceptedPrivacy)}
            >
              {submitting ? <Loader2 className="animate-spin" /> : null}
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
              {!submitting && <ArrowRight />}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">o</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className={AUTH_SOFT_BUTTON_CLASS}
            disabled={!isLogin && !acceptedPrivacy}
            onClick={async () => {
              if (!isLogin && !acceptedPrivacy) {
                toast({
                  title: "Debes aceptar la política de privacidad",
                  description: "Lee y acepta la política de privacidad para continuar con Google.",
                  variant: "destructive",
                });
                return;
              }
              const { error } = await signInWithOAuthNative("google");
              if (error) {
                toast({ title: "Error con Google", description: error.message, variant: "destructive" });
              }
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              type="button"
              onClick={() => goToStep(isLogin ? "signup" : "login")}
              className={AUTH_LINK_CLASS}
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </AuthShell>
  );
};

export default Auth;

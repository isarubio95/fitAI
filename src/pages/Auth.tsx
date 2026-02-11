import { useState } from "react";

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
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({
          title: "Cuenta creada",
          description: "Revisa tu email para confirmar tu cuenta.",
        });
      }
    } catch (error: any) {
      const translated = translateAuthError(error.message ?? "", isLogin);
      toast({ title: translated.title, description: translated.description, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">TrackGym</CardTitle>
          <CardDescription>
            {isLogin ? "Inicia sesión para continuar" : "Crea tu cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12"
              />
            </div>
            <Button type="submit" className="h-12 w-full text-base" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

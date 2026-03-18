import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

function normalizeUsername(raw: string) {
  const trimmed = raw.trim().toLowerCase();
  // Normalización simple: reemplaza espacios y grupos de espacios por '_'
  return trimmed.replace(/\s+/g, "_");
}

export default function UsernameSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = useMemo(() => normalizeUsername(username), [username]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validate = () => {
    if (!normalized) return "Introduce un nombre de usuario.";
    if (!USERNAME_REGEX.test(normalized)) {
      return "Usa 3-20 caracteres: letras minúsculas, números y '_' .";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    setIsSaving(true);
    try {
      // Best-effort: evita el mismo username si ya existe.
      const { data: existing } = await supabase
        .from("perfil")
        .select("id")
        .eq("username", normalized)
        .maybeSingle();

      if (existing && (existing as any).id !== user.id) {
        setError("Ese nombre de usuario ya está en uso.");
        setIsSaving(false);
        return;
      }

      const { error: upErr } = await (supabase as any)
        .from("perfil")
        .upsert({ id: user.id, username: normalized }, { onConflict: "id" });

      if (upErr) throw upErr;

      // Refresca el guard para que AppLayout muestre el resto de la app.
      queryClient.invalidateQueries({ queryKey: ["profileSetup", user.id] });
    } catch (err: any) {
      setError(err?.message ?? "Error guardando el nombre de usuario.");
      toast({ title: "Error", description: err?.message ?? "No se pudo guardar el usuario.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Elige tu username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: juan_gym"
                autoComplete="nickname"
                inputMode="text"
                className="h-12"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <p className="text-xs text-muted-foreground">
                Solo será visible en la comunidad. Puedes cambiarlo más adelante si lo permites.
              </p>
            </div>

            <Button type="submit" className="w-full h-12" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


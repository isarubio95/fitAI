import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { deleteAccount } from "@/lib/deleteAccount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const APP_NAME = "Track Gym";
const LAST_UPDATED = "20 de junio de 2026";
const CONFIRM_PHRASE = "ELIMINAR MI CUENTA";

export default function DeleteAccount() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const backHref = user ? "/" : "/auth";
  const backLabel = user ? "Volver al inicio" : "Volver al registro";

  const handleDelete = async () => {
    if (confirmText.trim() !== CONFIRM_PHRASE) return;
    setDeleting(true);
    try {
      await deleteAccount();
      setDeleted(true);
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta y datos asociados han sido eliminados.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar la cuenta.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2 gap-2" asChild>
          <Link to={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Eliminación de cuenta — {APP_NAME}</CardTitle>
            <p className="text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Cómo solicitar la eliminación</h2>
              <p>
                Puedes eliminar tu cuenta de {APP_NAME} de forma permanente desde esta página (si has iniciado
                sesión) o desde <strong className="text-foreground">Ajustes → Eliminar cuenta</strong> dentro de
                la aplicación.
              </p>
              <p>
                Si ya no tienes acceso a tu cuenta, inicia sesión con el mismo correo o proveedor (Google) que
                usaste al registrarte. Si no puedes recuperar el acceso, contacta con el desarrollador a través
                de la ficha de la app en Google Play indicando el correo asociado a tu cuenta.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Qué datos se eliminan</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Cuenta de acceso (correo y credenciales de autenticación).</li>
                <li>Perfil, nombre de usuario, avatar y preferencias.</li>
                <li>Historial de entrenamientos de fuerza, series y rutinas.</li>
                <li>Sesiones de cardio, rutas GPS y rutinas de cardio.</li>
                <li>Medidas corporales, registros de salud, logros, seguidores y actividad en comunidad.</li>
                <li>Ejercicios personalizados.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Qué datos pueden conservarse</h2>
              <p>
                Podemos conservar registros mínimos durante el tiempo estrictamente necesario para cumplir
                obligaciones legales, resolver disputas o prevenir fraudes (por ejemplo, registros de facturación
                o copias de seguridad cifradas). Estos datos se eliminan o anonimizan cuando ya no son necesarios.
              </p>
              <p>
                Los datos agregados y anonimizados que no permiten identificarte pueden conservarse con fines
                estadísticos.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Plazo de procesamiento</h2>
              <p>
                La eliminación desde la app es <strong className="text-foreground">inmediata</strong>. Las
                solicitudes por correo se procesan en un plazo máximo de <strong className="text-foreground">30 días</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Advertencia</h2>
              <p>
                Esta acción es <strong className="text-foreground">irreversible</strong>. Perderás el acceso a
                tu cuenta y a todos los datos asociados. Si tienes una suscripción activa en el futuro, cancélala
                antes de eliminar la cuenta desde la tienda correspondiente.
              </p>
            </section>

            {!loading && user ? (
              <section className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <h2 className="text-base font-semibold text-foreground">Eliminar mi cuenta ahora</h2>
                <p>
                  Sesión iniciada como{" "}
                  <strong className="text-foreground">{user.email ?? "usuario autenticado"}</strong>.
                </p>
                <p>
                  Escribe <strong className="text-foreground">{CONFIRM_PHRASE}</strong> para confirmar:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_PHRASE}
                  autoComplete="off"
                  className="h-12"
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="h-12 w-full gap-2"
                      disabled={confirmText.trim() !== CONFIRM_PHRASE || deleting}
                    >
                      {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Eliminar cuenta permanentemente
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se borrarán tu cuenta y todos tus datos en {APP_NAME}. Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => {
                          e.preventDefault();
                          void handleDelete();
                        }}
                      >
                        Sí, eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </section>
            ) : !loading ? (
              <section className="space-y-3 rounded-lg border border-border p-4">
                <h2 className="text-base font-semibold text-foreground">Inicia sesión para continuar</h2>
                <p>Para eliminar tu cuenta desde la web, primero debes iniciar sesión.</p>
                <Button className="h-12 w-full" asChild>
                  <Link to="/auth">Ir a iniciar sesión</Link>
                </Button>
              </section>
            ) : (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            <p className="text-xs">
              Consulta también nuestra{" "}
              <Link to="/privacidad" className="text-primary underline underline-offset-2">
                Política de Privacidad
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

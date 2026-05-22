import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Home, BarChart3, LogOut, ClipboardList, Plus, Activity, Scale, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileDrawerTrigger } from "./ProfileDrawer";
import { SettingsDrawer } from "./SettingsDrawer";
import { InAppNotificationsBell } from "@/components/notifications/InAppNotificationsBell";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useStartCardioLiveSession, useCardioDisciplinas } from "@/hooks/useCardioSessions";
import { useToast } from "@/hooks/use-toast";
import { CardioTypePickerDialog } from "@/components/cardio/CardioTypePickerDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { to: "/community", icon: Users, label: "Comunidad" },
  { to: "/evolution", icon: BarChart3, label: "Evolución" },
];

export function DesktopSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { openNew } = useGlobalWorkoutDrawer();
  const { openNewWithDiscipline, openLiveRecording } = useGlobalCardioDrawer();
  const startCardioLive = useStartCardioLiveSession();
  const { data: cardioDisciplinas } = useCardioDisciplinas();
  const { toast } = useToast();
  const [cardioTypeDialogOpen, setCardioTypeDialogOpen] = useState(false);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl h-dvh sticky top-0">
      <div className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="FitAI" className="h-8 w-8 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-muted-foreground">FitAI</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-3 mb-3 text-base" size="sm">
              <Plus className="h-5 w-5" />
              Crear Nuevo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 text-base">
            <DropdownMenuItem className="text-base" onClick={() => openNew()}>
              <Activity className="h-5 w-5 mr-2 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium">Entreno de Gimnasio</p>
                <p className="text-xs text-muted-foreground">Registra una sesión de gym</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" onClick={() => setCardioTypeDialogOpen(true)}>
              <Activity className="h-5 w-5 mr-2 shrink-0 text-blue-500" />
              <div className="min-w-0">
                <p className="font-medium">Entreno de Cardio</p>
                <p className="text-xs text-muted-foreground">Registra carrera, bici, cinta, etc.</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" onClick={() => navigate("/evolution", { state: { tab: "measurements", action: "new" } })}>
              <Scale className="h-5 w-5 mr-2 shrink-0 text-emerald-500" />
              <div className="min-w-0">
                <p className="font-medium">Medida</p>
                <p className="text-xs text-muted-foreground">Registra peso, cintura, etc.</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CardioTypePickerDialog
          open={cardioTypeDialogOpen}
          onOpenChange={setCardioTypeDialogOpen}
          isConfirmPending={startCardioLive.isPending}
          onConfirm={async (disciplineId) => {
            const d = cardioDisciplinas?.find((x) => x.id === disciplineId);
            const titulo = `${(d?.nombre ?? "Cardio").trim()} · ${format(new Date(), "d MMM HH:mm", { locale: es })}`;
            try {
              const id = await startCardioLive.mutateAsync({
                cardio_disciplina_id: disciplineId,
                titulo,
              });
              openLiveRecording(id);
              setCardioTypeDialogOpen(false);
            } catch (e: unknown) {
              const msg =
                e && typeof e === "object" && "message" in e && typeof (e as { message: string }).message === "string"
                  ? (e as { message: string }).message
                  : e instanceof Error
                    ? e.message
                    : "Inténtalo de nuevo.";
              toast({ title: "No se pudo iniciar la sesión", description: msg, variant: "destructive" });
            }
          }}
          onConfirmManual={(disciplineId) => {
            openNewWithDiscipline(disciplineId);
            setCardioTypeDialogOpen(false);
          }}
        />

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary/20 text-primary dark:bg-primary/10"
                  : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto shrink-0 border-t border-border px-4 pb-4 pt-4">
        <div className="flex flex-wrap items-center justify-end gap-0.5 pb-3">
          <div id="sidebar-header-actions-slot" className="flex items-center gap-0.5" />
          <InAppNotificationsBell />
          <SettingsDrawer />
          <ProfileDrawerTrigger />
        </div>
        <div className="flex justify-end border-t border-border pt-3">
          <Button
            variant="ghost"
            className="gap-3 text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </aside>
  );
}


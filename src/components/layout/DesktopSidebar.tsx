import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
<<<<<<< HEAD
import { Home, Dumbbell, BarChart3, ClipboardList, Plus, Activity, Scale, FileUp, Sparkles, Users } from "lucide-react";
=======
import { Home, BarChart3, LogOut, ClipboardList, Plus, Activity, Scale, Users } from "lucide-react";
>>>>>>> 1b4d1fa1922781bf04e1d603f02a0d7efad6e70c
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
  const { openNew } = useGlobalWorkoutDrawer();
  const { openNewWithDiscipline, openLiveRecording } = useGlobalCardioDrawer();
  const startCardioLive = useStartCardioLiveSession();
  const { data: cardioDisciplinas } = useCardioDisciplinas();
  const { toast } = useToast();
  const [cardioTypeDialogOpen, setCardioTypeDialogOpen] = useState(false);

  return (
<<<<<<< HEAD
    <aside className="hidden md:fixed md:left-0 md:top-14 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-border bg-background md:h-[calc(100dvh-3.5rem)] md:overflow-y-auto">
      <div className="flex min-h-0 flex-1 flex-col justify-center p-4">
      <nav className="space-y-1">
=======
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl h-dvh sticky top-0">
      <div className="flex h-[calc(4rem+1px)] shrink-0 items-center gap-2 border-b border-border px-6">
        <img src="/logo.svg" alt="FitAI" className="h-9 w-9 rounded-lg shrink-0" />
        <span className="text-lg font-bold flex-1 min-w-0 truncate">FitAI</span>
        <ProfileDrawerTrigger />
      </div>
      <nav className="flex-1 space-y-1 p-4">
>>>>>>> 1b4d1fa1922781bf04e1d603f02a0d7efad6e70c
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
      </div>
    </aside>
  );
}


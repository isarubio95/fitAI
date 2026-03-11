import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useProfileStats, xpProgress } from "@/hooks/useGamification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LogOut, Mail, SunMoon, Shield, Flame, Zap, Trophy, Swords, Target, Award } from "lucide-react";

const MOCK_ACHIEVEMENTS = [
  { id: "first-blood", nombre: "Primera Sangre", descripcion: "Termina tu primer entrenamiento", icono: "Swords", xp: 50, unlocked: false },
  { id: "warrior", nombre: "Guerrero", descripcion: "Completa 10 entrenamientos", icono: "Shield", xp: 200, unlocked: false },
  { id: "fire-streak", nombre: "En Llamas", descripcion: "Racha de 7 días", icono: "Flame", xp: 300, unlocked: false },
  { id: "sharpshooter", nombre: "Francotirador", descripcion: "Completa 50 series en un día", icono: "Target", xp: 150, unlocked: false },
];

const iconMap: Record<string, React.ElementType> = {
  Swords, Shield, Flame, Target, Trophy, Award,
};

export function ProfileDrawer() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: stats } = useProfileStats();
  const [open, setOpen] = useState(false);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined);

  const xp = stats ? xpProgress(stats.xp_total) : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[340px] flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg">Mi cuenta</SheetTitle>
        </SheetHeader>

        {/* User info */}
        <div className="flex items-center gap-3 py-4">
          <Avatar className="h-12 w-12">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> Cuenta personal
            </p>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="atleta" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-2 mt-3">
            <TabsTrigger value="atleta">Atleta</TabsTrigger>
            <TabsTrigger value="logros">Logros</TabsTrigger>
          </TabsList>

          <TabsContent value="atleta" className="flex-1 overflow-y-auto space-y-4 mt-3">
            {/* Level & XP */}
            {xp && stats && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-bold">Nivel {xp.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame
                      className={`h-4 w-4 ${stats.racha_actual > 0 ? "text-orange-500" : "text-muted-foreground"}`}
                      fill={stats.racha_actual > 0 ? "currentColor" : "none"}
                    />
                    <span className={`text-sm font-semibold ${stats.racha_actual > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                      {stats.racha_actual} días
                    </span>
                  </div>
                </div>
                <Progress value={xp.percent} className="h-2" />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {xp.progress} / {xp.needed} XP para nivel {xp.level + 1}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>XP Total: <span className="font-semibold text-foreground">{stats.xp_total}</span></div>
                  <div>Racha máx: <span className="font-semibold text-foreground">{stats.racha_maxima} días</span></div>
                </div>
              </div>
            )}

            {/* Theme */}
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <SunMoon className="h-4 w-4 text-muted-foreground" /> Apariencia
              </p>
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200] bg-popover">
                  <SelectItem value="system">Automático (Sistema)</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="logros" className="flex-1 overflow-y-auto mt-3">
            <div className="grid grid-cols-2 gap-3">
              {MOCK_ACHIEVEMENTS.map((a) => {
                const Icon = iconMap[a.icono] || Trophy;
                return (
                  <div
                    key={a.id}
                    className={`flex flex-col items-center text-center gap-2 p-3 rounded-lg border transition-opacity ${
                      a.unlocked ? "" : "opacity-50 grayscale"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${a.unlocked ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-6 w-6 ${a.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <p className="text-xs font-semibold leading-tight">{a.nombre}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{a.descripcion}</p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Zap className="h-2.5 w-2.5" /> {a.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Logout */}
        <div className="pb-4 pt-2">
          <Button
            variant="destructive"
            className="w-full h-12"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

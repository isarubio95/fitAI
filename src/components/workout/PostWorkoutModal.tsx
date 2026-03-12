import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Zap, Dumbbell, ArrowUp, CheckCircle2, Flame } from "lucide-react";
import type { XPBreakdown } from "@/hooks/useGamification";

interface PostWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  breakdown: XPBreakdown | null;
}

export function PostWorkoutModal({ open, onClose, breakdown }: PostWorkoutModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open && breakdown) {
      const duration = breakdown.leveledUp ? 3000 : 1500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: breakdown.leveledUp ? 8 : 3,
          angle: 60 + Math.random() * 60,
          spread: 55,
          origin: { x: Math.random(), y: 0.6 },
          colors: ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [open, breakdown]);

  if (!breakdown) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm text-center">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-extrabold">
            🎉 ¡Entrenamiento Completado!
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between text-sm px-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Base
            </span>
            <span className="font-semibold">+{breakdown.base} XP</span>
          </div>
          <div className="flex items-center justify-between text-sm px-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Dumbbell className="h-4 w-4 text-primary" />
              Volumen
            </span>
            <span className="font-semibold">+{breakdown.series} XP</span>
          </div>
          {breakdown.streakBonus > 0 && (
            <div className="flex items-center justify-between text-sm px-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4 text-orange-500" />
                Racha (+{breakdown.newStreak} días)
              </span>
              <span className="font-semibold text-orange-500">+{breakdown.streakBonus} XP</span>
            </div>
          )}
          <div className="border-t pt-3 flex items-center justify-between px-2">
            <span className="flex items-center gap-2 font-bold">
              <Zap className="h-5 w-5 text-amber-500" />
              Total
            </span>
            <span className="text-xl font-extrabold text-primary">+{breakdown.total} XP</span>
          </div>

          {breakdown.leveledUp && (
            <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center gap-2 text-primary font-bold">
                <ArrowUp className="h-5 w-5" />
                ¡Nivel {breakdown.newLevel}!
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction
            onClick={() => {
              onClose();
              navigate("/");
            }}
            className="w-full"
          >
            Ir al Dashboard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

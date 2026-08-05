import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";
import { cn } from "@/lib/utils";

interface MuscleDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: MainMuscleGroup | null;
  specificVolume: Record<string, number>;
}

export function MuscleDetailSheet({ open, onOpenChange, group, specificVolume }: MuscleDetailSheetProps) {
  if (!group) return null;

  const muscles = MUSCLE_GROUPS[group];
  const maxSets = Math.max(1, ...muscles.map((m) => specificVolume[m] || 0));

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="bottom"
        className="h-auto max-h-[min(55dvh,26rem)] overflow-hidden p-0"
      >
        <div className="flex flex-col">
          <DrawerHeader className="shrink-0 border-b border-border bg-card px-6 text-left">
            <DrawerTitle className="text-lg">{group}</DrawerTitle>
            <DrawerDescription>Desglose de series por músculo específico</DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto bg-background">
            <div className={cn("flex flex-col gap-1 bg-background", drawerSafeAreaBottom)}>
              <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
                <CardContent className="space-y-4 px-6 py-4">
                  {muscles.map((muscle) => {
                    const sets = specificVolume[muscle] || 0;
                    const pct = (sets / maxSets) * 100;
                    return (
                      <div key={muscle} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{muscle}</span>
                          <span className="text-muted-foreground tabular-nums">{sets} series</span>
                        </div>
                        <Progress value={pct} className="h-2.5" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

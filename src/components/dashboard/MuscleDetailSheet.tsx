import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";

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
      <DrawerContent side="bottom" className="rounded-t-[20px] h-auto max-h-[60dvh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle>{group}</DrawerTitle>
          <DrawerDescription>Desglose de series por músculo específico</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 pb-6">
          {muscles.map((muscle) => {
            const sets = specificVolume[muscle] || 0;
            const pct = (sets / maxSets) * 100;
            return (
              <div key={muscle} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{muscle}</span>
                  <span className="text-muted-foreground">{sets} series</span>
                </div>
                <Progress value={pct} className="h-2.5" />
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

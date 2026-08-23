import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { GymDirectoryExplorer, gymDirectoryPageHeightClass } from "@/components/gym/GymDirectoryExplorer";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProfileDrawerTrigger } from "@/components/layout/ProfileDrawer";
import { SettingsDrawer } from "@/components/layout/SettingsDrawer";
import { InAppNotificationsBell } from "@/components/notifications/InAppNotificationsBell";
import { topBarSurface } from "@/lib/surface-styles";
import { cn } from "@/lib/utils";
import type { SelectedGimnasio } from "@/types/gimnasio";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (gym: SelectedGimnasio) => void;
  overlayClassName?: string;
  contentClassName?: string;
};

export function GymDirectoryDrawer({
  open,
  onOpenChange,
  onPick,
  overlayClassName,
  contentClassName,
}: Props) {
  const close = () => onOpenChange(false);

  if (!open) return null;

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
      handleOnly
      shouldScaleBackground={false}
    >
      <DrawerContent
        side="right"
        overlayClassName={overlayClassName ?? "z-[80]"}
        className={cn(
          "inset-0 h-lvh w-full max-w-none flex-col border-0 bg-background p-0",
          contentClassName ?? "z-[85]",
        )}
      >
        <DrawerTitle className="sr-only">Gimnasios</DrawerTitle>
        {open ? (
          <div className="relative flex h-lvh min-h-0 flex-col bg-background">
            <header
              className={cn(
                "fixed inset-x-0 top-0 z-40 flex w-full flex-col border-b border-border/50 px-4 pb-2 pt-[calc(0.5rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] md:hidden",
                topBarSurface,
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h1 className="truncate text-lg font-semibold md:text-xl">Gimnasios</h1>
                <div className="flex shrink-0 items-center justify-end gap-1 max-md:gap-2">
                  <InAppNotificationsBell />
                  <SettingsDrawer />
                  <ProfileDrawerTrigger />
                </div>
              </div>
            </header>

            <main
              className={cn(
                // Evitamos dejar espacio en blanco al final del Drawer:
                // el BottomNav se superpone, y el mapa debe rellenar hasta abajo.
                "flex min-h-0 w-full flex-1 flex-col pb-0 md:pb-0",
                "max-md:pt-[var(--app-header-height,5rem)]",
                "md:pt-12",
              )}
            >
              <div className={gymDirectoryPageHeightClass}>
                <GymDirectoryExplorer
                  onGymAction={(gym) => {
                    onPick(gym);
                    close();
                  }}
                />
              </div>
            </main>

            <BottomNav skipInsetSync locationOverride="/gimnasios" onNavigate={close} />
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

import { useMemo, useState } from "react";
import { Check, MapPin, Plus, Search, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
  drawerSheetRadiusTop,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GymAddSheet } from "@/components/gym/GymAddSheet";
import { GymDirectoryDrawer } from "@/components/gym/GymDirectoryDrawer";
import { useGimnasiosCatalog, useDefaultGimnasio, useLastGimnasio } from "@/hooks/useGimnasios";
import { useBrowserLocation } from "@/hooks/useBrowserLocation";
import { formatGymDistance, formatGimnasioListTitle, duplicateGymNames, rankGimnasios } from "@/lib/gimnasioSearch";
import type { GimnasioCatalogItem, SelectedGimnasio } from "@/types/gimnasio";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: SelectedGimnasio | null;
  onSelect: (gym: SelectedGimnasio | null) => void;
  overlayClassName?: string;
  contentClassName?: string;
  nestedOverlayClassName?: string;
  nestedContentClassName?: string;
};

export function GymPickerSheet({
  open,
  onOpenChange,
  selected,
  onSelect,
  overlayClassName,
  contentClassName,
  nestedOverlayClassName,
  nestedContentClassName,
}: Props) {
  const { data: gyms = [], isLoading } = useGimnasiosCatalog();
  const { data: defaultGym } = useDefaultGimnasio();
  const { data: lastGym } = useLastGimnasio();
  const { point: origin, request: requestLocation } = useBrowserLocation(open);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const duplicateNames = useMemo(() => duplicateGymNames(gyms), [gyms]);

  const pinnedId = defaultGym?.id ?? lastGym?.id ?? null;

  const ranked = useMemo(
    () =>
      rankGimnasios(gyms, {
        query,
        origin,
        recentId: pinnedId,
        limit: 50,
      }),
    [gyms, query, origin, pinnedId],
  );

  const handleSelect = (gym: GimnasioCatalogItem) => {
    onSelect({
      id: gym.id,
      nombre: formatGimnasioListTitle(gym, duplicateNames),
      ciudad: gym.ciudad,
    });
    onOpenChange(false);
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next) setQuery("");
          onOpenChange(next);
        }}
      >
        <DrawerContent
          overlayClassName={overlayClassName}
          className={cn("flex max-h-[92lvh] flex-col overflow-hidden", contentClassName)}
        >
          <div className={cn("shrink-0 border-b border-border/20 bg-card", drawerSheetRadiusTop)}>
            <DrawerHeader className="text-left">
              <DrawerTitle>Gimnasio</DrawerTitle>
              <DrawerDescription>
                Elige dónde entrenas. España · OSM y datos municipales
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => requestLocation()}
                  placeholder="Buscar por nombre o ciudad"
                  className="h-12 pl-9"
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-1">
            {isLoading ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : ranked.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay resultados. Añade el gimnasio si no aparece.
              </p>
            ) : (
              <ul className="space-y-1">
                {ranked.map((gym) => {
                  const isSelected = selected?.id === gym.id;
                  const isDefault = defaultGym?.id === gym.id && !isSelected;
                  const isRecent =
                    lastGym?.id === gym.id && lastGym?.id !== defaultGym?.id && !isSelected;
                  const pinLabel = isDefault ? "Por defecto" : isRecent ? "Último" : null;
                  return (
                    <li key={gym.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(gym)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-secondary/70",
                        )}
                      >
                        <MapPin
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {formatGimnasioListTitle(gym, duplicateNames)}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {[gym.ciudad, formatGymDistance(gym.distanceKm), pinLabel]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        {isSelected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <DrawerFooter className={cn("gap-2 border-t border-border/20 bg-card pt-3", drawerSafeAreaBottom)}>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMapOpen(true)}
              >
                <MapPin className="h-4 w-4" />
                Ver mapa
              </Button>
            </div>
            {selected ? (
              <Button
                variant="ghost"
                onClick={() => {
                  onSelect(null);
                  onOpenChange(false);
                }}
              >
                <X className="h-4 w-4" />
                Quitar gimnasio
              </Button>
            ) : null}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <GymAddSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(gym) => handleSelect(gym)}
        overlayClassName={nestedOverlayClassName}
        contentClassName={nestedContentClassName}
      />
      <GymDirectoryDrawer
        open={mapOpen}
        onOpenChange={setMapOpen}
        onPick={(gym) => {
          onSelect(gym);
          setMapOpen(false);
          onOpenChange(false);
          setQuery("");
        }}
        overlayClassName={nestedOverlayClassName}
        contentClassName={nestedContentClassName}
      />
    </>
  );
}

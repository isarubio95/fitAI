import { useMemo, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { GymDirectoryMap } from "@/components/gym/GymDirectoryMap";
import { GymAddSheet } from "@/components/gym/GymAddSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGimnasiosCatalog } from "@/hooks/useGimnasios";
import { useBrowserLocation } from "@/hooks/useBrowserLocation";
import { formatGymDistance, formatGimnasioListTitle, duplicateGymNames, rankGimnasios } from "@/lib/gimnasioSearch";
import type { GimnasioCatalogItem, SelectedGimnasio } from "@/types/gimnasio";

export const gymDirectoryPageHeightClass =
  "h-[calc(100dvh-var(--app-header-height,5rem)-var(--app-bottom-nav-inset,5.5rem))] min-h-0 overflow-hidden md:h-[calc(100dvh-3rem)]";

type Props = {
  actionLabel?: string;
  onGymAction: (gym: SelectedGimnasio) => void;
  elevatedLayers?: boolean;
};

export function GymDirectoryExplorer({
  actionLabel = "Entrenar aquí",
  onGymAction,
  elevatedLayers = false,
}: Props) {
  const { data: gyms = [], isLoading } = useGimnasiosCatalog();
  const { point: origin } = useBrowserLocation(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GimnasioCatalogItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const duplicateNames = useMemo(() => duplicateGymNames(gyms), [gyms]);

  const suggestions = useMemo(
    () =>
      query.trim()
        ? rankGimnasios(gyms, { query, origin, limit: 8 })
        : [],
    [gyms, query, origin],
  );

  const handleAction = () => {
    if (!selected) return;
    onGymAction({
      id: selected.id,
      nombre: formatGimnasioListTitle(selected, duplicateNames),
      ciudad: selected.ciudad,
    });
  };

  return (
    <div data-vaul-no-drag className="relative h-full min-h-0 flex-1">
      <GymDirectoryMap
        gyms={gyms}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        className="absolute inset-0"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-3 md:px-4 md:pt-4">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar gimnasio o ciudad"
              className="h-12 border-border/60 bg-card/95 pl-9 shadow-md backdrop-blur-sm"
            />
          </div>
          <Button variant="secondary" className="h-12 shrink-0 shadow-md" onClick={() => setAddOpen(true)}>
            Añadir
          </Button>
        </div>
        {suggestions.length > 0 ? (
          <ul className="pointer-events-auto mx-auto mt-2 max-w-lg overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-md backdrop-blur-sm">
            {suggestions.map((gym) => (
              <li key={gym.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-secondary/80"
                  onClick={() => {
                    setSelected(gym);
                    setQuery("");
                  }}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {formatGimnasioListTitle(gym, duplicateNames)}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[gym.ciudad, formatGymDistance(gym.distanceKm)].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {isLoading ? (
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {selected ? (
        <div
          className="pointer-events-none absolute inset-x-0 z-20 px-3 pr-16 md:px-4"
          style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="pointer-events-auto mx-auto max-w-lg rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur-sm">
            <p className="text-sm font-semibold leading-snug">
              {formatGimnasioListTitle(selected, duplicateNames)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {[selected.ciudad, selected.direccion].filter(Boolean).join(" · ") || "España"}
            </p>
            <div className="mt-3 flex gap-2">
              <Button className="flex-1" onClick={handleAction}>
                {actionLabel}
              </Button>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <GymAddSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(gym) => setSelected(gym)}
        overlayClassName={elevatedLayers ? "z-[90]" : undefined}
        contentClassName={elevatedLayers ? "z-[95]" : undefined}
      />
    </div>
  );
}

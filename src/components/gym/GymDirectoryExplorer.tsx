import { lazy, Suspense, useMemo, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GIMNASIO_MAP_LIMIT, useGimnasiosSearch } from "@/hooks/useGimnasios";
import { useBrowserLocation } from "@/hooks/useBrowserLocation";
import {
  formatGymDistance,
  formatGimnasioListTitle,
  duplicateGymNames,
  duplicateGymNamesInCity,
  type GymMapViewport,
} from "@/lib/gimnasioSearch";
import type { GimnasioCatalogItem, SelectedGimnasio } from "@/types/gimnasio";
import { cn } from "@/lib/utils";

const GymDirectoryMap = lazy(() =>
  import("@/components/gym/GymDirectoryMap").then((m) => ({ default: m.GymDirectoryMap })),
);

export const gymDirectoryPageHeightClass =
  // Usamos flex-1 para que el mapa rellene el alto real del contenedor del Drawer.
  // Evita huecos al final cuando cambian alturas del header/bottom nav según viewport.
  "relative flex-1 min-h-0 overflow-hidden";

type Props = {
  actionLabel?: string;
  onGymAction: (gym: SelectedGimnasio) => void;
};

export function GymDirectoryExplorer({
  actionLabel = "Entrenar aquí",
  onGymAction,
}: Props) {
  const { point: origin } = useBrowserLocation(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GimnasioCatalogItem | null>(null);
  const [viewport, setViewport] = useState<GymMapViewport | null>(null);

  const mapQuery = useGimnasiosSearch({
    origin: viewport?.center ?? origin,
    bbox: viewport,
    limit: GIMNASIO_MAP_LIMIT,
    enabled: !!viewport,
    debounceMs: 0,
  });

  const suggestionsQuery = useGimnasiosSearch({
    query,
    origin,
    limit: 8,
    enabled: query.trim().length > 0,
  });

  const gyms = useMemo(() => {
    const list = mapQuery.data ?? [];
    if (selected && !list.some((gym) => gym.id === selected.id)) {
      return [selected, ...list];
    }
    return list;
  }, [mapQuery.data, selected]);

  const suggestions = query.trim() ? (suggestionsQuery.data ?? []) : [];

  const duplicateNames = useMemo(
    () => duplicateGymNames([...gyms, ...suggestions]),
    [gyms, suggestions],
  );
  const sameCityDuplicates = useMemo(
    () => duplicateGymNamesInCity([...gyms, ...suggestions]),
    [gyms, suggestions],
  );

  const handleAction = () => {
    if (!selected) return;
    onGymAction({
      id: selected.id,
      nombre: formatGimnasioListTitle(selected, duplicateNames, sameCityDuplicates),
      ciudad: selected.ciudad,
    });
  };

  return (
    <div data-vaul-no-drag className="relative h-full min-h-0 w-full">
      <Suspense fallback={<div className="map-route-skeleton absolute inset-0" aria-hidden />}>
        <GymDirectoryMap
          gyms={gyms}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          onDeselect={() => setSelected(null)}
          onBoundsChange={setViewport}
          className="absolute inset-0"
        />
      </Suspense>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-3 pt-3 md:px-4 md:pt-4">
        <div className="pointer-events-auto mx-auto max-w-lg">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o ciudad"
              className="h-12 pl-9"
            />
          </div>
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
                      {formatGimnasioListTitle(gym, duplicateNames, sameCityDuplicates)}
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

      {mapQuery.isLoading && gyms.length === 0 ? (
        <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {selected ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 z-20 px-3 pr-16 md:bottom-3 md:px-4",
            "max-md:bottom-[calc(var(--app-bottom-nav-inset,env(safe-area-inset-bottom,0px))+0.75rem)]",
          )}
        >
          <div className="pointer-events-auto mx-auto max-w-lg rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur-sm">
            <p className="text-sm font-semibold leading-snug">
              {formatGimnasioListTitle(selected, duplicateNames, sameCityDuplicates)}
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
    </div>
  );
}

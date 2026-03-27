import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExerciseCatalogInfinite } from "@/hooks/useExerciseCatalog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Search, User } from "lucide-react";

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (
    catalogRef: { tipo_ejercicio_id?: string; usuario_ejercicio_id?: string },
    nombre: string
  ) => void;
}

export function ExerciseSelector({ open, onOpenChange, onSelect }: ExerciseSelectorProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExerciseCatalogInfinite(
    {
      q: search,
    },
    30,
  );

  const catalog = useMemo(() => {
    const pages = data?.pages ?? [];
    const usuario = pages[0]?.usuario ?? [];
    const catalogo = pages.flatMap((p) => p.catalogo ?? []);
    return [...usuario, ...catalogo];
  }, [data]);

  const filtered = useMemo(
    () => catalog.filter((tipo) => !onlyMine || (tipo as any).usuario_id === user?.id),
    [catalog, onlyMine, user?.id],
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full h-12">
          <Search className="h-4 w-4 mr-2" /> Agregar Ejercicio
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 max-h-[70svh] overflow-hidden" align="start">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <Label className="text-xs text-muted-foreground">Solo mis ejercicios</Label>
          <Switch checked={onlyMine} onCheckedChange={setOnlyMine} />
        </div>
        <Command>
          <CommandInput
            placeholder="Buscar ejercicio..."
            value={search}
            onValueChange={setSearch}
          />
          <div
            className="max-h-[60svh] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
            onScroll={(e) => {
              const el = e.currentTarget;
              const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
              if (nearBottom && hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
          >
            <CommandList className="max-h-none overflow-visible">
              <CommandEmpty>No se encontraron ejercicios.</CommandEmpty>
              <CommandGroup>
                {isLoading && (
                  <CommandItem value="_loading" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando ejercicios...
                  </CommandItem>
                )}
                {filtered?.map((tipo) => {
                  const isOwn = (tipo as any).usuario_id === user?.id;
                  const source = (tipo as any).__source as "usuario" | "catalogo" | undefined;
                  const catalogRef =
                    source === "usuario"
                      ? { usuario_ejercicio_id: tipo.id }
                      : { tipo_ejercicio_id: tipo.id };
                  return (
                    <CommandItem
                      key={tipo.id}
                      value={tipo.nombre}
                      onSelect={() => onSelect(catalogRef, tipo.nombre)}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <span>{tipo.nombre}</span>
                      {isOwn && <User className="h-3.5 w-3.5 text-muted-foreground ml-2 shrink-0" />}
                    </CommandItem>
                  );
                })}
                {!isLoading && isFetchingNextPage && (
                  <CommandItem value="_loading_more" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando más...
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";

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
  const { data: catalog } = useExerciseCatalog();
  const [onlyMine, setOnlyMine] = useState(false);

  const filtered = catalog?.filter((tipo) => !onlyMine || (tipo as any).usuario_id === user?.id);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full h-12">
          <Search className="h-4 w-4 mr-2" /> Agregar Ejercicio
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 max-h-[70vh] overflow-auto" align="start">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <Label className="text-xs text-muted-foreground">Solo mis ejercicios</Label>
          <Switch checked={onlyMine} onCheckedChange={setOnlyMine} />
        </div>
        <Command>
          <CommandInput placeholder="Buscar ejercicio..." />
          <CommandList
            className="max-h-[60vh] overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
            onWheelCapture={(e) => e.stopPropagation()}
          >
            <CommandEmpty>No se encontraron ejercicios.</CommandEmpty>
            <CommandGroup>
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
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

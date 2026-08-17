import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GymPinMap } from "@/components/gym/GymPinMap";
import { useCreateGimnasio } from "@/hooks/useGimnasios";
import { useToast } from "@/hooks/use-toast";
import type { GeoPoint } from "@/lib/gimnasioSearch";
import type { GimnasioCatalogItem } from "@/types/gimnasio";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (gym: GimnasioCatalogItem) => void;
  overlayClassName?: string;
  contentClassName?: string;
};

export function GymAddSheet({
  open,
  onOpenChange,
  onCreated,
  overlayClassName,
  contentClassName,
}: Props) {
  const { toast } = useToast();
  const createGym = useCreateGimnasio();
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pin, setPin] = useState<GeoPoint | null>(null);

  const reset = () => {
    setNombre("");
    setCiudad("");
    setPin(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSave = async () => {
    const trimmed = nombre.trim();
    if (!trimmed) {
      toast({ title: "Pon un nombre", variant: "destructive" });
      return;
    }
    if (!pin) {
      toast({ title: "Marca el gimnasio en el mapa", variant: "destructive" });
      return;
    }
    try {
      const created = await createGym.mutateAsync({
        nombre: trimmed,
        lat: pin.lat,
        lng: pin.lng,
        ciudad: ciudad.trim() || null,
      });
      onCreated(created);
      handleOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: "No se pudo añadir",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        overlayClassName={overlayClassName}
        className={cn("flex max-h-[92lvh] flex-col", contentClassName)}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>Añadir gimnasio</DrawerTitle>
          <DrawerDescription>
            Si no aparece en el listado, colócalo en el mapa. Otros usuarios también podrán verlo.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4">
          <div className="space-y-1.5">
            <Label htmlFor="gym-add-nombre">Nombre</Label>
            <Input
              id="gym-add-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Basic-Fit Gran Vía"
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gym-add-ciudad">Ciudad (opcional)</Label>
            <Input
              id="gym-add-ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej: Madrid"
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Ubicación</Label>
            {open ? <GymPinMap value={pin} onChange={setPin} className="h-56 w-full" /> : null}
            <p className="text-[11px] text-muted-foreground">Toca el mapa o arrastra el pin.</p>
          </div>
        </div>
        <DrawerFooter className={cn("pt-2", drawerSafeAreaBottom)}>
          <Button onClick={() => void handleSave()} disabled={createGym.isPending}>
            {createGym.isPending ? "Guardando…" : "Guardar gimnasio"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

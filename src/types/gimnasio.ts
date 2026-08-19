import type { Tables } from "@/integrations/supabase/types";

export type Gimnasio = Tables<"gimnasio">;

export type GimnasioCatalogItem = Pick<
  Gimnasio,
  "id" | "nombre" | "lat" | "lng" | "direccion" | "ciudad" | "brand" | "source" | "tipo"
>;

export type SelectedGimnasio = {
  id: string;
  nombre: string;
  ciudad?: string | null;
};

export function toSelectedGimnasio(
  gym: Pick<GimnasioCatalogItem, "id" | "nombre" | "ciudad">,
): SelectedGimnasio {
  return { id: gym.id, nombre: gym.nombre, ciudad: gym.ciudad };
}
